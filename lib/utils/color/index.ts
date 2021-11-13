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
        return this.toNameImpl()
    }

    public abstract isValid(): boolean

    public abstract getAlpha(): number | null

    public abstract removeAlpha(): Color

    public abstract toColorString(): string

    protected abstract toHexImpl(): string | null

    protected abstract toNameImpl(): string | null

    protected getColord(): Colord {
        return this.colord ?? (this.colord = parseColord(this.toColorString()))
    }
}
class InvalidColor extends AbsColor {
    public readonly input: string

    public constructor(input: string) {
        super()
        this.input = input
    }

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

    protected toHexImpl() {
        return null
    }

    protected toNameImpl() {
        return null
    }
}

class ColorForColord extends AbsColor {
    public readonly input: string

    public constructor(input: string) {
        super()
        this.input = input
    }

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

    protected toHexImpl() {
        return this.getColord().toHex()
    }

    protected toNameImpl() {
        return this.getColord().toName() ?? null
    }
}

class ColorFromHex extends AbsColor {
    private readonly hex: HexData

    public constructor(hex: HexData) {
        super()
        this.hex = hex
    }

    public isValid() {
        return true
    }

    public getAlpha() {
        if (!this.hex.alpha) {
            return null
        }
        const alpha = parseInt(this.hex.alpha, 16)
        if (this.hex.alpha.length === 1) {
            return alpha / 15
        }
        return alpha / 255
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
        return this.toHexImpl()
    }

    protected toHexImpl(): string {
        return `#${this.hex.r}${this.hex.g}${this.hex.b}${this.hex.alpha || ""}`
    }

    protected toNameImpl(): string | null {
        return this.getColord().toName() ?? null
    }
}

class ColorFromRgb extends AbsColor {
    private readonly rgb: RgbData | InvalidRgbData

    public constructor(rgb: RgbData | InvalidRgbData) {
        super()
        this.rgb = rgb
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

    protected toHexImpl(): string {
        return this.getColord().toHex()
    }

    protected toNameImpl(): string | null {
        return this.getColord().toName() ?? null
    }
}
class ColorFromHsl extends AbsColor {
    private readonly hsl: HslData | InvalidHslData

    public constructor(hsl: HslData | InvalidHslData) {
        super()
        this.hsl = hsl
    }

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

    protected toHexImpl(): string {
        return this.getColord().toHex()
    }

    protected toNameImpl(): string | null {
        return this.getColord().toName() ?? null
    }
}
class ColorFromHwb extends AbsColor {
    private readonly hwb: HwbData | InvalidHwbData

    public constructor(hwb: HwbData | InvalidHwbData) {
        super()
        this.hwb = hwb
    }

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

    protected toHexImpl(): string {
        return this.getColord().toHex()
    }

    protected toNameImpl(): string | null {
        return this.getColord().toName() ?? null
    }
}

class ColorFromLab extends AbsColor {
    private readonly lab: LabData | InvalidLabData

    public constructor(lab: LabData | InvalidLabData) {
        super()
        this.lab = lab
    }

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

    protected toHexImpl(): string {
        return this.getColord().toHex()
    }

    protected toNameImpl(): string | null {
        return this.getColord().toName() ?? null
    }
}

class ColorFromGray extends AbsColor {
    private readonly gray: GrayData | InvalidGrayData

    public constructor(gray: GrayData | InvalidGrayData) {
        super()
        this.gray = gray
    }

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

    protected toHexImpl(): string {
        return this.getColord().toHex()
    }

    protected toNameImpl(): string | null {
        return this.getColord().toName() ?? null
    }
}

export type Color =
    | ColorFromHex
    | ColorFromRgb
    | ColorFromHsl
    | ColorFromHwb
    | ColorFromLab
    | ColorFromGray
    | ColorForColord
    | InvalidColor
/**
 * Parse color
 */
export function parseColor(input: postcssValueParser.Node | string): Color {
    const text =
        typeof input === "string" ? input : postcssValueParser.stringify(input)
    const hex = parseHex(text)
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
        const gray = parseGray(node)
        if (gray) {
            return new ColorFromGray(gray)
        }
    }
    return new ColorForColord(text)
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
