import { DEG_TO_RAD, RAD_TO_DEG } from './constants';
import { MathUtils } from './math';

type LABColor = { l: number; a: number; b: number };
type LCHColor = { l: number; c: number; h: number };

export class ColorUtils {
  public static equals(a: Color4, b: Color4, epsilon: number = 0): boolean {
    return (
      Math.abs(a.r - b.r) <= epsilon
      && Math.abs(a.g - b.g) <= epsilon
      && Math.abs(a.b - b.b) <= epsilon
      && Math.abs(a.a - b.a) <= epsilon
    );
  }

  public static add(a: Color4, b: Color4): Color4 {
    return new Color4(a.r + b.r, a.g + b.g, a.b + b.b, a.a + b.a);
  }

  public static subtract(a: Color4, b: Color4): Color4 {
    return new Color4(a.r - b.r, a.g - b.g, a.b - b.b, a.a - b.a);
  }

  public static scale(color: Color4, scale: number): Color4 {
    return new Color4(color.r * scale, color.g * scale, color.b * scale, color.a * scale);
  }

  public static multiply(a: Color4, b: Color4): Color4 {
    return new Color4(a.r * b.r, a.g * b.g, a.b * b.b, a.a * b.a);
  }

  public static divide(color: Color4, divider: Color4 | number): Color4 {
    if (typeof divider === 'number') {
      if (divider === 0) throw Error('Division by zero');
      return new Color4(
        color.r / divider,
        color.g / divider,
        color.b / divider,
        color.a / divider,
      );
    } else {
      if (divider.r === 0 || divider.g === 0 || divider.b === 0 || divider.a === 0)
        throw Error('Division by zero');
      return new Color4(
        color.r / divider.r,
        color.g / divider.g,
        color.b / divider.b,
        color.a / divider.a,
      );
    }
  }

  public static inverse(color: Color4): Color4 {
    return new Color4(255 - color.r, 255 - color.g, 255 - color.b, color.a);
  }

  /**
   * Clamps each component to [0, 255]
   */
  public static clamp(color: Color4): Color4 {
    return new Color4(
      MathUtils.clamp(color.r, 0, 255),
      MathUtils.clamp(color.g, 0, 255),
      MathUtils.clamp(color.b, 0, 255),
      MathUtils.clamp(color.a, 0, 255),
    );
  }

  /**
   * Rounds each component to the nearest integer and clamps it to [0, 255]
   */
  public static round(color: Color4): Color4 {
    return ColorUtils.clamp(
      new Color4(
        Math.round(color.r),
        Math.round(color.g),
        Math.round(color.b),
        Math.round(color.a),
      ),
    );
  }

  // uses oklab to get better gradients when interpolating
  public static lerp(
    a: Color4,
    b: Color4,
    fraction: number,
    clamp: boolean = true,
  ): Color4 {
    let t = fraction;
    if (clamp) {
      t = MathUtils.clamp(t, 0, 1);
    }

    const alab = ColorUtils.LinearSrgbToOklab(a);
    const blab = ColorUtils.LinearSrgbToOklab(b);

    const resultlab: LABColor = {
      l: alab.l + (blab.l - alab.l) * t,
      a: alab.a + (blab.a - alab.a) * t,
      b: alab.b + (blab.b - alab.b) * t,
    };

    // interpolating in oklab can land slightly outside the srgb gamut
    return ColorUtils.clamp(
      ColorUtils.OklabToLinearSrgb(resultlab, a.a + (b.a - a.a) * t),
    );
  }

  /**
   * Samples a multi-stop gradient at a 0.0-1.0 fraction, interpolating in oklab
   */
  public static gradient(
    colors: readonly Color4[],
    fraction: number,
    clamp: boolean = true,
  ): Color4 {
    if (colors.length === 0) throw Error('Gradient requires at least one color');
    if (colors.length === 1) return new Color4(colors[0]);

    const t = clamp ? MathUtils.clamp(fraction, 0, 1) : fraction;
    const scaled = t * (colors.length - 1);
    const index = MathUtils.clamp(Math.floor(scaled), 0, colors.length - 2);
    return ColorUtils.lerp(colors[index], colors[index + 1], scaled - index, clamp);
  }

  /**
   * Rotates the hue by the given angle in degrees, preserving lightness and alpha
   */
  public static hueShift(color: Color4, degrees: number): Color4 {
    const lch = ColorUtils.OklabToOklch(ColorUtils.LinearSrgbToOklab(color));
    lch.h += degrees;
    return ColorUtils.clamp(
      ColorUtils.OklabToLinearSrgb(ColorUtils.OklchToOklab(lch), color.a),
    );
  }

  /**
   * Mixes the color towards white in oklab, amount 0-1
   */
  public static lighten(color: Color4, amount: number): Color4 {
    return ColorUtils.lerp(color, new Color4(255, 255, 255, color.a), amount);
  }

  /**
   * Mixes the color towards black in oklab, amount 0-1
   */
  public static darken(color: Color4, amount: number): Color4 {
    return ColorUtils.lerp(color, new Color4(0, 0, 0, color.a), amount);
  }

  /**
   * Scales the chroma (colorfulness) by 1 + amount, e.g. 0.5 for 50% more saturated
   */
  public static saturate(color: Color4, amount: number): Color4 {
    const lch = ColorUtils.OklabToOklch(ColorUtils.LinearSrgbToOklab(color));
    lch.c = Math.max(lch.c * (1 + amount), 0);
    return ColorUtils.clamp(
      ColorUtils.OklabToLinearSrgb(ColorUtils.OklchToOklab(lch), color.a),
    );
  }

  /**
   * Scales the chroma (colorfulness) by 1 - amount, 1 gives a gray of the same lightness
   */
  public static desaturate(color: Color4, amount: number): Color4 {
    return ColorUtils.saturate(color, -amount);
  }

  /**
   * Perceived brightness 0-255, using Rec. 709 luma weights
   */
  public static luminance(color: Color4): number {
    return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
  }

  /**
   * Converts the color to a gray of the same perceived brightness, keeping alpha
   */
  public static grayscale(color: Color4): Color4 {
    const luminance = ColorUtils.luminance(color);
    return new Color4(luminance, luminance, luminance, color.a);
  }

  /**
   * Returns a random opaque color
   */
  public static random(): Color4 {
    return new Color4(
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      255,
    );
  }

  public static withR(color: Color4, x: number): Color4 {
    return new Color4(x, color.g, color.b, color.a);
  }

  public static withG(color: Color4, x: number): Color4 {
    return new Color4(color.r, x, color.b, color.a);
  }

  public static withB(color: Color4, x: number): Color4 {
    return new Color4(color.r, color.g, x, color.a);
  }

  public static withA(color: Color4, x: number): Color4 {
    return new Color4(color.r, color.g, color.b, x);
  }

  public static fromRgba(rgba: number): Color4 {
    return Color4.fromRgba(rgba);
  }

  /**
   * Packs the color into a 0xRRGGBBAA integer (components rounded and clamped)
   */
  public static toRgba(color: Color4): number {
    const c = ColorUtils.round(color);
    return ((c.r << 24) | (c.g << 16) | (c.b << 8) | c.a) >>> 0;
  }

  /**
   * Creates a Color from a hex string: #rgb, #rgba, #rrggbb or #rrggbbaa
   * (leading # optional)
   */
  public static fromHex(hex: string): Color4 {
    let digits = hex.startsWith('#') ? hex.slice(1) : hex;
    if (digits.length === 3 || digits.length === 4) {
      digits = [...digits].map((digit) => digit + digit).join('');
    }
    if (!/^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(digits)) {
      throw Error(`Invalid hex color: ${hex}`);
    }
    return new Color4(
      parseInt(digits.slice(0, 2), 16),
      parseInt(digits.slice(2, 4), 16),
      parseInt(digits.slice(4, 6), 16),
      digits.length === 8 ? parseInt(digits.slice(6, 8), 16) : 255,
    );
  }

  /**
   * Formats the color as a hex string, e.g. #ff8800 (alpha appended when not 255)
   */
  public static toHex(color: Color4): string {
    const c = ColorUtils.round(color);
    const hex = (component: number) => component.toString(16).padStart(2, '0');
    return `#${hex(c.r)}${hex(c.g)}${hex(c.b)}${c.a === 255 ? '' : hex(c.a)}`;
  }

  // https://bottosson.github.io/posts/oklab/
  public static LinearSrgbToOklab(c: Color4): LABColor {
    const l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
    const m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
    const s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;

    const l_ = Math.cbrt(l);
    const m_ = Math.cbrt(m);
    const s_ = Math.cbrt(s);

    return {
      l: 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
      a: 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
      b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
    };
  }

  public static OklabToLinearSrgb(c: LABColor, a?: number): Color4 {
    const l_ = c.l + 0.3963377774 * c.a + 0.2158037573 * c.b;
    const m_ = c.l - 0.1055613458 * c.a - 0.0638541728 * c.b;
    const s_ = c.l - 0.0894841775 * c.a - 1.2914855480 * c.b;

    const l = l_ * l_ * l_;
    const m = m_ * m_ * m_;
    const s = s_ * s_ * s_;

    return new Color4(
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
      a ?? 255,
    );
  }

  public static OklabToOklch(c: LABColor): LCHColor {
    const hue = Math.atan2(c.b, c.a) * RAD_TO_DEG;
    return {
      l: c.l,
      c: Math.hypot(c.a, c.b),
      h: hue < 0 ? hue + 360 : hue,
    };
  }

  public static OklchToOklab(c: LCHColor): LABColor {
    return {
      l: c.l,
      a: c.c * Math.cos(c.h * DEG_TO_RAD),
      b: c.c * Math.sin(c.h * DEG_TO_RAD),
    };
  }
}

export class Color4 {
  public r: number;
  public g: number;
  public b: number;
  public a: number;

  constructor(r: number, g: number, b: number, a?: number);
  constructor(color: { r: number; g: number; b: number; a?: number });
  constructor(
    rOrColor: number | { r: number; g: number; b: number; a?: number },
    g?: number,
    b?: number,
    a?: number,
  ) {
    if (typeof rOrColor === 'object') {
      this.r = rOrColor.r;
      this.g = rOrColor.g;
      this.b = rOrColor.b;
      this.a = rOrColor.a ?? 255;
    } else {
      this.r = rOrColor;
      this.g = g!;
      this.b = b!;
      this.a = a ?? 255;
    }
  }

  /**
   * Creates a Color from a packed 0xRRGGBBAA integer, e.g. 0x00FF00FF for opaque green
   */
  public static fromRgba(rgba: number): Color4 {
    return new Color4(
      (rgba >>> 24) & 0xff,
      (rgba >>> 16) & 0xff,
      (rgba >>> 8) & 0xff,
      rgba & 0xff,
    );
  }

  /**
   * Creates a Color from a hex string: #rgb, #rgba, #rrggbb or #rrggbbaa
   * (leading # optional)
   */
  public static fromHex(hex: string): Color4 {
    return ColorUtils.fromHex(hex);
  }

  /**
   * Samples a multi-stop gradient at a 0.0-1.0 fraction, interpolating in oklab
   */
  public static gradient(
    colors: readonly Color4[],
    fraction: number,
    clamp: boolean = true,
  ): Color4 {
    return ColorUtils.gradient(colors, fraction, clamp);
  }

  /**
   * Returns a random opaque color
   */
  public static random(): Color4 {
    return ColorUtils.random();
  }

  // web colors
  public static readonly Transparent: Readonly<Color4> = Color4.fromRgba(0xFFFFFF00);
  public static readonly AliceBlue: Readonly<Color4> = Color4.fromRgba(0xF0F8FFFF);
  public static readonly AntiqueWhite: Readonly<Color4> = Color4.fromRgba(0xFAEBD7FF);
  public static readonly Aqua: Readonly<Color4> = Color4.fromRgba(0x00FFFFFF);
  public static readonly Aquamarine: Readonly<Color4> = Color4.fromRgba(0x7FFFD4FF);
  public static readonly Azure: Readonly<Color4> = Color4.fromRgba(0xF0FFFFFF);
  public static readonly Beige: Readonly<Color4> = Color4.fromRgba(0xF5F5DCFF);
  public static readonly Bisque: Readonly<Color4> = Color4.fromRgba(0xFFE4C4FF);
  public static readonly Black: Readonly<Color4> = Color4.fromRgba(0x000000FF);
  public static readonly BlanchedAlmond: Readonly<Color4> = Color4.fromRgba(0xFFEBCDFF);
  public static readonly Blue: Readonly<Color4> = Color4.fromRgba(0x0000FFFF);
  public static readonly BlueViolet: Readonly<Color4> = Color4.fromRgba(0x8A2BE2FF);
  public static readonly Brown: Readonly<Color4> = Color4.fromRgba(0xA52A2AFF);
  public static readonly BurlyWood: Readonly<Color4> = Color4.fromRgba(0xDEB887FF);
  public static readonly CadetBlue: Readonly<Color4> = Color4.fromRgba(0x5F9EA0FF);
  public static readonly Chartreuse: Readonly<Color4> = Color4.fromRgba(0x7FFF00FF);
  public static readonly Chocolate: Readonly<Color4> = Color4.fromRgba(0xD2691EFF);
  public static readonly Coral: Readonly<Color4> = Color4.fromRgba(0xFF7F50FF);
  public static readonly CornflowerBlue: Readonly<Color4> = Color4.fromRgba(0x6495EDFF);
  public static readonly Cornsilk: Readonly<Color4> = Color4.fromRgba(0xFFF8DCFF);
  public static readonly Crimson: Readonly<Color4> = Color4.fromRgba(0xDC143CFF);
  public static readonly Cyan: Readonly<Color4> = Color4.fromRgba(0x00FFFFFF);
  public static readonly DarkBlue: Readonly<Color4> = Color4.fromRgba(0x00008BFF);
  public static readonly DarkCyan: Readonly<Color4> = Color4.fromRgba(0x008B8BFF);
  public static readonly DarkGoldenrod: Readonly<Color4> = Color4.fromRgba(0xB8860BFF);
  public static readonly DarkGray: Readonly<Color4> = Color4.fromRgba(0xA9A9A9FF);
  public static readonly DarkGreen: Readonly<Color4> = Color4.fromRgba(0x006400FF);
  public static readonly DarkKhaki: Readonly<Color4> = Color4.fromRgba(0xBDB76BFF);
  public static readonly DarkMagenta: Readonly<Color4> = Color4.fromRgba(0x8B008BFF);
  public static readonly DarkOliveGreen: Readonly<Color4> = Color4.fromRgba(0x556B2FFF);
  public static readonly DarkOrange: Readonly<Color4> = Color4.fromRgba(0xFF8C00FF);
  public static readonly DarkOrchid: Readonly<Color4> = Color4.fromRgba(0x9932CCFF);
  public static readonly DarkRed: Readonly<Color4> = Color4.fromRgba(0x8B0000FF);
  public static readonly DarkSalmon: Readonly<Color4> = Color4.fromRgba(0xE9967AFF);
  public static readonly DarkSeaGreen: Readonly<Color4> = Color4.fromRgba(0x8FBC8FFF);
  public static readonly DarkSlateBlue: Readonly<Color4> = Color4.fromRgba(0x483D8BFF);
  public static readonly DarkSlateGray: Readonly<Color4> = Color4.fromRgba(0x2F4F4FFF);
  public static readonly DarkTurquoise: Readonly<Color4> = Color4.fromRgba(0x00CED1FF);
  public static readonly DarkViolet: Readonly<Color4> = Color4.fromRgba(0x9400D3FF);
  public static readonly DeepPink: Readonly<Color4> = Color4.fromRgba(0xFF1493FF);
  public static readonly DeepSkyBlue: Readonly<Color4> = Color4.fromRgba(0x00BFFFFF);
  public static readonly DimGray: Readonly<Color4> = Color4.fromRgba(0x696969FF);
  public static readonly DodgerBlue: Readonly<Color4> = Color4.fromRgba(0x1E90FFFF);
  public static readonly Firebrick: Readonly<Color4> = Color4.fromRgba(0xB22222FF);
  public static readonly FloralWhite: Readonly<Color4> = Color4.fromRgba(0xFFFAF0FF);
  public static readonly ForestGreen: Readonly<Color4> = Color4.fromRgba(0x228B22FF);
  public static readonly Fuchsia: Readonly<Color4> = Color4.fromRgba(0xFF00FFFF);
  public static readonly Gainsboro: Readonly<Color4> = Color4.fromRgba(0xDCDCDCFF);
  public static readonly GhostWhite: Readonly<Color4> = Color4.fromRgba(0xF8F8FFFF);
  public static readonly Gold: Readonly<Color4> = Color4.fromRgba(0xFFD700FF);
  public static readonly Goldenrod: Readonly<Color4> = Color4.fromRgba(0xDAA520FF);
  public static readonly Gray: Readonly<Color4> = Color4.fromRgba(0x808080FF);
  public static readonly Green: Readonly<Color4> = Color4.fromRgba(0x00FF00FF);
  public static readonly GreenYellow: Readonly<Color4> = Color4.fromRgba(0xADFF2FFF);
  public static readonly Honeydew: Readonly<Color4> = Color4.fromRgba(0xF0FFF0FF);
  public static readonly HotPink: Readonly<Color4> = Color4.fromRgba(0xFF69B4FF);
  public static readonly IndianRed: Readonly<Color4> = Color4.fromRgba(0xCD5C5CFF);
  public static readonly Indigo: Readonly<Color4> = Color4.fromRgba(0x4B0082FF);
  public static readonly Ivory: Readonly<Color4> = Color4.fromRgba(0xFFFFF0FF);
  public static readonly Khaki: Readonly<Color4> = Color4.fromRgba(0xF0E68CFF);
  public static readonly Lavender: Readonly<Color4> = Color4.fromRgba(0xE6E6FAFF);
  public static readonly LavenderBlush: Readonly<Color4> = Color4.fromRgba(0xFFF0F5FF);
  public static readonly LawnGreen: Readonly<Color4> = Color4.fromRgba(0x7CFC00FF);
  public static readonly LemonChiffon: Readonly<Color4> = Color4.fromRgba(0xFFFACDFF);
  public static readonly LightBlue: Readonly<Color4> = Color4.fromRgba(0xADD8E6FF);
  public static readonly LightCoral: Readonly<Color4> = Color4.fromRgba(0xF08080FF);
  public static readonly LightCyan: Readonly<Color4> = Color4.fromRgba(0xE0FFFFFF);
  public static readonly LightGoldenrodYellow: Readonly<Color4> = Color4.fromRgba(0xFAFAD2FF);
  public static readonly LightGray: Readonly<Color4> = Color4.fromRgba(0xD3D3D3FF);
  public static readonly LightGreen: Readonly<Color4> = Color4.fromRgba(0x90EE90FF);
  public static readonly LightPink: Readonly<Color4> = Color4.fromRgba(0xFFB6C1FF);
  public static readonly LightSalmon: Readonly<Color4> = Color4.fromRgba(0xFFA07AFF);
  public static readonly LightSeaGreen: Readonly<Color4> = Color4.fromRgba(0x20B2AAFF);
  public static readonly LightSkyBlue: Readonly<Color4> = Color4.fromRgba(0x87CEFAFF);
  public static readonly LightSlateGray: Readonly<Color4> = Color4.fromRgba(0x778899FF);
  public static readonly LightSteelBlue: Readonly<Color4> = Color4.fromRgba(0xB0C4DEFF);
  public static readonly LightYellow: Readonly<Color4> = Color4.fromRgba(0xFFFFE0FF);
  public static readonly Lime: Readonly<Color4> = Color4.fromRgba(0x008000FF);
  public static readonly LimeGreen: Readonly<Color4> = Color4.fromRgba(0x32CD32FF);
  public static readonly Linen: Readonly<Color4> = Color4.fromRgba(0xFAF0E6FF);
  public static readonly Magenta: Readonly<Color4> = Color4.fromRgba(0xFF00FFFF);
  public static readonly Maroon: Readonly<Color4> = Color4.fromRgba(0x800000FF);
  public static readonly MediumAquamarine: Readonly<Color4> = Color4.fromRgba(0x66CDAAFF);
  public static readonly MediumBlue: Readonly<Color4> = Color4.fromRgba(0x0000CDFF);
  public static readonly MediumOrchid: Readonly<Color4> = Color4.fromRgba(0xBA55D3FF);
  public static readonly MediumPurple: Readonly<Color4> = Color4.fromRgba(0x9370DBFF);
  public static readonly MediumSeaGreen: Readonly<Color4> = Color4.fromRgba(0x3CB371FF);
  public static readonly MediumSlateBlue: Readonly<Color4> = Color4.fromRgba(0x7B68EEFF);
  public static readonly MediumSpringGreen: Readonly<Color4> = Color4.fromRgba(0x00FA9AFF);
  public static readonly MediumTurquoise: Readonly<Color4> = Color4.fromRgba(0x48D1CCFF);
  public static readonly MediumVioletRed: Readonly<Color4> = Color4.fromRgba(0xC71585FF);
  public static readonly MidnightBlue: Readonly<Color4> = Color4.fromRgba(0x191970FF);
  public static readonly MintCream: Readonly<Color4> = Color4.fromRgba(0xF5FFFAFF);
  public static readonly MistyRose: Readonly<Color4> = Color4.fromRgba(0xFFE4E1FF);
  public static readonly Moccasin: Readonly<Color4> = Color4.fromRgba(0xFFE4B5FF);
  public static readonly NavajoWhite: Readonly<Color4> = Color4.fromRgba(0xFFDEADFF);
  public static readonly Navy: Readonly<Color4> = Color4.fromRgba(0x000080FF);
  public static readonly OldLace: Readonly<Color4> = Color4.fromRgba(0xFDF5E6FF);
  public static readonly Olive: Readonly<Color4> = Color4.fromRgba(0x808000FF);
  public static readonly OliveDrab: Readonly<Color4> = Color4.fromRgba(0x6B8E23FF);
  public static readonly Orange: Readonly<Color4> = Color4.fromRgba(0xFFA500FF);
  public static readonly OrangeRed: Readonly<Color4> = Color4.fromRgba(0xFF4500FF);
  public static readonly Orchid: Readonly<Color4> = Color4.fromRgba(0xDA70D6FF);
  public static readonly PaleGoldenrod: Readonly<Color4> = Color4.fromRgba(0xEEE8AAFF);
  public static readonly PaleGreen: Readonly<Color4> = Color4.fromRgba(0x98FB98FF);
  public static readonly PaleTurquoise: Readonly<Color4> = Color4.fromRgba(0xAFEEEEFF);
  public static readonly PaleVioletRed: Readonly<Color4> = Color4.fromRgba(0xDB7093FF);
  public static readonly PapayaWhip: Readonly<Color4> = Color4.fromRgba(0xFFEFD5FF);
  public static readonly PeachPuff: Readonly<Color4> = Color4.fromRgba(0xFFDAB9FF);
  public static readonly Peru: Readonly<Color4> = Color4.fromRgba(0xCD853FFF);
  public static readonly Pink: Readonly<Color4> = Color4.fromRgba(0xFFC0CBFF);
  public static readonly Plum: Readonly<Color4> = Color4.fromRgba(0xDDA0DDFF);
  public static readonly PowderBlue: Readonly<Color4> = Color4.fromRgba(0xB0E0E6FF);
  public static readonly Purple: Readonly<Color4> = Color4.fromRgba(0x800080FF);
  public static readonly RebeccaPurple: Readonly<Color4> = Color4.fromRgba(0x663399FF);
  public static readonly Red: Readonly<Color4> = Color4.fromRgba(0xFF0000FF);
  public static readonly RosyBrown: Readonly<Color4> = Color4.fromRgba(0xBC8F8FFF);
  public static readonly RoyalBlue: Readonly<Color4> = Color4.fromRgba(0x4169E1FF);
  public static readonly SaddleBrown: Readonly<Color4> = Color4.fromRgba(0x8B4513FF);
  public static readonly Salmon: Readonly<Color4> = Color4.fromRgba(0xFA8072FF);
  public static readonly SandyBrown: Readonly<Color4> = Color4.fromRgba(0xF4A460FF);
  public static readonly SeaGreen: Readonly<Color4> = Color4.fromRgba(0x2E8B57FF);
  public static readonly SeaShell: Readonly<Color4> = Color4.fromRgba(0xFFF5EEFF);
  public static readonly Sienna: Readonly<Color4> = Color4.fromRgba(0xA0522DFF);
  public static readonly Silver: Readonly<Color4> = Color4.fromRgba(0xC0C0C0FF);
  public static readonly SkyBlue: Readonly<Color4> = Color4.fromRgba(0x87CEEBFF);
  public static readonly SlateBlue: Readonly<Color4> = Color4.fromRgba(0x6A5ACDFF);
  public static readonly SlateGray: Readonly<Color4> = Color4.fromRgba(0x708090FF);
  public static readonly Snow: Readonly<Color4> = Color4.fromRgba(0xFFFAFAFF);
  public static readonly SpringGreen: Readonly<Color4> = Color4.fromRgba(0x00FF7FFF);
  public static readonly SteelBlue: Readonly<Color4> = Color4.fromRgba(0x4682B4FF);
  public static readonly Tan: Readonly<Color4> = Color4.fromRgba(0xD2B48CFF);
  public static readonly Teal: Readonly<Color4> = Color4.fromRgba(0x008080FF);
  public static readonly Thistle: Readonly<Color4> = Color4.fromRgba(0xD8BFD8FF);
  public static readonly Tomato: Readonly<Color4> = Color4.fromRgba(0xFF6347FF);
  public static readonly Turquoise: Readonly<Color4> = Color4.fromRgba(0x40E0D0FF);
  public static readonly Violet: Readonly<Color4> = Color4.fromRgba(0xEE82EEFF);
  public static readonly Wheat: Readonly<Color4> = Color4.fromRgba(0xF5DEB3FF);
  public static readonly White: Readonly<Color4> = Color4.fromRgba(0xFFFFFFFF);
  public static readonly WhiteSmoke: Readonly<Color4> = Color4.fromRgba(0xF5F5F5FF);
  public static readonly Yellow: Readonly<Color4> = Color4.fromRgba(0xFFFF00FF);
  public static readonly YellowGreen: Readonly<Color4> = Color4.fromRgba(0x9ACD32FF);

  /**
   * Returns the complement color (255 - component), leaving alpha untouched
   */
  public get inverse(): Color4 {
    return ColorUtils.inverse(this);
  }

  public toString(): string {
    return `Color: [r: ${this.r}, g: ${this.g}, b: ${this.b}, a:${this.a}]`;
  }

  public equals(color: Color4, epsilon: number = 0): boolean {
    return ColorUtils.equals(this, color, epsilon);
  }

  public add(color: Color4): Color4 {
    return ColorUtils.add(this, color);
  }

  public subtract(color: Color4): Color4 {
    return ColorUtils.subtract(this, color);
  }

  /**
   * Divides all components uniformly by a number (inverse of scale) or
   * component-wise by a Color, throws on division by zero
   */
  public divide(color: Color4 | number): Color4 {
    return ColorUtils.divide(this, color);
  }

  public scale(color: Color4): Color4;
  public scale(scale: number): Color4;
  public scale(scaleOrColor: Color4 | number): Color4 {
    return typeof scaleOrColor === 'number'
      ? ColorUtils.scale(this, scaleOrColor)
      : ColorUtils.multiply(this, scaleOrColor);
  }

  /**
   * Alias for Color.scale
   */
  public multiply(color: Color4): Color4;
  public multiply(scale: number): Color4;
  public multiply(scaleOrColor: Color4 | number): Color4 {
    return typeof scaleOrColor === 'number'
      ? ColorUtils.scale(this, scaleOrColor)
      : ColorUtils.multiply(this, scaleOrColor);
  }

  /**
   * Linearly interpolates the color to a point based on a 0.0-1.0 fraction
   * Uses the perceptual colorspace OKLAB in order to give smoother color gradients.
   * Clamp limits the fraction to [0,1]
   */
  public lerpTo(color: Color4, fraction: number, clamp: boolean = true): Color4 {
    return ColorUtils.lerp(this, color, fraction, clamp);
  }

  /**
   * Alias for {@link Color4.lerpTo}
   */
  public mix(color: Color4, fraction: number, clamp: boolean = true): Color4 {
    return this.lerpTo(color, fraction, clamp);
  }

  /**
   * Packs the color into a 0xRRGGBBAA integer (components rounded and clamped)
   */
  public toRgba(): number {
    return ColorUtils.toRgba(this);
  }

  /**
   * Formats the color as a hex string, e.g. #ff8800 (alpha appended when not 255)
   */
  public toHex(): string {
    return ColorUtils.toHex(this);
  }

  /**
   * Rotates the hue by the given angle in degrees, preserving lightness and alpha
   */
  public hueShift(degrees: number): Color4 {
    return ColorUtils.hueShift(this, degrees);
  }

  /**
   * Mixes the color towards white, amount 0-1
   */
  public lighten(amount: number): Color4 {
    return ColorUtils.lighten(this, amount);
  }

  /**
   * Mixes the color towards black, amount 0-1
   */
  public darken(amount: number): Color4 {
    return ColorUtils.darken(this, amount);
  }

  /**
   * Scales the chroma (colorfulness) by 1 + amount, e.g. 0.5 for 50% more saturated
   */
  public saturate(amount: number): Color4 {
    return ColorUtils.saturate(this, amount);
  }

  /**
   * Scales the chroma (colorfulness) by 1 - amount, 1 gives a gray of the same lightness
   */
  public desaturate(amount: number): Color4 {
    return ColorUtils.desaturate(this, amount);
  }

  /**
   * Perceived brightness 0-255
   */
  public get luminance(): number {
    return ColorUtils.luminance(this);
  }

  /**
   * The color converted to a gray of the same perceived brightness, keeping alpha
   */
  public get grayscale(): Color4 {
    return ColorUtils.grayscale(this);
  }

  /**
   * Each component rounded to the nearest integer and clamped to [0, 255]
   */
  public get rounded(): Color4 {
    return ColorUtils.round(this);
  }

  /**
   * Returns the same color but with a supplied R component
   */
  public withR(r: number): Color4 {
    return ColorUtils.withR(this, r);
  }

  /**
   * Returns the same color but with a supplied G component
   */
  public withG(g: number): Color4 {
    return ColorUtils.withG(this, g);
  }

  /**
   * Returns the same color but with a supplied B component
   */
  public withB(b: number): Color4 {
    return ColorUtils.withB(this, b);
  }

  /**
   * Returns the same color but with a supplied A component
   */
  public withA(a: number): Color4 {
    return ColorUtils.withA(this, a);
  }
}
