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

tester.run("property-casing", rule as any, {
  valid: [
    `
        var a = <div style={
            {
                backgroundColor: 'red'
            }
        } />
        `,
    {
      filename: "test.vue",
      code: `
            <template>
                <div :style="{
                    backgroundColor: 'red'
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
                    '-moz-transform': 'scale(2)',
                    '-ms-transform': 'scale(2)',
                    '-o-transform': 'scale(2)',
                    '-webkit-transform': 'scale(2)',
                    'transform': 'scale(2)',
                }
            } />
            `,
      options: ["kebab-case"],
    },
    {
      code: `
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
      options: ["camelCase"],
    },
  ],
  invalid: [
    {
      code: `
            var a = <div style={
                {
                    'background-color': 'red'
                }
            } />
            `,
      output: `
            var a = <div style={
                {
                    'backgroundColor': 'red'
                }
            } />
            `,
      errors: [
        {
          message: "'background-color' is not in camelCase.",
          line: 4,
          column: 21,
          endLine: 4,
          endColumn: 39,
        },
      ],
    },
    {
      filename: "test.vue",
      code: `
            <template>
                <div :style="{
                    'background-color': 'red'
                }"/>
            </template>
            `,
      output: `
            <template>
                <div :style="{
                    'backgroundColor': 'red'
                }"/>
            </template>
            `,
      errors: [
        {
          message: "'background-color' is not in camelCase.",
          line: 4,
          column: 21,
          endLine: 4,
          endColumn: 39,
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
                    'backgroundColor': 'red'
                }
            } />
            `,
      output: `
            var a = <div style={
                {
                    'background-color': 'red'
                }
            } />
            `,
      options: ["kebab-case"],
      errors: [
        {
          message: "'backgroundColor' is not in kebab-case.",
          line: 4,
          column: 21,
          endLine: 4,
          endColumn: 38,
        },
      ],
    },
    {
      filename: "test.vue",
      code: `
            <template>
                <div :style="{
                    'backgroundColor': 'red'
                }"/>
            </template>
            `,
      output: `
            <template>
                <div :style="{
                    'background-color': 'red'
                }"/>
            </template>
            `,
      options: ["kebab-case"],
      errors: [
        {
          message: "'backgroundColor' is not in kebab-case.",
          line: 4,
          column: 21,
          endLine: 4,
          endColumn: 38,
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
                    backgroundColor: 'red'
                }
            } />
            `,
      output: null,
      options: ["kebab-case"],
      errors: [
        {
          message: "'backgroundColor' is not in kebab-case.",
          line: 4,
          column: 21,
          endLine: 4,
          endColumn: 36,
        },
      ],
    },
    {
      code: `
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
      output: `
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
      errors: [
        "'-moz-transform' is not in camelCase.",
        "'-ms-transform' is not in camelCase.",
        "'-o-transform' is not in camelCase.",
        "'-webkit-transform' is not in camelCase.",
      ],
    },
    {
      code: `
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
      output: `
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
      options: ["kebab-case"],
      errors: [
        "'MozTransform' is not in kebab-case.",
        "'msTransform' is not in kebab-case.",
        "'OTransform' is not in kebab-case.",
        "'WebkitTransform' is not in kebab-case.",
      ],
    },
    {
      filename: "test.vue",
      code: `
            <template>
                <div :style="[
                    {
                        'background-color': 'red'
                    },
                    {
                        'border-color': 'red'
                    },
                ]"/>
            </template>
            `,
      output: `
            <template>
                <div :style="[
                    {
                        'backgroundColor': 'red'
                    },
                    {
                        'borderColor': 'red'
                    },
                ]"/>
            </template>
            `,
      errors: [
        "'background-color' is not in camelCase.",
        "'border-color' is not in camelCase.",
      ],
      // @ts-expect-error -- ignore for eslint v9 property
      languageOptions: {
        // eslint-disable-next-line @typescript-eslint/no-require-imports -- test
        parser: require("vue-eslint-parser"),
      },
    },
    {
      code: `
            import styled from 'styled-components'
            const Box = styled.div({
                'border-color': 'red',
            });
            const Overlay = styled.div(() => ({
                'background-color': 'red',
            }));
            const Overlay2 = styled.div(function () {
                return {
                    'background-color': 'red',
                }
            });
            `,
      output: `
            import styled from 'styled-components'
            const Box = styled.div({
                'borderColor': 'red',
            });
            const Overlay = styled.div(() => ({
                'backgroundColor': 'red',
            }));
            const Overlay2 = styled.div(function () {
                return {
                    'backgroundColor': 'red',
                }
            });
            `,
      errors: [
        "'border-color' is not in camelCase.",
        "'background-color' is not in camelCase.",
        "'background-color' is not in camelCase.",
      ],
    },
    {
      code: `
            import {css} from 'styled-components'
            css({
                "selector-kebab": {
                    'border-color': 'red',
                }
            });
            `,
      output: `
            import {css} from 'styled-components'
            css({
                "selector-kebab": {
                    'borderColor': 'red',
                }
            });
            `,
      errors: ["'border-color' is not in camelCase."],
    },
  ],
});
