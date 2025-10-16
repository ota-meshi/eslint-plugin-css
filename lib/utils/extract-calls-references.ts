import type {
  Expression,
  ImportDeclaration,
  Pattern,
  SimpleCallExpression,
  VariableDeclaration,
} from "estree";
import type { Rule, Scope } from "eslint";
import { toRegExp } from "./regexp";
import { findVariable, getParent, getPropertyName } from "./ast-utils";

type TargetPath = {
  define: string[];
  target: string[];
};

class TargetPaths {
  private readonly targets: {
    tester: { test: (str: string) => boolean };
    next: string[] | null;
    define: string[];
  }[] = [];

  public constructor(targetPaths: TargetPath[]) {
    for (const paths of targetPaths) {
      const [key, ...next] = paths.target;
      this.targets.push({
        tester: toRegExp(key),
        next: next.length ? next : null,
        define: paths.define,
      });
    }
  }

  public consumePath(name: string | null): TargetPaths | null {
    if (name == null) {
      return this;
    }
    const next: TargetPath[] = [];

    for (const target of this.targets) {
      if (!target.tester.test(name)) {
        continue;
      }
      if (target.next) {
        next.push({
          target: target.next,
          define: target.define,
        });
      }
    }

    return next.length ? new TargetPaths(next) : null;
  }

  public getTargetCallPaths(name: string | null): string[][] {
    if (name == null) {
      return [];
    }
    const paths: string[][] = [];

    for (const target of this.targets) {
      if (!target.tester.test(name)) {
        continue;
      }
      if (target.next) {
        continue;
      }
      paths.push(target.define);
    }
    return paths;
  }
}

export type CallReference = {
  node: SimpleCallExpression;
  paths: readonly string[][];
};

/** Extract call references from the given import declaration */
export function* extractCallReferences(
  node: ImportDeclaration,
  functionPaths: string[][],
  context: Rule.RuleContext,
): Iterable<CallReference> {
  const paths = new TargetPaths(
    functionPaths.map((define) => ({ define, target: define })),
  );
  for (const specifier of node.specifiers) {
    const variable = findVariable(context, specifier.local);
    if (!variable) {
      continue;
    }
    if (specifier.type === "ImportDefaultSpecifier") {
      yield* extractCallReferencesForVariable(
        variable,
        "default",
        paths,
        context,
      );
    } else if (specifier.type === "ImportNamespaceSpecifier") {
      yield* extractCallReferencesForVariable(variable, null, paths, context);
    } else if (specifier.type === "ImportSpecifier") {
      yield* extractCallReferencesForVariable(
        variable,
        specifier.imported.type === "Literal"
          ? String(specifier.imported.value)
          : specifier.imported.name,
        paths,
        context,
      );
    }
  }
}

/** Extract call references from variable */
function* extractCallReferencesForVariable(
  variable: Scope.Variable,
  name: string | null,
  paths: TargetPaths,
  context: Rule.RuleContext,
) {
  for (const reference of variable.references) {
    if (!reference.isRead()) {
      continue;
    }
    yield* extractCallReferencesForExpression(
      reference.identifier,
      name,
      paths,
      context,
    );
  }
}

/** Extract call references from expression */
function* extractCallReferencesForExpression(
  expression: Expression,
  name: string | null,
  paths: TargetPaths,
  context: Rule.RuleContext,
): Iterable<CallReference> {
  let node = expression;
  let parent = getParent(node);
  while (
    parent?.type === "ChainExpression" ||
    // @ts-expect-error -- TS AST
    parent?.type === "TSNonNullExpression" ||
    // @ts-expect-error -- TS AST
    parent?.type === "TSAsExpression"
  ) {
    node = parent;
    parent = getParent(node);
  }
  if (!parent) {
    return;
  }
  if (parent.type === "MemberExpression") {
    if (parent.object === node) {
      const nextPaths = paths.consumePath(name);
      if (!nextPaths) {
        return;
      }
      const memberName = getPropertyName(context, parent);
      if (memberName == null) {
        return;
      }
      yield* extractCallReferencesForExpression(
        parent,
        memberName,
        nextPaths,
        context,
      );
    }
  } else if (parent.type === "VariableDeclarator") {
    if (
      parent.init === node &&
      (getParent(parent) as VariableDeclaration)?.kind === "const"
    ) {
      yield* extractCallReferencesForPattern(parent.id, name, paths, context);
    }
  } else if (parent.type === "CallExpression") {
    const target = paths.getTargetCallPaths(name);
    if (target.length) {
      yield {
        node: parent,
        paths: target,
      };
    }
    if (name) {
      yield* extractCallReferencesForExpression(
        parent,
        `${name}()`,
        paths,
        context,
      );
    }
  }
}

/** Extract call references from pattern */
function* extractCallReferencesForPattern(
  pattern: Pattern,
  name: string | null,
  paths: TargetPaths,
  context: Rule.RuleContext,
): Iterable<CallReference> {
  let target = pattern;
  while (target.type === "AssignmentPattern") {
    target = target.left;
  }
  if (target.type === "Identifier") {
    const variable = findVariable(context, target);
    if (!variable) {
      return;
    }
    yield* extractCallReferencesForVariable(variable, name, paths, context);
  } else if (target.type === "ObjectPattern") {
    for (const prop of target.properties) {
      if (prop.type === "Property") {
        const nextPaths = paths.consumePath(name);
        if (!nextPaths) {
          continue;
        }
        const propName = getPropertyName(context, prop);
        if (propName == null) {
          continue;
        }
        yield* extractCallReferencesForPattern(
          prop.value,
          propName,
          paths,
          context,
        );
      } else if (prop.type === "RestElement") {
        yield* extractCallReferencesForPattern(
          prop.argument,
          name,
          paths,
          context,
        );
      }
    }
  }
}
