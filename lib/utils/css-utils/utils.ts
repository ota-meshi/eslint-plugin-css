import { isCamelCase, kebabCase } from "../casing"

/**
 * Checks whether given property name has vender prefix
 */
export function hasVendorPrefix(prop: string): boolean {
    return Boolean(getVendorPrefix(prop))
}

/**
 * Get the vender prefix from given property name
 */
export function getVendorPrefix(prop: string): string {
    return /^-\w+-/u.exec(prop)?.[0] || ""
}

/**
 * Strip the vender prefix
 */
export function stripVendorPrefix(prop: string): string {
    return prop.slice(getVendorPrefix(prop).length)
}

/**
 * Normalize property name
 */
export function normalizePropertyName(
    name: string,
    opt?: { keepVendorPrefix?: boolean },
): string {
    // https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/cssFloat
    if (name === "cssFloat") {
        return "float"
    }
    if (name.startsWith("--")) {
        return name
    }
    const normalized = isCamelCase(name) ? kebabCase(name) : name
    return opt?.keepVendorPrefix ? stripVendorPrefix(normalized) : normalized
}
