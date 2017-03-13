
class Scene{
    constructor(gl, canvas){

        this.gl = gl;
        this.canvas = canvas;
        this.skybox = new Skybox("textures/skybox/",this.gl);
        this.teapot = new CelShadingObject("model/teapot.json",this.gl);

        this.plan = new NomaleShadingObject("model/plan.json",this.gl);
        this.front = new NomaleShadingObject("model/plan.json",this.gl);
        this.left = new NomaleShadingObject("model/plan.json",this.gl);
        this.right = new NomaleShadingObject("model/plan.json",this.gl);

        this.mvMatrix = mat4.create();
        this.pMatrix = mat4.create();

        this.tick();

    }

    tick() {
        var self = this;
        requestAnimFrame(function() { self.tick(); } );
        this.resizeCanvas();
        this.teapot.animate();
        this.drawScene();
    }

    drawScene(){
        //console.log("draw Call");
        this.gl.clearColor(0.2, 0.2, 0.2, 1.0);

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);

        mat4.identity(this.pMatrix);
        mat4.perspective(this.pMatrix, degToRad(60),this.gl.viewportWidth / this.gl.viewportHeight, 0.1, 1000.0);

        mat4.identity(this.mvMatrix);

        //this.skybox.draw(this.mvMatrix,this.pMatrix);

        mat4.translate(this.mvMatrix, this.mvMatrix, [0.0, -2.0, -45.0]);
        mat4.rotateX(this.mvMatrix, this.mvMatrix, 0.3);

        var planMat = mat4.create();
        mat4.copy(planMat,this.mvMatrix);
        mat4.translate(planMat, planMat, [0.0, -10.0, 0.0]);
        this.plan.draw(planMat,this.pMatrix);

        /*var frontMat = mat4.create();
        mat4.copy(frontMat,this.mvMatrix);
        mat4.rotateX(frontMat, frontMat, degToRad(90));
        mat4.translate(frontMat, frontMat, [0.0,-50.0,-25.0]);
        this.front.draw(frontMat,this.pMatrix);

        var leftMat = mat4.create();
        mat4.copy(leftMat,this.mvMatrix);
        mat4.rotateX(leftMat, leftMat, degToRad(90));
        mat4.rotateZ(leftMat, leftMat, degToRad(-90));
        mat4.translate(leftMat, leftMat, [0.0,-50.0,-25.0]);
        this.left.draw(leftMat,this.pMatrix);

        var rightMat = mat4.create();
        mat4.copy(rightMat,this.mvMatrix);
        mat4.rotateX(rightMat, rightMat, degToRad(90));
        mat4.rotateZ(rightMat, rightMat, degToRad(90));
        mat4.translate(rightMat, rightMat, [0.0,-50.0,-25.0]);
        this.right.draw(rightMat,this.pMatrix);*/

        this.teapot.draw(this.mvMatrix,this.pMatrix);

    }

    resizeCanvas() {
        var displayWidth = document.getElementById('container').clientWidth;
        var displayHeight = document.getElementById('container').clientHeight;

        if (this.gl.viewportWidth != displayWidth || this.gl.viewportHeight != displayHeight) {
            this.gl.viewportWidth = displayWidth;
            this.gl.viewportHeight = displayHeight;
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
    }
}




}
