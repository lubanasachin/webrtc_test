var WebSocketServer = require('ws').Server;
var messageHandler = require('./messageHandler');
var PORT_NUMBER = 8090; 
var wss = new WebSocketServer({ port: PORT_NUMBER });

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        var objMessage = JSON.parse(message);
        messageHandler(ws, objMessage);
    });

	ws.on("close", function (code, reason) {
		var message = {type: 'close'};
        messageHandler(ws,message);
	})

});

console.log("started signaling server on port " + PORT_NUMBER);
