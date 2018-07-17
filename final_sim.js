/*
 * Global variables
 */
var meshResolution;

// Particle states
var mass;
var vertexPosition, vertexNormal;
var vertexVelocity;

// Spring properties
var K, restLength; 

// Force parameters
var Cd;
var uf, Cv;

/*
 * Getters and setters
 */
function getPosition(i, j) {
    var id = i*meshResolution + j;
    return vec3.create([vertexPosition[3*id], vertexPosition[3*id + 1], vertexPosition[3*id + 2]]);
}

function setPosition(i, j, x) {
    var id = i*meshResolution + j;
    vertexPosition[3*id] = x[0]; vertexPosition[3*id + 1] = x[1]; vertexPosition[3*id + 2] = x[2];
}

function getNormal(i, j) {
    var id = i*meshResolution + j;
    return vec3.create([vertexNormal[3*id], vertexNormal[3*id + 1], vertexNormal[3*id + 2]]);
}

function getVelocity(i, j) {
    var id = i*meshResolution + j;
    return vec3.create(vertexVelocity[id]);
}

function setVelocity(i, j, v) {
    var id = i*meshResolution + j;
    vertexVelocity[id] = vec3.create(v);
}


/*
 * Provided global functions (you do NOT have to modify them)
 */
function computeNormals() {
    var dx = [1, 1, 0, -1, -1, 0], dy = [0, 1, 1, 0, -1, -1];
    var e1, e2;
    var i, j, k = 0, t;
    for ( i = 0; i < meshResolution; ++i )
        for ( j = 0; j < meshResolution; ++j ) {
            var p0 = getPosition(i, j), norms = [];
            for ( t = 0; t < 6; ++t ) {
                var i1 = i + dy[t], j1 = j + dx[t];
                var i2 = i + dy[(t + 1) % 6], j2 = j + dx[(t + 1) % 6];
                if ( i1 >= 0 && i1 < meshResolution && j1 >= 0 && j1 < meshResolution &&
                     i2 >= 0 && i2 < meshResolution && j2 >= 0 && j2 < meshResolution ) {
                    e1 = vec3.subtract(getPosition(i1, j1), p0);
                    e2 = vec3.subtract(getPosition(i2, j2), p0);
                    norms.push(vec3.normalize(vec3.cross(e1, e2)));
                }
            }
            e1 = vec3.create();
            for ( t = 0; t < norms.length; ++t ) vec3.add(e1, norms[t]);
            vec3.normalize(e1);
            vertexNormal[3*k] = e1[0];
            vertexNormal[3*k + 1] = e1[1];
            vertexNormal[3*k + 2] = e1[2];
            ++k;
        }
}


var clothIndex, clothWireIndex;
function initMesh() {
    var i, j, k;

    vertexPosition = new Array(meshResolution*meshResolution*3);
    vertexNormal = new Array(meshResolution*meshResolution*3);
    clothIndex = new Array((meshResolution - 1)*(meshResolution - 1)*6);
    clothWireIndex = [];

    vertexVelocity = new Array(meshResolution*meshResolution);
    restLength[0] = 8.0/(meshResolution - 1);
    restLength[1] = Math.sqrt(2.0)*8.0/(meshResolution - 1);
    restLength[2] = 2.0*restLength[0];

    for ( i = 0; i < meshResolution; ++i )
        for ( j = 0; j < meshResolution; ++j ) {
            setPosition(i, j, [-4.0 + 8.0*j/(meshResolution - 1), -0.0, -4.0 + 8.0*i/(meshResolution - 1)]);
            setVelocity(i, j, vec3.create());

            if ( j < meshResolution - 1 )
                clothWireIndex.push(i*meshResolution + j, i*meshResolution + j + 1);
            if ( i < meshResolution - 1 )
                clothWireIndex.push(i*meshResolution + j, (i + 1)*meshResolution + j);
            if ( i < meshResolution - 1 && j < meshResolution - 1 )
                clothWireIndex.push(i*meshResolution + j, (i + 1)*meshResolution + j + 1);
        }
    computeNormals();

    k = 0;
    for ( i = 0; i < meshResolution - 1; ++i )
        for ( j = 0; j < meshResolution - 1; ++j ) {
            clothIndex[6*k] = i*meshResolution + j;
            clothIndex[6*k + 1] = i*meshResolution + j + 1;
            clothIndex[6*k + 2] = (i + 1)*meshResolution + j + 1;
            clothIndex[6*k + 3] = i*meshResolution + j;
            clothIndex[6*k + 4] = (i + 1)*meshResolution + j + 1;            
            clothIndex[6*k + 5] = (i + 1)*meshResolution + j;
            ++k;
        }
}


/*
 * KEY function: simulate one time-step using Euler's method
 */
//rng for int
function randomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

//immutable substraction
function sub(p,q){
    return vec3.subtract(vec3.create(p),q);
}

//3 types of spring forces between p and q
function getStiffForce(p,q){
    var pq = sub(p,q);
    var distance = vec3.length(pq);
    return vec3.scale(pq,K[0]*(restLength[0]-distance)/distance);
}

function getShearForce(p,q){
    var pq = sub(p,q);
    var distance = vec3.length(pq);
    return vec3.scale(pq,K[1]*(restLength[1]-distance)/distance);
}

function getFlexForce(p,q){
    var pq = sub(p,q);
    var distance = vec3.length(pq);
    return vec3.scale(pq,K[2]*(restLength[2]-distance)/distance);
}

//other forces on single particle @ pos i,j

//Gravity
//var G = [0.0, -9.8*mass, 0.0];

//Damping Force
function getDampingForce(i,j){
    return vec3.scale(getVelocity(i,j),-Cd);
}

//Viscous Fluid Force
function getViscousForce(i,j){
    var n = getNormal(i,j);
    var v = getVelocity(i,j);
    return vec3.scale(n,Cv*vec3.dot(n,sub(uf,v)));
}

//is index in bound
function isValid(i){
    return (i < meshResolution && i >= 0)
}

//sum up all forces on particle @ pos i,j
function getNetForce(i,j){
    
    
    //init
    var NetForce = vec3.create();
    var p = getPosition(i,j);
    
    
    /***********Spring forces************/
    
    //Structural: each particle [i,j] is connected to (up to) four particles via structural connections: [i,j+1], [i,j−1], [i+1,j], [i−1,j].
    if(isValid(i) && isValid(j+1)){
        vec3.add(NetForce, getStiffForce(p,getPosition(i,j+1)));
    }
    if(isValid(i) && isValid(j-1)){
        vec3.add(NetForce, getStiffForce(p,getPosition(i,j-1)));
    }
    if(isValid(i+1) && isValid(j)){
        vec3.add(NetForce, getStiffForce(p,getPosition(i+1,j)));
    }
    if(isValid(i-1) && isValid(j)){
        vec3.add(NetForce, getStiffForce(p,getPosition(i-1,j)));
    }
    
    
    //Shear: each particle [i,j] is connected to (up to) four particles via shear connections: [i+1,j+1], [i+1,j−1], [i−1,j−1], [i−1,j+1].
    if(isValid(i+1) && isValid(j+1)){
		vec3.add(NetForce, getShearForce(p, getPosition(i+1, j+1)));
    }
    if(isValid(i+1) && isValid(j-1)){
		vec3.add(NetForce, getShearForce(p, getPosition(i+1, j-1)));
    }
    if(isValid(i-1) && isValid(j-1)){
		vec3.add(NetForce, getShearForce(p, getPosition(i-1, j-1)));
    }
    if(isValid(i-1) && isValid(j+1)){
		vec3.add(NetForce, getShearForce(p, getPosition(i-1, j+1)));
    }
        
    
    //Flexion: each particle [i,j] is connected to (up to) four particles via flexion connections: [i,j+2], [i,j−2], [i+2,j], [i−2,j].
    if(isValid(i) && isValid(j+2)){
		vec3.add(NetForce, getFlexForce(p, getPosition(i, j+2)));
    }
    if(isValid(i) && isValid(j-2)){
		vec3.add(NetForce, getFlexForce(p, getPosition(i, j-2)));
    }
    if(isValid(i+2) && isValid(j)){
		vec3.add(NetForce, getFlexForce(p, getPosition(i+2, j)));
    }
    if(isValid(i-2) && isValid(j)){
		vec3.add(NetForce, getFlexForce(p, getPosition(i-2, j)));
    }
    
    /**********Gravity, Damping and ViscousFluid forces*******/
    vec3.add(NetForce, [0,-9.8*mass,0]); //gravity
    vec3.add(NetForce, getDampingForce(i,j)); //damping force
    vec3.add(NetForce, getViscousForce(i,j)); //viscous fluid force
    
    /**********Trigger upward forces*******/
    var depth = 0 - p[1];
    if (depth > 0){
        var Ffloat = mass*10*9.8*depth+mass*30*(0.5-Math.random());
        vec3.add(NetForce, [0,Ffloat,0]); 
    }
    
    return NetForce;
}


function simulate(stepSize) {
    //Compute the accumulated force Fi,j acting on each particle [i,j] for i,j∈{0,1,…,n−1} based on each particle's current position and velocity.
    var F = Array.apply(null, Array(meshResolution)).map(function(x, i) {
        return Array.apply(null, Array(meshResolution)).map(function(x, j) {
            return getNetForce(i,j);
        });
    });
    
    //Update the velocity of each particle using: vi,j←vi,j+ΔtFi,jm.
    for(var i = 0; isValid(i); ++i){
        for(var j = 0; isValid(j); ++j){
            var v = getVelocity(i,j);
            vec3.scale(F[i][j],stepSize/mass);
            vec3.add(v,F[i][j]);
            setVelocity(i,j,v);
        }
    }
    
    //Update the position of each particle (except for the two pinned ones which stay static) using: xi,j←xi,j+Δt⋅vi,j.
    for(var i = 0; isValid(i); ++i){
        for(var j = 0; isValid(j); ++j){
            
//            if((i == meshResolution-1 && j == meshResolution-1) || 
//              (i == meshResolution-1 && j == 0) ||
//              (i == 0 && j == meshResolution-1) ||
//              (i == 0 && j == 0)) 
//                continue;
            
//            //if pinned continue
//            if(i == meshResolution-1 || j == meshResolution-1 || j == 0 || i == 0){
//                //freeze X,Z
//                var oldpos = getPosition(i,j);
//                var newpos = getPosition(i,j);
//                v = getVelocity(i,j);
//                vec3.scale(v,stepSize);
//                vec3.add(newpos,v);
//                setPosition(i,j,[oldpos[0],oldpos[1],oldpos[2]]);
//                continue;
//            }
            
            //update pos
            var p = getPosition(i,j);
            v = getVelocity(i,j);
            vec3.scale(v,stepSize);
            vec3.add(p,v);
            setPosition(i,j,p);
        }
    }
    
}