import type { CSSObjectContext, CSSVisitorHandlers } from "../utils";
import { createRule, defineCSSVisitor } from "../utils";
import { getChecker, getExactConverter } from "../utils/casing";

const allowedCaseOptions = ["camelCase", "kebab-case"];
export default createRule("property-casing", {
  meta: {
    docs: {
      description: "enforce specific casing for CSS properties",
      category: "Stylistic Issues",
      recommended: false,
      standard: true,
      stylelint: null,
    },
    fixable: "code",
    schema: [
      {
        enum: allowedCaseOptions,
      },
    ],
    messages: {
      disallow: "'{{name}}' is not in {{caseType}}.",
    },
    type: "layout",
  },
  create(context) {
    const option = context.options[0];
    const caseType: "camelCase" | "kebab-case" = allowedCaseOptions.includes(
      option
    )
      ? option
      : "camelCase";
    const checker = getChecker(caseType);

    /**
     * Create visitor
     */
    function createVisitor(cssContext: CSSObjectContext): CSSVisitorHandlers {
      return {
        onProperty(property) {
          const prop = property.getName();
          if (!prop) {
            return;
          }
          if (checker(prop.name)) {
            return;
          }
          context.report({
            node: prop.expression,
            messageId: "disallow",
            data: {
              name: prop.name,
              caseType,
            },
            fix(fixer) {
              if (!cssContext.isFixable(prop.directExpression)) {
                return null;
              }
              const quoted =
                (prop.directExpression.type === "Literal" &&
                  typeof prop.directExpression.value === "string") ||
                prop.directExpression.type === "TemplateLiteral";
              if (!quoted && caseType === "kebab-case") {
                return null;
              }
              const newName =
                prop.name === "cssFloat"
                  ? "float"
                  : getExactConverter(caseType)(prop.name);
              if (newName === prop.name) {
                return null;
              }
              let replaceRange = prop.directExpression.range!;
              if (quoted) {
                replaceRange = [replaceRange[0] + 1, replaceRange[1] - 1];
              }

              return fixer.replaceTextRange(replaceRange, newName);
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
