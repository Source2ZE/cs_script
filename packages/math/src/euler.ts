import { QAngle } from 'cs_script/point_script'

export class EulerUtils {}

export class Euler {
  public pitch: number
  public yaw: number
  public roll: number

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
}
