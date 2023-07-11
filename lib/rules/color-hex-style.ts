import type { CSSObjectContext, CSSVisitorHandlers } from "../utils";
import { createRule, defineCSSVisitor } from "../utils";
import { parseHexColor } from "../utils/color";

export default createRule("color-hex-style", {
  meta: {
    docs: {
      description: "enforce hex color style",
      category: "Stylistic Issues",
      recommended: false,
      standard: true,
      stylelint: "color-hex-length",
    },
    fixable: "code",
    schema: [
      {
        enum: ["RGB", "RRGGBB"],
      },
    ],
    messages: {
      expected: "Expected '{{actual}}' to be '{{expected}}'.",
    },
    type: "layout",
  },
  create(context) {
    const option = context.options[0];
    const prefer: "RGB" | "RRGGBB" = ["RGB", "RRGGBB"].includes(option)
      ? option
      : "RGB";

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

          parsedValue.walk(({ value: textValue, type, sourceIndex }) => {
            if (type === "function" && textValue.toLowerCase() === "url")
              return false;

            if (type !== "word") return undefined;

            const expected = parseHexColor(textValue).toHex(prefer);
            if (!expected || expected === textValue) {
              return undefined;
            }

            const sourceCode = context.getSourceCode();
            const startIndex =
              value.expression.range![0] + sourceIndex + 1; /* quote */
            const endIndex = startIndex + textValue.length;
            const loc = value.directExpression
              ? {
                  start: sourceCode.getLocFromIndex(startIndex),
                  end: sourceCode.getLocFromIndex(endIndex),
                }
              : undefined;
            context.report({
              node: value.expression,
              loc,
              messageId: "expected",
              data: {
                actual: textValue,
                expected,
              },
              fix(fixer) {
                if (
                  cssContext.isFixable(value.directExpression) &&
                  sourceCode.text.slice(startIndex, endIndex) === textValue
                ) {
                  return fixer.replaceTextRange(
                    [startIndex, endIndex],
                    expected,
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
