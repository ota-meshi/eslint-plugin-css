import type { CSSObjectContext, CSSVisitorHandlers } from "../utils"
import { createRule, defineCSSVisitor } from "../utils"
import type { Node as ValueNode } from "postcss-value-parser"
import valueParser from "postcss-value-parser"
import { toRegExp } from "../utils/regexp"
import { isCamelCase, kebabCase } from "../utils/casing"
import { LENGTH_UNITS, MATH_FUNCTIONS } from "../utils/resource"

export default createRule("no-length-zero-unit", {
    meta: {
        docs: {
            description: "disallow units for zero lengths",
            category: "Best Practices",
            recommended: false,
        },
        schema: [
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
                    ignoreFunctions: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                        uniqueItems: true,
                        minItems: 1,
                    },
                    ignoreCustomProperties: { type: "boolean" },
                },
                additionalProperties: false,
            },
        ],
        fixable: "code",
        messages: {
            unexpected: "Unexpected unit.",
        },
        type: "suggestion",
    },
    create(context) {
        const ignoreFunctions = [
            ...(context.options[0]?.ignoreFunctions ?? []),
        ].map(toRegExp)
        const ignoreProperties = [
            ...(context.options[0]?.ignoreProperties ?? []),
        ].map(toRegExp)
        const ignoreCustomProperties = Boolean(
            context.options[0]?.ignoreCustomProperties,
        )

        /**
         * Create visitor
         */
        function createVisitor(
            _cssContext: CSSObjectContext,
        ): CSSVisitorHandlers {
            /** Checks whether given name is ignore */
            function ignorePropName(name: string) {
                return (
                    name === "line-height" ||
                    name === "flex" ||
                    ignoreProperties.some((r) => r.test(name)) ||
                    (ignoreCustomProperties && name.startsWith("--"))
                )
            }

            return {
                onProperty(property) {
                    const prop = property.getName()
                    if (
                        !prop ||
                        ignorePropName(prop.name) ||
                        (isCamelCase(prop.name) &&
                            ignorePropName(kebabCase(prop.name)))
                    ) {
                        return
                    }
                    const value = property.getValue()
                    if (!value) {
                        return
                    }
                    const parsedValue = valueParser(String(value.value))

                    parsedValue.walk(
                        (valueNode, valueNodeIndex, valueNodes) => {
                            if (
                                prop.name === "font" &&
                                valueNodeIndex > 0 &&
                                valueNodes[valueNodeIndex - 1].type === "div" &&
                                valueNodes[valueNodeIndex - 1].value === "/"
                            )
                                return undefined

                            const { value: textValue, sourceIndex } = valueNode

                            if (isMathFunction(valueNode)) return false

                            if (
                                valueNode.type === "function" &&
                                ignoreFunctions.some((r) =>
                                    r.test(valueNode.value),
                                )
                            )
                                return false

                            if (valueNode.type !== "word") return undefined

                            const numberUnit = valueParser.unit(textValue)

                            if (numberUnit === false) return undefined

                            const { number, unit } = numberUnit

                            if (
                                unit === "" ||
                                !isLengthUnit(unit) ||
                                unit.toLowerCase() === "fr" ||
                                Number(number) !== 0
                            )
                                return undefined

                            const sourceCode = context.getSourceCode()
                            const startIndex =
                                value.expression.range![0] +
                                sourceIndex +
                                number.length +
                                1 /* quote */
                            const endIndex = startIndex + unit.length
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
                                        value.directExpression ||
                                        sourceCode.text.slice(
                                            startIndex,
                                            endIndex,
                                        ) === unit
                                    ) {
                                        return fixer.removeRange([
                                            startIndex,
                                            endIndex,
                                        ])
                                    }
                                    return null
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

/** Checks whether the given node is math function. */
function isMathFunction(node: ValueNode) {
    return (
        node.type === "function" && MATH_FUNCTIONS.has(node.value.toLowerCase())
    )
}

/** Checks whether the unit is length unit. */
function isLengthUnit(unit: string) {
    return LENGTH_UNITS.has(unit.toLowerCase())
}
