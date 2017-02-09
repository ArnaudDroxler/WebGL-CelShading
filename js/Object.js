

var offset = 0.2;
var outLineColor = [0.1,0.1,0.1];

class Object {
    constructor(fileName){
        this.fileName = fileName;
        this.vertexBuffer = null;
        this.indexBuffer = null;
        this.normalBuffer = null;
        this.numberIndex = 0;
        this.prgOutLine = gl.createProgram();
        this.prgCel = gl.createProgram();

        console.log(this.prgOutLine);
        this.readyToDraw = false;
        this.initProgramme();
        this.load();

    }

  /*  get readyToDraw () {
        return this.readyToDraw;
    }
    set readyToDraw (readyToDraw){
        this.readyToDraw = readyToDraw;
    }*/

    initProgramme(){
        var Ovx = getShader(gl, "outline-shader-vs");
        var Ofg = getShader(gl, "outline-shader-fs");

        var Cvx = getShader(gl, "cel-shader-vs");
        var Cfg = getShader(gl, "cel-shader-fs");

        gl.attachShader(this.prgOutLine, Ovx);
        gl.attachShader(this.prgOutLine, Ofg);
        gl.linkProgram(this.prgOutLine);
        gl.deleteShader(Ovx);
        gl.deleteShader(Ofg);
        console.log(this.prgOutLine);

        gl.attachShader(this.prgCel, Cvx);
        gl.attachShader(this.prgCel, Cfg);
        gl.linkProgram(this.prgCel);
        gl.deleteShader(Cvx);
        gl.deleteShader(Cfg);

        if (!gl.getProgramParameter(this.prgOutLine, gl.LINK_STATUS)) {
            alert("Could not initialise shaders Outline");
        }
        if (!gl.getProgramParameter(this.prgCel, gl.LINK_STATUS)) {
            alert("Could not initialise shaders Cel");
        }

        this.prgOutLine.vertexPositionAttribute = gl.getAttribLocation(this.prgOutLine, 'aVertexPosition');
        gl.enableVertexAttribArray(this.prgOutLine.vertexPositionAttribute);
        this.prgOutLine.vertexNormalAttribute = gl.getAttribLocation(this.prgOutLine, 'aVertexNormal');
        gl.enableVertexAttribArray(this.prgOutLine.vertexNormalAttribute);
        this.prgOutLine.pMatrixUniform = gl.getUniformLocation(this.prgOutLine, 'uPMatrix');
        this.prgOutLine.mvMatrixUniform = gl.getUniformLocation(this.prgOutLine, 'uMVMatrix');
        this.prgOutLine.offsetUniform = gl.getUniformLocation(this.prgOutLine, 'uOffset');
        this.prgOutLine.outLineColor = gl.getUniformLocation(this.prgOutLine, 'uOutLineColor');

        console.log(this.prgOutLine);
        this.prgCel.vertexPositionAttribute = gl.getAttribLocation(this.prgCel, 'aVertexPosition');
        gl.enableVertexAttribArray(this.prgCel.vertexPositionAttribute);
        this.prgCel.vertexNormalAttribute = gl.getAttribLocation(this.prgCel, 'aVertexNormal');
        gl.enableVertexAttribArray(this.prgCel.vertexNormalAttribute);
        this.prgCel.pMatrixUniform = gl.getUniformLocation(this.prgCel, 'uPMatrix');
        this.prgCel.mvMatrixUniform = gl.getUniformLocation(this.prgCel, 'uMVMatrix');

    }

    load(){
        var me = this;
        var request = new XMLHttpRequest();
        console.info('Requesting ' +this.fileName);
        request.open("GET",this.fileName);
        request.onreadystatechange = function () {
            if (request.readyState == 4) {

                if(request.status == 404) {
                    console.info(this.fileName + ' does not exist');
                }
                else {
                    me.handleJSONModel(JSON.parse(request.responseText));
                }
            }
        };
        request.send();
    }

    handleJSONModel(obj) {
        this.numberIndex = obj.indices.length;

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.vertices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.normals), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(obj.indices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this.readyToDraw = true;
    }

    draw(){
        console.log("Object draw");

        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.FRONT);
        gl.useProgram(this.prgOutLine);


        gl.uniformMatrix4fv(this.prgOutLine.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(this.prgOutLine.mvMatrixUniform, false, mvMatrix);
        gl.uniform1f(this.prgOutLine.offsetUniform,offset);
        gl.uniform3fv(this.prgOutLine.outLineColor,outLineColor);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(this.prgOutLine.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(this.prgOutLine.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        gl.drawElements(gl.TRIANGLES, this.numberIndex, gl.UNSIGNED_SHORT,0);


        gl.disable(gl.CULL_FACE);

        gl.useProgram(this.prgCel);

        gl.uniformMatrix4fv(this.prgCel.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(this.prgCel.mvMatrixUniform, false, mvMatrix);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(this.prgCel.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(this.prgCel.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        gl.drawElements(gl.TRIANGLES, this.numberIndex, gl.UNSIGNED_SHORT,0);

    }
}