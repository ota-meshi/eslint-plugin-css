import type { RuleModule } from "../types"
import noLengthZeroUnit from "../rules/no-length-zero-unit"
import noUnknownProperty from "../rules/no-unknown-property"

export const rules = [noLengthZeroUnit, noUnknownProperty] as RuleModule[]
