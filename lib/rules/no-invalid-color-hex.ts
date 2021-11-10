import type { CSSObjectContext, CSSVisitorHandlers } from "../utils"
import { createRule, defineCSSVisitor } from "../utils"

export default createRule("no-invalid-color-hex", {
    meta: {
        docs: {
            description: "disallow invalid hex colors",
            category: "Possible Errors",
            recommended: true,
            stylelint: "color-no-invalid-hex",
        },
        schema: [],
        messages: {
            invalid: "Unexpected invalid hex color '{{hex}}'.",
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
            return {
                onProperty(property) {
                    const value = property.getValue()
                    if (!value) {
                        return
                    }
                    const parsedValue = value.parsed

                    parsedValue.walk(
                        ({ value: textValue, type, sourceIndex }) => {
                            if (
                                type === "function" &&
                                textValue.toLowerCase() === "url"
                            )
                                return false

                            if (type !== "word") return undefined

                            const hexMatch = /^#[\dA-Za-z]+/u.exec(textValue)

                            if (!hexMatch) return undefined

                            const hexValue = hexMatch[0]

                            if (isValidHex(hexValue)) return undefined

                            const sourceCode = context.getSourceCode()
                            const startIndex =
                                value.expression.range![0] +
                                sourceIndex +
                                1 /* quote */
                            const endIndex = startIndex + textValue.length
                            const loc = value.directExpression
                                ? {
                                      start: sourceCode.getLocFromIndex(
                                          startIndex,
                                      ),
                                      end: sourceCode.getLocFromIndex(endIndex),
                                  }
                                : undefined
                            context.report({
                                node: value.expression,
                                loc,
                                messageId: "invalid",
                                data: {
                                    hex: hexValue,
                                },
                            })

                            return undefined
                        },
                    )
                },
            }
        }

        return defineCSSVisitor(context, {
            createVisitor,
        })
    },
})

/** Checks whether the given hex is valid or not. */
function isValidHex(hex: string) {
    return /^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/iu.test(hex)
}
