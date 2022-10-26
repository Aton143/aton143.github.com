"use strict";

const vertexShader = `
// an attribute will receive data from a buffer
attribute vec4 a_position;
 
// all shaders have a main function
void main() {
 
  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  gl_Position = a_position;
}
`;

const fragmentShader = `
// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision"
precision mediump float;
 
void main() {
  // gl_FragColor is a special variable a fragment shader
  // is responsible for setting
  gl_FragColor = vec4(1, 0, 0.5, 1); // return reddish-purple
}
`;

function glCompileShader(glContext, shaderSource, shaderType) {
  const createShader = glContext.createShader(shaderType);

  glContext.shaderSource(createShader, shaderSource);
  glContext.compileShader(createShader);

  const createShaderResult = glContext.getShaderParameter(createShader, glContext.COMPILE_STATUS);
  if (createShaderResult) {
    return createShader;
  }

  console.log(glContext.getShaderInfoLog(shader));
  glContext.deleteShader(shader);

  return null;
}

function glCreateProgram(glContext, vertexShaderToLink, fragmentShaderToLink)
{
  if ((vertexShaderToLink === null) || (fragmentShaderToLink === null)) {
    return null;
  }

  const glProgram = glContext.createProgram();

  glContext.attachShader(glProgram, vertexShaderToLink);
  glContext.attachShader(glProgram, fragmentShaderToLink);
  glContext.linkProgram(glProgram);

  const linkProgramResult = glContext.getProgramParameter(glProgram, glContext.LINK_STATUS);
  if (linkProgramResult) {
    return glProgram;
  }

  console.log(glContext.getProgramInfoLog(glProgram));
  glContext.deleteProgram(glProgram);

  return null;
}

/*
window.onresize = function(event) {
  const webGLCanvas = document.getElementById("webGLCanvas");

  webGLCanvas.width = document.documentElement.clientWidth;
  webGLCanvas.height = document.documentElement.clientHeight;

  const gl = webGLCanvas.getContext("webgl");

  if (gl === null) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }

  gl.clearColor(1.0, 0.0, 0.5, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}
*/

window.onload = function(event) {
  document.documentElement.style.overflow = 'hidden';  // firefox, chrome
  document.body.scroll = "no"; // ie only

  const webGLCanvas = document.getElementById("webGLCanvas");

  webGLCanvas.width = document.documentElement.clientWidth;
  webGLCanvas.height = document.documentElement.clientHeight;

  const gl = webGLCanvas.getContext("webgl");

  if (gl === null) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }

  const compiledVertexShader = glCompileShader(gl, vertexShader, gl.VERTEX_SHADER);
  const compiledFragmentShader = glCompileShader(gl, fragmentShader, gl.FRAGMENT_SHADER);

  const linkedProgram = glCreateProgram(gl, compiledVertexShader, compiledFragmentShader);

  const positionAttributeLocation = gl.getAttribLocation(linkedProgram, "a_position");

  const positionBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = [
    0, 0,
    0, 0.5,
    0.7, 0,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  console.log(`${gl.canvas.width} ${gl.canvas.height}`);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(linkedProgram);
  gl.enableVertexAttribArray(positionAttributeLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const componentCount = 2;
  const dataType = gl.FLOAT;
  const dataNormalize = false;
  const dataStride = 0;
  const dataOffset = 0;
  gl.vertexAttribPointer(positionAttributeLocation, componentCount,
                         dataType, dataNormalize, dataStride, dataOffset);

  const primitiveType = gl.TRIANGLES;
  const graphicsDataOffset = 0;
  const vertexCount = 3;
  gl.drawArrays(primitiveType, graphicsDataOffset, vertexCount);
};
