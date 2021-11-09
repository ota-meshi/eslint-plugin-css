import path from "path"
import assert from "assert"
import { ESLint } from "eslint"
import plugin from "../../lib/index"

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

const TEST_CWD = path.join(__dirname, "../fixtures/integrations/eslint-plugin")

describe("Integration with eslint-plugin-css", () => {
    it("should lint without errors", async () => {
        const eslint = new ESLint({
            cwd: TEST_CWD,
            plugins: { "eslint-plugin-css": plugin },
        })
        const results = await eslint.lintFiles(["test.js"])

        assert.strictEqual(results.length, 1)
        assert.deepStrictEqual(
            results[0].messages.map((m) => m.ruleId),
            [
                "regexp/no-dupe-characters-character-class",
                "regexp/prefer-w",
                "regexp/prefer-d",
                "regexp/prefer-d",
            ],
        )
    })
})
