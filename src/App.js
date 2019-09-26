import React, { Component } from "react";
import { Route } from "react-router";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { setMessage, checkLive } from "./redux/actions";
import axios from "axios";
import { Container, Row, Col } from "reactstrap";
import styled, { ThemeProvider } from "styled-components";
import LiveView from "./components/LiveView";
import Header from "./components/Header";
import ShareMedia from "./components/ShareMedia";
import theme from "./theme.js";
import socketIOClient from "socket.io-client";


console.log(window.APIaddress);

const MainContainer = styled.div`
  display: flex;
  min-height: 100vh;
  display: flex;
`;

const FullHeightLayout = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.colors.contentAreaBackground};
`;

const FullHeightContainer = styled(Container)`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const FullHeightRow = styled(Row)`
  display: flex;
  flex-grow: 1;
`;

const WhiteCol = styled(Col)`
  flex-grow: 1;
  padding-top: 30px;
`;

const MainContent = styled.div`
  flex-grow: 1;
`;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      eyeTrackerPresent: false
    };
  }
  displayName = App.name;

  componentDidMount() {
    if (this.props.location.pathname !== "/caller") {
      this.props.checkLive(true);
    }
    // Start streaming Gaze data
    axios
      .post(`${window.APIaddress}/api/eyetracking/start`)
      .then(function(response) {
        this.setState({ eyeTrackerPresent: response.data });
      })
      .catch(error => {
        this.props.setMessage("No stream available");
      });

    // Start stimulus logging
    axios
      .post(`${window.APIaddress}/api/stimulus/start`)
      .then(response => this.props.setMessage(""))
      .catch(error => {
        this.props.setMessage("No stimulus logger available");
      });


      const socket = socketIOClient("http://localhost:4001");

     socket.on("outgoing data", data =>console.log("this is " + data));

     
  }

  // Stop streaming gaze data
  componentWillUnmount() {
    axios
      .post(`${window.APIaddress}/api/eyetracking/stop`)
      .then(response => console.log(response))
      .catch(error => {
        console.log(error);
      });
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <MainContainer>
          <MainContent>
            <FullHeightLayout>
              <Route exact path="/" component={Header} />
              <Route exact path="/liveview" component={Header} />
              <FullHeightContainer fluid>
                <FullHeightRow>
                  <WhiteCol xs="12" lg="12">
                    <Route exact path="/" component={LiveView} />
                    <Route exact path="/share" component={ShareMedia} />
                  </WhiteCol>
                </FullHeightRow>
              </FullHeightContainer>
            </FullHeightLayout>
          </MainContent>
        </MainContainer>
      </ThemeProvider>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setMessage: message => dispatch(setMessage(message)),
    checkLive: live => dispatch(checkLive(live))
  };
};

const mapStateToProps = state => {
  return {
    message: state.message
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(App)
);
