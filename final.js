/*
 * Rendering control
 */
function changeResolution(sel) {
    var id = parseInt(sel.value, 10);

    var width = 0, height = 0;
    switch ( id ) {
        case 0:
            width = 640; height = 480; break;

        case 1:
            width = 800; height = 600; break;

        case 2:
            width = 960; height = 720; break;

        default:
            alert("Unknown resolution!");
    }

    if ( width > 0 ) {
        var canvas = $("#canvas0")[0];
        
        canvas.width = width; 
        canvas.height = height;

        gl.viewportWidth = width;
        gl.viewportHeight = height;
    }
}

function changeMode(value) {
    drawMode = parseInt(value, 10);
}

function changeRotatingState(ifRotating) {
    rotating = ifRotating;
    $("#sliderBar").prop("disabled", !rotating);
}

function updateSlider(sliderAmount) {
    $("#sliderAmount").html(sliderAmount*10);
    rotSpeed = sliderAmount*10.0;
}

function changeAnimatedLightState(ifAnimated) {
    rotating_light = ifAnimated;
    $("#sliderBarLight").prop("enabled", !rotating_light);
}

function updateSliderLight(sliderAmount) {
    var value = sliderAmount*10.0;
    $("#sliderAmountLight").html(value);
    rotSpeed_light = value;
}

function updateSliderMass(sliderAmount) {
    var value = sliderAmount*0.1;
    $("#sliderAmountMass").html(value.toFixed(1));
    mass = value;
}

function updateSliderK0(sliderAmount) {
    var value = sliderAmount*1000.0;
    $("#sliderAmountK0").html(sliderAmount);
    K[0] = value;
}

function updateSliderK1(sliderAmount) {
    var value = sliderAmount*1000.0;
    $("#sliderAmountK1").html(sliderAmount);
    K[1] = value;
}

function updateSliderK2(sliderAmount) {
    var value = sliderAmount*1000.0;
    $("#sliderAmountK2").html(sliderAmount);
    K[2] = value;
}

function updateSliderCd(sliderAmount) {
    var value = sliderAmount*0.1;
    $("#sliderAmountCd").html(value.toFixed(1));
    Cd = value;
}

function updateSliderCv(sliderAmount) {
    var value = sliderAmount*0.1;
    $("#sliderAmountCv").html(value.toFixed(1));
    Cv = value;
}

/*
 * Animation control
 */
function changeMeshResolution(value) {
    var id = parseInt(value, 10);
    switch ( id ) {
    case 1:
        meshResolution = 30; break;
    }
    initMesh();
    initBuffers(false);
}

function changeAnimatedState(value) {
    animated = value;
}

/*
 * Page-load handler
 */
$(function() {
    webGLStart();
});
