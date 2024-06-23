import myPlugin from "@ota-meshi/eslint-plugin";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      ".nyc_output",
      "coverage",
      "dist",
      "node_modules",
      "assets",
      "!.vscode",
      "!.github",
      "tests/fixtures/integrations/eslint-plugin",
      "package-lock.json",
      "!docs/.vitepress",
      "docs/.vitepress/dist",
      "docs/.vitepress/cache",
      "docs/.vitepress/build-system/shim",
      "**/*.md/*.vue",
      "docs/rules/**/*.md/*.js",
    ],
  },
  ...myPlugin.config({
    node: true,
    ts: true,
    eslintPlugin: true,
    packageJson: true,
    json: true,
    yaml: true,
    prettier: true,
    vue3: true,
    md: true,
  }),
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
    },

    rules: {
      complexity: "off",
      "no-warning-comments": "warn",
      "no-lonely-if": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "no-shadow": "off",
      "regexp/no-contradiction-with-assertion": "error",
      "regexp/no-empty-character-class": "error",
      "regexp/no-misleading-unicode-character": "error",
      "regexp/use-ignore-case": "error",
      "regexp/no-super-linear-move": "error",
      "regexp/no-octal": "error",
      "regexp/no-standalone-backslash": "error",
      "regexp/prefer-escape-replacement-dollar-char": "error",
      "regexp/prefer-quantifier": "error",
      "regexp/prefer-regexp-exec": "error",
      "regexp/prefer-regexp-test": "error",
      "regexp/require-unicode-regexp": "error",
      "regexp/sort-alternatives": "error",
      "regexp/hexadecimal-escape": "error",
      "regexp/letter-case": "error",
      "regexp/prefer-named-backreference": "error",
      "regexp/prefer-named-capture-group": "error",
      "regexp/prefer-named-replacement": "error",
      "regexp/prefer-result-array-groups": "error",
      "regexp/sort-character-class-elements": "error",
      "regexp/unicode-escape": "error",

      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["/regexpp", "/regexpp/*"],
              message: "Please use `@eslint-community/regexpp` instead.",
            },
            {
              group: ["/eslint-utils", "/eslint-utils/*"],
              message: "Please use `@eslint-community/eslint-utils` instead.",
            },
          ],
        },
      ],

      "no-restricted-properties": [
        "error",
        {
          object: "context",
          property: "parserServices",
          message:
            "Please use `getSourceCode(context).parserServices` instead.",
        },
      ],
    },
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      sourceType: "module",
      parserOptions: {
        project: true,
      },
    },

    rules: {
      "no-implicit-globals": "off",
      "@typescript-eslint/naming-convention": "off",
    },
  },
  {
    files: ["**/*.mjs", "**/*.md/*.js"],
    languageOptions: {
      sourceType: "module",
    },
  },
  {
    files: ["**/*.md/*.js"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      "n/no-missing-import": "off",
      "@eslint-community/eslint-comments/require-description": "off",
    },
  },
  {
    files: ["lib/rules/**/*.ts"],
    rules: {
      "eslint-plugin/report-message-format": ["error", "[^a-z].*\\.$"],
    },
  },
  {
    files: ["scripts/**/*.ts", "tests/**/*.ts"],
    rules: {
      "jsdoc/require-jsdoc": "off",
      "no-console": "off",
      "@typescript-eslint/no-misused-promises": "off",
    },
  },
  ...tseslint.config({
    files: ["docs/.vitepress/**/*.{vue,ts,mts,js}"],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: {
        window: true,
      },
      sourceType: "module",
      parserOptions: {
        project: null,
      },
    },
    rules: {
      "jsdoc/require-jsdoc": "off",
      "eslint-plugin/require-meta-docs-description": "off",
      "eslint-plugin/require-meta-docs-url": "off",
      "eslint-plugin/require-meta-type": "off",
      "eslint-plugin/prefer-message-ids": "off",
      "eslint-plugin/prefer-object-rule": "off",
      "eslint-plugin/require-meta-schema": "off",
      "n/no-extraneous-import": "off",
      "n/no-unsupported-features/node-builtins": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "n/file-extension-in-import": "off",
    },
  }),
];
