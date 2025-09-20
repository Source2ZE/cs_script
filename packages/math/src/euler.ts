import { QAngle } from 'cs_script/point_script'
import { RAD_TO_DEG } from './constants'
import { Vec3 } from './vector3'
import { MathUtils } from './math'

export class EulerUtils {
  public static equals(a: QAngle, b: QAngle): boolean {
    return a.pitch === b.pitch && a.yaw === b.yaw && a.roll === b.roll
  }

  public static normalize(angles: QAngle): Euler {
    const normalizeAngle = (angle: number): number => {
      angle = angle % 360
      if (angle > 180) return angle - 360
      if (angle < -180) return angle + 360
      return angle
    }

    return new Euler(
      normalizeAngle(angles.pitch),
      normalizeAngle(angles.yaw),
      normalizeAngle(angles.roll)
    )
  }

  public static forward(angles: QAngle): Vec3 {
    const pitchInRad = (angles.pitch / 180) * Math.PI
    const yawInRad = (angles.yaw / 180) * Math.PI

    const cosPitch = Math.cos(pitchInRad)

    return new Vec3(
      cosPitch * Math.cos(yawInRad),
      cosPitch * Math.sin(yawInRad),
      -Math.sin(pitchInRad)
    )
  }

  public static right(angles: QAngle): Vec3 {
    const pitchInRad = (angles.pitch / 180) * Math.PI
    const yawInRad = (angles.yaw / 180) * Math.PI
    const rollInRad = (angles.roll / 180) * Math.PI

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

  public static up(angles: QAngle): Vec3 {
    const pitchInRad = (angles.pitch / 180) * Math.PI
    const yawInRad = (angles.yaw / 180) * Math.PI
    const rollInRad = (angles.roll / 180) * Math.PI

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

  public get normal(): Euler {
    return EulerUtils.normalize(this)
  }

  public get forward(): Vec3 {
    return EulerUtils.forward(this)
  }

  public get backward(): Vec3 {
    return this.forward.inverse
  }

  public get right(): Vec3 {
    return EulerUtils.right(this)
  }

  public get left(): Vec3 {
    return this.right.inverse
  }

  public get up(): Vec3 {
    return EulerUtils.up(this)
  }

  public get down(): Vec3 {
    return this.up.inverse
  }

  public toString(): string {
    return `Euler: [${this.pitch}, ${this.yaw}, ${this.roll}]`
  }

  public equals(angles: QAngle): boolean {
    return EulerUtils.equals(this, angles)
  }
  public lerp(angles: QAngle, fraction: number, clamp: boolean = true): Euler {
    return EulerUtils.lerp(this, angles, fraction, clamp)
  }
}
