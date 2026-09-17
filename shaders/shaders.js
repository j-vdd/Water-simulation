"use strict";
class ShaderProgramClass {
  constructor(vsCode, fsCode) {
    const vertexShader = ShaderProgramClass.loadShader(gl.VERTEX_SHADER, vsCode);
    const fragmentShader = ShaderProgramClass.loadShader(gl.FRAGMENT_SHADER, fsCode);

    this.program = gl.createProgram();
    gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(this.program));
      return null;
    }
  }

  static loadShader(type, source) {
    const shader = gl.createShader(type);
  
    // Send the source to the shader object
    gl.shaderSource(shader, source);
  
    // Compile the shader program
    gl.compileShader(shader);
  
    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
  
    return shader;
  }
}