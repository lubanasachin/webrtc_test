function peerClient() {

    var myId 		= ((new Date).getTime()).toString(),			//peer ID
        myId 		= 'US'+myId.substr(myId.length - 5),
        socketUrl 	= "ws://localhost:8090/",						//web socket server URL
		signal 		= new signalClient(),							//signaling client obj
		webrtcObj 	= new webrtc(signal,onMessageReceived),			//webrtc function obj
		self		= this;
		document.getElementById('myId').innerHTML = 'My ID: '+myId;	

	/**
	* init peer client
	* @params
	* @returns
	*/
	function _onInit() {
		signal.init(socketUrl,myId);
		//get list of available peers
		signal.onAvailablePeers = function(peers,source) {addPeerBox(peers);}	
		//on peer presence available
		signal.onAvailable = function(source) {addPeerBox([source]);}
		//on peer presence unavailable
		signal.onUnavailable = function(source) {
			if(PCOBJ[source] != undefined) {
				PCOBJ[source]['pc'].close();
				if(document.getElementById('msg_'+source) != undefined) {
					var peerBox = document.getElementById('msg_'+source);
					peerBox.parentNode.removeChild(peerBox);
				}
				delete PCOBJ[source];
			}
			removePeerBox(source);
		}

		//on peer offer received
        signal.onOffer = function (offer, source) {
			webrtcObj.sendAnswer(offer,source);
        };

        //on peer answer received
        signal.onAnswer = function (answer, source) {
            PCOBJ[source]['pc'].setRemoteDescription(new RTCSessionDescription(answer));
        };

        //on peer ice candidate received
        signal.onICECandidate = function (ICECandidate, source) {
            PCOBJ[source]['pc'].addIceCandidate(new RTCIceCandidate(ICECandidate));
        };
	}

	/**
	* on message received
	* @params
	* @returns
	*/
	function onMessageReceived(peerid,message) {
		createChatBox(peerid);
		addMessage(peerid,message,0);
	}

	/**
	* start chat with a peer
	* @params
	* @returns
	*/
	function _onStart(peerid) {
		CURPID = peerid;
		webrtcObj.startCommunication(peerid);
		createChatBox(peerid);
	}

	/**
	* send message to a peer
	* @params
	* @returns
	*/
	function _onSendToPeer(peerId) {
		if(PCOBJ[peerId] != undefined) {
			var message = document.getElementById('txtMessage_'+peerId).value;
			PCOBJ[peerId]['dc'].send(message);
			addMessage(peerId,message,1);
			document.getElementById('txtMessage_'+peerId).value = '';
		}
	}

	/**
	* populate available peers list
	* @params
	* @returns
	*/
	function addPeerBox(peer) {
		var availBox = document.getElementById('availPeers');
		for(var i=0; i< peer.length; i++) {
			var source = peer[i];
			var peerBox = document.createElement('div');
			peerBox.id = 'peer_'+source;
			peerBox.className = 'peerContact';
			peerBox.innerHTML = source;
			peerBox.addEventListener('click', function (event) {
				self.startPeer(event.srcElement.innerHTML);
			},false);
			availBox.appendChild(peerBox);
		}
	}

	/**
	* remove peers when offline
	* @params
	* @returns
	*/
	function removePeerBox(source) {
		var peerBox = document.getElementById('peer_'+source);
		peerBox.parentNode.removeChild(peerBox);
	}

	/**
	* add message when received
	* @params
	* @returns
	*/
	function addMessage(peerid,message,me) {
		var from = peerid;
		if(me == 1) from = 'Me';
		var rcvdBox = document.getElementById('rcvdMessage_'+peerid);
		var msg= document.createElement('div');
		msg.className = 'msgText';
		msg.innerHTML = '<b>'+from+'</b>: '+message;
		rcvdBox.appendChild(msg);
	}

	/**
	* create chat box for each peer
	* @params
	* @returns
	*/
	function createChatBox(peerid) {
		if(document.getElementById('msg_'+peerid) != undefined) return;
		var chatBox = document.getElementById('chatBox');
		var msgBox = document.createElement('div');
		msgBox.id = 'msg_'+peerid;
		msgBox.className = 'messageBox';
		var inHtml = "<div class='messageBoxHead'>Chat: "+peerid+"</div><div class='rcvdMessage' id='rcvdMessage_"+peerid+"'></div>";
		inHtml += "<div class='textMessage'><textarea maxlength='100' id='txtMessage_"+peerid+"'></textarea></div>";
		inHtml += "<div class='messageButtons'><button id='btSend_"+peerid+"'>Send</button></div>";
		msgBox.innerHTML = inHtml;
		chatBox.appendChild(msgBox);
		document.getElementById('btSend_'+peerid).addEventListener('click', function(event) {
			var pid = event.srcElement.id.split("_");
			self.sendToPeer(pid[pid.length-1]);
		},false);	
	}

	this.init = _onInit;
	this.startPeer = _onStart;
	this.sendToPeer = _onSendToPeer;
}
