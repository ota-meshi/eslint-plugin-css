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

You can check on the [Online DEMO](./playground/index.md).

<img alt="vue" src="./images/vue.png" height="150px" style="height: 150px; display: inline-block;"><img alt="jsx" src="./images/jsx.png" height="150px" style="height: 150px; display: inline-block;">

[styled-components]: https://styled-components.com/docs/advanced#style-objects

## :question: Why is it ESLint plugin?

[Stylelint] partially supports CSS in JS, but some issues haven't been resolved for a long time.  
Also, CSS definitions using template literals are similar to CSS syntax, but CSS definitions using JavaScript objects are not. ESLint may work better for linting JavaScript objects.

[Stylelint]: https://stylelint.io

## :book: Usage

See [User Guide](./user-guide/index.md).

## :white_check_mark: Rules

See [Available Rules](./rules/index.md).

## :gear: Settings

See [Settings](./settings/index.md).

## :lock: License

See the [LICENSE](https://github.com/ota-meshi/eslint-plugin-css/blob/main/LICENSE) file for license rights and limitations (MIT).
