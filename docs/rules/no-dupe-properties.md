---
pageClass: "rule-details"
sidebarDepth: 0
title: "css/no-dupe-properties"
description: "disallow duplicate properties"
---
# css/no-dupe-properties

> disallow duplicate properties

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> ***This rule has not been released yet.*** </badge>
- :gear: This rule is included in `"plugin:css/recommended"`.

## :book: Rule Details

This rule reports duplicate properties.

<eslint-code-block>

```js
/* eslint css/no-dupe-properties: "error" */

/* ✓ GOOD */
var foo = <div
  style={
    {
      'background-color': 'blue'
    }
  } >
  </div>

/* ✗ BAD */
var foo = <div
  style={
    {
      'background-color': 'blue',
      backgroundColor: 'red'
    }
  } >
  </div>
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-css/blob/main/lib/rules/no-dupe-properties.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-css/blob/main/tests/lib/rules/no-dupe-properties.ts)
