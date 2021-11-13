import type { Colord } from "./colord"
import { parseColord } from "./colord"
import postcssValueParser from "postcss-value-parser"
import type { HexData } from "./hex"
import { toHexRRGGBB, isHex, parseHex, toHexRGB } from "./hex"
import type { GrayData, InvalidGrayData } from "./gray"
import { parseGray } from "./gray"
import type { InvalidLabData, LabData } from "./lab"
import { parseLab } from "./lab"
import type { HwbData, InvalidHwbData } from "./hwb"
import { parseHwb } from "./hwb"
import type { InvalidRgbData, RgbData } from "./rgb"
import { parseRgb } from "./rgb"
import { parseInput } from "./parser"
import type { HslData, InvalidHslData } from "./hsl"
import { parseHsl } from "./hsl"
import type { NumberWithUnit, NumberWithUnitWithComma } from "./data"
import type { InvalidLchData, LchData } from "./lch"
import { parseLch } from "./lch"

abstract class AbsColor {
    protected colord?: Colord

    public toHex(
        format?: "RGB" | "RRGGBB" | "default" | null | undefined,
    ): string | null {
        if (!this.isValid()) {
            return null
        }
        const hex = this.toHexImpl()
        if (hex == null) {
            return hex
        }
        return format === "RGB"
            ? toHexRGB(hex)
            : format === "RRGGBB"
            ? toHexRRGGBB(hex)
            : hex
    }

    public toName(): string | null {
        if (!this.isValid()) {
            return null
        }
        return this.getColord().toName() ?? null
    }

    public abstract isValid(): boolean

    public abstract getAlpha(): number | null

    public abstract removeAlpha(): Color

    public abstract toColorString(): string

    protected toHexImpl() {
        return this.getColord().toHex()
    }

    protected getColord(): Colord {
        return (
            this.colord ??
            (this.colord =
                this.newColord() || parseColord(this.toColorString()))
        )
    }

    protected newColord(): Colord | null {
        return parseColord(this.toColorString())
    }
}
class InvalidColor extends AbsColor {
    public readonly input: string

    public constructor(input: string) {
        super()
        this.input = input
    }

    public readonly type = "invalid"

    public isValid() {
        return false
    }

    public getAlpha() {
        return null
    }

    public removeAlpha() {
        return this
    }

    public toColorString() {
        return this.input
    }
}

class ColorForColord extends AbsColor {
    public readonly input: string

    public constructor(input: string) {
        super()
        this.input = input
    }

    public readonly type = "unknown"

    public isValid() {
        return this.getColord().isValid()
    }

    public getAlpha() {
        return this.getColord().alpha()
    }

    public removeAlpha() {
        return this
    }

    public toColorString() {
        return this.input
    }
}

class ColorFromHex extends AbsColor {
    private readonly hex: HexData

    public constructor(hex: HexData) {
        super()
        this.hex = hex
    }

    public readonly type = "hex"

    public getRgb() {
        return {
            r: this.parseColor(this.hex.r),
            g: this.parseColor(this.hex.g),
            b: this.parseColor(this.hex.b),
        }
    }

    public isValid() {
        return true
    }

    public getAlpha() {
        if (!this.hex.alpha) {
            return null
        }
        return this.parseColor(this.hex.alpha)
    }

    public removeAlpha(): Color {
        if (!this.hex.alpha) {
            return this
        }
        return new ColorFromHex({
            ...this.hex,
            alpha: undefined,
        })
    }

    public toColorString() {
        return `#${this.hex.r}${this.hex.g}${this.hex.b}${this.hex.alpha || ""}`
    }

    protected toHexImpl(): string {
        return this.toColorString()
    }

    private parseColor(hex: string) {
        const v = parseInt(hex, 16)
        if (hex.length === 1) {
            return v / 15
        }
        return v / 255
    }

    protected newColord() {
        const rgb = this.getRgb()
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
}

class ColorFromRgb extends AbsColor {
    private readonly rgb: RgbData | InvalidRgbData

    public constructor(rgb: RgbData | InvalidRgbData) {
        super()
        this.rgb = rgb
    }

    public readonly type = "rgb"

    public getRgb() {
        return {
            r: this.parseColor(this.rgb.r),
            g: this.parseColor(this.rgb.g),
            b: this.parseColor(this.rgb.b),
        }
    }

    public isValid() {
        return this.rgb.valid && this.getColord().isValid()
    }

    public getAlpha() {
        return this.rgb.alpha?.value ?? null
    }

    public removeAlpha(): Color {
        return new ColorFromRgb({
            ...this.rgb,
            rawName: this.rgb.rawName.replace(/a$/iu, ""),
            alpha: null,
        })
    }

    public toColorString() {
        return `${this.rgb.rawName}(${this.rgb.r || ""}${this.rgb.g || ""}${
            this.rgb.b || ""
        }${this.rgb.alpha || ""}${(this.rgb.extraArgs || []).join("")})`
    }

    protected newColord() {
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
class ColorFromHsl extends AbsColor {
    private readonly hsl: HslData | InvalidHslData

    public constructor(hsl: HslData | InvalidHslData) {
        super()
        this.hsl = hsl
    }

    public readonly type = "hsl"

    public isValid() {
        return this.hsl.valid && this.getColord().isValid()
    }

    public getAlpha() {
        return this.hsl.alpha?.value ?? null
    }

    public removeAlpha(): Color {
        return new ColorFromHsl({
            ...this.hsl,
            rawName: this.hsl.rawName.replace(/a$/iu, ""),
            alpha: null,
        })
    }

    public toColorString() {
        return `${this.hsl.rawName}(${this.hsl.hue || ""}${
            this.hsl.saturation || ""
        }${this.hsl.lightness || ""}${this.hsl.alpha || ""}${(
            this.hsl.extraArgs || []
        ).join("")})`
    }
}
class ColorFromHwb extends AbsColor {
    private readonly hwb: HwbData | InvalidHwbData

    public constructor(hwb: HwbData | InvalidHwbData) {
        super()
        this.hwb = hwb
    }

    public readonly type = "hwb"

    public isValid() {
        return this.hwb.valid && this.getColord().isValid()
    }

    public getAlpha() {
        return this.hwb.alpha?.value ?? null
    }

    public removeAlpha(): Color {
        return new ColorFromHwb({
            ...this.hwb,
            alpha: null,
        })
    }

    public toColorString() {
        return `${this.hwb.rawName}(${this.hwb.hue || ""}${
            this.hwb.whiteness || ""
        }${this.hwb.blackness || ""}${this.hwb.alpha || ""}${(
            this.hwb.extraArgs || []
        ).join("")})`
    }
}

class ColorFromLab extends AbsColor {
    private readonly lab: LabData | InvalidLabData

    public constructor(lab: LabData | InvalidLabData) {
        super()
        this.lab = lab
    }

    public readonly type = "lab"

    public isValid() {
        return this.lab.valid && this.getColord().isValid()
    }

    public getAlpha() {
        return this.lab.alpha?.value ?? null
    }

    public removeAlpha(): Color {
        return new ColorFromLab({
            ...this.lab,
            alpha: null,
        })
    }

    public toColorString() {
        return `${this.lab.rawName}(${this.lab.lightness || ""}${
            this.lab.a || ""
        }${this.lab.b || ""}${this.lab.alpha || ""}${(
            this.lab.extraArgs || []
        ).join("")})`
    }
}
class ColorFromLch extends AbsColor {
    private readonly lch: LchData | InvalidLchData

    public constructor(lch: LchData | InvalidLchData) {
        super()
        this.lch = lch
    }

    public readonly type = "lch"

    public isValid() {
        return this.lch.valid && this.getColord().isValid()
    }

    public getAlpha() {
        return this.lch.alpha?.value ?? null
    }

    public removeAlpha(): Color {
        return new ColorFromLch({
            ...this.lch,
            alpha: null,
        })
    }

    public toColorString() {
        return `${this.lch.rawName}(${this.lch.lightness || ""}${
            this.lch.chroma || ""
        }${this.lch.hue || ""}${this.lch.alpha || ""}${(
            this.lch.extraArgs || []
        ).join("")})`
    }
}

class ColorFromGray extends AbsColor {
    private readonly gray: GrayData | InvalidGrayData

    public constructor(gray: GrayData | InvalidGrayData) {
        super()
        this.gray = gray
    }

    public readonly type = "gray"

    public isValid() {
        return this.gray.valid && this.getColord().isValid()
    }

    public getAlpha() {
        return this.gray.alpha?.value ?? null
    }

    public removeAlpha(): Color {
        return new ColorFromGray({
            ...this.gray,
            alpha: null,
        })
    }

    public toColorString() {
        return `${this.gray.rawName}(${this.gray.lightness || ""}${
            this.gray.alpha || ""
        }${(this.gray.extraArgs || []).join("")})`
    }
}

export type Color =
    | ColorFromHex
    | ColorFromRgb
    | ColorFromHsl
    | ColorFromHwb
    | ColorFromLab
    | ColorFromLch
    | ColorFromGray
    | ColorForColord
    | InvalidColor

/**
 * Parse color
 */
export function parseColor(input: postcssValueParser.Node | string): Color {
    const hex = parseHex(input)
    if (hex) {
        return new ColorFromHex(hex)
    }

    const node = parseInput(input)
    if (node) {
        const rgb = parseRgb(node)
        if (rgb) {
            return new ColorFromRgb(rgb)
        }
        const hsl = parseHsl(node)
        if (hsl) {
            return new ColorFromHsl(hsl)
        }
        const hwb = parseHwb(node)
        if (hwb) {
            return new ColorFromHwb(hwb)
        }
        const lab = parseLab(node)
        if (lab) {
            return new ColorFromLab(lab)
        }
        const lch = parseLch(node)
        if (lch) {
            return new ColorFromLch(lch)
        }
        const gray = parseGray(node)
        if (gray) {
            return new ColorFromGray(gray)
        }
    }
    return new ColorForColord(
        typeof input === "string" ? input : postcssValueParser.stringify(input),
    )
}
/**
 * Parse color from hex
 */
export function parseHexColor(hex: string): Color {
    if (!isHex(hex)) {
        return new InvalidColor(hex)
    }
    return parseColor(hex)
}
