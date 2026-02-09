import type { CSSObjectContext, CSSVisitorHandlers } from "../utils";
import { createRule, defineCSSVisitor } from "../utils";
import type { FunctionNode, Node as ValueNode } from "postcss-value-parser";
import valueParser from "postcss-value-parser";
import { toRegExp } from "../utils/regexp";
import { UNITS } from "../utils/resource";
import { stripVendorPrefix } from "../utils/css-utils";

export default createRule("no-unknown-unit", {
  meta: {
    docs: {
      description: "disallow unknown units",
      category: "Possible Errors",
      recommended: true,
      stylelint: "unit-no-unknown",
    },
    schema: [
      {
        type: "object",
        properties: {
          ignoreFunctions: {
            type: "array",
            items: {
              type: "string",
            },
            uniqueItems: true,
            minItems: 1,
          },
          ignoreUnits: {
            type: "array",
            items: {
              type: "string",
            },
            uniqueItems: true,
            minItems: 1,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unknown: "Unexpected unknown unit '{{unit}}'.",
    },
    type: "problem",
  },
  create(context) {
    const ignoreFunctions = [
      ...(context.options[0]?.ignoreFunctions ?? []),
    ].map(toRegExp);
    const ignoreUnits = [...(context.options[0]?.ignoreUnits ?? [])].map(
      toRegExp,
    );

    /**
     * Create visitor
     */
    function createVisitor(_cssContext: CSSObjectContext): CSSVisitorHandlers {
      return {
        onProperty(property) {
          const value = property.getValue();
          if (!value) {
            return;
          }
          const parsedValue = valueParser(
            String(value.value).replace(/\*/gu, ","),
          );

          parsedValue.walk((node) => {
            if (
              node.type === "function" &&
              (node.value.toLowerCase() === "url" ||
                ignoreFunctions.some((r) => r.test(node.value)))
            )
              return false;

            const unit = getUnitFromValueNode(node);

            if (!unit || ignoreUnits.some((r) => r.test(unit))) {
              return undefined;
            }
            if (UNITS.has(unit) && unit !== "x") {
              return undefined;
            }
            if (unit === "x") {
              if (
                property.getName()?.name.toLowerCase() === "image-resolution"
              ) {
                return undefined;
              }
              const imageSet = parsedValue.nodes.find(
                (n) =>
                  n.type === "function" &&
                  stripVendorPrefix(n.value) === "image-set",
              ) as FunctionNode | undefined;

              if (imageSet) {
                const imageSetLastNode =
                  imageSet.nodes[imageSet.nodes.length - 1];

                if (imageSetLastNode.sourceIndex >= node.sourceIndex) {
                  return undefined;
                }
              }
            }

            const sourceCode = context.sourceCode ?? context.getSourceCode();
            const startIndex =
              value.expression.range![0] + node.sourceIndex + 1; /* quote */
            const endIndex = startIndex + node.value.length;
            const loc = value.directExpression
              ? {
                  start: sourceCode.getLocFromIndex(startIndex),
                  end: sourceCode.getLocFromIndex(endIndex),
                }
              : undefined;
            context.report({
              node: value.expression,
              loc,
              messageId: "unknown",
              data: {
                unit,
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

/** Get unit from value node */
function getUnitFromValueNode(node: ValueNode) {
  if (!node.value) {
    return null;
  }

  if (
    // Ignore non-word nodes
    node.type !== "word" ||
    // Ignore HEX
    node.value.startsWith("#")
  ) {
    return null;
  }

  const parsedUnit = valueParser.unit(node.value);

  if (!parsedUnit) {
    return null;
  }

  return parsedUnit.unit.toLowerCase();
}
