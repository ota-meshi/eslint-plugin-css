import assert from "assert"
import { validColord } from "../../../lib/utils/colord"

const TESTS = [
    {
        code: "lab(29.2345% 39.3825 20.0664)",
        output: "#7d2329",
    },
    {
        code: "lab(67.5345% -8.6911 -41.6019)",
        output: "#62acef",
    },
]

describe("colord validColord", () => {
    for (const { code, output } of TESTS) {
        it(code, () => {
            const result = validColord(code)
            assert.strictEqual(result?.toHex(), output)
        })
    }
})
