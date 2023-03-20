---
pageClass: "rule-details"
sidebarDepth: 0
title: "css/color-hex-style"
description: "enforce hex color style"
since: "v0.4.0"
---

# css/color-hex-style

> enforce hex color style

- :gear: This rule is included in `"plugin:css/standard"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule aims to apply a consistent hex color style.

This rule was inspired by [Stylelint's color-hex-length rule](https://stylelint.io/user-guide/rules/list/color-hex-length/).

<eslint-code-block fix>

```js
/* eslint css/color-hex-style: "error" */

/* ✓ GOOD */
var foo = <div
  style={
    {
      color: '#fff'
    }
  } >
  </div>

/* ✗ BAD */
var foo = <div
  style={
    {
      color: '#ffffff'
    }
  } >
  </div>
```

</eslint-code-block>

## :wrench: Options

```json
{
  "css/color-hex-style": ["error",
    "RGB", // "RRGGBB"
  ]
}
```

- `"RGB"` ... Enforce `RGB(A)` style. This is default.
- `"RRGGBB"` ... Enforce `RRGGBB(AA)` style.

## :books: Further reading

- [Stylelint - color-hex-length]

[Stylelint - color-hex-length]: https://stylelint.io/user-guide/rules/list/color-hex-length/

## :rocket: Version

This rule was introduced in eslint-plugin-css v0.4.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-css/blob/main/lib/rules/color-hex-style.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-css/blob/main/tests/lib/rules/color-hex-style.ts)
