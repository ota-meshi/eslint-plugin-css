import { RuleTester } from "eslint"
import rule from "../../../lib/rules/number-leading-zero"

const tester = new RuleTester({
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
    },
})

tester.run("number-leading-zero", rule as any, {
    valid: [
        `
        var a = <div style={
            {
                top: '0.5px'
            }
        } />
        `,
        {
            filename: "test.vue",
            code: `
            <template>
                <div :style="{
                    top: '0.5px'
                }"/>
            </template>
            `,
            parser: require.resolve("vue-eslint-parser"),
        },
        {
            code: `
            var a = <div style={
                {
                    top: '.5px'
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
                    top: '.5px'
                }"/>
            </template>
            `,
            options: ["never"],
        },
    ],
    invalid: [
        {
            code: `
            var a = <div style={
                {
                    top: '.5px'
                }
            } />
            `,
            output: `
            var a = <div style={
                {
                    top: '0.5px'
                }
            } />
            `,
            errors: [
                {
                    message: "Expected a leading zero.",
                    line: 4,
                    column: 27,
                    endLine: 4,
                    endColumn: 29,
                },
            ],
        },
        {
            filename: "test.vue",
            code: `
            <template>
                <div :style="{
                    top: '.5px'
                }"/>
            </template>
            `,
            output: `
            <template>
                <div :style="{
                    top: '0.5px'
                }"/>
            </template>
            `,
            parser: require.resolve("vue-eslint-parser"),
            errors: [
                {
                    message: "Expected a leading zero.",
                    line: 4,
                    column: 27,
                    endLine: 4,
                    endColumn: 29,
                },
            ],
        },
        {
            code: `
            var a = <div style={
                {
                    top: '0.5px'
                }
            } />
            `,
            output: `
            var a = <div style={
                {
                    top: '.5px'
                }
            } />
            `,
            options: ["never"],
            errors: [
                {
                    message: "Unexpected leading zero.",
                    line: 4,
                    column: 27,
                    endLine: 4,
                    endColumn: 28,
                },
            ],
        },
        {
            filename: "test.vue",
            code: `
            <template>
                <div :style="{
                    top: '0.5px'
                }"/>
            </template>
            `,
            output: `
            <template>
                <div :style="{
                    top: '.5px'
                }"/>
            </template>
            `,
            options: ["never"],
            parser: require.resolve("vue-eslint-parser"),
            errors: [
                {
                    message: "Unexpected leading zero.",
                    line: 4,
                    column: 27,
                    endLine: 4,
                    endColumn: 28,
                },
            ],
        },
    ],
})
