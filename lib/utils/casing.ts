/**
 * Checks whether the given string has symbols.
 * @param {string} str
 */
function hasSymbols(str: string) {
    return /[!"#%&'()*+,./:;<=>?@[\\\]^`{|}]/u.exec(str) // without " ", "$", "-" and "_"
}

/**
 * Checks whether the given string has upper.
 * @param {string} str
 */
function hasUpper(str: string) {
    return /[A-Z]/u.exec(str)
}

/**
 * Convert text to kebab-case
 * @param {string} str Text to be converted
 * @return {string}
 */
export function kebabCase(str: string): string {
    return str.replace(/\B(?<c>[A-Z])/gu, "-$<c>").toLowerCase()
}

/**
 * Checks whether the given string is kebab-case.
 * @param {string} str
 */
export function isKebabCase(str: string): boolean {
    if (hasUpper(str) || hasSymbols(str) || /_|--|\s/u.test(str)) {
        return false
    }
    return true
}

/**
 * Convert text to camelCase
 * @param {string} str Text to be converted
 * @return {string} Converted string
 */
export function camelCase(str: string): string {
    return str
        .replace(/^-/u, "")
        .replace(/-(?<c>\w)/gu, (_, c) => (c ? c.toUpperCase() : ""))
}

/**
 * Checks whether the given string is camelCase.
 * @param {string} str
 */
export function isCamelCase(str: string): boolean {
    if (
        hasSymbols(str) ||
        /^[A-Z]/u.test(str) ||
        /[\s\-_]/u.test(str) // kebab or snake or space
    ) {
        return false
    }
    return true
}

const convertersMap = {
    "kebab-case": kebabCase,
    camelCase,
}

const checkersMap = {
    "kebab-case": isKebabCase,
    camelCase: isCamelCase,
}

/**
 * Return case checker
 */
export function getChecker(
    name: "camelCase" | "kebab-case",
): (str: string) => boolean {
    return checkersMap[name] || isCamelCase
}

/**
 * Return case converter
 */
export function getConverter(
    name: "camelCase" | "kebab-case",
): (str: string) => string {
    return convertersMap[name] || camelCase
}

/**
 * Return case exact converter.
 * If the converted result is not the correct case, the original value is returned.
 */
export function getExactConverter(
    name: "camelCase" | "kebab-case",
): (str: string) => string {
    const converter = getConverter(name)
    const checker = getChecker(name)
    return (str) => {
        const result = converter(str)
        return checker(result) ? result : str /* cannot convert */
    }
}
