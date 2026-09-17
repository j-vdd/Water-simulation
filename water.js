"use strict";

const DT = 0.1;
const GRAVITY = -0.4;
const FRICTION = 0.99;

class Water {
    constructor(values, width, height, depth, maxParticles) {
        this.mesh = new Mesh(
            [
                0, 25, 0,
                width, 25, 0,
                width, 25, depth,
                0, 25, depth
            ],
            [0, 1, 2, 0, 2, 3, 2, 1, 0, 3, 2, 0],
            [0, 0, 1, 0.5, 0, 0, 1, 0.5, 0, 0, 1, 0.5, 0, 0, 1, 0.5],
            [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]
        );

        this.values = values;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.maxParticles = maxParticles;

        this.indexBuffer = undefined;
        this.vertexBuffer = undefined;
        this.offsetBuffer = undefined;

        this.source = [this.width/2, this.height, this.depth/2];
        
        this.pos = [];
        this.prev = [];
        this.force = [];
        this.size = [];
        this.color = [];
        this.repulsionRadius = 0.5;
        this.nParticles = 0;
    }

    initBuffers() {
        const particleIndices = [];
        for(let i = 0; i < this.maxParticles; i++) {
            particleIndices.push(
                i*4+2, i*4+1, i*4,
                i*4+3, i*4+2, i*4
            );
        }
        
        const particleOffsets = [];
        const particleSize = 2;
        for(let i = 0; i < this.maxParticles*8; i += 8) {
            particleOffsets.push(particleSize, particleSize);
            particleOffsets.push(-particleSize, particleSize);
            particleOffsets.push(-particleSize, -particleSize);
            particleOffsets.push(particleSize, -particleSize);
        }
        
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(particleIndices), gl.STATIC_DRAW);
        this.vertexBuffer = Renderer.initMeshBuffer(new Float32Array(this.maxParticles*12), gl.DYNAMIC_DRAW);
        this.offsetBuffer = Renderer.initMeshBuffer(new Float32Array(particleOffsets), gl.STATIC_DRAW);
    }
    getBuffers() {
        const particleVertices = [];
        for(let i = 0; i < this.maxParticles*12; i += 12) {
            if(i/12 >= this.nParticles) {
                particleVertices.push(
                    0, 0, 0,
                    0, 0, 0,
                    0, 0, 0,
                    0, 0, 0
                );
            }
            else {
                const pPos = [this.pos[i/4], this.pos[i/4+1], this.pos[i/4+2]];
                particleVertices.push(pPos[0], pPos[1], pPos[2]);
                particleVertices.push(pPos[0], pPos[1], pPos[2]);
                particleVertices.push(pPos[0], pPos[1], pPos[2]);
                particleVertices.push(pPos[0], pPos[1], pPos[2]);
            }
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(particleVertices));
        
        return {
            indices: this.indexBuffer,
            position: this.vertexBuffer,
            offset: this.offsetBuffer
        }
    }

    addParticles(number) {
        for(let i = 0; i < number; i++) {
            this.addParticle(Math.random()*this.width, 1*this.height, Math.random()*this.depth);
        }
    }
    deleteParticle(index) {
        this.pos.splice(index*3, 3);
        this.prev.splice(index*3, 3);
        this.force.splice(index*3, 3);
        this.size.splice(index, 1);
        this.color.splice(index, 1);
        this.nParticles--;
    }
    addParticle(x, y, z) {
        this.pos.push(x, y, z);
        this.prev.push(x, y, z);
        this.force.push(0, GRAVITY, 0);
        this.size.push(this.repulsionRadius/2);
        this.color.push(Math.random());
        this.nParticles++;
    }

    update(terrain) {
        //this.calculateForces();
        this.addParticle(this.source[0] + Math.random()*2, this.source[1], this.source[2] + Math.random()*2);
        this.addParticle(this.source[0] + Math.random()*2, this.source[1], this.source[2] + Math.random()*2);
        this.addParticle(this.source[0] + Math.random()*2, this.source[1], this.source[2] + Math.random()*2);
        //this.addParticle(this.source[0] + Math.random()/2, this.source[1], this.source[2] + Math.random()/2);
        while (this.nParticles > this.maxParticles) {
           //this.deleteParticle(Math.floor(Math.random()*this.nParticles)*3);
           this.deleteParticle(Math.floor(Math.random()*this.nParticles));
        }
        const partitionSize = 4;
        const partition = [];
        for(let i = 0; i < partitionSize**3; i++) {
            partition.push([]);
        }
        for(let i = 0; i < this.nParticles*3; i += 3) {
            const nx = Math.floor(this.pos[i] / this.width * partitionSize);
            const ny = Math.floor(this.pos[i+1] / this.height * partitionSize);
            const nz = Math.floor(this.pos[i+2] / this.depth * partitionSize);
            try {
                partition[nx + ny*partitionSize + nz*partitionSize*partitionSize].push(i)
            }
            catch {
                console.log(nx + ny*partitionSize + nz*partitionSize*partitionSize);
                console.log(nx, ny, nz);asdf
            }
        }
        for(let i = 0; i < 1; i++) {
            this.fixPositions(terrain);
            for(let ii of partition) {
                this.fixConstraints(ii);
            }
        }
        this.verlet();
    }

    fixConstraints(partition) {
        let dx, dy, dz, distSquared, radius, change;
        for(let pi = 0; pi < partition.length - 1; pi += 3) {
            for(let pii = pi + 1; pii < partition.length; pii += 3) {
                let i = partition[pi];
                let ii = partition[pii];
                dx = this.pos[ii] - this.pos[i];
                dy = this.pos[ii+1] - this.pos[i+1];
                dz = this.pos[ii+2] - this.pos[i+2];
                distSquared = dx*dx + dy*dy + dz*dz;
                radius = this.size[i/3] + this.size[ii/3];
                if(distSquared < radius*radius) {
                    change = (radius - Math.sqrt(distSquared))/8;
                    
                    this.pos[i] -= dx*change;
                    this.pos[ii] += dx*change;
                    this.pos[i+1] -= dy*change;
                    this.pos[ii+1] += dy*change;
                    this.pos[i+2] -= dz*change;
                    this.pos[ii+2] += dz*change;
                }
            }
        }
    }

    calculateForces() {
        for(let i = 0; i < this.nParticles*3; i += 3) {
            for(let ii = i+3; ii < this.nParticles*3; ii += 3) {
                const dx = this.pos[ii  ] - this.pos[i  ];
                const dy = this.pos[ii+1] - this.pos[i+1];
                const dz = this.pos[ii+2] - this.pos[i+2];
                const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
                let factor;
                if(dist < this.repulsionRadius) {
                    factor = 1;
                }
                else if(dist < this.attractionRadius) {
                    factor = -0.01;
                }
                else {
                    continue;
                }
                this.force[ii] += dx*factor;
                this.force[ii+1] += dy*factor;
                this.force[ii+2] += dz*factor;
                
                this.force[i  ] += -dx*factor;
                this.force[i+1] += -dy*factor;
                this.force[i+2] += -dz*factor;
            }
        }
    }

    fixPositions(terrain) {
        for(let i = 0; i < this.nParticles*3; i += 3) {
            const value = terrain.getSample(this.pos[i]+1, this.pos[i+1]+1, this.pos[i+2]+1);
            if(value < border + 0.005) {
                const normal = Vec3.normalize(terrain.getNormal(Math.round(this.pos[i]+1), Math.round(this.pos[i+1]+1), Math.round(this.pos[i+2]+1), 1));
                const amount = (border + 0.005 - value) * 20;
                this.pos[i] += normal[0]*amount;
                this.pos[i+1] += normal[1]*amount;
                this.pos[i+2] += normal[2]*amount;
            }

            this.pos[i] = Math.min(this.width, Math.max(this.pos[i], 0));
            this.pos[i+1] = Math.min(this.height, this.pos[i+1]);
            this.pos[i+2] = Math.min(this.depth, Math.max(this.pos[i+2], 0));
            if(this.pos[i+1] < 0) {
                this.deleteParticle(i/3);
                i -= 3;
            }
        }
    }

    verlet() {
        for(let i = 0; i < this.nParticles*3; i += 3) {
            const tempX = this.pos[i];
            const tempY = this.pos[i+1];
            const tempZ = this.pos[i+2];
            this.pos[i  ] = (1+FRICTION)*tempX - FRICTION*this.prev[i  ] + this.force[i  ]*DT*DT;
            this.pos[i+1] = (1+FRICTION)*tempY - FRICTION*this.prev[i+1] + this.force[i+1]*DT*DT;
            this.pos[i+2] = (1+FRICTION)*tempZ - FRICTION*this.prev[i+2] + this.force[i+2]*DT*DT;

            this.prev[i] = tempX;
            this.prev[i+1] = tempY;
            this.prev[i+2] = tempZ;

            this.force[i] = 0;
            this.force[i+1] = GRAVITY;
            this.force[i+2] = 0;
        }
    }
}