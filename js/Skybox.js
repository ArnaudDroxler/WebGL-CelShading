
class Skybox{
    constructor(path,gl){

        this.gl = gl;
        this.path = path
        this.prg;
        this.textures = [];
        this.vertices = [];
        this.normals = [];
        this.texCoord = [];
        this.indices = [];

        this.vertexBuffer = null;
        this.normalBuffer = null;
        this.textureCoordBuffer = null;
        this.indexBuffer = null;

        this.mvMatrix = mat4.create();
        this.pMatrix = mat4.create();

        this.cntLoad = 0;
        this.skybox;
        this.loaded = false;

        this.targets = [
            this.gl.TEXTURE_CUBE_MAP_POSITIVE_X, this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y, this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z, this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
        ];

        this.initProgram();
        this.initBuffers();
        this.initTexture();
    }

    initProgram(){

        var Skyboxvx = getShader(this.gl, "skybox-shader-vs");
        var Skyboxfg = getShader(this.gl, "skybox-shader-fs");

        this.prg = this.gl.createProgram();
        this.gl.attachShader(this.prg, Skyboxvx);
        this.gl.attachShader(this.prg, Skyboxfg);
        this.gl.linkProgram(this.prg);
        this.gl.deleteShader(Skyboxvx);
        this.gl.deleteShader(Skyboxfg);

        if (!this.gl.getProgramParameter(this.prg, this.gl.LINK_STATUS)) {
            alert("Could not initialise shaders Skybox");
        }

        this.prg.sbCoordsAttribute = this.gl.getAttribLocation(this.prg , "aCoords");
        this.gl.enableVertexAttribArray(this.prg.sbCoordsAttribute);
        this.prg.sbMVMatrixUniform = this.gl.getUniformLocation(this.prg , "uMVMatrix");
        this.prg.sbPMatrixUniform = this.gl.getUniformLocation(this.prg , "uPMatrix");
        this.prg.cubeTextureUniform = this.gl.getUniformLocation(this.prg , "uSkybox");

    }

    createFace(xyz, nrm){
        var start = this.vertices.length/3;
        var i;
        for (i = 0; i < 12; i++) {
            this.vertices.push(xyz[i]);
        }
        for (i = 0; i < 4; i++) {
            this.normals.push(nrm[0],nrm[1],nrm[2]);
        }
        this.texCoord.push(0,0,1,0,1,1,0,1);
        this.indices.push(start,start+1,start+2,start,start+2,start+3);
    }

    initBuffers() {
        var s = 1.0;

        this.createFace( [-s,-s,s, s,-s,s, s,s,s, -s,s,s], [0,0,1] );
        this.createFace( [-s,-s,-s, -s,s,-s, s,s,-s, s,-s,-s], [0,0,-1] );
        this.createFace( [-s,s,-s, -s,s,s, s,s,s, s,s,-s], [0,1,0] );
        this.createFace( [-s,-s,-s, s,-s,-s, s,-s,s, -s,-s,s], [0,-1,0] );
        this.createFace( [s,-s,-s, s,s,-s, s,s,s, s,-s,s], [1,0,0] );
        this.createFace( [-s,-s,-s, -s,-s,s, -s,s,s, -s,s,-s], [-1,0,0] );

        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        this.normalBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.normals), this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        this.textureCoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureCoordBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.texCoord), this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        this.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);

    }

    initTexture(){

        this.cntLoad = 0;
        for(var j = 0;j<6;j++)
        {
            this.textures[j] = new Image();
            this.textures[j].onload = this.textureLoading.bind(this);
            this.textures[j].src = this.path + j + ".jpg";
        }
    }

    textureLoading(){
        this.cntLoad++;
        if(this.cntLoad == 6){
            this.skybox = this.gl.createTexture();
            this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.skybox);
            for(var i = 0;i<6;i++)
            {
                this.gl.texImage2D(this.targets[i], 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.textures[i]);
                this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
            }
            this.gl.generateMipmap(this.gl.TEXTURE_CUBE_MAP);
            this.loaded = true;
        }
    }


    draw(mvMatrix,pMatrix){
        if(this.loaded){
            mat4.identity(this.mvMatrix);
            mat4.multiply(this.mvMatrix, this.mvMatrix, mvMatrix);
            
            this.gl.useProgram(this.prg);
            this.gl.disable(this.gl.DEPTH_TEST);

            this.gl.uniformMatrix4fv(this.prg.sbMVMatrixUniform, false, this.mvMatrix);
            this.gl.uniformMatrix4fv(this.prg.sbPMatrixUniform, false, pMatrix);

            this.gl.enableVertexAttribArray(this.prg.sbCoordsAttribute);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
            this.gl.vertexAttribPointer(this.prg.sbCoordsAttribute, 3, this.gl.FLOAT, false, 0, 0);

            this.gl.activeTexture(this.gl.TEXTURE0);

            this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.skybox);

            this.gl.uniform1i(this.prg.cubeTextureUniform, 0);

            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

            this.gl.drawElements(this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_SHORT, 0);

            this.gl.enable(this.gl.DEPTH_TEST);
        }
    }


}
