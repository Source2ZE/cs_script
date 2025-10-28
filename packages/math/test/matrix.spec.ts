import { describe, expect, it } from '@jest/globals';
import { Matrix3x4, Vec3 } from '../src';

// matrix layout
//
//      0  1  2  3
//
//  0   0  1  2  3
//  1   4  5  6  7
//  2   8  9  10 11

describe('Matrix3x4 class', () => {
  describe('constructor', () => {
    it('creates an identity Matrix3x4', () => {
      const matrix = new Matrix3x4();
      expect(matrix.toArray()).toEqual(
        new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0]),
      );
    });
  });

  describe('equals', () => {
    it('checks for matrix equality', () => {
      const m1 = new Matrix3x4();
      const m2 = new Matrix3x4();

      m1.setOrigin(0, 1, 2);
      m1.setAngles(10, 20, 30);

      m2.setOrigin(0, 1, 2);
      m2.setAngles(10, 20, 30);

      expect(m1.equals(m2)).toEqual(true);
    });
  });

  describe('isValid', () => {
    it('checks if the matrix is valid, no NaN or infinite numbers', () => {
      const mat = new Matrix3x4();

      mat.setOrigin(NaN, 1, 2);
      expect(mat.isValid).toEqual(false);

      mat.setOrigin(Infinity, 1, 2);
      expect(mat.isValid).toEqual(false);

      mat.setOrigin(0, 1, 2);
      expect(mat.isValid).toEqual(true);
    });
  });

  describe('origin round trip', () => {
    it('checks if we get the same origin we set', () => {
      const mat = new Matrix3x4();

      mat.setOrigin(10, 50, 100);
      const origin = mat.origin;

      expect(origin.x).toBeCloseTo(10);
      expect(origin.y).toBeCloseTo(50);
      expect(origin.z).toBeCloseTo(100);
    });
  });

  describe('angles round trip', () => {
    it('checks if we get the same angles we set', () => {
      const mat = new Matrix3x4();

      mat.setAngles(30, 90, 180);
      const angles = mat.angles;

      expect(angles.pitch).toBeCloseTo(30);
      expect(angles.yaw).toBeCloseTo(90);
      expect(angles.roll).toBeCloseTo(180);
    });
  });

  describe('set/get forward angles', () => {
    it('checks if we get the same angles we set and if the matrix stays orthogonal', () => {
      const mat = new Matrix3x4();

      mat.forward = new Vec3(1, 0, 0);

      expect(mat.angles.pitch).toBeCloseTo(0);
      expect(mat.angles.yaw).toBeCloseTo(0);
      expect(mat.angles.roll).toBeCloseTo(0);

      expect(mat.isValid).toBe(true);

      mat.forward = new Vec3(0, 1, 0);

      expect(mat.angles.pitch).toBeCloseTo(0);
      expect(mat.angles.yaw).toBeCloseTo(90);
      expect(mat.angles.roll).toBeCloseTo(0);

      expect(mat.isValid).toBe(true);

      mat.forward = new Vec3(0, 0, 1);

      expect(mat.angles.pitch).toBeCloseTo(-90);
      expect(mat.angles.yaw).toBeCloseTo(0);
      expect(mat.angles.roll).toBeCloseTo(0);

      expect(mat.isValid).toBe(true);
    });
  });

  describe('set/get right angles', () => {
    it('checks if we get the same angles we set and if the matrix stays orthogonal', () => {
      const mat = new Matrix3x4();

      mat.right = new Vec3(0, 1, 0);

      expect(mat.angles.pitch).toBeCloseTo(0);
      expect(mat.angles.yaw).toBeCloseTo(0);
      expect(mat.angles.roll).toBeCloseTo(0);

      expect(mat.isValid).toBe(true);

      mat.right = new Vec3(0, 0, 1);

      expect(mat.angles.pitch).toBeCloseTo(0);
      expect(mat.angles.yaw).toBeCloseTo(-90);
      expect(mat.angles.roll).toBeCloseTo(90);

      expect(mat.isValid).toBe(true);

      mat.right = new Vec3(1, 0, 0);

      expect(mat.angles.pitch).toBeCloseTo(0);
      expect(mat.angles.yaw).toBeCloseTo(-90);
      expect(mat.angles.roll).toBeCloseTo(0);

      expect(mat.isValid).toBe(true);
    });
  });

  describe('set/get up angles', () => {
    it('checks if we get the same angles we set and if the matrix stays orthogonal', () => {
      const mat = new Matrix3x4();

      mat.up = new Vec3(0, 0, 1);

      expect(mat.angles.pitch).toBeCloseTo(0);
      expect(mat.angles.yaw).toBeCloseTo(0);
      expect(mat.angles.roll).toBeCloseTo(0);

      expect(mat.isValid).toBe(true);

      mat.up = new Vec3(1, 0, 0);

      expect(mat.angles.pitch).toBeCloseTo(0);
      expect(mat.angles.yaw).toBeCloseTo(-90);
      expect(mat.angles.roll).toBeCloseTo(-90);

      expect(mat.isValid).toBe(true);

      mat.up = new Vec3(0, 1, 0);

      expect(mat.angles.pitch).toBeCloseTo(0);
      expect(mat.angles.yaw).toBeCloseTo(0);
      expect(mat.angles.roll).toBeCloseTo(-90);

      expect(mat.isValid).toBe(true);
    });
  });

  //ground truth is doing these rotations in hammer and verifying the code matches the results
  describe('transform 90 deg pitch rotation', () => {
    it('checks if we get the correct position output', () => {
      const mat = new Matrix3x4();

      mat.setOrigin(10, 50, 100);
      mat.setAngles(90, 0, 0);

      const originalPos = new Vec3(0, 128, 0);
      const transformedPos = mat.transformVec3(originalPos);

      expect(transformedPos.x).toBeCloseTo(10);
      expect(transformedPos.y).toBeCloseTo(178);
      expect(transformedPos.z).toBeCloseTo(100);
    });
  });

  describe('transform 90 deg yaw rotation', () => {
    it('checks if we get the correct position output', () => {
      const mat = new Matrix3x4();

      mat.setOrigin(10, 50, 100);
      mat.setAngles(0, 90, 0);

      const originalPos = new Vec3(0, 128, 0);
      const transformedPos = mat.transformVec3(originalPos);

      expect(transformedPos.x).toBeCloseTo(-118);
      expect(transformedPos.y).toBeCloseTo(50);
      expect(transformedPos.z).toBeCloseTo(100);
    });
  });

  describe('transform 90 deg roll rotation', () => {
    it('checks if we get the correct position output', () => {
      const mat = new Matrix3x4();

      mat.setOrigin(10, 50, 100);
      mat.setAngles(0, 0, 90);

      const originalPos = new Vec3(0, 128, 0);
      const transformedPos = mat.transformVec3(originalPos);

      expect(transformedPos.x).toBeCloseTo(10);
      expect(transformedPos.y).toBeCloseTo(50);
      expect(transformedPos.z).toBeCloseTo(228);
    });
  });

  describe('matrix multiply 90 deg roll * 100 unit z translation', () => {
    it('checks that matrix multiplication works correctly', () => {
      const mat1 = new Matrix3x4();
      mat1.setOrigin(0, 0, 0);
      mat1.setAngles(0, 0, 90);

      const mat2 = new Matrix3x4();
      mat2.setOrigin(0, 0, 100);
      mat2.setAngles(0, 0, 0);

      const multipliedMatrix = mat1.multiply(mat2);

      const multipliedOrigin = multipliedMatrix.origin;

      expect(multipliedOrigin.x).toBeCloseTo(0);
      expect(multipliedOrigin.y).toBeCloseTo(-100);
      expect(multipliedOrigin.z).toBeCloseTo(0);
    });
  });

  describe('matrix multiply 90 deg pitch * 90 deg pitch', () => {
    it('checks that matrix multiplication works correctly', () => {
      const mat1 = new Matrix3x4();
      mat1.setAngles(90, 0, 0);

      const mat2 = new Matrix3x4();
      mat2.setAngles(90, 0, 0);

      const multipliedMatrix = mat1.multiply(mat2);

      const multipliedAngles = multipliedMatrix.angles;

      expect(multipliedAngles.pitch).toBeCloseTo(0);
      expect(multipliedAngles.yaw).toBeCloseTo(180);
      expect(multipliedAngles.roll).toBeCloseTo(180);
    });
  });

  // trust the values bro theyre correct i promise bro
  describe('complex matrices multiplied', () => {
    it('checks that matrix multiplication works correctly', () => {
      const mat1 = new Matrix3x4();
      mat1.setAngles(90, 45, 10);
      mat1.setOrigin(10, 20, 30);

      const mat2 = new Matrix3x4();
      mat2.setAngles(20, 30, 50);
      mat1.setOrigin(100, 50, 10);

      const multipliedMatrix = mat1.multiply(mat2);

      const multipliedAngles = multipliedMatrix.angles;
      const multipliedOrigin = multipliedMatrix.origin;

      expect(multipliedAngles.pitch).toBeCloseTo(54.46864954);
      expect(multipliedAngles.yaw).toBeCloseTo(161.0523901);
      expect(multipliedAngles.roll).toBeCloseTo(170.64234195);

      expect(multipliedOrigin.x).toBeCloseTo(100);
      expect(multipliedOrigin.y).toBeCloseTo(50);
      expect(multipliedOrigin.z).toBeCloseTo(10);
    });
  });

  describe('matrix inverse', () => {
    it('checks that matrix inverse * original matrix = identity matrix', () => {
      const mat = new Matrix3x4();

      mat.setOrigin(10, 50, 100);
      mat.setAngles(10, 30, 90);

      const inverseMat = mat.inverse;

      const originalTimesInverse = mat.multiply(inverseMat);

      expect(originalTimesInverse.isIdentity).toBe(true);
    });
  });

  describe('get scale matrix', () => {
    it('checks that scaling matrices are correct', () => {
      const mat = Matrix3x4.getScaleMatrix(2, 4, 8);

      expect(mat.toArray()).toEqual(
        new Float32Array([2, 0, 0, 0, 0, 4, 0, 0, 0, 0, 8, 0]),
      );
    });
  });

  describe('multiply with scale matrix', () => {
    it('checks that multiplying with scaling matrices is correct', () => {
      const mat1 = Matrix3x4.getScaleMatrix(2, 4, 8);

      const mat2 = new Matrix3x4();
      mat2.setOrigin(50, 100, 200);
      mat2.setAngles(15, 30, 90);

      const multipliedMatrix = mat1.multiply(mat2);

      const multipliedAngles = multipliedMatrix.angles;
      const multipliedOrigin = multipliedMatrix.origin;

      expect(multipliedOrigin.x).toBeCloseTo(100);
      expect(multipliedOrigin.y).toBeCloseTo(400);
      expect(multipliedOrigin.z).toBeCloseTo(1600);

      expect(multipliedAngles.pitch).toBeCloseTo(39.0144672440907);
      expect(multipliedAngles.yaw).toBeCloseTo(49.106604377471776);
      expect(multipliedAngles.roll).toBeCloseTo(90);
    });
  });
});
