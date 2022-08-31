/* global require -- global */
import assert from "assert";
import { defineCSSVisitor, createRule } from "../../../../lib/utils";
import { Linter } from "eslint";

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
              message: `${context.getSourceCode().getText(sel.expression)}=${
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
  linter.defineRule("detect-selector", testRule);
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports -- ignore
  linter.defineParser("vue-eslint-parser", require("vue-eslint-parser"));

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
          rules: {
            "detect-selector": "error",
          },
          parser,
          parserOptions: {
            ecmaVersion: 2020,
            sourceType: "module",
            ecmaFeatures: {
              jsx: true,
            },
          },
        },
        filename || "test.js"
      );
      assert.deepStrictEqual(
        result.map(({ message }) => message),
        expectedSelectors
      );
    });
  }
});
