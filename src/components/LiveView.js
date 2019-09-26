import React, { Component } from "react";
import { connect } from "react-redux";
import ScreenCapture from "./ScreenCapture";
import ShowMedia from "./webrtc/ShowMedia.js";
import styled from "styled-components";
import { liveVideo } from "../redux/actions";
import Draggable from "react-draggable";

const VideoWindow = styled.div`
border: 3px rounded solid #fff;
max-width: 330px;
max-height: 190px;
background:#fff;
padding: 4px;
border: 1px solid #ccc;
position absolute;
top: 40px;
right: 150px;
z-index: 5;
cursor: pointer;
`;

const VideoControl = styled.div`
  width: 22px;
  height: 22px;
  border: 1px solid #ccc;
  border-radius: 11px;
  background: #fff;
  float: right;
  font-weight: bold;
  font-size: 12px;
  padding-left: 6px;
  padding-top: 2px;
`;

class LiveView extends Component {
  constructor(props) {
    super(props);
    this.exitVideo = this.exitVideo.bind(this);
    this.showVideo = this.showVideo.bind(this);
  }

  exitVideo() {
    this.props.liveVideo(false);
  }

  showVideo() {
    if (this.props.video === true) {
      return (
        <Draggable>
          <VideoWindow>
            <ShowMedia type="video" />
            <VideoControl onClick={this.exitVideo}>X</VideoControl>
          </VideoWindow>
        </Draggable>
      );
    }
    return null;
  }

  componentWillUnmount() {
    // this.props.liveVideo(false);
  }

  render() {
    return (
      <div>
        <ScreenCapture />
        {this.showVideo()}
      </div>
    );
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
)(LiveView);
