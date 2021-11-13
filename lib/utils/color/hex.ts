import type postcssValueParser from "postcss-value-parser"
/**
 * Checks whether given string is hex.
 */
export function isHex(str: string): boolean {
    return /^#[\da-f]+$/iu.test(str)
}

export type HexData = {
    readonly kind: "RGB" | "RRGGBB"
    readonly r: string
    readonly g: string
    readonly b: string
    readonly alpha?: string
}

/**
 * Checks whether given string is hex.
 */
export function parseHex(
    input: string | postcssValueParser.Node,
): HexData | null {
    const hex =
        typeof input === "string"
            ? input
            : input.type === "word"
            ? input.value
            : ""
    if (!isHex(hex)) {
        return null
    }
    if (hex.length === 4 || hex.length === 5) {
        const [, r, g, b, alpha] = hex
        return { kind: "RGB", r, g, b, alpha }
    }
    if (hex.length === 7 || hex.length === 9) {
        const [, r1, r2, g1, g2, b1, b2, ...alpha] = hex
        return {
            kind: "RRGGBB",
            r: r1 + r2,
            g: g1 + g2,
            b: b1 + b2,
            alpha: alpha.length ? alpha.join("") : undefined,
        }
    }
    return null
}
/**
 * Hex Data to string
 */
export function hexDataToString(hex: HexData & { valid: true }): string {
    const { r, g, b, alpha } = hex
    return `#${r}${g}${b}${alpha == null ? "" : `${alpha}`}`
}

/**
 * Convert to RGB format.
 */
export function toHexRGB(hex: string): string | null {
    const data = parseHex(hex)
    if (data) {
        if (data.kind === "RRGGBB") {
            const [r1, r2] = data.r
            const [g1, g2] = data.g
            const [b1, b2] = data.b
            const [a1, a2] = data.alpha ?? ""
            if (
                equalsIgnoreCase(r1, r2) &&
                equalsIgnoreCase(g1, g2) &&
                equalsIgnoreCase(b1, b2) &&
                equalsIgnoreCase(a1, a2)
            ) {
                return `#${r1}${g1}${b1}${a1 ?? ""}`
            }
        } else {
            return `#${data.r}${data.g}${data.b}${data.alpha ?? ""}`
        }
    }
    return null
}

/**
 * Convert to RRGGBB format.
 */
export function toHexRRGGBB(hex: string): string | null {
    const data = parseHex(hex)
    if (data) {
        if (data.kind === "RGB") {
            const { r, g, b, alpha } = data
            return `#${r}${r}${g}${g}${b}${b}${
                alpha == null ? "" : `${alpha}${alpha}`
            }`
        }
        return `#${data.r}${data.g}${data.b}${data.alpha ?? ""}`
    }
    return null
}

/**
 * Checks whether given strings are equals.
 */
function equalsIgnoreCase(s1: string | undefined, s2: string | undefined) {
    return s1?.toLowerCase() === s2?.toLowerCase()
}
