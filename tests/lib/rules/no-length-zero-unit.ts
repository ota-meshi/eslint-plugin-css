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
        {
            code: `
            var a = <div style={
                {
                    transform: 'translate(120px, 0px)'
                }
            } />
            `,
            options: [{ ignoreFunctions: ["translate"] }],
        },
    ],
    invalid: [
        {
            code: `
            var a = <div style={
                {
                    top: '0px',
                    left: '0px',
                }
            } />
            `,
            output: `
            var a = <div style={
                {
                    top: '0',
                    left: '0',
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
                {
                    message: "Unexpected unit.",
                    line: 5,
                    column: 29,
                    endLine: 5,
                    endColumn: 31,
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
        {
            code: `
            var a = <div style={
                {
                    top: '0px',
                    left: '0px',
                }
            } />
            `,
            output: `
            var a = <div style={
                {
                    top: '0px',
                    left: '0',
                }
            } />
            `,
            options: [{ ignoreProperties: ["top"] }],
            errors: [
                {
                    message: "Unexpected unit.",
                    line: 5,
                },
            ],
        },
        {
            code: `
            var a = <div style={
                {
                    transform: 'translate(120px, 0px)'
                }
            } />
            `,
            output: `
            var a = <div style={
                {
                    transform: 'translate(120px, 0)'
                }
            } />
            `,
            errors: [
                {
                    message: "Unexpected unit.",
                    line: 4,
                },
            ],
        },
    ],
})
