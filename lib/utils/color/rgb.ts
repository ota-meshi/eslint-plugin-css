import type { Colord } from "./colord"
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

export class ColorFromRgb extends AbsColor {
    private readonly rgb: RgbData | InvalidRgbData

    public constructor(rgb: RgbData | InvalidRgbData) {
        super()
        this.rgb = rgb
    }

    public readonly type = "rgb"

    public getRgb(): { r: number | null; g: number | null; b: number | null } {
        return {
            r: this.parseColor(this.rgb.r),
            g: this.parseColor(this.rgb.g),
            b: this.parseColor(this.rgb.b),
        }
    }

    public isValid(): boolean {
        return (this.rgb.valid && this.getColord()?.isValid()) || false
    }

    public getAlpha(): number | null {
        return this.rgb.alpha?.value ?? null
    }

    public removeAlpha(): ColorFromRgb {
        return new ColorFromRgb({
            ...this.rgb,
            rawName: this.rgb.rawName.replace(/a$/iu, ""),
            alpha: null,
        })
    }

    public toColorString(): string {
        return `${this.rgb.rawName}(${this.rgb.r || ""}${this.rgb.g || ""}${
            this.rgb.b || ""
        }${this.rgb.alpha || ""}${(this.rgb.extraArgs || []).join("")})`
    }

    protected newColord(): Colord | null {
        const rgb = this.getRgb()
        if (rgb.r != null && rgb.g != null && rgb.b != null) {
            const base = {
                r: rgb.r * 255,
                g: rgb.g * 255,
                b: rgb.b * 255,
            }
            const alpha = this.getAlpha()
            return alpha == null
                ? parseColord(base)
                : parseColord({
                      ...base,
                      a: alpha,
                  })
        }
        return null
    }

    private parseColor(
        value?:
            | NumberWithUnit<"" | "%">
            | NumberWithUnitWithComma<"" | "%">
            | null,
    ) {
        if (!value || !value.valid) {
            return null
        }
        const v = value.value
        const num = v.unit === "%" ? v.number / 100 : v.number / 255
        if (0 <= num && num <= 1) {
            return num
        }
        return null
    }
}

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

    const values = parseArgumentValues(fn.arguments, {
        units1: ["", "%"],
        units2: ["", "%"],
        units3: ["", "%"],
    })
    const r = values?.value1 ?? null
    const g = values?.value2 ?? null
    const b = values?.value3 ?? null
    if (!isValidColor(r) || !isValidColor(g) || !isValidColor(b)) {
        valid = false
    }
    const alpha = values?.alpha ?? null
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
        if (!g.withComma && !b.withComma) {
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
        if (g.withComma && b.withComma) {
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
