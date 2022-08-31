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
  parseNumberUnit,
  isPercentRange,
  parseArgumentValues,
  parseFunction,
} from "./parser";

export class ColorFromRgb extends AbsColor {
  private readonly rgb: RgbData | IncompleteRgbData;

  public constructor(rgb: RgbData | IncompleteRgbData) {
    super();
    this.rgb = rgb;
  }

  public readonly type = "rgb";

  public getRgb(): {
    r: number | null;
    g: number | null;
    b: number | null;
  } | null {
    const rgb = this.rgb.rgb;
    if (!rgb.value) {
      return null;
    }
    return {
      r: this.parseColor(rgb.value.r),
      g: this.parseColor(rgb.value.g),
      b: this.parseColor(rgb.value.b),
    };
  }

  public isComplete(): boolean {
    return (this.rgb.complete && this.getColord()?.isValid()) || false;
  }

  public getAlpha(): number | null {
    return this.rgb.alpha?.value ?? null;
  }

  public removeAlpha(): ColorFromRgb {
    return new ColorFromRgb({
      ...this.rgb,
      rawName: this.rgb.rawName.replace(/a$/iu, ""),
      alpha: null,
    });
  }

  public toColorString(): string {
    return `${this.rgb.rawName}(${this.rgb.rgb}${this.rgb.alpha || ""}${(
      this.rgb.extraArgs || []
    ).join("")})`;
  }

  protected newColord(): Colord | null {
    const rgb = this.getRgb();
    if (rgb && rgb.r != null && rgb.g != null && rgb.b != null) {
      const base = {
        r: rgb.r * 255,
        g: rgb.g * 255,
        b: rgb.b * 255,
      };
      const alpha = this.getAlpha();
      return alpha == null
        ? parseColord(base)
        : parseColord({
            ...base,
            a: alpha,
          });
    }
    return null;
  }

  private parseColor(value: NumberWithUnit<"" | "%">) {
    const num = value.unit === "%" ? value.number / 100 : value.number / 255;
    if (0 <= num && num <= 1) {
      return num;
    }
    return null;
  }
}

export type RgbValue<U extends "" | "%"> = {
  r: NumberWithUnit<U>;
  g: NumberWithUnit<U>;
  b: NumberWithUnit<U>;
  unit: U;
};

export type RgbDataValid<U extends "" | "%"> = {
  complete: true;
  rawName: string;
  rgb: ValuesArgumentComplete<RgbValue<U>>;
  alpha: AlphaArgumentValid | null;
  extraArgs?: undefined;
};
export type RgbData = RgbDataValid<""> | RgbDataValid<"%">;

export type IncompleteRgbData = {
  complete: false;
  rawName: string;
  rgb: ValuesArgument<RgbValue<"" | "%">>;
  alpha: AlphaArgument | null;
  extraArgs: FunctionArgument[];
};

/**
 * Parses a RGB CSS color function/string
 */
export function parseRgb(
  input: string | postcssValueParser.Node
): RgbData | IncompleteRgbData | null {
  const fn = parseFunction(input, ["rgb", "rgba"]);
  if (fn == null) {
    return null;
  }

  const values = parseArgumentValues(fn.arguments, {
    argCount: 3,
    generate: (tokens): RgbValue<""> | RgbValue<"%"> | null => {
      if (tokens.length !== 3) {
        return null;
      }
      const r = parseNumberUnit(tokens[0], ["", "%"]);
      if (!isValidColor(r)) {
        return null;
      }
      const g = parseNumberUnit(tokens[1], [r.unit]);
      const b = parseNumberUnit(tokens[2], [r.unit]);
      if (!isValidColor(g) || !isValidColor(b)) {
        return null;
      }

      return {
        r,
        g,
        b,
        unit: r.unit,
      } as RgbValue<""> | RgbValue<"%">;
    },
  });
  const rgb = values.values;
  const alpha = values.alpha;
  if (rgb.complete && (!alpha || alpha.valid) && fn.arguments.length === 0) {
    return {
      complete: true,
      rawName: fn.rawName,
      rgb,
      alpha,
    } as RgbData;
  }

  return {
    complete: false,
    rawName: fn.rawName,
    rgb,
    alpha,
    extraArgs: fn.arguments,
  };
}

/** Checks wether given node is in valid color range. */
function isValidColor<U extends "" | "%">(
  node: NumberWithUnit<U> | null
): node is NumberWithUnit<U> {
  if (!node) {
    return false;
  }
  return node.unit === "%"
    ? isPercentRange(node)
    : node.number >= 0 && node.number <= 255;
}
