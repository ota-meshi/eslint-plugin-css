import type { CSSObjectContext, CSSVisitorHandlers } from "../utils";
import { createRule, defineCSSVisitor } from "../utils";
import { parseColor } from "../utils/color";
import valueParser from "postcss-value-parser";

export default createRule("no-useless-color-alpha", {
  meta: {
    docs: {
      description: "disallow unnecessary alpha-channel transparency value",
      category: "Best Practices",
      recommended: true,
      stylelint: null,
    },
    fixable: "code",
    schema: [],
    messages: {
      unexpected: "The alpha value is 100% and does not need to be specified.",
    },
    type: "suggestion",
  },

  create(context) {
    /**
     * Create visitor
     */
    function createVisitor(cssContext: CSSObjectContext): CSSVisitorHandlers {
      return {
        onProperty(property) {
          const value = property.getValue();
          if (!value) {
            return;
          }
          const parsedValue = value.parsed;

          parsedValue.walk((node) => {
            const { value: textValue, type, sourceIndex } = node;
            if (type === "function" && textValue.toLowerCase() === "url")
              return false;

            if (type !== "word" && type !== "function") return undefined;

            const actual = valueParser.stringify(node);
            const parsed = parseColor(actual);
            const alpha = parsed.getAlpha();

            if (alpha == null || alpha < 1) {
              return undefined;
            }
            const expected = parsed.removeAlpha().toColorString();
            if (expected === actual) {
              return undefined;
            }
            const sourceCode = context.getSourceCode();
            const startIndex =
              value.expression.range![0] + sourceIndex + 1; /* quote */
            const endIndex = startIndex + actual.length;
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
                  sourceCode.text.slice(startIndex, endIndex) === actual
                ) {
                  return fixer.replaceTextRange(
                    [startIndex, endIndex],
                    expected
                  );
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
