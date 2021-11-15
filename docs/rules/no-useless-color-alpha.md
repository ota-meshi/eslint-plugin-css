---
pageClass: "rule-details"
sidebarDepth: 0
title: "css/no-useless-color-alpha"
description: "disallow unnecessary alpha-channel transparency value"
---
# css/no-useless-color-alpha

> disallow unnecessary alpha-channel transparency value

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> ***This rule has not been released yet.*** </badge>
- :gear: This rule is included in `"plugin:css/recommended"`.
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

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-css/blob/main/lib/rules/no-useless-color-alpha.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-css/blob/main/tests/lib/rules/no-useless-color-alpha.ts)
