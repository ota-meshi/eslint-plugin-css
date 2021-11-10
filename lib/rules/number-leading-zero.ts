import type { CSSObjectContext, CSSVisitorHandlers } from "../utils"
import { createRule, defineCSSVisitor } from "../utils"

export default createRule("number-leading-zero", {
    meta: {
        docs: {
            description:
                "require or disallow a leading zero for fractional numbers less than 1",
            category: "Stylistic Issues",
            recommended: false,
            stylelint: "number-leading-zero",
        },
        fixable: "code",
        schema: [
            {
                enum: ["always", "never"],
            },
        ],
        messages: {
            expected: "Expected a leading zero.",
            unexpected: "Unexpected leading zero.",
        },
        type: "layout",
    },
    create(context) {
        const option: "always" | "never" = context.options[0] || "always"

        /**
         * Create visitor
         */
        function createVisitor(
            cssContext: CSSObjectContext,
        ): CSSVisitorHandlers {
            const sourceCode = context.getSourceCode()
            return {
                onProperty(property) {
                    const value = property.getValue()
                    if (!value) {
                        return
                    }
                    if (
                        typeof value.value === "number" ||
                        !value.value.includes(".")
                    ) {
                        return
                    }
                    value.parsed.walk((node) => {
                        // Ignore `url` function
                        if (
                            node.type === "function" &&
                            node.value.toLowerCase() === "url"
                        ) {
                            return false
                        }
                        if (node.type !== "word") {
                            return undefined
                        }

                        // Check leading zero
                        if (option === "always") {
                            const match = /(?:\D|^)(?<decimal>\.\d+)/u.exec(
                                node.value,
                            )

                            if (match == null) {
                                return undefined
                            }

                            const startIndex =
                                value.expression.range![0] +
                                node.sourceIndex +
                                match.index +
                                match[0].length -
                                match[1].length +
                                1 /* quote */
                            const endIndex = startIndex + match[1].length
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
                                messageId: "expected",
                                fix(fixer) {
                                    if (
                                        cssContext.isFixable(
                                            value.directExpression,
                                        ) ||
                                        sourceCode.text[startIndex] === "."
                                    ) {
                                        return fixer.insertTextBeforeRange(
                                            [startIndex, endIndex],
                                            "0",
                                        )
                                    }
                                    return null
                                },
                            })
                        } else if (option === "never") {
                            const match =
                                /(?:\D|^)(?<zero>0+)(?<decimal>\.\d+)/u.exec(
                                    node.value,
                                )

                            if (match === null) {
                                return undefined
                            }
                            const startIndex =
                                value.expression.range![0] +
                                node.sourceIndex +
                                match.index +
                                match[0].length -
                                (match[1].length + match[2].length) +
                                1 /* quote */
                            const endIndex = startIndex + match[1].length
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
                                messageId: "unexpected",
                                fix(fixer) {
                                    if (
                                        cssContext.isFixable(
                                            value.directExpression,
                                        ) ||
                                        /^0+$/u.test(
                                            sourceCode.text.slice(
                                                startIndex,
                                                endIndex,
                                            ),
                                        )
                                    ) {
                                        return fixer.removeRange([
                                            startIndex,
                                            endIndex,
                                        ])
                                    }
                                    return null
                                },
                            })
                        }
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
