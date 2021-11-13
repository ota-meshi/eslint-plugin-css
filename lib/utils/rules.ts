import type { RuleModule } from "../types"
import colorHexStyle from "../rules/color-hex-style"
import namedColor from "../rules/named-color"
import noDupeProperties from "../rules/no-dupe-properties"
import noInvalidColorHex from "../rules/no-invalid-color-hex"
import noLengthZeroUnit from "../rules/no-length-zero-unit"
import noNumberTrailingZeros from "../rules/no-number-trailing-zeros"
import noShorthandPropertyOverrides from "../rules/no-shorthand-property-overrides"
import noUnknownProperty from "../rules/no-unknown-property"
import noUnknownUnit from "../rules/no-unknown-unit"
import noUselessColorAlpha from "../rules/no-useless-color-alpha"
import numberLeadingZero from "../rules/number-leading-zero"
import preferReduceShorthandPropertyBoxValues from "../rules/prefer-reduce-shorthand-property-box-values"
import propertyCasing from "../rules/property-casing"

export const rules = [
    colorHexStyle,
    namedColor,
    noDupeProperties,
    noInvalidColorHex,
    noLengthZeroUnit,
    noNumberTrailingZeros,
    noShorthandPropertyOverrides,
    noUnknownProperty,
    noUnknownUnit,
    noUselessColorAlpha,
    numberLeadingZero,
    preferReduceShorthandPropertyBoxValues,
    propertyCasing,
] as RuleModule[]
