import type {
    CSSObjectContext,
    CSSPropertyContext,
    CSSVisitorHandlers,
} from "../utils"
import { createRule, defineCSSVisitor } from "../utils"
import {
    getVendorPrefix,
    normalizePropertyName,
    stripVendorPrefix,
} from "../utils/css-utils"
import { SHORTHAND_PROPERTIES } from "../utils/resource"

export default createRule("no-shorthand-property-overrides", {
    meta: {
        docs: {
            description:
                "disallow shorthand properties that override related longhand properties",
            category: "Possible Errors",
            recommended: true,
            stylelint: "declaration-block-no-shorthand-property-overrides",
        },
        schema: [],
        messages: {
            unexpected:
                "Unexpected shorthand '{{shorthand}}' after '{{original}}'.",
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
                properties: CSSPropertyContext[]
            }
            let scopeStack: ScopeStack = { upper: null, properties: [] }

            /** Verify */
            function verifyProperties(properties: CSSPropertyContext[]) {
                if (properties.length <= 1) {
                    return
                }
                const declarations = new Map<string, string>()

                for (const property of properties) {
                    const name = property.getName()
                    if (!name) {
                        continue
                    }
                    const propName = normalizePropertyName(name.name, {
                        keepVendorPrefix: true,
                    })
                    declarations.set(propName, name.name)

                    const normalized = stripVendorPrefix(propName)
                    const prefix = getVendorPrefix(propName)

                    const longhandProps = SHORTHAND_PROPERTIES.get(normalized)
                    if (!longhandProps) {
                        continue
                    }

                    for (const longhandProp of longhandProps) {
                        const original = declarations.get(prefix + longhandProp)
                        if (original == null) {
                            continue
                        }

                        context.report({
                            node: name.expression,
                            messageId: "unexpected",
                            data: {
                                shorthand: name.name,
                                original,
                            },
                        })
                    }
                }
            }

            return {
                onRule() {
                    scopeStack = { upper: scopeStack, properties: [] }
                },
                onProperty(property) {
                    scopeStack.properties.push(property)
                },
                "onRule:exit"() {
                    verifyProperties(scopeStack.properties)
                    scopeStack = scopeStack?.upper || scopeStack
                },
                "onRoot:exit"() {
                    verifyProperties(scopeStack.properties)
                },
            }
        }

        return defineCSSVisitor(context, {
            createVisitor,
        })
    },
})
