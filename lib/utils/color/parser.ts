import postcssValueParser from "postcss-value-parser";
import type { Unit } from "./data";

export class FunctionArgument {
  private readonly raws: Readonly<{ before: string; after: string }>;

  public readonly node: postcssValueParser.Node;

  public constructor(
    before: string,
    node: postcssValueParser.Node,
    after?: string
  ) {
    this.raws = {
      before,
      after: after || "",
    };
    this.node = node;
  }

  public toString(): string {
    return `${this.raws.before}${postcssValueParser.stringify(this.node)}${
      this.raws.after
    }`;
  }
}

export type AlphaArgument = AlphaArgumentValid | AlphaArgumentInvalid;

export abstract class AbsAlphaArgument<V extends number | null> {
  private readonly div: FunctionArgument;

  private readonly tokens: FunctionArgument[];

  public readonly value: V;

  public constructor(
    div: FunctionArgument,
    tokens: FunctionArgument[],
    alpha: V
  ) {
    this.div = div;
    this.tokens = tokens;
    this.value = alpha;
  }

  public toAlphaString(): string {
    return this.tokens.join("");
  }

  public toString(): string {
    return `${this.div}${this.toAlphaString()}`;
  }
}

export class AlphaArgumentValid extends AbsAlphaArgument<number> {
  public get valid(): true {
    return true;
  }
}
export class AlphaArgumentInvalid extends AbsAlphaArgument<number | null> {
  public get valid(): false {
    return false;
  }
}

export type NumberWithUnit<U extends Unit> = { number: number; unit: U };

export type ValuesArgument<V> =
  | ValuesArgumentComplete<V>
  | ValuesArgumentIncomplete;
abstract class AbsValuesArgument<V> {
  private readonly tokens: FunctionArgument[];

  public readonly value: V;

  public constructor(tokens: FunctionArgument[], value: V) {
    this.tokens = tokens;
    this.value = value;
  }

  public toString(): string {
    return this.tokens.join("");
  }
}

export class ValuesArgumentComplete<V> extends AbsValuesArgument<V> {
  public readonly complete = true;
}
export class ValuesArgumentIncomplete extends AbsValuesArgument<null> {
  public readonly complete = false;

  public constructor(tokens: FunctionArgument[]) {
    super(tokens, null);
  }
}

/** Parse function */
export function parseFunction(
  input: string | postcssValueParser.Node,
  expectName: string | string[]
): null | { rawName: string; arguments: FunctionArgument[] } {
  const node = parseInput(input);
  if (!node) {
    return null;
  }
  if (node.type !== "function") {
    return null;
  }
  if (
    Array.isArray(expectName)
      ? !expectName.includes(node.value.toLowerCase())
      : node.value.toLowerCase() !== expectName
  ) {
    return null;
  }
  const argumentList: {
    before: string;
    node: postcssValueParser.Node;
    after?: string;
  }[] = [];
  let before = node.before;
  for (const argNode of node.nodes) {
    if (argNode.type !== "comment" && argNode.type !== "space") {
      argumentList.push({ before, node: argNode });
      before = "";
    } else {
      before += postcssValueParser.stringify(argNode);
    }
  }

  if (argumentList.length > 0) {
    argumentList[argumentList.length - 1].after = `${before}${node.after}`;
  }
  return {
    rawName: node.value,
    arguments: argumentList.map(
      (data) => new FunctionArgument(data.before, data.node, data.after)
    ),
  };
}

/** Parse number unit */
export function parseNumberUnit<U extends Unit>(
  input: FunctionArgument | undefined,
  expectUnits: U[]
): NumberWithUnit<U> | null {
  if (!input) {
    return null;
  }
  if (input.node.type !== "word") {
    return null;
  }

  const data = postcssValueParser.unit(input.node.value);
  if (!data) {
    return null;
  }
  if (!(expectUnits as string[]).includes(data.unit)) {
    return null;
  }

  return {
    number: Number(data.number),
    unit: data.unit as U,
  };
}

/** Parse alpha arguments */
function parseAlphaArgument(
  div: FunctionArgument,
  functionArguments: FunctionArgument[]
): AlphaArgument {
  const tokens: FunctionArgument[] = [];
  const alphaNode = functionArguments.shift();
  if (!alphaNode) {
    return new AlphaArgumentInvalid(div, tokens, null);
  }
  tokens.push(alphaNode);
  if (functionArguments.length) {
    while (functionArguments.length) {
      tokens.push(functionArguments.shift()!);
    }
    return new AlphaArgumentInvalid(div, tokens, null);
  }
  const alphaData = parseNumberUnit(alphaNode, ["", "%"]);
  if (!alphaData) {
    return new AlphaArgumentInvalid(div, tokens, null);
  }
  const alphaValue = alphaData.number / (alphaData.unit === "%" ? 100 : 1);
  if (alphaValue >= 0 && alphaValue <= 1) {
    return new AlphaArgumentValid(div, tokens, alphaValue);
  }
  return new AlphaArgumentInvalid(div, tokens, alphaValue);
}

/** Parse input */
export function parseInput(
  input: string | postcssValueParser.Node | undefined
): postcssValueParser.Node | null {
  if (typeof input === "string") {
    const parsed = postcssValueParser(input);
    if (parsed.nodes.length !== 1) {
      return null;
    }
    return parsed.nodes[0];
  }
  return input ?? null;
}

/** Checks wether given node is between 0 and 100. */
export function isPercentRange(
  node: NumberWithUnit<"" | "%"> | null
): node is NumberWithUnit<"" | "%"> {
  return Boolean(node && node.number >= 0 && node.number <= 100);
}

type ParseArgumentValuesOption<V> = {
  generate: (args: FunctionArgument[]) => V | null;
};
type ParseArgumentValuesWithCommaOption<V> = ParseArgumentValuesOption<V> & {
  argCount: number;
};

/** Parse argument values */
export function parseArgumentValues<V>(
  functionArguments: FunctionArgument[],
  option: ParseArgumentValuesWithCommaOption<V>
): {
  values: ValuesArgument<V>;
  alpha: AlphaArgument | null;
} {
  if (functionArguments.some((t) => t.node.value === ",")) {
    return parseArgumentValuesWithComma(functionArguments, option);
  }
  return parseArgumentValuesWithSpace(functionArguments, option);
}

/** Parse argument values */
export function parseArgumentValuesWithSpace<V>(
  functionArguments: FunctionArgument[],
  option: ParseArgumentValuesOption<V>
): {
  values: ValuesArgument<V>;
  alpha: AlphaArgument | null;
} {
  let alpha: AlphaArgument | null = null;
  const tokens: FunctionArgument[] = [];
  while (functionArguments.length) {
    const token = functionArguments.shift()!;
    if (token.node.value === "/") {
      alpha = parseAlphaArgument(token, functionArguments);
      break;
    }
    tokens.push(token);
  }

  if (tokens.length) {
    const value = option.generate(tokens);
    if (value) {
      return {
        values: new ValuesArgumentComplete(tokens, value),
        alpha,
      };
    }
  }
  return {
    values: new ValuesArgumentIncomplete(tokens),
    alpha,
  };
}

/** Parse argument values */
export function parseArgumentValuesWithComma<V>(
  functionArguments: FunctionArgument[],
  option: ParseArgumentValuesWithCommaOption<V>
): {
  values: ValuesArgument<V>;
  alpha: AlphaArgument | null;
} {
  let commaCount = 0;

  let alpha: AlphaArgument | null = null;
  const tokens: FunctionArgument[] = [];
  while (functionArguments.length) {
    const token = functionArguments.shift()!;
    if (token.node.value === ",") {
      commaCount++;
      if (commaCount >= option.argCount) {
        alpha = parseAlphaArgument(token, functionArguments);
        break;
      }
    }
    tokens.push(token);
  }

  if (tokens.length) {
    const argumentTokens: FunctionArgument[] = [];
    let validComma = true;
    let comma = false;
    for (const token of tokens) {
      if (comma) {
        if (token.node.value !== ",") {
          validComma = false;
          break;
        }
      } else {
        argumentTokens.push(token);
      }
      comma = !comma;
    }
    if (validComma) {
      const value = option.generate(argumentTokens);
      if (value) {
        return {
          values: new ValuesArgumentComplete(tokens, value),
          alpha,
        };
      }
    }
  }
  return {
    values: new ValuesArgumentIncomplete(tokens),
    alpha,
  };
}
