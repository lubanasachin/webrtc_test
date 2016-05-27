function signalClient() {

    var _ws,
		_id,
		self = this;

	function _onInit(socketUrl,myId) {
		_id = myId;
		_ws = new WebSocket(socketUrl);
        _ws.onopen 		= _onConnectionEstablished;
        _ws.onclose 	= _onClose;
        _ws.onmessage 	= _onMessage;
        _ws.onerror 	= _onError;
	}

	function _closeSocket() {
		_ws.close();
	}

	function _onConnectionEstablished() {
        _sendMessage('init',_id);
	}

	function _onClose() {
		console.log('Connection closed!');
	}

	function _onError(err) {
		console.log("error:", err);
	}

	function _onMessage(evt) {
        var objMessage = JSON.parse(evt.data);
        switch (objMessage.type) {
            case "ICECandidate":
                self.onICECandidate(objMessage.ICECandidate, objMessage.source);
                break;
            case "offer":
                self.onOffer(objMessage.offer, objMessage.source);
                break;
            case "answer":
                self.onAnswer(objMessage.answer, objMessage.source);
                break;
			case "availablePeers":
				self.onAvailablePeers(objMessage.peers, objMessage.source);
				break;
            case "unavailable":
                self.onUnavailable(objMessage.source);
                break;
            case "available":
                self.onAvailable(objMessage.source);
                break;
            default:
                throw new Error("invalid message type");	
         }	
	};

    function _sendMessage(type, data, destination) {
        var message = {};
        message.type = type;
        message[type] = data;
        message.destination = destination;
        _ws.send(JSON.stringify(message));
    };	

    function sendICECandidate(ICECandidate, destination) {
		_sendMessage("ICECandidate", ICECandidate, destination);
	};

    function sendOffer(offer, destination) {
		_sendMessage("offer", offer, destination);
	};

    function sendAnswer(answer, destination) {
		_sendMessage("answer", answer, destination);
	};

	this.init = _onInit;
	this.close = _closeSocket;
    this.sendICECandidate = sendICECandidate;
    this.sendOffer = sendOffer;
    this.sendAnswer = sendAnswer;
    this.onOffer = function(offer, source) { console.log("offer from peer:", source, ':', offer); };
    this.onAnswer = function(answer, source) { console.log("answer from peer:", source, ':', answer); };
    this.onICECandidate = function(ICECandidate, source) { console.log("ICECandidate from peer:", source, ':', ICECandidate); };
    this.onAvailablePeers = function(peers,source) { console.log(peers.length+" peers are online"); };
    this.onAvailable = function(source) { console.log("Peer:", source, ': is online'); };
    this.onUnavailable = function(source) { console.log("Peer:", source, ': went offline'); };
}
