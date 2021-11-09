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
