import path from "path"
import type * as ESTree from "estree"
import type { Rule } from "eslint"
import type { RuleListener } from "../types"
import {
    findExpression,
    isStaticTemplateLiteral,
    getStaticValue,
    getParent,
} from "./ast-utils"
import { toRegExp } from "./regexp"
import { extractCallReferences } from "./extract-calls-references"

type CSSHelperContext = {
    isFixable<T extends ESTree.Node>(targetNode?: T | null): targetNode is T
}
type CSSBaseContext = {
    scope: ESTree.Expression
}
export type CSSObjectContext = CSSHelperContext &
    CSSBaseContext &
    (
        | {
              define: ESTree.ObjectExpression | ESTree.ArrayExpression
              on: "jsx-style"
          }
        | {
              define: ESTree.ObjectExpression | ESTree.ArrayExpression
              on: "vue-style"
          }
        | {
              define: ESTree.ObjectExpression | ESTree.ArrayExpression
              on: "define-function"
          }
    )

export type CSSPropertyName = {
    name: string
    expression: ESTree.Expression
    directExpression: ESTree.Expression | null
}
export type CSSPropertyValue = {
    value: string | number
    expression: ESTree.Expression
    directExpression: ESTree.Expression | null
}
export type CSSSelector = {
    selector: string
    expression: ESTree.Expression
    directExpression: ESTree.Expression | null
}
export type CSSPropertyContext = {
    getName: () => CSSPropertyName | null
    getValue: () => CSSPropertyValue | null
}
export type CSSRuleContext = {
    getSelector: () => CSSSelector | null
}

export type CSSVisitorHandlers = {
    onRoot?: (context: CSSObjectContext) => void
    "onRoot:exit"?: (context: CSSObjectContext) => void
    onProperty?: (property: CSSPropertyContext) => void
    onRule?: (rule: CSSRuleContext) => void
    "onRule:exit"?: (rule: CSSRuleContext) => void
}

export type DefineCSSVisitorRule = {
    createVisitor: (context: CSSObjectContext) => CSSVisitorHandlers
}

type CSSRule = DefineCSSVisitorRule

type DefineFunctionPaths = string[][]
type DefineFunctions = {
    [module: string]: DefineFunctionPaths | undefined
}

/** Normalize define functions settings */
function normalizeDefineFunctions(settings: unknown): DefineFunctions {
    if (typeof settings !== "object" || settings == null) {
        return {}
    }
    const defines: DefineFunctions = {}
    for (const moduleName of Object.keys(settings)) {
        const moduleSettings =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ignore
            (settings as any)[moduleName]
        if (typeof moduleSettings !== "object") {
            continue
        }
        const paths: string[][] = []
        if (Array.isArray(moduleSettings)) {
            paths.push(...moduleSettings.map(normalizePaths))
        }

        defines[moduleName] = paths
    }
    return defines

    /** Normalize paths settings */
    function normalizePaths(val: unknown): string[] {
        if (Array.isArray(val)) {
            return val.map((s) => String(s))
        }
        return [String(val)]
    }
}

const cssRules = new WeakMap<ESTree.Program, CSSRule[]>()

/**
 * Define the CSS visitor rule.
 */
export function defineCSSVisitor(
    context: Rule.RuleContext,
    rule: DefineCSSVisitorRule,
): RuleListener {
    const programNode = context.getSourceCode().ast

    let visitor: RuleListener
    let rules = cssRules.get(programNode)
    if (!rules) {
        rules = []
        cssRules.set(programNode, rules)
        visitor = buildCSSVisitor(context, rules, () => {
            cssRules.delete(programNode)
        })
    } else {
        visitor = {}
    }

    rules.push(rule)

    return visitor
}

/** Build CSS visitor */
function buildCSSVisitor(
    context: Rule.RuleContext,
    rules: CSSRule[],
    programExit: (node: ESTree.Program) => void,
): RuleListener {
    /**
     * Verify a given css object.
     */
    function verifyCSSObject(info: {
        define: ESTree.ObjectExpression | ESTree.ArrayExpression
        scope: ESTree.Expression
        on: "jsx-style" | "vue-style" | "define-function"
    }) {
        const ctx = buildCSSObjectContext(info)

        visitCSS(ctx, createVisitorFromRules(rules, ctx))
    }

    /**
     * Visit CSS
     */
    function visitCSS(ctx: CSSObjectContext, visitor: CSSVisitorHandlers) {
        visitor.onRoot?.(ctx)
        if (ctx.define.type === "ObjectExpression") {
            visitObject(ctx.define)
        } else if (ctx.define.type === "ArrayExpression") {
            visitArray(ctx.define)
        }
        visitor["onRoot:exit"]?.(ctx)

        /**
         * Visit CSS array
         */
        function visitArray(array: ESTree.ArrayExpression) {
            for (const element of array.elements) {
                if (!element) {
                    continue
                }
                if (element.type === "SpreadElement") {
                    const target = resolveDefineExpression(
                        element.argument,
                        ctx,
                    )
                    if (target.type === "ArrayExpression") {
                        visitArray(target)
                    }
                    continue
                }
                const target = resolveDefineExpression(element, ctx)
                if (target.type === "ObjectExpression") {
                    visitObject(target)
                }
            }
        }

        /* eslint-disable complexity -- ignore */
        /**
         * Visit CSS object
         */
        function visitObject(
            /* eslint-enable complexity -- ignore */
            object: ESTree.ObjectExpression,
        ) {
            if (ctx.on === "jsx-style" || ctx.on === "vue-style") {
                if (visitor.onProperty) {
                    for (const prop of object.properties) {
                        if (prop.type === "Property") {
                            visitor.onProperty(buildPropertyContext(ctx, prop))
                        } else if (prop.type === "SpreadElement") {
                            if (prop.argument.type === "Identifier") {
                                const target = resolveDefineExpression(
                                    prop.argument,
                                    ctx,
                                )
                                if (target.type === "ObjectExpression") {
                                    visitObject(target)
                                }
                            }
                        }
                    }
                }
            } else if (ctx.on === "define-function") {
                if (
                    visitor.onProperty ||
                    visitor.onRule ||
                    visitor["onRule:exit"]
                ) {
                    for (const prop of object.properties) {
                        if (prop.type === "Property") {
                            const value = resolveDefineExpression(
                                prop.value as Exclude<
                                    ESTree.Property["value"],
                                    | ESTree.ObjectPattern
                                    | ESTree.ArrayPattern
                                    | ESTree.RestElement
                                    | ESTree.AssignmentPattern
                                >,
                                ctx,
                            )
                            if (value.type === "ObjectExpression") {
                                const rule = buildRuleContext(ctx, prop)
                                visitor.onRule?.(rule)
                                visitObject(value)
                                visitor["onRule:exit"]?.(rule)
                            } else if (
                                value.type === "Literal" ||
                                value.type === "TemplateLiteral"
                            ) {
                                visitor.onProperty?.(
                                    buildPropertyContext(ctx, prop),
                                )
                            }
                        } else if (prop.type === "SpreadElement") {
                            if (prop.argument.type === "Identifier") {
                                const target = resolveDefineExpression(
                                    prop.argument,
                                    ctx,
                                )
                                if (target.type === "ObjectExpression") {
                                    visitObject(target)
                                }
                            }
                        }
                    }
                }
            } else {
                throw new Error()
            }
        }
    }

    const settingsTarget = context.settings.css?.target || {}

    const attributes = ["style", ...(settingsTarget.attributes || [])].map(
        toRegExp,
    )

    const defineFunctions: DefineFunctions = {
        ...normalizeDefineFunctions(settingsTarget.defineFunctions),
        "styled-components": [
            ["default", "/^\\w+$/u"],
            ["default", "/^\\w+$/u", "attrs()"],
            ["default()"],
            ["default()", "attrs()"],
            ["default", "/^\\w+$/u", "withConfig()"],
            ["default", "/^\\w+$/u", "withConfig()", "attrs()"],
            ["default", "/^\\w+$/u", "attrs()", "withConfig()"],
            ["default()", "withConfig()"],
            ["default()", "withConfig()", "attrs()"],
            ["default()", "attrs()", "withConfig()"],
            ["css"],
            ["keyframes"],
            ["createGlobalStyle"],
        ],
    }

    type ScopeStack = {
        upper: ScopeStack | null
        node: ESTree.Node
        defineStyleFunctionArg?: ESTree.Expression | null
    }

    let scopeStack: ScopeStack | null = {
        upper: null,
        node: context.getSourceCode().ast,
    }
    const defineStyleFunctions = new Map<ESTree.Node, ESTree.Expression>()

    return compositingVisitors(
        {
            "Program:exit": programExit,
            Program(node) {
                for (const body of node.body) {
                    if (body.type !== "ImportDeclaration") {
                        continue
                    }
                    const moduleDefineFunctions =
                        defineFunctions[String(body.source.value)]
                    if (!moduleDefineFunctions) {
                        continue
                    }
                    for (const call of extractCallReferences(
                        body,
                        moduleDefineFunctions,
                        context,
                    )) {
                        for (const arg of call.arguments) {
                            if (arg.type === "SpreadElement") {
                                continue
                            }
                            const target = resolveDefineExpression(arg, null)
                            if (target.type === "ObjectExpression") {
                                verifyCSSObject({
                                    define: target,
                                    scope: arg,
                                    on: "define-function",
                                })
                            } else if (
                                target.type === "FunctionExpression" ||
                                target.type === "ArrowFunctionExpression"
                            ) {
                                defineStyleFunctions.set(target, arg)
                            }
                        }
                    }
                }
            },
            ":function, PropertyDefinition"(node: ESTree.Node) {
                const arg = defineStyleFunctions.get(node)
                scopeStack = {
                    upper: scopeStack,
                    node,
                    defineStyleFunctionArg: arg || null,
                }

                if (
                    node.type === "ArrowFunctionExpression" &&
                    node.expression &&
                    node.body.type !== "BlockStatement" &&
                    arg
                ) {
                    const target = resolveDefineExpression(node.body, null)
                    if (target.type === "ObjectExpression") {
                        verifyCSSObject({
                            define: target,
                            scope: arg,
                            on: "define-function",
                        })
                    }
                }
            },
            ReturnStatement(node: ESTree.ReturnStatement) {
                if (
                    scopeStack &&
                    scopeStack.defineStyleFunctionArg &&
                    node.argument
                ) {
                    const target = resolveDefineExpression(node.argument, null)
                    if (target.type === "ObjectExpression") {
                        verifyCSSObject({
                            define: target,
                            scope: scopeStack.defineStyleFunctionArg,
                            on: "define-function",
                        })
                    }
                }
            },
            ":function, PropertyDefinition:exit"() {
                scopeStack = scopeStack && scopeStack.upper
            },
            [`JSXAttribute > JSXExpressionContainer.value > .expression`](
                node: ESTree.Expression,
            ) {
                const jsxAttr = getParent(getParent(node)) as {
                    name?: { name?: string }
                } | null
                const attrName = jsxAttr?.name?.name
                if (!attrName || !attributes.some((r) => r.test(attrName))) {
                    return
                }
                const target = resolveDefineExpression(node, null)
                if (
                    target.type === "ObjectExpression" ||
                    target.type === "ArrayExpression"
                ) {
                    verifyCSSObject({
                        define: target,
                        scope: node,
                        on: "jsx-style",
                    })
                }
            },
        },
        defineTemplateBodyVisitor(context, {
            [`VAttribute[directive=true][key.name.name='bind'] > VExpressionContainer.value > :matches(ObjectExpression,ArrayExpression).expression`](
                node: ESTree.ObjectExpression | ESTree.ArrayExpression,
            ) {
                const vBindAttr = getParent(getParent(node)) as {
                    key?: {
                        argument?: { name?: string }
                    }
                } | null
                const attrName = vBindAttr?.key?.argument?.name
                if (!attrName || !attributes.some((r) => r.test(attrName))) {
                    return
                }

                verifyCSSObject({
                    define: node,
                    scope: node,
                    on: "vue-style",
                })
            },
        }),
        {},
    )

    /**
     * Build CSSObjectContext
     */
    function buildCSSObjectContext(info: {
        define: ESTree.ObjectExpression | ESTree.ArrayExpression
        scope: ESTree.Expression
        on: "jsx-style" | "vue-style" | "define-function"
    }): CSSObjectContext {
        return {
            define: info.define,
            scope: info.scope,
            on: info.on,
            isFixable<T extends ESTree.Node>(
                targetNode?: T | null,
            ): targetNode is T {
                const scopeRange = info.scope.range!
                if (
                    scopeRange[0] <= info.define.range![0] &&
                    info.define.range![1] <= scopeRange[1]
                ) {
                    if (!targetNode) {
                        return true
                    }
                    const targetRange = targetNode.range!
                    return (
                        scopeRange[0] <= targetRange[0] &&
                        targetRange[1] <= scopeRange[1]
                    )
                }
                return false
            },
        }
    }

    /** Resolve define expression */
    function resolveDefineExpression(
        node: ESTree.Expression,
        ctx: CSSObjectContext | null,
    ) {
        if (ctx && ctx.on === "vue-style") {
            return node
        }
        if (node.type === "Identifier") {
            return findExpression(context, node) || node
        }
        return node
    }

    /** Build property context */
    function buildPropertyContext(
        ctx: CSSObjectContext,
        node: ESTree.Property,
    ): CSSPropertyContext {
        return {
            getName() {
                const { key } = node
                if (key.type === "PrivateIdentifier") {
                    return null
                }
                if (!node.computed && key.type !== "Literal") {
                    if (key.type === "Identifier") {
                        return {
                            name: key.name,
                            expression: key,
                            directExpression: key,
                        }
                    }
                    return null
                }
                const val = resolveExpression(ctx, key)
                return (
                    val && {
                        name: String(val.value),
                        expression: val.expression,
                        directExpression: val.directExpression,
                    }
                )
            },
            getValue() {
                const value = node.value as Exclude<
                    ESTree.Property["value"],
                    | ESTree.ObjectPattern
                    | ESTree.ArrayPattern
                    | ESTree.RestElement
                    | ESTree.AssignmentPattern
                >
                return resolveExpression(ctx, value)
            },
        }
    }

    /** Build rule context */
    function buildRuleContext(
        ctx: CSSObjectContext,
        node: ESTree.Property,
    ): CSSRuleContext {
        return {
            getSelector() {
                const { key } = node
                if (key.type === "PrivateIdentifier") {
                    return null
                }
                if (!node.computed && key.type !== "Literal") {
                    if (key.type === "Identifier") {
                        return {
                            selector: key.name,
                            expression: key,
                            directExpression: key,
                        }
                    }
                    return null
                }
                const val = resolveExpression(ctx, key)
                return (
                    val && {
                        selector: String(val.value),
                        expression: val.expression,
                        directExpression: val.directExpression,
                    }
                )
            },
        }
    }

    /** Resolve Expression */
    function resolveExpression(ctx: CSSObjectContext, node: ESTree.Expression) {
        if (node.type === "Literal") {
            if (
                typeof node.value === "string" ||
                typeof node.value === "number"
            ) {
                return {
                    value: node.value,
                    expression: node,
                    directExpression: node,
                }
            }
            return null
        }
        if (isStaticTemplateLiteral(node)) {
            return {
                value: node.quasis[0].value.cooked!,
                expression: node,
                directExpression: node,
            }
        }
        if (ctx.on === "vue-style") {
            return null
        }
        const name = getStaticValue(context, node)
        if (
            name != null &&
            (typeof name.value === "string" || typeof name.value === "number")
        ) {
            return {
                value: name.value,
                expression: node,
                directExpression: null,
            }
        }
        return null
    }
}

/** Create a visitor handler from the given rules */
function createVisitorFromRules(
    rules: Iterable<CSSRule>,
    context: CSSObjectContext,
): CSSVisitorHandlers {
    const handlers: CSSVisitorHandlers = {}
    for (const rule of rules) {
        if (rule.createVisitor) {
            const visitor = rule.createVisitor(context)
            for (const key of Object.keys(
                visitor,
            ) as (keyof CSSVisitorHandlers)[]) {
                const orig = handlers[key]
                if (orig) {
                    handlers[key] = (...args: unknown[]) => {
                        // @ts-expect-error -- ignore
                        orig(...args)
                        // @ts-expect-error -- ignore
                        visitor[key](...args)
                    }
                } else {
                    // @ts-expect-error -- ignore
                    handlers[key] = visitor[key]
                }
            }
        }
    }
    return handlers
}

/**
 * Register the given visitor to parser services.
 * If the parser service of `vue-eslint-parser` was not found, and linting `.vue`,
 * this generates a warning.
 *
 * @param context The rule context to use parser services.
 * @param templateBodyVisitor The visitor to traverse the template body.
 * @returns {RuleListener} The merged visitor.
 */
function defineTemplateBodyVisitor(
    context: Rule.RuleContext,
    templateBodyVisitor: RuleListener,
) {
    if (context.parserServices.defineTemplateBodyVisitor == null) {
        const filename = context.getFilename()
        if (path.extname(filename) === ".vue") {
            context.report({
                loc: { line: 1, column: 0 },
                message:
                    "Use the latest vue-eslint-parser. See also https://eslint.vuejs.org/user-guide/#what-is-the-use-the-latest-vue-eslint-parser-error.",
            })
        }
        return {}
    }
    return context.parserServices.defineTemplateBodyVisitor(
        templateBodyVisitor,
        {},
        {},
    )
}

/**
 * Composite all given visitors.
 */
export function compositingVisitors(
    visitor: RuleListener,
    ...visitors: RuleListener[]
): RuleListener {
    for (const v of visitors) {
        for (const key in v) {
            const orig = visitor[key]
            if (orig) {
                visitor[key] = (...args: unknown[]) => {
                    // @ts-expect-error -- ignore
                    orig(...args)
                    // @ts-expect-error -- ignore
                    v[key](...args)
                }
            } else {
                visitor[key] = v[key]
            }
        }
    }
    return visitor
}
