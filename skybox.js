/**************skybox code*********/

function getSkyboxShader(gl, id) {
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

var skyboxShaderProgram;
  function initSkyboxShaders() {
    var skyboxFragmentShader = getSkyboxShader(gl, "skybox-shader-fs");
    var skyboxVertexShader = getSkyboxShader(gl, "skybox-shader-vs");

    skyboxShaderProgram = gl.createProgram();
    gl.attachShader(skyboxShaderProgram, skyboxVertexShader);
    gl.attachShader(skyboxShaderProgram, skyboxFragmentShader);
    gl.linkProgram(skyboxShaderProgram);

    if (!gl.getProgramParameter(skyboxShaderProgram, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
    }

    gl.useProgram(skyboxShaderProgram);

    skyboxShaderProgram.vertexPositionAttribute = gl.getAttribLocation(skyboxShaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(skyboxShaderProgram.vertexPositionAttribute);

    skyboxShaderProgram.pMatrixUniform = gl.getUniformLocation(skyboxShaderProgram, "uPMatrix");
    skyboxShaderProgram.mvMatrixUniform = gl.getUniformLocation(skyboxShaderProgram, "uMVMatrix");
    skyboxShaderProgram.samplerUniform = gl.getUniformLocation(skyboxShaderProgram, "uSampler");
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

function setMatrixUniforms() {
    gl.uniformMatrix4fv(skyboxShaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(skyboxShaderProgram.mvMatrixUniform, false, mvMatrix);
 }

 function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }

var cubeVertexPositionBuffer;
var cubeVertexIndexBuffer;

function initSkyboxBuffers() {
    cubeVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,cubeVertexPositionBuffer);
    var vertices = [
    // Front face
    -100.0, -100.0,  100.0,
     100.0, -100.0,  100.0,
     100.0,  100.0,  100.0,
    -100.0,  100.0, 100.0,

    // Back face
    -100.0, -100.0, -100.0,
    -100.0,  100.0, -100.0,
     100.0,  100.0, -100.0,
     100.0, -100.0, -100.0,

    // Top face
    -100.0,  100.0, -100.0,
    -100.0,  100.0,  100.0,
     100.0,  100.0,  100.0,
     100.0,  100.0, -100.0,
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
    
    
//    for(var i=0; i<vertices.length; i++) {
//        vertices[i] *= 0.5;
//    }
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    cubeVertexPositionBuffer.itemSize = 3;
    cubeVertexPositionBuffer.numItems = 24;

    cubeVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    var cubeVertexIndices = [
      0, 1, 2,      0, 2, 3,    // Front face
      4, 5, 6,      4, 6, 7,    // Back face
      8, 9, 10,     8, 10, 11,  // Top face
      12, 13, 14,   12, 14, 15, // Bottom face
      16, 17, 18,   16, 18, 19, // Right face
      20, 21, 22,   20, 22, 23  // Left face
    ]
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices),gl.STATIC_DRAW);
    cubeVertexIndexBuffer.itemSize = 1;
    cubeVertexIndexBuffer.numItems = 36;
}

function initSkyboxCubeMap(){
    cubeTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);

    var cubeImage = new Image();
    cubeImage.onload = function() {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cubeImage); 
        
    }
    cubeImage.src = "skybox/pos-x.JPG";
    
    var cubeImage1 = new Image();
    cubeImage1.onload = function() {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cubeImage1); 
        
    }
    cubeImage1.src = "skybox/neg-x.JPG";
    
    var cubeImage2 = new Image();
    cubeImage2.onload = function() {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cubeImage2); 
        
    }
    cubeImage2.src = "skybox/pos-y.JPG";
    
    var cubeImage3 = new Image();
    cubeImage3.onload = function() {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cubeImage3); 
        
    }
    cubeImage3.src = "skybox/neg-y.JPG";
    
    var cubeImage4 = new Image();
    cubeImage4.onload = function() {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cubeImage4); 
        
    }
    cubeImage4.src = "skybox/pos-z.JPG";
    
    var cubeImage5 = new Image();
    cubeImage5.onload = function() {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cubeImage5); 
        
    }
    cubeImage5.src = "skybox/neg-z.JPG";
    //gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR); 
}

function drawSkybox() {
    gl.useProgram(skyboxShaderProgram);
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(50, gl.viewportWidth / gl.viewportHeight, 0.1, 500.0, pMatrix);
    mat4.identity(mvMatrix);
    
    mat4.translate(mvMatrix, [0.0, -75.0, -50.0]);
    
    
    mat4.rotateX(mvMatrix, 0.5);
    
    //cam animation
    
//    mat4.rotateY(mvMatrix, rotY);
//    mat4.translate(mvMatrix, transVec);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(skyboxShaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);
    gl.uniform1i(skyboxShaderProgram.samplerUniform, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems,gl.UNSIGNED_SHORT,0);
}
/*****************endskybox code*************/
