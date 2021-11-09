import type { RuleModule } from "../types"
import noLengthZeroUnit from "../rules/no-length-zero-unit"
import noUnknownProperty from "../rules/no-unknown-property"
import propertyCasing from "../rules/property-casing"

export const rules = [
    noLengthZeroUnit,
    noUnknownProperty,
    propertyCasing,
] as RuleModule[]
