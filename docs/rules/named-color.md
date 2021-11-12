---
pageClass: "rule-details"
sidebarDepth: 0
title: "css/named-color"
description: "enforce named colors"
---
# css/named-color

> enforce named colors

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> ***This rule has not been released yet.*** </badge>
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule aims to apply consistent use of named colors.

This rule was inspired by [Stylelint's color-named rule](https://stylelint.io/user-guide/rules/list/color-named/).

<eslint-code-block fix>

```js
/* eslint css/named-color: "error" */

/* ✓ GOOD */
var foo = <div
  style={
    {
      color: 'red'
    }
  } >
  </div>

/* ✗ BAD */
var foo = <div
  style={
    {
      color: '#f00'
    }
  } >
  </div>
```

</eslint-code-block>

## :wrench: Options

```json
{
  "css/named-color": ["error",
    "always", // or "never"
    {
      "ignoreProperties": []
    }
  ]
}
```

- `"always"` ... Require always use named colors, if can use named colors. This is default.
- `"never"` ... Disallow use named colors.
- `ignoreProperties` ... You can specify property names or patterns that you want to ignore from checking.

## :books: Further reading

- [Stylelint - color-named]

[Stylelint - color-named]: https://stylelint.io/user-guide/rules/list/color-named/

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-css/blob/main/lib/rules/named-color.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-css/blob/main/tests/lib/rules/named-color.ts)
