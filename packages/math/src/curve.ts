import { drawDisk } from '@s2ze/debug';
import { type Color, CSInputs, type CSPlayerPawn, Instance } from 'cs_script/point_script';
import { TICK_DT } from './constants';
import { Euler } from './euler';
import { Matrix3x4 } from './matrix';
import { Vec3 } from './vector3';

/** 2D curve point vector class */
export class CurvePoint {
  public x: number = 0;
  public y: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public static readonly Zero: CurvePoint = new CurvePoint(0, 0);

  public toString(): string {
    return `CurvePoint: [${this.x}, ${this.y}]`;
  }

  public add(point: CurvePoint): CurvePoint {
    return new CurvePoint(this.x + point.x, this.y + point.y);
  }

  public subtract(point: CurvePoint): CurvePoint {
    return new CurvePoint(this.x - point.x, this.y - point.y);
  }

  public multiply(point: number | CurvePoint): CurvePoint {
    if (typeof point === 'number') {
      return new CurvePoint(this.x * point, this.y * point);
    } else {
      return new CurvePoint(this.x * point.x, this.y * point.y);
    }
  }

  public divide(point: number | CurvePoint): CurvePoint {
    if (typeof point === 'number') {
      return new CurvePoint(this.x / point, this.y / point);
    } else {
      return new CurvePoint(this.x / point.x, this.y / point.y);
    }
  }

  public length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  public normalise(): CurvePoint {
    const len = this.length();
    if (len < 1e-9) return CurvePoint.Zero;
    return this.divide(len);
  }
}

/**
 * # Interactive in-world curve editor
 *
 * ## Controls:
 * - USE - Move curve point.
 * - USE + WALK - Remove curve point.
 * - RELOAD - Add curve point.
 * - INSPECT - Print curve data to console.
 *
 * ## Saving curve data:
 *
 * Press the RELOAD button and copy the curve data from the console into your script using
 * {@link Curve.loadCurveFromString()}.
 */
export class CurveEditor {
  /** In-world editor origin */
  public Origin: Vec3 = Vec3.Zero;
  /** In-world editor angles */
  public Angles: Euler = Euler.Zero;

  /** In-world editor width */
  public Width = 50;
  /** In-world editor height */
  public Height = 50;
  /** Interactible curve handle radius (in editor-space units) */
  public HandleRadius = 0.5;

  private Curve: Curve;
  private Player: CSPlayerPawn;

  private HotHandleID: number = -1;
  private HotHandleDragOffset: CurvePoint = CurvePoint.Zero;

  private readonly PointAnchorColor: Color = { r: 52, g: 90, b: 148, a: 255 };
  private readonly PointHandleColor: Color = { r: 227, g: 128, b: 57, a: 255 };

  constructor(curve: Curve, player: CSPlayerPawn) {
    this.Curve = curve;
    this.Player = player;
  }

  /** Editor think logic, call in your own think function */
  public think() {
    const edges0 = this.Origin;
    const edges1 = edges0.add(this.Angles.right.multiply(this.Width));
    const edges2 = edges0.add(this.Angles.up.multiply(this.Height));

    const linePos = new Vec3(this.Player.GetEyePosition());
    const lineAng = new Euler(this.Player.GetEyeAngles());

    const barycentricUVT = computeIntersectionBarycentricCoordinates(
      linePos,
      linePos.add(lineAng.forward.multiply(10000)),
      edges0,
      edges1,
      edges2,
    );

    if (barycentricUVT === undefined) {
      return;
    }

    const u = barycentricUVT.u;
    const v = barycentricUVT.v;

    const mousePos = new CurvePoint(u, v);

    if (this.Player.WasInputJustPressed(CSInputs.RELOAD)) {
      this.Curve.addSegment(mousePos);
    }

    if (this.Player.WasInputJustPressed(CSInputs.LOOK_AT_WEAPON)) {
      this.Curve.printPointsToConsole();
    }

    // Handle point interaction: deletion check before move so we don't act on a
    // just-deleted handle index.
    for (let i = 0; i < this.Curve.pointCount; i++) {
      const point = this.Curve.getPoint(i);

      if (
        this.Player.WasInputJustPressed(CSInputs.USE)
        && this.Player.IsInputPressed(CSInputs.WALK)
        && this.HotHandleID === i
      ) {
        this.Curve.removeAnchor(i);
        this.HotHandleID = -1;
        break;
      }

      const newpos = this.freeMoveHandle(i, mousePos, point, this.HandleRadius);
      this.Curve.movePoint(i, newpos);
    }

    // Draw handles
    for (let i = 0; i < this.Curve.pointCount; i++) {
      const point = this.Curve.getPoint(i);
      // HandleRadius is in world units; normalise to editor UV space for hit-testing.
      const normalised = this.HandleRadius / this.Height;

      let color = this.Curve.isAnchorPoint(i) ? this.PointAnchorColor : this.PointHandleColor;

      if (this.isNearHandle(mousePos, point, normalised)) {
        const multiplier = this.HotHandleID === i ? 5 : 1.8;
        color = {
          r: color.r * multiplier,
          g: color.g * multiplier,
          b: color.b * 1.8,
          a: 255,
        };
      }

      drawDisk({
        origin: this.curveToWorld(point.x, point.y),
        radius: this.HandleRadius,
        normal: this.Angles.forward,
        duration: TICK_DT,
        segments: 16,
        color: color,
      });
    }

    // Draw control-handle lines
    for (let i = 0; i < this.Curve.segmentCount; i++) {
      const segmentPoints = this.Curve.getPointsInSegment(i);

      Instance.DebugLine({
        start: this.curveToWorld(segmentPoints[0].x, segmentPoints[0].y),
        end: this.curveToWorld(segmentPoints[1].x, segmentPoints[1].y),
        color: this.PointHandleColor,
      });
      Instance.DebugLine({
        start: this.curveToWorld(segmentPoints[2].x, segmentPoints[2].y),
        end: this.curveToWorld(segmentPoints[3].x, segmentPoints[3].y),
        color: this.PointHandleColor,
      });
    }

    // Only resample when the curve is dirty (a point was moved / added / removed).
    this.Curve.flushIfDirty();

    debugRenderCurve(this.Curve, this.Origin, this.Angles, this.Width, this.Height);
  }

  private curveToWorld(u: number, v: number): Vec3 {
    const ix = u * this.Width;
    const iy = v * this.Height;
    return this.Angles.right.multiply(ix).add(this.Angles.up.multiply(iy)).add(this.Origin);
  }

  private freeMoveHandle(id: number, mousePos: CurvePoint, position: CurvePoint, worldRadius: number): CurvePoint {
    // Convert world-space radius to normalised editor UV space.
    const normRadius = worldRadius / this.Height;
    let newpos = position;

    if (this.Player.WasInputJustPressed(CSInputs.USE)) {
      if (this.isNearHandle(mousePos, position, normRadius) && this.HotHandleID === -1) {
        this.HotHandleID = id;
        this.HotHandleDragOffset = new CurvePoint(mousePos.x - position.x, mousePos.y - position.y);
      }
    }

    if (this.Player.IsInputPressed(CSInputs.USE)) {
      if (this.HotHandleID !== -1 && this.HotHandleID === id) {
        newpos = new CurvePoint(mousePos.x - this.HotHandleDragOffset.x, mousePos.y - this.HotHandleDragOffset.y);
      }
    }

    if (this.Player.WasInputJustReleased(CSInputs.USE)) {
      this.HotHandleID = -1;
    }

    return newpos;
  }

  /**
   * @param normRadius - hit-test radius already normalised to editor UV space
   */
  private isNearHandle(mousePos: CurvePoint, position: CurvePoint, normRadius: number): boolean {
    return mousePos.subtract(position).length() <= normRadius;
  }
}

/**
 * # Description
 * Piecewise cubic Bezier curve constrained to be monotonically increasing in x (curve doesn't loop back on itself),
 * This makes it useful as a mapping function [0, 1] => [0, 1].
 *
 * Equivalent to the curve editor found in most game engines and DCCs (Unity's
 * AnimationCurve, Unreal's UCurveFloat, Blender's FCurve).
 *
 * # Usage
 *
 * It's recommended to use the {@link CurveEditor} in order to build curves,
 * once built and loaded, use {@link evaluate} and {@link evaluateDerivative} to sample the curve.
 */
export class Curve {
  // Backing arrays are private so callers cannot mutate the spline into an invalid state.
  // Use the public readonly views / methods instead.
  private readonly _curvePoints: CurvePoint[] = [
    new CurvePoint(0, 0),
    new CurvePoint(0.15, 0.35),
    new CurvePoint(0.45, 0.05),
    new CurvePoint(0.5, 0.5),
  ];

  private readonly _curveCache: CurvePoint[] = [];

  /** Whether the cache needs to be rebuilt before the next evaluate / render call. */
  private _dirty: boolean = true;

  public readonly Resolution: number;

  constructor(config?: { CurvePoints?: CurvePoint[]; Resolution?: number }) {
    this.Resolution = config?.Resolution ?? 32;

    if (config?.CurvePoints !== undefined && config.CurvePoints.length > 0) {
      // Replace defaults with the provided points in-place (concat() returns a new
      // array and would leave _curvePoints pointing at the empty default).
      this._curvePoints.length = 0;
      for (const p of config.CurvePoints) {
        this._curvePoints.push(p);
      }
    }

    this.sampleAndCacheCurve();
    this._dirty = false;
  }

  /** Read-only view of the control points. */
  public get curvePoints(): ReadonlyArray<CurvePoint> {
    return this._curvePoints;
  }

  /** Read-only view of the cached sampled points. Rebuild via {@link flushIfDirty} first. */
  public get curveCache(): ReadonlyArray<CurvePoint> {
    return this._curveCache;
  }

  /** Number of control points. */
  public get pointCount(): number {
    return this._curvePoints.length;
  }

  /** Returns control point at index `i`. */
  public getPoint(i: number): CurvePoint {
    return this._curvePoints[i];
  }

  /**
   * Number of cubic Bezier segments.
   */
  public get segmentCount(): number {
    return Math.max(0, Math.floor((this._curvePoints.length - 1) / 3));
  }

  public addSegment(anchorPoint: CurvePoint) {
    const lastAnchor = this._curvePoints[this._curvePoints.length - 1];
    const lastHandle = this._curvePoints[this._curvePoints.length - 2];

    const clampedAnchor = new CurvePoint(Math.max(anchorPoint.x, lastAnchor.x + 0.05), anchorPoint.y);

    const reflectedHandle = lastAnchor.multiply(2).subtract(lastHandle);
    const clampedReflectedHandle = new CurvePoint(
      Math.max(reflectedHandle.x, lastAnchor.x + 0.001),
      reflectedHandle.y,
    );

    const midHandle = lastAnchor.add(clampedAnchor).multiply(0.5);
    const clampedMidHandle = new CurvePoint(
      Math.min(Math.max(midHandle.x, lastAnchor.x + 0.001), clampedAnchor.x - 0.001),
      midHandle.y,
    );

    this._curvePoints.push(clampedReflectedHandle);
    this._curvePoints.push(clampedMidHandle);
    this._curvePoints.push(clampedAnchor);

    this._dirty = true;
  }

  public removeAnchor(i: number) {
    const pointCount = this._curvePoints.length;

    // Never remove the two base anchors (minimum: 4 points = 1 segment).
    if (pointCount <= 4) return;
    if (!this.isAnchorPoint(i)) return;

    if (i === 0) {
      // First anchor: remove the anchor itself and the two handles that follow it.
      this._curvePoints.splice(0, 3);
    } else if (i === pointCount - 1) {
      // Last anchor: remove the two handles that precede it and the anchor itself.
      this._curvePoints.splice(i - 2, 3);
    } else {
      // Middle anchor: remove the handle before, the anchor, and the handle after.
      this._curvePoints.splice(i - 1, 3);
    }

    this._dirty = true;
  }

  public getPointsInSegment(i: number): CurvePoint[] {
    return [
      this._curvePoints[i * 3],
      this._curvePoints[i * 3 + 1],
      this._curvePoints[i * 3 + 2],
      this._curvePoints[i * 3 + 3],
    ];
  }

  public isAnchorPoint(i: number): boolean {
    return i % 3 === 0;
  }

  public movePoint(i: number, destination: CurvePoint) {
    if (this.isAnchorPoint(i)) {
      const prevAnchorIndex = i - 3;
      const nextAnchorIndex = i + 3;

      const minX = prevAnchorIndex >= 0 ? this._curvePoints[prevAnchorIndex].x + 0.001 : 0;
      const maxX = nextAnchorIndex < this._curvePoints.length ? this._curvePoints[nextAnchorIndex].x - 0.001 : 1;

      const clampedDest = new CurvePoint(Math.min(Math.max(destination.x, minX), maxX), destination.y);
      const clampedDelta = clampedDest.subtract(this._curvePoints[i]);

      this._curvePoints[i] = clampedDest;

      if (i + 1 < this._curvePoints.length) {
        this._curvePoints[i + 1] = this._curvePoints[i + 1].add(clampedDelta);
      }
      if (i - 1 >= 0) {
        this._curvePoints[i - 1] = this._curvePoints[i - 1].add(clampedDelta);
      }
    } else {
      const nextPointIsAnchor = (i + 1) % 3 === 0;
      const anchorIndex = nextPointIsAnchor ? i + 1 : i - 1;
      const otherAnchorIndex = nextPointIsAnchor ? i - 2 : i + 2;

      const anchorX = this._curvePoints[anchorIndex].x;
      const otherAnchorX
        = otherAnchorIndex >= 0 && otherAnchorIndex < this._curvePoints.length
          ? this._curvePoints[otherAnchorIndex].x
          : nextPointIsAnchor
            ? 0
            : 1;

      const minX = Math.min(anchorX, otherAnchorX) + 0.001;
      const maxX = Math.max(anchorX, otherAnchorX) - 0.001;

      this._curvePoints[i] = new CurvePoint(Math.min(Math.max(destination.x, minX), maxX), destination.y);

      const correspondingControlIndex = nextPointIsAnchor ? i + 2 : i - 2;
      if (correspondingControlIndex >= 0 && correspondingControlIndex < this._curvePoints.length) {
        const anchorPoint = this._curvePoints[anchorIndex];
        const dist = anchorPoint.subtract(this._curvePoints[correspondingControlIndex]).length();
        const dir = anchorPoint.subtract(this._curvePoints[i]).normalise();
        const reflected = anchorPoint.add(dir.multiply(dist));

        // Clamp the reflected handle so it stays within its own segment's x bounds.
        const mirrorAnchorIndex = nextPointIsAnchor ? anchorIndex + 3 : anchorIndex - 3;
        const mirrorAnchorX
          = mirrorAnchorIndex >= 0 && mirrorAnchorIndex < this._curvePoints.length
            ? this._curvePoints[mirrorAnchorIndex].x
            : nextPointIsAnchor
              ? 1
              : 0;

        const mirrorMinX = Math.min(anchorX, mirrorAnchorX) + 0.001;
        const mirrorMaxX = Math.max(anchorX, mirrorAnchorX) - 0.001;

        this._curvePoints[correspondingControlIndex] = new CurvePoint(
          Math.min(Math.max(reflected.x, mirrorMinX), mirrorMaxX),
          reflected.y,
        );
      }
    }

    this._dirty = true;
  }

  /**
   * Rebuilds the sample cache if any control points have changed since the last
   */
  public flushIfDirty() {
    if (this._dirty) {
      this.sampleAndCacheCurve();
      this._dirty = false;
    }
  }

  /** Unconditionally rebuilds the sample cache. Prefer {@link flushIfDirty} in hot paths. */
  public sampleAndCacheCurve() {
    if (this._curvePoints.length < 4) return;

    this._curveCache.length = 0;

    for (let i = 0; i < this._curvePoints.length - 1; i += 3) {
      const p1 = this._curvePoints[i];
      const p2 = this._curvePoints[i + 1];
      const p3 = this._curvePoints[i + 2];
      const p4 = this._curvePoints[i + 3];

      for (let j = 0; j < this.Resolution + 1; j++) {
        const interpolatePoint = cubicBezierInterpolation(p1, p2, p3, p4, j / this.Resolution);

        interpolatePoint.x = Math.min(Math.max(interpolatePoint.x, 0), 1);
        interpolatePoint.y = Math.min(Math.max(interpolatePoint.y, 0), 1);

        this._curveCache.push(interpolatePoint);
      }
    }

    // Extend curve to x=0 / x=1 edges if the first or last anchor was moved inward.
    const first = this._curveCache[0];
    const last = this._curveCache[this._curveCache.length - 1];

    if (first.x > 0) {
      this._curveCache.unshift(new CurvePoint(0, first.y));
    }
    if (last.x < 1) {
      this._curveCache.push(new CurvePoint(1, last.y));
    }
  }

  /** Returns the y value of the curve at normalised x position [0, 1]. */
  public evaluate(x: number): number {
    if (this._curveCache.length < 2) return 0;

    x = Math.min(Math.max(x, 0), 1);

    // Binary search for the segment where cache[lo].x <= x <= cache[hi].x.
    let lo = 0;
    let hi = this._curveCache.length - 1;

    while (lo + 1 < hi) {
      const mid = (lo + hi) >> 1;
      if (this._curveCache[mid].x <= x) {
        lo = mid;
      } else {
        hi = mid;
      }
    }

    const a = this._curveCache[lo];
    const b = this._curveCache[hi];

    const dx = b.x - a.x;
    if (dx < 1e-6) return a.y;

    const t = (x - a.x) / dx;
    return a.y + (b.y - a.y) * t;
  }

  /**
   * Returns the approximate derivative (slope) of the curve at normalised x [0, 1].
   * Useful for velocity-aware easing and tangent calculations.
   */
  public evaluateDerivative(x: number): number {
    if (this._curveCache.length < 2) return 0;

    x = Math.min(Math.max(x, 0), 1);

    let lo = 0;
    let hi = this._curveCache.length - 1;

    while (lo + 1 < hi) {
      const mid = (lo + hi) >> 1;
      if (this._curveCache[mid].x <= x) {
        lo = mid;
      } else {
        hi = mid;
      }
    }

    const a = this._curveCache[lo];
    const b = this._curveCache[hi];

    const dx = b.x - a.x;
    if (dx < 1e-6) return 0;

    return (b.y - a.y) / dx;
  }

  public printPointsToConsole() {
    let finalString = '\n\n------------------ Curve points: ------------------\n\n';

    for (let i = 0; i < this._curvePoints.length; i++) {
      const point = this._curvePoints[i];
      finalString += `${point.x} ${point.y}`;
      if (i < this._curvePoints.length - 1) {
        finalString += ',\n';
      }
    }

    Instance.Msg(finalString);
    Instance.Msg('\n\n---------------------------------------------------');
  }

  public static loadCurveFromString(string: string, resolution?: number): Curve | undefined {
    const splitString = string.split(',');
    const points: CurvePoint[] = [];

    if (splitString.length < 2) return undefined;

    for (let i = 0; i < splitString.length; i++) {
      const pointString = splitString[i].trim().split(' ');

      if (pointString.length !== 2) return undefined;

      const x = Number.parseFloat(pointString[0]);
      const y = Number.parseFloat(pointString[1]);

      if (Number.isNaN(x) || Number.isNaN(y)) {
        Instance.Msg(`Curve.loadCurveFromString: invalid number at index ${i}`);
        return undefined;
      }

      points.push(new CurvePoint(x, y));
    }

    // A valid spline requires 1 + 3n control points (one base anchor plus three
    // per additional segment: handle-out, handle-in, anchor).
    if ((points.length - 1) % 3 !== 0) {
      Instance.Msg(
        `Curve.loadCurveFromString: invalid point count ${points.length}. Expected 1 + 3n (e.g. 4, 7, 10 ...).`,
      );
      return undefined;
    }

    return new Curve({ CurvePoints: points, Resolution: resolution });
  }

  /** Renders an ASCII plot of the curve to the console. */
  public debugPrintCurve(steps: number = 100, height: number = 25) {
    const rows: string[] = [];
    for (let row = 0; row < height; row++) rows.push('');

    for (let i = 0; i <= steps; i++) {
      const x = i / steps;
      const y = this.evaluate(x);
      const row = Math.round((1 - y) * (height - 1));

      for (let r = 0; r < height; r++) {
        rows[r] += r === row ? '*' : ' ';
      }
    }

    for (const row of rows) Instance.Msg(row);
  }
}

export function debugRenderCurve(
  curve: Curve,
  position: Vec3,
  angle: Euler,
  width: number,
  height: number,
  duration: number = TICK_DT,
) {
  const transformsMatrix: Matrix3x4 = new Matrix3x4();
  transformsMatrix.origin = position;
  transformsMatrix.angles = angle;

  const sideOffset = 0.5;
  const arrowSize = 1;
  const xDir = transformsMatrix.right;
  const yDir = transformsMatrix.up;
  const origin = transformsMatrix.origin.add(yDir.multiply(-sideOffset)).add(xDir.multiply(-sideOffset));

  // X axis
  const xDirArrowOrigin = origin.add(xDir.multiply(width));
  const xDirArrowLeft = new Vec3(0, -width + arrowSize + sideOffset, arrowSize - sideOffset);
  const xDirArrowRight = new Vec3(0, -width + arrowSize + sideOffset, -arrowSize - sideOffset);

  Instance.DebugLine({
    start: origin,
    end: xDirArrowOrigin,
    duration,
    color: { r: 200, g: 30, b: 30 } });

  Instance.DebugLine({
    start: xDirArrowOrigin,
    end: transformsMatrix.transformVec3(xDirArrowLeft),
    duration,
    color: { r: 200, g: 30, b: 30 } });

  Instance.DebugLine({
    start: xDirArrowOrigin,
    end: transformsMatrix.transformVec3(xDirArrowRight),
    duration,
    color: { r: 200, g: 30, b: 30 } });

  // Y axis
  const yDirArrowOrigin = origin.add(yDir.multiply(height));
  const yDirArrowLeft = new Vec3(0, -arrowSize + sideOffset, height - arrowSize - sideOffset);
  const yDirArrowRight = new Vec3(0, arrowSize + sideOffset, height - arrowSize - sideOffset);

  Instance.DebugLine({ start: origin,
    end: yDirArrowOrigin,
    duration,
    color: { r: 30, g: 200, b: 30 } });

  Instance.DebugLine({
    start: yDirArrowOrigin,
    end: transformsMatrix.transformVec3(yDirArrowLeft),
    duration,
    color: { r: 30, g: 200, b: 30 } });

  Instance.DebugLine({
    start: yDirArrowOrigin,
    end: transformsMatrix.transformVec3(yDirArrowRight),
    duration,
    color: { r: 30, g: 200, b: 30 } });

  if (curve.curveCache.length < 2) return;

  for (let i = 1; i < curve.curveCache.length; i++) {
    const startPoint = curve.curveCache[i - 1];
    const endPoint = curve.curveCache[i];

    const worldStartPoint = transformsMatrix.transformVec3(new Vec3(0, startPoint.x * -width, startPoint.y * height));
    const worldEndPoint = transformsMatrix.transformVec3(new Vec3(0, endPoint.x * -width, endPoint.y * height));
    Instance.DebugLine({ start: worldStartPoint, end: worldEndPoint, duration });
  }
}

function linearInterpolate(a: CurvePoint, b: CurvePoint, t: number): CurvePoint {
  return a.add(b.subtract(a).multiply(t));
}

function quadraticBezierInterpolation(a: CurvePoint, b: CurvePoint, c: CurvePoint, t: number): CurvePoint {
  return linearInterpolate(linearInterpolate(a, b, t), linearInterpolate(b, c, t), t);
}

function cubicBezierInterpolation(a: CurvePoint, b: CurvePoint, c: CurvePoint, d: CurvePoint, t: number): CurvePoint {
  return linearInterpolate(quadraticBezierInterpolation(a, b, c, t), quadraticBezierInterpolation(b, c, d, t), t);
}

// taken from https://github.com/samisalreadytaken/vs_library
function computeIntersectionBarycentricCoordinates(
  rayStart: Vec3,
  rayEnd: Vec3,
  v1: Vec3,
  v2: Vec3,
  v3: Vec3,
): { u: number; v: number; t: number } | undefined {
  const edge1 = v2.subtract(v1);
  const edge2 = v3.subtract(v1);
  const rayDelta = rayEnd.subtract(rayStart);

  const dirCrossEdge2 = rayDelta.cross(edge2);

  let denom = dirCrossEdge2.dot(edge1);
  if (denom < 1e-6 && denom > -1e-6) return undefined;

  denom = 1.0 / denom;

  const org = rayStart.subtract(v1);
  const orgCrossEdge1 = org.cross(edge1);

  const t = orgCrossEdge1.dot(edge2) * denom;
  if (t > 1.0) return undefined;

  return {
    u: dirCrossEdge2.dot(org) * denom,
    v: orgCrossEdge1.dot(rayDelta) * denom,
    t,
  };
}
