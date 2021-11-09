import type { RuleModule } from "../types"
import noUnknownProperty from "../rules/no-unknown-property"

export const rules = [noUnknownProperty] as RuleModule[]
