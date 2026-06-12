import { Euler, Matrix3x4, Vec3 } from '@s2ze/math';
import { BaseModelEntity, CSPlayerPawn, Entity } from 'cs_script/point_script';

declare module 'cs_script/point_script' {
  interface Entity {
    readonly Transform: Transform;
  }
}

Object.defineProperty(Entity.prototype, 'Transform', {
  get(this: Entity) {
    const existing = TransformsMap.get(this);
    if (existing) return existing;
    const t = new Transform(this);
    TransformsMap.set(this, t);
    return t;
  },
  enumerable: false,
  configurable: true,
});

const TransformsMap = new WeakMap<Entity, Transform>();

class Transform {
  private entity: Entity;
  private _matrix = new Matrix3x4();
  private _scale: number = 1;
  private _velocity: Vec3 = Vec3.Zero;
  private _localVelocity: Vec3 = Vec3.Zero;
  private _localAngularVelocity: Vec3 = Vec3.Zero;
  private _angularVelocity: Vec3 = Vec3.Zero;

  constructor(entity: Entity) {
    this.entity = entity;
    this.updateFromEnt();
  }

  get origin(): Readonly<Vec3> {
    const origin = new Vec3(this.entity.GetAbsOrigin());
    this._matrix.origin = origin;
    return origin;
  }

  set origin(origin: Vec3) {
    this._matrix.origin = origin;
    this.entity.Teleport({ position: origin });
  }

  get eyePosition(): Readonly<Vec3> {
    return new Vec3(this.entity.GetEyePosition());
  }

  get angles(): Readonly<Euler> {
    const angles = new Euler((this.entity as CSPlayerPawn).GetEyeAngles() ?? this.entity.GetAbsAngles());
    this._matrix.angles = angles;
    return angles;
  }

  set angles(angles: Euler) {
    this._matrix.angles = angles;
    this.entity.Teleport({ angles: angles });
  }

  get eyeAngles(): Readonly<Euler> {
    return new Euler(this.entity.GetEyeAngles());
  }

  get matrix(): Readonly<Matrix3x4> {
    return this._matrix;
  }

  set matrix(matrix: Matrix3x4) {
    this._matrix = matrix;
    this.entity.Teleport({ position: matrix.origin, angles: matrix.angles });
  }

  get scale(): number {
    const modelEnt = this.entity as BaseModelEntity;
    this._scale = modelEnt.GetModelScale() ?? this._scale;
    return this._scale;
  }

  set scale(scale: number) {
    this._scale = scale;
    const modelEnt = this.entity as BaseModelEntity;
    modelEnt?.SetModelScale(this._scale);
  }

  get velocity(): Readonly<Vec3> {
    this._velocity = new Vec3(this.entity.GetAbsVelocity());
    return this._velocity;
  }

  set velocity(velocity: Vec3) {
    this._velocity = velocity;
    this.entity.Teleport({ velocity: this._velocity });
  }

  get localVelocity(): Readonly<Vec3> {
    this._localVelocity = new Vec3(this.entity.GetLocalVelocity());
    return this._localVelocity;
  }

  set localVelocity(localVelocity: Vec3) {
    this._localVelocity = localVelocity;
    const parent = this.entity.GetParent();
    if (!parent) {
      this.velocity = localVelocity;
      return;
    }

    // add parent's velocity to get world velocity
    this.velocity = localVelocity.add(parent.Transform.velocity);
  }

  get angularVelocity(): Readonly<Vec3> {
    this._angularVelocity = new Vec3(this.entity.GetAbsAngularVelocity());
    return this._angularVelocity;
  }

  set angularVelocity(angularVelocity: Vec3) {
    this._angularVelocity = angularVelocity;
    this.entity.Teleport({ angularVelocity: this._angularVelocity });
  }

  get localAngularVelocity(): Readonly<Vec3> {
    this._localAngularVelocity = new Vec3(this.entity.GetLocalAngularVelocity());
    return this._localAngularVelocity;
  }

  set localAngularVelocity(localAngularVelocity: Vec3) {
    this._localAngularVelocity = localAngularVelocity;

    const parent = this.entity.GetParent();
    if (!parent) {
      this.angularVelocity = localAngularVelocity;
      return;
    }

    // add parent's angular velocity to get world angular velocity
    this.angularVelocity = localAngularVelocity.add(parent.Transform.angularVelocity);
  }

  get left(): Readonly<Vec3> {
    this._matrix.angles = new Euler((this.entity as CSPlayerPawn).GetEyeAngles() ?? this.entity.GetAbsAngles());
    return this._matrix.left;
  }

  set left(left: Vec3) {
    this._matrix.left = left;
    this.entity.Teleport({ angles: this._matrix.angles });
  }

  get right(): Readonly<Vec3> {
    this._matrix.angles = new Euler((this.entity as CSPlayerPawn).GetEyeAngles() ?? this.entity.GetAbsAngles());
    return this._matrix.right;
  }

  set right(right: Vec3) {
    this._matrix.right = right;
    this.entity.Teleport({ angles: this._matrix.angles });
  }

  get up(): Readonly<Vec3> {
    this._matrix.angles = new Euler((this.entity as CSPlayerPawn).GetEyeAngles() ?? this.entity.GetAbsAngles());
    return this._matrix.up;
  }

  set up(up: Vec3) {
    this._matrix.up = up;
    this.entity.Teleport({ angles: this._matrix.angles });
  }

  set down(down: Vec3) {
    this._matrix.down = down;
    this.entity.Teleport({ angles: this._matrix.angles });
  }

  get down(): Readonly<Vec3> {
    this._matrix.angles = new Euler((this.entity as CSPlayerPawn).GetEyeAngles() ?? this.entity.GetAbsAngles());
    return this._matrix.down;
  }

  get forward(): Readonly<Vec3> {
    this._matrix.angles = new Euler((this.entity as CSPlayerPawn).GetEyeAngles() ?? this.entity.GetAbsAngles());
    return this._matrix.forward;
  }

  set forward(forward: Vec3) {
    this._matrix.forward = forward;
    this.entity.Teleport({ angles: this._matrix.angles });
  }

  get backward(): Readonly<Vec3> {
    this._matrix.angles = new Euler((this.entity as CSPlayerPawn).GetEyeAngles() ?? this.entity.GetAbsAngles());
    return this._matrix.backward;
  }

  set backward(backward: Vec3) {
    this._matrix.backward = backward;
    this.entity.Teleport({ angles: this._matrix.angles });
  }

  public toString(): string {
    this.updateFromEnt();
    let entName = this.entity.GetEntityName();

    if (entName.length === 0) {
      entName = this.entity.GetClassName();
    }

    return `\nTransform: (${entName})
      origin = ${this._matrix.origin.toString()}
      angles = ${this._matrix.angles.toString()}
      scale = ${this._scale}
      velocity = ${this._velocity}
      localVelocity = ${this._localVelocity}
      angularVelocity = ${this._angularVelocity}
      localAngularVelocity = ${this._localAngularVelocity}`;
  }

  private updateFromEnt() {
    this._matrix.angles = new Euler((this.entity as CSPlayerPawn).GetEyeAngles() ?? this.entity.GetAbsAngles());
    this._matrix.origin = new Vec3(this.entity.GetAbsOrigin());
    this._scale = (this.entity as BaseModelEntity)?.GetModelScale() ?? this._scale;
    this._velocity = new Vec3(this.entity.GetAbsVelocity());
    this._localVelocity = new Vec3(this.entity.GetLocalVelocity());
    this._angularVelocity = new Vec3(this.entity.GetAbsAngularVelocity());
    this._localAngularVelocity = new Vec3(this.entity.GetLocalAngularVelocity());
  }

  public localToWorldPoint(localPoint: Vec3): Vec3 {
    this.updateFromEnt();
    return this._matrix.transformVec3(localPoint.multiply(this.scale));
  }

  public worldToLocalPoint(worldPoint: Vec3): Vec3 {
    this.updateFromEnt();
    return this._matrix.transformInverseVec3(worldPoint).multiply(1 / this.scale);
  }

  public localToWorldDirection(localDir: Vec3): Vec3 {
    this.updateFromEnt();
    return this._matrix.rotateVec3(localDir.multiply(this.scale));
  }

  public worldToLocalDirection(worldDir: Vec3): Vec3 {
    this.updateFromEnt();
    return this._matrix.rotateInverseVec3(worldDir).multiply(1 / this.scale);
  }

  public lookAt(worldPoint: Vec3) {
    this.updateFromEnt();
    this.forward = worldPoint.subtract(this._matrix.origin).normal;
  }

  public translateLocal(delta: Vec3) {
    this.updateFromEnt();
    this.origin = this._matrix.origin.add(this.localToWorldDirection(delta));
  }

  public translateWorld(delta: Vec3) {
    this.updateFromEnt();
    this.origin = this._matrix.origin.add(delta);
  }

  public distanceTo(other: Entity): number {
    this.updateFromEnt();
    return this._matrix.origin.subtract(other.Transform.origin).length;
  }

  public directionTo(other: Entity): Vec3 {
    this.updateFromEnt();
    return other.Transform.origin.subtract(this._matrix.origin).normal;
  }
}
