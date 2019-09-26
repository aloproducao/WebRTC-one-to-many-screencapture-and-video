import React, { Component } from "react";
import { HubConnectionBuilder } from "@aspnet/signalr";
import socketIOClient from "socket.io-client";
import styled from "styled-components";
import Loader from "../../resources/Loader";
import { connect } from "react-redux";
import uuid from "uuid";

const ScreenCapture = styled.video`
  width: 100%;
  position: absolute;
  top: 0;
  z-index: 2;
`;

const LoaderContainer = styled.div`
  text-align: center;
  position: absolute;
  top: 40%;
  bottom: 0;
  width: 100%;
  flex: 1;
`;

const Spinner = styled(Loader)`
  top: 40%;
`;

class Receiver extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // generate unique id with the uuid library
      uuid: uuid.v1()
    };
    this.rtcConnection = new HubConnectionBuilder()
      .withUrl(`${window.APIaddress}/WebRtcHub`)
      .build();
    this.rtcConnection.serverTimeoutInMilliseconds = 120000000;

this.socket = new socketIOClient("http://localhost:4001");

    this.socket.emit('incoming data', "showmedia");

    this.socket.on("outgoing data", data =>console.log( "haha" + data));

  }

  componentDidMount() {
    // Set empty objects if none exist
    if (!window.peerConnection) {
      window.peerConnection = {};
    }

    if (!window.peerConnection[this.props.type]) {
      window.peerConnection[this.props.type] = {};
    }

    // Create a new peerConnection as global variable
    window.peerConnection[this.props.type] = new RTCPeerConnection({
      //  iceTransportPolicy: "relay",
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

    const self = this;

    // Make connection to Signal WebRTC hub
    this.rtcConnection.start().then(() => {
      this.rtcConnection.invoke(
        "Send",
        JSON.stringify({
          id: self.state.uuid,
          user: self.props.type + "receiver",
          message: "reconnect"
        })
      );
      this.socket.emit(
      JSON.stringify({
        id: self.state.uuid,
        user: self.props.type + "receiver",
        message: "reconnect"
      }));



      // On message from WebRTC Hub
      this.rtcConnection.on("ReceiveMessage", data => {
        var message = JSON.parse(data);
        if (
          message.message === "reconnect" &&
          message.user === self.props.type + "caller"
        ) {
          this.rtcConnection.invoke(
            "Send",
            JSON.stringify({
              id: self.state.uuid,
              user: self.props.type + "receiver",
              message: "reconnect"
            })
          );
        }

        if (message.id === self.state.uuid) {
          if (message.user === self.props.type + "caller") {
            if (message.sdp) {
              if (message.sdp.type === "offer") {
                window.peerConnection[self.props.type].setRemoteDescription(
                  message.sdp
                );
                //Create answer
                window.peerConnection[self.props.type]
                  .createAnswer()
                  .then(function(answer) {
                    return window.peerConnection[
                      self.props.type
                    ].setLocalDescription(answer);
                  })
                  .then(function() {
                    // Send the answer to the remote peer through the signaling server.
                    self.rtcConnection.invoke(
                      "Send",
                      JSON.stringify({
                        id: self.state.uuid,
                        user: self.props.type + "receiver",
                        sdp:
                          window.peerConnection[self.props.type]
                            .localDescription
                      })
                    );
                  })
                  .catch();
              } else if (message.sdp.type === "answer") {
                window.peerConnection[self.props.type].setRemoteDescription(
                  message.sdp
                );
              } else {
                console.log("Unsupported SDP type.");
              }
            } else if (message.ice) {
              window.peerConnection[self.props.type].addIceCandidate(
                message.ice
              );
            }
          }
        }
      });

      window.peerConnection[this.props.type].onicecandidate = event => {
        console.log(event);
        self.rtcConnection.invoke(
          "Send",
          JSON.stringify({
            id: self.state.uuid,
            user: self.props.type + "receiver",
            ice: event.candidate
          })
        );
      };

      let inboundStream = null;

      window.peerConnection[this.props.type].ontrack = ev => {
        this.video.srcObject = ev.streams[0];
        if (ev.streams && ev.streams[0]) {
          this.video.srcObject = ev.streams[0];
        } else {
          if (!inboundStream) {
            inboundStream = new MediaStream();
            this.video.srcObject = inboundStream;
          }
          inboundStream.addTrack(ev.track);
        }
      };
    });
  }

  componentWillUnmount() {
    window.peerConnection[this.props.type].close();
    // send message through signalR hub to close the peerConnectiont in the other window
    this.rtcConnection.invoke(
      "Send",
      JSON.stringify({
        id: this.state.uuid,
        user: this.props.type + "receiver",
        message: "close"
      })
    );
  }

  render() {
    return this.props.type === "screenshare" ? (
      <div>
        <ScreenCapture
          id="remoteVideo"
          ref={video => {
            this.video = video;
          }}
          autoPlay
          muted
        />
        <LoaderContainer>
          <Spinner />
        </LoaderContainer>
      </div>
    ) : (
      <div>
        <video
          id="remoteVideo"
          ref={video => {
            this.video = video;
          }}
          autoPlay
          muted
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    ratio: state.ratio
  };
};

export default connect(mapStateToProps)(Receiver);
