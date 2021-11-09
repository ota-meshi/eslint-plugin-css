const RE_REGEXP_STR = /^\/(?<source>[^/]+)\/(?<flags>.*)$/u

/**
 * Convert a string to the `RegExp`.
 * Normal strings (e.g. `"foo"`) is converted to `/^foo$/` of `RegExp`.
 * Strings like `"/^foo/i"` are converted to `/^foo/i` of `RegExp`.
 *
 * @param {string} string The string to convert.
 * @returns Returns the `RegExp`.
 */
export function toRegExp(string: string): { test: (str: string) => boolean } {
    const parts = RE_REGEXP_STR.exec(string)
    if (parts) {
        return new RegExp(parts.groups!.source, parts.groups!.flags)
    }
    return { test: (str) => str === string }
}

/**
 * Checks whether given string is regexp string
 * @param {string} string
 * @returns {boolean}
 */
export function isRegExp(string: string): boolean {
    return Boolean(RE_REGEXP_STR.test(string))
}
