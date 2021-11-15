import type { Colord } from "colord"
import type postcssValueParser from "postcss-value-parser"
import { AbsColor } from "./color-class"
import { parseColord } from "./colord"
import type {
    AlphaArgument,
    AlphaArgumentValid,
    FunctionArgument,
    NumberWithUnit,
    NumberWithUnitValid,
    NumberWithUnitWithComma,
    NumberWithUnitWithCommaValid,
} from "./data"
import { isPercentRange, parseArgumentValues, parseFunction } from "./parser"

export class ColorFromHwb extends AbsColor {
    private readonly hwb: HwbData | InvalidHwbData

    public constructor(hwb: HwbData | InvalidHwbData) {
        super()
        this.hwb = hwb
    }

    public readonly type = "hwb"

    public isValid(): boolean {
        return (this.hwb.valid && this.getColord()?.isValid()) || false
    }

    public getAlpha(): number | null {
        return this.hwb.alpha?.value ?? null
    }

    public removeAlpha(): ColorFromHwb {
        return new ColorFromHwb({
            ...this.hwb,
            alpha: null,
        })
    }

    public toColorString(): string {
        return `${this.hwb.rawName}(${this.hwb.hue || ""}${
            this.hwb.whiteness || ""
        }${this.hwb.blackness || ""}${this.hwb.alpha || ""}${(
            this.hwb.extraArgs || []
        ).join("")})`
    }

    protected newColord(): Colord | null {
        const hwb = this.hwb
        if (hwb.valid) {
            return parseColord(
                `hwb(${hwb.hue} ${
                    hwb.whiteness.withComma
                        ? hwb.whiteness.withoutComma()
                        : hwb.whiteness
                } ${
                    hwb.blackness.withComma
                        ? hwb.blackness.withoutComma()
                        : hwb.blackness
                }${hwb.alpha ? ` / ${hwb.alpha.toAlphaNString()}` : ""})`,
            )
        }
        return null
    }
}

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

    const values = parseArgumentValues(fn.arguments, {
        units1: ["", "deg", "rad", "grad", "turn"],
        units2: ["%"],
        units3: ["%"],
    })

    const hue = values?.value1 ?? null
    const whiteness = values?.value2 ?? null
    const blackness = values?.value3 ?? null
    if (!isPercentRange(whiteness) || !isPercentRange(blackness)) {
        valid = false
    }
    const alpha = values?.alpha ?? null

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
        if (!whiteness.withComma && !blackness.withComma) {
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
        if (whiteness.withComma && blackness.withComma) {
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
