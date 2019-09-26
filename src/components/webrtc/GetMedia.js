import React, { Component } from "react";
import { HubConnectionBuilder } from "@aspnet/signalr";
import socketIOClient from "socket.io-client";

class GetMedia extends Component {
  constructor(props) {
    super(props);

    this.multiCreate = this.multiCreate.bind(this);
    this.multiOffer = this.multiOffer.bind(this);
    this.multiAnswer = this.multiAnswer.bind(this);
    this.multiCandidate = this.multiCandidate.bind(this);
    this.multiReconnect = this.multiReconnect.bind(this);
    this.multiAddStream = this.multiAddStream.bind(this);
  }

  // add new property to peerArray object for every new RTCpeerConnection
  multiCreate(message) {
    const self = this;
    const mediaType = this.props.type;
    if (!window.peerArray[mediaType][message.id]) {
      // Create RTCPeerconnection
      window.peerArray[mediaType][message.id] = new RTCPeerConnection({
        // iceTransportPolicy: "relay",
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:stun1.l.google.com:19302",
              "stun:stun2.l.google.com:19302",
              "stun:stun.l.google.com:19302?transport=tcp"
            ]
          }
        ]
      });

      // remove RTCpeerConnections from object if state is closed, disconnected or failed
      for (var key in window.peerArray[mediaType]) {
        if (
          window.peerArray[mediaType][key].connectionState === "closed" ||
          window.peerArray[mediaType][key].connectionState === "failed" ||
          window.peerArray[mediaType][key].connectionState === "disconnected"
        )
          delete window.peerArray[mediaType][key];
        console.log(window.peerArray);
      }

      window.peerArray[mediaType][message.id].onnegotiationneeded = function() {
        window.peerArray[mediaType][message.id]
          .createOffer()
          .then(function(offer) {
            return window.peerArray[mediaType][message.id].setLocalDescription(
              offer
            );
          })
          .then(function() {
            console.log(window.peerArray[mediaType][message.id]);
            window.rtcConnection[mediaType].invoke(
              "Send",
              JSON.stringify({
                user: self.props.type + "caller",
                id: message.id,
                sdp: window.peerArray[mediaType][message.id].localDescription
              })
            );
          })
          .catch(function(reason) {
            // An error occurred, so handle the failure to connect
          });
      };

      window.peerArray[mediaType][message.id].onicecandidate = event => {
        window.rtcConnection[mediaType].invoke(
          "Send",
          JSON.stringify({
            user: self.props.type + "caller",
            id: message.id,
            ice: event.candidate
          })
        );
      };

      // On message from WebRTC Hub
      window.rtcConnection[mediaType].on("ReceiveMessage", data => {
        var nextmessage = JSON.parse(data);
        if (nextmessage.id === message.id) {
          if (nextmessage.user === self.props.type + "receiver") {
            console.log(nextmessage);
            this.multiCreate(nextmessage);
            if (nextmessage.sdp) {
              if (nextmessage.sdp.type === "offer") {
                console.log(nextmessage);
                this.multiOffer(nextmessage);
              } else if (nextmessage.sdp.type === "answer") {
                console.log(nextmessage);
                this.multiAnswer(nextmessage);
              } else {
                console.log("Unsupported SDP type.");
              }
            } else if (nextmessage.ice) {
              console.log(nextmessage);
              this.multiCandidate(nextmessage);
            } else if (nextmessage.message === "reconnect") {
              console.log(nextmessage);
              this.multiReconnect(nextmessage);
            } else if (nextmessage.message === "close") {
              console.log(nextmessage);
              window.peerArray[self.props.type][nextmessage.id].close();
            }
          }
        }
      });

      this.multiAddStream(message);
    }
  }

  multiOffer(message) {
    const mediaType = this.props.type;
    window.peerArray[mediaType][message.id].setRemoteDescription(message.sdp);
    //Create answer
    window.peerArray[mediaType][message.id]
      .createAnswer()
      .then(function(answer) {
        return window.peerArray[mediaType][message.id].setLocalDescription(
          answer
        );
      })
      .then(function() {
        // Send the answer to the remote peer through the signaling server.
        window.rtcConnection[mediaType].invoke(
          "Send",
          JSON.stringify({
            user: this.props.type + "caller",
            id: message.id,
            sdp: window.peerArray[mediaType][message.id].localDescription
          })
        );
      })
      .catch();
  }

  multiAnswer(message) {
    const mediaType = this.props.type;
    window.peerArray[mediaType][message.id].setRemoteDescription(message.sdp);
  }

  multiCandidate(message) {
    const mediaType = this.props.type;
    window.peerArray[mediaType][message.id].addIceCandidate(message.ice);
  }

  multiReconnect(message) {
    const self = this;
    const mediaType = this.props.type;
    window.peerArray[mediaType][message.id]
      .createOffer()
      .then(function(offer) {
        return window.peerArray[mediaType][message.id].setLocalDescription(
          offer
        );
      })
      .then(function() {
        window.rtcConnection[mediaType].invoke(
          "Send",
          JSON.stringify({
            user: self.props.type + "caller",
            id: message.id,
            sdp: window.peerArray[mediaType][message.id].localDescription
          })
        );
      });
  }

  // clone stream and add tracks to peerArray object property
  multiAddStream(message) {
    const mediaType = this.props.type;
    if (window.ScreenCaptureStream[mediaType]) {
      window.peerArray[mediaType][
        message.id
      ].stream = window.ScreenCaptureStream[mediaType].clone();
      window.peerArray[mediaType][message.id].addTrack(
        window.peerArray[mediaType][message.id].stream.getTracks()[0]
      );
    }
  }

  componentDidMount() {
    const mediaType = this.props.type;
    const type = this.props.type;

    // Set empty objects if none exist

    if (!window.ScreenCaptureStream) {
      window.ScreenCaptureStream = {};
    }

    if (!window.ScreenCaptureStream[mediaType]) {
      window.ScreenCaptureStream[mediaType] = {};
    }

    if (!window.peerArray) {
      window.peerArray = {};
    }

    if (!window.peerArray[mediaType]) {
      window.peerArray[mediaType] = {};
    }

    if (!window.rtcConnection) {
      window.rtcConnection = {};
    }

    if (!window.rtcConnection[mediaType]) {
      window.rtcConnection[mediaType] = {};
    }

    // Set constraints for streams
    const screenshareconstraints = {
      video: {
        frameRate: { ideal: 10, max: 15 }
      }
    };

    const videoconstraints = {
      video: {
        width: 315,
        height: 180
      }
    };

    // get type of media based on component props
    const getMedia =
      this.props.type === "screenshare"
        ? navigator.mediaDevices.getDisplayMedia(screenshareconstraints)
        : navigator.mediaDevices.getUserMedia(videoconstraints);

    window.rtcConnection[mediaType] = new HubConnectionBuilder()
      .withUrl(`${window.APIaddress}/WebRtcHub`)
      .build();

    window.rtcConnection[mediaType].serverTimeoutInMilliseconds = 120000000;

    // GetDisplayMedia and create stream
    if (getMedia) {
      getMedia
        .then(function(stream) {
          window.ScreenCaptureStream[mediaType] = stream;
          window.rtcConnection[mediaType].invoke(
            "Send",
            JSON.stringify({
              user: type + "caller",
              message: "reconnect"
            })
          );
        })
        .catch();
    } else {
      alert("Your browser does not support getDisplayMedia API");
    }

    window.rtcConnection[mediaType].start().then(() => {
      // on reconnect from receiver start multiCreate function
      window.rtcConnection[mediaType].on("ReceiveMessage", data => {
        var message = JSON.parse(data);
        if (
          message.message === "reconnect" &&
          message.user === this.props.type + "receiver"
        ) {
          this.multiCreate(message);
        }
      });
    });
  }

  render() {
    return <div />;
  }
}

export default GetMedia;
