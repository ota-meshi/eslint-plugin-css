---
pageClass: "rule-details"
sidebarDepth: 0
title: "css/no-unknown-unit"
description: "disallow unknown units"
since: "v0.2.0"
---

# css/no-unknown-unit

> disallow unknown units

- :gear: This rule is included in `"plugin:css/recommended"` and `"plugin:css/standard"`.

## :book: Rule Details

This rule reports an unknown CSS unit.

This rule was inspired by [Stylelint's unit-no-unknown rule](https://stylelint.io/user-guide/rules/list/unit-no-unknown/).

<eslint-code-block>

```js
/* eslint css/no-unknown-unit: "error" */

/* ✓ GOOD */
var foo = <div
  style={
    {
      width: '100px'
    }
  } >
  </div>

/* ✗ BAD */
var foo = <div
  style={
    {
      width: '100pixels'
    }
  } >
  </div>
```

</eslint-code-block>

## :wrench: Options

```json
{
  "css/no-unknown-unit": ["error", {
    "ignoreFunctions": [],
    "ignoreUnits": []
  }]
}
```

- `ignoreFunctions` ... You can specify function names or patterns that you want to ignore from checking.
- `ignoreUnits` ... You can specify unit names or patterns that you want to ignore from checking.

## :books: Further reading

- [Stylelint - unit-no-unknown]

[Stylelint - unit-no-unknown]: https://stylelint.io/user-guide/rules/list/unit-no-unknown/

## :rocket: Version

This rule was introduced in eslint-plugin-css v0.2.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-css/blob/main/lib/rules/no-unknown-unit.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-css/blob/main/tests/lib/rules/no-unknown-unit.ts)
