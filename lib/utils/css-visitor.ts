import path from "path";
import type * as ESTree from "estree";
import type { Rule } from "eslint";
import type { RuleListener } from "../types";
import {
  findExpression,
  isStaticTemplateLiteral,
  getStaticValue,
  getParent,
} from "./ast-utils";
import { toRegExp } from "./regexp";
import type { CallReference } from "./extract-calls-references";
import { extractCallReferences } from "./extract-calls-references";
import postcssValueParser from "postcss-value-parser";
import type { ParsedValue as PostcssParsedValue } from "postcss-value-parser";

type CSSHelperContext = {
  isFixable<T extends ESTree.Node>(targetNode?: T | null): targetNode is T;
};

type DefineStyleArgument = {
  argument: ESTree.Expression;
  callReference: CallReference;
};

type CSSObjectPropsContext =
  | {
      define: ESTree.ObjectExpression | ESTree.ArrayExpression;
      scope: ESTree.Expression;
      on: "jsx-style";
    }
  | {
      define: ESTree.ObjectExpression | ESTree.ArrayExpression;
      scope: ESTree.Expression;
      on: "vue-style";
    }
  | {
      define: ESTree.ObjectExpression;
      scope: ESTree.Expression;
      on: "define-function";
      defineStyleArgument: DefineStyleArgument;
    }
  | {
      define: ESTree.ObjectExpression;
      scope: ESTree.Expression;
      on: "mark";
    };

export type CSSObjectContext = CSSHelperContext & CSSObjectPropsContext;

export type CSSPropertyName = {
  name: string;
  expression: ESTree.Expression;
  directExpression: ESTree.Expression | null;
};
export type CSSPropertyValue = {
  value: string | number;
  expression: ESTree.Expression;
  directExpression: ESTree.Expression | null;
  parsed: Readonly<PostcssParsedValue>;
};
export type CSSSelector = {
  selector: string;
  expression: ESTree.Expression;
  directExpression: ESTree.Expression | null;
};
export type CSSPropertyContext = {
  getName: () => CSSPropertyName | null;
  getValue: () => CSSPropertyValue | null;
};
export type CSSRuleContext = {
  getSelector: () => CSSSelector | null;
};

export type CSSVisitorHandlers = {
  onRoot?: (context: CSSObjectContext) => void;
  "onRoot:exit"?: (context: CSSObjectContext) => void;
  onProperty?: (property: CSSPropertyContext) => void;
  onRule?: (rule: CSSRuleContext) => void;
  "onRule:exit"?: (rule: CSSRuleContext) => void;
};

export type DefineCSSVisitorRule = {
  createVisitor: (context: CSSObjectContext) => CSSVisitorHandlers;
};

type CSSRule = DefineCSSVisitorRule;

type DefineFunctionPaths = string[][];
type DefineFunctions = {
  [module: string]: DefineFunctionPaths | undefined;
};

/** Normalize define functions settings */
function normalizeDefineFunctions(settings: unknown): DefineFunctions {
  if (typeof settings !== "object" || settings == null) {
    return {};
  }
  const defines: DefineFunctions = {};
  for (const moduleName of Object.keys(settings)) {
    const moduleSettings =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ignore
      (settings as any)[moduleName];
    if (typeof moduleSettings !== "object") {
      continue;
    }
    const paths: string[][] = [];
    if (Array.isArray(moduleSettings)) {
      paths.push(...moduleSettings.map(normalizePaths));
    }

    defines[moduleName] = paths;
  }
  return defines;

  /** Normalize paths settings */
  function normalizePaths(val: unknown): string[] {
    if (Array.isArray(val)) {
      return val.map((s) => String(s));
    }
    return [String(val)];
  }
}

/**
 * @type { WeakMap<RuleContext, Token[]> }
 */
const cssComments = new WeakMap<Rule.RuleContext, ESTree.Comment[]>();

/**
 * Gets the css comments of a given context.
 */
function getCSSComments(context: Rule.RuleContext) {
  let tokens = cssComments.get(context);
  if (tokens) {
    return tokens;
  }
  const sourceCode = context.getSourceCode();
  tokens = sourceCode
    .getAllComments()
    .filter((comment) => /@css(?:\b|$)/u.test(comment.value));
  cssComments.set(context, tokens);
  return tokens;
}

const cssRules = new WeakMap<ESTree.Program, CSSRule[]>();

/**
 * Define the CSS visitor rule.
 */
export function defineCSSVisitor(
  context: Rule.RuleContext,
  rule: DefineCSSVisitorRule
): RuleListener {
  const programNode = context.getSourceCode().ast;

  let visitor: RuleListener;
  let rules = cssRules.get(programNode);
  if (!rules) {
    rules = [];
    cssRules.set(programNode, rules);
    visitor = buildCSSVisitor(context, rules, () => {
      cssRules.delete(programNode);
    });
  } else {
    visitor = {};
  }

  rules.push(rule);

  return visitor;
}

/** Build CSS visitor */
function buildCSSVisitor(
  context: Rule.RuleContext,
  rules: CSSRule[],
  programExit: (node: ESTree.Program) => void
): RuleListener {
  const verifiedObjects: (ESTree.Node | null)[] = [];
  const markedObjects: ESTree.ObjectExpression[] = [];

  /**
   * Verify a given css object.
   */
  function verifyCSSObject(baseCtx: CSSObjectPropsContext) {
    verifiedObjects.push(baseCtx.define);
    if (baseCtx.define.type === "ArrayExpression") {
      verifiedObjects.push(...baseCtx.define.elements);
    }

    const ctx = buildCSSObjectContext(baseCtx);

    visitCSS(ctx, createVisitorFromRules(rules, ctx));
  }

  /**
   * Visit CSS
   */
  function visitCSS(ctx: CSSObjectContext, visitor: CSSVisitorHandlers) {
    visitor.onRoot?.(ctx);
    if (ctx.define.type === "ObjectExpression") {
      visitObject(ctx.define);
    } else if (ctx.define.type === "ArrayExpression") {
      visitArray(ctx.define);
    }
    visitor["onRoot:exit"]?.(ctx);

    /**
     * Visit CSS array
     */
    function visitArray(array: ESTree.ArrayExpression) {
      for (const element of array.elements) {
        if (!element) {
          continue;
        }
        if (element.type === "SpreadElement") {
          const target = resolveDefineExpression(element.argument, ctx);
          if (target.type === "ArrayExpression") {
            visitArray(target);
          }
          continue;
        }
        const target = resolveDefineExpression(element, ctx);
        if (target.type === "ObjectExpression") {
          visitObject(target);
        }
      }
    }

    /**
     * Visit CSS object
     */
    function visitObject(object: ESTree.ObjectExpression) {
      if (ctx.on === "jsx-style" || ctx.on === "vue-style") {
        if (visitor.onProperty) {
          for (const prop of object.properties) {
            if (prop.type === "Property") {
              visitor.onProperty(buildPropertyContext(ctx, prop));
            } else if (prop.type === "SpreadElement") {
              if (prop.argument.type === "Identifier") {
                const target = resolveDefineExpression(prop.argument, ctx);
                if (target.type === "ObjectExpression") {
                  visitObject(target);
                }
              }
            }
          }
        }
      } else if (ctx.on === "define-function" || ctx.on === "mark") {
        if (visitor.onProperty || visitor.onRule || visitor["onRule:exit"]) {
          for (const prop of object.properties) {
            if (prop.type === "Property") {
              const value = resolveDefineExpression(
                prop.value as Exclude<
                  ESTree.Property["value"],
                  | ESTree.ObjectPattern
                  | ESTree.ArrayPattern
                  | ESTree.RestElement
                  | ESTree.AssignmentPattern
                >,
                ctx
              );
              if (value.type === "ObjectExpression") {
                const rule = buildRuleContext(ctx, prop);
                visitor.onRule?.(rule);
                visitObject(value);
                visitor["onRule:exit"]?.(rule);
              } else if (
                value.type === "Literal" ||
                value.type === "TemplateLiteral"
              ) {
                visitor.onProperty?.(buildPropertyContext(ctx, prop));
              }
            } else if (prop.type === "SpreadElement") {
              if (prop.argument.type === "Identifier") {
                const target = resolveDefineExpression(prop.argument, ctx);
                if (target.type === "ObjectExpression") {
                  visitObject(target);
                }
              }
            }
          }
        }
      } else {
        const neverCtx: never = ctx;
        throw new Error(`Unknown context. ${neverCtx}`);
      }
    }
  }

  const settingsTarget = context.settings.css?.target || {};

  const attributes = ["style", ...(settingsTarget.attributes || [])].map(
    toRegExp
  );

  const defineFunctions: DefineFunctions = {
    ...normalizeDefineFunctions(settingsTarget.defineFunctions),
    "styled-components": [
      ["default", "/^\\w+$/u"],
      ["default", "/^\\w+$/u", "attrs()"],
      ["default()"],
      ["default()", "attrs()"],
      ["default", "/^\\w+$/u", "withConfig()"],
      ["default", "/^\\w+$/u", "withConfig()", "attrs()"],
      ["default", "/^\\w+$/u", "attrs()", "withConfig()"],
      ["default()", "withConfig()"],
      ["default()", "withConfig()", "attrs()"],
      ["default()", "attrs()", "withConfig()"],
      ["css"],
      ["keyframes"],
      ["createGlobalStyle"],
    ],
  };

  type ScopeStack = {
    upper: ScopeStack | null;
    node: ESTree.Node;
    defineStyleArgumentFunction?: DefineStyleArgument | null;
  };

  let scopeStack: ScopeStack | null = {
    upper: null,
    node: context.getSourceCode().ast,
  };
  const defineStyleArgumentFunctions = new Map<
    ESTree.Node,
    DefineStyleArgument
  >();

  return compositingVisitors(
    {
      Program(node) {
        for (const body of node.body) {
          if (body.type !== "ImportDeclaration") {
            continue;
          }
          const moduleDefineFunctions =
            defineFunctions[String(body.source.value)];
          if (!moduleDefineFunctions) {
            continue;
          }
          for (const callReference of extractCallReferences(
            body,
            moduleDefineFunctions,
            context
          )) {
            for (const argument of callReference.node.arguments) {
              if (argument.type === "SpreadElement") {
                continue;
              }
              const defineStyleArgument: DefineStyleArgument = {
                argument,
                callReference,
              };
              const target = resolveDefineExpression(
                defineStyleArgument.argument,
                null
              );
              if (target.type === "ObjectExpression") {
                verifyCSSObject({
                  define: target,
                  scope: defineStyleArgument.argument,
                  on: "define-function",
                  defineStyleArgument,
                });
              } else if (
                target.type === "FunctionExpression" ||
                target.type === "ArrowFunctionExpression"
              ) {
                defineStyleArgumentFunctions.set(target, defineStyleArgument);
              }
            }
          }
        }
      },
      ":function, PropertyDefinition"(node: ESTree.Node) {
        const defineStyleArgument = defineStyleArgumentFunctions.get(node);
        scopeStack = {
          upper: scopeStack,
          node,
          defineStyleArgumentFunction: defineStyleArgument,
        };

        if (
          node.type === "ArrowFunctionExpression" &&
          node.expression &&
          node.body.type !== "BlockStatement" &&
          defineStyleArgument
        ) {
          const target = resolveDefineExpression(node.body, null);
          if (target.type === "ObjectExpression") {
            verifyCSSObject({
              define: target,
              scope: defineStyleArgument.argument,
              on: "define-function",
              defineStyleArgument,
            });
          }
        }
      },
      ReturnStatement(node: ESTree.ReturnStatement) {
        if (
          scopeStack &&
          scopeStack.defineStyleArgumentFunction &&
          node.argument
        ) {
          const target = resolveDefineExpression(node.argument, null);
          if (target.type === "ObjectExpression") {
            const defineStyleArgument = scopeStack.defineStyleArgumentFunction;
            verifyCSSObject({
              define: target,
              scope: defineStyleArgument.argument,
              on: "define-function",
              defineStyleArgument,
            });
          }
        }
      },
      ":function, PropertyDefinition:exit"() {
        scopeStack = scopeStack && scopeStack.upper;
      },
      [`JSXAttribute > JSXExpressionContainer.value > .expression`](
        node: ESTree.Expression
      ) {
        const jsxAttr = getParent(getParent(node)) as {
          name?: { name?: string };
        } | null;
        const attrName = jsxAttr?.name?.name;
        if (!attrName || !attributes.some((r) => r.test(attrName))) {
          return;
        }
        const target = resolveDefineExpression(node, null);
        if (
          target.type === "ObjectExpression" ||
          target.type === "ArrayExpression"
        ) {
          verifyCSSObject({
            define: target,
            scope: node,
            on: "jsx-style",
          });
        }
      },
      ObjectExpression(node) {
        if (
          getCSSComments(context).some(
            (comment) => comment.loc!.end.line === node.loc!.start.line - 1
          )
        ) {
          markedObjects.push(node);
        }
      },
      "Program:exit"(node: ESTree.Program) {
        const set = new Set(verifiedObjects);
        for (const objNode of markedObjects) {
          if (set.has(objNode)) {
            continue;
          }
          verifyCSSObject({
            define: objNode,
            scope: objNode,
            on: "mark",
          });
        }
        programExit(node);
      },
    },
    defineTemplateBodyVisitor(context, {
      [`VAttribute[directive=true][key.name.name='bind'] > VExpressionContainer.value > :matches(ObjectExpression,ArrayExpression).expression`](
        node: ESTree.ObjectExpression | ESTree.ArrayExpression
      ) {
        const vBindAttr = getParent(getParent(node)) as {
          key?: {
            argument?: { name?: string };
          };
        } | null;
        const attrName = vBindAttr?.key?.argument?.name;
        if (!attrName || !attributes.some((r) => r.test(attrName))) {
          return;
        }

        verifyCSSObject({
          define: node,
          scope: node,
          on: "vue-style",
        });
      },
    }),
    {}
  );

  /**
   * Build CSSObjectContext
   */
  function buildCSSObjectContext(
    baseCtx: CSSObjectPropsContext
  ): CSSObjectContext {
    return {
      ...baseCtx,
      isFixable<T extends ESTree.Node>(targetNode?: T | null): targetNode is T {
        const scopeRange = baseCtx.scope.range!;
        if (
          scopeRange[0] <= baseCtx.define.range![0] &&
          baseCtx.define.range![1] <= scopeRange[1]
        ) {
          if (!targetNode) {
            return true;
          }
          const targetRange = targetNode.range!;
          return (
            scopeRange[0] <= targetRange[0] && targetRange[1] <= scopeRange[1]
          );
        }
        return false;
      },
    };
  }

  /** Resolve define expression */
  function resolveDefineExpression(
    node: ESTree.Expression,
    ctx: CSSObjectContext | null
  ) {
    if (ctx && ctx.on === "vue-style") {
      return node;
    }
    if (node.type === "Identifier") {
      return findExpression(context, node) || node;
    }
    return node;
  }

  /** Build property context */
  function buildPropertyContext(
    ctx: CSSObjectContext,
    node: ESTree.Property
  ): CSSPropertyContext {
    return {
      getName() {
        const { key } = node;
        if (key.type === "PrivateIdentifier") {
          return null;
        }
        if (!node.computed && key.type !== "Literal") {
          if (key.type === "Identifier") {
            return {
              name: key.name,
              expression: key,
              directExpression: key,
            };
          }
          return null;
        }
        const val = resolveExpression(ctx, key);
        return (
          val && {
            name: String(val.value),
            expression: val.expression,
            directExpression: val.directExpression,
          }
        );
      },
      getValue() {
        const value = node.value as Exclude<
          ESTree.Property["value"],
          | ESTree.ObjectPattern
          | ESTree.ArrayPattern
          | ESTree.RestElement
          | ESTree.AssignmentPattern
        >;
        const val = resolveExpression(ctx, value);
        let parsed: PostcssParsedValue | undefined;
        return (
          val && {
            value: val.value,
            expression: val.expression,
            directExpression: val.directExpression,
            get parsed() {
              if (parsed) {
                return parsed;
              }
              return (parsed = postcssValueParser(String(val.value)));
            },
          }
        );
      },
    };
  }

  /** Build rule context */
  function buildRuleContext(
    ctx: CSSObjectContext,
    node: ESTree.Property
  ): CSSRuleContext {
    return {
      getSelector() {
        const { key } = node;
        if (key.type === "PrivateIdentifier") {
          return null;
        }
        if (!node.computed && key.type !== "Literal") {
          if (key.type === "Identifier") {
            return {
              selector: key.name,
              expression: key,
              directExpression: key,
            };
          }
          return null;
        }
        const val = resolveExpression(ctx, key);
        return (
          val && {
            selector: String(val.value),
            expression: val.expression,
            directExpression: val.directExpression,
          }
        );
      },
    };
  }

  /** Resolve Expression */
  function resolveExpression(ctx: CSSObjectContext, node: ESTree.Expression) {
    if (node.type === "Literal") {
      if (typeof node.value === "string" || typeof node.value === "number") {
        return {
          value: node.value,
          expression: node,
          directExpression: node,
        };
      }
      return null;
    }
    if (isStaticTemplateLiteral(node)) {
      return {
        value: node.quasis[0].value.cooked!,
        expression: node,
        directExpression: node,
      };
    }
    if (ctx.on === "vue-style") {
      return null;
    }
    const name = getStaticValue(context, node);
    if (
      name != null &&
      (typeof name.value === "string" || typeof name.value === "number")
    ) {
      return {
        value: name.value,
        expression: node,
        directExpression: null,
      };
    }
    return null;
  }
}

/** Create a visitor handler from the given rules */
function createVisitorFromRules(
  rules: Iterable<CSSRule>,
  context: CSSObjectContext
): CSSVisitorHandlers {
  const handlers: CSSVisitorHandlers = {};
  for (const rule of rules) {
    if (rule.createVisitor) {
      const visitor = rule.createVisitor(context);
      for (const key of Object.keys(visitor) as (keyof CSSVisitorHandlers)[]) {
        const orig = handlers[key];
        if (orig) {
          handlers[key] = (...args: unknown[]) => {
            // @ts-expect-error -- ignore
            orig(...args);
            // @ts-expect-error -- ignore
            visitor[key](...args);
          };
        } else {
          // @ts-expect-error -- ignore
          handlers[key] = visitor[key];
        }
      }
    }
  }
  return handlers;
}

/**
 * Register the given visitor to parser services.
 * If the parser service of `vue-eslint-parser` was not found, and linting `.vue`,
 * this generates a warning.
 *
 * @param context The rule context to use parser services.
 * @param templateBodyVisitor The visitor to traverse the template body.
 * @returns {RuleListener} The merged visitor.
 */
function defineTemplateBodyVisitor(
  context: Rule.RuleContext,
  templateBodyVisitor: RuleListener
) {
  if (context.parserServices.defineTemplateBodyVisitor == null) {
    const filename = context.getFilename();
    if (path.extname(filename) === ".vue") {
      context.report({
        loc: { line: 1, column: 0 },
        message:
          "Use the latest vue-eslint-parser. See also https://eslint.vuejs.org/user-guide/#what-is-the-use-the-latest-vue-eslint-parser-error.",
      });
    }
    return {};
  }
  return context.parserServices.defineTemplateBodyVisitor(
    templateBodyVisitor,
    {},
    {}
  );
}

/**
 * Composite all given visitors.
 */
export function compositingVisitors(
  visitor: RuleListener,
  ...visitors: RuleListener[]
): RuleListener {
  for (const v of visitors) {
    for (const key in v) {
      const orig = visitor[key];
      if (orig) {
        visitor[key] = (...args: unknown[]) => {
          // @ts-expect-error -- ignore
          orig(...args);
          // @ts-expect-error -- ignore
          v[key](...args);
        };
      } else {
        visitor[key] = v[key];
      }
    }
  }
  return visitor;
}
