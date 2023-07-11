/* global require -- global */
import assert from "assert";
import { defineCSSVisitor, createRule } from "../../../../lib/utils";
import { Linter } from "eslint";

const testRule1 = createRule("detect-property-key", {
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
          onProperty(property) {
            const name = property.getName();
            if (!name) {
              return;
            }
            context.report({
              node: name.expression,
              message: context.getSourceCode().getText(name.expression),
            });
          },
        };
      },
    });
  },
});
const testRule2 = createRule("detect-property-value", {
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
          onProperty(property) {
            const value = property.getValue();
            if (!value) {
              return;
            }
            context.report({
              node: value.expression,
              message: `${context.getSourceCode().getText(value.expression)}=${
                value.value
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
    keys: [],
    values: [],
  },
  {
    code: `
        const jsx = <div
            style={ {width: "foo"} }
        />`,
    keys: ["width"],
    values: ['"foo"=foo'],
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
    keys: ["width"],
    values: ["'foo'=foo"],
  },
  {
    code: `
        import styled, { css, createGlobalStyle, keyframes } from 'styled-components'
    
        styled.input({width: "foo"})
        `,
    keys: ["width"],
    values: ['"foo"=foo'],
  },
  {
    code: `
        // @css
        const myStyle = {width: "foo"}
        `,
    keys: ["width"],
    values: ['"foo"=foo'],
  },
  {
    code: `
        import styled from 'styled-components'
    
        // @css
        styled.input({width: "foo"})
        `,
    keys: ["width"],
    values: ['"foo"=foo'],
  },
  {
    code: `
        const st = {width: "foo"}
        const jsx = <div
            style={ st }
        />`,
    keys: ["width"],
    values: ['"foo"=foo'],
  },
  {
    code: `
        const st = [{width: "foo"}]
        const jsx = <div
            style={ [...st] }
        />`,
    keys: ["width"],
    values: ['"foo"=foo'],
  },
  {
    code: `
        const v = 'bar'
        const st1 = {width: \`foo\`}
        const st2 = {height: v}
        const jsx = <div
            style={ { ...st1, ...st2 } }
        />`,
    keys: ["width", "height"],
    values: ["`foo`=foo", "v=bar"],
  },
  {
    code: `
        const v = 'bar'
        const st1 = {width: "foo"}
        const st2 = {height: v}
        // @css
        const myStyle = { ...st1, ...st2 }
        `,
    keys: ["width", "height"],
    values: ['"foo"=foo', "v=bar"],
  },
  {
    code: `
        const v = 101
        const st1 = {width: 42}
        const st2 = {height: v}
        // @css
        const myStyle = { ...st1, ...st2 }
        `,
    keys: ["width", "height"],
    values: ["42=42", "v=101"],
  },
  {
    code: `
        const v = v
        const jsx = <div
            style={ {...v} }
        />`,
    keys: [],
    values: [],
  },
  {
    code: `
        const v = v
        const jsx = <div
            style={ { height: v } }
        />`,
    keys: ["height"],
    values: [],
  },
  {
    code: `
        var v = {width: 42}
        var v = {height: 42}
        const jsx = <div
            style={ {...v} }
        />`,
    keys: [],
    values: [],
  },
  {
    code: `
        let v = {width: 42}
        const jsx = <div
            style={ {...v} }
        />`,
    keys: [],
    values: [],
  },
];

describe("detect CSS properties", () => {
  const linter = new Linter();
  linter.defineRule("detect-property-key", testRule1);
  linter.defineRule("detect-property-value", testRule2);
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports -- ignore
  linter.defineParser("vue-eslint-parser", require("vue-eslint-parser"));

  for (const {
    code,
    filename,
    keys: expectedKeys,
    values: expectedValues,
    parser,
  } of TESTS) {
    it(code, () => {
      const result = linter.verify(
        code,
        {
          rules: {
            "detect-property-key": "error",
            "detect-property-value": "error",
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
        filename || "test.js",
      );
      assert.deepStrictEqual(
        result
          .filter(({ ruleId }) => ruleId === "detect-property-key")
          .map(({ message }) => message),
        expectedKeys,
      );
      assert.deepStrictEqual(
        result
          .filter(({ ruleId }) => ruleId === "detect-property-value")
          .map(({ message }) => message),
        expectedValues,
      );
    });
  }
});
