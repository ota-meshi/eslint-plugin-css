/* global require -- global */
import assert from "assert";
import { defineCSSVisitor, createRule } from "../../../../lib/utils";
import { Linter } from "../../test-lib/eslint-compat";
import { getSourceCode } from "eslint-compat-utils";

const testRule = createRule("detect-css", {
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
      createVisitor(cssContext) {
        context.report({
          node: cssContext.define,
          message: getSourceCode(context).getText(cssContext.define),
        });
        return {};
      },
    });
  },
});

const TESTS = [
  {
    code: "foo = {}",
    filename: "test.js",
    count: 0,
  },
  {
    code: `
        const jsx = <div
            style={ {/*CSS*/} }
        />`,
    count: 1,
  },
  {
    code: `
        <template>
            <div
                v-bind:style="{/*CSS*/}"
            />
        </template>`,
    parser: "vue-eslint-parser",
    filename: "test.vue",
    count: 1,
  },
  {
    code: `
        import styled, { css, createGlobalStyle, keyframes } from 'styled-components'
    
        styled.input({/*CSS*/})
        styled.input.attrs({})({/*CSS*/})
        css({/*CSS*/})
        createGlobalStyle({/*CSS*/})
        keyframes({/*CSS*/})
        styled('div')({/*CSS*/})
        styled('div').withConfig({})({/*CSS*/})
        `,
    count: 7,
  },
  {
    code: `
        // @css
        const myStyle = {/*CSS*/}
        `,
    count: 1,
  },
  {
    code: `
        import styled from 'styled-components'
    
        // @css
        styled.input({/*CSS*/})
        `,
    count: 1,
  },
  {
    code: `
        import styled from '@emotion/styled'
    
        styled.input({/*CSS*/})
        `,
    count: 0,
  },
  {
    code: `
        import styled from '@emotion/styled'
    
        styled.input({/*CSS*/})
        `,
    count: 1,
    settings: {
      css: {
        target: {
          defineFunctions: {
            "@emotion/styled": [["default", "/^\\w+$/u"]],
          },
        },
      },
    },
  },
];

describe("detect CSS objects", () => {
  const linter = new Linter();
  for (const { code, filename, count, parser, settings } of TESTS) {
    it(code, () => {
      const result = linter.verify(
        code,
        {
          files: ["**"],
          plugins: {
            // @ts-expect-error -- ignore
            test: {
              rules: {
                "detect-css": testRule,
              },
            },
          },
          rules: { "test/detect-css": "error" },
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
          settings: settings || {},
        },
        filename || "test.js",
      );
      assert.strictEqual(result.length, count);
      for (const { message } of result) {
        assert.strictEqual(message, "{/*CSS*/}");
      }
    });
  }
});
