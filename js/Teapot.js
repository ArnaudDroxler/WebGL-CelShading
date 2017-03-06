
class Object{
    constructor(fileName){
        this.fileName = fileName;

        this.vertexBuffer = null;
        this.indexBuffer = null;
        this.normalBuffer = null;;
        this.numberIndex = 0;

        this.readyToDraw = false;
    }

    load(){
        var self = this;

        var request = new XMLHttpRequest();
        console.info('Requesting ' +this.fileName);
        request.open("GET",this.fileName);
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                if(request.status == 404) {
                    console.info(this.fileName + ' does not exist');
                }
                else {
                    self.handleJSONModel(JSON.parse(request.responseText));
                }
            }
        };
        request.send();

    }

    handleJSONModel(obj) {
        this.numberIndex = obj.indices.length;

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.vertexPositions), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.vertexNormals), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(obj.indices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this.readyToDraw = true;
    }

 }


/*
class Object {
    constructor(fileName,offset,celColor,outLinecolor){
        this.fileName = fileName;

        this.offset = offset;
        this.celColor = celColor;
        this.outLinecolor = outLinecolor;

        this.vertexBuffer = null;
        this.indexBuffer = null;
        this.normalBuffer = null;
        this.textureBuffer = null;
        this.numberIndex = 0;

        this.prgOutLine = null;
        this.prgCel = null;

        this.readyToDraw = false;

        this.mvMatrix = mat4.create();
        this.nMatrix = mat3.create();

        this.texture = null;

        this.i  = 0;

        this.initProgramme();
        this.load();
    }

    initProgramme(){
        var Ovx = getShader(gl, "outline-shader-vs");
        var Ofg = getShader(gl, "outline-shader-fs");

        var Cvx = getShader(gl, "cel-shader-vs");
        var Cfg = getShader(gl, "cel-shader-fs");

        this.prgOutLine = gl.createProgram();
        gl.attachShader(this.prgOutLine, Ovx);
        gl.attachShader(this.prgOutLine, Ofg);
        gl.linkProgram(this.prgOutLine);
        gl.deleteShader(Ovx);
        gl.deleteShader(Ofg);

        this.prgCel = gl.createProgram();
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


        this.prgCel.vertexPositionAttribute = gl.getAttribLocation(this.prgCel, 'aVertexPosition');
        gl.enableVertexAttribArray(this.prgCel.vertexPositionAttribute);
        this.prgCel.vertexNormalAttribute = gl.getAttribLocation(this.prgCel, 'aVertexNormal');
        gl.enableVertexAttribArray(this.prgCel.vertexNormalAttribute);
        //this.prgCel.textureCoordAttribute = gl.getAttribLocation(this.prgCel, 'aTextureCoord');
        //gl.enableVertexAttribArray(this.prgCel.textureCoordAttribute);
        this.prgCel.pMatrixUniform = gl.getUniformLocation(this.prgCel, 'uPMatrix');
        this.prgCel.mvMatrixUniform = gl.getUniformLocation(this.prgCel, 'uMVMatrix');
        this.prgCel.nMatrixUniform = gl.getUniformLocation(this.prgCel, 'uUMatrix');
        this.prgCel.lightPosUniform = gl.getUniformLocation(this.prgCel, 'uLightPos');
        this.prgCel.lightColorUniform = gl.getUniformLocation(this.prgCel, 'uLightColor');
        this.prgCel.celColorUniform = gl.getUniformLocation(this.prgCel, 'uCelColor');
        this.prgCel.celShadingUniform = gl.getUniformLocation(this.prgCel, 'uCelShading');
        this.prgCel.textureUniform = gl.getUniformLocation(this.prgCel, 'uTexture');


    }

    load(){
        var me = this;

        this.texture = gl.createTexture();
        this.texture.image = new Image();
        this.texture.image.onload = function () {
            gl.bindTexture(gl.TEXTURE_2D,  me.texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,  me.texture.image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.bindTexture(gl.TEXTURE_2D, null);
        };
        this.texture.image.src = "textures/teapot.jpeg";

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
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.vertexPositions), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.vertexNormals), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this.textureBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.vertexTextureCoords), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(obj.indices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this.readyToDraw = true;
    }

    draw(mvMatrix){

        mat4.identity(this.mvMatrix);
        mat4.multiply(this.mvMatrix, this.mvMatrix, mvMatrix);
        //mat4.rotateY(this.mvMatrix,this.mvMatrix,degToRad(this.i++));

        mat3.normalFromMat4(this.nMatrix,this.mvMatrix);

       if(celShading){
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.FRONT);
            gl.useProgram(this.prgOutLine);

            gl.uniformMatrix4fv(this.prgOutLine.pMatrixUniform, false, pMatrix);
            gl.uniformMatrix4fv(this.prgOutLine.mvMatrixUniform, false, this.mvMatrix);

            gl.uniform1f(this.prgOutLine.offsetUniform,this.offset);
            gl.uniform3fv(this.prgOutLine.outLineColor,this.outLinecolor);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.vertexAttribPointer(this.prgOutLine.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.vertexAttribPointer(this.prgOutLine.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.drawElements(gl.TRIANGLES, this.numberIndex, gl.UNSIGNED_SHORT,0);

            gl.disable(gl.CULL_FACE);
        }


        gl.useProgram(this.prgCel);

        gl.uniformMatrix4fv(this.prgCel.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(this.prgCel.mvMatrixUniform, false, this.mvMatrix);

        gl.uniform3fv(this.prgCel.lightPosUniform,LIGHTPOS );
        gl.uniform3fv(this.prgCel.lightColorUniform, LIGHTCOLOR);
        gl.uniform3fv(this.prgCel.celColorUniform, this.celColor);
        gl.uniform1i(this.prgCel.celShadingUniform, celShading);


        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(this.prgCel.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(this.prgCel.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

        //gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
        //gl.vertexAttribPointer(this.prgCel.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(this.prgCel.textureUniform, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        gl.drawElements(gl.TRIANGLES, this.numberIndex, gl.UNSIGNED_SHORT,0);

    }
}*/