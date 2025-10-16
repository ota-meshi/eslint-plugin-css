import { RuleTester } from "../test-lib/eslint-compat";
import rule from "../../../lib/rules/no-shorthand-property-overrides";

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
});

tester.run("no-shorthand-property-overrides", rule as any, {
  valid: [
    `
        var a = <div style={
            {
                background: 'green'
            }
        } />
        `,
    {
      filename: "test.vue",
      code: `
            <template>
                <div :style="{
                    'background-repeat': 'repeat',
                    backgroundColor: 'green'
                }"/>
            </template>
            `,

      languageOptions: {
        // eslint-disable-next-line @typescript-eslint/no-require-imports -- test
        parser: require("vue-eslint-parser"),
      },
    },
    `
        // @css
        var a = {
                'background-repeat': 'repeat',
                [background]: 'green',
            }
        `,
    `
        // @css
        var a = {
                'background-repeat': 'repeat',
                foo: {
                    background: 'green'
                }
            }
        `,
  ],
  invalid: [
    {
      code: `
            var a = <div style={
                {
                    'background-repeat': 'repeat',
                    background: 'green'
                }
            } />
            `,
      errors: [
        {
          message:
            "Unexpected shorthand 'background' after 'background-repeat'.",
          line: 5,
          column: 21,
        },
      ],
    },
    {
      filename: "test.vue",
      code: `
            <template>
                <div :style="{
                    'backgroundRepeat': 'repeat',
                    background: 'green'
                }"/>
            </template>
            `,
      errors: [
        {
          message:
            "Unexpected shorthand 'background' after 'backgroundRepeat'.",
          line: 5,
          column: 21,
        },
      ],

      languageOptions: {
        // eslint-disable-next-line @typescript-eslint/no-require-imports -- test
        parser: require("vue-eslint-parser"),
      },
    },
    {
      code: `
            // @css
            var a = {
                    'background-repeat': 'repeat',
                    background: 'green',
                    foo: {
                        background: 'green'
                    }
                }
            `,
      errors: [
        {
          message:
            "Unexpected shorthand 'background' after 'background-repeat'.",
          line: 5,
        },
      ],
    },
  ],
});
