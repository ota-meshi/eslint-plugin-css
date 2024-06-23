import type { ESLint, Linter } from "eslint";
export default {
  plugins: {
    get css(): ESLint.Plugin {
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- ignore
      return require("../../index");
    },
  },
  rules: {
    // eslint-plugin-css rules
    "css/no-dupe-properties": "error",
    "css/no-invalid-color-hex": "error",
    "css/no-shorthand-property-overrides": "error",
    "css/no-unknown-property": "error",
    "css/no-unknown-unit": "error",
    "css/no-useless-color-alpha": "error",
  },
} as Linter.FlatConfig;
