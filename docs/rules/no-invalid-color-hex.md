---
pageClass: "rule-details"
sidebarDepth: 0
title: "css/no-invalid-color-hex"
description: "disallow invalid hex colors"
---
# css/no-invalid-color-hex

> disallow invalid hex colors

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> ***This rule has not been released yet.*** </badge>
- :gear: This rule is included in `"plugin:css/recommended"`.

## :book: Rule Details

This rule reports an invalid color hex.  
Longhand hex colors can be either 6 or 8 (with alpha channel) hexadecimal characters. And their shorthand variants are 3 and 4 characters respectively.

This rule was inspired by [Stylelint's color-no-invalid-hex rule](https://stylelint.io/user-guide/rules/list/color-no-invalid-hex/).

<eslint-code-block>

```js
/* eslint css/no-invalid-color-hex: "error" */

/* ✓ GOOD */
var foo = <div
  style={
    {
      color: '#f00'
    }
  } >
  </div>

/* ✗ BAD */
var foo = <div
  style={
    {
      color: '#f0'
    }
  } >
  </div>
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :books: Further reading

- [Stylelint - color-no-invalid-hex]

[Stylelint - color-no-invalid-hex]: https://stylelint.io/user-guide/rules/list/color-no-invalid-hex/

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-css/blob/main/lib/rules/no-invalid-color-hex.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-css/blob/main/tests/lib/rules/no-invalid-color-hex.ts)
