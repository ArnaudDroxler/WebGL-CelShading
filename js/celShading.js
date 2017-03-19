
const LIGHTPOS = vec3.fromValues(30.0,30.0,10.0);
const LIGHTCOLOR = vec3.fromValues(1.0,1.0,1.0);

const OFFSET = 0.3;
const OUTLINECOLOR = vec3.fromValues(0.0,0.0,0.0);
const CELCOLOR = vec3.fromValues(1.0,0.6,0.1);

const PLANCOLOR = vec3.fromValues(0.9,0.9,0.9);

window.onload = function() {
    var canvas = document.getElementById('glcanvas');
    var gl=null;

    try {
        gl = WebGLDebugUtils.makeDebugContext(canvas.getContext("experimental-webgl", {antialias: true}));
        var ext = GL.getExtension("OES_element_index_uint") ||  GL.getExtension("MOZ_OES_element_index_uint") ||  GL.getExtension("WEBKIT_OES_element_index_uint");
        var displayWidth = document.getElementById('container').clientWidth;
        var displayHeight = document.getElementById('container').clientHeight;

        console.log(displayWidth +" "+displayHeight );

        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewportWidth = displayWidth;
        gl.viewportHeight = displayHeight;
    }
    catch(e) {
    }
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
    }

    var scene = new Scene(gl, canvas);

};


function degToRad(degrees) {
    return (degrees * Math.PI / 180.0);
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

