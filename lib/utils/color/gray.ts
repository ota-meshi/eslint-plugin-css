import type { Colord } from "./colord";
import type postcssValueParser from "postcss-value-parser";
import { AbsColor } from "./color-class";
import { parseColord } from "./colord";
import type {
  AlphaArgument,
  AlphaArgumentValid,
  FunctionArgument,
  NumberWithUnit,
  ValuesArgument,
  ValuesArgumentComplete,
} from "./parser";
import {
  parseArgumentValues,
  isPercentRange,
  parseFunction,
  parseNumberUnit,
} from "./parser";

export class ColorFromGray extends AbsColor {
  private readonly gray: GrayData | IncompleteGrayData;

  public constructor(gray: GrayData | IncompleteGrayData) {
    super();
    this.gray = gray;
  }

  public readonly type = "gray";

  public isComplete(): boolean {
    return (this.gray.complete && this.getColord()?.isValid()) || false;
  }

  public getAlpha(): number | null {
    return this.gray.alpha?.value ?? null;
  }

  public removeAlpha(): ColorFromGray {
    return new ColorFromGray({
      ...this.gray,
      alpha: null,
    });
  }

  public toColorString(): string {
    return `${this.gray.rawName}(${this.gray.lightness}${
      this.gray.alpha || ""
    }${(this.gray.extraArgs || []).join("")})`;
  }

  protected newColord(): Colord | null {
    const gray = this.gray;
    if (gray.complete) {
      return parseColord({
        l: gray.lightness.value.number,
        a: 0,
        b: 0,
        alpha: gray.alpha?.value ?? undefined,
      });
    }
    return null;
  }
}

export type LightnessValue = NumberWithUnit<"" | "%">;
export type GrayData = {
  complete: true;
  rawName: string;
  lightness: ValuesArgumentComplete<LightnessValue>;
  alpha: AlphaArgumentValid | null;
  extraArgs?: undefined;
};

export type IncompleteGrayData = {
  complete: false;
  rawName: string;
  lightness: ValuesArgument<LightnessValue>;
  alpha: AlphaArgument | null;
  extraArgs: FunctionArgument[];
};

/**
 * Parses a gray() CSS color function/string
 */
export function parseGray(
  input: string | postcssValueParser.Node
): GrayData | IncompleteGrayData | null {
  const fn = parseFunction(input, "gray");
  if (fn == null) {
    return null;
  }

  const values = parseArgumentValues(fn.arguments, {
    argCount: 1,
    generate: (tokens): LightnessValue | null => {
      if (tokens.length !== 1) {
        return null;
      }
      const lightness = parseNumberUnit(tokens[0], ["", "%"]);
      if (!isPercentRange(lightness)) {
        return null;
      }

      return lightness;
    },
  });
  const lightness = values.values;
  const alpha = values.alpha;

  if (
    lightness.complete &&
    (!alpha || alpha.valid) &&
    fn.arguments.length === 0
  ) {
    return {
      complete: true,
      rawName: fn.rawName,
      lightness,
      alpha,
    };
  }

  return {
    complete: false,
    rawName: fn.rawName,
    lightness,
    alpha,
    extraArgs: fn.arguments,
  };
}
