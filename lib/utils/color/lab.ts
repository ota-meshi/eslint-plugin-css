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

    const values = parseArgumentValuesWithSpace(fn.arguments, {
        units1: ["%"],
        units2: [""],
        units3: [""],
    })

    const lightness = values?.value1 ?? null
    if (!isPercentRange(lightness)) {
        valid = false
    }
    const a = values?.value2 ?? null
    const b = values?.value3 ?? null
    const alpha = values?.alpha ?? null

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
