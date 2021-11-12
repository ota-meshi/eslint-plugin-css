import type {
    CSSObjectContext,
    CSSPropertyContext,
    CSSVisitorHandlers,
} from "../utils"
import { createRule, defineCSSVisitor } from "../utils"
import { isCamelCase, kebabCase } from "../utils/casing"
import { isHex, toHexRGB } from "../utils/css-utils"
import { toRegExp } from "../utils/regexp"
import { COLOR_FUNCTION_NAMES } from "../utils/resource"
import { validColord } from "../utils/colord"
import valueParser from "postcss-value-parser"

export default createRule("named-color", {
    meta: {
        docs: {
            description: "enforce named colors",
            category: "Best Practices",
            recommended: false,
            stylelint: "color-named",
        },
        fixable: "code",
        schema: [
            {
                enum: ["always", "never"],
            },
            {
                type: "object",
                properties: {
                    ignoreProperties: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                        uniqueItems: true,
                        minItems: 1,
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            expected: "Expected '{{actual}}' to be '{{expected}}'.",
        },
        type: "suggestion",
    },
    create(context) {
        const option: "always" | "never" = context.options[0] || "always"
        const ignoreProperties = [
            ...(context.options[1]?.ignoreProperties ?? []),
        ].map(toRegExp)

        /** Checks whether given name is ignore */
        function ignorePropName(property: CSSPropertyContext) {
            const name = property.getName()
            if (!name) {
                return false
            }

            const names = [name.name]
            if (isCamelCase(name.name)) {
                const kebab = kebabCase(name.name)
                names.push(kebab)
            }

            return ignoreProperties.some((r) => names.some((n) => r.test(n)))
        }

        /**
         * Create visitor
         */
        function createVisitor(
            cssContext: CSSObjectContext,
        ): CSSVisitorHandlers {
            return {
                onProperty(property) {
                    if (ignorePropName(property)) {
                        return
                    }
                    const value = property.getValue()
                    if (!value) {
                        return
                    }
                    const parsedValue = value.parsed

                    parsedValue.walk((node) => {
                        const { value: textValue, type, sourceIndex } = node
                        if (
                            type === "function" &&
                            textValue.toLowerCase() === "url"
                        )
                            return false

                        const actual = valueParser.stringify(node)
                        let expected: string
                        if (option === "always") {
                            if (
                                (type === "word" && isHex(textValue)) ||
                                (type === "function" &&
                                    COLOR_FUNCTION_NAMES.has(
                                        textValue.toLowerCase(),
                                    ))
                            ) {
                                expected = validColord(node)?.toName() || actual
                            } else {
                                return undefined
                            }
                        } else if (option === "never") {
                            if (
                                type !== "word" ||
                                /[^A-Za-z]/u.test(textValue)
                            ) {
                                return undefined
                            }
                            expected = toHexRGB(
                                validColord(node)?.toHex() || actual,
                            )
                        } else {
                            return undefined
                        }
                        if (expected === actual) {
                            return undefined
                        }

                        const sourceCode = context.getSourceCode()
                        const startIndex =
                            value.expression.range![0] +
                            sourceIndex +
                            1 /* quote */
                        const endIndex = startIndex + actual.length
                        const loc = value.directExpression
                            ? {
                                  start: sourceCode.getLocFromIndex(startIndex),
                                  end: sourceCode.getLocFromIndex(endIndex),
                              }
                            : undefined
                        context.report({
                            node: value.expression,
                            loc,
                            messageId: "expected",
                            data: {
                                actual,
                                expected,
                            },
                            fix(fixer) {
                                if (
                                    cssContext.isFixable(
                                        value.directExpression,
                                    ) &&
                                    sourceCode.text.slice(
                                        startIndex,
                                        endIndex,
                                    ) === actual
                                ) {
                                    return fixer.replaceTextRange(
                                        [startIndex, endIndex],
                                        expected,
                                    )
                                }
                                return null
                            },
                        })

                        return undefined
                    })
                },
            }
        }

        return defineCSSVisitor(context, {
            createVisitor,
        })
    },
})
