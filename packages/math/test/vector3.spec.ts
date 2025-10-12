import { describe, it, expect } from '@jest/globals'
import { Vec3 } from '../src'

describe('Vec3 class', () => {
  describe('constructor', () => {
    it('creates Vec3 from x, y, z', () => {
      const vec = new Vec3(1, 2, 3)
      expect(vec).toMatchObject({
        x: 1,
        y: 2,
        z: 3,
      })
    })

    it('creates Vec3 from valve vector', () => {
      const vec = new Vec3({ x: 1, y: 2, z: 3 })
      expect(vec).toMatchObject({
        x: 1,
        y: 2,
        z: 3,
      })
    })
  })

  describe('length', () => {
    it('gets 3d length of vector', () => {
      const vec = new Vec3({ x: 1, y: -5, z: 3 })
      expect(vec.length).toBeCloseTo(5.916, 3)
    })
  })
  describe('lengthSquared', () => {
    it('gets 3d squared length of vector', () => {
      const vec = new Vec3({ x: 1, y: -5, z: 3 })
      expect(vec.lengthSquared).toBe(35)
    })
  })

  describe('length2D', () => {
    it('gets 2d length of vector', () => {
      const vec = new Vec3({ x: 1, y: -5, z: 3 })
      expect(vec.length2D).toBeCloseTo(5.099, 3)
    })
  })

  describe('length2DSquared', () => {
    it('gets 2d squared length of vector', () => {
      const vec = new Vec3({ x: 1, y: -5, z: 3 })
      expect(vec.length2DSquared).toBe(26)
    })
  })

  describe('normalize', () => {
    it('normalizes the vector', () => {
      const vec = new Vec3({ x: 0, y: -5, z: 3 })
      expect(vec.normal).toMatchObject({
        x: 0,
        y: expect.closeTo(-0.857, 3),
        z: expect.closeTo(0.514, 3),
      })
      expect(vec.normal.length).toBeCloseTo(1)
    })
  })

  describe('inverse', () => {
    it('inverts the vector', () => {
      const vec = new Vec3({ x: 0, y: -5, z: 3 })
      expect(vec.inverse).toMatchObject({
        x: 0,
        y: 5,
        z: -3,
      })
    })
  })

  describe('floored', () => {
    it('rounds down the vector components', () => {
      const vec = new Vec3({ x: 0, y: -0.123, z: 1.999 })
      expect(vec.floored).toMatchObject({
        x: 0,
        y: -1,
        z: 1,
      })
    })
  })

  describe('eulerAngles', () => {
    it('gets angles from a normalized forward vector', () => {
      const vec = new Vec3({ x: 0, y: 1, z: 0 })
      expect(vec.eulerAngles).toMatchObject({
        pitch: 0,
        yaw: 90,
        roll: 0,
      })
    })

    it('gets angles from a non normalized forward vector', () => {
      const vec = new Vec3({ x: 0, y: 1, z: 0 })
      expect(vec.eulerAngles).toMatchObject({
        pitch: 0,
        yaw: 90,
        roll: 0,
      })
    })
  })

  describe('equals', () => {
    it('returns true when two vectors are equal', () => {
      const vec1 = new Vec3({ x: 1, y: 1.578, z: -3 })
      const vec2 = new Vec3({ x: 1, y: 1.578, z: -3 })
      expect(vec1.equals(vec2)).toBe(true)
    })

    it('returns false when two vectors are not equal', () => {
      const vec1 = new Vec3({ x: 1, y: 1.578, z: -3 })
      const vec2 = new Vec3({ x: 1, y: 1.577, z: -3 })
      expect(vec1.equals(vec2)).toBe(false)
    })
  })

  describe('add', () => {
    it('adds two vectors', () => {
      const vec1 = new Vec3({ x: 1, y: 2, z: -3 })
      const vec2 = new Vec3({ x: 1, y: 2, z: 3 })
      expect(vec1.add(vec2)).toMatchObject({ x: 2, y: 4, z: 0 })
      expect(vec2.add(vec1)).toMatchObject({ x: 2, y: 4, z: 0 })
    })
  })

  describe('subtract', () => {
    it('subtracts two vectors', () => {
      const vec1 = new Vec3({ x: 1, y: 2, z: -3 })
      const vec2 = new Vec3({ x: 1, y: 3, z: 3 })
      expect(vec1.subtract(vec2)).toMatchObject({ x: 0, y: -1, z: -6 })
      expect(vec2.subtract(vec1)).toMatchObject({ x: 0, y: 1, z: 6 })
    })
  })

  describe('divide', () => {
    it('divides two vectors', () => {
      const vec1 = new Vec3({ x: 1, y: 6, z: -3 })
      const vec2 = new Vec3({ x: 1, y: 3, z: 3 })
      expect(vec1.divide(vec2)).toMatchObject({ x: 1, y: 2, z: -1 })
      expect(vec2.divide(vec1)).toMatchObject({ x: 1, y: 0.5, z: -1 })
    })

    it('divides vector', () => {
      const vec1 = new Vec3({ x: 1, y: 6, z: -3 })
      expect(vec1.divide(2)).toMatchObject({ x: 0.5, y: 3, z: -1.5 })
    })

    it('throws error when divided by 0', () => {
      const vec1 = new Vec3({ x: 1, y: 1, z: 1 })
      const vec2 = new Vec3({ x: 0, y: 1, z: 1 })
      expect(() => vec1.divide(vec2)).toThrow('Division by zero')
      expect(() => vec1.divide(0)).toThrow('Division by zero')
    })
  })

  describe('scale/multiply', () => {
    it('scales two vectors', () => {
      const vec1 = new Vec3({ x: 1, y: 2, z: -1 })
      const vec2 = new Vec3({ x: 1, y: 2, z: 1 })
      expect(vec1.scale(vec2)).toMatchObject({ x: 1, y: 4, z: -1 })
      expect(vec2.scale(vec1)).toMatchObject({ x: 1, y: 4, z: -1 })
      expect(vec1.multiply(vec2)).toMatchObject({ x: 1, y: 4, z: -1 })
      expect(vec2.multiply(vec1)).toMatchObject({ x: 1, y: 4, z: -1 })
    })

    it('scales a vector', () => {
      const vec = new Vec3({ x: 1, y: 2, z: -1 })
      expect(vec.scale(2)).toMatchObject({ x: 2, y: 4, z: -2 })
      expect(vec.multiply(2)).toMatchObject({ x: 2, y: 4, z: -2 })
    })
  })

  describe('dot', () => {
    it('gets the dot product between two vectors', () => {
      const vec1 = new Vec3({ x: 1, y: -2, z: 3 })
      const vec2 = new Vec3({ x: 0, y: 5, z: 6 })
      expect(vec1.dot(vec2)).toBe(8)
      expect(vec2.dot(vec1)).toBe(8)
    })
  })

  describe('cross', () => {
    it('gets the cross product between two vectors', () => {
      const vec1 = new Vec3({ x: 1, y: -2, z: 3 })
      const vec2 = new Vec3({ x: 3, y: 4, z: 5 })
      expect(vec1.cross(vec2)).toMatchObject({
        x: -22,
        y: 4,
        z: 10,
      })
    })
  })

  describe('distance', () => {
    it('gets the distance between two vectors', () => {
      const vec1 = new Vec3({ x: 1, y: -1, z: 1 })
      const vec2 = new Vec3({ x: -1, y: 1, z: 2 })
      expect(vec1.distance(vec2)).toBe(3)
      expect(vec2.distance(vec1)).toBe(3)
    })
  })

  describe('distanceSquared', () => {
    it('gets the squared distance between two vectors', () => {
      const vec1 = new Vec3({ x: 1, y: -1, z: 1 })
      const vec2 = new Vec3({ x: -1, y: 1, z: 2 })
      expect(vec1.distanceSquared(vec2)).toBe(9)
      expect(vec2.distanceSquared(vec1)).toBe(9)
    })
  })

  describe('lerpTo', () => {
    it('lerps a vector towards another vector by half', () => {
      const vec1 = new Vec3({ x: 1000, y: 1000, z: 500 })
      const vec2 = new Vec3({ x: 0, y: 0, z: 0 })
      expect(vec1.lerpTo(vec2, 0.5)).toMatchObject({
        x: 500,
        y: 500,
        z: 250,
      })
    })

    it('does not clamp the value if clamp is disabled', () => {
      const vec1 = new Vec3({ x: 1000, y: 1000, z: 500 })
      const vec2 = new Vec3({ x: 0, y: 0, z: 0 })
      expect(vec1.lerpTo(vec2, 1.5, false)).toMatchObject({
        x: -500,
        y: -500,
        z: -250,
      })
    })

    it('clamps the value', () => {
      const vec1 = new Vec3({ x: 1000, y: 1000, z: 500 })
      const vec2 = new Vec3({ x: 0, y: 0, z: 0 })
      expect(vec1.lerpTo(vec2, 1.5, true)).toMatchObject({
        x: 0,
        y: 0,
        z: 0,
      })
    })
  })

  describe('directionTowards', () => {
    it('creates a new normalized vector pointing to the second vector', () => {
      const vec1 = new Vec3({ x: 10, y: 10, z: 10 })
      const vec2 = new Vec3({ x: 15, y: 7, z: 2 })
      expect(vec1.directionTowards(vec2)).toMatchObject({
        x: expect.closeTo(0.5, 1),
        y: expect.closeTo(-0.3, 1),
        z: expect.closeTo(-0.8, 1),
      })
    })
  })

  describe('lookAt', () => {
    it('creates an angle looking at the second vector', () => {
      const vec1 = new Vec3({ x: 0, y: 0, z: 0 })
      const vec2 = new Vec3({ x: 1, y: 1, z: 0 })
      expect(vec1.lookAt(vec2)).toMatchObject({
        pitch: 0,
        yaw: 45,
        roll: 0,
      })
    })
  })

  describe('withX/Y/Z', () => {
    it('replaces the X component', () => {
      const vec = new Vec3({ x: 1, y: 1, z: 1 })
      expect(vec.withX(5)).toMatchObject({
        x: 5,
        y: 1,
        z: 1,
      })
    })

    it('replaces the Y component', () => {
      const vec = new Vec3({ x: 1, y: 1, z: 1 })
      expect(vec.withY(5)).toMatchObject({
        x: 1,
        y: 5,
        z: 1,
      })
    })

    it('replaces the Z component', () => {
      const vec = new Vec3({ x: 1, y: 1, z: 1 })
      expect(vec.withZ(5)).toMatchObject({
        x: 1,
        y: 1,
        z: 5,
      })
    })
  })
})
