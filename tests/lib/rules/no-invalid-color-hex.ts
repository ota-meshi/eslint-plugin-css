import { RuleTester } from "../test-lib/eslint-compat";
import rule from "../../../lib/rules/no-invalid-color-hex";

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
});

tester.run("no-invalid-color-hex", rule as any, {
  valid: [
    `
        var a = <div style={
            {
                color: '#fff'
            }
        } />
        `,
    {
      filename: "test.vue",
      code: `
            <template>
                <div :style="{
                    color: '#fff'
                }"/>
            </template>
            `,
      // @ts-expect-error -- ignore for eslint v9 property
      languageOptions: {
        // eslint-disable-next-line @typescript-eslint/no-require-imports -- test
        parser: require("vue-eslint-parser"),
      },
    },
  ],
  invalid: [
    {
      code: `
            var a = <div style={
                {
                    color: '#ff'
                }
            } />
            `,
      errors: [
        {
          message: "Unexpected invalid hex color '#ff'.",
          line: 4,
          column: 29,
          endLine: 4,
          endColumn: 32,
        },
      ],
    },
    {
      filename: "test.vue",
      code: `
            <template>
                <div :style="{
                    color: '#ggg'
                }"/>
            </template>
            `,
      errors: [
        {
          message: "Unexpected invalid hex color '#ggg'.",
          line: 4,
          column: 29,
          endLine: 4,
          endColumn: 33,
        },
      ],
      // @ts-expect-error -- ignore for eslint v9 property
      languageOptions: {
        // eslint-disable-next-line @typescript-eslint/no-require-imports -- test
        parser: require("vue-eslint-parser"),
      },
    },
  ],
});
