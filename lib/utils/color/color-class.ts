import type { Colord } from "./colord"

export abstract class AbsColor {
    private colordCache?: Colord | null

    public toHex(
        format?: "RGB" | "RRGGBB" | "default" | null | undefined,
    ): string | null {
        if (!this.isComplete()) {
            return null
        }
        const hex = this.toHexImpl()
        if (hex == null) {
            return null
        }
        return format === "RGB"
            ? toHexRGB(hex)
            : format === "RRGGBB"
            ? toHexRRGGBB(hex)
            : hex
    }

    public toName(): string | null {
        if (!this.isComplete()) {
            return null
        }
        return this.toNameImpl() ?? null
    }

    public abstract isComplete(): boolean

    public abstract getAlpha(): number | null

    public abstract removeAlpha(): AbsColor

    public abstract toColorString(): string

    protected abstract newColord(): Colord | null

    protected toHexImpl(): string | undefined | null {
        return this.getColord()?.toHex()
    }

    protected toNameImpl(): string | undefined | null {
        return this.getColord()?.toName()
    }

    protected getColord(): Colord | null {
        return this.colordCache !== undefined
            ? this.colordCache
            : (this.colordCache = this.newColord())
    }
}

/**
 * Convert to RGB format.
 */
function toHexRGB(hex: string): string | null {
    if (hex.length === 7 || hex.length === 9) {
        const [, r1, r2, g1, g2, b1, b2, a1, a2] = hex
        if (
            equalsIgnoreCase(r1, r2) &&
            equalsIgnoreCase(g1, g2) &&
            equalsIgnoreCase(b1, b2) &&
            equalsIgnoreCase(a1, a2)
        ) {
            return `#${r1}${g1}${b1}${a1 ?? ""}`
        }
        return null
    }
    return hex
}

/**
 * Convert to RRGGBB format.
 */
function toHexRRGGBB(hex: string): string {
    if (hex.length === 4 || hex.length === 5) {
        const [, r, g, b, a] = hex
        return `#${r}${r}${g}${g}${b}${b}${a == null ? "" : `${a}${a}`}`
    }
    return hex
}

/**
 * Checks whether given strings are equals.
 */
function equalsIgnoreCase(s1: string | undefined, s2: string | undefined) {
    return s1?.toLowerCase() === s2?.toLowerCase()
}
