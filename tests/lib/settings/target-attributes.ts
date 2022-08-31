import { RuleTester } from "eslint";
import rule from "../../../lib/rules/property-casing";

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: { jsx: true },
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
      parser: require.resolve("vue-eslint-parser"),
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
      parser: require.resolve("vue-eslint-parser"),
      errors: ["'background-color' is not in camelCase."],
    },
  ],
});
