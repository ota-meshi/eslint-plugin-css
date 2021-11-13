import { colord, extend, Colord } from "colord"

import namesPlugin from "colord/plugins/names"
import hwbPlugin from "colord/plugins/hwb"
import labPlugin from "colord/plugins/lab"
import lchPlugin from "colord/plugins/lch"
import { parseLab } from "./lab"
import { parseHwb } from "./hwb"
import { parseGray } from "./gray"

extend([
    namesPlugin,
    hwbPlugin,
    labPlugin,
    lchPlugin,
    // lab string parser
    (_colordClass, parsers): void => {
        parsers.string.push([parseLabString, "lab" as never])
    },
    // hwb with comma
    (_colordClass, parsers): void => {
        parsers.string.push([
            parseHwbWithCommaString,
            "hwb-with-comma" as never,
        ])
    },
    // gray plugin
    (_colordClass, parsers): void => {
        parsers.string.push([parseGrayString, "gray" as never])
    },
])

export { Colord }

/**
 * Get Colord instance from given color
 */
export function parseColord(input: string): Colord {
    const colordInstance = colord(input)
    return colordInstance
}

/**
 * Parses a valid LAB CSS color function/string
 */
function parseLabString(
    input: string,
): { r: number; g: number; b: number; a: number } | null {
    const parsed = parseLab(input)

    if (!parsed || !parsed.valid) return null

    const colordInstance = colord({
        l: parsed.lightness.value.number,
        a: parsed.a.value.number,
        b: parsed.b.value.number,
        alpha: parsed.alpha?.value ?? undefined,
    })

    return colordInstance.rgba
}

/**
 * Parses a valid HWB[A] with comma CSS color function/string
 * https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hwb()#syntax
 */
function parseHwbWithCommaString(
    input: string,
): { r: number; g: number; b: number; a: number } | null {
    const parsed = parseHwb(input)

    if (!parsed || !parsed.valid || parsed.type !== "with-comma") return null

    const colordInstance = colord(
        `hwb(${
            parsed.hue
        } ${parsed.whiteness.withoutComma()} ${parsed.blackness.withoutComma()}${
            parsed.alpha ? ` / ${parsed.alpha.toAlphaNString()}` : ""
        })`,
    )

    return colordInstance.rgba
}

/**
 * Parses a valid gray() CSS color function/string
 */
function parseGrayString(
    input: string,
): { r: number; g: number; b: number; a: number } | null {
    const parsed = parseGray(input)

    if (!parsed || !parsed.valid) return null

    const colordInstance = colord({
        l: parsed.lightness.value.number,
        a: 0,
        b: 0,
        alpha: parsed.alpha?.value ?? undefined,
    })

    return colordInstance.rgba
}
