import type {
    Expression,
    ImportDeclaration,
    Pattern,
    SimpleCallExpression,
    VariableDeclaration,
} from "estree"
import type { Rule, Scope } from "eslint"
import { toRegExp } from "./regexp"
import { findVariable, getParent, getPropertyName } from "./ast-utils"

class TargetPaths {
    private readonly targets: {
        tester: { test: (str: string) => boolean }
        paths: string[]
    }[] = []

    public constructor(paths: string[][]) {
        for (const [key, ...others] of paths) {
            this.targets.push({
                tester: toRegExp(key),
                paths: others,
            })
        }
    }

    public consumePath(name: string | null): TargetPaths | null {
        if (name == null) {
            return this
        }
        const next: string[][] = []

        for (const target of this.targets) {
            if (!target.tester.test(name)) {
                continue
            }
            if (target.paths.length) {
                next.push(target.paths)
            }
        }

        return next.length ? new TargetPaths(next) : null
    }

    public isTargetCall(name: string | null) {
        if (name == null) {
            return false
        }
        return this.targets.some(
            (target) => target.tester.test(name) && !target.paths.length,
        )
    }
}

/** Extract call references from the given import declaration */
export function* extractCallReferences(
    node: ImportDeclaration,
    functionPaths: string[][],
    context: Rule.RuleContext,
): Iterable<SimpleCallExpression> {
    const paths = new TargetPaths(functionPaths)
    for (const specifier of node.specifiers) {
        const variable = findVariable(context, specifier.local)
        if (!variable) {
            continue
        }
        if (specifier.type === "ImportDefaultSpecifier") {
            yield* extractCallReferencesForVariable(
                variable,
                "default",
                paths,
                context,
            )
        } else if (specifier.type === "ImportNamespaceSpecifier") {
            yield* extractCallReferencesForVariable(
                variable,
                null,
                paths,
                context,
            )
        } else if (specifier.type === "ImportSpecifier") {
            yield* extractCallReferencesForVariable(
                variable,
                specifier.imported.name,
                paths,
                context,
            )
        }
    }
}

/** Extract call references from variable */
function* extractCallReferencesForVariable(
    variable: Scope.Variable,
    name: string | null,
    paths: TargetPaths,
    context: Rule.RuleContext,
) {
    for (const reference of variable.references) {
        if (!reference.isRead()) {
            continue
        }
        yield* extractCallReferencesForExpression(
            reference.identifier,
            name,
            paths,
            context,
        )
    }
}

/** Extract call references from expression */
function* extractCallReferencesForExpression(
    expression: Expression,
    name: string | null,
    paths: TargetPaths,
    context: Rule.RuleContext,
): Iterable<SimpleCallExpression> {
    let node = expression
    let parent = getParent(node)
    while (
        parent?.type === "ChainExpression" ||
        // @ts-expect-error -- TS AST
        parent?.type === "TSNonNullExpression" ||
        // @ts-expect-error -- TS AST
        parent?.type === "TSAsExpression"
    ) {
        node = parent
        parent = getParent(node)
    }
    if (!parent) {
        return
    }
    if (parent.type === "MemberExpression") {
        if (parent.object === node) {
            const nextPaths = paths.consumePath(name)
            if (!nextPaths) {
                return
            }
            const memberName = getPropertyName(context, parent)
            if (memberName == null) {
                return
            }
            yield* extractCallReferencesForExpression(
                parent,
                memberName,
                nextPaths,
                context,
            )
        }
    } else if (parent.type === "VariableDeclarator") {
        if (
            parent.init === node &&
            (getParent(parent) as VariableDeclaration)?.kind === "const"
        ) {
            yield* extractCallReferencesForPattern(
                parent.id,
                name,
                paths,
                context,
            )
        }
    } else if (parent.type === "CallExpression") {
        if (paths.isTargetCall(name)) {
            yield parent
        }
        if (name) {
            yield* extractCallReferencesForExpression(
                parent,
                `${name}()`,
                paths,
                context,
            )
        }
    }
}

/** Extract call references from pattern */
function* extractCallReferencesForPattern(
    pattern: Pattern,
    name: string | null,
    paths: TargetPaths,
    context: Rule.RuleContext,
): Iterable<SimpleCallExpression> {
    let target = pattern
    while (target.type === "AssignmentPattern") {
        target = target.left
    }
    if (target.type === "Identifier") {
        const variable = findVariable(context, target)
        if (!variable) {
            return
        }
        yield* extractCallReferencesForVariable(variable, name, paths, context)
    } else if (target.type === "ObjectPattern") {
        for (const prop of target.properties) {
            if (prop.type === "Property") {
                const nextPaths = paths.consumePath(name)
                if (!nextPaths) {
                    continue
                }
                const propName = getPropertyName(context, prop)
                if (propName == null) {
                    continue
                }
                yield* extractCallReferencesForPattern(
                    prop.value,
                    propName,
                    paths,
                    context,
                )
            } else if (prop.type === "RestElement") {
                yield* extractCallReferencesForPattern(
                    prop.argument,
                    name,
                    paths,
                    context,
                )
            }
        }
    }
}
