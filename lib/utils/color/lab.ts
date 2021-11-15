import type { Colord } from "./colord"
import { parseColord } from "./colord"
import type postcssValueParser from "postcss-value-parser"
import { AbsColor } from "./color-class"
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

export class ColorFromLab extends AbsColor {
    private readonly lab: LabData | InvalidLabData

    public constructor(lab: LabData | InvalidLabData) {
        super()
        this.lab = lab
    }

    public readonly type = "lab"

    public isValid(): boolean {
        return (this.lab.valid && this.getColord()?.isValid()) || false
    }

    public getAlpha(): number | null {
        return this.lab.alpha?.value ?? null
    }

    public removeAlpha(): ColorFromLab {
        return new ColorFromLab({
            ...this.lab,
            alpha: null,
        })
    }

    public toColorString(): string {
        return `${this.lab.rawName}(${this.lab.lightness || ""}${
            this.lab.a || ""
        }${this.lab.b || ""}${this.lab.alpha || ""}${(
            this.lab.extraArgs || []
        ).join("")})`
    }

    protected newColord(): Colord | null {
        const lab = this.lab
        if (lab.valid) {
            return parseColord({
                l: lab.lightness.value.number,
                a: lab.a.value.number,
                b: lab.b.value.number,
                alpha: lab.alpha?.value ?? undefined,
            })
        }
        return null
    }
}

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
