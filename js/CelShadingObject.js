
class CelShadingObject {
    constructor(fileName, gl) {
        this.fileName = fileName;

        this.gl = gl;

        this.vertexBuffer = null;
        this.indexBuffer = null;
        this.normalBuffer = null;
        //this.textureBuffer = null;
        this.numberIndex = 0;

        this.prgOutLine = null;
        this.prgCel = null;

        this.readyToDraw = false;

        this.mvMatrix = mat4.create();
        this.nMatrix = mat3.create();

        this.texture = null;

        this.i = 0;

        this.initProgramme();
        this.load();
    }

    initProgramme() {
        var Ovx = getShader(this.gl, "outline-shader-vs");
        var Ofg = getShader(this.gl, "outline-shader-fs");

        var Cvx = getShader(this.gl, "cel-shader-vs");
        var Cfg = getShader(this.gl, "cel-shader-fs");

        this.prgOutLine = this.gl.createProgram();
        this.gl.attachShader(this.prgOutLine, Ovx);
        this.gl.attachShader(this.prgOutLine, Ofg);
        this.gl.linkProgram(this.prgOutLine);
        this.gl.deleteShader(Ovx);
        this.gl.deleteShader(Ofg);

        this.prgCel = this.gl.createProgram();
        this.gl.attachShader(this.prgCel, Cvx);
        this.gl.attachShader(this.prgCel, Cfg);
        this.gl.linkProgram(this.prgCel);
        this.gl.deleteShader(Cvx);
        this.gl.deleteShader(Cfg);

        if (!this.gl.getProgramParameter(this.prgOutLine, this.gl.LINK_STATUS)) {
            alert("Could not initialise shaders Outline");
        }
        if (!this.gl.getProgramParameter(this.prgCel, this.gl.LINK_STATUS)) {
            alert("Could not initialise shaders Cel");
        }

        this.prgOutLine.vertexPositionAttribute = this.gl.getAttribLocation(this.prgOutLine, 'aVertexPosition');
        this.gl.enableVertexAttribArray(this.prgOutLine.vertexPositionAttribute);
        this.prgOutLine.vertexNormalAttribute = this.gl.getAttribLocation(this.prgOutLine, 'aVertexNormal');
        this.gl.enableVertexAttribArray(this.prgOutLine.vertexNormalAttribute);
        this.prgOutLine.pMatrixUniform = this.gl.getUniformLocation(this.prgOutLine, 'uPMatrix');
        this.prgOutLine.mvMatrixUniform = this.gl.getUniformLocation(this.prgOutLine, 'uMVMatrix');
        this.prgOutLine.offsetUniform = this.gl.getUniformLocation(this.prgOutLine, 'uOffset');
        this.prgOutLine.outLineColor = this.gl.getUniformLocation(this.prgOutLine, 'uOutLineColor');


        this.prgCel.vertexPositionAttribute = this.gl.getAttribLocation(this.prgCel, 'aVertexPosition');
        this.gl.enableVertexAttribArray(this.prgCel.vertexPositionAttribute);
        this.prgCel.vertexNormalAttribute = this.gl.getAttribLocation(this.prgCel, 'aVertexNormal');
        this.gl.enableVertexAttribArray(this.prgCel.vertexNormalAttribute);
        //this.prgCel.textureCoordAttribute = gl.getAttribLocation(this.prgCel, 'aTextureCoord');
        //gl.enableVertexAttribArray(this.prgCel.textureCoordAttribute);
        this.prgCel.pMatrixUniform = this.gl.getUniformLocation(this.prgCel, 'uPMatrix');
        this.prgCel.mvMatrixUniform = this.gl.getUniformLocation(this.prgCel, 'uMVMatrix');
        this.prgCel.nMatrixUniform = this.gl.getUniformLocation(this.prgCel, 'uNMatrix');
        this.prgCel.viewPositionUniform = this.gl.getUniformLocation(this.prgCel, 'uViewPos');
        this.prgCel.lightPosUniform = this.gl.getUniformLocation(this.prgCel, 'uLightPos');
        this.prgCel.lightColorUniform = this.gl.getUniformLocation(this.prgCel, 'uLightColor');
        this.prgCel.celColorUniform = this.gl.getUniformLocation(this.prgCel, 'uCelColor');
        //this.prgCel.celShadingUniform = gl.getUniformLocation(this.prgCel, 'uCelShading');
        //this.prgCel.textureUniform = gl.getUniformLocation(this.prgCel, 'uTexture');


    }

    load() {
        var me = this;

        /*this.texture = gl.createTexture();
         this.texture.image = new Image();
         this.texture.image.onload = function () {
         gl.bindTexture(gl.TEXTURE_2D,  me.texture);
         gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
         gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,  me.texture.image);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
         gl.bindTexture(gl.TEXTURE_2D, null);
         };
         this.texture.image.src = "textures/teapot.jpeg";*/

        var request = new XMLHttpRequest();
        console.info('Requesting ' + this.fileName);
        request.open("GET", this.fileName);
        request.onreadystatechange = function () {
            if (request.readyState == 4) {

                if (request.status == 404) {
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

        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(obj.vertices), this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        this.normalBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(obj.normals), this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        /* this.textureBuffer = gl.createBuffer();
         gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
         gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.vertexTextureCoords), gl.STATIC_DRAW);
         gl.bindBuffer(gl.ARRAY_BUFFER, null);*/

        this.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(obj.indices), this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        this.readyToDraw = true;
    }

    animate() {
        this.i += 1;
        if(this.i == 630){
            this.i = 0;
        }
    }

    draw(mvMatrix, pMatrix) {
        if (this.readyToDraw) {
            mat4.identity(this.mvMatrix);
            mat4.multiply(this.mvMatrix, this.mvMatrix, mvMatrix);
            mat4.translate(this.mvMatrix, this.mvMatrix, [0.0, 0.0, 0.0]);
            mat4.rotateY(this.mvMatrix, this.mvMatrix, this.i*0.01);

            mat3.normalFromMat4(this.nMatrix, this.mvMatrix);

            this.gl.enable(this.gl.CULL_FACE);
            this.gl.cullFace(this.gl.FRONT);
            this.gl.useProgram(this.prgOutLine);

            this.gl.uniformMatrix4fv(this.prgOutLine.pMatrixUniform, false, pMatrix);
            this.gl.uniformMatrix4fv(this.prgOutLine.mvMatrixUniform, false, this.mvMatrix);

            this.gl.uniform1f(this.prgOutLine.offsetUniform, OFFSET);
            this.gl.uniform3fv(this.prgOutLine.outLineColor, OUTLINECOLOR);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
            this.gl.vertexAttribPointer(this.prgOutLine.vertexPositionAttribute, 3, this.gl.FLOAT, false, 0, 0);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
            this.gl.vertexAttribPointer(this.prgOutLine.vertexNormalAttribute, 3, this.gl.FLOAT, false, 0, 0);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

            this.gl.drawElements(this.gl.TRIANGLES, this.numberIndex, this.gl.UNSIGNED_SHORT, 0);

            this.gl.disable(this.gl.CULL_FACE);


            this.gl.useProgram(this.prgCel);

            this.gl.uniformMatrix4fv(this.prgCel.pMatrixUniform, false, pMatrix);
            this.gl.uniformMatrix4fv(this.prgCel.mvMatrixUniform, false, this.mvMatrix);
            this.gl.uniformMatrix3fv(this.prgCel.nMatrixUniform, false, this.nMatrix);

            this.gl.uniform3fv(this.prgCel.lightPosUniform, LIGHTPOS);
            this.gl.uniform3fv(this.prgCel.lightColorUniform, LIGHTCOLOR);
            this.gl.uniform3fv(this.prgCel.celColorUniform, CELCOLOR);
            this.gl.uniform3fv(this.prgCel.viewPositionUniform, [0.0,0.0,0.0]);

            //gl.uniform1i(this.prgCel.celShadingUniform, celShading);


            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
            this.gl.vertexAttribPointer(this.prgCel.vertexPositionAttribute, 3, this.gl.FLOAT, false, 0, 0);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
            this.gl.vertexAttribPointer(this.prgCel.vertexNormalAttribute, 3, this.gl.FLOAT, false, 0, 0);

            //gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
            //gl.vertexAttribPointer(this.prgCel.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);

            /* gl.activeTexture(gl.TEXTURE0);
             gl.bindTexture(gl.TEXTURE_2D, this.texture);
             gl.uniform1i(this.prgCel.textureUniform, 0);*/

            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

            this.gl.drawElements(this.gl.TRIANGLES, this.numberIndex, this.gl.UNSIGNED_SHORT, 0);
        }

    }
}