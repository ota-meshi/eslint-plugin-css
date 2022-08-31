import type { Colord } from "colord";
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
  parseNumberUnit,
  isPercentRange,
  parseArgumentValuesWithSpace,
  parseFunction,
} from "./parser";

export class ColorFromLch extends AbsColor {
  private readonly lch: LchData | IncompleteLchData;

  public constructor(lch: LchData | IncompleteLchData) {
    super();
    this.lch = lch;
  }

  public readonly type = "lch";

  public isComplete(): boolean {
    return (this.lch.complete && this.getColord()?.isValid()) || false;
  }

  public getAlpha(): number | null {
    return this.lch.alpha?.value ?? null;
  }

  public removeAlpha(): ColorFromLch {
    return new ColorFromLch({
      ...this.lch,
      alpha: null,
    });
  }

  public toColorString(): string {
    return `${this.lch.rawName}(${this.lch.lch}${this.lch.alpha || ""}${(
      this.lch.extraArgs || []
    ).join("")})`;
  }

  protected newColord(): Colord {
    return parseColord(this.toColorString());
  }
}

export type LchValue = {
  lightness: NumberWithUnit<"%">;
  chroma: NumberWithUnit<"">;
  hue: NumberWithUnit<"" | "deg" | "rad" | "grad" | "turn">;
};
export type LchData = {
  complete: true;
  rawName: string;
  lch: ValuesArgumentComplete<LchValue>;
  alpha: AlphaArgumentValid | null;
  extraArgs?: undefined;
};

export type IncompleteLchData = {
  complete: false;
  rawName: string;
  lch: ValuesArgument<LchValue>;
  alpha: AlphaArgument | null;
  extraArgs: FunctionArgument[];
};

/**
 * Parses a LCH CSS color function/string
 */
export function parseLch(
  input: string | postcssValueParser.Node
): LchData | IncompleteLchData | null {
  const fn = parseFunction(input, "lch");
  if (fn == null) {
    return null;
  }

  const values = parseArgumentValuesWithSpace(fn.arguments, {
    generate: (tokens): LchValue | null => {
      if (tokens.length !== 3) {
        return null;
      }
      const lightness = parseNumberUnit(tokens[0], ["%"]);
      if (!isPercentRange(lightness)) {
        return null;
      }
      const chroma = parseNumberUnit(tokens[1], [""]);
      const hue = parseNumberUnit(tokens[2], [
        "",
        "deg",
        "rad",
        "grad",
        "turn",
      ]);
      if (!chroma || !hue) {
        return null;
      }

      return {
        lightness,
        chroma,
        hue,
      };
    },
  });
  const lch = values.values;
  const alpha = values.alpha;

  if (lch.complete && (!alpha || alpha.valid) && fn.arguments.length === 0) {
    return {
      complete: true,
      rawName: fn.rawName,
      lch,
      alpha,
    };
  }

  return {
    complete: false,
    rawName: fn.rawName,
    lch,
    alpha,
    extraArgs: fn.arguments,
  };
}
