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
    "css/color-hex-style": "error",
    "css/no-dupe-properties": "error",
    "css/no-invalid-color-hex": "error",
    "css/no-length-zero-unit": "error",
    "css/no-number-trailing-zeros": "error",
    "css/no-shorthand-property-overrides": "error",
    "css/no-unknown-property": "error",
    "css/no-unknown-unit": "error",
    "css/no-useless-color-alpha": "error",
    "css/number-leading-zero": "error",
    "css/prefer-reduce-shorthand-property-box-values": "error",
    "css/property-casing": "error",
  },
} as Linter.FlatConfig;
