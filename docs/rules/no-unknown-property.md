---
pageClass: "rule-details"
sidebarDepth: 0
title: "css/no-unknown-property"
description: "disallow unknown properties"
since: "v0.1.0"
---
# css/no-unknown-property

> disallow unknown properties

- :gear: This rule is included in `"plugin:css/recommended"`.

## :book: Rule Details

This rule reports an unknown CSS property.

This rule was inspired by [Stylelint's property-no-unknown rule](https://stylelint.io/user-guide/rules/list/property-no-unknown/).

<eslint-code-block>

```js
/* eslint css/no-unknown-property: "error" */

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
      unknown: 'red'
    }
  } >
  </div>
```

</eslint-code-block>

## :wrench: Options

```json
{
  "css/no-unknown-property": ["error", {
    "ignoreProperties": [],
    "ignorePrefixed": true,
  }]
}
```

- `ignoreProperties` ... You can specify property names or patterns that you want to ignore from checking.
- `ignorePrefixed` ... If `true`, ignores properties with vendor prefix from checking. Default is `true`.

## :books: Further reading

- [Stylelint - property-no-unknown]

[Stylelint - property-no-unknown]: https://stylelint.io/user-guide/rules/list/property-no-unknown/

## :rocket: Version

This rule was introduced in eslint-plugin-css v0.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-css/blob/master/lib/rules/no-unknown-property.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-css/blob/master/tests/lib/rules/no-unknown-property.ts)
