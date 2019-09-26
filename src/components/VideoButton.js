import React, { Component } from "react";
import { connect } from "react-redux";
import { liveVideo } from "../redux/actions";
import styled from "styled-components";
import IconWebCam from "../resources/IconWebCam";
import { HubConnectionBuilder } from "@aspnet/signalr";
import socketIOClient from "socket.io-client";

const ActiveButton = styled.span`
  cursor: pointer;
`;

const InactiveButton = styled.span`
  opacity: 0.5;
`;

class VideoButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      webcam: false
    };
    this.startVideo = this.startVideo.bind(this);
    this.showButton = this.showButton.bind(this);

    this.rtcConnection = new HubConnectionBuilder()
      .withUrl(`${window.APIaddress}/WebRtcHub`)
      .build();
    this.rtcConnection.serverTimeoutInMilliseconds = 120000000;
  }

  componentDidMount() {
    this.rtcConnection.start().then(() => {
      this.rtcConnection.on("ReceiveMessage", data => {
        var message = JSON.parse(data);
        if (message.user === "screensharecaller") {
          this.setState({ webcam: true });
        }
      });
    });
  }

  startVideo = () => {
    this.props.liveVideo(true);
    const socket = socketIOClient("http://localhost:4001");

    socket.emit('incoming data', "click video");

    socket.on("outgoing data", data =>console.log(data));
  };

  showButton() {
    if (this.state.webcam === true) {
      if (this.props.video === true) {
        return (
          <InactiveButton>
            <IconWebCam />
          </InactiveButton>
        );
      }
      return (
        <ActiveButton onClick={this.startVideo} title="Video">
          <IconWebCam />
        </ActiveButton>
      );
    }
    return null;
  }

  render() {
    return this.showButton();
  }
}

const mapDispatchToProps = dispatch => {
  return {
    liveVideo: video => dispatch(liveVideo(video))
  };
};

const mapStateToProps = state => {
  return {
    video: state.video
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VideoButton);
