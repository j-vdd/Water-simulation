"use strict";
class Vec4 {
	static mult(m, inp) {
		const out = [];
		out[0] = m[0 ]*inp[0] + m[1 ]*inp[1] + m[2 ]*inp[2] + m[3 ]*inp[3];
		out[1] = m[4 ]*inp[0] + m[5 ]*inp[1] + m[6 ]*inp[2] + m[7 ]*inp[3];
		out[2] = m[8 ]*inp[0] + m[9 ]*inp[1] + m[10]*inp[2] + m[11]*inp[3];
		out[3] = m[12]*inp[0] + m[13]*inp[1] + m[14]*inp[2] + m[15]*inp[3];
		return out;
	}
}
class Vec3 {
	static normalize(v) {
		const l = 1/Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
		v[0] *= l;
		v[1] *= l;
		v[2] *= l;
		return v;
	}
	
	static cross(v1, v2) {
		const ret = [];
		ret[0] = v1[1]*v2[2] - v1[2]*v2[1];
		ret[1] = v1[2]*v2[0] - v1[0]*v2[2];
		ret[2] = v1[0]*v2[1] - v1[1]*v2[0];
		return ret;
	}
}

class Mat4 {
	static create() {
		const ret = new Float32Array(16);
		ret[0] = 1;
		ret[5] = 1;
		ret[10] = 1;
		ret[15] = 1;
		return ret;
	}
	
	static set(out, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15) {
		out[0] = v0;
		out[1] = v1;
		out[2] = v2;
		out[3] = v3;
		out[4] = v4;
		out[5] = v5;
		out[6] = v6;
		out[7] = v7;
		out[8] = v8;
		out[9] = v9;
		out[10] = v10;
		out[11] = v11;
		out[12] = v12;
		out[13] = v13;
		out[14] = v14;
		out[15] = v15;
		return out;
	}
	
	static identity(out) {
		Mat4.set(
			out, 
			1, 0, 0, 0, 
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		);
		return out;
	}
	
	static perspective(out, fov, aspect, n, f) {
		const S = 1/(Math.tan(fov/2)*aspect);
		Mat4.set(out,
			S, 0, 0, 0,
			0, S*aspect, 0, 0,
			0, 0, -(f+n)/(f-n), -1,
			0, 0, -2*f*n/(f-n), 0
		);
		return out;
	}
	
	static mult(out, m2, m1) {
		const ni = Vec4.mult(m1, [m2[0], m2[4], m2[8], m2[12]]);
		const nj = Vec4.mult(m1, [m2[1], m2[5], m2[9], m2[13]]);
		const nk = Vec4.mult(m1, [m2[2], m2[6], m2[10], m2[14]]);
		const nl = Vec4.mult(m1, [m2[3], m2[7], m2[11], m2[15]]);
		Mat4.set(out,
			ni[0], nj[0], nk[0], nl[0],
			ni[1], nj[1], nk[1], nl[1],
			ni[2], nj[2], nk[2], nl[2],
			ni[3], nj[3], nk[3], nl[3]
		);
		return out;
	}
	static mult4(out, m1, m2, m3, m4) {
		const nm1 = Mat4.mult(Mat4.create(), m1, m2);
		const nm2 = Mat4.mult(Mat4.create(), m3, m4);
		Mat4.mult(out, nm1, nm2);
		return out;
	}
	
	static fpsCamera(out, translation, rotation) {
		const xRot = Mat4.rotationX(Mat4.create(), -rotation[0]);
		const yRot = Mat4.rotationY(Mat4.create(), -rotation[1]);
		const zRot = Mat4.rotationZ(Mat4.create(), -rotation[2]);
		const translate = Mat4.translation(Mat4.create(), -translation[0], -translation[1], -translation[2]);
		
		Mat4.mult4(out, zRot, xRot, yRot, translate);
		//zRot, xRot, yRot, translate
		return out;
	}
	static modelMatrix(out, translation, rotation) {
		const xRot = Mat4.rotationX(Mat4.create(), rotation[0]);
		const yRot = Mat4.rotationY(Mat4.create(), rotation[1]);
		const zRot = Mat4.rotationZ(Mat4.create(), rotation[2]);
		const translate = Mat4.translation(Mat4.create(), translation[0], translation[1], translation[2]);

		Mat4.mult4(out, translate, zRot, xRot, yRot);
		return out;
	}
	
	static translation(out, x, y, z) {
		Mat4.set(out, 
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			x, y, z, 1
		);
		return out;
	}
	
	static rotationX(out, a) {
		const s = Math.sin(a);
		const c = Math.cos(a);
		
		Mat4.set(out, 
			1, 0, 0, 0,
			0, c,-s, 0,
			0, s, c, 0,
			0, 0, 0, 1
		);
		return out;
	}
	static rotationY(out, a) {
		const s = Math.sin(a);
		const c = Math.cos(a);
		
		Mat4.set(out, 
			c, 0,-s, 0,
			0, 1, 0, 0,
			s, 0, c, 0,
			0, 0, 0, 1
		);
		return out;
	}
	static rotationZ(out, a) {
		const s = Math.sin(a);
		const c = Math.cos(a);
		
		Mat4.set(out, 
			c,-s, 0, 0,
			s, c, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		);
		return out;
	}
}