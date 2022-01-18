---
pageClass: "rule-details"
sidebarDepth: 0
title: "css/number-leading-zero"
description: "require or disallow a leading zero for fractional numbers less than 1"
since: "v0.3.0"
---
# css/number-leading-zero

> require or disallow a leading zero for fractional numbers less than 1

- :gear: This rule is included in `"plugin:css/standard"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule aims to consistently require or disallow leading zeros for fractional numbers less than one.

This rule was inspired by [Stylelint's number-leading-zero rule](https://stylelint.io/user-guide/rules/list/number-leading-zero/).

<eslint-code-block fix>

```js
/* eslint css/number-leading-zero: "error" */

/* ✓ GOOD */
var foo = <div
  style={
    {
      height: '0.5px'
    }
  } >
  </div>

/* ✗ BAD */
var foo = <div
  style={
    {
      height: '.5px'
    }
  } >
  </div>
```

</eslint-code-block>

## :wrench: Options

```json
{
  "css/number-leading-zero": ["error",
    "always" // or "never"
  ]
}
```

- `"always"` ... Require always have leading zero. This is default.
- `"never"` ... Disallow leading zero.

## :books: Further reading

- [Stylelint - number-leading-zero]

[Stylelint - number-leading-zero]: https://stylelint.io/user-guide/rules/list/number-leading-zero/

## :rocket: Version

This rule was introduced in eslint-plugin-css v0.3.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-css/blob/main/lib/rules/number-leading-zero.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-css/blob/main/tests/lib/rules/number-leading-zero.ts)
