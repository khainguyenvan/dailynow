import React from 'react';
import styled from 'styled-components';

const WrapperStyled = styled.div`
  position: relative;
`;

const LoaderWrapper = styled.div`
  &:before {
    content: '';
    width: 100%;
    height: 100vh;
    background-color: ${ props => props.backgroundColor || 'black' };
    opacity: ${props => props.opacity || 0.6};
    position: absolute;
    z-index: 99;
  }
  display: ${props => props.isActive || 'block'};
`;

const LoadingStyled = styled.div`
  position: absolute;
  transform: translate(-50%, -50%);
  top: 50vh;
  left: 50%;
  text-align: center;
  color: white;
  z-index: 99;
`;

function withLoadingScreen(WrappedComponent) {
  return class extends React.Component {
    state = {
      loading: true
    };

    handleLoading = isLoading => {
      if (isLoading !== this.state.isLoading) {
        this.setState({ loading: isLoading });
      }
    };

    render() {
      return (
        <WrapperStyled>
          <LoaderWrapper isActive={this.state.loading ? 'block': 'none'}>
            <LoadingStyled>
              <span>Loading...</span>
            </LoadingStyled>
          </LoaderWrapper>
          <WrappedComponent
            {...this.props}
            isLoading={this.state.isLoading}
            handleLoading={this.handleLoading}
          />
        </WrapperStyled>
      );
    }
  };
}

export default withLoadingScreen;
