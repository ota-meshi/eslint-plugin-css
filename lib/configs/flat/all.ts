import recommended from "./recommended";
import { rules } from "../../utils/rules";

const all: Record<string, string> = {};
for (const rule of rules) {
  all[rule.meta.docs.ruleId] = "error";
}

import type { ESLint, Linter } from "eslint";
export default {
  name: "css:all",
  plugins: {
    get css(): ESLint.Plugin {
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- ignore
      return require("../../index");
    },
  },
  rules: {
    ...all,
    ...recommended.rules,
  },
} as Linter.FlatConfig;
