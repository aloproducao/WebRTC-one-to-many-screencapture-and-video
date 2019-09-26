import React, { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { Col } from "reactstrap";
import ShowMedia from "./webrtc/ShowMedia.js";
import Fullscreen from "react-full-screen";
import IconFullScreen from "../resources/IconFullScreen";

const ResponsiveCanvas = styled(Col)`
  position: relative;
  margin-bottom: 25px;
  margin-left: auto;
  margin-right: auto;
  overflow: hidden;
`;

const AspectCanvas = styled.div`
  position: relative;
  background: #e5e5e5;
  border: 1px solid #ccc;
`;

const ContainerDiv = styled.div`
  position: relative;
`;

const ResponsiveSvg = styled.svg`
  position: absolute;
  top: 0;
  bottom: 0;
  flex: 1;
  z-index: 3;
`;

const ControlBar = styled.div`
  position: relative;
  height: 60px;
  padding: 10px 15px 0 0;
  margin-top: -60px;
  background-image: linear-gradient(to bottom, transparent, black);
  z-index: 4;
  opacity: 1;
  transition: opacity 0.8s;
`;

const FullScreenControls = styled.a`
  float: right;
  cursor: pointer;
`;

class GazeOverlay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFull: false,
      controlbarHover: false,
      responsiveWidth: "",
      responsiveHeight: "",
      fullscreenWidth: "",
      fullscreenHeight: ""
    };

    this.changeDimensions = this.changeDimensions.bind(this);
    this.fullScreenControls = this.fullScreenControls.bind(this);
    this.controlbarMouseHover = this.controlbarMouseHover.bind(this);
    this.controlbarMouseOut = this.controlbarMouseOut.bind(this);
    this.calcDimensions = this.calcDimensions.bind(this);
  }

  controlbarMouseHover() {
    this.setState({ controlbarHover: true });
  }

  controlbarMouseOut() {
    this.setState({ controlbarHover: false });
  }

  toggleHoverState(state) {
    return {
      controlbarHover: !state.controlbarHover
    };
  }

  componentDidMount() {
    this.changeDimensions();
    window.addEventListener("resize", this.changeDimensions);
    window.addEventListener("webkitfullscreenchange", this.changeDimensions);
    window.addEventListener("mozfullscreenchange", this.changeDimensions);
    window.addEventListener("fullscreenchange", this.changeDimensions);
  }

  componentDidUpdate(prevProps) {
    if (this.props.pin !== prevProps.pin) {
      this.changeDimensions();
    } else if (this.props.isFull !== prevProps.isFull) {
      this.changeDimensions();
    }
  }

  changeDimensions() {
    if (this.state.isFull === false) {
      //get window size
      const height = window.innerHeight - 160;
      const pinWidth = this.props.pin ? 210 : 90;
      const width = window.innerWidth - pinWidth;

      this.calcDimensions(width, height);
    }
  }

  calcDimensions(width, height) {
    const calcRatio = this.props.ratio / 100;
    const calcHeight = width * calcRatio;

    // height is limiting factor
    if (calcHeight > height) {
      const aspectWidth = height / calcRatio;
      this.setState({
        responsiveWidth: aspectWidth,
        responsiveHeight: height
      });
    }
    // width is limiting factor
    else {
      const aspectHeight = width * calcRatio;
      this.setState({
        responsiveWidth: width,
        responsiveHeight: aspectHeight
      });
    }
  }

  fullScreenControls() {
    const controlStyle =
      this.state.controlbarHover === true
        ? { width: this.state.responsiveWidth + "px" }
        : { width: this.state.responsiveWidth + "px", opacity: 0 };
    if (this.state.isFull === false) {
      return (
        <ControlBar style={controlStyle} data-testid="test">
          <FullScreenControls onClick={this.goFull}>
            <IconFullScreen />
          </FullScreenControls>
        </ControlBar>
      );
    } else {
      return (
        // <ControlBar style={controlStyle} data-testid="test">
        //    <FullScreenControls onClick={this.goNormal}>
        //     <IconFullScreenExit />
        //   </FullScreenControls>
        //  </ControlBar>
        null
      );
    }
  }

  goFull = () => {
    this.calcDimensions(window.screen.width, window.screen.height);

    this.setState({
      isFull: true
    });
  };

  goNormal = () => {
    this.setState({
      isFull: false
    });
  };

  render() {
    const topMargin = this.state.isFull === false ? "-22px" : "0px";
    const paddingLeft = this.state.isFull === false ? "15px" : "0px";
    const border = this.state.isFull === false ? "1px solid #ccc" : "0px";

    const responsiveCanvasSize = {
      height: this.state.responsiveHeight + "px",
      width: this.state.responsiveWidth + 20 + "px",
      marginTop: topMargin,
      paddingLeft: paddingLeft
    };
    const aspectCanvasSize = {
      height: this.state.responsiveHeight + "px",
      width: this.state.responsiveWidth + "px",
      border: border
    };
    return (
      <ContainerDiv>
        <Fullscreen
          enabled={this.state.isFull}
          onChange={isFull => this.setState({ isFull })}
        >
          <ResponsiveCanvas
            style={responsiveCanvasSize}
            onMouseEnter={this.controlbarMouseHover}
            onMouseLeave={this.controlbarMouseOut}
          >
            <AspectCanvas style={aspectCanvasSize}>
              <ShowMedia type="screenshare" />
            </AspectCanvas>
            {this.fullScreenControls()}
          </ResponsiveCanvas>
        </Fullscreen>
      </ContainerDiv>
    );
  }
}

const mapStateToProps = state => {
  return {
    pin: state.pin,
    ratio: state.ratio,
    calibrate: state.calibrate
  };
};

export default connect(mapStateToProps)(GazeOverlay);
