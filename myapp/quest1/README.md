## mChat (WebRTC)

mChat is

- is a simple web chat service developed in Javascript.
- requires no signup, random chat service, send text & files
- makes use of Data Channels for sending messages & binary data
- uses websockets as Signaling server
- provides a simple web interface to send receive message from random peers
- web interface is developed using HTML5, Javascript

### How mChat works?

- Peers are given random generated ID & are shown as available in Peer List when they connect to socket server.
- Presence management is done with the socket server.
- WebRTC Offer-Answer model is initiated whenever user clicks on any available peer to start chat
- If peer connection for given user already exists, it uses the existing peer connection.
- Peer connection for all the connected peers are store in PCOBJ object

The following links may be useful:

- [websocket-ws](https://www.npmjs.com/package/ws) for Websocket
- [Data Channels] (http://www.html5rocks.com/en/tutorials/webrtc/datachannels/) for signaling data

### Installation

To install mChat, make sure following are installed

```console
node
npm
express
```

Run following commands to install dependent packages 

```console
npm install ws --save
npm install express --save
```

or Simply, execute
```console
npm install
```

#### Download the Zip

[Click here](https://github.com/lubanasachin/webrtc_test/archive/master.zip)
to download the zip file.

### Usage

To run mChat, execute following command from the project directory

```shell
npm start
```

To use mChat, visit the following URL

```console
http(s)://[HOSTNAME]/[PATH TO PROJECT DIRECTORY]/client/peer.html

Sample
http://localhost/quest1/client/peer.html
```

### Web Interface

![Chat Dashboard](http://meetonsnap.com/webchat.png)

