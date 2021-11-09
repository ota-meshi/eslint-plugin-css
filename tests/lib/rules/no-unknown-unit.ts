import { RuleTester } from "eslint"
import rule from "../../../lib/rules/no-unknown-unit"

const tester = new RuleTester({
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
    },
})

tester.run("no-unknown-unit", rule as any, {
    valid: [
        `
        var a = <div style={
            {
                height: '10px'
            }
        } />
        `,
        {
            filename: "test.vue",
            code: `
            <template>
                <div :style="{
                    height: '10px'
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
                    height: '10pixels'
                }
            } />
            `,
            errors: [
                {
                    message: "Unexpected unknown unit 'pixels'",
                    line: 4,
                    column: 30,
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
                    height: '10pixels'
                }"/>
            </template>
            `,
            parser: require.resolve("vue-eslint-parser"),
            errors: [
                {
                    message: "Unexpected unknown unit 'pixels'",
                    line: 4,
                    column: 30,
                    endLine: 4,
                    endColumn: 38,
                },
            ],
        },
    ],
})
