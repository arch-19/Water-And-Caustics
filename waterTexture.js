/**************water code*********/

function getWaterShader(gl, id) {
      var shaderScript = document.getElementById(id);
      if (!shaderScript) {
          return null;
      }

      var str = "";
      var k = shaderScript.firstChild;
      while (k) {
          if (k.nodeType == 3)
              str += k.textContent;
          k = k.nextSibling;
      }

      var shader;
      if (shaderScript.type == "x-shader/x-fragment") {
          shader = gl.createShader(gl.FRAGMENT_SHADER);
      } else if (shaderScript.type == "x-shader/x-vertex") {
          shader = gl.createShader(gl.VERTEX_SHADER);
      } else {
          return null;
      }

      gl.shaderSource(shader, str);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          alert(gl.getShaderInfoLog(shader));
          return null;
      }

      return shader;
  }

var waterShaderProgram;
  function initWaterShaders() {
    var waterFragmentShader = getWaterShader(gl, "water-shader-fs");
    var waterVertexShader = getWaterShader(gl, "water-shader-vs");

    waterShaderProgram = gl.createProgram();
    gl.attachShader(waterShaderProgram, waterVertexShader);
    gl.attachShader(waterShaderProgram, waterFragmentShader);
    gl.linkProgram(waterShaderProgram);

    if (!gl.getProgramParameter(waterShaderProgram, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
    }

    gl.useProgram(waterShaderProgram);

    waterShaderProgram.vertexPositionAttribute = gl.getAttribLocation(waterShaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(waterShaderProgram.vertexPositionAttribute);

    waterShaderProgram.pMatrixUniform = gl.getUniformLocation(waterShaderProgram, "uPMatrix");
    waterShaderProgram.mvMatrixUniform = gl.getUniformLocation(waterShaderProgram, "uMVMatrix");
    waterShaderProgram.samplerUniform = gl.getUniformLocation(waterShaderProgram, "uSampler");
  }

var mvMatrixStack = [];
/**
* Routine for pushing a current model view matrix to a stack for hieroarchial modeling
* @return None
*/
function mvPushMatrix() {
    var copy = mat4.create(mvMatrix);
    mvMatrixStack.push(copy);
}


/**
* Routine for popping a stored model view matrix from stack for hieroarchial modeling
* @return None
*/
function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
      throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

function setWaterMatrixUniforms() {
    gl.uniformMatrix4fv(waterShaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(waterShaderProgram.mvMatrixUniform, false, mvMatrix);
 }

 function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }

var waterVertexPositionBuffer;
var waterVertexIndexBuffer;

function initWaterBuffers() {
    waterVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,waterVertexPositionBuffer);
    var vertices = [
    // Front face
//    -100.0, -100.0,  100.0,
//     100.0, -100.0,  100.0,
//     100.0,  100.0,  100.0,
//    -100.0,  100.0, 100.0,

    // Back face
    -100.0, -100.0, -100.0,
    -100.0,  100.0, -100.0,
     100.0,  100.0, -100.0,
     100.0, -100.0, -100.0,

    // Top face
//    -100.0,  100.0, -100.0,
//    -100.0,  100.0,  100.0,
//     100.0,  100.0,  100.0,
//     100.0,  100.0, -100.0,
    // Bottom face
    -100.0, -100.0, -100.0,
     100.0, -100.0, -100.0,
     100.0, -100.0,  100.0,
    -100.0, -100.0,  100.0,

    // Right face
     100.0, -100.0, -100.0,
     100.0,  100.0, -100.0,
     100.0,  100.0,  100.0,
     100.0, -100.0,  100.0,

    // Left face
    -100.0, -100.0, -100.0,
    -100.0, -100.0,  100.0,
    -100.0,  100.0,  100.0,
    -100.0,  100.0, -100.0
  ];
    
    
    for(var i=0; i<vertices.length; i++) {
        //if (i%3 == 1) vertices[i]+= 40;
        vertices[i] *= 0.04;
    }
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    waterVertexPositionBuffer.itemSize = 3;
    waterVertexPositionBuffer.numItems = 16;

    waterVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, waterVertexIndexBuffer);
    var cubeVertexIndices = [
      0, 1, 2,      0, 2, 3,    // Front face
      4, 5, 6,      4, 6, 7,    // Back face
      8, 9, 10,     8, 10, 11,  // Top face
      12, 13, 14,   12, 14, 15, // Bottom face
//      16, 17, 18,   16, 18, 19, // Right face
//      20, 21, 22,   20, 22, 23  // Left face
    ]
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices),gl.STATIC_DRAW);
    waterVertexIndexBuffer.itemSize = 1;
    waterVertexIndexBuffer.numItems = 24;
}

var waterTexture
function initWaterCubeMap(){
    waterTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, waterTexture);

    var waterImage = new Image();
    waterImage.onload = function() {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, waterTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, waterImage); 
        
    }
    waterImage.src = "water/pos-x.JPG";
    
    var waterImage1 = new Image();
    waterImage1.onload = function() {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, waterTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, waterImage1); 
        
    }
    waterImage1.src = "pool/neg-x.JPG";
    
    var waterImage2 = new Image();
    waterImage2.onload = function() {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, waterTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, waterImage2); 
        
    }
    waterImage2.src = "pool/pos-y.JPG";
    
    var waterImage3 = new Image();
    waterImage3.onload = function() {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, waterTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, waterImage3); 
        
    }
    waterImage3.src = "water/neg-y.JPG";
    
    var waterImage4 = new Image();
    waterImage4.onload = function() {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, waterTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, waterImage4); 
        
    }
    waterImage4.src = "water/pos-z.JPG";
    
    var waterImage5 = new Image();
    waterImage5.onload = function() {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, waterTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, waterImage5); 
        
    }
    waterImage5.src = "water/neg-z.JPG";
    //gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR); 
}

function drawWater() {
    gl.useProgram(waterShaderProgram);
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(50, gl.viewportWidth / gl.viewportHeight, 0.1, 500.0, pMatrix);
    mat4.identity(mvMatrix);
    
    mat4.translate(mvMatrix, [0.0, -1.0, -20.0]);
    
    
    mat4.rotateX(mvMatrix, 0.4);
    
    //cam animation
    
    //mat4.rotateY(mvMatrix, rotY);
    //mat4.rotateX(mvMatrix, rotX);
    //mat4.translate(mvMatrix, transVec);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, waterVertexPositionBuffer);
    gl.vertexAttribPointer(waterShaderProgram.vertexPositionAttribute, waterVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, waterTexture);
    gl.uniform1i(waterShaderProgram.samplerUniform, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, waterVertexIndexBuffer);
    setWaterMatrixUniforms();
    //gl.drawElements(gl.TRIANGLES, waterVertexIndexBuffer.numItems,gl.UNSIGNED_SHORT,0);
}
/*****************end water code*************/
