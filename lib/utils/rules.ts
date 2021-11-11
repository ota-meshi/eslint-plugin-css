import type { RuleModule } from "../types"
import noDupeProperties from "../rules/no-dupe-properties"
import noInvalidColorHex from "../rules/no-invalid-color-hex"
import noLengthZeroUnit from "../rules/no-length-zero-unit"
import noNumberTrailingZeros from "../rules/no-number-trailing-zeros"
import noUnknownProperty from "../rules/no-unknown-property"
import noUnknownUnit from "../rules/no-unknown-unit"
import numberLeadingZero from "../rules/number-leading-zero"
import preferReduceShorthandPropertyBoxValues from "../rules/prefer-reduce-shorthand-property-box-values"
import propertyCasing from "../rules/property-casing"

export const rules = [
    noDupeProperties,
    noInvalidColorHex,
    noLengthZeroUnit,
    noNumberTrailingZeros,
    noUnknownProperty,
    noUnknownUnit,
    numberLeadingZero,
    preferReduceShorthandPropertyBoxValues,
    propertyCasing,
] as RuleModule[]
