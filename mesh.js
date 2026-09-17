"use strict";
let totalTriangles = 0;
let totalVertices = 0;
class Mesh {
	constructor(vertices, indices, colors, normals) {
		this.vertices = new Float32Array(vertices);
		this.indices = new Uint16Array(indices);
		this.colors = new Float32Array(colors);
		this.normals = new Float32Array(normals);
		this.buffers = undefined;
	}

	loadBuffers() {
		totalTriangles += this.indices.length/3;
		totalVertices += this.vertices.length/3;
		this.buffers = Renderer.initMeshBuffers(this);
	}
}