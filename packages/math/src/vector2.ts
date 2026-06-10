import { MathUtils } from './math';
import { Vec3 } from './vector3';

export interface Vector2 {
  x: number;
  y: number;
}

export class Vector2Utils {
  public static equals(a: Vector2, b: Vector2): boolean {
    return a.x === b.x && a.y === b.y;
  }

  public static add(a: Vector2, b: Vector2): Vec2 {
    return new Vec2(a.x + b.x, a.y + b.y);
  }

  public static subtract(a: Vector2, b: Vector2): Vec2 {
    return new Vec2(a.x - b.x, a.y - b.y);
  }

  public static scale(vector: Vector2, scale: number): Vec2 {
    return new Vec2(vector.x * scale, vector.y * scale);
  }

  public static multiply(a: Vector2, b: Vector2): Vec2 {
    return new Vec2(a.x * b.x, a.y * b.y);
  }

  public static divide(vector: Vector2, divider: Vector2 | number): Vec2 {
    if (typeof divider === 'number') {
      if (divider === 0) throw Error('Division by zero');
      return new Vec2(vector.x / divider, vector.y / divider);
    } else {
      if (divider.x === 0 || divider.y === 0) throw Error('Division by zero');
      return new Vec2(vector.x / divider.x, vector.y / divider.y);
    }
  }

  public static length(vector: Vector2): number {
    return Math.sqrt(Vector2Utils.lengthSquared(vector));
  }

  public static lengthSquared(vector: Vector2): number {
    return vector.x ** 2 + vector.y ** 2;
  }

  public static normalize(vector: Vector2): Vec2 {
    const len = Vector2Utils.length(vector);
    return len ? Vector2Utils.divide(vector, len) : Vec2.Zero;
  }

  public static dot(a: Vector2, b: Vector2): number {
    return a.x * b.x + a.y * b.y;
  }

  /**
   * 2D cross product — returns the scalar Z component of the 3D cross product.
   * Positive = b is counter-clockwise from a; negative = clockwise.
   */
  public static cross(a: Vector2, b: Vector2): number {
    return a.x * b.y - a.y * b.x;
  }

  public static inverse(vector: Vector2): Vec2 {
    return new Vec2(-vector.x, -vector.y);
  }

  public static distance(a: Vector2, b: Vector2): number {
    return Math.sqrt(Vector2Utils.distanceSquared(a, b));
  }

  public static distanceSquared(a: Vector2, b: Vector2): number {
    return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
  }

  public static floor(vector: Vector2): Vec2 {
    return new Vec2(Math.floor(vector.x), Math.floor(vector.y));
  }

  public static ceil(vector: Vector2): Vec2 {
    return new Vec2(Math.ceil(vector.x), Math.ceil(vector.y));
  }

  public static round(vector: Vector2): Vec2 {
    return new Vec2(Math.round(vector.x), Math.round(vector.y));
  }

  public static lerp(
    a: Vector2,
    b: Vector2,
    fraction: number,
    clamp: boolean = true,
  ): Vec2 {
    const t = clamp ? MathUtils.clamp(fraction, 0, 1) : fraction;
    return new Vec2(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
  }

  public static directionTowards(a: Vector2, b: Vector2): Vec2 {
    return Vector2Utils.subtract(b, a).normal;
  }

  /** Returns the angle (in radians) of the vector from the positive X axis. */
  public static angle(vector: Vector2): number {
    return Math.atan2(vector.y, vector.x);
  }

  /** Returns the signed angle (radians) from vector a to vector b. */
  public static angleBetween(a: Vector2, b: Vector2): number {
    return Math.atan2(Vector2Utils.cross(a, b), Vector2Utils.dot(a, b));
  }

  /** Returns the vector rotated 90° counter-clockwise. */
  public static perpendicular(vector: Vector2): Vec2 {
    return new Vec2(-vector.y, vector.x);
  }

  public static withX(vector: Vector2, x: number): Vec2 {
    return new Vec2(x, vector.y);
  }

  public static withY(vector: Vector2, y: number): Vec2 {
    return new Vec2(vector.x, y);
  }

  public static map(vector: Vector2, callback: (component: number) => number): Vec2 {
    return new Vec2(callback(vector.x), callback(vector.y));
  }

  /** Lifts a Vec2 into a Vec3 with an optional z value (default 0). */
  public static toVec3(vector: Vector2, z: number = 0): Vec3 {
    return new Vec3(vector.x, vector.y, z);
  }
}

export class Vec2 {
  public x: number;
  public y: number;

  public static get Zero(): Vec2 {
    return new Vec2(0, 0);
  }

  public static get Up(): Vec2 {
    return new Vec2(1, 0);
  }

  public static get Right(): Vec2 {
    return new Vec2(0, 1);
  }

  constructor(x: number, y: number);
  constructor(vector: Vector2);
  constructor(xOrVector: number | Vector2, y?: number) {
    if (typeof xOrVector === 'object') {
      this.x = xOrVector.x === 0 ? 0 : xOrVector.x;
      this.y = xOrVector.y === 0 ? 0 : xOrVector.y;
    } else {
      this.x = xOrVector === 0 ? 0 : xOrVector;
      this.y = y === 0 ? 0 : y!;
    }
  }

  /** Drops the Z component of a Vec3 to produce a Vec2. */
  public static fromVec3(v: Vec3): Vec2 {
    return new Vec2(v.x, v.y);
  }

  public get length(): number {
    return Vector2Utils.length(this);
  }

  public get lengthSquared(): number {
    return Vector2Utils.lengthSquared(this);
  }

  public get normal(): Vec2 {
    return Vector2Utils.normalize(this);
  }

  public get inverse(): Vec2 {
    return Vector2Utils.inverse(this);
  }

  public get floored(): Vec2 {
    return Vector2Utils.floor(this);
  }

  public get ceil(): Vec2 {
    return Vector2Utils.ceil(this);
  }

  public get round(): Vec2 {
    return Vector2Utils.round(this);
  }

  /** Angle (radians) of this vector from the positive X axis. */
  public get angle(): number {
    return Vector2Utils.angle(this);
  }

  /** This vector rotated 90° counter-clockwise. */
  public get perpendicular(): Vec2 {
    return Vector2Utils.perpendicular(this);
  }

  public toString(): string {
    return `Vec2: [${this.x}, ${this.y}]`;
  }

  public equals(vector: Vector2): boolean {
    return Vector2Utils.equals(this, vector);
  }

  public add(vector: Vector2): Vec2 {
    return Vector2Utils.add(this, vector);
  }

  public subtract(vector: Vector2): Vec2 {
    return Vector2Utils.subtract(this, vector);
  }

  public divide(vector: Vector2 | number): Vec2 {
    return Vector2Utils.divide(this, vector);
  }

  public multiply(scale: number): Vec2;
  public multiply(vector: Vector2): Vec2;
  public multiply(scaleOrVector: number | Vector2): Vec2 {
    return typeof scaleOrVector === 'number'
      ? Vector2Utils.scale(this, scaleOrVector)
      : Vector2Utils.multiply(this, scaleOrVector);
  }

  public dot(vector: Vector2): number {
    return Vector2Utils.dot(this, vector);
  }

  /** Scalar Z of the 3D cross product (signed area of parallelogram). */
  public cross(vector: Vector2): number {
    return Vector2Utils.cross(this, vector);
  }

  public distance(vector: Vector2): number {
    return Vector2Utils.distance(this, vector);
  }

  public distanceSquared(vector: Vector2): number {
    return Vector2Utils.distanceSquared(this, vector);
  }

  /**
   * Linearly interpolates towards a point based on a 0.0–1.0 fraction.
   * Clamp limits the fraction to [0, 1].
   */
  public lerpTo(vector: Vector2, fraction: number, clamp: boolean = true): Vec2 {
    return Vector2Utils.lerp(this, vector, fraction, clamp);
  }

  /** Normalized direction vector pointing towards the given point. */
  public directionTowards(vector: Vector2): Vec2 {
    return Vector2Utils.directionTowards(this, vector);
  }

  /** Signed angle (radians) from this vector to another. */
  public angleTo(vector: Vector2): number {
    return Vector2Utils.angleBetween(this, vector);
  }

  public withX(x: number): Vec2 {
    return Vector2Utils.withX(this, x);
  }

  public withY(y: number): Vec2 {
    return Vector2Utils.withY(this, y);
  }

  /** Lifts this Vec2 into a Vec3 with an optional z value (default 0). */
  public toVec3(z: number = 0): Vec3 {
    return Vector2Utils.toVec3(this, z);
  }
}
