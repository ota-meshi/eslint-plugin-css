# Introduction

[eslint-plugin-css](https://www.npmjs.com/package/eslint-plugin-css) is an ESLint plugin that provides rules to verify CSS definition objects.

[![NPM license](https://img.shields.io/npm/l/eslint-plugin-css.svg)](https://www.npmjs.com/package/eslint-plugin-css)
[![NPM version](https://img.shields.io/npm/v/eslint-plugin-css.svg)](https://www.npmjs.com/package/eslint-plugin-css)
[![NPM downloads](https://img.shields.io/badge/dynamic/json.svg?label=downloads&colorB=green&suffix=/day&query=$.downloads&uri=https://api.npmjs.org//downloads/point/last-day/eslint-plugin-css&maxAge=3600)](http://www.npmtrends.com/eslint-plugin-css)
[![NPM downloads](https://img.shields.io/npm/dw/eslint-plugin-css.svg)](http://www.npmtrends.com/eslint-plugin-css)
[![NPM downloads](https://img.shields.io/npm/dm/eslint-plugin-css.svg)](http://www.npmtrends.com/eslint-plugin-css)
[![NPM downloads](https://img.shields.io/npm/dy/eslint-plugin-css.svg)](http://www.npmtrends.com/eslint-plugin-css)
[![NPM downloads](https://img.shields.io/npm/dt/eslint-plugin-css.svg)](http://www.npmtrends.com/eslint-plugin-css)
[![Build Status](https://github.com/ota-meshi/eslint-plugin-css/workflows/CI/badge.svg?branch=main)](https://github.com/ota-meshi/eslint-plugin-css/actions?query=workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/ota-meshi/eslint-plugin-css/badge.svg?branch=main)](https://coveralls.io/github/ota-meshi/eslint-plugin-css?branch=main)

::: **WORKING IN PROGRESS** :::

## :name_badge: Features

This ESLint plugin provides linting rules to verify CSS definition objects.

- Find the wrong usage of CSS definition objects, and their hints.
- Support for Vue and JSX (React).
- Partial support for [styled-components] style objects.

You can check on the [Online DEMO](https://ota-meshi.github.io/eslint-plugin-css/playground/).

<img alt="vue" src="./images/vue.png" height="150px" style="height: 150px; display: inline-block;"><img alt="jsx" src="./images/jsx.png" height="150px" style="height: 150px; display: inline-block;">

[styled-components]: https://styled-components.com/docs/advanced#style-objects

## :question: Why is it ESLint plugin?

[Stylelint] partially supports CSS in JS, but some issues haven't been resolved for a long time.  
Also, CSS definitions using template literals are similar to CSS syntax, but CSS definitions using JavaScript objects are not. ESLint may work better for linting JavaScript objects.

[Stylelint]: https://stylelint.io

<!--DOCS_IGNORE_START-->

## :book: Documentation

See [documents](https://ota-meshi.github.io/eslint-plugin-css/).

## :cd: Installation

```bash
npm install --save-dev eslint eslint-plugin-css
```

> **Requirements**
>
> - ESLint v7.0.0 and above
> - Node.js v12.22.x, v14.17.x, v16.x and above

<!--DOCS_IGNORE_END-->

## :book: Usage

<!--USAGE_SECTION_START-->

Add `css` to the plugins section of your `.eslintrc` configuration file (you can omit the `eslint-plugin-` prefix)
and either use one of the two configurations available (`recommended` or `all`) or configure the rules you want:

### The recommended configuration (`eslint.config.js`)

The `plugin.configs["flat/recommended"]` config enables a subset of [the rules](#white_check_mark-rules) that should be most useful to most users.
*See [lib/configs/flat/recommended.ts](https://github.com/ota-meshi/eslint-plugin-regexp/blob/master/lib/configs/flat/recommended.ts) for more details.*

```js
// eslint.config.js
import * as cssPlugin from "eslint-plugin-css"
export default [
    cssPlugin.configs["flat/recommended"],
];
```

### The recommended configuration (`.eslintrc.*`)

The `plugin:css/recommended` config enables a subset of [the rules](#white_check_mark-rules) that should be most useful to most users.
*See [lib/configs/recommended.ts](https://github.com/ota-meshi/eslint-plugin-css/blob/main/lib/configs/recommended.ts) for more details.*

```js
// .eslintrc.js
module.exports = {
    "plugins": [
        "css"
    ],
    "extends": [
         // add more generic rulesets here, such as:
         // 'eslint:recommended',
        "plugin:css/recommended"
    ]
}
```

### The standard configuration (`eslint.config.js`)

The `plugin.configs["flat/standard"]` config enables a subset of [the rules](#white_check_mark-rules) and superset of `plugin.configs["flat/recommended"]` config that apply a subjective style.
*See [lib/configs/flat/standard.ts](https://github.com/ota-meshi/eslint-plugin-regexp/blob/master/lib/configs/flat/standard.ts) for more details.*

```js
// eslint.config.js
import * as cssPlugin from "eslint-plugin-css"
export default [
    cssPlugin.configs["flat/standard"],
];
```

### The standard configuration (`.eslintrc.*`)

The `plugin:css/standard` config enables a subset of [the rules](#white_check_mark-rules) and superset of `plugin:css/recommended` config that apply a subjective style.
*See [lib/configs/standard.ts](https://github.com/ota-meshi/eslint-plugin-css/blob/main/lib/configs/standard.ts) for more details.*

```js
// .eslintrc.js
module.exports = {
    "plugins": [
        "css"
    ],
    "extends": [
        "plugin:css/standard"
    ]
}
```

### Advanced Configuration

Override/add specific rules configurations. *See also: [http://eslint.org/docs/user-guide/configuring](http://eslint.org/docs/user-guide/configuring)*.

```js
// eslint.config.js
import * as cssPlugin from "eslint-plugin-css"
export default [
    {
        plugins: { css: cssPlugin },
        rules: {
            // Override/add rules settings here, such as:
            "css/rule-name": "error"
        }
    }
];
```

```js
// .eslintrc.js
module.exports = {
    "plugins": [
        "css"
    ],
    "rules": {
        // Override/add rules settings here, such as:
        "css/rule-name": "error"
    }
}
```

### Using `"plugin:css/all"`

The `plugin.configs["flat/all"]` / `plugin:css/all` config enables all rules. It's meant for testing, not for production use because it changes with every minor and major version of the plugin. Use it at your own risk.

### How does ESLint detect CSS objects?

All CSS-related rules are applied to code that passes any of the following checks:

- `style={ {} }` JSX attribute expression

    ```jsx
    const jsx = <div
        style={ {/* JSX attribute expression */} }
    />
    ```

- `v-bind:style="{}"` Vue directive

    ```vue
    <template>
        <div
            v-bind:style="{/* Vue directive */}"
        />
    </template>
    ```

- CSS definition function call for [styled-components](https://styled-components.com/docs/advanced#style-objects)

    e.g.

    ```js
    import styled, { css, createGlobalStyle } from 'styled-components'

    styled.input({/*CSS*/})
    styled.input.attrs({})({/*CSS*/})
    css({/*CSS*/})
    createGlobalStyle({/*CSS*/})
    ```

- According to [`settings.css.target` settings](../settings/index.md#target).

However, if you want to take advantage of the rules in any of your custom objects that are CSS objects, you might need to use the special comment `// @css` that marks an object in the next line as a CSS object in any file, e.g.:

```js
// @css
const myStyle = {
  height: '100px'
}
```

<!--USAGE_SECTION_END-->

## :white_check_mark: Rules

<!--RULES_SECTION_START-->

The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) automatically fixes problems reported by rules which have a wrench :wrench: below.  
The rules with the following star :star: are included in the `plugin:css/recommended` config and the `plugin:css/standard` config.  
The rules with the following lipstick :lipstick: are included in the `plugin:css/standard` config.

<!--RULES_TABLE_START-->

### Possible Errors

| Rule ID | Description |    |
|:--------|:------------|:---|
| [css/no-dupe-properties](https://ota-meshi.github.io/eslint-plugin-css/rules/no-dupe-properties.html) | disallow duplicate properties | :star: |
| [css/no-invalid-color-hex](https://ota-meshi.github.io/eslint-plugin-css/rules/no-invalid-color-hex.html) | disallow invalid hex colors | :star: |
| [css/no-shorthand-property-overrides](https://ota-meshi.github.io/eslint-plugin-css/rules/no-shorthand-property-overrides.html) | disallow shorthand properties that override related longhand properties | :star: |
| [css/no-unknown-property](https://ota-meshi.github.io/eslint-plugin-css/rules/no-unknown-property.html) | disallow unknown properties | :star: |
| [css/no-unknown-unit](https://ota-meshi.github.io/eslint-plugin-css/rules/no-unknown-unit.html) | disallow unknown units | :star: |

### Best Practices

| Rule ID | Description |    |
|:--------|:------------|:---|
| [css/named-color](https://ota-meshi.github.io/eslint-plugin-css/rules/named-color.html) | enforce named colors | :wrench: |
| [css/no-length-zero-unit](https://ota-meshi.github.io/eslint-plugin-css/rules/no-length-zero-unit.html) | disallow units for zero lengths | :lipstick::wrench: |
| [css/no-useless-color-alpha](https://ota-meshi.github.io/eslint-plugin-css/rules/no-useless-color-alpha.html) | disallow unnecessary alpha-channel transparency value | :star::wrench: |
| [css/prefer-reduce-shorthand-property-box-values](https://ota-meshi.github.io/eslint-plugin-css/rules/prefer-reduce-shorthand-property-box-values.html) | require reduction in box values of shorthand property | :lipstick::wrench: |

### Stylistic Issues

| Rule ID | Description |    |
|:--------|:------------|:---|
| [css/color-hex-style](https://ota-meshi.github.io/eslint-plugin-css/rules/color-hex-style.html) | enforce hex color style | :lipstick::wrench: |
| [css/no-number-trailing-zeros](https://ota-meshi.github.io/eslint-plugin-css/rules/no-number-trailing-zeros.html) | disallow trailing zeros in numbers. | :lipstick::wrench: |
| [css/number-leading-zero](https://ota-meshi.github.io/eslint-plugin-css/rules/number-leading-zero.html) | require or disallow a leading zero for fractional numbers less than 1 | :lipstick::wrench: |
| [css/property-casing](https://ota-meshi.github.io/eslint-plugin-css/rules/property-casing.html) | enforce specific casing for CSS properties | :lipstick::wrench: |

<!--RULES_TABLE_END-->
<!--RULES_SECTION_END-->

## :gear: Settings

See [Settings](https://ota-meshi.github.io/eslint-plugin-css/settings/).

<!--DOCS_IGNORE_START-->

<!-- TODO v1.0.0

## :traffic_light: Semantic Versioning Policy

**eslint-plugin-css** follows [Semantic Versioning](http://semver.org/) and [ESLint's Semantic Versioning Policy](https://github.com/eslint/eslint#semantic-versioning-policy).

-->

## :beers: Contributing

Welcome contributing!

Please use GitHub's Issues/PRs.

See [CONTRIBUTING.md](CONTRIBUTING.md).

### Development Tools

- `npm test` runs tests and measures coverage.
- `npm run update` runs in order to update readme and configurations.
- `npm run new [new rule name]` runs to create the files needed for the new rule.
- `npm run docs:watch` starts the website locally.

<!--DOCS_IGNORE_END-->

## :lock: License

See the [LICENSE](LICENSE) file for license rights and limitations (MIT).
