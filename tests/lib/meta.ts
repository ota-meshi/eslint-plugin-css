import assert from "assert";
import plugin from "../../lib";
import { version } from "../../package.json";
const expectedMeta = {
  name: "eslint-plugin-css",
  version,
};

describe("Test for meta object", () => {
  it("A plugin should have a meta object.", () => {
    assert.deepStrictEqual(plugin.meta, expectedMeta);
  });
});
