import { RuleTester } from "eslint"
import rule from "../../../lib/rules/no-dupe-properties"

const tester = new RuleTester({
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
    },
})

tester.run("no-dupe-properties", rule as any, {
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
                    'background-color': 'blue',
                    backgroundColor: 'red'
                }
            } />
            `,
            errors: [
                {
                    message:
                        "Duplicate property 'background-color' and 'backgroundColor'.",
                    line: 4,
                    column: 21,
                    endLine: 4,
                    endColumn: 39,
                },
                {
                    message:
                        "Duplicate property 'backgroundColor' and 'background-color'.",
                    line: 5,
                    column: 21,
                    endLine: 5,
                    endColumn: 36,
                },
            ],
        },
        {
            filename: "test.vue",
            code: `
            <template>
                <div :style="{
                    'background-color': 'blue',
                    backgroundColor: 'red'
                }"/>
            </template>
            `,
            parser: require.resolve("vue-eslint-parser"),
            errors: [
                {
                    message:
                        "Duplicate property 'background-color' and 'backgroundColor'.",
                    line: 4,
                    column: 21,
                    endLine: 4,
                    endColumn: 39,
                },
                {
                    message:
                        "Duplicate property 'backgroundColor' and 'background-color'.",
                    line: 5,
                    column: 21,
                    endLine: 5,
                    endColumn: 36,
                },
            ],
        },
        {
            code: `
            import {css} from 'styled-components'
            css({
                'borderColor': 'red',
                "selector": {
                    'border-color': 'red',
                    'borderColor': 'red',
                }
            });
            `,
            errors: [
                {
                    message:
                        "Duplicate property 'border-color' and 'borderColor'.",
                    line: 6,
                },
                {
                    message:
                        "Duplicate property 'borderColor' and 'border-color'.",
                    line: 7,
                },
            ],
        },
    ],
})
