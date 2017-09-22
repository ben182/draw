var app = new Vue({
    el: '#app',
    data: {
        status: 'Waiting for other player',
        sSocketId: '',
        bInit: false,
        oSocket: null,
        oRoom: {}
    },
    methods: {
        init: function() {
            var _that = this;

            this.oSocket = io();

            this.oSocket.on('connect', function() {
                _that.sSocketId = _that.oSocket.id;
                _that.bInit = true;
            });
        }
    }
})

app.init();

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


    app.oSocket.emit('move', getRelativeMouse());

}

app.oSocket.on('move', function (msg) {
    line(msg.mouseX * windowWidth, msg.mouseY * windowHeight, msg.pmouseX * windowWidth, msg.pmouseY * windowHeight);
});

app.oSocket.on('log', function (msg) {
    console.log(msg);

    for (var index = 0; index < msg.length; index++) {
        var element = msg[index];
        line(element.mouseX * windowWidth, element.mouseY * windowHeight, element.pmouseX * windowWidth, element.pmouseY * windowHeight);

    }
});

app.oSocket.on('room', function (msg) {
    app.oRoom = msg;
});

function getRelativeMouse() {
    return {
        mouseX: mouseX / windowWidth,
        mouseY: mouseY / windowHeight,
        pmouseX: pmouseX / windowWidth,
        pmouseY: pmouseY / windowHeight
    }
}