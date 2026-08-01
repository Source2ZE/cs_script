import { DEG_TO_RAD, RAD_TO_DEG } from './constants';
import { MathUtils } from './math';

type LABColor = { l: number; a: number; b: number };
type LCHColor = { l: number; c: number; h: number };

export class ColorUtils {
  public static equals(a: Color, b: Color, epsilon: number = 0): boolean {
    return (
      Math.abs(a.r - b.r) <= epsilon
      && Math.abs(a.g - b.g) <= epsilon
      && Math.abs(a.b - b.b) <= epsilon
      && Math.abs(a.a - b.a) <= epsilon
    );
  }

  public static add(a: Color, b: Color): Color {
    return new Color(a.r + b.r, a.g + b.g, a.b + b.b, a.a + b.a);
  }

  public static subtract(a: Color, b: Color): Color {
    return new Color(a.r - b.r, a.g - b.g, a.b - b.b, a.a - b.a);
  }

  public static scale(color: Color, scale: number): Color {
    return new Color(color.r * scale, color.g * scale, color.b * scale, color.a * scale);
  }

  public static multiply(a: Color, b: Color): Color {
    return new Color(a.r * b.r, a.g * b.g, a.b * b.b, a.a * b.a);
  }

  public static divide(color: Color, divider: Color | number): Color {
    if (typeof divider === 'number') {
      if (divider === 0) throw Error('Division by zero');
      return new Color(
        color.r / divider,
        color.g / divider,
        color.b / divider,
        color.a / divider,
      );
    } else {
      if (divider.r === 0 || divider.g === 0 || divider.b === 0 || divider.a === 0)
        throw Error('Division by zero');
      return new Color(
        color.r / divider.r,
        color.g / divider.g,
        color.b / divider.b,
        color.a / divider.a,
      );
    }
  }

  public static inverse(color: Color): Color {
    return new Color(255 - color.r, 255 - color.g, 255 - color.b, color.a);
  }

  /**
   * Clamps each component to [0, 255]
   */
  public static clamp(color: Color): Color {
    return new Color(
      MathUtils.clamp(color.r, 0, 255),
      MathUtils.clamp(color.g, 0, 255),
      MathUtils.clamp(color.b, 0, 255),
      MathUtils.clamp(color.a, 0, 255),
    );
  }

  /**
   * Rounds each component to the nearest integer and clamps it to [0, 255]
   */
  public static round(color: Color): Color {
    return ColorUtils.clamp(
      new Color(
        Math.round(color.r),
        Math.round(color.g),
        Math.round(color.b),
        Math.round(color.a),
      ),
    );
  }

  // uses oklab to get better gradients when interpolating
  public static lerp(
    a: Color,
    b: Color,
    fraction: number,
    clamp: boolean = true,
  ): Color {
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
    colors: readonly Color[],
    fraction: number,
    clamp: boolean = true,
  ): Color {
    if (colors.length === 0) throw Error('Gradient requires at least one color');
    if (colors.length === 1) return new Color(colors[0]);

    const t = clamp ? MathUtils.clamp(fraction, 0, 1) : fraction;
    const scaled = t * (colors.length - 1);
    const index = MathUtils.clamp(Math.floor(scaled), 0, colors.length - 2);
    return ColorUtils.lerp(colors[index], colors[index + 1], scaled - index, clamp);
  }

  /**
   * Rotates the hue by the given angle in degrees, preserving lightness and alpha
   */
  public static hueShift(color: Color, degrees: number): Color {
    const lch = ColorUtils.OklabToOklch(ColorUtils.LinearSrgbToOklab(color));
    lch.h += degrees;
    return ColorUtils.clamp(
      ColorUtils.OklabToLinearSrgb(ColorUtils.OklchToOklab(lch), color.a),
    );
  }

  /**
   * Mixes the color towards white in oklab, amount 0-1
   */
  public static lighten(color: Color, amount: number): Color {
    return ColorUtils.lerp(color, new Color(255, 255, 255, color.a), amount);
  }

  /**
   * Mixes the color towards black in oklab, amount 0-1
   */
  public static darken(color: Color, amount: number): Color {
    return ColorUtils.lerp(color, new Color(0, 0, 0, color.a), amount);
  }

  /**
   * Scales the chroma (colorfulness) by 1 + amount, e.g. 0.5 for 50% more saturated
   */
  public static saturate(color: Color, amount: number): Color {
    const lch = ColorUtils.OklabToOklch(ColorUtils.LinearSrgbToOklab(color));
    lch.c = Math.max(lch.c * (1 + amount), 0);
    return ColorUtils.clamp(
      ColorUtils.OklabToLinearSrgb(ColorUtils.OklchToOklab(lch), color.a),
    );
  }

  /**
   * Scales the chroma (colorfulness) by 1 - amount, 1 gives a gray of the same lightness
   */
  public static desaturate(color: Color, amount: number): Color {
    return ColorUtils.saturate(color, -amount);
  }

  /**
   * Perceived brightness 0-255, using Rec. 709 luma weights
   */
  public static luminance(color: Color): number {
    return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
  }

  /**
   * Converts the color to a gray of the same perceived brightness, keeping alpha
   */
  public static grayscale(color: Color): Color {
    const luminance = ColorUtils.luminance(color);
    return new Color(luminance, luminance, luminance, color.a);
  }

  /**
   * Returns a random opaque color
   */
  public static random(): Color {
    return new Color(
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      255,
    );
  }

  public static withR(color: Color, x: number): Color {
    return new Color(x, color.g, color.b, color.a);
  }

  public static withG(color: Color, x: number): Color {
    return new Color(color.r, x, color.b, color.a);
  }

  public static withB(color: Color, x: number): Color {
    return new Color(color.r, color.g, x, color.a);
  }

  public static withA(color: Color, x: number): Color {
    return new Color(color.r, color.g, color.b, x);
  }

  public static fromRgba(rgba: number): Color {
    return new Color(
      (rgba >>> 24) & 0xff,
      (rgba >>> 16) & 0xff,
      (rgba >>> 8) & 0xff,
      rgba & 0xff,
    );
  }

  /**
   * Packs the color into a 0xRRGGBBAA integer (components rounded and clamped)
   */
  public static toRgba(color: Color): number {
    const c = ColorUtils.round(color);
    return ((c.r << 24) | (c.g << 16) | (c.b << 8) | c.a) >>> 0;
  }

  /**
   * Creates a Color from a hex string: #rgb, #rgba, #rrggbb or #rrggbbaa
   * (leading # optional)
   */
  public static fromHex(hex: string): Color {
    let digits = hex.startsWith('#') ? hex.slice(1) : hex;
    if (digits.length === 3 || digits.length === 4) {
      digits = [...digits].map((digit) => digit + digit).join('');
    }
    if (!/^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(digits)) {
      throw Error(`Invalid hex color: ${hex}`);
    }
    return new Color(
      parseInt(digits.slice(0, 2), 16),
      parseInt(digits.slice(2, 4), 16),
      parseInt(digits.slice(4, 6), 16),
      digits.length === 8 ? parseInt(digits.slice(6, 8), 16) : 255,
    );
  }

  /**
   * Formats the color as a hex string, e.g. #ff8800 (alpha appended when not 255)
   */
  public static toHex(color: Color): string {
    const c = ColorUtils.round(color);
    const hex = (component: number) => component.toString(16).padStart(2, '0');
    return `#${hex(c.r)}${hex(c.g)}${hex(c.b)}${c.a === 255 ? '' : hex(c.a)}`;
  }

  // https://bottosson.github.io/posts/oklab/
  public static LinearSrgbToOklab(c: Color): LABColor {
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

  public static OklabToLinearSrgb(c: LABColor, a?: number): Color {
    const l_ = c.l + 0.3963377774 * c.a + 0.2158037573 * c.b;
    const m_ = c.l - 0.1055613458 * c.a - 0.0638541728 * c.b;
    const s_ = c.l - 0.0894841775 * c.a - 1.2914855480 * c.b;

    const l = l_ * l_ * l_;
    const m = m_ * m_ * m_;
    const s = s_ * s_ * s_;

    return new Color(
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

export class Color {
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
  public static fromRgba(rgba: number): Color {
    return ColorUtils.fromRgba(rgba);
  }

  /**
   * Creates a Color from a hex string: #rgb, #rgba, #rrggbb or #rrggbbaa
   * (leading # optional)
   */
  public static fromHex(hex: string): Color {
    return ColorUtils.fromHex(hex);
  }

  /**
   * Samples a multi-stop gradient at a 0.0-1.0 fraction, interpolating in oklab
   */
  public static gradient(
    colors: readonly Color[],
    fraction: number,
    clamp: boolean = true,
  ): Color {
    return ColorUtils.gradient(colors, fraction, clamp);
  }

  /**
   * Returns a random opaque color
   */
  public static random(): Color {
    return ColorUtils.random();
  }

  // web colors
  public static get Transparent(): Color { return Color.fromRgba(0xFFFFFF00); }
  public static get AliceBlue(): Color { return Color.fromRgba(0xF0F8FFFF); }
  public static get AntiqueWhite(): Color { return Color.fromRgba(0xFAEBD7FF); }
  public static get Aqua(): Color { return Color.fromRgba(0x00FFFFFF); }
  public static get Aquamarine(): Color { return Color.fromRgba(0x7FFFD4FF); }
  public static get Azure(): Color { return Color.fromRgba(0xF0FFFFFF); }
  public static get Beige(): Color { return Color.fromRgba(0xF5F5DCFF); }
  public static get Bisque(): Color { return Color.fromRgba(0xFFE4C4FF); }
  public static get Black(): Color { return Color.fromRgba(0x000000FF); }
  public static get BlanchedAlmond(): Color { return Color.fromRgba(0xFFEBCDFF); }
  public static get Blue(): Color { return Color.fromRgba(0x0000FFFF); }
  public static get BlueViolet(): Color { return Color.fromRgba(0x8A2BE2FF); }
  public static get Brown(): Color { return Color.fromRgba(0xA52A2AFF); }
  public static get BurlyWood(): Color { return Color.fromRgba(0xDEB887FF); }
  public static get CadetBlue(): Color { return Color.fromRgba(0x5F9EA0FF); }
  public static get Chartreuse(): Color { return Color.fromRgba(0x7FFF00FF); }
  public static get Chocolate(): Color { return Color.fromRgba(0xD2691EFF); }
  public static get Coral(): Color { return Color.fromRgba(0xFF7F50FF); }
  public static get CornflowerBlue(): Color { return Color.fromRgba(0x6495EDFF); }
  public static get Cornsilk(): Color { return Color.fromRgba(0xFFF8DCFF); }
  public static get Crimson(): Color { return Color.fromRgba(0xDC143CFF); }
  public static get Cyan(): Color { return Color.fromRgba(0x00FFFFFF); }
  public static get DarkBlue(): Color { return Color.fromRgba(0x00008BFF); }
  public static get DarkCyan(): Color { return Color.fromRgba(0x008B8BFF); }
  public static get DarkGoldenrod(): Color { return Color.fromRgba(0xB8860BFF); }
  public static get DarkGray(): Color { return Color.fromRgba(0xA9A9A9FF); }
  public static get DarkGreen(): Color { return Color.fromRgba(0x006400FF); }
  public static get DarkKhaki(): Color { return Color.fromRgba(0xBDB76BFF); }
  public static get DarkMagenta(): Color { return Color.fromRgba(0x8B008BFF); }
  public static get DarkOliveGreen(): Color { return Color.fromRgba(0x556B2FFF); }
  public static get DarkOrange(): Color { return Color.fromRgba(0xFF8C00FF); }
  public static get DarkOrchid(): Color { return Color.fromRgba(0x9932CCFF); }
  public static get DarkRed(): Color { return Color.fromRgba(0x8B0000FF); }
  public static get DarkSalmon(): Color { return Color.fromRgba(0xE9967AFF); }
  public static get DarkSeaGreen(): Color { return Color.fromRgba(0x8FBC8FFF); }
  public static get DarkSlateBlue(): Color { return Color.fromRgba(0x483D8BFF); }
  public static get DarkSlateGray(): Color { return Color.fromRgba(0x2F4F4FFF); }
  public static get DarkTurquoise(): Color { return Color.fromRgba(0x00CED1FF); }
  public static get DarkViolet(): Color { return Color.fromRgba(0x9400D3FF); }
  public static get DeepPink(): Color { return Color.fromRgba(0xFF1493FF); }
  public static get DeepSkyBlue(): Color { return Color.fromRgba(0x00BFFFFF); }
  public static get DimGray(): Color { return Color.fromRgba(0x696969FF); }
  public static get DodgerBlue(): Color { return Color.fromRgba(0x1E90FFFF); }
  public static get Firebrick(): Color { return Color.fromRgba(0xB22222FF); }
  public static get FloralWhite(): Color { return Color.fromRgba(0xFFFAF0FF); }
  public static get ForestGreen(): Color { return Color.fromRgba(0x228B22FF); }
  public static get Fuchsia(): Color { return Color.fromRgba(0xFF00FFFF); }
  public static get Gainsboro(): Color { return Color.fromRgba(0xDCDCDCFF); }
  public static get GhostWhite(): Color { return Color.fromRgba(0xF8F8FFFF); }
  public static get Gold(): Color { return Color.fromRgba(0xFFD700FF); }
  public static get Goldenrod(): Color { return Color.fromRgba(0xDAA520FF); }
  public static get Gray(): Color { return Color.fromRgba(0x808080FF); }
  public static get Green(): Color { return Color.fromRgba(0x008000FF); }
  public static get GreenYellow(): Color { return Color.fromRgba(0xADFF2FFF); }
  public static get Honeydew(): Color { return Color.fromRgba(0xF0FFF0FF); }
  public static get HotPink(): Color { return Color.fromRgba(0xFF69B4FF); }
  public static get IndianRed(): Color { return Color.fromRgba(0xCD5C5CFF); }
  public static get Indigo(): Color { return Color.fromRgba(0x4B0082FF); }
  public static get Ivory(): Color { return Color.fromRgba(0xFFFFF0FF); }
  public static get Khaki(): Color { return Color.fromRgba(0xF0E68CFF); }
  public static get Lavender(): Color { return Color.fromRgba(0xE6E6FAFF); }
  public static get LavenderBlush(): Color { return Color.fromRgba(0xFFF0F5FF); }
  public static get LawnGreen(): Color { return Color.fromRgba(0x7CFC00FF); }
  public static get LemonChiffon(): Color { return Color.fromRgba(0xFFFACDFF); }
  public static get LightBlue(): Color { return Color.fromRgba(0xADD8E6FF); }
  public static get LightCoral(): Color { return Color.fromRgba(0xF08080FF); }
  public static get LightCyan(): Color { return Color.fromRgba(0xE0FFFFFF); }
  public static get LightGoldenrodYellow(): Color { return Color.fromRgba(0xFAFAD2FF); }
  public static get LightGray(): Color { return Color.fromRgba(0xD3D3D3FF); }
  public static get LightGreen(): Color { return Color.fromRgba(0x90EE90FF); }
  public static get LightPink(): Color { return Color.fromRgba(0xFFB6C1FF); }
  public static get LightSalmon(): Color { return Color.fromRgba(0xFFA07AFF); }
  public static get LightSeaGreen(): Color { return Color.fromRgba(0x20B2AAFF); }
  public static get LightSkyBlue(): Color { return Color.fromRgba(0x87CEFAFF); }
  public static get LightSlateGray(): Color { return Color.fromRgba(0x778899FF); }
  public static get LightSteelBlue(): Color { return Color.fromRgba(0xB0C4DEFF); }
  public static get LightYellow(): Color { return Color.fromRgba(0xFFFFE0FF); }
  public static get Lime(): Color { return Color.fromRgba(0x00FF00FF); }
  public static get LimeGreen(): Color { return Color.fromRgba(0x32CD32FF); }
  public static get Linen(): Color { return Color.fromRgba(0xFAF0E6FF); }
  public static get Magenta(): Color { return Color.fromRgba(0xFF00FFFF); }
  public static get Maroon(): Color { return Color.fromRgba(0x800000FF); }
  public static get MediumAquamarine(): Color { return Color.fromRgba(0x66CDAAFF); }
  public static get MediumBlue(): Color { return Color.fromRgba(0x0000CDFF); }
  public static get MediumOrchid(): Color { return Color.fromRgba(0xBA55D3FF); }
  public static get MediumPurple(): Color { return Color.fromRgba(0x9370DBFF); }
  public static get MediumSeaGreen(): Color { return Color.fromRgba(0x3CB371FF); }
  public static get MediumSlateBlue(): Color { return Color.fromRgba(0x7B68EEFF); }
  public static get MediumSpringGreen(): Color { return Color.fromRgba(0x00FA9AFF); }
  public static get MediumTurquoise(): Color { return Color.fromRgba(0x48D1CCFF); }
  public static get MediumVioletRed(): Color { return Color.fromRgba(0xC71585FF); }
  public static get MidnightBlue(): Color { return Color.fromRgba(0x191970FF); }
  public static get MintCream(): Color { return Color.fromRgba(0xF5FFFAFF); }
  public static get MistyRose(): Color { return Color.fromRgba(0xFFE4E1FF); }
  public static get Moccasin(): Color { return Color.fromRgba(0xFFE4B5FF); }
  public static get NavajoWhite(): Color { return Color.fromRgba(0xFFDEADFF); }
  public static get Navy(): Color { return Color.fromRgba(0x000080FF); }
  public static get OldLace(): Color { return Color.fromRgba(0xFDF5E6FF); }
  public static get Olive(): Color { return Color.fromRgba(0x808000FF); }
  public static get OliveDrab(): Color { return Color.fromRgba(0x6B8E23FF); }
  public static get Orange(): Color { return Color.fromRgba(0xFFA500FF); }
  public static get OrangeRed(): Color { return Color.fromRgba(0xFF4500FF); }
  public static get Orchid(): Color { return Color.fromRgba(0xDA70D6FF); }
  public static get PaleGoldenrod(): Color { return Color.fromRgba(0xEEE8AAFF); }
  public static get PaleGreen(): Color { return Color.fromRgba(0x98FB98FF); }
  public static get PaleTurquoise(): Color { return Color.fromRgba(0xAFEEEEFF); }
  public static get PaleVioletRed(): Color { return Color.fromRgba(0xDB7093FF); }
  public static get PapayaWhip(): Color { return Color.fromRgba(0xFFEFD5FF); }
  public static get PeachPuff(): Color { return Color.fromRgba(0xFFDAB9FF); }
  public static get Peru(): Color { return Color.fromRgba(0xCD853FFF); }
  public static get Pink(): Color { return Color.fromRgba(0xFFC0CBFF); }
  public static get Plum(): Color { return Color.fromRgba(0xDDA0DDFF); }
  public static get PowderBlue(): Color { return Color.fromRgba(0xB0E0E6FF); }
  public static get Purple(): Color { return Color.fromRgba(0x800080FF); }
  public static get RebeccaPurple(): Color { return Color.fromRgba(0x663399FF); }
  public static get Red(): Color { return Color.fromRgba(0xFF0000FF); }
  public static get RosyBrown(): Color { return Color.fromRgba(0xBC8F8FFF); }
  public static get RoyalBlue(): Color { return Color.fromRgba(0x4169E1FF); }
  public static get SaddleBrown(): Color { return Color.fromRgba(0x8B4513FF); }
  public static get Salmon(): Color { return Color.fromRgba(0xFA8072FF); }
  public static get SandyBrown(): Color { return Color.fromRgba(0xF4A460FF); }
  public static get SeaGreen(): Color { return Color.fromRgba(0x2E8B57FF); }
  public static get SeaShell(): Color { return Color.fromRgba(0xFFF5EEFF); }
  public static get Sienna(): Color { return Color.fromRgba(0xA0522DFF); }
  public static get Silver(): Color { return Color.fromRgba(0xC0C0C0FF); }
  public static get SkyBlue(): Color { return Color.fromRgba(0x87CEEBFF); }
  public static get SlateBlue(): Color { return Color.fromRgba(0x6A5ACDFF); }
  public static get SlateGray(): Color { return Color.fromRgba(0x708090FF); }
  public static get Snow(): Color { return Color.fromRgba(0xFFFAFAFF); }
  public static get SpringGreen(): Color { return Color.fromRgba(0x00FF7FFF); }
  public static get SteelBlue(): Color { return Color.fromRgba(0x4682B4FF); }
  public static get Tan(): Color { return Color.fromRgba(0xD2B48CFF); }
  public static get Teal(): Color { return Color.fromRgba(0x008080FF); }
  public static get Thistle(): Color { return Color.fromRgba(0xD8BFD8FF); }
  public static get Tomato(): Color { return Color.fromRgba(0xFF6347FF); }
  public static get Turquoise(): Color { return Color.fromRgba(0x40E0D0FF); }
  public static get Violet(): Color { return Color.fromRgba(0xEE82EEFF); }
  public static get Wheat(): Color { return Color.fromRgba(0xF5DEB3FF); }
  public static get White(): Color { return Color.fromRgba(0xFFFFFFFF); }
  public static get WhiteSmoke(): Color { return Color.fromRgba(0xF5F5F5FF); }
  public static get Yellow(): Color { return Color.fromRgba(0xFFFF00FF); }
  public static get YellowGreen(): Color { return Color.fromRgba(0x9ACD32FF); }

  /**
   * Returns the complement color (255 - component), leaving alpha untouched
   */
  public get inverse(): Color {
    return ColorUtils.inverse(this);
  }

  public toString(): string {
    return `Color: [r: ${this.r}, g: ${this.g}, b: ${this.b}, a:${this.a}]`;
  }

  public equals(color: Color, epsilon: number = 0): boolean {
    return ColorUtils.equals(this, color, epsilon);
  }

  public add(color: Color): Color {
    return ColorUtils.add(this, color);
  }

  public subtract(color: Color): Color {
    return ColorUtils.subtract(this, color);
  }

  /**
   * Divides all components uniformly by a number (inverse of scale) or
   * component-wise by a Color, throws on division by zero
   */
  public divide(color: Color | number): Color {
    return ColorUtils.divide(this, color);
  }

  public scale(color: Color): Color;
  public scale(scale: number): Color;
  public scale(scaleOrColor: Color | number): Color {
    return typeof scaleOrColor === 'number'
      ? ColorUtils.scale(this, scaleOrColor)
      : ColorUtils.multiply(this, scaleOrColor);
  }

  /**
   * Alias for Color.scale
   */
  public multiply(color: Color): Color;
  public multiply(scale: number): Color;
  public multiply(scaleOrColor: Color | number): Color {
    return typeof scaleOrColor === 'number'
      ? ColorUtils.scale(this, scaleOrColor)
      : ColorUtils.multiply(this, scaleOrColor);
  }

  /**
   * Linearly interpolates the color to a point based on a 0.0-1.0 fraction
   * Uses the perceptual colorspace OKLAB in order to give smoother color gradients.
   * Clamp limits the fraction to [0,1]
   */
  public lerpTo(color: Color, fraction: number, clamp: boolean = true): Color {
    return ColorUtils.lerp(this, color, fraction, clamp);
  }

  /**
   * Alias for {@link Color.lerpTo}
   */
  public mix(color: Color, fraction: number, clamp: boolean = true): Color {
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
  public hueShift(degrees: number): Color {
    return ColorUtils.hueShift(this, degrees);
  }

  /**
   * Mixes the color towards white, amount 0-1
   */
  public lighten(amount: number): Color {
    return ColorUtils.lighten(this, amount);
  }

  /**
   * Mixes the color towards black, amount 0-1
   */
  public darken(amount: number): Color {
    return ColorUtils.darken(this, amount);
  }

  /**
   * Scales the chroma (colorfulness) by 1 + amount, e.g. 0.5 for 50% more saturated
   */
  public saturate(amount: number): Color {
    return ColorUtils.saturate(this, amount);
  }

  /**
   * Scales the chroma (colorfulness) by 1 - amount, 1 gives a gray of the same lightness
   */
  public desaturate(amount: number): Color {
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
  public get grayscale(): Color {
    return ColorUtils.grayscale(this);
  }

  /**
   * Each component rounded to the nearest integer and clamped to [0, 255]
   */
  public get rounded(): Color {
    return ColorUtils.round(this);
  }

  /**
   * Returns the same color but with a supplied R component
   */
  public withR(r: number): Color {
    return ColorUtils.withR(this, r);
  }

  /**
   * Returns the same color but with a supplied G component
   */
  public withG(g: number): Color {
    return ColorUtils.withG(this, g);
  }

  /**
   * Returns the same color but with a supplied B component
   */
  public withB(b: number): Color {
    return ColorUtils.withB(this, b);
  }

  /**
   * Returns the same color but with a supplied A component
   */
  public withA(a: number): Color {
    return ColorUtils.withA(this, a);
  }
}
