import postcssValueParser from "postcss-value-parser"
import type {
    AlphaArgument,
    NumberWithUnit,
    NumberWithUnitWithComma,
    Unit,
} from "./data"
import {
    NumberWithUnitWithCommaInvalid,
    NumberWithUnitWithCommaValid,
    AlphaArgumentValid,
    AlphaArgumentInvalid,
    NumberWithUnitInvalid,
    NumberWithUnitValid,
    FunctionArgument,
} from "./data"

/** Parse function */
export function parseFunction(
    input: string | postcssValueParser.Node,
    expectName: string | string[],
): null | { rawName: string; arguments: FunctionArgument[] } {
    const node = parseInput(input)
    if (!node) {
        return null
    }
    if (node.type !== "function") {
        return null
    }
    if (
        Array.isArray(expectName)
            ? !expectName.includes(node.value.toLowerCase())
            : node.value.toLowerCase() !== expectName
    ) {
        return null
    }
    const argumentList: {
        before: postcssValueParser.Node[]
        node: postcssValueParser.Node
        after?: postcssValueParser.Node[]
    }[] = []
    let before: postcssValueParser.Node[] = []
    for (const argNode of node.nodes) {
        if (argNode.type !== "comment" && argNode.type !== "space") {
            argumentList.push({ before, node: argNode })
            before = []
        } else {
            before.push(argNode)
        }
    }

    if (before.length > 0 && argumentList.length > 0) {
        argumentList[argumentList.length - 1].after = before
    }
    return {
        rawName: node.value,
        arguments: argumentList.map(
            (data) => new FunctionArgument(data.before, data.node, data.after),
        ),
    }
}

/** Parse number unit */
export function parseNumberUnit<U extends Unit>(
    input: FunctionArgument | undefined,
    expectUnits: U[],
): NumberWithUnit<U> | null {
    if (!input) {
        return null
    }
    if (input.node.type !== "word") {
        return new NumberWithUnitInvalid(input)
    }

    const data = postcssValueParser.unit(input.node.value)
    if (!data) {
        return new NumberWithUnitInvalid(input)
    }
    if (!(expectUnits as string[]).includes(data.unit)) {
        return new NumberWithUnitInvalid(input)
    }

    return new NumberWithUnitValid(input, {
        number: Number(data.number),
        string: data.number,
        unit: data.unit as U,
    })
}

/** Parse number unit maybe comma */
export function parseMaybeNumberUnit<U extends Unit>(
    functionArguments: FunctionArgument[],
    expectUnits: U[],
): NumberWithUnit<U> | NumberWithUnitWithComma<U> | null {
    const next = functionArguments[0]
    if (!next) {
        return null
    }
    if (next.node.value === ",") {
        return parseNumberUnitWithComma(functionArguments, expectUnits)
    }
    return parseNumberUnit(functionArguments.shift(), expectUnits)
}

/** Parse number unit with comma */
export function parseNumberUnitWithComma<U extends Unit>(
    functionArguments: FunctionArgument[],
    expectUnits: U[],
): NumberWithUnitWithComma<U> | null {
    const next = functionArguments.shift()!
    if (!next) {
        return null
    }
    if (next.node.value !== ",") {
        functionArguments.unshift(next)
        return null
    }
    const valueNode = functionArguments.shift()!
    if (!valueNode) {
        functionArguments.unshift(next)
        return null
    }
    const value = parseNumberUnit(valueNode, expectUnits)!
    if (value.valid) {
        return new NumberWithUnitWithCommaValid(next, value)
    }
    return new NumberWithUnitWithCommaInvalid(next, value)
}

/** Parse alpha arguments */
export function parseAlphaArgument(
    functionArguments: FunctionArgument[],
    divMarks: string[],
): AlphaArgument | null {
    if (functionArguments.length < 2) {
        return null
    }
    let alphaValue: number | null = null
    const div = functionArguments.shift()!
    if (!divMarks.includes(div.node.value)) {
        functionArguments.unshift(div)
        return null
    }
    const alpha = parseNumberUnit(functionArguments.shift(), ["", "%"])!
    if (!alpha.value) {
        return new AlphaArgumentInvalid(div, alpha, null)
    }
    alphaValue = alpha.value.number / (alpha.value.unit === "%" ? 100 : 1)
    if (alphaValue < 0 || alphaValue > 1) {
        return new AlphaArgumentInvalid(div, alpha, alphaValue)
    }
    return new AlphaArgumentValid(div, alpha, alphaValue)
}

/** Parse input */
export function parseInput(
    input: string | postcssValueParser.Node | undefined,
): postcssValueParser.Node | null {
    if (typeof input === "string") {
        const parsed = postcssValueParser(input)
        if (parsed.nodes.length !== 1) {
            return null
        }
        return parsed.nodes[0]
    }
    return input ?? null
}

/** Checks wether given node is between 0 and 100. */
export function isPercentRange(
    node: NumberWithUnit<"" | "%"> | NumberWithUnitWithComma<"" | "%"> | null,
): boolean {
    return Boolean(
        node &&
            node.value &&
            node.value.number >= 0 &&
            node.value.number <= 100,
    )
}
