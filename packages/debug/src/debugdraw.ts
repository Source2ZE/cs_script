import { Euler, Vec3, type Matrix3x4 } from '@s2ze/math';
import { Instance, type Color } from 'cs_script/point_script';

const DEF_DUR = 1;
const DEF_COL = { r: 255, g: 255, b: 255, a: 255 };

/** Draws a disk/circle in the world */
export function drawDisk(config: {
  origin: Vec3;
  radius: number;
  normal?: Vec3;
  segments?: number;
  duration?: number;
  color?: Color;
  offset?: number;
}) {
  const {
    origin,
    radius,
    normal = new Vec3(0, 0, 1),
    segments = 8,
    duration = DEF_DUR,
    color = DEF_COL,
    offset = 0 }
    = config;

  const arbitrary = Math.abs(normal.z) < 0.99 ? new Vec3(0, 0, 1) : new Vec3(1, 0, 0);
  const u = normal.cross(arbitrary).normal;
  const v = normal.cross(u).normal;

  const centerOffset = origin.add(normal.multiply(-offset));

  let prevPoint: Vec3 | null = null;

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const point = centerOffset
      .add(u.multiply(Math.cos(angle) * radius))
      .add(v.multiply(Math.sin(angle) * radius));

    if (prevPoint) {
      Instance.DebugLine({ start: prevPoint, end: point, duration, color });
    }
    Instance.DebugLine({ start: centerOffset, end: point, duration, color });

    prevPoint = point;
  }
}

/** Draws the 3 axis of a 3d transformation */
export function drawTransform(config: {
  origin: Vec3;
  up: Vec3;
  right: Vec3;
  forward: Vec3;
  duration?: number;
  size?: number;
}) {
  const { origin, up, right, forward, duration = DEF_DUR, size = 30 } = config;

  Instance.DebugLine({ start: origin, end: origin.add(up.multiply(size)), duration: duration,
    color: { r: 0, g: 0, b: 255 } });
  Instance.DebugLine({ start: origin, end: origin.add(right.multiply(size)), duration: duration,
    color: { r: 0, g: 255, b: 0 } });
  Instance.DebugLine({ start: origin, end: origin.add(forward.multiply(size)), duration: duration,
    color: { r: 255, g: 0, b: 0 } });
}

/** Draws the 3 axis of matrix transformation */
export function drawMatrix(config: {
  matrix: Matrix3x4;
  size?: number;
  duration?: number;
}) {
  const { matrix, duration = DEF_DUR, size = 30 } = config;

  const origin = matrix.origin;

  Instance.DebugLine({ start: origin, end: origin.add(matrix.up.multiply(size)), duration: duration,
    color: { r: 0, g: 0, b: 255 } });
  Instance.DebugLine({ start: origin, end: origin.add(matrix.right.multiply(size)), duration: duration,
    color: { r: 0, g: 255, b: 0 } });
  Instance.DebugLine({ start: origin, end: origin.add(matrix.forward.multiply(size)), duration: duration,
    color: { r: 255, g: 0, b: 0 } });
}

/** Draws a solid square in the world */
export function drawSolidSquare(config: {
  origin: Vec3;
  angle: Euler;
  color?: { r: number; g: number; b: number; a?: number };
  density?: number;
  size: number;
  duration?: number;
}) {
  const { origin, angle, color = DEF_COL, density = 10, size, duration = DEF_DUR } = config;

  const right = angle.right;
  const forward = angle.forward;
  const half = size / 2;
  const step = size / density;

  for (let i = 0; i <= density; i++) {
    const t = -half + i * step;

    const upOffset = forward.scale(t);
    const start = origin.add(right.scale(-half)).add(upOffset);
    const end = origin.add(right.scale(half)).add(upOffset);

    const rightOffset = right.scale(t);
    const start2 = origin.add(forward.scale(-half)).add(rightOffset);
    const end2 = origin.add(forward.scale(half)).add(rightOffset);

    Instance.DebugLine({ start, end, color, duration });
    Instance.DebugLine({ start: start2, end: end2, color, duration });
  }
}

/** Draws an 3D arrow. */
export function debugDrawArrow(config: {
  origin: Vec3;
  end: Vec3;
  arrowHeadLength?: number;
  arrowHeadWidth?: number;
  color?: { r: number; g: number; b: number; a?: number };
  density?: number;
  duration?: number;
}) {
  const {
    origin,
    end,
    arrowHeadLength = 10,
    arrowHeadWidth = 5,
    color = DEF_COL,
    density = 25,
    duration = DEF_DUR } = config;

  const dir = end.subtract(origin);
  const length = dir.length;
  if (length < 0.001) {
    return;
  }
  const forward = dir.normal;

  const worldRight = new Vec3(0, 1, 0);
  let right = forward.cross(worldRight);
  if (right.length < 0.001) right = forward.cross(new Vec3(0, 0, 1));
  right = right.normal;
  const up = forward.cross(right).normal;

  Instance.DebugLine({ start: origin, end: end, color, duration });

  const arrowBase = end.subtract(forward.multiply(arrowHeadLength));

  for (let i = 0; i < density; i++) {
    const angle = (i / density) * Math.PI * 2;
    const spokeDir = right.multiply(Math.cos(angle)).add(up.multiply(Math.sin(angle)));
    const spokeLeft = arrowBase.add(spokeDir.multiply(-arrowHeadWidth));
    const spokeRight = arrowBase.add(spokeDir.multiply(arrowHeadWidth));
    Instance.DebugLine({ start: end, end: spokeLeft, color, duration });
    Instance.DebugLine({ start: end, end: spokeRight, color, duration });
  }
}

const daFont: Record<string, number[][]> = {
  ' ': [],
  'A': [
    [0, 0, 2, 6],
    [2, 6, 4, 0],
    [1, 3, 3, 3],
  ],
  'B': [
    [0, 0, 0, 6],
    [0, 6, 2.5, 6],
    [2.5, 6, 3.5, 5],
    [3.5, 5, 3.5, 4],
    [3.5, 4, 2.5, 3],
    [2.5, 3, 0, 3],
    [2.5, 3, 3.5, 2],
    [3.5, 2, 3.5, 1],
    [3.5, 1, 2.5, 0],
    [2.5, 0, 0, 0],
  ],
  'C': [
    [3.5, 5, 2, 6],
    [2, 6, 1, 6],
    [1, 6, 0, 5],
    [0, 5, 0, 1],
    [0, 1, 1, 0],
    [1, 0, 2, 0],
    [2, 0, 3.5, 1],
  ],
  'D': [
    [0, 0, 0, 6],
    [0, 6, 2, 6],
    [2, 6, 3.5, 5],
    [3.5, 5, 3.5, 1],
    [3.5, 1, 2, 0],
    [2, 0, 0, 0],
  ],
  'E': [
    [0, 0, 0, 6],
    [0, 6, 4, 6],
    [0, 3, 3, 3],
    [0, 0, 4, 0],
  ],
  'F': [
    [0, 0, 0, 6],
    [0, 6, 4, 6],
    [0, 3, 3, 3],
  ],
  'G': [
    [3.5, 5, 2, 6],
    [2, 6, 1, 6],
    [1, 6, 0, 5],
    [0, 5, 0, 1],
    [0, 1, 1, 0],
    [1, 0, 2, 0],
    [2, 0, 3.5, 1],
    [3.5, 1, 3.5, 3],
    [3.5, 3, 2, 3],
  ],
  'H': [
    [0, 0, 0, 6],
    [4, 0, 4, 6],
    [0, 3, 4, 3],
  ],
  'I': [
    [1, 0, 3, 0],
    [2, 0, 2, 6],
    [1, 6, 3, 6],
  ],
  'J': [
    [0, 1, 1, 0],
    [1, 0, 3, 0],
    [3, 0, 3, 6],
    [1, 6, 3, 6],
  ],
  'K': [
    [0, 0, 0, 6],
    [4, 6, 0, 3],
    [0, 3, 4, 0],
  ],
  'L': [
    [0, 6, 0, 0],
    [0, 0, 4, 0],
  ],
  'M': [
    [0, 0, 0, 6],
    [0, 6, 2, 3],
    [2, 3, 4, 6],
    [4, 6, 4, 0],
  ],
  'N': [
    [0, 0, 0, 6],
    [0, 6, 4, 0],
    [4, 0, 4, 6],
  ],
  'O': [
    [1, 0, 0, 1],
    [0, 1, 0, 5],
    [0, 5, 1, 6],
    [1, 6, 3, 6],
    [3, 6, 4, 5],
    [4, 5, 4, 1],
    [4, 1, 3, 0],
    [3, 0, 1, 0],
  ],
  'P': [
    [0, 0, 0, 6],
    [0, 6, 3, 6],
    [3, 6, 4, 5],
    [4, 5, 4, 4],
    [4, 4, 3, 3],
    [3, 3, 0, 3],
  ],
  'Q': [
    [1, 0, 0, 1],
    [0, 1, 0, 5],
    [0, 5, 1, 6],
    [1, 6, 3, 6],
    [3, 6, 4, 5],
    [4, 5, 4, 1],
    [4, 1, 3, 0],
    [3, 0, 1, 0],
    [2.5, 1.5, 4, 0],
  ],
  'R': [
    [0, 0, 0, 6],
    [0, 6, 3, 6],
    [3, 6, 4, 5],
    [4, 5, 4, 4],
    [4, 4, 3, 3],
    [3, 3, 0, 3],
    [2, 3, 4, 0],
  ],
  'S': [
    [3.5, 5, 2, 6],
    [2, 6, 1, 6],
    [1, 6, 0, 5],
    [0, 5, 0, 4],
    [0, 4, 1, 3],
    [1, 3, 3, 3],
    [3, 3, 4, 2],
    [4, 2, 4, 1],
    [4, 1, 3, 0],
    [3, 0, 2, 0],
    [2, 0, 0.5, 1],
  ],
  'T': [
    [0, 6, 4, 6],
    [2, 6, 2, 0],
  ],
  'U': [
    [0, 6, 0, 1],
    [0, 1, 1, 0],
    [1, 0, 3, 0],
    [3, 0, 4, 1],
    [4, 1, 4, 6],
  ],
  'V': [
    [0, 6, 2, 0],
    [2, 0, 4, 6],
  ],
  'W': [
    [0, 6, 1, 0],
    [1, 0, 2, 3],
    [2, 3, 3, 0],
    [3, 0, 4, 6],
  ],
  'X': [
    [0, 6, 4, 0],
    [0, 0, 4, 6],
  ],
  'Y': [
    [0, 6, 2, 3],
    [4, 6, 2, 3],
    [2, 3, 2, 0],
  ],
  'Z': [
    [0, 6, 4, 6],
    [4, 6, 0, 0],
    [0, 0, 4, 0],
  ],
  'a': [
    [3, 4, 3, 0],
    [3, 4, 1, 4],
    [1, 4, 0, 3],
    [0, 3, 0, 1],
    [0, 1, 1, 0],
    [1, 0, 3, 0],
  ],
  'b': [
    [0, 6, 0, 0],
    [0, 3, 1, 4],
    [1, 4, 3, 4],
    [3, 4, 3.5, 3],
    [3.5, 3, 3.5, 1],
    [3.5, 1, 3, 0],
    [3, 0, 1, 0],
    [1, 0, 0, 0],
  ],
  'c': [
    [3, 3.5, 1.5, 4],
    [1.5, 4, 0, 3],
    [0, 3, 0, 1],
    [0, 1, 1.5, 0],
    [1.5, 0, 3, 1],
  ],
  'd': [
    [3, 6, 3, 0],
    [3, 3, 2, 4],
    [2, 4, 0, 4],
    [0, 4, 0, 1],
    [0, 1, 1, 0],
    [1, 0, 3, 0],
  ],
  'e': [
    [0, 2, 3.5, 2],
    [3.5, 2, 3.5, 3],
    [3.5, 3, 2, 4],
    [2, 4, 0, 3],
    [0, 3, 0, 1],
    [0, 1, 1.5, 0],
    [1.5, 0, 3.5, 1],
  ],
  'f': [
    [1, 0, 1, 5],
    [1, 5, 2, 6],
    [2, 6, 3, 5.5],
    [0, 3, 2.5, 3],
  ],
  'g': [
    [3.5, 4, 3.5, -2],
    [3.5, -2, 2, -2],
    [2, -2, 0, -1],
    [3.5, 4, 2, 4],
    [2, 4, 0, 3],
    [0, 3, 0, 1],
    [0, 1, 1, 0],
    [1, 0, 3.5, 0],
  ],
  'h': [
    [0, 6, 0, 0],
    [0, 3, 1, 4],
    [1, 4, 3, 4],
    [3, 4, 3, 0],
  ],
  'i': [
    [2, 5, 2, 5.8],
    [2, 3, 2, 0],
  ],
  'j': [
    [2, 5, 2, 5.8],
    [2, 3, 2, -1],
    [2, -1, 1, -2],
    [1, -2, 0, -2],
  ],
  'k': [
    [0, 6, 0, 0],
    [0, 2, 3, 4],
    [1.5, 2, 3, 0],
  ],
  'l': [
    [2, 6, 2, 0],
    [2, 0, 3, 0],
  ],
  'm': [
    [0, 4, 0, 0],
    [0, 3, 1, 4],
    [1, 4, 2, 3],
    [2, 3, 2, 0],
    [2, 3, 3, 4],
    [3, 4, 4, 3],
    [4, 3, 4, 0],
  ],
  'n': [
    [0, 4, 0, 0],
    [0, 3, 1, 4],
    [1, 4, 3, 4],
    [3, 4, 3, 0],
  ],
  'o': [
    [1, 0, 0, 1],
    [0, 1, 0, 3],
    [0, 3, 1, 4],
    [1, 4, 3, 4],
    [3, 4, 3.5, 3],
    [3.5, 3, 3.5, 1],
    [3.5, 1, 3, 0],
    [3, 0, 1, 0],
  ],
  'p': [
    [0, 4, 0, -2],
    [0, 3, 1, 4],
    [1, 4, 3, 4],
    [3, 4, 3.5, 3],
    [3.5, 3, 3.5, 1],
    [3.5, 1, 3, 0],
    [3, 0, 1, 0],
    [1, 0, 0, 0],
  ],
  'q': [
    [3.5, 4, 3.5, -2],
    [3.5, -2, 2, -2],
    [3.5, 3, 2, 4],
    [2, 4, 0, 4],
    [0, 4, 0, 1],
    [0, 1, 1, 0],
    [1, 0, 3.5, 0],
  ],
  'r': [
    [0, 4, 0, 0],
    [0, 3, 1, 4],
    [1, 4, 2.5, 4],
    [2.5, 4, 3.5, 3],
  ],
  's': [
    [3, 3.5, 1.5, 4],
    [1.5, 4, 0, 3],
    [0, 3, 0, 2.5],
    [0, 2.5, 1.5, 2],
    [1.5, 2, 3, 2],
    [3, 2, 3.5, 1],
    [3.5, 1, 3.5, 0.5],
    [3.5, 0.5, 2, 0],
    [2, 0, 0, 0.5],
  ],
  't': [
    [2, 6, 2, 0],
    [0, 4, 3.5, 4],
    [2, 0, 3.5, 0],
  ],
  'u': [
    [0, 4, 0, 1],
    [0, 1, 1, 0],
    [1, 0, 3, 0],
    [3, 0, 3, 4],
  ],
  'v': [
    [0, 4, 2, 0],
    [2, 0, 4, 4],
  ],
  'w': [
    [0, 4, 1, 0],
    [1, 0, 2, 2],
    [2, 2, 3, 0],
    [3, 0, 4, 4],
  ],
  'x': [
    [0, 4, 3.5, 0],
    [0, 0, 3.5, 4],
  ],
  'y': [
    [0, 4, 2, 0],
    [4, 4, 1, -2],
    [1, -2, 0, -2],
  ],
  'z': [
    [0, 4, 3.5, 4],
    [3.5, 4, 0, 0],
    [0, 0, 3.5, 0],
  ],
  '0': [
    [1, 0, 0, 1],
    [0, 1, 0, 5],
    [0, 5, 1, 6],
    [1, 6, 3, 6],
    [3, 6, 4, 5],
    [4, 5, 4, 1],
    [4, 1, 3, 0],
    [3, 0, 1, 0],
    [1, 1.5, 3, 4.5],
  ],
  '1': [
    [1, 5, 2, 6],
    [2, 6, 2, 0],
    [0, 0, 4, 0],
  ],
  '2': [
    [0, 5, 1, 6],
    [1, 6, 3, 6],
    [3, 6, 4, 5],
    [4, 5, 4, 4],
    [4, 4, 0, 0],
    [0, 0, 4, 0],
  ],
  '3': [
    [0, 5, 1, 6],
    [1, 6, 3, 6],
    [3, 6, 4, 5],
    [4, 5, 4, 4],
    [4, 4, 3, 3],
    [3, 3, 1, 3],
    [3, 3, 4, 2],
    [4, 2, 4, 1],
    [4, 1, 3, 0],
    [3, 0, 1, 0],
    [1, 0, 0, 1],
  ],
  '4': [
    [3, 0, 3, 6],
    [3, 6, 0, 2],
    [0, 2, 4, 2],
  ],
  '5': [
    [4, 6, 0, 6],
    [0, 6, 0, 3],
    [0, 3, 3, 3],
    [3, 3, 4, 2],
    [4, 2, 4, 1],
    [4, 1, 3, 0],
    [3, 0, 1, 0],
    [1, 0, 0, 1],
  ],
  '6': [
    [3, 6, 1, 6],
    [1, 6, 0, 5],
    [0, 5, 0, 1],
    [0, 1, 1, 0],
    [1, 0, 3, 0],
    [3, 0, 4, 1],
    [4, 1, 4, 2],
    [4, 2, 3, 3],
    [3, 3, 0, 3],
  ],
  '7': [
    [0, 6, 4, 6],
    [4, 6, 2, 3],
    [2, 3, 2, 0],
  ],
  '8': [
    [1, 3, 0, 4],
    [0, 4, 0, 5],
    [0, 5, 1, 6],
    [1, 6, 3, 6],
    [3, 6, 4, 5],
    [4, 5, 4, 4],
    [4, 4, 3, 3],
    [3, 3, 1, 3],
    [1, 3, 0, 2],
    [0, 2, 0, 1],
    [0, 1, 1, 0],
    [1, 0, 3, 0],
    [3, 0, 4, 1],
    [4, 1, 4, 2],
    [4, 2, 3, 3],
  ],
  '9': [
    [1, 3, 0, 4],
    [0, 4, 0, 5],
    [0, 5, 1, 6],
    [1, 6, 3, 6],
    [3, 6, 4, 5],
    [4, 3, 1, 3],
    [0, 1, 1, 0],
    [1, 0, 3, 0],
    [3, 0, 4, 1],
    [4, 1, 4, 5],
  ],
  '.': [
    [1.5, 0, 2, 0],
    [2, 0, 2, 0.5],
    [2, 0.5, 1.5, 0.5],
    [1.5, 0.5, 1.5, 0],
  ],
  ',': [
    [1.5, 0.5, 2, 0.5],
    [2, 0.5, 2, 0],
    [2, 0, 1.5, -0.5],
  ],
  '!': [
    [2, 6, 2, 2],
    [1.5, 0, 2, 0],
    [2, 0, 2, 0.5],
    [2, 0.5, 1.5, 0.5],
    [1.5, 0.5, 1.5, 0],
  ],
  '?': [
    [0, 5, 1, 6],
    [1, 6, 3, 6],
    [3, 6, 4, 5],
    [4, 5, 4, 4],
    [4, 4, 2, 2],
    [2, 2, 2, 1.5],
    [1.5, 0, 2, 0],
    [2, 0, 2, 0.5],
    [2, 0.5, 1.5, 0.5],
    [1.5, 0.5, 1.5, 0],
  ],
  ':': [
    [1.5, 1, 2, 1],
    [2, 1, 2, 1.5],
    [2, 1.5, 1.5, 1.5],
    [1.5, 1.5, 1.5, 1],
    [1.5, 3, 2, 3],
    [2, 3, 2, 3.5],
    [2, 3.5, 1.5, 3.5],
    [1.5, 3.5, 1.5, 3],
  ],
  ';': [
    [1.5, 0.5, 2, 0.5],
    [2, 0.5, 2, 0],
    [2, 0, 1.5, -0.5],
    [1.5, 3, 2, 3],
    [2, 3, 2, 3.5],
    [2, 3.5, 1.5, 3.5],
    [1.5, 3.5, 1.5, 3],
  ],
  '+': [
    [2, 1, 2, 5],
    [0, 3, 4, 3],
  ],
  '-': [[0, 3, 4, 3]],
  '*': [
    [2, 2, 2, 5],
    [0.5, 2.5, 3.5, 4.5],
    [3.5, 2.5, 0.5, 4.5],
  ],
  '/': [[3.5, 6, 0.5, 0]],
  '=': [
    [0, 4, 4, 4],
    [0, 2, 4, 2],
  ],
  '<': [
    [4, 5, 0, 3],
    [0, 3, 4, 1],
  ],
  '>': [
    [0, 5, 4, 3],
    [4, 3, 0, 1],
  ],
  '(': [
    [3, 6, 1, 5],
    [1, 5, 1, 1],
    [1, 1, 3, 0],
  ],
  ')': [
    [1, 6, 3, 5],
    [3, 5, 3, 1],
    [3, 1, 1, 0],
  ],
  '[': [
    [3, 6, 1, 6],
    [1, 6, 1, 0],
    [1, 0, 3, 0],
  ],
  ']': [
    [1, 6, 3, 6],
    [3, 6, 3, 0],
    [3, 0, 1, 0],
  ],
  '{': [
    [3, 6, 2, 5.5],
    [2, 5.5, 2, 3.5],
    [2, 3.5, 1, 3],
    [1, 3, 2, 2.5],
    [2, 2.5, 2, 0.5],
    [2, 0.5, 3, 0],
  ],
  '}': [
    [1, 6, 2, 5.5],
    [2, 5.5, 2, 3.5],
    [2, 3.5, 3, 3],
    [3, 3, 2, 2.5],
    [2, 2.5, 2, 0.5],
    [2, 0.5, 1, 0],
  ],
  '@': [
    [3.5, 2, 3, 1],
    [3, 1, 2, 0],
    [2, 0, 1, 0],
    [1, 0, 0, 1],
    [0, 1, 0, 4],
    [0, 4, 1, 5],
    [1, 5, 2, 5],
    [2, 5, 3, 4],
    [3, 4, 3.5, 3],
    [3.5, 3, 3.5, 2],
    [3.5, 2, 2, 2],
    [2, 2, 2, 4],
    [2, 4, 3.5, 4],
  ],
  '#': [
    [1, 0, 1, 6],
    [3, 0, 3, 6],
    [0, 4, 4, 4],
    [0, 2, 4, 2],
  ],
  '%': [
    [0, 0, 4, 6],
    [1, 5, 1, 6],
    [1, 6, 0, 6],
    [0, 6, 0, 5],
    [0, 5, 1, 5],
    [3, 0, 3, 1],
    [3, 1, 4, 1],
    [4, 1, 4, 0],
    [4, 0, 3, 0],
  ],
  '^': [
    [1, 4, 2, 6],
    [2, 6, 3, 4],
  ],
  '&': [
    [4, 0, 1, 3],
    [1, 3, 0, 4],
    [0, 4, 0, 5],
    [0, 5, 1, 6],
    [1, 6, 2, 5],
    [2, 5, 0, 2],
    [0, 2, 0, 1],
    [0, 1, 1, 0],
    [1, 0, 3, 0],
    [3, 0, 4, 1],
  ],
  '_': [[0, 0, 4, 0]],
  '|': [[2, 0, 2, 6]],
  '~': [
    [0, 3, 1, 4],
    [1, 4, 3, 2],
    [3, 2, 4, 3],
  ],
  '"': [
    [1, 4, 1, 6],
    [3, 4, 3, 6],
  ],
  '\'': [[2, 4, 2, 6]],
  '`': [[1, 6, 2, 5]],
  '\\': [[0.5, 6, 3.5, 0]],
  '→': [
    [0, 3, 4, 3],
    [4, 3, 2, 5],
    [4, 3, 2, 1],
  ],
  '←': [
    [4, 3, 0, 3],
    [0, 3, 2, 5],
    [0, 3, 2, 1],
  ],
  '↑': [
    [2, 0, 2, 6],
    [2, 6, 0, 4],
    [2, 6, 4, 4],
  ],
  '↓': [
    [2, 6, 2, 0],
    [2, 0, 0, 2],
    [2, 0, 4, 2],
  ],
  '↗': [
    [0, 0, 4, 4],
    [4, 4, 4, 1],
    [4, 4, 1, 4],
  ],
  '↘': [
    [0, 4, 4, 0],
    [4, 0, 4, 3],
    [4, 0, 1, 0],
  ],
  '↙': [
    [4, 4, 0, 0],
    [0, 0, 0, 3],
    [0, 0, 3, 0],
  ],
  '↖': [
    [4, 0, 0, 4],
    [0, 4, 0, 1],
    [0, 4, 3, 4],
  ],
  '↔': [
    [0, 3, 4, 3],
    [4, 3, 2, 5],
    [4, 3, 2, 1],
    [0, 3, 2, 5],
    [0, 3, 2, 1],
  ],
  '↕': [
    [2, 0, 2, 6],
    [2, 6, 0, 4],
    [2, 6, 4, 4],
    [2, 0, 0, 2],
    [2, 0, 4, 2],
  ],
};

const charWidth = 4;
const charSpace = 1;
const lineHeight = 9;
const CELL = charWidth + charSpace;

export interface Debug3DTextDrawOptions {
  text: string;
  origin: Vec3;
  angles: Euler;
  scale?: number;
  duration?: number;
  color?: Color;
}

/** Draw text in the world. */
function draw(options: Debug3DTextDrawOptions): void {
  const {
    text,
    origin,
    angles,
    scale = 1,
    duration = 5,
    color = { r: 255, g: 255, b: 255, a: 255 },
  } = options;

  const lines = text.split('\n');
  const right = angles.right;
  const down = angles.down;
  const totalHeight = (lines.length - 1) * lineHeight;
  const topOffset = totalHeight / 2;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const totalWidth = line.length * CELL - charSpace;
    const offsetX = totalWidth / 2;
    const offsetY = 3 - (topOffset - lineIndex * lineHeight);

    const project = (fx: number, fy: number): Vec3 =>
      origin
        .add(right.scale((fx - offsetX) * scale))
        .add(down.scale(-(fy - offsetY) * scale));

    let cursorX = 0;

    for (const ch of line) {
      const strokes = daFont[ch] ?? daFont['?']!;

      for (const [x1, y1, x2, y2] of strokes) {
        const start = project(cursorX + x1, y1);
        const end = project(cursorX + x2, y2);
        Instance.DebugLine({ start, end, duration, color });
      }

      cursorX += CELL;
    }
  }
}

/** Draw text in the world. */
export const Debug3DText = { draw };
