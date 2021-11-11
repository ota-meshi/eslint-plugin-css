import type {
    CSSObjectContext,
    CSSPropertyName,
    CSSVisitorHandlers,
} from "../utils"
import { createRule, defineCSSVisitor } from "../utils"
import { normalizePropertyName } from "../utils/css-utils"

export default createRule("no-dupe-properties", {
    meta: {
        docs: {
            description: "disallow duplicate properties",
            category: "Possible Errors",
            recommended: true,
            stylelint: null,
        },
        schema: [],
        messages: {
            unexpected: "Duplicate property '{{name}}' and '{{other}}'.",
        },
        type: "problem",
    },
    create(context) {
        /**
         * Create visitor
         */
        function createVisitor(
            _cssContext: CSSObjectContext,
        ): CSSVisitorHandlers {
            type ScopeStack = {
                upper: ScopeStack | null
                names: CSSPropertyName[]
            }
            let scopeStack: ScopeStack = { upper: null, names: [] }

            /** Verify */
            function verifyNames(names: CSSPropertyName[]) {
                const reported = new Set<CSSPropertyName>()
                const map = new Map<string, CSSPropertyName>()
                for (const name of names) {
                    const normalized = normalizePropertyName(name.name, {
                        keepVendorPrefix: true,
                    })
                    const already = map.get(normalized)
                    if (
                        already &&
                        // Ignore same name
                        name.name !== already.name
                    ) {
                        for (const [report, other] of [
                            [already, name],
                            [name, already],
                        ].filter(([n]) => !reported.has(n))) {
                            context.report({
                                node:
                                    report.directExpression ||
                                    report.expression,
                                messageId: "unexpected",
                                data: { name: report.name, other: other.name },
                            })
                            reported.add(report)
                        }
                    }
                    map.set(normalized, name)
                }
            }

            return {
                onRule() {
                    scopeStack = { upper: scopeStack, names: [] }
                },
                onProperty(property) {
                    const name = property.getName()
                    if (!name) {
                        return
                    }
                    scopeStack.names.push(name)
                },
                "onRule:exit"() {
                    verifyNames(scopeStack.names)
                    scopeStack = scopeStack?.upper || scopeStack
                },
                "onRoot:exit"() {
                    verifyNames(scopeStack.names)
                },
            }
        }

        return defineCSSVisitor(context, {
            createVisitor,
        })
    },
})
