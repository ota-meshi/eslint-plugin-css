import type { Colord } from "./colord";
import type postcssValueParser from "postcss-value-parser";
import { AbsColor } from "./color-class";
import { parseColord } from "./colord";

export class ColorFromHex extends AbsColor {
  private readonly hex: HexData;

  public constructor(hex: HexData) {
    super();
    this.hex = hex;
  }

  public readonly type = "hex";

  public getRgb(): { r: number; g: number; b: number } {
    return {
      r: this.parseColor(this.hex.r),
      g: this.parseColor(this.hex.g),
      b: this.parseColor(this.hex.b),
    };
  }

  public isComplete(): boolean {
    return true;
  }

  public getAlpha(): number | null {
    if (!this.hex.alpha) {
      return null;
    }
    return this.parseColor(this.hex.alpha);
  }

  public removeAlpha(): ColorFromHex {
    if (!this.hex.alpha) {
      return this;
    }
    return new ColorFromHex({
      ...this.hex,
      alpha: undefined,
    });
  }

  public toColorString(): string {
    return `#${this.hex.r}${this.hex.g}${this.hex.b}${this.hex.alpha || ""}`;
  }

  protected toHexImpl(): string {
    return this.toColorString();
  }

  private parseColor(hex: string) {
    const v = parseInt(hex, 16);
    if (hex.length === 1) {
      return v / 15;
    }
    return v / 255;
  }

  protected newColord(): Colord {
    const rgb = this.getRgb();
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
}

/**
 * Checks whether given string is hex.
 */
export function isHex(str: string): boolean {
  return /^#[\da-f]+$/iu.test(str);
}

export type HexData = {
  readonly kind: "RGB" | "RRGGBB";
  readonly r: string;
  readonly g: string;
  readonly b: string;
  readonly alpha?: string;
};

/**
 * Checks whether given string is hex.
 */
export function parseHex(
  input: string | postcssValueParser.Node,
): HexData | null {
  const hex =
    typeof input === "string"
      ? input
      : input.type === "word"
        ? input.value
        : "";
  if (!isHex(hex)) {
    return null;
  }
  if (hex.length === 4 || hex.length === 5) {
    const [, r, g, b, alpha] = hex;
    return { kind: "RGB", r, g, b, alpha };
  }
  if (hex.length === 7 || hex.length === 9) {
    const [, r1, r2, g1, g2, b1, b2, ...alpha] = hex;
    return {
      kind: "RRGGBB",
      r: r1 + r2,
      g: g1 + g2,
      b: b1 + b2,
      alpha: alpha.length ? alpha.join("") : undefined,
    };
  }
  return null;
}
