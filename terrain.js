"use strict";
let sampleCalls = 0;
//1 1 1 1 1 1

class Terrain {
	constructor(width, height, depth, detail) {
		this.width = width;
		this.height = height;
		this.depth = depth;
		this.detail = detail;
		
		this.noise = new PerlinNoise3d(width/detail[0] + 2, height/detail[1] + 2, depth/detail[2] + 2);
		
		this.loadedChunks = [];
		this.visibleChunks = [];
		this.chunkMeshes = [];

		this.values = new Float32Array((this.width+3)*(this.height+3)*(this.depth+3));

		this.water = undefined;
		this.treeMatrices = [];
	}

	coordToIndex(x, y, z) {
		return x + y*(this.width+3) + z*(this.width+3)*(this.height+3);
	}

	generateTrees(nTrees) {
		const treeRadiusSquared = 1;
		const positions = [];
		//get the positions of the tree
		while(positions.length < nTrees) {
			const randomCoord = [Math.random()*this.width, this.height, Math.random()*this.depth];
			let isValidCoord = true;
			for(let i of positions) {
				if((i[0] - randomCoord[0])**2 + (i[2] - randomCoord[2])**2 < treeRadiusSquared) {
					isValidCoord = false;
					break;
				}
			}
			if(isValidCoord) {
				const treeY = this.height - this.castRay(randomCoord, [0, -0.5, 0], this.height*2)*0.5;
				if(treeY < 60 & treeY > 30) {
					randomCoord[1] = treeY + 0.5;
					const steepness = Vec3.normalize(this.getNormal(Math.floor(randomCoord[0]), Math.floor(randomCoord[1]), Math.floor(randomCoord[2]), 1))[1];
					if(steepness > Math.random()/2+0.5) {
						positions.push(randomCoord);
					}
				}
			}
		}
		
		//calculate the tree modelMatrices
		for(let i of positions) {
			this.treeMatrices.push(Mat4.modelMatrix(Mat4.create(), i, [0, Math.random()*2*Math.PI, 0]));
		}
	}

	loadValues() {
		for(let x = 0; x < this.width + 3; x++) {
			for(let y = 0; y < this.height + 3; y++) {
				for(let z = 0; z < this.depth + 3; z++) {
					this.values[this.coordToIndex(x, y, z)] = this.getSample(x, y, z);
				}
			}
		}
		this.water = new Water(this.values, this.width, this.height, this.depth, 2000);
	}
	
	getColor(height, steepness) {
		if(height > 60) {
			return [1, 1, 1];
		}
		if(steepness < (height+5)/70) {
			return [80/255, 80/255, 80/255];
		}
		if(height < 30) {
			if(steepness < 0.5) {
				return [80/255, 80/255, 80/255];
			}
			return [1, 1, 0.5];
		}
		return [43/255, 166/255, 75/255];
	}
	
	getSample(x, y, z) {
		sampleCalls++;
		const nx = x / this.detail[0];
		const ny = y / this.detail[1];
		const nz = z / this.detail[2];
		
		const sample3 = -this.noise.getSample(nx, 0, nz)*0.2;
		const sample2 = -this.noise.getSample(nx/3, 0, nz/3);
		const island = Math.min(
			Math.sqrt((nx - this.width/2/this.detail[0])**2 * 0.06 + (nz - this.depth/2/this.detail[2])**2 * 0.06)*0.8 - 0.3,
			Math.sqrt((nx - this.width/2/this.detail[0] - 5)**2 * 0.02 + (nz - this.depth/2/this.detail[2] + 3)**2 * 0.02)*1.2,
			Math.sqrt((nx - this.width/2/this.detail[0] + 3)**2 * 0.02 + (nz - this.depth/2/this.detail[2] + 3)**2 * 0.02)*1.4 - 0.1,
			Math.sqrt((nx - this.width/2/this.detail[0] + 7)**2 * 0.02 + (nz - this.depth/2/this.detail[2] + 4)**2 * 0.02)*1.4 + 0.3,
			Math.sqrt((nx - this.width/2/this.detail[0])**2 * 0.03 + (nz - this.depth/2/this.detail[2] + 2)**2 * 0.03)*0.5 + 0.3
		);
		return sample2 + sample3 + (y-25)/35 + island - 0.7;
		//return this.noise.getSample(nx/2, ny/2, nz/2) + (y-30)/30;
	}

	castRay(position, direction, maxDist) {
		let x = position[0];
		let y = position[1];
		let z = position[2];
		for(let i = 0; i < maxDist; i++) {
			x += direction[0];
			y += direction[1];
			z += direction[2];
			if(this.getSample(x+1, y+1, z+1) < border) {
				return i;
			}
		}
		return maxDist;
	}

	clampCoord(val, min, max) {
		return Math.min(Math.max(val, min), max);
	}

	getNormal(x, y, z, resolution) {
		const normalCoord = this.coordToIndex(
			this.clampCoord(x, resolution, this.width+2-resolution),
			this.clampCoord(y, resolution, this.height+2-resolution),
			this.clampCoord(z, resolution, this.depth+2-resolution)
		);
		const xIndex = this.coordToIndex(resolution, 0, 0);
		const yIndex = this.coordToIndex(0, resolution, 0);
		const zIndex = this.coordToIndex(0, 0, resolution);
		return [
			this.values[normalCoord + xIndex] - this.values[normalCoord - xIndex],
			this.values[normalCoord + yIndex] - this.values[normalCoord - yIndex],
			this.values[normalCoord + zIndex] - this.values[normalCoord - zIndex]
		];
	}

	calcWeights(x, y, z) {
		const weights = [0, 0, 0, 0, 0, 0, 0, 0];
		const oneTwelfth = 1/12;
		weights[0] = (1-x + 1-y + 1-z)*oneTwelfth; //0, 0, 0
		weights[1] = (1-x + 1-y + z  )*oneTwelfth; //0, 0, 1
		weights[2] = (1-x + y   + 1-z)*oneTwelfth; //0, 1, 0
		weights[3] = (1-x + y   + z  )*oneTwelfth; //0, 1, 1
		weights[4] = (x   + 1-y + 1-z)*oneTwelfth; //1, 0, 0
		weights[5] = (x   + 1-y + z  )*oneTwelfth; //1, 0, 1
		weights[6] = (x   + y   + 1-z)*oneTwelfth; //1, 1, 0
		weights[7] = (x   + y   + z  )*oneTwelfth; //1, 1, 1
		return weights;
	}
	
	loadChunk(x, y, z) {
		const voxels = new Float32Array(19**3);
		
		for(let ix = 0; ix < 19; ix++) {
    		for(let iy = 0; iy < 19; iy++) {
        		for(let iz = 0; iz < 19; iz++) {
        		    const index = iz*361 + iy*19 + ix;
					const value = this.values[this.coordToIndex(x + ix, y + iy, z + iz)];
					/*if(value == 0) {
						console.log("undefined");
					}*/
        		    voxels[index] = value;
        		}
    		}
		}
		
		const res = 1;//2**Math.floor(Math.random()*2);
		const newChunk = new Chunk(voxels, x, y, z);
		this.loadedChunks.push(newChunk);
		this.chunkMeshes.push(newChunk.march(this, res));
	}
	loadChunks(x, y, z) {
		for(let ix = 0; ix < x; ix++) {
			for(let iy = 0; iy < y; iy++) {
				for(let iz = 0; iz < z; iz++) {
					this.loadChunk(ix*16, iy*16, iz*16);
				}
			}
		}
	}
	loadMeshBuffers() {
		this.water.mesh.loadBuffers();
		for(let i of this.chunkMeshes) {
			i.loadBuffers();
		}
	}
}