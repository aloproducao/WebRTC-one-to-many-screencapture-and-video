import React, { Component } from "react";
import { Route } from "react-router";
import { withRouter } from "react-router-dom";
import { Container, Row, Col } from "reactstrap";
import styled, { ThemeProvider } from "styled-components";
import LiveView from "./components/LiveView";
import Header from "./components/Header";
import ShareMedia from "./components/ShareMedia";
import theme from "./theme.js";

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

export default withRouter(App);
