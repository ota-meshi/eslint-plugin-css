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
    parseArgumentValuesWithSpace,
    parseFunction,
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

    const values = parseArgumentValuesWithSpace(fn.arguments, {
        units1: ["%"],
        units2: [""],
        units3: ["", "deg", "rad", "grad", "turn"],
    })
    const lightness = values?.value1 ?? null
    if (!isPercentRange(lightness)) {
        valid = false
    }
    const chroma = values?.value2 ?? null
    const hue = values?.value3 ?? null
    const alpha = values?.alpha ?? null

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
