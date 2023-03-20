---
pageClass: "rule-details"
sidebarDepth: 0
title: "css/no-length-zero-unit"
description: "disallow units for zero lengths"
since: "v0.1.0"
---

# css/no-length-zero-unit

> disallow units for zero lengths

- :gear: This rule is included in `"plugin:css/standard"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule reports a length of `0` with unit.

This rule was inspired by [Stylelint's length-zero-no-unit rule](https://stylelint.io/user-guide/rules/list/length-zero-no-unit/).

<eslint-code-block fix>

```js
/* eslint css/no-length-zero-unit: "error" */

/* ✓ GOOD */
var foo = <div
  style={
    {
      top: '0'
    }
  } >
  </div>

/* ✗ BAD */
var foo = <div
  style={
    {
      top: '0px'
    }
  } >
  </div>
```

</eslint-code-block>

## :wrench: Options

```json
{
  "css/no-length-zero-unit": ["error", {
    "ignoreProperties": [],
    "ignoreFunctions": [],
    "ignoreCustomProperties": false,
  }]
}
```

- `ignoreProperties` ... You can specify property names or patterns that you want to ignore from checking.
- `ignoreFunctions` ... You can specify function names or patterns that you want to ignore from checking.
- `ignoreCustomProperties` ... If `true`, ignores custom properties from checking. Default is `false`.

## :books: Further reading

- [Stylelint - length-zero-no-unit]

[Stylelint - length-zero-no-unit]: https://stylelint.io/user-guide/rules/list/length-zero-no-unit/

## :rocket: Version

This rule was introduced in eslint-plugin-css v0.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-css/blob/main/lib/rules/no-length-zero-unit.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-css/blob/main/tests/lib/rules/no-length-zero-unit.ts)
