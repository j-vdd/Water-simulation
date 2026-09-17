"use strict";
class PerlinNoise3d {
    constructor(width, height, depth) {
        this.nRandoms = width*height*depth;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.randomX = new Float32Array(this.nRandoms);
        this.randomY = new Float32Array(this.nRandoms);
        this.randomZ = new Float32Array(this.nRandoms);

        let randomVector, vectorLength;
        for (let i = 0; i < this.nRandoms; i++) {
            randomVector = [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5];
            vectorLength = 1/Math.sqrt(randomVector[0] ** 2 + randomVector[1] ** 2 + randomVector[2] ** 2);
            this.randomX[i] = randomVector[0] * vectorLength;
            this.randomY[i] = randomVector[1] * vectorLength;
            this.randomZ[i] = randomVector[2] * vectorLength;
        }
    }

    interpolate(a0, a1, w) {
        //return (a1 - a0) * w + a0; //linear
        //return (a1 - a0) * (3.0 - w * 2.0) * w * w + a0; //cubic
        return (a1 - a0) * ((w * (w * 6.0 - 15.0) + 10.0) * w * w * w) + a0; //quintic
    }

    dotGridGradient(ix, iy, iz, x, y, z) {
        const index = iz*this.width*this.height + iy*this.width + ix;
        const dx = x - ix;
        const dy = y - iy;
        const dz = z - iz;
        return dx*this.randomX[index] + dy*this.randomY[index] + dz*this.randomZ[index];
    }

    getSample(x, y, z) {
        /*if(x < 0 || y < 0 || z < 0 || x+1 >= this.width || y+1 >= this.height || z+1 >= this.depth) {
            alert();asdfs
        }*/
        const x0 = Math.floor(x);
        const y0 = Math.floor(y);
        const z0 = Math.floor(z);
        const x1 = x0 + 1;
        const y1 = y0 + 1;
        const z1 = z0 + 1;

        const sx = x - x0;
        const sy = y - y0;
        const sz = z - z0;

        let n0, n1, m0, m1, o0, o1;

        m0 = this.dotGridGradient(x0, y0, z0, x, y, z);
        m1 = this.dotGridGradient(x1, y0, z0, x, y, z);
        n0 = this.interpolate(m0, m1, sx);

        m0 = this.dotGridGradient(x0, y1, z0, x, y, z);
        m1 = this.dotGridGradient(x1, y1, z0, x, y, z);
        n1 = this.interpolate(m0, m1, sx);

        o0 = this.interpolate(n0, n1, sy);


        m0 = this.dotGridGradient(x0, y0, z1, x, y, z);
        m1 = this.dotGridGradient(x1, y0, z1, x, y, z);
        n0 = this.interpolate(m0, m1, sx);

        m0 = this.dotGridGradient(x0, y1, z1, x, y, z);
        m1 = this.dotGridGradient(x1, y1, z1, x, y, z);
        n1 = this.interpolate(m0, m1, sx);

        o1 = this.interpolate(n0, n1, sy);

        return this.interpolate(o0, o1, sz);
    }
}