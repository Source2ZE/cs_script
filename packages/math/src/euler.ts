import type { QAngle } from 'cs_script/point_script';
import { MathUtils } from './math';
import { Vec3 } from './vector3';

export class EulerUtils {
  public static equals(a: QAngle, b: QAngle): boolean {
    return a.pitch === b.pitch && a.yaw === b.yaw && a.roll === b.roll;
  }

  public static normalize(angle: QAngle): Euler {
    const normalizeAngle = (angle: number): number => {
      angle = angle % 360;
      if (angle > 180) return angle - 360;
      if (angle < -180) return angle + 360;
      return angle;
    };

    return new Euler(
      normalizeAngle(angle.pitch),
      normalizeAngle(angle.yaw),
      normalizeAngle(angle.roll),
    );
  }

  public static forward(angle: QAngle): Vec3 {
    const pitchInRad = (angle.pitch / 180) * Math.PI;
    const yawInRad = (angle.yaw / 180) * Math.PI;

    const cosPitch = Math.cos(pitchInRad);

    return new Vec3(
      cosPitch * Math.cos(yawInRad),
      cosPitch * Math.sin(yawInRad),
      -Math.sin(pitchInRad),
    );
  }

  public static right(angle: QAngle): Vec3 {
    const pitchInRad = (angle.pitch / 180) * Math.PI;
    const yawInRad = (angle.yaw / 180) * Math.PI;
    const rollInRad = (angle.roll / 180) * Math.PI;

    const sinPitch = Math.sin(pitchInRad);
    const sinYaw = Math.sin(yawInRad);
    const sinRoll = Math.sin(rollInRad);
    const cosPitch = Math.cos(pitchInRad);
    const cosYaw = Math.cos(yawInRad);
    const cosRoll = Math.cos(rollInRad);

    return new Vec3(
      -1 * sinRoll * sinPitch * cosYaw + -1 * cosRoll * -sinYaw,
      -1 * sinRoll * sinPitch * sinYaw + -1 * cosRoll * cosYaw,
      -1 * sinRoll * cosPitch,
    );
  }

  public static up(angle: QAngle): Vec3 {
    const pitchInRad = (angle.pitch / 180) * Math.PI;
    const yawInRad = (angle.yaw / 180) * Math.PI;
    const rollInRad = (angle.roll / 180) * Math.PI;

    const sinPitch = Math.sin(pitchInRad);
    const sinYaw = Math.sin(yawInRad);
    const sinRoll = Math.sin(rollInRad);
    const cosPitch = Math.cos(pitchInRad);
    const cosYaw = Math.cos(yawInRad);
    const cosRoll = Math.cos(rollInRad);

    return new Vec3(
      cosRoll * sinPitch * cosYaw + -sinRoll * -sinYaw,
      cosRoll * sinPitch * sinYaw + -sinRoll * cosYaw,
      cosRoll * cosPitch,
    );
  }

  public static lerp(
    a: QAngle,
    b: QAngle,
    fraction: number,
    clamp: boolean = true,
  ): Euler {
    let t = fraction;
    if (clamp) {
      t = MathUtils.clamp(t, 0, 1);
    }

    const lerpComponent = (start: number, end: number, t: number): number => {
      // Calculate the shortest angular distance
      let delta = end - start;

      // Normalize delta to [-180, 180] range to find shortest path
      if (delta > 180) {
        delta -= 360;
      } else if (delta < -180) {
        delta += 360;
      }

      // Interpolate using the shortest path
      return start + delta * t;
    };

    // a + (b - a) * t
    return new Euler(
      lerpComponent(a.pitch, b.pitch, t),
      lerpComponent(a.yaw, b.yaw, t),
      lerpComponent(a.roll, b.roll, t),
    );
  }

  public static withPitch(angle: QAngle, pitch: number): Euler {
    return new Euler(pitch, angle.yaw, angle.roll);
  }

  public static withYaw(angle: QAngle, yaw: number): Euler {
    return new Euler(angle.pitch, yaw, angle.roll);
  }

  public static withRoll(angle: QAngle, roll: number): Euler {
    return new Euler(angle.pitch, angle.yaw, roll);
  }

  public static rotateTowards(
    current: QAngle,
    target: QAngle,
    maxStep: number,
  ): Euler {
    const rotateComponent = (
      current: number,
      target: number,
      step: number,
    ): number => {
      let delta = target - current;

      if (delta > 180) {
        delta -= 360;
      } else if (delta < -180) {
        delta += 360;
      }

      if (Math.abs(delta) <= step) {
        return target;
      } else {
        return current + Math.sign(delta) * step;
      }
    };

    return new Euler(
      rotateComponent(current.pitch, target.pitch, maxStep),
      rotateComponent(current.yaw, target.yaw, maxStep),
      rotateComponent(current.roll, target.roll, maxStep),
    );
  }

  public static clamp(angle: QAngle, min: QAngle, max: QAngle): Euler {
    return new Euler(
      MathUtils.clamp(angle.pitch, min.pitch, max.pitch),
      MathUtils.clamp(angle.yaw, min.yaw, max.yaw),
      MathUtils.clamp(angle.roll, min.roll, max.roll),
    );
  }
}

export class Euler {
  public pitch: number;
  public yaw: number;
  public roll: number;

  public static Zero = new Euler(0, 0, 0);
  public static Forward = new Euler(1, 0, 0);
  public static Right = new Euler(0, 1, 0);
  public static Up = new Euler(0, 0, 1);

  constructor(pitch: number, yaw: number, roll: number);
  constructor(angle: QAngle);
  constructor(pitchOrAngle: number | QAngle, yaw?: number, roll?: number) {
    if (typeof pitchOrAngle === 'object') {
      this.pitch = pitchOrAngle.pitch === 0 ? 0 : pitchOrAngle.pitch;
      this.yaw = pitchOrAngle.yaw === 0 ? 0 : pitchOrAngle.yaw;
      this.roll = pitchOrAngle.roll === 0 ? 0 : pitchOrAngle.roll;
    } else {
      this.pitch = pitchOrAngle === 0 ? pitchOrAngle : pitchOrAngle;
      this.yaw = yaw === 0 ? 0 : yaw!;
      this.roll = roll === 0 ? 0 : roll!;
    }
  }

  /**
   * Returns angle with every componented clamped from -180 to 180
   */
  public get normal(): Euler {
    return EulerUtils.normalize(this);
  }

  /**
   * Returns a normalized forward direction vector
   */
  public get forward(): Vec3 {
    return EulerUtils.forward(this);
  }

  /**
   * Returns a normalized backward direction vector
   */
  public get backward(): Vec3 {
    return this.forward.inverse;
  }

  /**
   * Returns a normalized right direction vector
   */
  public get right(): Vec3 {
    return EulerUtils.right(this);
  }

  /**
   * Returns a normalized left direction vector
   */
  public get left(): Vec3 {
    return this.right.inverse;
  }

  /**
   * Returns a normalized up direction vector
   */
  public get up(): Vec3 {
    return EulerUtils.up(this);
  }

  /**
   * Returns a normalized down direction vector
   */
  public get down(): Vec3 {
    return this.up.inverse;
  }

  public toString(): string {
    return `Euler: [${this.pitch}, ${this.yaw}, ${this.roll}]`;
  }

  public equals(angle: QAngle): boolean {
    return EulerUtils.equals(this, angle);
  }

  /**
   * Linearly interpolates the angle to an angle based on a 0.0-1.0 fraction
   * Clamp limits the fraction to [0,1]
   * ! Euler angles are not suited for interpolation, prefer to use quarternions instead
   */
  public lerp(angle: QAngle, fraction: number, clamp: boolean = true): Euler {
    return EulerUtils.lerp(this, angle, fraction, clamp);
  }

  /**
   * Returns the same angle but with a supplied pitch component
   */
  public withPitch(pitch: number): Euler {
    return EulerUtils.withPitch(this, pitch);
  }

  /**
   * Returns the same angle but with a supplied yaw component
   */
  public withYaw(yaw: number): Euler {
    return EulerUtils.withYaw(this, yaw);
  }

  /**
   * Returns the same angle but with a supplied roll component
   */
  public withRoll(roll: number): Euler {
    return EulerUtils.withRoll(this, roll);
  }

  /**
   * Rotates an angle towards another angle by a specific step
   * ! Euler angles are not suited for interpolation, prefer to use quarternions instead
   */
  public rotateTowards(angle: QAngle, maxStep: number): Euler {
    return EulerUtils.rotateTowards(this, angle, maxStep);
  }

  /**
   * Clamps each component (pitch, yaw, roll) between the corresponding min and max values
   */
  public clamp(min: QAngle, max: QAngle): Euler {
    return EulerUtils.clamp(this, min, max);
  }
}
