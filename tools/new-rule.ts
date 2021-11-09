import path from "path"
import fs from "fs"
import cp from "child_process"
const logger = console

// main
;((ruleId) => {
    if (ruleId == null) {
        logger.error("Usage: npm run new <RuleID>")
        process.exitCode = 1
        return
    }
    if (!/^[\w-]+$/u.test(ruleId)) {
        logger.error("Invalid RuleID '%s'.", ruleId)
        process.exitCode = 1
        return
    }

    const ruleFile = path.resolve(__dirname, `../lib/rules/${ruleId}.ts`)
    const testFile = path.resolve(__dirname, `../tests/lib/rules/${ruleId}.ts`)
    const docFile = path.resolve(__dirname, `../docs/rules/${ruleId}.md`)

    fs.writeFileSync(
        ruleFile,
        `import type { Expression } from "estree"
import type { CSSObjectContext, CSSVisitorHandlers } from "../utils"
import { createRule, defineCSSVisitor } from "../utils"

export default createRule("${ruleId}", {
    meta: {
        docs: {
            description: "",
            category: "Best Practices",
            // TODO Switch to recommended in the major version.
            // recommended: true,
            recommended: false,
        },
        schema: [],
        messages: {},
        type: "suggestion", // "problem",
    },
    create(context) {
        /**
         * Create visitor
         */
        function createVisitor(
            cssContext: CSSObjectContext,
        ): CSSVisitorHandlers {
            const {} = cssContext

            return {}
        }

        return defineCSSVisitor(context, {
            createVisitor,
        })
    },
})
`,
    )
    fs.writeFileSync(
        testFile,
        `import { RuleTester } from "eslint"
import rule from "../../../lib/rules/${ruleId}"

const tester = new RuleTester({
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
    },
})

tester.run("${ruleId}", rule as any, {
    valid: [
        \`
        var a = <div style={
            {
                color: 'red'
            }
        } />
        \`,
        {
            filename: "test.vue",
            code: \`
            <template>
                <div :style="{
                    color: 'red'
                }"/>
            </template>
            \`,
            parser: require.resolve("vue-eslint-parser"),
        },
    ],
    invalid: [
        {
            code: \`
            var a = <div style={
                {
                    color: 'red'
                }
            } />
            \`,
            errors: [
                {
                    messageId: "",
                    data: {},
                    line: 1,
                    column: 1,
                    endLine: 1,
                    endColumn: 1,
                },
            ],
        },
        {
            filename: "test.vue",
            code: \`
            <template>
                <div :style="{
                    color: 'red'
                }"/>
            </template>
            \`,
            parser: require.resolve("vue-eslint-parser"),
            errors: [
                {
                    messageId: "",
                    data: {},
                    line: 1,
                    column: 1,
                    endLine: 1,
                    endColumn: 1,
                },
            ],
        },
    ],
})
        
`,
    )
    fs.writeFileSync(
        docFile,
        `#  (css/${ruleId})

> description

## :book: Rule Details

This rule reports ???.

<eslint-code-block>

\`\`\`js
/* eslint css/${ruleId}: "error" */

/* ✓ GOOD */
var foo = <div
  style={
    {
      color: 'red'
    }
  } >
  </div>

/* ✗ BAD */
var foo = <div
  style={
    {
      color: 'red'
    }
  } >
  </div>
\`\`\`

</eslint-code-block>

## :wrench: Options

\`\`\`json
{
  "css/${ruleId}": ["error", {

  }]
}
\`\`\`

-

## :books: Further reading

-

`,
    )

    cp.execSync(`code "${ruleFile}"`)
    cp.execSync(`code "${testFile}"`)
    cp.execSync(`code "${docFile}"`)
})(process.argv[2])
