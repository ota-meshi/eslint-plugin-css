import type { RuleCategory, RuleModule } from "../lib/types";
import { rules } from "../lib/utils/rules";

export type BuildRulePathFn = (ruleName: string) => string;
// eslint-disable-next-line func-style -- ignore
const DEFAULT_BUILD_RULE_PATH: BuildRulePathFn = (ruleName: string) =>
  `./${ruleName}.md`;

//eslint-disable-next-line require-jsdoc -- ignore
export default function renderRulesTableContent(opt?: {
  header?: "##" | "###";
  buildRulePath?: BuildRulePathFn;
}): string {
  const buildRulePath = opt?.buildRulePath || DEFAULT_BUILD_RULE_PATH;
  const header = opt?.header || "###";
  const categories = categorizeRules();

  let md = `
${header} Possible Errors

${createTable(categories["Possible Errors"], buildRulePath)}

${header} Best Practices

${createTable(categories["Best Practices"], buildRulePath)}

${header} Stylistic Issues

${createTable(categories["Stylistic Issues"], buildRulePath)}
`;

  if (categories.deprecated.length >= 1) {
    md += `
${header} Deprecated

- :warning: We're going to remove deprecated rules in the next major release. Please migrate to successor/new rules.
- :innocent: We don't fix bugs which are in deprecated rules since we don't have enough resources.

${createDeprecationTable(categories.deprecated, buildRulePath)}
`;
  }

  return md;
}

//eslint-disable-next-line require-jsdoc -- ignore
function categorizeRules() {
  const result: Record<RuleCategory | "deprecated", RuleModule[]> = {
    "Best Practices": [],
    "Possible Errors": [],
    "Stylistic Issues": [],
    deprecated: [],
  };

  for (const rule of rules) {
    if (rule.meta.deprecated) {
      result.deprecated.push(rule);
    } else {
      result[rule.meta.docs.category].push(rule);
    }
  }

  return result;
}

//eslint-disable-next-line require-jsdoc -- ignore
function createTable(
  tableRules: RuleModule[],
  buildRulePath: BuildRulePathFn,
): string {
  let md = "| Rule ID | Description |    |\n|:--------|:------------|:---|";

  for (const { meta } of tableRules) {
    const recommended = meta.docs.recommended ? ":star:" : "";
    const standard =
      !meta.docs.recommended && meta.docs.standard ? ":lipstick:" : "";
    const fixable = meta.fixable ? ":wrench:" : "";
    const deprecated = meta.deprecated ? ":warning:" : "";
    const mark = `${recommended}${standard}${fixable}${deprecated}`;

    const link = `[${meta.docs.ruleId}](${buildRulePath(
      meta.docs.ruleName || "",
    )})`;

    const description = meta.docs.description || "(no description)";

    md += `\n| ${link} | ${description} | ${mark} |`;
  }

  return md;
}

//eslint-disable-next-line require-jsdoc -- ignore
function createDeprecationTable(
  tableRules: RuleModule[],
  buildRulePath: BuildRulePathFn,
): string {
  let md = "| Rule ID | Replaced by |\n|:--------|:------------|";

  for (const { meta } of tableRules) {
    const link = `[${meta.docs.ruleId}](${buildRulePath(
      meta.docs.ruleName || "",
    )})`;

    const replacedRules = meta.replacedBy || [];
    const replacedBy = replacedRules
      .map((name) => `[css/${name}](${buildRulePath(name)})`)
      .join(", ");

    md += `\n| ${link} | ${replacedBy || "(no replacement)"} |`;
  }

  return md;
}
