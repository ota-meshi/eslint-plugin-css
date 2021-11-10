# Settings

[Shared settings](https://eslint.org/docs/user-guide/configuring/configuration-files#adding-shared-settings) are a way to configure multiple rules at once.

## :book: Usage

All settings for this plugin use the `css` namespace.

Example **.eslintrc.js**:

```js
module.exports = {
  ..., // rules, plugins, etc.

  settings: {
    // all settings for this plugin have to be in the `css` namespace
    css: {
      // define settings here, such as:
      target: {
        attributes: [],
        defineFunctions: {}
      }
    }
  }
}
```

## :gear: Available settings

### `target`

Specifies the target to use the style object.

### `target.attributes`

Specifies the attribute name or pattern that uses the style object.

#### Example of `target.attributes`

```js
module.exports = {
  ..., // rules, plugins, etc.
  settings: {
    css: {
      target: {
        attributes: [
          'css' // The plugin will also parse `css` attribute.
        ]
      }
    }
  }
}
```

### `target.defineFunctions`

Specifies the function paths that uses the style object.

#### Example of `target.defineFunctions`

```js
module.exports = {
  ..., // rules, plugins, etc.
  settings: {
    css: {
      target: {
        defineFunctions: {
          '@emotion/styled': [
            ['default', '/^\\w+$/u']
          ]
        }
      }
    }
  }
}
```
