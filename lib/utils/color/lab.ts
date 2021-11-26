import type { Colord } from "./colord"
import { parseColord } from "./colord"
import type postcssValueParser from "postcss-value-parser"
import { AbsColor } from "./color-class"

import type {
    AlphaArgument,
    AlphaArgumentValid,
    FunctionArgument,
    NumberWithUnit,
    ValuesArgument,
    ValuesArgumentComplete,
} from "./parser"
import {
    isPercentRange,
    parseArgumentValuesWithSpace,
    parseFunction,
    parseNumberUnit,
} from "./parser"

export class ColorFromLab extends AbsColor {
    private readonly lab: LabData | IncompleteLabData

    public constructor(lab: LabData | IncompleteLabData) {
        super()
        this.lab = lab
    }

    public readonly type = "lab"

    public isComplete(): boolean {
        return (this.lab.complete && this.getColord()?.isValid()) || false
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
        return `${this.lab.rawName}(${this.lab.lab}${this.lab.alpha || ""}${(
            this.lab.extraArgs || []
        ).join("")})`
    }

    protected newColord(): Colord | null {
        const lab = this.lab
        if (lab.complete) {
            return parseColord({
                l: lab.lab.value.lightness.number,
                a: lab.lab.value.a.number,
                b: lab.lab.value.b.number,
                alpha: lab.alpha?.value ?? undefined,
            })
        }
        return null
    }
}

export type LabValue = {
    lightness: NumberWithUnit<"%">
    a: NumberWithUnit<"">
    b: NumberWithUnit<"">
}

export type LabData = {
    complete: true
    rawName: string
    lab: ValuesArgumentComplete<LabValue>
    alpha: AlphaArgumentValid | null
    extraArgs?: undefined
}

export type IncompleteLabData = {
    complete: false
    rawName: string
    lab: ValuesArgument<LabValue>
    alpha: AlphaArgument | null
    extraArgs: FunctionArgument[]
}

/**
 * Parses a LAB CSS color function/string
 */
export function parseLab(
    input: string | postcssValueParser.Node,
): LabData | IncompleteLabData | null {
    const fn = parseFunction(input, "lab")
    if (fn == null) {
        return null
    }

    const values = parseArgumentValuesWithSpace(fn.arguments, {
        generate: (tokens): LabValue | null => {
            if (tokens.length !== 3) {
                return null
            }
            const lightness = parseNumberUnit(tokens[0], ["%"])
            if (!isPercentRange(lightness)) {
                return null
            }
            const a = parseNumberUnit(tokens[1], [""])
            const b = parseNumberUnit(tokens[2], [""])
            if (!a || !b) {
                return null
            }

            return {
                lightness,
                a,
                b,
            }
        },
    })

    const lab = values.values
    const alpha = values.alpha

    if (lab.complete && (!alpha || alpha.valid) && fn.arguments.length === 0) {
        return {
            complete: true,
            rawName: fn.rawName,
            lab,
            alpha,
        }
    }

    return {
        complete: false,
        rawName: fn.rawName,
        lab,
        alpha,
        extraArgs: fn.arguments,
    }
}
