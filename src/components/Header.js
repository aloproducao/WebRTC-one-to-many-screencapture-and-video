import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import { Container, Row, Col } from "reactstrap";
import VideoButton from "./VideoButton";
import theme from "../theme.js";

const TopBar = styled.div`
  float: left;
  height: 48px;
  background: ${props => props.theme.colors.headerBackground};
`;

const HeaderRow = styled(Row)`
  text-transform: uppercase;
  color: ${props => props.theme.colors.headerText};
  font-size: ${props => props.theme.fontSizes.projectName};
  font-weight: ${props => props.theme.fontWeights.projectName};
`;

const ColLeft = styled(Col)`
  padding-top: 13px;
`;

const ColCenter = styled(Col)`
  display: inline-block;
  text-align: center;
  padding-top: 14px;
`;

const ColRight = styled(Col)`
  position: relative;
`;

const Help = styled.a`
  position: absolute;
  top: 11px;
  right: 18px;
  text-transform: uppercase;
  margin-right: 5px;
`;

class Header extends Component {
  render() {
    return (
      <ThemeProvider theme={theme}>
        <TopBar>
          <Container fluid>
            <HeaderRow>
              <ColLeft xs="4" lg="3" xl="2"></ColLeft>
              <ColCenter xs="3" lg="5" xl="8" data-testid="projectname">
                WebRTC <VideoButton />
              </ColCenter>
              <ColRight xs="4" lg="3" xl="2"></ColRight>
            </HeaderRow>
          </Container>
        </TopBar>
      </ThemeProvider>
    );
  }
}

export default Header;
