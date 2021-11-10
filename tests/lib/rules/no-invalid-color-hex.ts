import { RuleTester } from "eslint"
import rule from "../../../lib/rules/no-invalid-color-hex"

const tester = new RuleTester({
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
    },
})

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
            parser: require.resolve("vue-eslint-parser"),
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
            parser: require.resolve("vue-eslint-parser"),
            errors: [
                {
                    message: "Unexpected invalid hex color '#ggg'.",
                    line: 4,
                    column: 29,
                    endLine: 4,
                    endColumn: 33,
                },
            ],
        },
    ],
})
