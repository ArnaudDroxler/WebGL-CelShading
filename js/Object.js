
class Object {
    constructor(fileName){
        this.fileName = fileName;
        this.vertexBuffer = null;
        this.indexBuffer = null;
        this.colorBuffer = null;
        loadModel(fileName);
    }

    load(filename){
        var request = new XMLHttpRequest();
        console.info('Requesting ' + filename);
        request.open("GET",filename);

        request.onreadystatechange = function() {
            if (request.readyState == 4) {
                if(request.status == 404) {
                    console.info(filename + ' does not exist');
                }
                else {
                    handleJSONModel(JSON.parse(request.responseText));
                }
            }
        }
        request.send();
    }

    handleJSONModel(obj) {
        numberIndex = obj.indices.length;

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.vertices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.normals), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(obj.indices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

    }

    draw(){

    }
}