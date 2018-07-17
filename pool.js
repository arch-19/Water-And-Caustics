/**************pool code*********/

function getPoolShader(gl, id) {
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

var poolShaderProgram;
  function initPoolShaders() {
    var poolFragmentShader = getPoolShader(gl, "pool-shader-fs");
    var poolVertexShader = getPoolShader(gl, "pool-shader-vs");

    poolShaderProgram = gl.createProgram();
    gl.attachShader(poolShaderProgram, poolVertexShader);
    gl.attachShader(poolShaderProgram, poolFragmentShader);
    gl.linkProgram(poolShaderProgram);

    if (!gl.getProgramParameter(poolShaderProgram, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
    }

    gl.useProgram(poolShaderProgram);

    poolShaderProgram.vertexPositionAttribute = gl.getAttribLocation(poolShaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(poolShaderProgram.vertexPositionAttribute);

    poolShaderProgram.pMatrixUniform = gl.getUniformLocation(poolShaderProgram, "uPMatrix");
    poolShaderProgram.mvMatrixUniform = gl.getUniformLocation(poolShaderProgram, "uMVMatrix");
    poolShaderProgram.samplerUniform = gl.getUniformLocation(poolShaderProgram, "uSampler");
    poolShaderProgram.lightPosUniform = 
    gl.getUniformLocation(poolShaderProgram, "uLightPos");
    poolShaderProgram.normalsUniform = 
    gl.getUniformLocation(poolShaderProgram, "uNormals");
  }



function setPoolMatrixUniforms() {
    gl.uniformMatrix4fv(poolShaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(poolShaderProgram.mvMatrixUniform, false, mvMatrix);
    gl.uniform3fv(poolShaderProgram.lightPosUniform, lightPos);
    var normals = Array.apply(null, Array(2700)).map(function(x, k) {
        var i = Math.floor(k/90);
        var j = (k - k % 3)/3 % 30;
        var xyz = k % 3;
        
        return -getNormal(i,j)[xyz]; 
    });
    gl.uniform3fv(poolShaderProgram.normalsUniform, normals);
//    console.log(normals[2697]);
//    console.log(normals[2698]);
//    console.log(normals[2699]);
 }

var poolVertexPositionBuffer;
//var poolVertexCausticBuffer;
var poolVertexIndexBuffer;

function initPoolBuffers() {
    poolVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,poolVertexPositionBuffer);
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
    poolVertexPositionBuffer.itemSize = 3;
    poolVertexPositionBuffer.numItems = 16;

    poolVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, poolVertexIndexBuffer);
    var cubeVertexIndices = [
      0, 1, 2,      0, 2, 3,    // Front face
      4, 5, 6,      4, 6, 7,    // Back face
      8, 9, 10,     8, 10, 11,  // Top face
      12, 13, 14,   12, 14, 15, // Bottom face
//      16, 17, 18,   16, 18, 19, // Right face
//      20, 21, 22,   20, 22, 23  // Left face
    ]
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices),gl.STATIC_DRAW);
    poolVertexIndexBuffer.itemSize = 1;
    poolVertexIndexBuffer.numItems = 24;
}

var poolTexture
function initPoolCubeMap(){
    poolTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, poolTexture);

    var poolImage = new Image();
    poolImage.onload = function() {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, poolTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, poolImage); 
        
    }
    poolImage.src = "pool/pos-x.JPG";
    
    var poolImage1 = new Image();
    poolImage1.onload = function() {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, poolTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, poolImage1); 
        
    }
    poolImage1.src = "pool/neg-x.JPG";
    
    var poolImage2 = new Image();
    poolImage2.onload = function() {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, poolTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, poolImage2); 
        
    }
    poolImage2.src = "pool/pos-y.JPG";
    
    var poolImage3 = new Image();
    poolImage3.onload = function() {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, poolTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, poolImage3); 
        
    }
    poolImage3.src = "pool/neg-y.JPG";
    
    var poolImage4 = new Image();
    poolImage4.onload = function() {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, poolTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, poolImage4); 
        
    }
    poolImage4.src = "pool/pos-z.JPG";
    
    var poolImage5 = new Image();
    poolImage5.onload = function() {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, poolTexture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, poolImage5); 
        
    }
    poolImage5.src = "pool/neg-z.JPG";
    //gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR); 
}

function drawPool() {
    
    mvPushMatrix();
    gl.useProgram(poolShaderProgram);
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
    
    gl.bindBuffer(gl.ARRAY_BUFFER, poolVertexPositionBuffer);
    gl.vertexAttribPointer(poolShaderProgram.vertexPositionAttribute, poolVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, poolTexture);
    gl.uniform1i(poolShaderProgram.samplerUniform, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, poolVertexIndexBuffer);
    setPoolMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, poolVertexIndexBuffer.numItems,gl.UNSIGNED_SHORT,0);
    mvPopMatrix();
    
}
/*****************end pool code*************/
