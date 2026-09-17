"use strict"
let treeMesh;
(function genTreeMesh() {
    const coneRadius = 1;
    const cilinderRadius = 0.2;
    const treeHeight = 2;
    const trunkHeight = 4;

    let vertices = [0, treeHeight, 0];
    let indices = [];
    let colors = [0, 0.5, 0, 1];
    let normals = [0, 1, 0];
    //cone
    for(let angle = 0; angle < Math.PI*2; angle += Math.PI/8) {
        vertices.push(Math.cos(angle)*coneRadius, 0, Math.sin(angle)*coneRadius);
        const normal = Vec3.normalize([Math.cos(angle), 0.2, Math.sin(angle)]);
        normals.push(normal[0], normal[1], normal[2]);
        colors.push(0, 0.5, 0, 1);
    }
    for(let i = 3; i < vertices.length; i += 3) {
        indices.push(0, i/3 - 1, i/3);
    }
    indices.push(0, vertices.length/3 - 1, 1);

    //cilinder
    const cilinderIndex = vertices.length/3;
    vertices.push(cilinderRadius, 0, 0);
    vertices.push(cilinderRadius, -trunkHeight, 0);
    colors.push(1, 0, 0, 1);
    colors.push(1, 0, 0, 1);
    normals.push(1, 0, 0);
    normals.push(1, 0, 0);
    for(let angle = Math.PI/8; angle < Math.PI*2; angle += Math.PI/8) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        vertices.push(cos*cilinderRadius, 0, sin*cilinderRadius);
        vertices.push(cos*cilinderRadius, -trunkHeight, sin*cilinderRadius);

        colors.push(1, 0, 0, 1);
        colors.push(1, 0, 0, 1);
        normals.push(cos, 0, sin);
        normals.push(cos, 0, sin);

        const nVertices = vertices.length/3;
        indices.push(nVertices-1, nVertices-2, nVertices-3);
        indices.push(nVertices-4, nVertices-3, nVertices-2);
    }
    const nVertices = vertices.length/3;
    indices.push(cilinderIndex+1, cilinderIndex, nVertices-1);
    indices.push(nVertices-2, nVertices-1, cilinderIndex);

    //create mesh
    treeMesh = new Mesh(vertices, indices, colors, normals);
})();