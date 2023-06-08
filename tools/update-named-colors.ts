/* global setTimeout -- global  */
/* eslint require-jsdoc:0 -- ignore */
import path from "path";
import fs from "fs";
import type { DOMWindow } from "jsdom";
import { JSDOM } from "jsdom";
import { isHTMLTableElement } from "./lib/dom-util";

const filePath = path.resolve(
  __dirname,
  "../lib/utils/resource/named-colors.ts"
);

// eslint-disable-next-line no-process-env -- ignore
if (process.env.IN_VERSION_SCRIPT) {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises -- ignore
  main();
}

async function main() {
  let window: DOMWindow | null = null;
  do {
    try {
      ({ window } = await JSDOM.fromURL("https://drafts.csswg.org/css-color/"));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ignore
    } catch (error: any) {
      if (!error || error.message !== "Error: socket hang up") {
        throw error;
      }
      // eslint-disable-next-line no-console -- ignore
      console.log(error.message, "then retry.");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  } while (window == null);

  const colors = collectValues(window);

  fs.writeFileSync(filePath, `export default ${JSON.stringify(colors)}`);
}

function collectValues(window: DOMWindow): Record<string, string> {
  const table = window.document.querySelector(".named-color-table");

  const results: Record<string, string> = {};
  if (!isHTMLTableElement(table)) {
    return results;
  }
  for (const row of table.rows) {
    if (row.parentElement?.tagName !== "TBODY") {
      continue;
    }
    let name: string | undefined, hex: string | undefined;
    for (const cell of row.cells) {
      const val = cell.textContent?.trim() || "";
      if (/^[a-z]+$/u.test(val)) {
        name = val;
      }
      if (/^#[\da-f]+$/iu.test(val)) {
        hex = val;
      }
    }
    results[name!] = hex!.toLowerCase();
  }
  return results;
}
