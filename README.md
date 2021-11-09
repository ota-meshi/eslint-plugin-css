# Introduction

[eslint-plugin-css](https://www.npmjs.com/package/eslint-plugin-css) is an ESLint plugin that provides rules to verify CSS definition objects.

[![NPM license](https://img.shields.io/npm/l/eslint-plugin-css.svg)](https://www.npmjs.com/package/eslint-plugin-css)
[![NPM version](https://img.shields.io/npm/v/eslint-plugin-css.svg)](https://www.npmjs.com/package/eslint-plugin-css)
[![NPM downloads](https://img.shields.io/badge/dynamic/json.svg?label=downloads&colorB=green&suffix=/day&query=$.downloads&uri=https://api.npmjs.org//downloads/point/last-day/eslint-plugin-css&maxAge=3600)](http://www.npmtrends.com/eslint-plugin-css)
[![NPM downloads](https://img.shields.io/npm/dw/eslint-plugin-css.svg)](http://www.npmtrends.com/eslint-plugin-css)
[![NPM downloads](https://img.shields.io/npm/dm/eslint-plugin-css.svg)](http://www.npmtrends.com/eslint-plugin-css)
[![NPM downloads](https://img.shields.io/npm/dy/eslint-plugin-css.svg)](http://www.npmtrends.com/eslint-plugin-css)
[![NPM downloads](https://img.shields.io/npm/dt/eslint-plugin-css.svg)](http://www.npmtrends.com/eslint-plugin-css)
[![Build Status](https://github.com/ota-meshi/eslint-plugin-css/workflows/CI/badge.svg?branch=master)](https://github.com/ota-meshi/eslint-plugin-css/actions?query=workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/ota-meshi/eslint-plugin-css/badge.svg?branch=master)](https://coveralls.io/github/ota-meshi/eslint-plugin-css?branch=master)

## :name_badge: Features

This ESLint plugin provides linting rules to verify CSS definition objects.

- Find the wrong usage of CSS definition objects, and their hints.
- The plugin supports Vue and JSX (React).

You can check on the [Online DEMO](https://ota-meshi.github.io/eslint-plugin-css/playground/).

<!--DOCS_IGNORE_START-->

## :book: Documentation

See [documents](https://ota-meshi.github.io/eslint-plugin-css/).

## :cd: Installation

```bash
npm install --save-dev eslint eslint-plugin-css
```

> **Requirements**
>
> - ESLint v8.0.0 and above
> - Node.js v12.22.x, v14.17.x, v16.x and above

<!--DOCS_IGNORE_END-->

## :book: Usage

<!--USAGE_SECTION_START-->

Add `css` to the plugins section of your `.eslintrc` configuration file (you can omit the `eslint-plugin-` prefix)
and either use one of the two configurations available (`recommended` or `all`) or configure the rules you want:

### The recommended configuration

The `plugin:css/recommended` config enables a subset of [the rules](#white_check_mark-rules) that should be most useful to most users.
*See [lib/configs/recommended.ts](https://github.com/ota-meshi/eslint-plugin-css/blob/master/lib/configs/recommended.ts) for more details.*

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

### Advanced Configuration

Override/add specific rules configurations. *See also: [http://eslint.org/docs/user-guide/configuring](http://eslint.org/docs/user-guide/configuring)*.

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

The `plugin:css/all` config enables all rules. It's meant for testing, not for production use because it changes with every minor and major version of the plugin. Use it at your own risk.
*See [lib/configs/all.ts](https://github.com/ota-meshi/eslint-plugin-css/blob/master/lib/configs/all.ts) for more details.*

<!--USAGE_SECTION_END-->

## :white_check_mark: Rules

<!--RULES_SECTION_START-->

The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) automatically fixes problems reported by rules which have a wrench :wrench: below.
The rules with the following star :star: are included in the `plugin:css/recommended` config.

<!--RULES_TABLE_START-->

### Possible Errors

| Rule ID | Description |    |
|:--------|:------------|:---|
| [css/no-unknown-property](https://ota-meshi.github.io/eslint-plugin-css/rules/no-unknown-property.html) | disallow unknown properties | :star: |

### Best Practices

| Rule ID | Description |    |
|:--------|:------------|:---|
| [css/no-length-zero-unit](https://ota-meshi.github.io/eslint-plugin-css/rules/no-length-zero-unit.html) | disallow units for zero lengths | :wrench: |

### Stylistic Issues

| Rule ID | Description |    |
|:--------|:------------|:---|

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
- `npm run update` runs in order to update readme and recommended configuration.
- `npm run new [new rule name]` runs to create the files needed for the new rule.
- `npm run docs:watch` starts the website locally.

<!--DOCS_IGNORE_END-->

## :lock: License

See the [LICENSE](LICENSE) file for license rights and limitations (MIT).
