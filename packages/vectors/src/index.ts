import { Vector } from 'cs_script/point_script'

export class Vectors3 {
  public static add(a: Vector, b: Vector): Vec3 {
    return new Vec3(a.x + b.x, a.y + b.y, a.z + b.z)
  }

  public static subtract(a: Vector, b: Vector): Vec3 {
    return new Vec3(a.x - b.x, a.y - b.y, a.z - b.z)
  }

  public static length(vector: Vector): number {
    return Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2)
  }

  public static lengthSquared(vector: Vector): number {
    return vector.x ** 2 + vector.y ** 2 + vector.z ** 2
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

  public static normalize(vector: Vector): Vec3 {
    const length = Vectors3.length(vector)
    return length ? Vectors3.divide(vector, length) : Vec3.Zero
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

  public add(vector: Vector): Vec3 {
    return Vectors3.add(this, vector)
  }

  public subtract(vector: Vector): Vec3 {
    return Vectors3.subtract(this, vector)
  }

  public get length(): number {
    return Vectors3.length(this)
  }

  public get lengthSquared(): number {
    return Vectors3.lengthSquared(this)
  }

  public get normal(): Vec3 {
    return Vectors3.normalize(this)
  }
}
