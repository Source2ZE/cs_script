import { describe, expect, it } from '@jest/globals';
import { Color, ColorUtils } from '../src/color';

describe('Color class', () => {
  describe('constructor', () => {
    it('creates Color from r, g, b, a', () => {
      const color = new Color(10, 20, 30, 40);
      expect(color).toMatchObject({ r: 10, g: 20, b: 30, a: 40 });
    });

    it('defaults alpha to 255', () => {
      expect(new Color(10, 20, 30).a).toBe(255);
      expect(new Color({ r: 10, g: 20, b: 30 }).a).toBe(255);
    });

    it('creates Color from an object', () => {
      const color = new Color({ r: 10, g: 20, b: 30, a: 40 });
      expect(color).toMatchObject({ r: 10, g: 20, b: 30, a: 40 });
    });
  });

  describe('fromRgba / toRgba', () => {
    it('unpacks a 0xRRGGBBAA integer', () => {
      expect(Color.fromRgba(0xf0f8ffff)).toMatchObject({
        r: 240,
        g: 248,
        b: 255,
        a: 255,
      });
    });

    it('round-trips through toRgba', () => {
      expect(Color.fromRgba(0x12345678).toRgba()).toBe(0x12345678);
    });

    it('rounds and clamps when packing', () => {
      expect(new Color(255.4, -5, 300, 254.6).toRgba()).toBe(0xff00ffff);
    });
  });

  describe('named colors', () => {
    it('matches the web color values', () => {
      expect(Color.AliceBlue).toMatchObject({ r: 240, g: 248, b: 255, a: 255 });
      expect(Color.RebeccaPurple).toMatchObject({ r: 102, g: 51, b: 153, a: 255 });
      expect(Color.Green).toMatchObject({ r: 0, g: 128, b: 0, a: 255 });
      expect(Color.Lime).toMatchObject({ r: 0, g: 255, b: 0, a: 255 });
    });

    it('Transparent is white with zero alpha', () => {
      expect(Color.Transparent).toMatchObject({ r: 255, g: 255, b: 255, a: 0 });
    });
  });

  describe('fromHex / toHex', () => {
    it('parses #rrggbb and #rrggbbaa', () => {
      expect(Color.fromHex('#ff8800')).toMatchObject({ r: 255, g: 136, b: 0, a: 255 });
      expect(Color.fromHex('#ff880080')).toMatchObject({ r: 255, g: 136, b: 0, a: 128 });
    });

    it('parses short forms and missing #', () => {
      expect(Color.fromHex('#f80')).toMatchObject({ r: 255, g: 136, b: 0, a: 255 });
      expect(Color.fromHex('f808')).toMatchObject({ r: 255, g: 136, b: 0, a: 136 });
      expect(Color.fromHex('ff8800')).toMatchObject({ r: 255, g: 136, b: 0, a: 255 });
    });

    it('throws on invalid input', () => {
      expect(() => Color.fromHex('#ff880')).toThrow();
      expect(() => Color.fromHex('#gg8800')).toThrow();
      expect(() => Color.fromHex('')).toThrow();
    });

    it('formats to hex, omitting opaque alpha', () => {
      expect(new Color(255, 136, 0).toHex()).toBe('#ff8800');
      expect(new Color(255, 136, 0, 128).toHex()).toBe('#ff880080');
      expect(Color.Black.toHex()).toBe('#000000');
    });
  });

  describe('equals', () => {
    it('compares exactly by default', () => {
      expect(new Color(1, 2, 3, 4).equals(new Color(1, 2, 3, 4))).toBe(true);
      expect(new Color(1, 2, 3, 4).equals(new Color(1, 2, 3.001, 4))).toBe(false);
    });

    it('accepts an epsilon tolerance', () => {
      expect(new Color(1, 2, 3, 4).equals(new Color(1, 2, 3.001, 4), 0.01)).toBe(true);
    });
  });

  describe('arithmetic', () => {
    it('adds, subtracts, scales and multiplies component-wise', () => {
      const a = new Color(10, 20, 30, 40);
      const b = new Color(1, 2, 3, 4);
      expect(a.add(b)).toMatchObject({ r: 11, g: 22, b: 33, a: 44 });
      expect(a.subtract(b)).toMatchObject({ r: 9, g: 18, b: 27, a: 36 });
      expect(a.scale(2)).toMatchObject({ r: 20, g: 40, b: 60, a: 80 });
      expect(a.multiply(b)).toMatchObject({ r: 10, g: 40, b: 90, a: 160 });
    });

    it('divides by a number and a color', () => {
      const a = new Color(10, 20, 30, 40);
      expect(a.divide(2)).toMatchObject({ r: 5, g: 10, b: 15, a: 20 });
      expect(a.divide(new Color(2, 4, 5, 8))).toMatchObject({ r: 5, g: 5, b: 6, a: 5 });
    });

    it('throws on division by zero', () => {
      const a = new Color(10, 20, 30, 40);
      expect(() => a.divide(0)).toThrow();
      expect(() => a.divide(new Color(1, 0, 1, 1))).toThrow();
    });
  });

  describe('inverse', () => {
    it('returns the complement, keeping alpha', () => {
      expect(new Color(255, 100, 0, 40).inverse).toMatchObject({
        r: 0,
        g: 155,
        b: 255,
        a: 40,
      });
    });
  });

  describe('lerpTo', () => {
    it('returns the endpoints at fraction 0 and 1', () => {
      const a = Color.Coral;
      const b = Color.SteelBlue;
      expect(a.lerpTo(b, 0).equals(a, 0.01)).toBe(true);
      expect(a.lerpTo(b, 1).equals(b, 0.01)).toBe(true);
    });

    it('interpolates alpha linearly', () => {
      const a = new Color(0, 0, 0, 0);
      const b = new Color(0, 0, 0, 200);
      expect(a.lerpTo(b, 0.5).a).toBeCloseTo(100, 3);
    });

    it('produces a neutral gray between black and white', () => {
      const mid = Color.Black.lerpTo(Color.White, 0.5);
      expect(mid.r).toBeCloseTo(mid.g, 3);
      expect(mid.g).toBeCloseTo(mid.b, 3);
      expect(mid.r).toBeGreaterThan(0);
      expect(mid.r).toBeLessThan(255);
    });

    it('clamps the fraction by default', () => {
      const a = Color.Coral;
      const b = Color.SteelBlue;
      expect(a.lerpTo(b, 5).equals(b, 0.01)).toBe(true);
      expect(a.lerpTo(b, -5).equals(a, 0.01)).toBe(true);
    });
  });

  describe('oklab conversion', () => {
    it('round-trips linear srgb through oklab', () => {
      const color = new Color(200, 60, 120, 255);
      const roundTripped = ColorUtils.OklabToLinearSrgb(
        ColorUtils.LinearSrgbToOklab(color),
        color.a,
      );
      expect(roundTripped.equals(color, 0.01)).toBe(true);
    });

    it('round-trips oklab through oklch', () => {
      const lab = ColorUtils.LinearSrgbToOklab(Color.Coral);
      const roundTripped = ColorUtils.OklchToOklab(ColorUtils.OklabToOklch(lab));
      expect(roundTripped.l).toBeCloseTo(lab.l, 6);
      expect(roundTripped.a).toBeCloseTo(lab.a, 6);
      expect(roundTripped.b).toBeCloseTo(lab.b, 6);
    });
  });

  describe('hueShift', () => {
    it('is the identity at 0 and 360 degrees', () => {
      const color = Color.Coral;
      expect(color.hueShift(0).equals(color, 0.01)).toBe(true);
      expect(color.hueShift(360).equals(color, 0.01)).toBe(true);
    });

    it('changes the hue and preserves alpha', () => {
      const color = new Color(255, 0, 0, 128);
      const shifted = color.hueShift(180);
      expect(shifted.equals(color, 1)).toBe(false);
      expect(shifted.a).toBe(128);
    });
  });

  describe('lighten / darken', () => {
    it('reaches white and black at amount 1', () => {
      const color = Color.SteelBlue;
      expect(color.lighten(1).equals(Color.White, 0.01)).toBe(true);
      expect(color.darken(1).equals(Color.Black, 0.01)).toBe(true);
    });

    it('is the identity at amount 0', () => {
      const color = Color.SteelBlue;
      expect(color.lighten(0).equals(color, 0.01)).toBe(true);
      expect(color.darken(0).equals(color, 0.01)).toBe(true);
    });
  });

  describe('saturate / desaturate', () => {
    it('desaturate(1) produces a neutral gray', () => {
      const gray = Color.Coral.desaturate(1);
      expect(gray.r).toBeCloseTo(gray.g, 3);
      expect(gray.g).toBeCloseTo(gray.b, 3);
    });

    it('is the identity at amount 0', () => {
      const color = Color.Coral;
      expect(color.saturate(0).equals(color, 0.01)).toBe(true);
      expect(color.desaturate(0).equals(color, 0.01)).toBe(true);
    });
  });

  describe('luminance / grayscale', () => {
    it('is 0 for black and 255 for white', () => {
      expect(Color.Black.luminance).toBe(0);
      expect(Color.White.luminance).toBeCloseTo(255, 6);
    });

    it('weights green heaviest', () => {
      expect(Color.Lime.luminance).toBeGreaterThan(Color.Red.luminance);
      expect(Color.Red.luminance).toBeGreaterThan(Color.Blue.luminance);
    });

    it('grayscale has equal components and keeps alpha', () => {
      const gray = new Color(200, 60, 120, 128).grayscale;
      expect(gray.r).toBe(gray.g);
      expect(gray.g).toBe(gray.b);
      expect(gray.a).toBe(128);
    });
  });

  describe('gradient', () => {
    it('returns the endpoints at fraction 0 and 1', () => {
      const stops = [Color.Red, Color.Yellow, Color.Lime];
      expect(Color.gradient(stops, 0).equals(Color.Red, 0.01)).toBe(true);
      expect(Color.gradient(stops, 1).equals(Color.Lime, 0.01)).toBe(true);
    });

    it('returns an intermediate stop exactly', () => {
      const stops = [Color.Red, Color.Yellow, Color.Lime];
      expect(Color.gradient(stops, 0.5).equals(Color.Yellow, 0.01)).toBe(true);
    });

    it('handles a single stop and rejects an empty list', () => {
      expect(Color.gradient([Color.Red], 0.7).equals(Color.Red)).toBe(true);
      expect(() => Color.gradient([], 0.5)).toThrow();
    });
  });

  describe('rounded', () => {
    it('rounds and clamps each component', () => {
      expect(new Color(1.4, 1.6, -20, 300).rounded).toMatchObject({
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
        const color = Color.random();
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
