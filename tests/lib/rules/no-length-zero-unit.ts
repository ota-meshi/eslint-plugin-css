import { RuleTester } from "eslint"
import rule from "../../../lib/rules/no-length-zero-unit"

const tester = new RuleTester({
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
    },
})

tester.run("no-length-zero-unit", rule as any, {
    valid: [
        `
        var a = <div style={
            {
                top: '0'
            }
        } />
        `,
        {
            filename: "test.vue",
            code: `
            <template>
                <div :style="{
                    top: '0'
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
                    top: '0px'
                }
            } />
            `,
            output: `
            var a = <div style={
                {
                    top: '0'
                }
            } />
            `,
            errors: [
                {
                    message: "Unexpected unit.",
                    line: 4,
                    column: 28,
                    endLine: 4,
                    endColumn: 30,
                },
            ],
        },
        {
            filename: "test.vue",
            code: `
            <template>
                <div :style="{
                    top: '0px'
                }"/>
            </template>
            `,
            output: `
            <template>
                <div :style="{
                    top: '0'
                }"/>
            </template>
            `,
            parser: require.resolve("vue-eslint-parser"),
            errors: [
                {
                    message: "Unexpected unit.",
                    line: 4,
                    column: 28,
                    endLine: 4,
                    endColumn: 30,
                },
            ],
        },
    ],
})
