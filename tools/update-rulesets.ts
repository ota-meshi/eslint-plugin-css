import path from "path"
import fs from "fs"
// import eslint from "eslint"
import { rules } from "./lib/load-rules"

fs.writeFileSync(
    path.resolve(__dirname, "../lib/configs/recommended.ts"),
    `export = {
    plugins: ["css"],
    rules: {
        // eslint-plugin-css rules
        ${rules
            .filter(
                (rule) => rule.meta.docs.recommended && !rule.meta.deprecated,
            )
            .map((rule) => {
                const conf = rule.meta.docs.default || "error"
                return `"${rule.meta.docs.ruleId}": "${conf}"`
            })
            .join(",\n")}
    },
}
`,
)
fs.writeFileSync(
    path.resolve(__dirname, "../lib/configs/standard.ts"),
    `export = {
    plugins: ["css"],
    rules: {
        // eslint-plugin-css rules
        ${rules
            .filter((rule) => rule.meta.docs.standard && !rule.meta.deprecated)
            .map((rule) => {
                const conf = rule.meta.docs.default || "error"
                return `"${rule.meta.docs.ruleId}": "${conf}"`
            })
            .join(",\n")}
    },
}
`,
)

// Format files.
// const linter = new eslint.CLIEngine({ fix: true })
// const report = linter.executeOnFiles([filePath])
// eslint.CLIEngine.outputFixes(report)
