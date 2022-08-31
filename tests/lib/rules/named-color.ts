import { RuleTester } from "eslint";
import rule from "../../../lib/rules/named-color";

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
});

tester.run("named-color", rule as any, {
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
      parser: require.resolve("vue-eslint-parser"),
    },
    {
      code: `
            var a = <div style={
                {
                    color: '#f00',
                    backgroundColor: '#f00f',
                    borderColor: '#ff0000 rgb(255, 0, 0) rgb(100%, 0%, 0%) rgba(255, 0, 0, 1)',
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
                    color: '#f00',
                    backgroundColor: '#f00f',
                    borderColor: 'hsl(0, 0%, 0%) hwb(0, 0%, 100%) gray(100)',
                }"/>
            </template>
            `,
      options: ["never"],
      parser: require.resolve("vue-eslint-parser"),
    },
  ],
  invalid: [
    {
      code: `
            var a = <div style={
                {
                    color: '#f00',
                    backgroundColor: '#f00f',
                    borderColor: '#ff0000 rgb(255, 0, 0) rgb(100%, 0%, 0%) rgba(255, 0, 0, 1)',
                }
            } />
            `,
      output: `
            var a = <div style={
                {
                    color: 'red',
                    backgroundColor: 'red',
                    borderColor: 'red red red red',
                }
            } />
            `,
      errors: [
        {
          message: "Expected '#f00' to be 'red'.",
          line: 4,
          column: 29,
        },
        {
          message: "Expected '#f00f' to be 'red'.",
          line: 5,
          column: 39,
        },
        {
          message: "Expected '#ff0000' to be 'red'.",
          line: 6,
          column: 35,
        },
        {
          message: "Expected 'rgb(255, 0, 0)' to be 'red'.",
          line: 6,
          column: 43,
        },
        {
          message: "Expected 'rgb(100%, 0%, 0%)' to be 'red'.",
          line: 6,
          column: 58,
        },
        {
          message: "Expected 'rgba(255, 0, 0, 1)' to be 'red'.",
          line: 6,
          column: 76,
        },
      ],
    },
    {
      filename: "test.vue",
      code: `
            <template>
                <div :style="{
                    color: '#f00',
                    backgroundColor: '#f00f',
                    borderColor: 'hsl(0, 0%, 0%) hwb(0, 0%, 100%) gray(100)',
                }"/>
            </template>
            `,
      output: `
            <template>
                <div :style="{
                    color: 'red',
                    backgroundColor: 'red',
                    borderColor: 'black black white',
                }"/>
            </template>
            `,
      parser: require.resolve("vue-eslint-parser"),
      errors: [
        {
          message: "Expected '#f00' to be 'red'.",
          line: 4,
          column: 29,
        },
        {
          message: "Expected '#f00f' to be 'red'.",
          line: 5,
          column: 39,
        },
        {
          message: "Expected 'hsl(0, 0%, 0%)' to be 'black'.",
          line: 6,
          column: 35,
        },
        {
          message: "Expected 'hwb(0, 0%, 100%)' to be 'black'.",
          line: 6,
          column: 50,
        },
        {
          message: "Expected 'gray(100)' to be 'white'.",
          line: 6,
          column: 67,
        },
      ],
    },
    {
      filename: "test.vue",
      code: `
            <template>
                <div :style="{
                    color: 'hwb(0 0% 100%)',
                    backgroundColor: 'hsl(0deg 100% 50%)',
                    borderColor: 'hwb(0 0% 100%) lab(100% 0 0) lab(100% 0 0 / 1) lch(29.2345% 44.2 27)',
                }"/>
            </template>
            `,
      output: `
            <template>
                <div :style="{
                    color: 'black',
                    backgroundColor: 'red',
                    borderColor: 'black white white lch(29.2345% 44.2 27)',
                }"/>
            </template>
            `,
      parser: require.resolve("vue-eslint-parser"),
      errors: [
        "Expected 'hwb(0 0% 100%)' to be 'black'.",
        "Expected 'hsl(0deg 100% 50%)' to be 'red'.",
        "Expected 'hwb(0 0% 100%)' to be 'black'.",
        "Expected 'lab(100% 0 0)' to be 'white'.",
        "Expected 'lab(100% 0 0 / 1)' to be 'white'.",
      ],
    },
    {
      code: `
            var a = <div style={
                {
                    color: 'red'
                }
            } />
            `,
      output: `
            var a = <div style={
                {
                    color: '#f00'
                }
            } />
            `,
      options: ["never"],
      errors: [
        {
          message: "Expected 'red' to be '#f00'.",
          line: 4,
          column: 29,
        },
      ],
    },
    {
      filename: "test.vue",
      code: `
            <template>
                <div :style="{
                    color: 'red'
                }"/>
            </template>
            `,
      output: `
            <template>
                <div :style="{
                    color: '#f00'
                }"/>
            </template>
            `,
      options: ["never"],
      parser: require.resolve("vue-eslint-parser"),
      errors: [
        {
          message: "Expected 'red' to be '#f00'.",
          line: 4,
          column: 29,
        },
      ],
    },
  ],
});
