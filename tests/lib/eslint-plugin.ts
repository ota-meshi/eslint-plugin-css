import path from "path";
import assert from "assert";
import plugin from "../../lib/index";
import { getLegacyESLint } from "eslint-compat-utils/eslint";
const ESLint = getLegacyESLint();

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

const TEST_CWD = path.join(__dirname, "../fixtures/integrations/eslint-plugin");

describe("Integration with eslint-plugin-css", () => {
  it("should lint without crash", async () => {
    const eslint = new ESLint({
      cwd: TEST_CWD,
      plugins: { "eslint-plugin-css": plugin as never },
    });
    const results = await eslint.lintFiles(["test.js"]);

    assert.strictEqual(results.length, 1);
    assert.deepStrictEqual(
      results[0].messages.map((m) => m.ruleId),
      ["css/no-invalid-color-hex", "css/no-unknown-property"],
    );
  });
});
