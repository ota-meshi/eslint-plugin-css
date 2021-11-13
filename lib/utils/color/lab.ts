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

export type LabData = {
    valid: true
    rawName: string
    lightness: NumberWithUnitValid<"%">
    a: NumberWithUnitValid<"">
    b: NumberWithUnitValid<"">
    alpha: AlphaArgumentValid | null
    extraArgs?: undefined
}

export type InvalidLabData = {
    valid: false
    rawName: string
    lightness: NumberWithUnit<"%"> | null
    a: NumberWithUnit<""> | null
    b: NumberWithUnit<""> | null
    alpha: AlphaArgument | null
    extraArgs: FunctionArgument[]
}

/**
 * Parses a LAB CSS color function/string
 */
export function parseLab(
    input: string | postcssValueParser.Node,
): LabData | InvalidLabData | null {
    const fn = parseFunction(input, "lab")
    if (fn == null) {
        return null
    }

    let valid = true

    const lightness = parseNumberUnit(fn.arguments.shift(), ["%"])
    if (!isPercentRange(lightness)) {
        valid = false
    }
    const a = parseNumberUnit(fn.arguments.shift(), [""])
    const b = parseNumberUnit(fn.arguments.shift(), [""])

    const alpha = parseAlphaArgument(fn.arguments, ["/"])

    if (
        valid &&
        lightness &&
        lightness.valid &&
        a &&
        a.valid &&
        b &&
        b.valid &&
        (!alpha || alpha.valid) &&
        fn.arguments.length === 0
    ) {
        return {
            valid: true,
            rawName: fn.rawName,
            lightness,
            a,
            b,
            alpha,
        }
    }

    return {
        valid: false,
        rawName: fn.rawName,
        lightness,
        a,
        b,
        alpha,
        extraArgs: fn.arguments,
    }
}
