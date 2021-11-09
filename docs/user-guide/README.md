# User Guide

## :cd: Installation

```bash
npm install --save-dev eslint eslint-plugin-css
```

::: tip Requirements

- ESLint v8.0.0 and above
- Node.js v12.22.x, v14.17.x, v16.x and above

:::

## :book: Usage

<!--USAGE_SECTION_START-->

Add `css` to the plugins section of your `.eslintrc` configuration file (you can omit the `eslint-plugin-` prefix)
and either use one of the two configurations available (`recommended` or `all`) or configure the rules you want:

### The recommended configuration

The `plugin:css/recommended` config enables a subset of [the rules](../rules/README.md) that should be most useful to most users.
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

See [the rule list](../rules/README.md) to get the `rules` that this plugin provides.

Some rules also support [shared settings](../settings/README.md).
