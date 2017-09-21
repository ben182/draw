var app = new Vue({
    el: '#app',
    data: {
        status: '',
        sSocketId: ''
    }
})

var socket = io();

socket.on('connect', function (msg) {
    app.sSocketId = socket.id;
});

var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;

function setup() {
    var canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('#app');
    strokeWeight(5)
    //stroke(0);
}

function draw() {


}

function mouseDragged() {

    line(mouseX, mouseY, pmouseX, pmouseY);


    socket.emit('move', getRelativeMouse());

}

socket.on('move', function (msg) {
    line(msg.mouseX * windowWidth, msg.mouseY * windowHeight, msg.pmouseX * windowWidth, msg.pmouseY * windowHeight);
});

socket.on('log', function (msg) {
    console.log(msg);

    for (var index = 0; index < msg.length; index++) {
        var element = msg[index];
        line(element.mouseX * windowWidth, element.mouseY * windowHeight, element.pmouseX * windowWidth, element.pmouseY * windowHeight);

    }
});

socket.on('status', function (msg) {
    app.status = msg;
});

function getRelativeMouse() {
    return {
        mouseX: mouseX / windowWidth,
        mouseY: mouseY / windowHeight,
        pmouseX: pmouseX / windowWidth,
        pmouseY: pmouseY / windowHeight
    }
}