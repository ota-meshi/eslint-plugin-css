import type { CSSObjectContext, CSSVisitorHandlers } from "../utils";
import { createRule, defineCSSVisitor } from "../utils";

export default createRule("no-number-trailing-zeros", {
  meta: {
    docs: {
      description: "disallow trailing zeros in numbers.",
      category: "Stylistic Issues",
      recommended: false,
      standard: true,
      stylelint: "number-no-trailing-zeros",
    },
    fixable: "code",
    schema: [],
    messages: {
      unexpected: "Unexpected trailing zero(s).",
    },
    type: "layout",
  },
  create(context) {
    /**
     * Create visitor
     */
    function createVisitor(cssContext: CSSObjectContext): CSSVisitorHandlers {
      const sourceCode = context.getSourceCode();
      return {
        onProperty(property) {
          const value = property.getValue();
          if (!value) {
            return;
          }
          if (typeof value.value === "number" || !value.value.includes(".")) {
            return;
          }
          value.parsed.walk((node) => {
            // Ignore `url` function
            if (
              node.type === "function" &&
              node.value.toLowerCase() === "url"
            ) {
              return false;
            }
            if (node.type !== "word") {
              return undefined;
            }
            const match = /\.(?<num>\d{0,100}?)(?<zeros>0+)(?:\D|$)/u.exec(
              node.value
            );

            if (match == null) {
              return undefined;
            }

            const startIndex =
              value.expression.range![0] +
              node.sourceIndex +
              match.index +
              1 /* dot */ +
              match.groups!.num.length +
              1; /* quote */
            const endIndex = startIndex + match.groups!.zeros.length;

            const loc = value.directExpression
              ? {
                  start: sourceCode.getLocFromIndex(startIndex),
                  end: sourceCode.getLocFromIndex(endIndex),
                }
              : undefined;

            context.report({
              node: value.expression,
              loc,
              messageId: "unexpected",
              fix(fixer) {
                if (
                  cssContext.isFixable(value.directExpression) &&
                  /^0+$/u.test(sourceCode.text.slice(startIndex, endIndex))
                ) {
                  return fixer.removeRange([startIndex, endIndex]);
                }
                return null;
              },
            });
            return undefined;
          });
        },
      };
    }

    return defineCSSVisitor(context, {
      createVisitor,
    });
  },
});
