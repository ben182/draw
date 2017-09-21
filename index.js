'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
const crypto = require('crypto');
const handlebars = require('handlebars');
const fs = require('fs');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
    .use("/dist", express.static(__dirname + '/dist'))
    .use((req, res) => res.sendFile(INDEX))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = socketIO(server);

// CONNECT

//io.on('connection', connectionCallback);

let oWaitingList = {};

io.on('connection', (oClient) => {
    console.log('New Connect ' + oClient.id);
    logAllClients();

    // Check if any oClients available in waiting list
    // If so connect them
    // If not Send oClient to Waiting List and wait
    oClient.activeMatch = 0;

    connectToClientsWithEachOther(oClient);

    //console.log('oWaitingList', oWaitingList);

    oClient.on('disconnect', function () {
        console.log('Disconnect ' + oClient.id);

        // If client is connected
        if (io.sockets.connected[oClient.activeMatch]) {

            var oTarget = io.sockets.connected[oClient.activeMatch];

            oTarget.leaveAll(); // Target Client leaves the room

            oWaitingList[oClient.activeMatch] = oTarget; // send Target Client to Waiting List

            sendStatusToClient(oClient.activeMatch, 'On The Waiting List'); // Send Status to Target Client

            connectToClientsWithEachOther(oTarget);
        }

        delete oWaitingList[oClient.id];

        logAllClients();
    });

    oClient.on('move', function (msg) {
        var sActiveRoom = getActiveRoom(oClient);
        if (!sActiveRoom) {
            console.log('No Active Rooms Found');
            return;
        }

        io.sockets.in(sActiveRoom).emit('move', msg);
    });

    oClient.on('getDrawing', function (msg) {
        oClient.emit('log', aDrawing);
    });

    
});

function connectToClientsWithEachOther(oClient) {
    if (Object.keys(oWaitingList).length > 0) { // If There are waiting clients

        for (var sWaiter in oWaitingList) {
            if (!oWaitingList.hasOwnProperty(sWaiter)) {
                continue;
            }

            if (oClient.id == sWaiter) {
                continue;
            }

            // https://stackoverflow.com/a/14869745
            var iRoomId = crypto.randomBytes(20).toString('hex');

            // First Client in Waiting List
            var oTarget = oWaitingList[Object.keys(oWaitingList)[0]];

            oClient.join(iRoomId);
            oTarget.join(iRoomId);

            oClient.activeMatch = oTarget.id;
            oTarget.activeMatch = oClient.id;

            delete oWaitingList[oClient.id];
            delete oWaitingList[oTarget.id];

            console.log('Match Found! Added ' + oClient.id + ' and ' + oTarget.id + ' to the Room ' + iRoomId);

            logAllClients();

            sendStatusToClient(oClient.id, 'Matched With ' + oTarget.id);
            sendStatusToClient(oTarget.id, 'Matched With ' + oClient.id);

            break;
        }

        return;

    }

    oWaitingList[oClient.id] = oClient;
    console.log('No Match Found! Added Client to the Waiting List');

    sendStatusToClient(oClient.id, 'On The Waiting List');

}

// Helper
function logAllClients() {
    console.log('Waiting List:', oWaitingList);
    console.log('All Clients:', io.sockets.sockets);
    console.log('All Rooms:', io.sockets.adapter.rooms);
}

function getActiveRoom(oClient) {
    var aAllRooms = Object.keys(oClient.rooms).filter(item => item != oClient.id);

    if (aAllRooms.length > 0) {
        return aAllRooms[0];
    }

    return false;
}

function sendStatusToClient(sClientId, sStatus) {
    io.sockets.connected[sClientId].emit('status', 'Status Change: ' + sStatus);
}


function parseTemplate(file, data) {

    let source = fs.readFileSync(file, 'utf-8');
    console.log(source);

    var template = handlebars.compile(source);
    return template(data);
}