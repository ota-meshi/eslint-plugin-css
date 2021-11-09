import path from "path"
import type * as ESTree from "estree"
import type { Rule } from "eslint"
import type { RuleListener } from "../types"
import {
    findExpression,
    isStaticTemplateLiteral,
    getStaticValue,
} from "./ast-utils"

export type CSSObjectContext = {
    object: ESTree.ObjectExpression
    expression: ESTree.Expression
    on: "jsx-style" | "vue-style"
}

export type CSSPropertyContext = {
    getName: () => {
        name: string
        expression: ESTree.Expression
        directExpression: ESTree.Expression | null
    } | null
    getValue: () => {
        value: string | number
        expression: ESTree.Expression
        directExpression: ESTree.Expression | null
    } | null
}

export type CSSVisitorHandlers = {
    onRoot?: (context: CSSObjectContext) => void
    "onRoot:exit"?: (context: CSSObjectContext) => void
    onProperty?: (property: CSSPropertyContext) => void
}

export type DefineCSSVisitorRule = {
    createVisitor: (context: CSSObjectContext) => CSSVisitorHandlers
}

type CSSRule = DefineCSSVisitorRule

const regexpRules = new WeakMap<ESTree.Program, CSSRule[]>()

/**
 * Define the CSS visitor rule.
 */
export function defineCSSVisitor(
    context: Rule.RuleContext,
    rule: DefineCSSVisitorRule,
): RuleListener {
    const programNode = context.getSourceCode().ast

    let visitor: RuleListener
    let rules = regexpRules.get(programNode)
    if (!rules) {
        rules = []
        regexpRules.set(programNode, rules)
        visitor = buildCSSVisitor(context, rules, () => {
            regexpRules.delete(programNode)
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
        object: ESTree.ObjectExpression
        expression: ESTree.Expression
        on: "jsx-style" | "vue-style"
    }) {
        const ctx = buildCSSObjectContext(info)

        visitCSS(ctx, createVisitorFromRules(rules, ctx))
    }

    /**
     * Visit CSS
     */
    function visitCSS(ctx: CSSObjectContext, visitor: CSSVisitorHandlers) {
        if (visitor.onRoot) {
            visitor.onRoot(ctx)
        }
        visitObject(ctx.object)
        if (visitor["onRoot:exit"]) {
            visitor["onRoot:exit"](ctx)
        }

        /**
         * Visit CSS object
         */
        function visitObject(object: ESTree.ObjectExpression) {
            if (visitor.onProperty) {
                for (const prop of object.properties) {
                    if (prop.type === "Property") {
                        visitor.onProperty(buildPropertyContext(prop))
                    } else if (prop.type === "SpreadElement") {
                        if (prop.argument.type === "Identifier") {
                            let target: ESTree.Expression = prop.argument
                            if (target.type === "Identifier") {
                                target =
                                    findExpression(context, target) || target
                            }
                            if (target.type === "ObjectExpression") {
                                visitObject(target)
                            }
                        }
                    }
                }
            }
        }
    }

    return compositingVisitors(
        {
            "Program:exit": programExit,
            "JSXAttribute[name.name='style'] > JSXExpressionContainer.value > .expression"(
                node: ESTree.Expression,
            ) {
                let target = node
                if (target.type === "Identifier") {
                    target = findExpression(context, target) || target
                }
                if (target.type === "ObjectExpression") {
                    verifyCSSObject({
                        object: target,
                        expression: node,
                        on: "jsx-style",
                    })
                }
            },
        },
        defineTemplateBodyVisitor(context, {
            "VAttribute[directive=true][key.name.name='bind'][key.argument.name='style'] > VExpressionContainer.value > ObjectExpression.expression"(
                node: ESTree.ObjectExpression,
            ) {
                verifyCSSObject({
                    object: node,
                    expression: node,
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
        object: ESTree.ObjectExpression
        expression: ESTree.Expression
        on: "jsx-style" | "vue-style"
    }): CSSObjectContext {
        return {
            object: info.object,
            expression: info.expression,
            on: info.on,
        }
    }

    /** Build property context */
    function buildPropertyContext(node: ESTree.Property): CSSPropertyContext {
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
                const val = resolveExpression(key)
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
                return resolveExpression(value)
            },
        }
    }

    /** Resolve Expression */
    function resolveExpression(node: ESTree.Expression) {
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
