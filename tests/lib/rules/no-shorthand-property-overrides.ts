import { RuleTester } from "eslint"
import rule from "../../../lib/rules/no-shorthand-property-overrides"

const tester = new RuleTester({
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
    },
})

tester.run("no-shorthand-property-overrides", rule as any, {
    valid: [
        `
        var a = <div style={
            {
                background: 'green'
            }
        } />
        `,
        {
            filename: "test.vue",
            code: `
            <template>
                <div :style="{
                    'background-repeat': 'repeat',
                    backgroundColor: 'green'
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
                    'background-repeat': 'repeat',
                    background: 'green'
                }
            } />
            `,
            errors: [
                {
                    message:
                        "Unexpected shorthand 'background' after 'background-repeat'.",
                    line: 5,
                    column: 21,
                },
            ],
        },
        {
            filename: "test.vue",
            code: `
            <template>
                <div :style="{
                    'backgroundRepeat': 'repeat',
                    background: 'green'
                }"/>
            </template>
            `,
            parser: require.resolve("vue-eslint-parser"),
            errors: [
                {
                    message:
                        "Unexpected shorthand 'background' after 'backgroundRepeat'.",
                    line: 5,
                    column: 21,
                },
            ],
        },
    ],
})
