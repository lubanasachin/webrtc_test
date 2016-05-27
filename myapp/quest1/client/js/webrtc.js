function webrtc(signal,onMessageCallback) {
	var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
	var RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
	var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;
	var iceServers  = {iceServers: [{urls: "stun:stun.1.google.com:19302"}]};
	var conOptions = {'optional': [{'DtlsSrtpKeyAgreement': true}]};

	/**
	* start communication by sending offer
	* @params
	* @returns
	*/
	function _onStartCommunication(peerId) {
		sendOffer(peerId);
	}

	/**
	* create peer connection
	* @params
	* @returns
	*/
	function createPeerConnection(peerId) {
		if(PCOBJ[peerId] != undefined) {
			console.log('PC already created');
			return 1;
		}
		PCOBJ[peerId] = {};
        var pc = new RTCPeerConnection(iceServers,conOptions);
		pc.keyId = peerId;
        pc.onicecandidate = function(evt) {
            if (!pc || !evt || !evt.candidate) return;
            signal.sendICECandidate(evt.candidate, peerId);
        }
		PCOBJ[peerId]['pc'] = pc;
		console.log('PC created');
	}

	/**
	* send offer to remote peer
	* @params
	* @returns
	*/
	function sendOffer(peerId) {
		var ret = createPeerConnection(peerId);
		if(ret === 1) return;
		console.log('Send offer');
		var pc = PCOBJ[peerId]['pc'];
		var dc = pc.createDataChannel("communication", {reliable: false});
        pc.createOffer(function(offer){
            pc.setLocalDescription(offer);
            signal.sendOffer(offer, peerId);
        }, function (e){
            console.error(e);
        });
        dc.onopen = function(){console.log("------ DATACHANNEL OPENED ------");};
		dc.onmessage = function(event){
			if(CURPID === '') CURPID = pc.keyId;
			onMessageCallback(pc.keyId,event.data);
		};
		dc.onclose = function(){console.log("------- DC closed! -------")};
		dc.onerror = function(){console.log("DC ERROR!!!")};
		PCOBJ[peerId]['dc'] = dc;
	}

	/**
	* send answer to remote peer
	* @params
	* @returns
	*/
	function _onSendAnswer(offer,source) {
		createPeerConnection(source);
		var pc = PCOBJ[source]['pc'];
        pc.ondatachannel = function(event) {
			var receiveChannel = event.channel;
			PCOBJ[pc.keyId]['dc'] = receiveChannel;
			receiveChannel.onmessage = function(event) {
				if(CURPID === '') CURPID = pc.keyId;
				onMessageCallback(pc.keyId,event.data);
			};
        };
		pc.setRemoteDescription(new RTCSessionDescription(offer));
		pc.createAnswer(function(answer){
			pc.setLocalDescription(answer);
			console.log('send answer');
			signal.sendAnswer(answer, source);
		}, function (e){
			console.error(e);
		});
	}

	this.startCommunication = _onStartCommunication;
	this.sendAnswer = _onSendAnswer;
}
