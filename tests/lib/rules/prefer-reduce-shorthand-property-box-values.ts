import { RuleTester } from "eslint";
import rule from "../../../lib/rules/prefer-reduce-shorthand-property-box-values";

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
});

tester.run("prefer-reduce-shorthand-property-box-values", rule as any, {
  valid: [
    `
        var a = <div style={
            {
                padding: '8px'
            }
        } />
        `,
    {
      filename: "test.vue",
      code: `
            <template>
                <div :style="{
                    padding: '8px'
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
                    padding: '8px 8px',
                    margin: '8px 8px 8px',
                    'borderColor': 'red red red red',
                }
            } />
            `,
      output: `
            var a = <div style={
                {
                    padding: '8px',
                    margin: '8px',
                    'borderColor': 'red',
                }
            } />
            `,
      errors: [
        {
          message: "Unexpected longhand value '8px 8px' instead of '8px'.",
          line: 4,
          column: 31,
        },
        {
          message: "Unexpected longhand value '8px 8px 8px' instead of '8px'.",
          line: 5,
          column: 30,
        },
        {
          message:
            "Unexpected longhand value 'red red red red' instead of 'red'.",
          line: 6,
          column: 37,
        },
      ],
    },
    {
      filename: "test.vue",
      code: `
            <template>
                <div :style="{
                    padding: '8px 8px',
                    margin: '8px 16px 8px',
                    'borderColor': 'red #fff blue #fff',
                }"/>
            </template>
            `,
      output: `
            <template>
                <div :style="{
                    padding: '8px',
                    margin: '8px 16px',
                    'borderColor': 'red #fff blue',
                }"/>
            </template>
            `,
      parser: require.resolve("vue-eslint-parser"),
      errors: [
        {
          message: "Unexpected longhand value '8px 8px' instead of '8px'.",
          line: 4,
          column: 31,
        },
        {
          message:
            "Unexpected longhand value '8px 16px 8px' instead of '8px 16px'.",
          line: 5,
          column: 30,
        },
        {
          message:
            "Unexpected longhand value 'red #fff blue #fff' instead of 'red #fff blue'.",
          line: 6,
          column: 37,
        },
      ],
    },
  ],
});
