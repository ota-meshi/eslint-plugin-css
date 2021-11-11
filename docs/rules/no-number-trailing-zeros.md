---
pageClass: "rule-details"
sidebarDepth: 0
title: "css/no-number-trailing-zeros"
description: "disallow trailing zeros in numbers."
---
# css/no-number-trailing-zeros

> disallow trailing zeros in numbers.

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> ***This rule has not been released yet.*** </badge>
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule aims to remove unnecessary trailing zeros.

This rule was inspired by [Stylelint's number-no-trailing-zeros rule](https://stylelint.io/user-guide/rules/list/color-no-invalid-hex/).

<eslint-code-block fix>

```js
/* eslint css/no-number-trailing-zeros: "error" */

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
      height: '0.50px'
    }
  } >
  </div>
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :books: Further reading

- [Stylelint - number-no-trailing-zeros]

[Stylelint - number-no-trailing-zeros]: https://stylelint.io/user-guide/rules/list/number-no-trailing-zeros/

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-css/blob/main/lib/rules/no-number-trailing-zeros.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-css/blob/main/tests/lib/rules/no-number-trailing-zeros.ts)
