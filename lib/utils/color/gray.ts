import type postcssValueParser from "postcss-value-parser"
import type {
    AlphaArgument,
    AlphaArgumentValid,
    FunctionArgument,
    NumberWithUnit,
    NumberWithUnitValid,
} from "./data"
import {
    isPercentRange,
    parseAlphaArgument,
    parseFunction,
    parseNumberUnit,
} from "./parser"

export type GrayData = {
    valid: true
    rawName: string
    lightness: NumberWithUnitValid<"" | "%">
    alpha: AlphaArgumentValid | null
    extraArgs?: undefined
}

export type InvalidGrayData = {
    valid: false
    rawName: string
    lightness: NumberWithUnit<"" | "%"> | null
    alpha: AlphaArgument | null
    extraArgs: FunctionArgument[]
}

/**
 * Parses a gray() CSS color function/string
 */
export function parseGray(
    input: string | postcssValueParser.Node,
): GrayData | InvalidGrayData | null {
    const fn = parseFunction(input, "gray")
    if (fn == null) {
        return null
    }

    let valid = true

    const lightness = parseNumberUnit(fn.arguments.shift(), ["", "%"])
    if (!isPercentRange(lightness)) {
        valid = false
    }
    const alpha = parseAlphaArgument(fn.arguments, ["/", ","])

    if (
        valid &&
        lightness &&
        lightness.valid &&
        (!alpha || alpha.valid) &&
        fn.arguments.length === 0
    ) {
        return {
            valid: true,
            rawName: fn.rawName,
            lightness,
            alpha,
        }
    }

    return {
        valid: false,
        rawName: fn.rawName,
        lightness,
        alpha,
        extraArgs: fn.arguments,
    }
}
