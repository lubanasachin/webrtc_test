var  connectedPeers = {};
function onMessage(ws, message) {
    var type = message.type;
    switch (type) {
        case "ICECandidate":
            onICECandidate(message.ICECandidate, message.destination, ws.id);
            break;
        case "offer":
            onOffer(message.offer, message.destination, ws.id);
            break;
        case "answer":
            onAnswer(message.answer, message.destination, ws.id);
            break;
        case "init":
            onInit(ws, message.init);
            break;
        case "close":
            onClose(ws);
            break;
        default:
            throw new Error("invalid message type");
    }
}

function onInit(ws, id){
    ws.id = id;
	var availablePeers = [];
	for(var peer in connectedPeers) {
    	connectedPeers[peer].send(JSON.stringify({
        	type:'available',
        	source:id,
    	}));
		availablePeers.push(peer);
	}
    connectedPeers[id] = ws;

	connectedPeers[id].send(JSON.stringify({
		type:'availablePeers',
		peers: availablePeers,
		source:id,
	}));	
}

function onClose(ws) {
	var myid = ws.id;
	for(var peer in connectedPeers) {
		if(peer == myid) continue;
    	connectedPeers[peer].send(JSON.stringify({
        	type:'unavailable',
        	source:myid,
    	}));
	}
	delete connectedPeers[myid];
}

function onOffer(offer, destination, source){
    console.log("offer from peer:", source, "to peer", destination);
    connectedPeers[destination].send(JSON.stringify({
        type:'offer',
        offer:offer,
        source:source,
    }));
}

function onAnswer(answer, destination, source){
    console.log("answer from peer:", source, "to peer", destination);
    connectedPeers[destination].send(JSON.stringify({
        type: 'answer',
        answer: answer,
        source: source,
    }));
}

function onICECandidate(ICECandidate, destination, source){
    console.log("ICECandidate from peer:", source, "to peer", destination);
    connectedPeers[destination].send(JSON.stringify({
        type: 'ICECandidate',
        ICECandidate: ICECandidate,
        source: source,
    }));
}

module.exports = onMessage;

//exporting for unit tests only
module.exports._connectedPeers = connectedPeers;
