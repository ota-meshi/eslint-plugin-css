import assert from "assert"
import { parseColor } from "../../../../lib/utils/color/index"

const TESTS = [
    {
        code: "rgb( 255 0 0 )",
        output: "#ff0000",
    },
    {
        code: "rgb(255, 0, 0)",
        output: "#ff0000",
    },
    {
        code: "rgb(/*1*/255/*2*/, /*3*/0/*4*/,/*5*/ 0/*6*/)",
        output: "#ff0000",
    },
    {
        code: "rgb(255 0 0)",
        output: "#ff0000",
    },
    {
        code: "rgb(100% 0% 0%)",
        output: "#ff0000",
    },
    {
        code: "rgb(255 0 0 / .5)",
        output: "#ff000080",
    },
    {
        code: "rgb(255 0 0 / 50%)",
        output: "#ff000080",
    },
    {
        code: "rgb(255, 0 0)",
        output: null,
    },
    {
        code: "rgb(255 0 0 .5)",
        output: null,
    },
    {
        code: "rgb(100% 0 0)",
        output: null,
    },
    {
        code: "rgb(256 0 0)",
        output: null,
    },
    {
        code: "rgb(101% 0% 0%)",
        output: null,
    },
    {
        code: "rgb(255 0 0 / )",
        output: null,
    },
    {
        code: "rgb(255 0 0 / .5 100%)",
        output: null,
    },
    {
        code: "rgb(255 0 0 / 30px)",
        output: null,
    },
    {
        code: "rgb(255 0 0 / 120%)",
        output: null,
    },
    {
        code: "lab(29.2345% 39.3825 20.0664)",
        output: "#7d2329",
    },
    {
        code: "lab(67.5345% -8.6911 -41.6019)",
        output: "#62acef",
    },
    {
        code: "lch(29.2345% 44.2 27/100%)",
        output: "#7d2329",
    },
    {
        code: "lch(29.2345% 44.2 27%/100%)",
        output: null,
    },
    {
        code: "lch(200% 44.2 27/100%)",
        output: null,
    },
    {
        code: "lch(29.2345% 44.2 27 30/100%)",
        output: null,
    },
    {
        code: "gray(100/100%)",
        output: "#ffffff",
    },
]

describe("colord parseColor", () => {
    for (const { code, output } of TESTS) {
        it(code, () => {
            const result = parseColor(code)
            assert.strictEqual(result.toHex(), output)
            assert.strictEqual(result.toColorString(), code)
        })
    }
})
