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

export class ColorFromHsl extends AbsColor {
    private readonly hsl: HslData | InvalidHslData

    public constructor(hsl: HslData | InvalidHslData) {
        super()
        this.hsl = hsl
    }

    public readonly type = "hsl"

    public isValid(): boolean {
        return (this.hsl.valid && this.getColord()?.isValid()) || false
    }

    public getAlpha(): number | null {
        return this.hsl.alpha?.value ?? null
    }

    public removeAlpha(): ColorFromHsl {
        return new ColorFromHsl({
            ...this.hsl,
            rawName: this.hsl.rawName.replace(/a$/iu, ""),
            alpha: null,
        })
    }

    public toColorString(): string {
        return `${this.hsl.rawName}(${this.hsl.hue || ""}${
            this.hsl.saturation || ""
        }${this.hsl.lightness || ""}${this.hsl.alpha || ""}${(
            this.hsl.extraArgs || []
        ).join("")})`
    }

    protected newColord(): Colord {
        return parseColord(this.toColorString())
    }
}
export type BaseHslDataValid = {
    valid: true
    rawName: string
    hue: NumberWithUnitValid<"" | "deg" | "rad" | "grad" | "turn">
    saturation: NumberWithUnitValid<"%"> | NumberWithUnitWithCommaValid<"%">
    lightness: NumberWithUnitValid<"%"> | NumberWithUnitWithCommaValid<"%">
    alpha: AlphaArgumentValid | null
    extraArgs?: undefined
}
export type HslDataStandard = BaseHslDataValid & {
    type: "standard"
    saturation: NumberWithUnitValid<"%">
    lightness: NumberWithUnitValid<"%">
}
export type HslDataWithComma = BaseHslDataValid & {
    type: "with-comma"
    saturation: NumberWithUnitWithCommaValid<"%">
    lightness: NumberWithUnitWithCommaValid<"%">
}
export type HslData = HslDataStandard | HslDataWithComma

export type InvalidHslData = {
    valid: false
    rawName: string
    hue: NumberWithUnit<"" | "deg" | "rad" | "grad" | "turn"> | null
    saturation: NumberWithUnit<"%"> | NumberWithUnitWithComma<"%"> | null
    lightness: NumberWithUnit<"%"> | NumberWithUnitWithComma<"%"> | null
    alpha: AlphaArgument | null
    extraArgs: FunctionArgument[]
}

/**
 * Parses a HSL CSS color function/string
 */
export function parseHsl(
    input: string | postcssValueParser.Node,
): HslData | InvalidHslData | null {
    const fn = parseFunction(input, ["hsl", "hsla"])
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
    const saturation = values?.value2 ?? null
    const lightness = values?.value3 ?? null
    if (!isPercentRange(saturation) || !isPercentRange(lightness)) {
        valid = false
    }
    const alpha = values?.alpha ?? null

    if (
        valid &&
        hue &&
        hue.valid &&
        saturation &&
        saturation.valid &&
        lightness &&
        lightness.valid &&
        (!alpha || alpha.valid) &&
        fn.arguments.length === 0
    ) {
        if (!saturation.withComma && !lightness.withComma) {
            return {
                valid: true,
                rawName: fn.rawName,
                type: "standard",
                hue,
                saturation,
                lightness,
                alpha,
            }
        }
        if (saturation.withComma && lightness.withComma) {
            return {
                valid: true,
                rawName: fn.rawName,
                type: "with-comma",
                hue,
                saturation,
                lightness,
                alpha,
            }
        }
    }

    return {
        valid: false,
        rawName: fn.rawName,
        hue,
        saturation,
        lightness,
        alpha,
        extraArgs: fn.arguments,
    }
}
