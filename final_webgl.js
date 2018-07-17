/* 
 * Initializing GL object
 */
var gl;
function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if ( !gl ) alert("Could not initialise WebGL, sorry :-(");

    gl = WebGLDebugUtils.makeDebugContext(gl, throwOnGLError, validateNoneOfTheArgsAreUndefined);
}


/*
 * Initializing cloth mesh shaders 
 */
var shaderProgram;
function createShader(vs_id, fs_id) {
    var shaderProg = createShaderProg(vs_id, fs_id);

    shaderProg.vertexPositionAttribute = gl.getAttribLocation(shaderProg, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProg.vertexPositionAttribute);
    shaderProg.vertexNormalAttribute = gl.getAttribLocation(shaderProg, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProg.vertexNormalAttribute);        

    shaderProg.pMatrixUniform = gl.getUniformLocation(shaderProg, "uPMatrix");
    shaderProg.mvMatrixUniform = gl.getUniformLocation(shaderProg, "uMVMatrix");
    shaderProg.nMatrixUniform = gl.getUniformLocation(shaderProg, "uNMatrix");
    shaderProg.lightPosUniform = gl.getUniformLocation(shaderProg, "uLightPos");
    shaderProg.samplerUniform = gl.getUniformLocation(shaderProg, "uSampler");

    return shaderProg;
}

function initShaders() {
    shaderProgram = createShader("shader-vs", "shader-fs");
    gl.useProgram(shaderProgram);    
}


/*
 * Initializing and updating buffers
 */
var vertexPositionBuffer, vertexNormalBuffer, indexBuffer, wireIndexBuffer;
function initBuffers(createBuffers) {
    if ( createBuffers ) {
        vertexPositionBuffer = gl.createBuffer();
        vertexNormalBuffer = gl.createBuffer();        
        indexBuffer = gl.createBuffer();
        wireIndexBuffer = gl.createBuffer();        
    }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertexPosition), gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertexNormal), gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(clothIndex), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wireIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(clothWireIndex), gl.STATIC_DRAW);    
}

function updateBuffers() {
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertexPosition), gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertexNormal), gl.DYNAMIC_DRAW);
}

function resetMesh() {
    initMesh();
    initBuffers(false);
}


/*
 * Main rendering code 
 */

// Basic rendering parameters
var mvMatrix = mat4.create();                   // Model-view matrix for the main object
var pMatrix = mat4.create();                    // Projection matrix

// Lighting control
var lightMatrix = mat4.create();                // Model-view matrix for the point light source
var lightPos = vec3.create();                   // Camera-space position of the light source

// Animation related variables
var rotY = 0.0;                                 // object rotation
var rotX = 0.0;                                 // object rotation
var rotY_light = 0.0;                           // light position rotation

//var transVec = vec3.create();

function setUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

    var nMatrix = mat4.transpose(mat4.inverse(mvMatrix));
    gl.uniformMatrix4fv(shaderProgram.nMatrixUniform, false, nMatrix);

    gl.uniform3fv(shaderProgram.lightPosUniform, lightPos);
}

//var drawMode;
function drawScene() {
    gl.useProgram(shaderProgram);
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(50, gl.viewportWidth/gl.viewportHeight, 0.1, 500.0, pMatrix);

    mat4.identity(lightMatrix);
    mat4.translate(lightMatrix, [0.0, 0.5, -10.0]);
    //mat4.rotateX(lightMatrix, 0.3);
    mat4.rotateY(lightMatrix, rotY_light);

    lightPos.set([-3.0, 20.0, 5.0]);
    mat4.multiplyVec3(lightMatrix, lightPos);

    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, [0.0, 1.0, -20.0]);
    //mat4.rotateX(mvMatrix, 0.3);
    
    mat4.rotateX(mvMatrix, 0.4);
    
    //animation
    
    //mat4.rotateY(mvMatrix, rotY);
    //mat4.rotateX(mvMatrix, rotX);
    //mat4.translate(mvMatrix, transVec);
    
    setUniforms();

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);


    // Normal mode
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);      
    gl.drawElements(gl.TRIANGLES, clothIndex.length, gl.UNSIGNED_SHORT, 0);

}

var lastTime = 0;
var rotSpeed = 60, rotSpeed_light = 60;
var rotating = false, rotating_light = false;
var animated = true;

/*****handling keys*******/
var keyCode = [0,0,0,0];
function getKeyCode() {
    document.onkeydown = keyDown;
    document.onkeyup = keyUp;
}

function keyDown(event){
    //console.log(event.keyCode);
    if (event.keyCode == "87") { //W
        keyCode[0] = 1;
    }
    if (event.keyCode == "65") { //A
        keyCode[1] = 1;
    }
    if (event.keyCode == "83") { //S
        keyCode[2] = 1;
    }
    if (event.keyCode == "68") { //D
        keyCode[3] = 1;
    }
}

function keyUp(event){
    if (event.keyCode == "87") { //W
        keyCode[0] = 0;
    }
    if (event.keyCode == "65") { //A
        keyCode[1] = 0;
    }
    if (event.keyCode == "83") { //S
        keyCode[2] = 0;
    }
    if (event.keyCode == "68") { //D
        keyCode[3] = 0;
    }
}

function handleKey(){ //cam transform tick
    //console.log(keyCode);
    //var transition = vec3.create();
    if (keyCode[0] == 1) { //W
        //vec3.add(transition, [Math.sin(Math.PI/2-(rotY+Math.PI/2)),0,Math.cos(Math.PI/2-(rotY+Math.PI/2))]);
        if(rotX < 0.3) rotX += 0.005;
    }
    if (keyCode[1] == 1) { //A
        if(rotY > -0.3) rotY -= 0.005;
    }
    if (keyCode[2] == 1) { //S
        //vec3.subtract(transition, [Math.sin(Math.PI/2-(rotY+Math.PI/2)),0,Math.cos(Math.PI/2-(rotY+Math.PI/2))]);
        if(rotX > -0.3) rotX -= 0.005;
    }
    if (keyCode[3] == 1) { //D
        if(rotY < 0.3) rotY += 0.005;
    }
    //vec3.scale(transition,0.02);
    //vec3.add(transVec,transition);
}


function tick() {
    requestAnimationFrame(tick);

    var timeNow = new Date().getTime();
    if ( lastTime != 0 ) {
      var elapsed = timeNow - lastTime;
      if ( rotating )
        rotY += rotSpeed*0.0175*elapsed/1000.0;
      if ( rotating_light )
        rotY_light += rotSpeed_light*0.0175*elapsed/1000.0;
        handleKey();
      
    }
    lastTime = timeNow;        

    drawScene();
    drawSkybox();
    drawPool();
    drawWater();


    if ( animated ) {
        var timeStep = 0.001;
        var n = Math.ceil(0.01/timeStep);
        for ( var i = 0; i < n; ++i ) simulate(timeStep);
        computeNormals();
        updateBuffers();
    }
}


function webGLStart() {
    getKeyCode();
    
    var canvas = $("#canvas0")[0];

    meshResolution = 30;
    mass = 1.0;
    restLength = vec3.create();
    K = vec3.create([25000.0, 25000.0, 25000.0]);
    Cd = 0.5;
    uf = vec3.create([0.0, 0.0, 1.0]);
    Cv = 0.5;    

    initGL(canvas);
    initShaders();

    initMesh();
    initBuffers(true);

    initSkyboxShaders();
    initSkyboxBuffers();
    initSkyboxCubeMap();
    
    initPoolShaders();
    initPoolBuffers();
    initPoolCubeMap();
    
    initWaterShaders();
    initWaterBuffers();
    initWaterCubeMap();

    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    //drawMode = 0;

    tick();
}
