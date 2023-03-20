import type { Rule, Scope } from "eslint";
import * as eslintUtils from "@eslint-community/eslint-utils";
import type {
  Expression,
  Identifier,
  Literal,
  MemberExpression,
  MethodDefinition,
  Node,
  PrivateIdentifier,
  Property,
  PropertyDefinition,
  TemplateElement,
  TemplateLiteral,
} from "estree";

/**
 * Get a parent node
 * The AST node used by ESLint always has a `parent`, but since there is no `parent` on Types, use this function.
 */
export function getParent<E extends Node>(node: Node | null): E | null {
  if (!node) {
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ignore
  return (node as any).parent;
}

/**
 * Find the variable of a given name.
 */
export function findVariable(
  context: Rule.RuleContext,
  node: Identifier
): Scope.Variable | null {
  return eslintUtils.findVariable(getScope(context, node), node);
}

/**
 * Get the value of a given node if it's a constant of string.
 */
// export function getStringIfConstant(
//     context: Rule.RuleContext,
//     node: Node,
// ): string | null {
//     return eslintUtils.getStringIfConstant(node, getScope(context, node))
// }

/**
 * Get the property name of a given nodes.
 */
export function getPropertyName(
  context: Rule.RuleContext,
  node: MemberExpression | MethodDefinition | Property | PropertyDefinition
): string | null {
  return eslintUtils.getPropertyName(node, getScope(context, node));
}
type GetStaticValueResult =
  | { value: unknown }
  | { value: undefined; optional?: true };

/**
 * Get the value of a given node if it's a static value.
 */
export function getStaticValue(
  context: Rule.RuleContext,
  node: Node
): GetStaticValueResult | null {
  return eslintUtils.getStaticValue(node, getScope(context, node));
}

/**
 * Gets the scope for the current node
 */
export function getScope(
  context: Rule.RuleContext,
  currentNode: Node
): Scope.Scope {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ignore
  const scopeManager: Scope.ScopeManager = (context.getSourceCode() as any)
    .scopeManager;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ignore
  let node: any = currentNode;
  for (; node; node = node.parent || null) {
    const scope = scopeManager.acquire(node, false);

    if (scope) {
      if (scope.type === "function-expression-name") {
        return scope.childScopes[0];
      }
      return scope;
    }
  }

  return scopeManager.scopes[0];
}

/**
 * Find expression node
 */
export function findExpression(
  context: Rule.RuleContext,
  id: Identifier
): Exclude<Expression, Identifier> | null {
  let target: Expression = id;

  const set = new Set<Identifier>();
  while (target.type === "Identifier") {
    if (set.has(target)) {
      return null;
    }
    set.add(target);
    const variable = findVariable(context, target);
    if (!variable) {
      return null;
    }
    if (variable.defs.length !== 1) {
      return null;
    }
    const def = variable.defs[0];
    if (
      def.type !== "Variable" ||
      def.parent.kind !== "const" ||
      !def.node.init
    ) {
      return null;
    }
    target = def.node.init;
  }

  return target;
}

/**
 * Checks whether given node is static template literal
 */
export function isStaticTemplateLiteral(
  node: Expression | PrivateIdentifier
): node is TemplateLiteral & { quasis: [TemplateElement]; expressions: [] } {
  return node.type === "TemplateLiteral" && node.quasis.length === 1;
}
/**
 * Checks whether given node is string literal
 */
export function isStringLiteral(
  node: Expression | PrivateIdentifier
): node is Literal & { value: string } {
  return node.type === "Literal" && typeof node.value === "string";
}
