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
        {
            code: `
            var a = <div style={
                {
                    height: '10pixels'
                }
            } />
            `,
            options: [{ ignoreUnits: ["pixels"] }],
        },
        {
            code: `
            var a = <div style={
                {
                    height: 'calc(10pixels)'
                }
            } />
            `,
            options: [{ ignoreFunctions: ["calc"] }],
        },
        // ignore image-resolution, image-set
        `
        var a = <div style={
            {
                'image-resolution': '1x',
                'background-image': "image-set('img-1x.jpg' 1x, 'img-2x.jpg' 2x, 'img-3x.jpg' 3x)"
            }
        } />
        `,
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
                    message: "Unexpected unknown unit 'pixels'.",
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
                    message: "Unexpected unknown unit 'pixels'.",
                    line: 4,
                    column: 30,
                    endLine: 4,
                    endColumn: 38,
                },
            ],
        },
        {
            code: `
            var a = <div style={
                {
                    height: 'calc(10pixels)'
                }
            } />
            `,
            errors: [
                {
                    message: "Unexpected unknown unit 'pixels'.",
                    line: 4,
                },
            ],
        },
    ],
})
