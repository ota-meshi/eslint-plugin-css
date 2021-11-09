import type { RuleModule } from "../types"
import noInvalidColorHex from "../rules/no-invalid-color-hex"
import noLengthZeroUnit from "../rules/no-length-zero-unit"
import noUnknownProperty from "../rules/no-unknown-property"
import noUnknownUnit from "../rules/no-unknown-unit"
import propertyCasing from "../rules/property-casing"

export const rules = [
    noInvalidColorHex,
    noLengthZeroUnit,
    noUnknownProperty,
    noUnknownUnit,
    propertyCasing,
] as RuleModule[]
