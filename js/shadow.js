
class Shadow {
    constructor(gl) {

        this.gl = gl;

        this.prg = null;

        this.shadowWidth = 1024;
        this.shadowHeight = 1024;

        this.depthMapFrameBuffer = null;
        this.depthMapTexture = null;

        this.lightProjection = mat4.create();
        this.lightView = mat4.create();
        this.lightSpaceMatrix = mat4.create();

        this.initBuffer();
        this.initProgramme();
        this.initMatix();

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
        this.gl.enableVertexAttribArray(this.prg.vertexPositionAttribute);
        this.prg.vertexNormalAttribute = this.gl.getAttribLocation(this.prg, 'aVertexNormal');
        this.gl.enableVertexAttribArray(this.prg.vertexNormalAttribute);
        this.prg.pMatrixUniform = this.gl.getUniformLocation(this.prg, 'uPMatrix');
        this.prg.mvMatrixUniform = this.gl.getUniformLocation(this.prg, 'uMVMatrix');
        this.prg.nMatrixUniform = this.gl.getUniformLocation(this.prg, 'uNMatrix');
        this.prg.viewPositionUniform = this.gl.getUniformLocation(this.prg, 'uViewPos');
        this.prg.lightPosUniform = this.gl.getUniformLocation(this.prg, 'uLightPos');
        this.prg.lightColorUniform = this.gl.getUniformLocation(this.prg, 'uLightColor');
        this.prg.planColorUniform = this.gl.getUniformLocation(this.prg, 'uPlanColor');


    }

    initBuffer(){

        this.depthMapFrameBuffer = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthMapFrameBuffer);

        this.depthMapTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.depthMapTexture);

        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.DEPTH_COMPONENT, this.shadowWidth, this.shadowHeight, 0, this.gl.DEPTH_COMPONENT, this.gl.FLOAT, null);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.DEPTH_ATTACHMENT, this.gl.TEXTURE_2D, this.depthMapTexture,0 );

    }

    initMatix(){
        mat4.ortho(this.lightProjection,-10.0,10.0,-10.0,10.0,1.0,7.5);
        mat4.lookAt(this.lightView,LIGHTPOS,[0.0,0.0,0.0],[0.0,1.0,0.0]);
        mat4.multiply(this.lightSpaceMatrix,this.lightProjection,this.lightView);
    }

    draw() {

            this.gl.useProgram(this.prg);

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
    }
}
