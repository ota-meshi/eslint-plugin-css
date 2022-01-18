---
pageClass: "rule-details"
sidebarDepth: 0
title: "css/prefer-reduce-shorthand-property-box-values"
description: "require reduction in box values of shorthand property"
since: "v0.3.0"
---
# css/prefer-reduce-shorthand-property-box-values

> require reduction in box values of shorthand property

- :gear: This rule is included in `"plugin:css/standard"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule aims to reduce the box values of the shorthand properties.

This rule was inspired by [Stylelint's shorthand-property-no-redundant-values rule](https://stylelint.io/user-guide/rules/list/shorthand-property-no-redundant-values/).

<eslint-code-block fix>

```js
/* eslint css/prefer-reduce-shorthand-property-box-values: "error" */

/* ✓ GOOD */
var foo = <div
  style={
    {
      padding: '8px'
    }
  } >
  </div>

/* ✗ BAD */
var foo = <div
  style={
    {
      padding: '8px 8px 8px 8px'
    }
  } >
  </div>
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :books: Further reading

- [Stylelint - shorthand-property-no-redundant-values]

[Stylelint - shorthand-property-no-redundant-values]: https://stylelint.io/user-guide/rules/list/shorthand-property-no-redundant-values/

## :rocket: Version

This rule was introduced in eslint-plugin-css v0.3.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-css/blob/main/lib/rules/prefer-reduce-shorthand-property-box-values.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-css/blob/main/tests/lib/rules/prefer-reduce-shorthand-property-box-values.ts)
