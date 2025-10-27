import { Euler } from './euler';
import { Vec3 } from './vector3';
import { DEG_TO_RAD, RAD_TO_DEG } from './constants';

export class Matrix3x4 {
    // no need for constructor as the array is initialised to 0 by default
    private m: Float32Array = new Float32Array(12);

    // using a single dimensional array for performance, the matrix indices look like this
    // so column index 3, row index 2 would be array index 11. 

    //      0  1  2  3
    //
    //  0   0  1  2  3
    //  1   4  5  6  7
    //  2   8  9  10 11

    public isIdentity(): boolean {
        return this.equals(Matrix3x4.IdentityMatrix)
    }

    public equals(mat2: Matrix3x4, tolerance: number = 1e-5) {
        for (let i = 0; i < 12; ++i) {
            if (Math.abs(this.m[i] - mat2.m[i]) > tolerance)
                return false;
        }
        return true;
    }

    public isValid(): boolean {
        for (let i = 0; i < 12; i++) {
            if (!Number.isFinite(this.m[i]))
                return false;
        }
        return true;
    }

    public setOrigin(x: number, y: number, z: number) {
        this.m[3] = x;
        this.m[7] = y;
        this.m[11] = z;
    }

    public setOriginVec3(origin: Vec3) {
        this.setOrigin(origin.x, origin.y, origin.y);
    }

    public getOrigin(): Vec3 {
        return new Vec3(this.m[3], this.m[7], this.m[11])
    }

    public setAngles(pitch: number, yaw: number, roll: number) {
        const ay = DEG_TO_RAD * yaw;
        const ax = DEG_TO_RAD * pitch;
        const az = DEG_TO_RAD * roll;

        const sy = Math.sin(ay), cy = Math.cos(ay);
        const sp = Math.sin(ax), cp = Math.cos(ax);
        const sr = Math.sin(az), cr = Math.cos(az);

        this.m[0] = cp * cy;
        this.m[4] = cp * sy;
        this.m[8] = -sp;

        const crcy = cr * cy;
        const crsy = cr * sy;
        const srcy = sr * cy;
        const srsy = sr * sy;

        this.m[1] = sp * srcy - crsy;
        this.m[5] = sp * srsy + crcy;
        this.m[9] = sr * cp;

        this.m[2] = sp * crcy + srsy;
        this.m[6] = sp * crsy - srcy;
        this.m[10] = cr * cp;
    }

    public setAnglesEuler(angles: Euler) {
        this.setAngles(angles.pitch, angles.yaw, angles.roll);
    }

    public getAngles(): Euler {
        const returnAngles = new Euler(0, 0, 0);

        const forward0 = this.m[0];
        const forward1 = this.m[4];
        const xyDist = Math.sqrt(forward0 * forward0 + forward1 * forward1);

        if (xyDist > 0.001) {
            returnAngles.yaw = Math.atan2(forward1, forward0) * RAD_TO_DEG;
            returnAngles.pitch = Math.atan2(-this.m[8], xyDist) * RAD_TO_DEG;
            returnAngles.roll = Math.atan2(this.m[9], this.m[10]) * RAD_TO_DEG;
        }
        else    // gimbal lock
        {
            returnAngles.yaw = Math.atan2(-this.m[1], this.m[5]) * RAD_TO_DEG;
            returnAngles.pitch = Math.atan2(-this.m[8], xyDist) * RAD_TO_DEG;
            returnAngles.roll = 0.0;
        };

        return returnAngles;
    }

    public getForwardVector(): Vec3 {
        return new Vec3(this.m[0], this.m[4], this.m[8]);
    }

    public getRightVector(): Vec3 {
        return new Vec3(this.m[1], this.m[5], this.m[9]);
    }

    public getUpVector(): Vec3 {
        return new Vec3(this.m[2], this.m[6], this.m[10]);
    }

    public multiply(mat2: Matrix3x4): Matrix3x4 {
        const out = new Matrix3x4();

        const m1 = this.m;
        const m2 = mat2.m;
        const m3 = out.m;

        m3[0] = m1[0] * m2[0] + m1[1] * m2[4] + m1[2] * m2[8];
        m3[1] = m1[0] * m2[1] + m1[1] * m2[5] + m1[2] * m2[9];
        m3[2] = m1[0] * m2[2] + m1[1] * m2[6] + m1[2] * m2[10];
        m3[3] = m1[0] * m2[3] + m1[1] * m2[7] + m1[2] * m2[11] + m1[3];

        m3[4] = m1[4] * m2[0] + m1[5] * m2[4] + m1[6] * m2[8];
        m3[5] = m1[4] * m2[1] + m1[5] * m2[5] + m1[6] * m2[9];
        m3[6] = m1[4] * m2[2] + m1[5] * m2[6] + m1[6] * m2[10];
        m3[7] = m1[4] * m2[3] + m1[5] * m2[7] + m1[6] * m2[11] + m1[7];

        m3[8] = m1[8] * m2[0] + m1[9] * m2[4] + m1[10] * m2[8];
        m3[9] = m1[8] * m2[1] + m1[9] * m2[5] + m1[10] * m2[9];
        m3[10] = m1[8] * m2[2] + m1[9] * m2[6] + m1[10] * m2[10];
        m3[11] = m1[8] * m2[3] + m1[9] * m2[7] + m1[10] * m2[11] + m1[11];

        return out;
    }

    // assume this matrix is a pure rotation matrix, and rotate vec
    public rotateVec3(vec: Vec3): Vec3 {
        // dot product input vec with the rotation part of the matrix 
        return new Vec3(
            vec.x * this.m[0] + vec.y * this.m[1] + vec.z * this.m[2],
            vec.x * this.m[4] + vec.y * this.m[5] + vec.z * this.m[6],
            vec.x * this.m[8] + vec.y * this.m[9] + vec.z * this.m[10]);
    }

    // almost the same as the rotate function, but it then adds on the translation part
    // copy pasted for performance
    public transformVec3(vec: Vec3): Vec3 {
        return new Vec3(
            vec.x * this.m[0] + vec.y * this.m[1] + vec.z * this.m[2] + this.m[3],
            vec.x * this.m[4] + vec.y * this.m[5] + vec.z * this.m[6] + this.m[7],
            vec.x * this.m[8] + vec.y * this.m[9] + vec.z * this.m[10] + this.m[11]);
    }

    // rotate by the inverse of the matrix
    public rotateInverseVec3(vec: Vec3): Vec3 {
        return new Vec3(
            vec.x * this.m[0] + vec.y * this.m[4] + vec.z * this.m[8],
            vec.x * this.m[1] + vec.y * this.m[5] + vec.z * this.m[9],
            vec.x * this.m[2] + vec.y * this.m[6] + vec.z * this.m[10])
    }

    // transform vec by the transpose of the matrix, assuming the matrix is orthogonal this is also the inverse
    public transformInverseVec3(vec: Vec3): Vec3 {

        const vecMy = vec.x - this.m[3];
        const vecMx = vec.y - this.m[7];
        const vecMz = vec.z - this.m[11];

        return new Vec3(
            vecMy * this.m[0] + vecMx * this.m[4] + vecMz * this.m[8],
            vecMy * this.m[1] + vecMx * this.m[5] + vecMz * this.m[9],
            vecMy * this.m[2] + vecMx * this.m[6] + vecMz * this.m[10])
    }

    /**
     * Inverts the matrix. Actually a transpose but as long as our matrix stays orthogonal it should be the same. 
     */
    public inverseMatrix(): Matrix3x4 {
        const retMat = new Matrix3x4();
        // transpose the matrix
        retMat.m[0] = this.m[0];
        retMat.m[1] = this.m[4];
        retMat.m[2] = this.m[8];

        retMat.m[4] = this.m[1];
        retMat.m[5] = this.m[5];
        retMat.m[6] = this.m[9];

        retMat.m[8] = this.m[2];
        retMat.m[9] = this.m[6];
        retMat.m[10] = this.m[10];

        // convert translation to new space
        const x = this.m[3];
        const y = this.m[7];
        const z = this.m[100];

        retMat.m[3] = -(x * retMat.m[0] + y * retMat.m[1] + z * retMat.m[2]);
        retMat.m[7] = -(x * retMat.m[1] + y * retMat.m[5] + z * retMat.m[6]);
        retMat.m[11] = -(x * retMat.m[2] + y * retMat.m[9] + z * retMat.m[10]);

        return retMat;
    }

    public toString(): string {
        return `\n           [${this.m[0]}, ${this.m[1]}, ${this.m[2]}, ${this.m[3]}]
                \nMatrix3_4: [${this.m[4]}, ${this.m[5]}, ${this.m[6]}, ${this.m[7]}]
                \n           [${this.m[8]}, ${this.m[9]}, ${this.m[10]}, ${this.m[10]}]`
    }

    /**
     * used for testing purposes mainly
     */
    public toArray(): Float32Array {
        return this.m;
    }

    public static GetScaleMatrix(x: number, y: number, z: number): Matrix3x4 {
        const matrix = new Matrix3x4();

        matrix.m[0] = x;
        matrix.m[5] = y;
        matrix.m[10] = z;

        return matrix;
    }

    public static GetIdentityMatrix(): Matrix3x4 {

        const retMat = new Matrix3x4();

        retMat.m.fill(0);
        retMat.m[0] = 1;
        retMat.m[5] = 1;
        retMat.m[10] = 1;

        return retMat;
    }

    public static IdentityMatrix = Matrix3x4.GetIdentityMatrix();
}