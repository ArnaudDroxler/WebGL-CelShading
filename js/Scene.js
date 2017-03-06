
class Scene{
    constructor(gl, canvas){

        this.gl = gl;
        this.canvas = canvas;
        this.objects = [];
        this.skybox = new Skybox("textures/skybox/",this.gl);
        this.teapot = new Teapot("model/teapot.json",this.gl);
        this.plan = new Plan("model/plan.json",this.gl);
        this.mvMatrix = mat4.create();
        this.pMatrix = mat4.create();

        this.tick();

    }

    tick() {
        var self = this;
        requestAnimFrame(function() { self.tick(); } );
        this.teapot.animate();
        this.drawScene();
    }

    drawScene(){
        console.log("draw Call");
        this.gl.clearColor(0.1, 0.1, 0.1, 1.0);

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);

        mat4.identity(this.pMatrix);
        mat4.perspective(this.pMatrix, degToRad(70),this.gl.viewportWidth / this.gl.viewportHeight, 0.1, 1000.0);

        mat4.identity(this.mvMatrix);

        this.skybox.draw(this.mvMatrix,this.pMatrix);
        
        mat4.translate(this.mvMatrix, this.mvMatrix, [0.0, 0.0, -40.0]);

        this.plan.draw(this.mvMatrix,this.pMatrix);

        this.teapot.draw(this.mvMatrix,this.pMatrix);

    }



}
