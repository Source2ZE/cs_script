import { QAngle } from 'cs_script/point_script'
import { RAD_TO_DEG } from './constants'
import { Vec3 } from './vector3'
import { MathUtils } from './math'

export class EulerUtils {
  public static equals(a: QAngle, b: QAngle): boolean {
    return a.pitch === b.pitch && a.yaw === b.yaw && a.roll === b.roll
  }

  public static normalize(angle: QAngle): Euler {
    const normalizeAngle = (angle: number): number => {
      angle = angle % 360
      if (angle > 180) return angle - 360
      if (angle < -180) return angle + 360
      return angle
    }

    return new Euler(
      normalizeAngle(angle.pitch),
      normalizeAngle(angle.yaw),
      normalizeAngle(angle.roll)
    )
  }

  public static forward(angle: QAngle): Vec3 {
    const pitchInRad = (angle.pitch / 180) * Math.PI
    const yawInRad = (angle.yaw / 180) * Math.PI

    const cosPitch = Math.cos(pitchInRad)

    return new Vec3(
      cosPitch * Math.cos(yawInRad),
      cosPitch * Math.sin(yawInRad),
      -Math.sin(pitchInRad)
    )
  }

  public static right(angle: QAngle): Vec3 {
    const pitchInRad = (angle.pitch / 180) * Math.PI
    const yawInRad = (angle.yaw / 180) * Math.PI
    const rollInRad = (angle.roll / 180) * Math.PI

    const sinPitch = Math.sin(pitchInRad)
    const sinYaw = Math.sin(yawInRad)
    const sinRoll = Math.sin(rollInRad)
    const cosPitch = Math.cos(pitchInRad)
    const cosYaw = Math.cos(yawInRad)
    const cosRoll = Math.cos(rollInRad)

    return new Vec3(
      -1 * sinRoll * sinPitch * cosYaw + -1 * cosRoll * -sinYaw,
      -1 * sinRoll * sinPitch * sinYaw + -1 * cosRoll * cosYaw,
      -1 * sinRoll * cosPitch
    )
  }

  public static up(angle: QAngle): Vec3 {
    const pitchInRad = (angle.pitch / 180) * Math.PI
    const yawInRad = (angle.yaw / 180) * Math.PI
    const rollInRad = (angle.roll / 180) * Math.PI

    const sinPitch = Math.sin(pitchInRad)
    const sinYaw = Math.sin(yawInRad)
    const sinRoll = Math.sin(rollInRad)
    const cosPitch = Math.cos(pitchInRad)
    const cosYaw = Math.cos(yawInRad)
    const cosRoll = Math.cos(rollInRad)

    return new Vec3(
      cosRoll * sinPitch * cosYaw + -sinRoll * -sinYaw,
      cosRoll * sinPitch * sinYaw + -sinRoll * cosYaw,
      cosRoll * cosPitch
    )
  }

  public static lerp(
    a: QAngle,
    b: QAngle,
    fraction: number,
    clamp: boolean = true
  ): Euler {
    let t = fraction
    if (clamp) {
      t = MathUtils.clamp(t, 0, 1)
    }

    // a + (b - a) * t
    return new Euler(
      a.pitch + (b.pitch - a.pitch) * t,
      a.yaw + (b.yaw - a.yaw) * t,
      a.roll + (b.roll - a.roll) * t
    )
  }

  public static withPitch(angle: QAngle, pitch: number): Euler {
    return new Euler(pitch, angle.yaw, angle.roll)
  }

  public static withYaw(angle: QAngle, yaw: number): Euler {
    return new Euler(angle.pitch, yaw, angle.roll)
  }

  public static withRoll(angle: QAngle, roll: number): Euler {
    return new Euler(angle.pitch, angle.yaw, roll)
  }
}

export class Euler {
  public pitch: number
  public yaw: number
  public roll: number

  public static Zero = new Euler(0, 0, 0)

  constructor(pitch: number, yaw: number, roll: number)
  constructor(angle: QAngle)
  constructor(pitchOrAngle: number | QAngle, yaw?: number, roll?: number) {
    if (typeof pitchOrAngle === 'object') {
      this.pitch = pitchOrAngle.pitch
      this.yaw = pitchOrAngle.yaw
      this.roll = pitchOrAngle.roll
    } else {
      this.pitch = pitchOrAngle
      this.yaw = yaw
      this.roll = roll
    }
  }

  /**
   * Returns angle with every componented clamped from -180 to 180
   */
  public get normal(): Euler {
    return EulerUtils.normalize(this)
  }

  /**
   * Returns a normalized forward direction vector
   */
  public get forward(): Vec3 {
    return EulerUtils.forward(this)
  }

  /**
   * Returns a normalized backward direction vector
   */
  public get backward(): Vec3 {
    return this.forward.inverse
  }

  /**
   * Returns a normalized right direction vector
   */
  public get right(): Vec3 {
    return EulerUtils.right(this)
  }

  /**
   * Returns a normalized left direction vector
   */
  public get left(): Vec3 {
    return this.right.inverse
  }

  /**
   * Returns a normalized up direction vector
   */
  public get up(): Vec3 {
    return EulerUtils.up(this)
  }

  /**
   * Returns a normalized down direction vector
   */
  public get down(): Vec3 {
    return this.up.inverse
  }

  public toString(): string {
    return `Euler: [${this.pitch}, ${this.yaw}, ${this.roll}]`
  }

  public equals(angle: QAngle): boolean {
    return EulerUtils.equals(this, angle)
  }

  /**
   * Linearly interpolates the angle to an angle based on a 0.0-1.0 fraction
   * Clamp limits the fraction to [0,1]
   */
  public lerp(angle: QAngle, fraction: number, clamp: boolean = true): Euler {
    return EulerUtils.lerp(this, angle, fraction, clamp)
  }

  /**
   * Returns the same angle but with a supplied pitch component
   */
  public withPitch(pitch: number): Euler {
    return EulerUtils.withPitch(this, pitch)
  }

  /**
   * Returns the same angle but with a supplied yaw component
   */
  public withYaw(yaw: number): Euler {
    return EulerUtils.withYaw(this, yaw)
  }

  /**
   * Returns the same angle but with a supplied roll component
   */
  public withRoll(roll: number): Euler {
    return EulerUtils.withRoll(this, roll)
  }
}
