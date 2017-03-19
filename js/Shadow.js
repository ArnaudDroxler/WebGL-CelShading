
class Shadow {
    constructor(gl,plan, teapot) {

        this.gl = gl;

        this.prg = null;

        this.plan = plan;
        this.teapot = teapot;

        this.shadowWidth = 512;
        this.shadowHeight = 512;

        this.depthMapFrameBuffer = null;
        this.depthMapRenderBuffer = null;
        this.depthMapTexture = null;

        this.lightProjection = mat4.create();
        this.lightView = mat4.create();
        this.lightSpaceMatrix = mat4.create();

        this.initBuffer();
        this.initProgramme();
        this.initMatix();

    }

    initProgramme() {
        var vx = getShader(this.gl, "shadow-shader-vs");
        var fg = getShader(this.gl, "shadow-shader-fs");

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
        this.prg.lightSpaceMatrixUniform = this.gl.getUniformLocation(this.prg, 'uLightSpaceMatrix');
        this.prg.modelUniform = this.gl.getUniformLocation(this.prg, 'uModel');

    }

    initBuffer(){

        this.depthMapFrameBuffer = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.depthMapFrameBuffer);

        this.depthMapRenderBuffer = this.gl.createRenderbuffer();
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.depthMapRenderBuffer);
        this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16 , this.shadowWidth, this.shadowHeight);

        this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.depthMapRenderBuffer);

        this.depthMapTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.depthMapTexture);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.shadowWidth, this.shadowHeight, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.depthMapTexture, 0);

        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

    }

    initMatix(){
        mat4.ortho(this.lightProjection,-10.0,10.0,-10.0,10.0,1.0,7.5);
        mat4.lookAt(this.lightView,LIGHTPOS,[0.0,0.0,0.0],[0.0,1.0,0.0]);
        mat4.multiply(this.lightSpaceMatrix,this.lightProjection,this.lightView);
    }

    draw() {

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.depthMapFrameBuffer);
        this.gl.useProgram(this.prg);
        this.gl.enableVertexAttribArray(this.prg.vertexPositionAttribute);

        this.gl.viewport(0, 0, this.shadowWidth, this.shadowHeight);
        this.gl.clearColor(1.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.gl.uniformMatrix4fv(this.prg.lightSpaceMatrixUniform, false, this.lightSpaceMatrix);

        this.teapot.shadow(this.prg,this.gl);
        this.plan.shadow(this.prg,this.gl);
        this.gl.disableVertexAttribArray(this.prg.vertexPositionAttribute);

    }
}
