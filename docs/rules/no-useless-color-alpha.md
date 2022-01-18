---
pageClass: "rule-details"
sidebarDepth: 0
title: "css/no-useless-color-alpha"
description: "disallow unnecessary alpha-channel transparency value"
since: "v0.4.0"
---
# css/no-useless-color-alpha

> disallow unnecessary alpha-channel transparency value

- :gear: This rule is included in `"plugin:css/recommended"` and `"plugin:css/standard"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule does not allow unnecessary alpha-channel transparency values.

<eslint-code-block fix>

```js
/* eslint css/no-useless-color-alpha: "error" */

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
      color: '#ffff'
    }
  } >
  </div>
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-css v0.4.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-css/blob/main/lib/rules/no-useless-color-alpha.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-css/blob/main/tests/lib/rules/no-useless-color-alpha.ts)
