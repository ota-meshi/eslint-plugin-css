import path from "path"
import fs from "fs"
// import eslint from "eslint"
import { rules } from "./lib/load-rules"

const content = `
export = {
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
`

const filePath = path.resolve(__dirname, "../lib/configs/recommended.ts")

// Update file.
fs.writeFileSync(filePath, content)

// Format files.
// const linter = new eslint.CLIEngine({ fix: true })
// const report = linter.executeOnFiles([filePath])
// eslint.CLIEngine.outputFixes(report)
