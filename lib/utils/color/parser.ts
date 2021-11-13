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

export function parseNumberUnit<U extends Unit>(
    input: FunctionArgument,
    expectUnits: U[],
): NumberWithUnit<U>
export function parseNumberUnit<U extends Unit>(
    input: FunctionArgument | undefined,
    expectUnits: U[],
): NumberWithUnit<U> | null
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

type ParseArgumentValuesOption<
    U1 extends Unit,
    U2 extends Unit,
    U3 extends Unit,
> = {
    units1: U1[]
    units2: U2[]
    units3: U3[]
}

/** Parse argument values */
export function parseArgumentValues<
    U1 extends Unit,
    U2 extends Unit,
    U3 extends Unit,
>(
    functionArguments: FunctionArgument[],
    option: ParseArgumentValuesOption<U1, U2, U3>,
):
    | {
          value1: NumberWithUnit<U1>
          value2: NumberWithUnit<U2>
          value3: NumberWithUnit<U3>
          alpha: AlphaArgument | null
      }
    | {
          value1: NumberWithUnit<U1>
          value2: NumberWithUnitWithComma<U2>
          value3: NumberWithUnitWithComma<U3>
          alpha: AlphaArgument | null
      }
    | null {
    if (functionArguments.length < 3) {
        return null
    }
    const node = functionArguments[1]
    if (node.node.value === ",") {
        return parseArgumentValuesWithComma(functionArguments, option)
    }
    return parseArgumentValuesWithSpace(functionArguments, option)
}

/** Parse argument values */
export function parseArgumentValuesWithSpace<
    U1 extends Unit,
    U2 extends Unit,
    U3 extends Unit,
>(
    functionArguments: FunctionArgument[],
    option: ParseArgumentValuesOption<U1, U2, U3>,
): {
    value1: NumberWithUnit<U1>
    value2: NumberWithUnit<U2>
    value3: NumberWithUnit<U3>
    alpha: AlphaArgument | null
} | null {
    if (functionArguments.length < 3) {
        return null
    }

    const n1 = parseNumberUnit(functionArguments.shift()!, option.units1)
    const n2 = parseNumberUnit(functionArguments.shift()!, option.units2)
    const n3 = parseNumberUnit(functionArguments.shift()!, option.units3)
    const alpha = parseAlphaArgument(functionArguments, ["/"])

    return {
        value1: n1,
        value2: n2,
        value3: n3,
        alpha,
    }
}

/** Parse argument values */
export function parseArgumentValuesWithComma<
    U1 extends Unit,
    U2 extends Unit,
    U3 extends Unit,
>(
    functionArguments: FunctionArgument[],
    option: ParseArgumentValuesOption<U1, U2, U3>,
): {
    value1: NumberWithUnit<U1>
    value2: NumberWithUnitWithComma<U2>
    value3: NumberWithUnitWithComma<U3>
    alpha: AlphaArgument | null
} | null {
    if (functionArguments.length < 5) {
        return null
    }
    if (
        functionArguments[1].node.value !== "," ||
        functionArguments[3].node.value !== "," ||
        (functionArguments[5] && functionArguments[5].node.value !== ",")
    ) {
        return null
    }

    const n1 = parseNumberUnit(functionArguments.shift()!, option.units1)
    const comma1 = functionArguments.shift()!
    const n2 = parseNumberUnit(functionArguments.shift()!, option.units2)
    const nc2 = n2.valid
        ? new NumberWithUnitWithCommaValid(comma1, n2)
        : new NumberWithUnitWithCommaInvalid(comma1, n2)
    const comma2 = functionArguments.shift()!
    const n3 = parseNumberUnit(functionArguments.shift()!, option.units3)
    const nc3 = n3.valid
        ? new NumberWithUnitWithCommaValid(comma2, n3)
        : new NumberWithUnitWithCommaInvalid(comma2, n3)
    const alpha = parseAlphaArgument(functionArguments, [","])

    return {
        value1: n1,
        value2: nc2,
        value3: nc3,
        alpha,
    }
}
