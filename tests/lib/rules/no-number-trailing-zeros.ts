import { RuleTester } from "eslint";
import rule from "../../../lib/rules/no-number-trailing-zeros";

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
});

tester.run("no-number-trailing-zeros", rule as any, {
  valid: [
    `
        var a = <div style={
            {
                top: '0.5px'
            }
        } />
        `,
    {
      filename: "test.vue",
      code: `
            <template>
                <div :style="{
                    top: '0.5px'
                }"/>
            </template>
            `,
      parser: require.resolve("vue-eslint-parser"),
    },
  ],
  invalid: [
    {
      code: `
            var a = <div style={
                {
                    top: '0.5000px'
                }
            } />
            `,
      output: `
            var a = <div style={
                {
                    top: '0.5px'
                }
            } />
            `,
      errors: [
        {
          message: "Unexpected trailing zero(s).",
          line: 4,
          column: 30,
          endLine: 4,
          endColumn: 33,
        },
      ],
    },
    {
      filename: "test.vue",
      code: `
            <template>
                <div :style="{
                    top: '0.500px'
                }"/>
            </template>
            `,
      output: `
            <template>
                <div :style="{
                    top: '0.5px'
                }"/>
            </template>
            `,
      parser: require.resolve("vue-eslint-parser"),
      errors: [
        {
          message: "Unexpected trailing zero(s).",
          line: 4,
          column: 30,
          endLine: 4,
          endColumn: 32,
        },
      ],
    },
  ],
});
