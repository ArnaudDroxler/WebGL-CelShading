
var canvas;
var gl;
var prgOutLine;
var prgCel;
var vertexBuffer;
var indexBuffer;
var normalBuffer;
var numberIndex;
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var fov = 60;

var rotY = 0;
var rotX = 0;
var dragging = false;
var oldMousePos = {x: 0, y: 0};

var offset = 0.2;
var outLineColor = [0.1,0.1,0.1];

window.onload = function() {
    //Recuperation du contexte WebGL
    canvas = document.getElementById('glcanvas');
    gl=null;

    try {
        gl = WebGLDebugUtils.makeDebugContext(canvas.getContext("webgl"));
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    }
    catch(e) {
    }
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
    }

    canvas.onmousedown = handleMouseDown;
    canvas.onmouseup = handleMouseUp;

    initProgram();
    initBuffers();
    loadModel("model/teapot.json");
};

function tick() {
    requestAnimFrame(tick);
    drawScene();
}

function initProgram() {
    //Creation du programme
    var Ovx = getShader(gl, "outline-shader-vs");
    var Ofg = getShader(gl, "outline-shader-fs");

    var Cvx = getShader(gl, "cel-shader-vs");
    var Cfg = getShader(gl, "cel-shader-fs");


    prgOutLine = gl.createProgram();
    gl.attachShader(prgOutLine, Ovx);
    gl.attachShader(prgOutLine, Ofg);
    gl.linkProgram(prgOutLine);
    gl.deleteShader(Ovx);
    gl.deleteShader(Ofg);

    prgCel = gl.createProgram();
    gl.attachShader(prgCel, Cvx);
    gl.attachShader(prgCel, Cfg);
    gl.linkProgram(prgCel);
    gl.deleteShader(Cvx);
    gl.deleteShader(Cfg);

    if (!gl.getProgramParameter(prgOutLine, gl.LINK_STATUS)) {
        alert("Could not initialise shaders Outline");
    }
    if (!gl.getProgramParameter(prgCel, gl.LINK_STATUS)) {
        alert("Could not initialise shaders Cel");
    }


    mat4.identity(pMatrix);
    mat4.perspective(pMatrix, degToRad(fov),gl.viewportWidth / gl.viewportHeight, 0.1, 1000.0);
    //Declaration des variables a donner au shader


    prgOutLine.vertexPositionAttribute = gl.getAttribLocation(prgOutLine, 'aVertexPosition');
    gl.enableVertexAttribArray(prgOutLine.vertexPositionAttribute);
    prgOutLine.vertexNormalAttribute = gl.getAttribLocation(prgOutLine, 'aVertexNormal');
    gl.enableVertexAttribArray(prgOutLine.vertexNormalAttribute);
    prgOutLine.pMatrixUniform = gl.getUniformLocation(prgOutLine, 'uPMatrix');
    prgOutLine.mvMatrixUniform = gl.getUniformLocation(prgOutLine, 'uMVMatrix');
    prgOutLine.offsetUniform = gl.getUniformLocation(prgOutLine, 'uOffset');
    prgOutLine.outLineColor = gl.getUniformLocation(prgOutLine, 'uOutLineColor');

    prgCel.vertexPositionAttribute = gl.getAttribLocation(prgCel, 'aVertexPosition');
    gl.enableVertexAttribArray(prgCel.vertexPositionAttribute);
    prgCel.vertexNormalAttribute = gl.getAttribLocation(prgCel, 'aVertexNormal');
    gl.enableVertexAttribArray(prgCel.vertexNormalAttribute);
    prgCel.pMatrixUniform = gl.getUniformLocation(prgCel, 'uPMatrix');
    prgCel.mvMatrixUniform = gl.getUniformLocation(prgCel, 'uMVMatrix');

}

function initBuffers() {

     var vertices = [
     -10.0, -5.0, -10.0,
     +10.0, -5.0, -10.0,
     -10.0, -5.0, +10.0,
     +10.0, -5.0 +10.0
     ];

     var normal = [
     0.0, 1.0, 0.0,
     0.0, 1.0, 0.0,
     0.0, 1.0, 0.0,
     0.0, 1.0, 0.0,
     ];
     var indices = [
        0,1,2,0,2,3
    ];

}

function getShader(gl, id) {
    var script = document.getElementById(id);
    if (!script) {
        return null;
    }

    var str = "";
    var k = script.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }
    var shader;
    if (script.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (script.type == "x-shader/x-vertex") {
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

function drawScene(){

    console.log("draw");
    gl.clearColor(0.5, 0.5, 0.5, 1.0);

    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix,mvMatrix,[0.0, 0.0, -40.0]);
    mat4.rotate(mvMatrix, mvMatrix,degToRad(rotX), [1, 0, 0]);
    mat4.rotate(mvMatrix, mvMatrix,degToRad(rotY), [0, 1, 0]);
    //mat4.rotate(mvMatrix,mvMatrix, degToRad(180), [0, 1, 0]);

    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.FRONT);
    gl.useProgram(prgOutLine);


    gl.uniformMatrix4fv(prgOutLine.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(prgOutLine.mvMatrixUniform, false, mvMatrix);
    gl.uniform1f(prgOutLine.offsetUniform,offset);
    gl.uniform3fv(prgOutLine.outLineColor,outLineColor);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(prgOutLine.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(prgOutLine.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    gl.drawElements(gl.TRIANGLES, numberIndex, gl.UNSIGNED_SHORT,0);


    gl.disable(gl.CULL_FACE);

    gl.useProgram(prgCel);

    gl.uniformMatrix4fv(prgCel.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(prgCel.mvMatrixUniform, false, mvMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(prgCel.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(prgCel.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    gl.drawElements(gl.TRIANGLES, numberIndex, gl.UNSIGNED_SHORT,0);


}

function degToRad(degrees) {
    return (degrees * Math.PI / 180.0);
}


function handleMouseMove(event) {
    var mousePos = {
        x: event.clientX,
        y: event.clientY
    };

    dX = mousePos.x - oldMousePos.x;
    dY = mousePos.y - oldMousePos.y;

    if (dragging){
        rotY += dX;
        rotX += dY;
    }
    oldMousePos = mousePos;
}

function getMousePos(event) {
    var rect = canvas.getBoundingClientRect();
    return {x: parseInt((event.clientX - rect.left)), y: parseInt((event.clientY - rect.top))};
}

function handleMouseDown(event) {
    var pos = getMousePos(event);

    dragging = true;

    oldMousePos.x = event.clientX;
    oldMousePos.y = event.clientY;

    canvas.onmousemove = handleMouseMove;
}


function handleMouseUp(event){
    dragging = false;
    canvas.onmousemove = null;
}


