---
pageClass: "rule-details"
sidebarDepth: 0
title: "css/property-casing"
description: "enforce specific casing for CSS properties"
since: "v0.1.0"
---
# css/property-casing

> enforce specific casing for CSS properties

- :gear: This rule is included in `"plugin:css/standard"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule aims to warn the CSS property names other than the configured casing.

<eslint-code-block fix>

```js
/* eslint css/property-casing: "error" */

/* ✓ GOOD */
var foo = <div
  style={
    {
      backgroundColor: 'red'
    }
  } >
  </div>

/* ✗ BAD */
var foo = <div
  style={
    {
      'background-color': 'red'
    }
  } >
  </div>
```

</eslint-code-block>

## :wrench: Options

```json
{
  "css/property-casing": ["error",
    "camelCase", // or "kebab-case"
  ]
}
```

- `"camelCase"` ... Enforce CSS property names to camel case. This is default.
- `"kebab-case"` ... Enforce CSS property names to kebab case.

## :rocket: Version

This rule was introduced in eslint-plugin-css v0.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-css/blob/main/lib/rules/property-casing.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-css/blob/main/tests/lib/rules/property-casing.ts)
