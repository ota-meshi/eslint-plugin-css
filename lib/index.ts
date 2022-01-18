import type { RuleModule } from "./types"
import { rules as ruleList } from "./utils/rules"
import recommended from "./configs/recommended"
import standard from "./configs/standard"
import all from "./configs/all"

const configs = {
    recommended,
    standard,
    all,
}

const rules = ruleList.reduce((obj, r) => {
    obj[r.meta.docs.ruleName] = r
    return obj
}, {} as { [key: string]: RuleModule })

export = {
    configs,
    rules,
}
