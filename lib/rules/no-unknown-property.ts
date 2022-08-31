import type { CSSObjectContext, CSSVisitorHandlers } from "../utils";
import { createRule, defineCSSVisitor } from "../utils";
import { all as allKnownCSSProperties } from "known-css-properties";
import { hasVendorPrefix } from "../utils/css-utils";
import { toRegExp } from "../utils/regexp";
import { isCamelCase, kebabCase } from "../utils/casing";

export default createRule("no-unknown-property", {
  meta: {
    docs: {
      description: "disallow unknown properties",
      category: "Possible Errors",
      recommended: true,
      stylelint: "property-no-unknown",
    },
    schema: [
      {
        type: "object",
        properties: {
          ignoreProperties: {
            type: "array",
            items: {
              type: "string",
            },
            uniqueItems: true,
            minItems: 1,
          },
          ignorePrefixed: { type: "boolean" },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unknown: "Unexpected unknown property '{{property}}'.",
    },
    type: "problem",
  },
  create(context) {
    const ignoreProperties = [
      ...(context.options[0]?.ignoreProperties ?? []),
    ].map(toRegExp);
    const ignorePrefixed: boolean = context.options[0]?.ignorePrefixed ?? true;
    const knownProperties = new Set<string>(allKnownCSSProperties);

    /** Checks whether given name is valid */
    function validName(name: string) {
      return (
        name.startsWith("--") ||
        knownProperties.has(name) ||
        ignoreProperties.some((r) => r.test(name)) ||
        (ignorePrefixed && hasVendorPrefix(name))
      );
    }

    /**
     * Create visitor
     */
    function createVisitor(_cssContext: CSSObjectContext): CSSVisitorHandlers {
      return {
        onProperty(property) {
          const prop = property.getName();
          if (!prop) {
            return;
          }

          if (
            validName(prop.name) ||
            // https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/cssFloat
            prop.name === "cssFloat"
          ) {
            return;
          }
          if (isCamelCase(prop.name)) {
            if (validName(kebabCase(prop.name))) {
              return;
            }
          }
          context.report({
            node: prop.expression,
            messageId: "unknown",
            data: {
              property: prop.name,
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
