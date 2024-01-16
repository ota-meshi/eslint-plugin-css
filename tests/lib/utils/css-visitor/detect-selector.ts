/* global require -- global */
import assert from "assert";
import { defineCSSVisitor, createRule } from "../../../../lib/utils";
import { Linter } from "../../test-lib/eslint-compat";
import { getSourceCode } from "eslint-compat-utils";

const testRule = createRule("detect-selector", {
  meta: {
    docs: {
      description: "",
      category: "Stylistic Issues",
      recommended: false,
      stylelint: null,
    },
    schema: [],
    messages: {},
    type: "layout",
  },
  create(context) {
    return defineCSSVisitor(context, {
      createVisitor(_cssContext) {
        return {
          onRule(rule) {
            const sel = rule.getSelector();
            if (!sel) {
              return;
            }
            context.report({
              node: sel.expression,
              message: `${getSourceCode(context).getText(sel.expression)}=${
                sel.selector
              }`,
            });
          },
        };
      },
    });
  },
});

const TESTS = [
  {
    code: "foo = { foo: ''}",
    filename: "test.js",
    selectors: [],
  },
  {
    code: `
        const jsx = <div
            style={ {width: "foo"} }
        />`,
    selectors: [],
  },
  {
    code: `
        <template>
            <div
                v-bind:style="{width: 'foo'}"
            />
        </template>`,
    parser: "vue-eslint-parser",
    filename: "test.vue",
    selectors: [],
  },
  {
    code: `
        import styled from 'styled-components'
    
        styled.input({width: "foo"})
        `,
    selectors: [],
  },
  {
    code: `
        // @css
        const myStyle = {width: "foo"}
        `,
    selectors: [],
  },
  {
    code: `
        const jsx = <div
            style={ {sel: {width: "foo"} } }
        />`,
    selectors: [],
  },
  {
    code: `
        <template>
            <div
                v-bind:style="{sel: {width: 'foo'} }"
            />
        </template>`,
    parser: "vue-eslint-parser",
    filename: "test.vue",
    selectors: [],
  },
  {
    code: `
        import styled from 'styled-components'
    
        styled.input({sel: {width: "foo"} })
        `,
    selectors: ["sel=sel"],
  },
  {
    code: `
        // @css
        const myStyle = {sel: {width: "foo"} }
        `,
    selectors: ["sel=sel"],
  },
  {
    code: `
        const s = 'sel'
        // @css
        const myStyle = {[s]: {width: "foo"} }
        `,
    selectors: ["s=sel"],
  },
];

describe("detect CSS properties", () => {
  const linter = new Linter();

  for (const {
    code,
    filename,
    selectors: expectedSelectors,
    parser,
  } of TESTS) {
    it(code, () => {
      const result = linter.verify(
        code,
        {
          files: ["**"],
          plugins: {
            // @ts-expect-error -- ignore
            test: {
              rules: {
                "detect-selector": testRule,
              },
            },
          },
          rules: {
            "test/detect-selector": "error",
          },
          languageOptions: {
            ecmaVersion: 2020,
            sourceType: "module",
            ...(parser === "vue-eslint-parser"
              ? // eslint-disable-next-line @typescript-eslint/no-require-imports -- test
                { parser: require("vue-eslint-parser") }
              : {}),
            parserOptions: {
              ecmaFeatures: {
                jsx: true,
              },
            },
          },
        },
        filename || "test.js",
      );
      assert.deepStrictEqual(
        result.map(({ message }) => message),
        expectedSelectors,
      );
    });
  }
});
