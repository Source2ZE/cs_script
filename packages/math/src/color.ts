import { MathUtils } from './math';

type LABColor = { l: number; a: number; b: number };

export class ColorUtils {
  public static equals(a: Color, b: Color): boolean {
    return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
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
    const result = ColorUtils.OklabToLinearSrgb(resultlab, a.a + (b.a - a.a) * t);
    result.r = MathUtils.clamp(result.r, 0, 255);
    result.g = MathUtils.clamp(result.g, 0, 255);
    result.b = MathUtils.clamp(result.b, 0, 255);
    result.a = MathUtils.clamp(result.a, 0, 255);
    return result;
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
}

export class Color {
  public r: number;
  public g: number;
  public b: number;
  public a: number;

  constructor(r: number, g: number, b: number, a: number);
  constructor(color: { r: number; g: number; b: number; a: number });
  constructor(
    rOrColor: number | { r: number; g: number; b: number; a: number },
    g?: number,
    b?: number,
    a?: number,
  ) {
    if (typeof rOrColor === 'object') {
      this.r = rOrColor.r;
      this.g = rOrColor.g;
      this.b = rOrColor.b;
      this.a = rOrColor.a;
    } else {
      this.r = rOrColor;
      this.g = g!;
      this.b = b!;
      this.a = a!;
    }
  }

  /**
   * Returns the complement color (255 - component), leaving alpha untouched
   */
  public get inverse(): Color {
    return ColorUtils.inverse(this);
  }

  public toString(): string {
    return `Color: [r: ${this.r}, g: ${this.g}, b: ${this.b}, a:${this.a}]`;
  }

  public equals(color: Color): boolean {
    return ColorUtils.equals(this, color);
  }

  public add(color: Color): Color {
    return ColorUtils.add(this, color);
  }

  public subtract(color: Color): Color {
    return ColorUtils.subtract(this, color);
  }

  /**
   * Divides by a number (all components, inverse of scale) or
   * component-wise by a Color (RGB only, alpha is kept)
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
