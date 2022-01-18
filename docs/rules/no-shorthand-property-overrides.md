---
pageClass: "rule-details"
sidebarDepth: 0
title: "css/no-shorthand-property-overrides"
description: "disallow shorthand properties that override related longhand properties"
since: "v0.3.0"
---
# css/no-shorthand-property-overrides

> disallow shorthand properties that override related longhand properties

- :gear: This rule is included in `"plugin:css/recommended"` and `"plugin:css/standard"`.

## :book: Rule Details

This rule reports when a shorthand property overrides a previously defined longhand property.

This rule was inspired by [Stylelint's declaration-block-no-shorthand-property-overrides rule](https://stylelint.io/user-guide/rules/list/declaration-block-no-shorthand-property-overrides/).

<eslint-code-block>

```js
/* eslint css/no-shorthand-property-overrides: "error" */

/* ✓ GOOD */
var foo = <div
  style={
    {
      backgroundRepeat: 'repeat',
      backgroundColor: 'green'
    }
  } >
  </div>

/* ✗ BAD */
var foo = <div
  style={
    {
      backgroundRepeat: 'repeat',
      background: 'green'
    }
  } >
  </div>
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :books: Further reading

- [Stylelint - declaration-block-no-shorthand-property-overrides]

[Stylelint - declaration-block-no-shorthand-property-overrides]: https://stylelint.io/user-guide/rules/list/declaration-block-no-shorthand-property-overrides/

## :rocket: Version

This rule was introduced in eslint-plugin-css v0.3.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-css/blob/main/lib/rules/no-shorthand-property-overrides.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-css/blob/main/tests/lib/rules/no-shorthand-property-overrides.ts)
