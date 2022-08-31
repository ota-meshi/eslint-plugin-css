import postcssValueParser from "postcss-value-parser";
import { parseInput } from "./parser";
import { ColorFromHex, isHex, parseHex } from "./hex";
import { parseGray, ColorFromGray } from "./gray";
import { parseLab, ColorFromLab } from "./lab";
import { ColorFromHwb, parseHwb } from "./hwb";
import { ColorFromRgb, parseRgb } from "./rgb";
import { ColorFromHsl, parseHsl } from "./hsl";
import { ColorFromLch, parseLch } from "./lch";
import { AbsColor } from "./color-class";
import { getColorFormat, parseColord } from "./colord";
import type { Colord } from "colord";

class InvalidColor extends AbsColor {
  public readonly input: string;

  public constructor(input: string) {
    super();
    this.input = input;
  }

  public readonly type = "invalid";

  public isComplete() {
    return false;
  }

  public getAlpha() {
    return null;
  }

  public removeAlpha() {
    return this;
  }

  public toColorString() {
    return this.input;
  }

  protected newColord(): null {
    return null;
  }
}

class ColorForColord extends AbsColor {
  private typeCache?: "unknown" | "name";

  public readonly input: string;

  public constructor(input: string) {
    super();
    this.input = input;
  }

  public get type(): "unknown" | "name" {
    return (this.typeCache ??=
      /^[a-z]+$/iu.test(this.input) && getColorFormat(this.input) === "name"
        ? "name"
        : "unknown");
  }

  public isComplete() {
    return this.getColord()?.isValid() || false;
  }

  public getAlpha() {
    return this.getColord()?.alpha() ?? null;
  }

  public removeAlpha() {
    return this;
  }

  public toColorString() {
    return this.input;
  }

  protected toNameImpl() {
    return this.type === "name" ? this.input : super.toNameImpl();
  }

  protected newColord(): Colord {
    return parseColord(this.toColorString());
  }
}

export type Color =
  | ColorFromHex
  | ColorFromRgb
  | ColorFromHsl
  | ColorFromHwb
  | ColorFromLab
  | ColorFromLch
  | ColorFromGray
  | ColorForColord
  | InvalidColor;

/**
 * Parse color
 */
export function parseColor(input: postcssValueParser.Node | string): Color {
  const hex = parseHex(input);
  if (hex) {
    return new ColorFromHex(hex);
  }

  const node = parseInput(input);
  if (node) {
    const rgb = parseRgb(node);
    if (rgb) {
      return new ColorFromRgb(rgb);
    }
    const hsl = parseHsl(node);
    if (hsl) {
      return new ColorFromHsl(hsl);
    }
    const hwb = parseHwb(node);
    if (hwb) {
      return new ColorFromHwb(hwb);
    }
    const lab = parseLab(node);
    if (lab) {
      return new ColorFromLab(lab);
    }
    const lch = parseLch(node);
    if (lch) {
      return new ColorFromLch(lch);
    }
    const gray = parseGray(node);
    if (gray) {
      return new ColorFromGray(gray);
    }
  }
  return new ColorForColord(
    typeof input === "string" ? input : postcssValueParser.stringify(input)
  );
}
/**
 * Parse color from hex
 */
export function parseHexColor(hex: string): Color {
  if (!isHex(hex)) {
    return new InvalidColor(hex);
  }
  return parseColor(hex);
}
