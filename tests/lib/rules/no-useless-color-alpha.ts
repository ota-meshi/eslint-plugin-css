import { RuleTester } from "eslint"
import rule from "../../../lib/rules/no-useless-color-alpha"

const tester = new RuleTester({
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
    },
})

tester.run("no-useless-color-alpha", rule as any, {
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
                    color: '#ffffff'
                }"/>
            </template>
            `,
            parser: require.resolve("vue-eslint-parser"),
        },
        `
        var a = <div style={
            {
                color: 'rgb(from var(--bg-color) r g b / 80%)'
            }
        } />
        `,
    ],
    invalid: [
        {
            code: `
            var a = <div style={
                {
                    color: '#ffff'
                }
            } />
            `,
            output: `
            var a = <div style={
                {
                    color: '#fff'
                }
            } />
            `,
            errors: [
                {
                    message:
                        "The alpha value is 100% and does not need to be specified.",
                    line: 4,
                    column: 29,
                },
            ],
        },
        {
            filename: "test.vue",
            code: `
            <template>
                <div :style="{
                    color: '#ffffffff'
                }"/>
            </template>
            `,
            output: `
            <template>
                <div :style="{
                    color: '#ffffff'
                }"/>
            </template>
            `,
            parser: require.resolve("vue-eslint-parser"),
            errors: [
                {
                    message:
                        "The alpha value is 100% and does not need to be specified.",
                    line: 4,
                    column: 29,
                },
            ],
        },
        {
            filename: "test.vue",
            code: `
            <template>
                <div :style="{
                    color: 'rgb(255 255 255 / 100%)',
                    backgroundColor: 'rgb(255, 255, 255, 1)',
                    borderColor: 'rgb(255 255 255) rgba(255 255 255) rgba(255 255 255 / 100%) rgba(255, 255, 255, 100%)',
                    myColor: 'rgba(255 255 255 / .5) rgba(255, 255, 255, 99%)',
                }"/>
            </template>
            `,
            output: `
            <template>
                <div :style="{
                    color: 'rgb(255 255 255)',
                    backgroundColor: 'rgb(255, 255, 255)',
                    borderColor: 'rgb(255 255 255) rgba(255 255 255) rgb(255 255 255) rgb(255, 255, 255)',
                    myColor: 'rgba(255 255 255 / .5) rgba(255, 255, 255, 99%)',
                }"/>
            </template>
            `,
            parser: require.resolve("vue-eslint-parser"),
            errors: [
                "The alpha value is 100% and does not need to be specified.",
                "The alpha value is 100% and does not need to be specified.",
                "The alpha value is 100% and does not need to be specified.",
                "The alpha value is 100% and does not need to be specified.",
            ],
        },
        {
            filename: "test.vue",
            code: `
            <template>
                <div :style="{
                    color: 'hsl(100, 100%, 50%)',
                    backgroundColor: 'hsl(235, 100%, 50%, .5)',
                    borderColor: 'hsl(235 100% 50%) hsl(235 100% 50% / .5) hsl(235, 100%, 50%, 1) hsl(235 100% 50% / 1)',
                    myColor: 'hsl(235, 100%, 50%, 100%) hsl(235 100% 50% / 100%)',
                }"/>
            </template>
            `,
            output: `
            <template>
                <div :style="{
                    color: 'hsl(100, 100%, 50%)',
                    backgroundColor: 'hsl(235, 100%, 50%, .5)',
                    borderColor: 'hsl(235 100% 50%) hsl(235 100% 50% / .5) hsl(235, 100%, 50%) hsl(235 100% 50%)',
                    myColor: 'hsl(235, 100%, 50%) hsl(235 100% 50%)',
                }"/>
            </template>
            `,
            parser: require.resolve("vue-eslint-parser"),
            errors: [
                "The alpha value is 100% and does not need to be specified.",
                "The alpha value is 100% and does not need to be specified.",
                "The alpha value is 100% and does not need to be specified.",
                "The alpha value is 100% and does not need to be specified.",
            ],
        },
        {
            filename: "test.vue",
            code: `
            <template>
                <div :style="{
                    color: 'hwb(194 0% 0% / .5)',
                    backgroundColor: 'hwb(194, 0%, 0%, .5)',
                    borderColor: 'hwb(194 0% 0% / 1) hwb(194, 0%, 0%, 100%) hwb(194, 0%, 0%) hwb(194 var(--v) 0% / 1)',
                }"/>
            </template>
            `,
            output: `
            <template>
                <div :style="{
                    color: 'hwb(194 0% 0% / .5)',
                    backgroundColor: 'hwb(194, 0%, 0%, .5)',
                    borderColor: 'hwb(194 0% 0%) hwb(194, 0%, 0%) hwb(194, 0%, 0%) hwb(194 var(--v) 0%)',
                }"/>
            </template>
            `,
            parser: require.resolve("vue-eslint-parser"),
            errors: [
                "The alpha value is 100% and does not need to be specified.",
                "The alpha value is 100% and does not need to be specified.",
                "The alpha value is 100% and does not need to be specified.",
            ],
        },
        {
            filename: "test.vue",
            code: `
            <template>
                <div :style="{
                    color: 'lab(52.2345% 40.1645 59.9971 / .5)',
                    backgroundColor: 'lab(52.2345% 40.1645 59.9971 / 50%)',
                    borderColor: 'lab(52.2345% 40.1645 59.9971 / 1) lab(52.2345% 40.1645 var(--v) / 100%) lab(52.2345% 40.1645 59.9971)',
                }"/>
            </template>
            `,
            output: `
            <template>
                <div :style="{
                    color: 'lab(52.2345% 40.1645 59.9971 / .5)',
                    backgroundColor: 'lab(52.2345% 40.1645 59.9971 / 50%)',
                    borderColor: 'lab(52.2345% 40.1645 59.9971) lab(52.2345% 40.1645 var(--v)) lab(52.2345% 40.1645 59.9971)',
                }"/>
            </template>
            `,
            parser: require.resolve("vue-eslint-parser"),
            errors: [
                "The alpha value is 100% and does not need to be specified.",
                "The alpha value is 100% and does not need to be specified.",
            ],
        },
        {
            filename: "test.vue",
            code: `
            <template>
                <div :style="{
                    color: 'gray(100/1)',
                    backgroundColor: 'gray(100/100%)',
                    borderColor: 'gray(100,1) gray(100,.5) gray(100,100%) gray(100,99%)',
                }"/>
            </template>
            `,
            output: `
            <template>
                <div :style="{
                    color: 'gray(100)',
                    backgroundColor: 'gray(100)',
                    borderColor: 'gray(100) gray(100,.5) gray(100) gray(100,99%)',
                }"/>
            </template>
            `,
            parser: require.resolve("vue-eslint-parser"),
            errors: [
                "The alpha value is 100% and does not need to be specified.",
                "The alpha value is 100% and does not need to be specified.",
                "The alpha value is 100% and does not need to be specified.",
                "The alpha value is 100% and does not need to be specified.",
            ],
        },
        {
            code: `
            var a = <div style={
                {
                    color: 'rgb(from var(--bg-color) r g b / 100%)'
                }
            } />
            `,
            output: `
            var a = <div style={
                {
                    color: 'rgb(from var(--bg-color) r g b)'
                }
            } />
            `,
            errors: [
                {
                    message:
                        "The alpha value is 100% and does not need to be specified.",
                    line: 4,
                    column: 29,
                },
            ],
        },
    ],
})
