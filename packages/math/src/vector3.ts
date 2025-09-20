import { Vector } from 'cs_script/point_script'
import { Euler } from './euler'
import { RAD_TO_DEG } from './constants'
import { MathUtils } from './math'

export class Vector3Utils {
  public static equals(a: Vector, b: Vector): boolean {
    return a.x === b.x && a.y === b.y && a.z === b.z
  }

  public static add(a: Vector, b: Vector): Vec3 {
    return new Vec3(a.x + b.x, a.y + b.y, a.z + b.z)
  }

  public static subtract(a: Vector, b: Vector): Vec3 {
    return new Vec3(a.x - b.x, a.y - b.y, a.z - b.z)
  }

  public static scale(vector: Vector, scale: number): Vec3 {
    return new Vec3(vector.x * scale, vector.y * scale, vector.z * scale)
  }

  public static multiply(a: Vector, b: Vector): Vec3 {
    return new Vec3(a.x * b.x, a.y * b.y, a.z * b.z)
  }

  public static divide(vector: Vector, divider: Vector | number): Vec3 {
    if (typeof divider === 'number') {
      return new Vec3(
        vector.x / divider,
        vector.y / divider,
        vector.z / divider
      )
    } else {
      return new Vec3(
        vector.x / divider.x,
        vector.y / divider.y,
        vector.z / divider.z
      )
    }
  }

  public static length(vector: Vector): number {
    return Math.sqrt(Vector3Utils.lengthSquared(vector))
  }

  public static lengthSquared(vector: Vector): number {
    return vector.x ** 2 + vector.y ** 2 + vector.z ** 2
  }

  public static length2D(vector: Vector): number {
    return Math.sqrt(Vector3Utils.length2DSquared(vector))
  }

  public static length2DSquared(vector: Vector): number {
    return vector.x ** 2 + vector.y ** 2
  }

  public static normalize(vector: Vector): Vec3 {
    const length = Vector3Utils.length(vector)
    return length ? Vector3Utils.divide(vector, length) : Vec3.Zero
  }

  public static dot(a: Vector, b: Vector): number {
    return a.x * b.x + a.y * b.y + a.z * b.z
  }

  public static cross(a: Vector, b: Vector): Vec3 {
    return new Vec3(
      a.y * b.z - a.z * b.y,
      a.z * b.x - a.x * b.z,
      a.x * b.y - a.y * b.x
    )
  }

  public static inverse(vector: Vector): Vec3 {
    return new Vec3(-vector.y, -vector.z, -vector.x)
  }

  public static distance(a: Vector, b: Vector): number {
    return Vector3Utils.subtract(a, b).length
  }

  public static distanceSquared(a: Vector, b: Vector): number {
    return Vector3Utils.subtract(a, b).lengthSquared
  }

  public static floor(vector: Vector): Vec3 {
    return new Vec3(
      Math.floor(vector.x),
      Math.floor(vector.y),
      Math.floor(vector.z)
    )
  }

  public static vectorAngles(vector: Vector): Euler {
    let yaw = 0
    let pitch = 0

    if (!vector.y && !vector.x) {
      if (vector.z > 0) pitch = 270
      else pitch = 90
    } else {
      yaw = Math.atan2(vector.y, vector.x) * RAD_TO_DEG
      if (yaw < 0) yaw += 360

      pitch = Math.atan2(-vector.z, Vector3Utils.length2D(vector)) * RAD_TO_DEG
      if (pitch < 0) pitch += 360
    }

    return new Euler({
      pitch,
      yaw,
      roll: 0,
    })
  }

  public static lerp(
    a: Vector,
    b: Vector,
    fraction: number,
    clamp: boolean = true
  ): Vec3 {
    let t = fraction
    if (clamp) {
      t = MathUtils.clamp(t, 0, 1)
    }

    // a + (b - a) * t
    return new Vec3(
      a.x + (b.x - a.x) * t,
      a.y + (b.y - a.y) * t,
      a.z + (b.z - a.z) * t
    )
  }
}

export class Vec3 {
  public x: number
  public y: number
  public z: number
  public static Zero = new Vec3(0, 0, 0)

  constructor(x: number, y: number, z: number)
  constructor(vector: Vector)
  constructor(xOrVector: number | Vector, y?: number, z?: number) {
    if (typeof xOrVector === 'object') {
      this.x = xOrVector.x
      this.y = xOrVector.y
      this.z = xOrVector.z
    } else {
      this.x = xOrVector
      this.y = y
      this.z = z
    }
  }

  public get length(): number {
    return Vector3Utils.length(this)
  }

  public get lengthSquared(): number {
    return Vector3Utils.lengthSquared(this)
  }

  public get length2D(): number {
    return Vector3Utils.length2D(this)
  }

  public get length2DSquared(): number {
    return Vector3Utils.length2DSquared(this)
  }

  public get normal(): Vec3 {
    return Vector3Utils.normalize(this)
  }

  public get inverse(): Vec3 {
    return Vector3Utils.inverse(this)
  }

  public get floored(): Vec3 {
    return Vector3Utils.floor(this)
  }

  public get eulerAngles(): Euler {
    return Vector3Utils.vectorAngles(this)
  }

  public toString = (): string => {
    return `Vec3: [${this.x}, ${this.y}, ${this.z}]`
  }

  public equals(vector: Vector): boolean {
    return Vector3Utils.equals(this, vector)
  }

  public add(vector: Vector): Vec3 {
    return Vector3Utils.add(this, vector)
  }

  public subtract(vector: Vector): Vec3 {
    return Vector3Utils.subtract(this, vector)
  }

  public divide(vector: Vector): Vec3 {
    return Vector3Utils.divide(this, vector)
  }

  public scale(vector: Vector): Vec3
  public scale(scale: number): Vec3
  public scale(scaleOrVector: Vector | number): Vec3 {
    return typeof scaleOrVector === 'number'
      ? Vector3Utils.scale(this, scaleOrVector)
      : Vector3Utils.multiply(this, scaleOrVector)
  }

  public multiply(vector: Vector): Vec3
  public multiply(scale: number): Vec3
  public multiply(scaleOrVector: Vector | number): Vec3 {
    return typeof scaleOrVector === 'number'
      ? Vector3Utils.scale(this, scaleOrVector)
      : Vector3Utils.multiply(this, scaleOrVector)
  }

  public dot(vector: Vector): number {
    return Vector3Utils.dot(this, vector)
  }

  public cross(vector: Vector): Vec3 {
    return Vector3Utils.cross(this, vector)
  }

  public distance(vector: Vector): number {
    return Vector3Utils.distance(this, vector)
  }

  public distanceSquared(vector: Vector): number {
    return Vector3Utils.distanceSquared(this, vector)
  }

  public lerpTo(vector: Vector, fraction: number, clamp: boolean = true): Vec3 {
    return Vector3Utils.lerp(this, vector, fraction)
  }
}
