import { colord, extend, Colord } from "colord"

import namesPlugin from "colord/plugins/names"
import hwbPlugin from "colord/plugins/hwb"
import labPlugin from "colord/plugins/lab"
import lchPlugin from "colord/plugins/lch"
import valueParser from "postcss-value-parser"

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
 * Get Colord instance from given color node
 */
export function validColord(node: valueParser.Node | string): Colord | null {
    const input = typeof node === "string" ? node : valueParser.stringify(node)
    const colordInstance = colord(input)

    return colordInstance?.isValid() ? colordInstance : null
}

const LAB_MATCHER =
    /^lab\(\s*(?<l>[+-]?(?:\d+(?:\.\d+)?|\.\d+))%\s+(?<a>[+-]?(?:\d+(?:\.\d+)?|\.\d+))\s+(?<b>[+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*(?:\/\s*(?<alpha>[+-]?(?:\d+(?:\.\d+)?|\.\d+))(?<alphaUnit>%)?\s*)?\)$/iu

/**
 * Parses a valid LAB CSS color function/string
 */
function parseLabString(
    input: string,
): { r: number; g: number; b: number; a: number } | null {
    const match = LAB_MATCHER.exec(input)

    if (!match) return null

    const colordInstance = colord({
        l: Number(match.groups!.l),
        a: Number(match.groups!.a),
        b: Number(match.groups!.b),
        alpha:
            match.groups!.alpha == null
                ? undefined
                : Number(match.groups!.alpha) /
                  (match.groups!.alphaUnit ? 100 : 1),
    })

    return colordInstance.rgba
}

const HWB_WITH_COMMA_MATCHER =
    /^hwb\(\s*(?<h>[+-]?(?:\d+(?:\.\d+)?|\.\d+))(?<hUnit>deg|grad|rad|turn)?\s*,\s*(?<w>[+-]?(?:\d+(?:\.\d+)?|\.\d+))%\s*,\s*(?<b>[+-]?(?:\d+(?:\.\d+)?|\.\d+))%\s*(?:,\s*(?<alpha>[+-]?(?:\d+(?:\.\d+)?|\.\d+))(?<alphaUnit>%)?\s*)?\)$/iu

/**
 * Parses a valid HWB[A] with comma CSS color function/string
 * https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hwb()#syntax
 */
function parseHwbWithCommaString(
    input: string,
): { r: number; g: number; b: number; a: number } | null {
    const match = HWB_WITH_COMMA_MATCHER.exec(input)

    if (!match) return null

    const colordInstance = colord(
        `hwb(${match.groups!.h}${match.groups!.hUnit} ${match.groups!.w} ${
            match.groups!.b
        }${
            match.groups!.alpha == null
                ? ""
                : ` / ${
                      Number(match.groups!.alpha) /
                      (match.groups!.alphaUnit ? 100 : 1)
                  }`
        })`,
    )

    return colordInstance.rgba
}

const GRAY_MATCHER =
    /^gray\(\s*(?<l>[+-]?(?:\d+(?:\.\d+)?|\.\d+))%?\s*(?:[,/]\s*(?<alpha>[+-]?(?:\d+(?:\.\d+)?|\.\d+))(?<alphaUnit>%)?\s*)?\)$/iu

/**
 * Parses a valid gray() CSS color function/string
 */
function parseGrayString(
    input: string,
): { r: number; g: number; b: number; a: number } | null {
    const match = GRAY_MATCHER.exec(input)

    if (!match) return null

    const lightness = Number(match.groups!.l)

    const colordInstance = colord({
        l: lightness,
        a: 0,
        b: 0,
        alpha:
            match.groups!.alpha == null
                ? undefined
                : Number(match.groups!.alpha) /
                  (match.groups!.alphaUnit ? 100 : 1),
    })

    return colordInstance.rgba
}
