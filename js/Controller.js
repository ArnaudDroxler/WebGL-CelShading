
class Controller{
    constructor(){

        this.xPos = 0;
        this.yPos = 0;
        this.zPos = 0;

        this.rotY = 0;
        this.rotX = 0;
        this.dragging = false;
        this.oldMousePos = {x: 0, y: 0};


        this.movingStep = 1;

        var self = this;

        this.handleMouseMove = function(event) {
            var mousePos = {
                x: event.clientX,
                y: event.clientY
            };

            var dX = mousePos.x - self.oldMousePos.x;
            var dY = mousePos.y - self.oldMousePos.y;

            if (self.dragging){
                self.rotY += dX;
                self.rotX += dY;
            }

            self.oldMousePos = mousePos;
        };

        window.onkeydown = function (ev) {
            console.log(self.xPos);

            switch(ev.keyCode){
                case 87: self.zPos += 1.0; break;
                case 83: self.zPos -= 1.0; break;
                case 68: self.xPos += 1.0; break;
                case 65: self.xPos -= 1.0; break;
                case 82: self.yPos += 1.0; break;
                case 70: self.yPos -= 1.0; break;
                default:
                    console.log(ev.keyCode);
                    break;
            }
            console.log([self.xPos, self.yPos, self.zPos]);
        };

        window.onmousedown = function () {
            //var pos = self.getMousePos(event);

            self.dragging = true;

            self.oldMousePos.x = event.clientX;
            self.oldMousePos.y = event.clientY;

            window.onmousemove = self.handleMouseMove;
        };
        window.onmouseup = function () {
            self.dragging = false;
            window.onmousemove = null;
        };


    }

    /*getMousePos(event) {
        var rect = canvas.getBoundingClientRect();
        return {x: parseInt((event.clientX - rect.left)), y: parseInt((event.clientY - rect.top))};
    }*/


    apply(mvMatrix){
        //mat4.rotate(mvMatrix,mvMatrix, degToRad(-this.pitch), [1, 0, 0]);
        //mat4.rotate(mvMatrix,mvMatrix, degToRad(-this.yaw), [0, 1, 0]);
        mat4.translate(mvMatrix,mvMatrix, [this.xPos, -this.yPos, -this.zPos]);

    }

    applyRotate(mvMatrix){
        console.log([this.rotY, this.rotX]);
        mat4.rotate(mvMatrix, mvMatrix,degToRad(this.rotX), [1, 0, 0]);
        mat4.rotate(mvMatrix, mvMatrix,degToRad(this.rotY), [0, 1, 0]);
    }


}
