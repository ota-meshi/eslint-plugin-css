import { RuleTester } from "eslint"
import rule from "../../../lib/rules/property-casing"

const tester = new RuleTester({
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
    },
})

tester.run("property-casing", rule as any, {
    valid: [
        `
        var a = <div style={
            {
                backgroundColor: 'red'
            }
        } />
        `,
        {
            filename: "test.vue",
            code: `
            <template>
                <div :style="{
                    backgroundColor: 'red'
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
                    'background-color': 'red'
                }
            } />
            `,
            output: `
            var a = <div style={
                {
                    'backgroundColor': 'red'
                }
            } />
            `,
            errors: [
                {
                    message: "'background-color' is not in camelCase.",
                    line: 4,
                    column: 21,
                    endLine: 4,
                    endColumn: 39,
                },
            ],
        },
        {
            filename: "test.vue",
            code: `
            <template>
                <div :style="{
                    'background-color': 'red'
                }"/>
            </template>
            `,
            output: `
            <template>
                <div :style="{
                    'backgroundColor': 'red'
                }"/>
            </template>
            `,
            parser: require.resolve("vue-eslint-parser"),
            errors: [
                {
                    message: "'background-color' is not in camelCase.",
                    line: 4,
                    column: 21,
                    endLine: 4,
                    endColumn: 39,
                },
            ],
        },
        {
            code: `
            var a = <div style={
                {
                    'backgroundColor': 'red'
                }
            } />
            `,
            output: `
            var a = <div style={
                {
                    'background-color': 'red'
                }
            } />
            `,
            options: ["kebab-case"],
            errors: [
                {
                    message: "'backgroundColor' is not in kebab-case.",
                    line: 4,
                    column: 21,
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
                    'backgroundColor': 'red'
                }"/>
            </template>
            `,
            output: `
            <template>
                <div :style="{
                    'background-color': 'red'
                }"/>
            </template>
            `,
            options: ["kebab-case"],
            parser: require.resolve("vue-eslint-parser"),
            errors: [
                {
                    message: "'backgroundColor' is not in kebab-case.",
                    line: 4,
                    column: 21,
                    endLine: 4,
                    endColumn: 38,
                },
            ],
        },
        {
            code: `
            var a = <div style={
                {
                    backgroundColor: 'red'
                }
            } />
            `,
            output: null,
            options: ["kebab-case"],
            errors: [
                {
                    message: "'backgroundColor' is not in kebab-case.",
                    line: 4,
                    column: 21,
                    endLine: 4,
                    endColumn: 36,
                },
            ],
        },
    ],
})
