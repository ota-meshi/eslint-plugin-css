"use strict";

module.exports = {
  parserOptions: {
    sourceType: "script",
    ecmaVersion: 2020,
  },
  extends: [
    "plugin:@ota-meshi/recommended",
    "plugin:@ota-meshi/+node",
    "plugin:@ota-meshi/+typescript",
    "plugin:@ota-meshi/+eslint-plugin",
    "plugin:@ota-meshi/+package-json",
    "plugin:@ota-meshi/+json",
    "plugin:@ota-meshi/+yaml",
    // "plugin:@ota-meshi/+md",
    "plugin:@ota-meshi/+prettier",
    "plugin:regexp/recommended",
  ],
  rules: {
    complexity: "off",
    "require-jsdoc": "error",
    "no-warning-comments": "warn",
    "no-lonely-if": "off",
    "@typescript-eslint/no-non-null-assertion": "off",

    "no-shadow": "off", // ts bug?
    "@typescript-eslint/no-shadow": "error",

    // regexp next recommended
    "regexp/no-contradiction-with-assertion": "error",
    "regexp/no-empty-character-class": "error",
    "regexp/no-misleading-unicode-character": "error",
    "regexp/use-ignore-case": "error",

    // regexp Possible Errors
    "regexp/no-super-linear-move": "error",
    // regexp Best Practices
    "regexp/no-octal": "error",
    "regexp/no-standalone-backslash": "error",
    "regexp/prefer-escape-replacement-dollar-char": "error",
    "regexp/prefer-quantifier": "error",
    "regexp/prefer-regexp-exec": "error",
    "regexp/prefer-regexp-test": "error",
    "regexp/require-unicode-regexp": "error",
    "regexp/sort-alternatives": "error",
    // regexp Stylistic Issues
    "regexp/hexadecimal-escape": "error",
    "regexp/letter-case": "error",
    "regexp/prefer-named-backreference": "error",
    "regexp/prefer-named-capture-group": "error",
    "regexp/prefer-named-replacement": "error",
    "regexp/prefer-result-array-groups": "error",
    "regexp/sort-character-class-elements": "error",
    "regexp/unicode-escape": "error",

    // Repo rule
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
        message: "Please use `getSourceCode(context).parserServices` instead.",
      },
    ],
  },
  overrides: [
    {
      files: ["*.ts"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        sourceType: "module",
        project: "./tsconfig.json",
      },
      rules: {
        "no-implicit-globals": "off",
        "@typescript-eslint/naming-convention": "off",
      },
    },
    {
      files: ["lib/rules/**"],
      rules: {
        "eslint-plugin/report-message-format": ["error", "[^a-z].*\\.$"],
      },
    },
    {
      files: ["scripts/**/*.ts", "tests/**/*.ts"],
      rules: {
        "require-jsdoc": "off",
        "no-console": "off",
        "@typescript-eslint/no-misused-promises": "off",
      },
    },
    {
      files: ["*.vue"],
      extends: ["plugin:@ota-meshi/+vue2", "plugin:@ota-meshi/+prettier"],
      parserOptions: {
        sourceType: "module",
      },
      globals: {
        require: true,
      },
    },
    {
      files: ["docs/.vuepress/**"],
      parserOptions: {
        sourceType: "module",
        ecmaVersion: 2020,
      },
      globals: {
        window: true,
      },
      rules: {
        "require-jsdoc": "off",
        "eslint-plugin/require-meta-docs-description": "off",
        "eslint-plugin/require-meta-docs-url": "off",
        "eslint-plugin/require-meta-type": "off",
        "eslint-plugin/prefer-message-ids": "off",
        "eslint-plugin/prefer-object-rule": "off",
        "eslint-plugin/require-meta-schema": "off",
      },
    },
  ],
};
