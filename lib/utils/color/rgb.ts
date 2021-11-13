import type postcssValueParser from "postcss-value-parser"
import type {
    AlphaArgument,
    AlphaArgumentValid,
    FunctionArgument,
    NumberWithUnit,
    NumberWithUnitValid,
    NumberWithUnitWithComma,
    NumberWithUnitWithCommaValid,
} from "./data"
import {
    isPercentRange,
    parseAlphaArgument,
    parseFunction,
    parseMaybeNumberUnit,
    parseNumberUnit,
} from "./parser"

export type BaseRgbDataValid<U extends "" | "%"> = {
    valid: true
    rawName: string
    unit: U
    r: NumberWithUnitValid<U>
    g: NumberWithUnitValid<U> | NumberWithUnitWithCommaValid<U>
    b: NumberWithUnitValid<U> | NumberWithUnitWithCommaValid<U>
    alpha: AlphaArgumentValid | null
    extraArgs?: undefined
}
export type RgbDataStandard<U extends "" | "%"> = BaseRgbDataValid<U> & {
    type: "standard"
    g: NumberWithUnitValid<U>
    b: NumberWithUnitValid<U>
}
export type RgbDataWithComma<U extends "" | "%"> = BaseRgbDataValid<U> & {
    type: "with-comma"
    g: NumberWithUnitWithCommaValid<U>
    b: NumberWithUnitWithCommaValid<U>
}
export type RgbData =
    | RgbDataStandard<"">
    | RgbDataWithComma<"">
    | RgbDataStandard<"%">
    | RgbDataWithComma<"%">

export type InvalidRgbData = {
    valid: false
    rawName: string
    r: NumberWithUnit<"" | "%"> | null
    g: NumberWithUnit<"" | "%"> | NumberWithUnitWithComma<"" | "%"> | null
    b: NumberWithUnit<"" | "%"> | NumberWithUnitWithComma<"" | "%"> | null
    alpha: AlphaArgument | null
    extraArgs: FunctionArgument[]
}

/**
 * Parses a RGB CSS color function/string
 */
export function parseRgb(
    input: string | postcssValueParser.Node,
): RgbData | InvalidRgbData | null {
    const fn = parseFunction(input, ["rgb", "rgba"])
    if (fn == null) {
        return null
    }

    let valid = true

    const r = parseNumberUnit(fn.arguments.shift(), ["", "%"])
    const g = parseMaybeNumberUnit(fn.arguments, ["", "%"])
    const b = parseMaybeNumberUnit(fn.arguments, ["", "%"])

    if (!isValidColor(r) || !isValidColor(g) || !isValidColor(b)) {
        valid = false
    }

    const alpha = parseAlphaArgument(
        fn.arguments,
        g?.withComma && b?.withComma ? ["/", ","] : ["/"],
    )
    if (
        valid &&
        r &&
        r.valid &&
        g &&
        g.valid &&
        b &&
        b.valid &&
        (!alpha || alpha.valid) &&
        fn.arguments.length === 0
    ) {
        const result = genMaybeValid(fn.rawName, r.value.unit, r, g, b, alpha)
        if (result) {
            return result
        }

        if (g.withComma !== b.withComma) {
            // mixed comma
            return null
        }
    }

    return {
        valid: false,
        rawName: fn.rawName,
        r,
        g,
        b,
        alpha,
        extraArgs: fn.arguments,
    }
}

/** Checks wether given node is in valid color range. */
function genMaybeValid<U extends "" | "%">(
    rawName: string,
    unit: U,
    r: NumberWithUnitValid<"" | "%">,
    g: NumberWithUnitValid<"" | "%"> | NumberWithUnitWithCommaValid<"" | "%">,
    b: NumberWithUnitValid<"" | "%"> | NumberWithUnitWithCommaValid<"" | "%">,
    alpha: AlphaArgumentValid | null,
): RgbData | null {
    const uniUnit = unit as "%"
    if (isUnitEq(r, uniUnit) && isUnitEq(g, uniUnit) && isUnitEq(b, uniUnit)) {
        if (!g.withComma && !b.withComma && (!alpha || alpha.div === "/")) {
            return {
                valid: true,
                rawName,
                unit: uniUnit,
                type: "standard",
                r,
                g,
                b,
                alpha,
            }
        }
        if (g.withComma && b.withComma && (!alpha || alpha.div === ",")) {
            return {
                valid: true,
                rawName,
                unit: uniUnit,
                type: "with-comma",
                r,
                g,
                b,
                alpha,
            }
        }
    }
    return null
}

/** Checks wether given node have given unit. */
function isUnitEq<U extends "" | "%">(
    node:
        | NumberWithUnitValid<"" | "%">
        | NumberWithUnitWithCommaValid<"" | "%">,
    unit: U,
): node is NumberWithUnitValid<U> | NumberWithUnitWithCommaValid<U> {
    return unit === node.value.unit
}

/** Checks wether given node is in valid color range. */
function isValidColor(
    node: NumberWithUnit<"" | "%"> | NumberWithUnitWithComma<"" | "%"> | null,
): boolean {
    return Boolean(
        node &&
            node.value &&
            (node.value.unit === "%"
                ? isPercentRange(node)
                : node.value.number >= 0 && node.value.number <= 255),
    )
}
