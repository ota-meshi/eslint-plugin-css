import { RuleTester } from "../test-lib/eslint-compat";
import rule from "../../../lib/rules/property-casing";

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
});

tester.run("settings-target-attributes", rule as any, {
  valid: [
    `
        var a = <div css={
            {
                'background-color': 'red'
            }
        } />
        `,
    {
      filename: "test.vue",
      code: `
            <template>
                <div :css="{
                    'background-color': 'red'
                }"/>
            </template>
            `,

      languageOptions: {
        // eslint-disable-next-line @typescript-eslint/no-require-imports -- test
        parser: require("vue-eslint-parser"),
      },
    },
  ],
  invalid: [
    {
      code: `
            var a = <div css={
                {
                    'background-color': 'red'
                }
            } />
            `,
      settings: {
        css: {
          target: {
            attributes: ["css"],
          },
        },
      },
      output: `
            var a = <div css={
                {
                    'backgroundColor': 'red'
                }
            } />
            `,
      errors: ["'background-color' is not in camelCase."],
    },
    {
      filename: "test.vue",
      code: `
            <template>
                <div :css="{
                    'background-color': 'red'
                }"/>
            </template>
            `,
      settings: {
        css: {
          target: {
            attributes: ["css"],
          },
        },
      },
      output: `
            <template>
                <div :css="{
                    'backgroundColor': 'red'
                }"/>
            </template>
            `,

      languageOptions: {
        // eslint-disable-next-line @typescript-eslint/no-require-imports -- test
        parser: require("vue-eslint-parser"),
      },
      errors: ["'background-color' is not in camelCase."],
    },
  ],
});
