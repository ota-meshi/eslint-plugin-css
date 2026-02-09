import type { CSSObjectContext, CSSVisitorHandlers } from "../utils";
import { createRule, defineCSSVisitor } from "../utils";
import { normalizePropertyName } from "../utils/css-utils";
import valueParser from "postcss-value-parser";
import { isStaticTemplateLiteral, isStringLiteral } from "../utils/ast-utils";
import type { LegacyContext } from "../utils/legacy";

const SHORTHAND_PROPERTIES = new Set([
  "margin",
  "padding",
  "border-color",
  "border-radius",
  "border-style",
  "border-width",
  "grid-gap",
]);
const IGNORED_CHARS = ["+", "*", "/", "(", ")", "$", "@", "--", "var("];

/** Checks wether the give string has ignore character */
function hasIgnoredCharacters(value: string | number) {
  if (typeof value !== "string") {
    return false;
  }
  return IGNORED_CHARS.some((char) => value.includes(char));
}

/** Get the reduced box values from given box values */
function reducedValues(values: string[]) {
  if (values.length <= 1 || values.length > 4) {
    return values;
  }
  const [top, right, bottom, left] = values;
  const lowerTop = top.toLowerCase();
  const lowerRight = right.toLowerCase();
  const lowerBottom = (bottom && bottom.toLowerCase()) ?? lowerTop;
  const lowerLeft = (left && left.toLowerCase()) ?? lowerRight;

  if ([lowerRight, lowerBottom, lowerLeft].every((val) => val === lowerTop)) {
    return [top];
  }

  if (lowerRight === lowerLeft) {
    if (lowerTop === lowerBottom) {
      return [top, right];
    }
    return [top, right, bottom];
  }

  return [top, right, bottom, left];
}

export default createRule("prefer-reduce-shorthand-property-box-values", {
  meta: {
    docs: {
      description: "require reduction in box values of shorthand property",
      category: "Best Practices",
      recommended: false,
      standard: true,
      stylelint: "shorthand-property-no-redundant-values",
    },
    fixable: "code",
    schema: [],
    messages: {
      unexpected:
        "Unexpected longhand value '{{unexpected}}' instead of '{{expected}}'.",
    },
    type: "suggestion",
  },
  create(context) {
    /**
     * Create visitor
     */
    function createVisitor(cssContext: CSSObjectContext): CSSVisitorHandlers {
      const sourceCode =
        context.sourceCode ??
        (context as unknown as LegacyContext).getSourceCode();
      return {
        onProperty(property) {
          const name = property.getName();
          if (!name) {
            return;
          }
          const value = property.getValue();
          if (!value) {
            return;
          }
          if (
            hasIgnoredCharacters(value.value) ||
            !SHORTHAND_PROPERTIES.has(normalizePropertyName(name.name))
          ) {
            return;
          }

          const boxValues: string[] = [];
          value.parsed.walk((node) => {
            if (node.type !== "word") {
              return;
            }

            boxValues.push(valueParser.stringify(node));
          });

          if (boxValues.length <= 1 || boxValues.length > 4) {
            return;
          }

          const shortestForm = reducedValues(boxValues);
          if (boxValues.length <= shortestForm.length) {
            return;
          }

          const startIndex = value.expression.range![0] + 1; /* quote */
          const endIndex = value.expression.range![1] - 1; /* quote */

          const loc = value.directExpression
            ? {
                start: sourceCode.getLocFromIndex(startIndex),
                end: sourceCode.getLocFromIndex(endIndex),
              }
            : undefined;

          const shortestFormString = shortestForm.join(" ");

          context.report({
            node: value.expression,
            loc,
            messageId: "unexpected",
            data: {
              unexpected: String(value.value),
              expected: shortestFormString,
            },
            fix(fixer) {
              if (
                cssContext.isFixable(value.directExpression) &&
                (isStaticTemplateLiteral(value.expression) ||
                  isStringLiteral(value.expression))
              ) {
                return fixer.replaceTextRange(
                  [startIndex, endIndex],
                  shortestFormString,
                );
              }
              return null;
            },
          });
        },
      };
    }

    return defineCSSVisitor(context, {
      createVisitor,
    });
  },
});
