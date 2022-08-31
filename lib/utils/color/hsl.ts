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
  isPercentRange,
  parseArgumentValues,
  parseFunction,
  parseNumberUnit,
} from "./parser";

export class ColorFromHsl extends AbsColor {
  private readonly hsl: HslData | IncompleteHslData;

  public constructor(hsl: HslData | IncompleteHslData) {
    super();
    this.hsl = hsl;
  }

  public readonly type = "hsl";

  public isComplete(): boolean {
    return (this.hsl.complete && this.getColord()?.isValid()) || false;
  }

  public getAlpha(): number | null {
    return this.hsl.alpha?.value ?? null;
  }

  public removeAlpha(): ColorFromHsl {
    return new ColorFromHsl({
      ...this.hsl,
      rawName: this.hsl.rawName.replace(/a$/iu, ""),
      alpha: null,
    });
  }

  public toColorString(): string {
    return `${this.hsl.rawName}(${this.hsl.hsl}${this.hsl.alpha || ""}${(
      this.hsl.extraArgs || []
    ).join("")})`;
  }

  protected newColord(): Colord {
    return parseColord(this.toColorString());
  }
}

export type HslValue = {
  hue: NumberWithUnit<"" | "deg" | "rad" | "grad" | "turn">;
  saturation: NumberWithUnit<"%">;
  lightness: NumberWithUnit<"%">;
};

export type HslData = {
  complete: true;
  rawName: string;
  hsl: ValuesArgumentComplete<HslValue>;
  alpha: AlphaArgumentValid | null;
  extraArgs?: undefined;
};

export type IncompleteHslData = {
  complete: false;
  rawName: string;
  hsl: ValuesArgument<HslValue>;
  alpha: AlphaArgument | null;
  extraArgs: FunctionArgument[];
};

/**
 * Parses a HSL CSS color function/string
 */
export function parseHsl(
  input: string | postcssValueParser.Node
): HslData | IncompleteHslData | null {
  const fn = parseFunction(input, ["hsl", "hsla"]);
  if (fn == null) {
    return null;
  }

  const values = parseArgumentValues(fn.arguments, {
    argCount: 3,
    generate: (tokens): HslValue | null => {
      if (tokens.length !== 3) {
        return null;
      }
      const hue = parseNumberUnit(tokens[0], [
        "",
        "deg",
        "rad",
        "grad",
        "turn",
      ]);
      const saturation = parseNumberUnit(tokens[1], ["%"]);
      const lightness = parseNumberUnit(tokens[2], ["%"]);
      if (!hue || !isPercentRange(saturation) || !isPercentRange(lightness)) {
        return null;
      }

      return {
        hue,
        saturation,
        lightness,
      };
    },
  });

  const hsl = values.values;
  const alpha = values.alpha;

  if (hsl.complete && (!alpha || alpha.valid) && fn.arguments.length === 0) {
    return {
      complete: true,
      rawName: fn.rawName,
      hsl,
      alpha,
    };
  }

  return {
    complete: false,
    rawName: fn.rawName,
    hsl,
    alpha,
    extraArgs: fn.arguments,
  };
}
