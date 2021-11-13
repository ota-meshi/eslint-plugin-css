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

export type BaseHwbDataValid = {
    valid: true
    rawName: string
    hue: NumberWithUnitValid<"" | "deg" | "rad" | "grad" | "turn">
    whiteness: NumberWithUnitValid<"%"> | NumberWithUnitWithCommaValid<"%">
    blackness: NumberWithUnitValid<"%"> | NumberWithUnitWithCommaValid<"%">
    alpha: AlphaArgumentValid | null
    extraArgs?: undefined
}
export type HwbDataStandard = BaseHwbDataValid & {
    type: "standard"
    whiteness: NumberWithUnitValid<"%">
    blackness: NumberWithUnitValid<"%">
}
export type HwbDataWithComma = BaseHwbDataValid & {
    type: "with-comma" // e.g. hwb(194, 0%, 0%, .5)  https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hwb()#syntax
    whiteness: NumberWithUnitWithCommaValid<"%">
    blackness: NumberWithUnitWithCommaValid<"%">
}
export type HwbData = HwbDataStandard | HwbDataWithComma

export type InvalidHwbData = {
    valid: false
    rawName: string
    hue: NumberWithUnit<"" | "deg" | "rad" | "grad" | "turn"> | null
    whiteness: NumberWithUnit<"%"> | NumberWithUnitWithComma<"%"> | null
    blackness: NumberWithUnit<"%"> | NumberWithUnitWithComma<"%"> | null
    alpha: AlphaArgument | null
    extraArgs: FunctionArgument[]
}

/**
 * Parses a LAB CSS color function/string
 */
export function parseHwb(
    input: string | postcssValueParser.Node,
): HwbData | InvalidHwbData | null {
    const fn = parseFunction(input, "hwb")
    if (fn == null) {
        return null
    }

    let valid = true

    const hue = parseNumberUnit(fn.arguments.shift(), [
        "",
        "deg",
        "rad",
        "grad",
        "turn",
    ])
    const whiteness = parseMaybeNumberUnit(fn.arguments, ["%"])
    const blackness = parseMaybeNumberUnit(fn.arguments, ["%"])
    if (!isPercentRange(whiteness) || !isPercentRange(blackness)) {
        valid = false
    }

    const alpha = parseAlphaArgument(
        fn.arguments,
        whiteness?.withComma && blackness?.withComma ? ["/", ","] : ["/"],
    )

    if (
        valid &&
        hue &&
        hue.valid &&
        whiteness &&
        whiteness.valid &&
        blackness &&
        blackness.valid &&
        (!alpha || alpha.valid) &&
        fn.arguments.length === 0
    ) {
        if (
            !whiteness.withComma &&
            !blackness.withComma &&
            (!alpha || alpha.div === "/")
        ) {
            return {
                valid: true,
                rawName: fn.rawName,
                type: "standard",
                hue,
                whiteness,
                blackness,
                alpha,
            }
        }
        if (
            whiteness.withComma &&
            blackness.withComma &&
            (!alpha || alpha.div === ",")
        ) {
            return {
                valid: true,
                rawName: fn.rawName,
                type: "with-comma",
                hue,
                whiteness,
                blackness,
                alpha,
            }
        }

        if (whiteness.withComma !== blackness.withComma) {
            // mixed comma
            return null
        }
    }

    return {
        valid: false,
        rawName: fn.rawName,
        hue,
        whiteness,
        blackness,
        alpha,
        extraArgs: fn.arguments,
    }
}
