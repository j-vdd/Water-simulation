"strict mode"
let terrainRenderer;
function loadTerrainRenderer() {
  const terrainShader = new ShaderProgramClass(`
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    attribute vec3 aVertexNormal;
    
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    
    varying highp vec4 vColor;
    
    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      
      float shade = aVertexNormal.y;
      vec3 color = vec3(aVertexColor.xyz*shade);
      
      vColor = vec4(color, aVertexColor.w);
    }
    `,
    `
    varying highp vec4 vColor;
      void main(void) {
      gl_FragColor = vColor;
    }
  `);

  terrainRenderer = new Renderer(terrainShader);
  terrainRenderer.addAttrib(3, gl.FLOAT, "Position");
  terrainRenderer.addAttrib(4, gl.FLOAT, "Color");
  terrainRenderer.addAttrib(3, gl.FLOAT, "Normal");
  terrainRenderer.addUniformMatrix(undefined, "ProjectionMatrix");
  terrainRenderer.addUniformMatrix(undefined, "ModelViewMatrix");
}