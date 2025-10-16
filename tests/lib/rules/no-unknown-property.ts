import { RuleTester } from "../test-lib/eslint-compat";
import rule from "../../../lib/rules/no-unknown-property";

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
});

tester.run("no-unknown-property", rule as any, {
  valid: [
    `
        var a = <div style={
            {
                color: 'red'
            }
        } />
        `,
    {
      filename: "test.vue",
      code: `
            <template>
              <div :style="{
                color: 'red'
              }"/>
            </template>
            `,

      languageOptions: {
        // eslint-disable-next-line @typescript-eslint/no-require-imports -- test
        parser: require("vue-eslint-parser"),
      },
    },
    `
        var a = <div style={
            {
                "--color": 'red'
            }
        } />
        `,
    `
        var a = <div style={
            {
                "-unknown-unknown": 'red'
            }
        } />
        `,
    {
      code: `
            var a = <div style={
                {
                    unknown: 'red'
                }
            } />
            `,
      options: [{ ignoreProperties: ["unknown"] }],
    },
    {
      code: `
            var a = <div style={
                {
                    unknown: 'red',
                    'unknown-color': 'red',
                }
            } />
            `,
      options: [{ ignoreProperties: ["/^unknown/"] }],
    },
    {
      filename: "test.vue",
      code: `
            <template>
              <div :style="{
                cssFloat: 'left'
              }"/>
            </template>
            `,

      languageOptions: {
        // eslint-disable-next-line @typescript-eslint/no-require-imports -- test
        parser: require("vue-eslint-parser"),
      },
    },
    {
      filename: "test.vue",
      code: `
            <template>
              <div :style="{
                backgroundColor: 'red'
              }"/>
            </template>
            `,

      languageOptions: {
        // eslint-disable-next-line @typescript-eslint/no-require-imports -- test
        parser: require("vue-eslint-parser"),
      },
    },
    `
        var a = <div style={
            {
                mozTransform: 'scale(2)',
                msTransform: 'scale(2)',
                oTransform: 'scale(2)',
                webkitTransform: 'scale(2)',
            }
        } />
        `,
    `
        var a = <div style={
            {
                '-moz-transform': 'scale(2)',
                '-ms-transform': 'scale(2)',
                '-o-transform': 'scale(2)',
                '-webkit-transform': 'scale(2)',
                'transform': 'scale(2)',
            }
        } />
        `,
    `
        var a = <div style={
            {
                'MozTransform': 'scale(2)',
                'msTransform': 'scale(2)',
                'OTransform': 'scale(2)',
                'WebkitTransform': 'scale(2)',
                'transform': 'scale(2)',
            }
        } />
        `,
  ],
  invalid: [
    {
      code: `
            var a = <div style={
                {
                    unknown: 'red'
                }
            } />
            `,
      errors: [
        {
          message: "Unexpected unknown property 'unknown'.",
          line: 4,
          column: 21,
          endLine: 4,
          endColumn: 28,
        },
      ],
    },
    {
      filename: "test.vue",
      code: `
            <template>
              <div :style="{
                unknown: 'red'
              }"/>
            </template>
            `,
      errors: [
        {
          message: "Unexpected unknown property 'unknown'.",
          line: 4,
          column: 17,
          endLine: 4,
          endColumn: 24,
        },
      ],

      languageOptions: {
        // eslint-disable-next-line @typescript-eslint/no-require-imports -- test
        parser: require("vue-eslint-parser"),
      },
    },
  ],
});
