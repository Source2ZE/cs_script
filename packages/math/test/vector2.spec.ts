import { describe, expect, it } from '@jest/globals';
import { Vec2 } from '../src/vector2';

describe('Vec2 class', () => {
  describe('constructor', () => {
    it('creates Vec2 from x, y', () => {
      const vec = new Vec2(1, 2);
      expect(vec).toMatchObject({ x: 1, y: 2 });
    });

    it('creates Vec2 from vector object', () => {
      const vec = new Vec2({ x: 1, y: 2 });
      expect(vec).toMatchObject({ x: 1, y: 2 });
    });
  });

  describe('length', () => {
    it('gets length of vector', () => {
      const vec = new Vec2({ x: 3, y: -4 });
      expect(vec.length).toBeCloseTo(5, 3);
    });
  });

  describe('lengthSquared', () => {
    it('gets squared length of vector', () => {
      const vec = new Vec2({ x: 3, y: -4 });
      expect(vec.lengthSquared).toBe(25);
    });
  });

  describe('normalize', () => {
    it('normalizes the vector', () => {
      const vec = new Vec2({ x: 0, y: -5 });
      expect(vec.normal).toMatchObject({
        x: 0,
        y: expect.closeTo(-1, 3),
      });
      expect(vec.normal.length).toBeCloseTo(1);
    });
  });

  describe('inverse', () => {
    it('inverts the vector', () => {
      const vec = new Vec2({ x: 3, y: -5 });
      expect(vec.inverse).toMatchObject({ x: -3, y: 5 });
    });
  });

  describe('floored', () => {
    it('rounds down the vector components', () => {
      const vec = new Vec2({ x: 1.7, y: -0.123 });
      expect(vec.floored).toMatchObject({ x: 1, y: -1 });
    });
  });

  describe('ceil', () => {
    it('rounds up the vector components', () => {
      const vec = new Vec2({ x: 1.1, y: -0.123 });
      expect(vec.ceil).toMatchObject({ x: 2, y: 0 });
    });
  });

  describe('round', () => {
    it('rounds the vector components', () => {
      const vec = new Vec2({ x: 1.4, y: -0.623 });
      expect(vec.round).toMatchObject({ x: 1, y: -1 });
    });
  });

  describe('equals', () => {
    it('returns true when two vectors are equal', () => {
      const vec1 = new Vec2({ x: 1, y: 1.578 });
      const vec2 = new Vec2({ x: 1, y: 1.578 });
      expect(vec1.equals(vec2)).toBe(true);
    });

    it('returns false when two vectors are not equal', () => {
      const vec1 = new Vec2({ x: 1, y: 1.578 });
      const vec2 = new Vec2({ x: 1, y: 1.577 });
      expect(vec1.equals(vec2)).toBe(false);
    });
  });

  describe('add', () => {
    it('adds two vectors', () => {
      const vec1 = new Vec2({ x: 1, y: 2 });
      const vec2 = new Vec2({ x: 3, y: -2 });
      expect(vec1.add(vec2)).toMatchObject({ x: 4, y: 0 });
      expect(vec2.add(vec1)).toMatchObject({ x: 4, y: 0 });
    });
  });

  describe('subtract', () => {
    it('subtracts two vectors', () => {
      const vec1 = new Vec2({ x: 1, y: 2 });
      const vec2 = new Vec2({ x: 1, y: 3 });
      expect(vec1.subtract(vec2)).toMatchObject({ x: 0, y: -1 });
      expect(vec2.subtract(vec1)).toMatchObject({ x: 0, y: 1 });
    });
  });

  describe('divide', () => {
    it('divides two vectors', () => {
      const vec1 = new Vec2({ x: 1, y: 6 });
      const vec2 = new Vec2({ x: 1, y: 3 });
      expect(vec1.divide(vec2)).toMatchObject({ x: 1, y: 2 });
      expect(vec2.divide(vec1)).toMatchObject({ x: 1, y: 0.5 });
    });

    it('divides vector by scalar', () => {
      const vec = new Vec2({ x: 1, y: 6 });
      expect(vec.divide(2)).toMatchObject({ x: 0.5, y: 3 });
    });

    it('throws error when divided by 0', () => {
      const vec1 = new Vec2({ x: 1, y: 1 });
      const vec2 = new Vec2({ x: 0, y: 1 });
      expect(() => vec1.divide(vec2)).toThrow('Division by zero');
      expect(() => vec1.divide(0)).toThrow('Division by zero');
    });
  });

  describe('scale/multiply', () => {
    it('scales two vectors', () => {
      const vec1 = new Vec2({ x: 1, y: 2 });
      const vec2 = new Vec2({ x: 3, y: 2 });
      expect(vec1.multiply(vec2)).toMatchObject({ x: 3, y: 4 });
      expect(vec2.multiply(vec1)).toMatchObject({ x: 3, y: 4 });
      expect(vec1.multiply(vec2)).toMatchObject({ x: 3, y: 4 });
    });

    it('scales a vector by scalar', () => {
      const vec = new Vec2({ x: 1, y: 2 });
      expect(vec.multiply(2)).toMatchObject({ x: 2, y: 4 });
      expect(vec.multiply(2)).toMatchObject({ x: 2, y: 4 });
    });
  });

  describe('dot', () => {
    it('gets the dot product between two vectors', () => {
      const vec1 = new Vec2({ x: 1, y: -2 });
      const vec2 = new Vec2({ x: 0, y: 5 });
      expect(vec1.dot(vec2)).toBe(-10);
      expect(vec2.dot(vec1)).toBe(-10);
    });
  });

  describe('distance', () => {
    it('gets the distance between two vectors', () => {
      const vec1 = new Vec2({ x: 1, y: -1 });
      const vec2 = new Vec2({ x: -2, y: 3 });
      expect(vec1.distance(vec2)).toBe(5);
      expect(vec2.distance(vec1)).toBe(5);
    });
  });

  describe('distanceSquared', () => {
    it('gets the squared distance between two vectors', () => {
      const vec1 = new Vec2({ x: 1, y: -1 });
      const vec2 = new Vec2({ x: -2, y: 3 });
      expect(vec1.distanceSquared(vec2)).toBe(25);
      expect(vec2.distanceSquared(vec1)).toBe(25);
    });
  });

  describe('lerpTo', () => {
    it('lerps a vector towards another vector by half', () => {
      const vec1 = new Vec2({ x: 1000, y: 1000 });
      const vec2 = new Vec2({ x: 0, y: 0 });
      expect(vec1.lerpTo(vec2, 0.5)).toMatchObject({ x: 500, y: 500 });
    });

    it('does not clamp the value if clamp is disabled', () => {
      const vec1 = new Vec2({ x: 1000, y: 1000 });
      const vec2 = new Vec2({ x: 0, y: 0 });
      expect(vec1.lerpTo(vec2, 1.5, false)).toMatchObject({ x: -500, y: -500 });
    });

    it('clamps the value', () => {
      const vec1 = new Vec2({ x: 1000, y: 1000 });
      const vec2 = new Vec2({ x: 0, y: 0 });
      expect(vec1.lerpTo(vec2, 1.5, true)).toMatchObject({ x: 0, y: 0 });
    });
  });

  describe('directionTowards', () => {
    it('creates a new normalized vector pointing to the second vector', () => {
      const vec1 = new Vec2({ x: 0, y: 0 });
      const vec2 = new Vec2({ x: 3, y: 4 });
      expect(vec1.directionTowards(vec2)).toMatchObject({
        x: expect.closeTo(0.6, 1),
        y: expect.closeTo(0.8, 1),
      });
    });
  });

  describe('withX/Y', () => {
    it('replaces the X component', () => {
      const vec = new Vec2({ x: 1, y: 1 });
      expect(vec.withX(5)).toMatchObject({ x: 5, y: 1 });
    });

    it('replaces the Y component', () => {
      const vec = new Vec2({ x: 1, y: 1 });
      expect(vec.withY(5)).toMatchObject({ x: 1, y: 5 });
    });
  });

  describe('static fields', () => {
    it('Vec2.Zero creates a new instance', () => {
      expect(Vec2.Zero).not.toBe(Vec2.Zero);
      expect(Vec2.Zero).toMatchObject({ x: 0, y: 0 });
    });

    it('Vec2.Up creates a new instance', () => {
      expect(Vec2.Up).not.toBe(Vec2.Up);
      expect(Vec2.Up).toMatchObject({ x: 1, y: 0 });
    });

    it('Vec2.Right creates a new instance', () => {
      expect(Vec2.Right).not.toBe(Vec2.Right);
      expect(Vec2.Right).toMatchObject({ x: 0, y: 1 });
    });
  });
});
