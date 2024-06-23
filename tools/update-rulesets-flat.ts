import path from "path";
import fs from "fs";
// import eslint from "eslint"
import { rules } from "./lib/load-rules";

fs.writeFileSync(
  path.resolve(__dirname, "../lib/configs/flat/recommended.ts"),
  `import type { ESLint, Linter } from "eslint";
export default {
  plugins: {
    get css(): ESLint.Plugin {
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- ignore
      return require("../../index");
    }
  },
  rules: {
      // eslint-plugin-css rules
      ${rules
        .filter((rule) => rule.meta.docs.recommended && !rule.meta.deprecated)
        .map((rule) => {
          const conf = rule.meta.docs.default || "error";
          return `"${rule.meta.docs.ruleId}": "${conf}"`;
        })
        .join(",\n")}
  },
} as Linter.FlatConfig
`,
);
fs.writeFileSync(
  path.resolve(__dirname, "../lib/configs/flat/standard.ts"),
  `import type { ESLint, Linter } from "eslint";
export default {
  plugins: {
    get css(): ESLint.Plugin {
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- ignore
      return require("../../index");
    }
  },
  rules: {
      // eslint-plugin-css rules
      ${rules
        .filter((rule) => rule.meta.docs.standard && !rule.meta.deprecated)
        .map((rule) => {
          const conf = rule.meta.docs.default || "error";
          return `"${rule.meta.docs.ruleId}": "${conf}"`;
        })
        .join(",\n")}
  },
} as Linter.FlatConfig
`,
);

// Format files.
// const linter = new eslint.CLIEngine({ fix: true })
// const report = linter.executeOnFiles([filePath])
// eslint.CLIEngine.outputFixes(report)
