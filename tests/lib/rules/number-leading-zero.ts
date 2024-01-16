import { RuleTester } from "../test-lib/eslint-compat";
import rule from "../../../lib/rules/number-leading-zero";

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
});

tester.run("number-leading-zero", rule as any, {
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
      // @ts-expect-error -- ignore for eslint v9 property
      languageOptions: {
        // eslint-disable-next-line @typescript-eslint/no-require-imports -- test
        parser: require("vue-eslint-parser"),
      },
    },
    {
      code: `
            var a = <div style={
                {
                    top: '.5px'
                }
            } />
            `,
      options: ["never"],
    },
    {
      filename: "test.vue",
      code: `
            <template>
                <div :style="{
                    top: '.5px'
                }"/>
            </template>
            `,
      options: ["never"],
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
                    top: '.5px'
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
          message: "Expected a leading zero.",
          line: 4,
          column: 27,
          endLine: 4,
          endColumn: 29,
        },
      ],
    },
    {
      filename: "test.vue",
      code: `
            <template>
                <div :style="{
                    top: '.5px'
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
      errors: [
        {
          message: "Expected a leading zero.",
          line: 4,
          column: 27,
          endLine: 4,
          endColumn: 29,
        },
      ],
      // @ts-expect-error -- ignore for eslint v9 property
      languageOptions: {
        // eslint-disable-next-line @typescript-eslint/no-require-imports -- test
        parser: require("vue-eslint-parser"),
      },
    },
    {
      code: `
            var a = <div style={
                {
                    top: '0.5px'
                }
            } />
            `,
      output: `
            var a = <div style={
                {
                    top: '.5px'
                }
            } />
            `,
      options: ["never"],
      errors: [
        {
          message: "Unexpected leading zero.",
          line: 4,
          column: 27,
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
                    top: '0.5px'
                }"/>
            </template>
            `,
      output: `
            <template>
                <div :style="{
                    top: '.5px'
                }"/>
            </template>
            `,
      options: ["never"],
      errors: [
        {
          message: "Unexpected leading zero.",
          line: 4,
          column: 27,
          endLine: 4,
          endColumn: 28,
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
