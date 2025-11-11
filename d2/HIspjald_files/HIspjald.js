var canvas;
var gl;
var numVertices = 6;
var program;
var pointsArray = [];
var texCoordsArray = [];
var texture;
var movement = false;
var spinX = 0;
var spinY = 0;
var origX;
var origY;
var zDist = 5.0;
var proLoc;
var mvLoc;
var uTintLoc;
var tint = [1.0, 1.0, 1.0];
var baseTint = [1.0, 1.0, 1.0];
var activeKey = null;
var lastY = null;
var SENS = 0.003;

var vertices = [
    vec4(-1.0, -1.0, 0.0, 1.0),
    vec4(1.0, -1.0, 0.0, 1.0),
    vec4(1.0, 1.0, 0.0, 1.0),
    vec4(1.0, 1.0, 0.0, 1.0),
    vec4(-1.0, 1.0, 0.0, 1.0),
    vec4(-1.0, -1.0, 0.0, 1.0)
];

var texCoords = [
    vec2(0.0, 0.0),
    vec2(1.0, 0.0),
    vec2(1.0, 1.0),
    vec2(1.0, 1.0),
    vec2(0.0, 1.0),
    vec2(0.0, 0.0)
];

function configureTexture(image) {
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.9, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW);
    var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);
    var image = document.getElementById("texImage");
    configureTexture(image);
    proLoc = gl.getUniformLocation(program, "projection");
    mvLoc = gl.getUniformLocation(program, "modelview");
    uTintLoc = gl.getUniformLocation(program, "uTint");
    gl.uniform3fv(uTintLoc, new Float32Array(tint));
    var proj = perspective(50.0, 1.0, 0.2, 100.0);
    gl.uniformMatrix4fv(proLoc, false, flatten(proj));

    canvas.addEventListener("mousedown", function (e) {
        movement = true;
        origX = e.clientX;
        origY = e.clientY;
        e.preventDefault();
    });

    canvas.addEventListener("mouseup", function (e) {
        movement = false;
    });

    canvas.addEventListener("mousemove", function (e) {
        if (movement) {
            spinY = (spinY + (e.clientX - origX)) % 360;
            spinX = (spinX + (origY - e.clientY)) % 360;
            origX = e.clientX;
            origY = e.clientY;
        }
    });

    window.addEventListener("keydown", function (e) {
        switch (e.keyCode) {
            case 38:
                zDist += 0.1;
                break;
            case 40:
                zDist -= 0.1;
                break;
        }
    });

    window.addEventListener("wheel", function (e) {
        if (e.deltaY > 0.0) {
            zDist += 0.2;
        } else {
            zDist -= 0.2;
        }
    });

    window.addEventListener("keydown", function (e) {
        const k = e.key.toLowerCase();
        if (k === 'r' || k === 'g' || k === 'b') {
            if (e.repeat) return;
            if (activeKey && activeKey !== k) return;
            activeKey = k;
            lastY = null;
            e.preventDefault();
        }
    });

    window.addEventListener("keyup", function (e) {
        if (activeKey && e.key.toLowerCase() === activeKey) {
            activeKey = null;
            tint = baseTint.slice();
        }
    });

    canvas.addEventListener("mousemove", function (e) {
        if (!activeKey) return;
        if (lastY === null) { lastY = e.clientY; return; }
        var dy = lastY - e.clientY;
        lastY = e.clientY;
        var step = dy * SENS;
        function clamp01(x) { return Math.max(0.0, Math.min(1.0, x)); }
        if (activeKey === 'r') tint[0] = clamp01(tint[0] + step);
        if (activeKey === 'g') tint[1] = clamp01(tint[1] + step);
        if (activeKey === 'b') tint[2] = clamp01(tint[2] + step);
    });

    render();
}

var render = function () {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var mv = lookAt(vec3(0.0, 0.0, zDist), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));
    mv = mult(mv, rotateX(spinX));
    mv = mult(mv, rotateY(spinY));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
    gl.uniform3fv(uTintLoc, new Float32Array(tint));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    requestAnimFrame(render);
}
