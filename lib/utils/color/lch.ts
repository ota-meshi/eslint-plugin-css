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

export type LchData = {
    valid: true
    rawName: string
    lightness: NumberWithUnitValid<"%">
    chroma: NumberWithUnitValid<"">
    hue: NumberWithUnitValid<"" | "deg" | "rad" | "grad" | "turn">
    alpha: AlphaArgumentValid | null
    extraArgs?: undefined
}

export type InvalidLchData = {
    valid: false
    rawName: string
    lightness: NumberWithUnit<"%"> | null
    chroma: NumberWithUnit<""> | null
    hue: NumberWithUnit<"" | "deg" | "rad" | "grad" | "turn"> | null
    alpha: AlphaArgument | null
    extraArgs: FunctionArgument[]
}

/**
 * Parses a LCH CSS color function/string
 */
export function parseLch(
    input: string | postcssValueParser.Node,
): LchData | InvalidLchData | null {
    const fn = parseFunction(input, "lch")
    if (fn == null) {
        return null
    }

    let valid = true

    const lightness = parseNumberUnit(fn.arguments.shift(), ["%"])
    if (!isPercentRange(lightness)) {
        valid = false
    }
    const chroma = parseNumberUnit(fn.arguments.shift(), [""])
    const hue = parseNumberUnit(fn.arguments.shift(), [
        "",
        "deg",
        "rad",
        "grad",
        "turn",
    ])

    const alpha = parseAlphaArgument(fn.arguments, ["/"])

    if (
        valid &&
        lightness &&
        lightness.valid &&
        chroma &&
        chroma.valid &&
        hue &&
        hue.valid &&
        (!alpha || alpha.valid) &&
        fn.arguments.length === 0
    ) {
        return {
            valid: true,
            rawName: fn.rawName,
            lightness,
            chroma,
            hue,
            alpha,
        }
    }

    return {
        valid: false,
        rawName: fn.rawName,
        lightness,
        chroma,
        hue,
        alpha,
        extraArgs: fn.arguments,
    }
}
