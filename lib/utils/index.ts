import type { RuleModule, PartialRuleModule } from "../types";
export * from "./css-visitor";

/**
 * Define the rule.
 * @param ruleName ruleName
 * @param rule rule module
 */
export function createRule(
  ruleName: string,
  rule: PartialRuleModule
): RuleModule {
  return {
    meta: {
      ...rule.meta,
      docs: {
        ...rule.meta.docs,
        standard: Boolean(
          rule.meta.docs.recommended || rule.meta.docs.standard
        ),
        url: `https://ota-meshi.github.io/eslint-plugin-css/rules/${ruleName}.html`,
        ruleId: `css/${ruleName}`,
        ruleName,
      },
    },
    create: rule.create as never,
  };
}
