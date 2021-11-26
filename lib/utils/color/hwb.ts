import type { Colord } from "colord"
import type postcssValueParser from "postcss-value-parser"
import { AbsColor } from "./color-class"
import { parseColord } from "./colord"
import type { Unit } from "./data"
import type {
    AlphaArgument,
    AlphaArgumentValid,
    FunctionArgument,
    NumberWithUnit,
    ValuesArgument,
    ValuesArgumentComplete,
} from "./parser"
import {
    parseNumberUnit,
    isPercentRange,
    parseArgumentValues,
    parseFunction,
} from "./parser"

export class ColorFromHwb extends AbsColor {
    private readonly hwb: HwbData | IncompleteHwbData

    public constructor(hwb: HwbData | IncompleteHwbData) {
        super()
        this.hwb = hwb
    }

    public readonly type = "hwb"

    public isComplete(): boolean {
        return (this.hwb.complete && this.getColord()?.isValid()) || false
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
        return `${this.hwb.rawName}(${this.hwb.hwb}${this.hwb.alpha || ""}${(
            this.hwb.extraArgs || []
        ).join("")})`
    }

    protected newColord(): Colord | null {
        const hwb = this.hwb
        if (hwb.complete) {
            return parseColord(
                `hwb(${numberWithUnitToString(
                    hwb.hwb.value.hue,
                )} ${numberWithUnitToString(
                    hwb.hwb.value.whiteness,
                )} ${numberWithUnitToString(hwb.hwb.value.blackness)}${
                    hwb.alpha ? ` / ${hwb.alpha.toAlphaString()}` : ""
                })`,
            )
        }
        return null
    }
}

/** NumberWithUnit to string */
function numberWithUnitToString(nu: NumberWithUnit<Unit>) {
    return `${nu.number}${nu.unit}`
}

export type HwbValue = {
    hue: NumberWithUnit<"" | "deg" | "rad" | "grad" | "turn">
    whiteness: NumberWithUnit<"%">
    blackness: NumberWithUnit<"%">
}

export type HwbData = {
    complete: true
    rawName: string
    hwb: ValuesArgumentComplete<HwbValue>
    alpha: AlphaArgumentValid | null
    extraArgs?: undefined
}
export type IncompleteHwbData = {
    complete: false
    rawName: string
    hwb: ValuesArgument<HwbValue>
    alpha: AlphaArgument | null
    extraArgs: FunctionArgument[]
}

/**
 * Parses a LAB CSS color function/string
 */
export function parseHwb(
    input: string | postcssValueParser.Node,
): HwbData | IncompleteHwbData | null {
    const fn = parseFunction(input, "hwb")
    if (fn == null) {
        return null
    }

    const values = parseArgumentValues(fn.arguments, {
        argCount: 3,
        generate: (tokens): HwbValue | null => {
            if (tokens.length !== 3) {
                return null
            }
            const hue = parseNumberUnit(tokens[0], [
                "",
                "deg",
                "rad",
                "grad",
                "turn",
            ])
            const whiteness = parseNumberUnit(tokens[1], ["%"])
            const blackness = parseNumberUnit(tokens[2], ["%"])
            if (
                !hue ||
                !isPercentRange(whiteness) ||
                !isPercentRange(blackness)
            ) {
                return null
            }

            return {
                hue,
                whiteness,
                blackness,
            }
        },
    })

    const hwb = values.values
    const alpha = values.alpha

    if (hwb.complete && (!alpha || alpha.valid) && fn.arguments.length === 0) {
        return {
            complete: true,
            rawName: fn.rawName,
            hwb,
            alpha,
        }
    }

    return {
        complete: false,
        rawName: fn.rawName,
        hwb,
        alpha,
        extraArgs: fn.arguments,
    }
}
