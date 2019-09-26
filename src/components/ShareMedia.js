import React, { Component } from "react";
import GetMedia from "./webrtc/GetMedia";
import { connect } from "react-redux";

class ShareMedia extends Component {
  render() {
    return (
      <div>
        <GetMedia type="video" />
        <GetMedia type="screenshare" />
        Please keep this window open. Your screen and video input will be shared
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    video: state.video
  };
};

export default connect(mapStateToProps)(ShareMedia);
