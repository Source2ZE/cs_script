import { describe, expect, it } from '@jest/globals';
import { Color4, ColorUtils } from '../src/color';

describe('Color class', () => {
  describe('constructor', () => {
    it('creates Color from r, g, b, a', () => {
      const color = new Color4(10, 20, 30, 40);
      expect(color).toMatchObject({ r: 10, g: 20, b: 30, a: 40 });
    });

    it('defaults alpha to 255', () => {
      expect(new Color4(10, 20, 30).a).toBe(255);
      expect(new Color4({ r: 10, g: 20, b: 30 }).a).toBe(255);
    });

    it('creates Color from an object', () => {
      const color = new Color4({ r: 10, g: 20, b: 30, a: 40 });
      expect(color).toMatchObject({ r: 10, g: 20, b: 30, a: 40 });
    });
  });

  describe('fromRgba / toRgba', () => {
    it('unpacks a 0xRRGGBBAA integer', () => {
      expect(Color4.fromRgba(0xf0f8ffff)).toMatchObject({
        r: 240,
        g: 248,
        b: 255,
        a: 255,
      });
    });

    it('round-trips through toRgba', () => {
      expect(Color4.fromRgba(0x12345678).toRgba()).toBe(0x12345678);
    });

    it('rounds and clamps when packing', () => {
      expect(new Color4(255.4, -5, 300, 254.6).toRgba()).toBe(0xff00ffff);
    });
  });

  describe('named colors', () => {
    it('matches the web color values', () => {
      expect(Color4.AliceBlue).toMatchObject({ r: 240, g: 248, b: 255, a: 255 });
      expect(Color4.RebeccaPurple).toMatchObject({ r: 102, g: 51, b: 153, a: 255 });
      // green and lime are swapped compared to usual web colors,
      // because otherwise green not actually being 255 green is kinda stupid
      expect(Color4.Green).toMatchObject({ r: 0, g: 255, b: 0, a: 255 });
      expect(Color4.Lime).toMatchObject({ r: 0, g: 128, b: 0, a: 255 });
    });

    it('Transparent is white with zero alpha', () => {
      expect(Color4.Transparent).toMatchObject({ r: 255, g: 255, b: 255, a: 0 });
    });
  });

  describe('fromHex / toHex', () => {
    it('parses #rrggbb and #rrggbbaa', () => {
      expect(Color4.fromHex('#ff8800')).toMatchObject({ r: 255, g: 136, b: 0, a: 255 });
      expect(Color4.fromHex('#ff880080')).toMatchObject({ r: 255, g: 136, b: 0, a: 128 });
    });

    it('parses short forms and missing #', () => {
      expect(Color4.fromHex('#f80')).toMatchObject({ r: 255, g: 136, b: 0, a: 255 });
      expect(Color4.fromHex('f808')).toMatchObject({ r: 255, g: 136, b: 0, a: 136 });
      expect(Color4.fromHex('ff8800')).toMatchObject({ r: 255, g: 136, b: 0, a: 255 });
    });

    it('throws on invalid input', () => {
      expect(() => Color4.fromHex('#ff880')).toThrow();
      expect(() => Color4.fromHex('#gg8800')).toThrow();
      expect(() => Color4.fromHex('')).toThrow();
    });

    it('formats to hex, omitting opaque alpha', () => {
      expect(new Color4(255, 136, 0).toHex()).toBe('#ff8800');
      expect(new Color4(255, 136, 0, 128).toHex()).toBe('#ff880080');
      expect(Color4.Black.toHex()).toBe('#000000');
    });
  });

  describe('equals', () => {
    it('compares exactly by default', () => {
      expect(new Color4(1, 2, 3, 4).equals(new Color4(1, 2, 3, 4))).toBe(true);
      expect(new Color4(1, 2, 3, 4).equals(new Color4(1, 2, 3.001, 4))).toBe(false);
    });

    it('accepts an epsilon tolerance', () => {
      expect(new Color4(1, 2, 3, 4).equals(new Color4(1, 2, 3.001, 4), 0.01)).toBe(true);
    });
  });

  describe('arithmetic', () => {
    it('adds, subtracts, scales and multiplies component-wise', () => {
      const a = new Color4(10, 20, 30, 40);
      const b = new Color4(1, 2, 3, 4);
      expect(a.add(b)).toMatchObject({ r: 11, g: 22, b: 33, a: 44 });
      expect(a.subtract(b)).toMatchObject({ r: 9, g: 18, b: 27, a: 36 });
      expect(a.scale(2)).toMatchObject({ r: 20, g: 40, b: 60, a: 80 });
      expect(a.multiply(b)).toMatchObject({ r: 10, g: 40, b: 90, a: 160 });
    });

    it('divides by a number and a color', () => {
      const a = new Color4(10, 20, 30, 40);
      expect(a.divide(2)).toMatchObject({ r: 5, g: 10, b: 15, a: 20 });
      expect(a.divide(new Color4(2, 4, 5, 8))).toMatchObject({ r: 5, g: 5, b: 6, a: 5 });
    });

    it('throws on division by zero', () => {
      const a = new Color4(10, 20, 30, 40);
      expect(() => a.divide(0)).toThrow();
      expect(() => a.divide(new Color4(1, 0, 1, 1))).toThrow();
    });
  });

  describe('inverse', () => {
    it('returns the complement, keeping alpha', () => {
      expect(new Color4(255, 100, 0, 40).inverse).toMatchObject({
        r: 0,
        g: 155,
        b: 255,
        a: 40,
      });
    });
  });

  describe('lerpTo', () => {
    it('returns the endpoints at fraction 0 and 1', () => {
      const a = Color4.Coral;
      const b = Color4.SteelBlue;
      expect(a.lerpTo(b, 0).equals(a, 0.01)).toBe(true);
      expect(a.lerpTo(b, 1).equals(b, 0.01)).toBe(true);
    });

    it('interpolates alpha linearly', () => {
      const a = new Color4(0, 0, 0, 0);
      const b = new Color4(0, 0, 0, 200);
      expect(a.lerpTo(b, 0.5).a).toBeCloseTo(100, 3);
    });

    it('produces a neutral gray between black and white', () => {
      const mid = Color4.Black.lerpTo(Color4.White, 0.5);
      expect(mid.r).toBeCloseTo(mid.g, 3);
      expect(mid.g).toBeCloseTo(mid.b, 3);
      expect(mid.r).toBeGreaterThan(0);
      expect(mid.r).toBeLessThan(255);
    });

    it('clamps the fraction by default', () => {
      const a = Color4.Coral;
      const b = Color4.SteelBlue;
      expect(a.lerpTo(b, 5).equals(b, 0.01)).toBe(true);
      expect(a.lerpTo(b, -5).equals(a, 0.01)).toBe(true);
    });
  });

  describe('srgbToLinear / linearToSrgb', () => {
    it('keeps black and white fixed', () => {
      expect(Color4.White.linear.equals(Color4.White, 0.001)).toBe(true);
      expect(Color4.Black.linear.equals(Color4.Black, 0.001)).toBe(true);
    });

    it('decodes srgb mid gray to ~55 linear', () => {
      expect(new Color4(128, 128, 128).linear.r).toBeCloseTo(55, 0);
    });

    it('round-trips', () => {
      const color = new Color4(200, 60, 120, 40);
      expect(color.linear.srgb.equals(color, 0.001)).toBe(true);
    });

    it('does not touch alpha', () => {
      expect(new Color4(10, 20, 30, 77).linear.a).toBe(77);
    });
  });

  describe('oklab conversion', () => {
    it('round-trips linear srgb through oklab', () => {
      const color = new Color4(200, 60, 120, 255);
      const roundTripped = ColorUtils.OklabToLinearSrgb(
        ColorUtils.LinearSrgbToOklab(color),
        color.a,
      );
      expect(roundTripped.equals(color, 0.01)).toBe(true);
    });

    it('round-trips oklab through oklch', () => {
      const lab = ColorUtils.LinearSrgbToOklab(Color4.Coral);
      const roundTripped = ColorUtils.OklchToOklab(ColorUtils.OklabToOklch(lab));
      expect(roundTripped.l).toBeCloseTo(lab.l, 6);
      expect(roundTripped.a).toBeCloseTo(lab.a, 6);
      expect(roundTripped.b).toBeCloseTo(lab.b, 6);
    });
  });

  describe('hueShift', () => {
    it('is the identity at 0 and 360 degrees', () => {
      const color = Color4.Coral;
      expect(color.hueShift(0).equals(color, 0.01)).toBe(true);
      expect(color.hueShift(360).equals(color, 0.01)).toBe(true);
    });

    it('changes the hue and preserves alpha', () => {
      const color = new Color4(255, 0, 0, 128);
      const shifted = color.hueShift(180);
      expect(shifted.equals(color, 1)).toBe(false);
      expect(shifted.a).toBe(128);
    });
  });

  describe('lighten / darken', () => {
    it('reaches white and black at amount 1', () => {
      const color = Color4.SteelBlue;
      expect(color.lighten(1).equals(Color4.White, 0.01)).toBe(true);
      expect(color.darken(1).equals(Color4.Black, 0.01)).toBe(true);
    });

    it('is the identity at amount 0', () => {
      const color = Color4.SteelBlue;
      expect(color.lighten(0).equals(color, 0.01)).toBe(true);
      expect(color.darken(0).equals(color, 0.01)).toBe(true);
    });
  });

  describe('saturate / desaturate', () => {
    it('desaturate(1) produces a neutral gray', () => {
      const gray = Color4.Coral.desaturate(1);
      expect(gray.r).toBeCloseTo(gray.g, 3);
      expect(gray.g).toBeCloseTo(gray.b, 3);
    });

    it('is the identity at amount 0', () => {
      const color = Color4.Coral;
      expect(color.saturate(0).equals(color, 0.01)).toBe(true);
      expect(color.desaturate(0).equals(color, 0.01)).toBe(true);
    });
  });

  describe('luminance / grayscale', () => {
    it('is 0 for black and 255 for white', () => {
      expect(Color4.Black.luminance).toBe(0);
      expect(Color4.White.luminance).toBeCloseTo(255, 6);
    });

    it('weights green heaviest', () => {
      expect(Color4.Green.luminance).toBeGreaterThan(Color4.Red.luminance);
      expect(Color4.Red.luminance).toBeGreaterThan(Color4.Blue.luminance);
    });

    it('grayscale has equal components and keeps alpha', () => {
      const gray = new Color4(200, 60, 120, 128).grayscale;
      expect(gray.r).toBe(gray.g);
      expect(gray.g).toBe(gray.b);
      expect(gray.a).toBe(128);
    });
  });

  describe('gradient', () => {
    it('returns the endpoints at fraction 0 and 1', () => {
      const stops = [Color4.Red, Color4.Yellow, Color4.Lime];
      expect(Color4.gradient(stops, 0).equals(Color4.Red, 0.01)).toBe(true);
      expect(Color4.gradient(stops, 1).equals(Color4.Lime, 0.01)).toBe(true);
    });

    it('returns an intermediate stop exactly', () => {
      const stops = [Color4.Red, Color4.Yellow, Color4.Lime];
      expect(Color4.gradient(stops, 0.5).equals(Color4.Yellow, 0.01)).toBe(true);
    });

    it('handles a single stop and rejects an empty list', () => {
      expect(Color4.gradient([Color4.Red], 0.7).equals(Color4.Red)).toBe(true);
      expect(() => Color4.gradient([], 0.5)).toThrow();
    });
  });

  describe('rounded', () => {
    it('rounds and clamps each component', () => {
      expect(new Color4(1.4, 1.6, -20, 300).rounded).toMatchObject({
        r: 1,
        g: 2,
        b: 0,
        a: 255,
      });
    });
  });

  describe('random', () => {
    it('returns opaque colors with integer components in range', () => {
      for (let i = 0; i < 20; i++) {
        const color = Color4.random();
        for (const component of [color.r, color.g, color.b]) {
          expect(Number.isInteger(component)).toBe(true);
          expect(component).toBeGreaterThanOrEqual(0);
          expect(component).toBeLessThanOrEqual(255);
        }
        expect(color.a).toBe(255);
      }
    });
  });
});
