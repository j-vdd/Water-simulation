"use strict";
//https://medium.com/swlh/using-webgl-to-solve-a-practical-problem-751c186889aa
//https://gpfault.net/posts/webgl2-particles.txt.html
//http://nopjia.blogspot.com/2014/06/webgl-gpu-particles.html
let gl;
let terrain, player;
window.onload = main();


//
// Start here
//
function main() {
  const fpsDiv = document.getElementById("fpsCounter");

  const canvas = document.getElementById('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  player = new Player([64, 64, 64], [Math.PI / 4, 0, 0]);
  player.setPerspectiveMatrix(Math.PI / 3, canvas.width / canvas.height, 0.1, 1000);
  
  terrain = new Terrain(256, 80, 256, [8, 8, 8]);
  terrain.loadValues();
  terrain.loadChunks(16, 5, 16);
  terrain.generateTrees(300);
  terrain.loadMeshBuffers();
  terrain.water.initBuffers();
  terrain.water.addParticles(0);

  treeMesh.loadBuffers();

  const times = [];
  let fps;
  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  
  loadTerrainRenderer();
  loadWaterRenderer();
  loadWaterSimShader();
  
  // Draw the scene repeatedly
  let previousTime = Date.now();
  function render() {
    const currentTime = Date.now();
    drawScene(currentTime - previousTime);
    previousTime = currentTime;

    terrain.water.update(terrain);

    requestAnimationFrame(() => {
      const now = performance.now();
      while (times.length > 0 && times[0] <= now - 1000) {
        times.shift();
      }
      times.push(now);
      fps = times.length;
      fpsDiv.innerHTML = "fps: " + fps + "<br>deeltjes: " + terrain.water.nParticles;
      render();
    });
  }
  requestAnimationFrame(render);
}

//
// Draw the scene.
//
function drawScene(deltaTime) {
  //https://jobtalle.com/simulating_hydraulic_erosion.html
  gl.clearColor(0.3, 0.3, 1.0, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.FRONT);
  
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const projectionMatrix = player.perspectiveMatrix;
  const viewMatrix = player.getViewMatrix();
  terrainRenderer.setMatrix(projectionMatrix, "ProjectionMatrix");
  terrainRenderer.setMatrix(viewMatrix, "ModelViewMatrix");
  waterRenderer.setMatrix(projectionMatrix, "ProjectionMatrix");
  waterRenderer.setMatrix(viewMatrix, "ModelViewMatrix");
  
  //terrain
  for(let i of terrain.chunkMeshes) {
    if(i.vertices.length == 0) {
      continue;
    }
    terrainRenderer.render(i.buffers, i.indices.length, gl.TRIANGLES);
  }

  //water
  terrainRenderer.render(terrain.water.mesh.buffers, terrain.water.mesh.indices.length, gl.TRIANGLES);
  
  const waterBuffers = terrain.water.getBuffers();
  waterRenderer.render(waterBuffers, terrain.water.maxParticles*6, gl.TRIANGLES);

  //trees
  for(let i of terrain.treeMatrices) {
    const modelViewMatrix = Mat4.mult(Mat4.create(), viewMatrix, i);
    terrainRenderer.setMatrix(modelViewMatrix, "ModelViewMatrix");
    terrainRenderer.render(treeMesh.buffers, treeMesh.indices.length, gl.TRIANGLES);
  }

  // Update the rotation for the next draw
  player.checkKeys(deltaTime, terrain);
}