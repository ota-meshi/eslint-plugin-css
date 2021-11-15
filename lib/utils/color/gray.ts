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
} from "./data"
import {
    isPercentRange,
    parseAlphaArgument,
    parseFunction,
    parseNumberUnit,
} from "./parser"

export class ColorFromGray extends AbsColor {
    private readonly gray: GrayData | InvalidGrayData

    public constructor(gray: GrayData | InvalidGrayData) {
        super()
        this.gray = gray
    }

    public readonly type = "gray"

    public isValid(): boolean {
        return (this.gray.valid && this.getColord()?.isValid()) || false
    }

    public getAlpha(): number | null {
        return this.gray.alpha?.value ?? null
    }

    public removeAlpha(): ColorFromGray {
        return new ColorFromGray({
            ...this.gray,
            alpha: null,
        })
    }

    public toColorString(): string {
        return `${this.gray.rawName}(${this.gray.lightness || ""}${
            this.gray.alpha || ""
        }${(this.gray.extraArgs || []).join("")})`
    }

    protected newColord(): Colord | null {
        const gray = this.gray
        if (gray.valid) {
            return parseColord({
                l: gray.lightness.value.number,
                a: 0,
                b: 0,
                alpha: gray.alpha?.value ?? undefined,
            })
        }
        return null
    }
}

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
