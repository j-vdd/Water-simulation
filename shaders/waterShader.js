"strict mode"
let waterRenderer;
function loadWaterRenderer() {
    const waterShader = new ShaderProgramClass(
        `
        attribute vec3 aVertexPosition;
        attribute vec2 aVertexOffset;
        uniform mat4 uProjectionMatrix;
        uniform mat4 uModelViewMatrix;
    
        varying mediump vec2 vCoord;
    
        void main(void) {
          vec4 camPos = uProjectionMatrix * (uModelViewMatrix * vec4(aVertexPosition, 1.) + vec4(aVertexOffset*.2, 0., 0.));
          gl_Position = camPos;
          vCoord = aVertexOffset;
        }
        `,
        `
        varying lowp vec2 vCoord;
    
        void main(void) {
          if(length(vCoord) < 1.) {
            gl_FragColor = vec4(0., 0., 1., 1.);
          }
          else {
            discard;
            //gl_FragColor = vec4(43./255., 166./255., 75./255., 1.);
          }
        }
        `
    );
    
    waterRenderer = new Renderer(waterShader);

    waterRenderer.addAttrib(3, gl.FLOAT, "Position");
    waterRenderer.addAttrib(2, gl.FLOAT, "Offset");
    waterRenderer.addUniformMatrix(undefined, "ProjectionMatrix");
    waterRenderer.addUniformMatrix(undefined, "ModelViewMatrix");
}