/**
 * Checks whether given string is hex.
 */
export function isHex(str: string): boolean {
    return /^#[\da-f]+$/iu.test(str)
}

/**
 * Convert to RGB format if possible.
 */
export function toHexRGB(hex: string): string {
    if (!isHex(hex)) {
        return hex
    }
    if (hex.length === 7 || hex.length === 9) {
        const [hash, r1, r2, g1, g2, b1, b2, a1, a2] = hex
        if (
            equalsIgnoreCase(r1, r2) &&
            equalsIgnoreCase(g1, g2) &&
            equalsIgnoreCase(b1, b2) &&
            equalsIgnoreCase(a1, a2)
        ) {
            return `${hash}${r1}${g1}${b1}${a1 ?? ""}`
        }
    }
    return hex
}

/**
 * Convert to RRGGBB format if possible.
 */
export function toHexRRGGBB(hex: string): string {
    if (!isHex(hex)) {
        return hex
    }
    if (hex.length === 4 || hex.length === 5) {
        const [hash, r, g, b, a] = hex
        return `${hash}${r}${r}${g}${g}${b}${b}${a == null ? "" : `${a}${a}`}`
    }
    return hex
}

/**
 * Checks whether given strings are equals.
 */
function equalsIgnoreCase(s1: string | undefined, s2: string | undefined) {
    return s1?.toLowerCase() === s2?.toLowerCase()
}
