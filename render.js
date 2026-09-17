"use strict";
class Renderer {
    constructor(shader) {
        this.shader = shader;
        this.attribs = {};
        this.attribLocations = [];
        this.attribSizes = [];
        this.attribTypes = [];

        this.uniformMats = {};
        this.uniformMatLocations = [];
        this.uniformMatData = [];
    }

    addShader(shader, name) {
        this.shaders[name] = shader;
    }
    addAttrib(size, type, name) {
        this.attribs[name] = this.attribLocations.length;
        this.attribLocations.push(gl.getAttribLocation(this.shader.program, "aVertex" + name));
        this.attribSizes.push(size);
        this.attribTypes.push(type);
    }
    addUniformMatrix(data, name) {
        this.uniformMats[name] = this.uniformMatData.length;
        this.uniformMatLocations.push(gl.getUniformLocation(this.shader.program, "u" + name));
        this.uniformMatData.push(data);
    }
    setMatrix(data, name) {
        const index = this.uniformMats[name];
        this.uniformMatData[index] = data;
    }
    render(buffers, vertexCount, mode) {
        let index, location, size, type;
        for(let name in this.attribs) {
            index = this.attribs[name];
            location = this.attribLocations[index];
            size = this.attribSizes[index];
            type = this.attribTypes[index];
            
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers[name.toLowerCase()]);
            gl.vertexAttribPointer(location, size, type, false, 0, 0);
            gl.enableVertexAttribArray(location);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }
        
        if(mode == gl.TRIANGLES) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
        }

        gl.useProgram(this.shader.program);

        let data;
        for(let name in this.uniformMats) {
            index = this.uniformMats[name];
            location = this.uniformMatLocations[index];
            data = this.uniformMatData[index];
            gl.uniformMatrix4fv(location, false, data);
        }

        type = gl.UNSIGNED_SHORT;
        if(mode == gl.TRIANGLES) {
            gl.drawElements(mode, vertexCount, type, 0);
        }
        else {
            gl.drawArrays(mode, vertexCount, type, 0);
        }
    }

    static initMeshBuffers(mesh) {
        const positionBuffer = Renderer.initMeshBuffer(mesh.vertices, gl.STATIC_DRAW);
        const colorBuffer = Renderer.initMeshBuffer(mesh.colors, gl.STATIC_DRAW);
        const normalBuffer = Renderer.initMeshBuffer(mesh.normals, gl.STATIC_DRAW);

        //indices
        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);

        return {
            position: positionBuffer,
            color: colorBuffer,
            indices: indexBuffer,
            normal: normalBuffer
        };
    }
    static initMeshBuffer(data, usage) {
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, usage);
        return buffer;
    }
}