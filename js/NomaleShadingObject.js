
class NomaleShadingObject {
    constructor(fileName, gl) {
        this.fileName = fileName;
        this.gl = gl;

        this.vertexBuffer = null;
        this.indexBuffer = null;
        this.normalBuffer = null;
        this.numberIndex = 0;

        this.prg = null;

        this.readyToDraw = false;

        this.mvMatrix = mat4.create();
        this.nMatrix = mat3.create();

        this.initProgramme();
        this.load();
    }

    initProgramme() {
        var vx = getShader(this.gl, "plan-shader-vs");
        var fg = getShader(this.gl, "plan-shader-fs");

        this.prg = this.gl.createProgram();
        this.gl.attachShader(this.prg, vx);
        this.gl.attachShader(this.prg, fg);
        this.gl.linkProgram(this.prg);
        this.gl.deleteShader(vx);
        this.gl.deleteShader(fg);

        if (!this.gl.getProgramParameter(this.prg, this.gl.LINK_STATUS)) {
            alert("Could not initialise shaders Plan");
        }

        this.prg.vertexPositionAttribute = this.gl.getAttribLocation(this.prg, 'aVertexPosition');
        this.prg.vertexNormalAttribute = this.gl.getAttribLocation(this.prg, 'aVertexNormal');
        this.prg.pMatrixUniform = this.gl.getUniformLocation(this.prg, 'uPMatrix');
        this.prg.mvMatrixUniform = this.gl.getUniformLocation(this.prg, 'uMVMatrix');
        this.prg.nMatrixUniform = this.gl.getUniformLocation(this.prg, 'uNMatrix');
        this.prg.viewPositionUniform = this.gl.getUniformLocation(this.prg, 'uViewPos');
        this.prg.lightPosUniform = this.gl.getUniformLocation(this.prg, 'uLightPos');
        this.prg.lightColorUniform = this.gl.getUniformLocation(this.prg, 'uLightColor');
        this.prg.planColorUniform = this.gl.getUniformLocation(this.prg, 'uPlanColor');


    }

    load() {
        var me = this;
        var request = new XMLHttpRequest();
        console.info('Requesting ' + this.fileName);
        request.open("GET", this.fileName, true);
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

        this.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(obj.indices), this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        this.readyToDraw = true;

    }


    draw(mvMatrix, pMatrix) {
        if (this.readyToDraw) {

            mat4.identity(this.mvMatrix);
            mat4.multiply(this.mvMatrix, this.mvMatrix, mvMatrix);
            //mat4.translate(this.mvMatrix, this.mvMatrix, [0.0, -10.0, 0.0]);

            mat3.normalFromMat4(this.nMatrix, this.mvMatrix);

            this.gl.useProgram(this.prg);
            this.gl.enableVertexAttribArray(this.prg.vertexPositionAttribute);
            this.gl.enableVertexAttribArray(this.prg.vertexNormalAttribute);

            this.gl.uniform3fv(this.prg.planColorUniform, PLANCOLOR);
            this.gl.uniform3fv(this.prg.lightPosUniform, LIGHTPOS);
            this.gl.uniform3fv(this.prg.lightColorUniform, LIGHTCOLOR);
            this.gl.uniform3fv(this.prg.viewPositionUniform, [0.0,0.0,0.0]);

            this.gl.uniformMatrix4fv(this.prg.pMatrixUniform, false, pMatrix);
            this.gl.uniformMatrix4fv(this.prg.mvMatrixUniform, false, this.mvMatrix);
            this.gl.uniformMatrix3fv(this.prg.nMatrixUniform, false, this.nMatrix);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
            this.gl.vertexAttribPointer(this.prg.vertexPositionAttribute, 3, this.gl.FLOAT, false, 0, 0);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
            this.gl.vertexAttribPointer(this.prg.vertexNormalAttribute, 3, this.gl.FLOAT, false, 0, 0);

            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

            this.gl.drawElements(this.gl.TRIANGLES, this.numberIndex, this.gl.UNSIGNED_SHORT, 0);

            this.gl.disableVertexAttribArray(this.prg.vertexPositionAttribute);
            this.gl.disableVertexAttribArray(this.prg.vertexNormalAttribute);

        }

    }

    shadow(shadowPrg,gl){
        if (this.readyToDraw) {
            var planMat = mat4.create();
            mat4.translate(planMat, planMat, [0.0, -10.0, 0.0]);

            gl.uniformMatrix4fv(shadowPrg.modelUniform, false, planMat);



            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.vertexAttribPointer(shadowPrg.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.drawElements(gl.TRIANGLES, this.numberIndex, gl.UNSIGNED_SHORT, 0);


        }
    }
}