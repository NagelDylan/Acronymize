import styled from "styled-components";
import { theme } from "../../theme";
import { LeftSide } from "./LeftSide";
import { RightSide } from "./RightSide";
import { type Screen } from "../../constants";

interface LandingPageProps {
  onPlayDaily: () => void;
  onExploreModes: () => void;
  onAuthClick: () => void;
  setCurrentScreen: (screen: Screen) => void;
  onProfileClick: () => void;
}

const Container = styled.div`
  min-height: 100vh;
  background-color: ${theme.colors.background};
  position: relative;
  overflow: hidden;
`;

const DotGrid = styled.div`
  position: absolute;
  inset: 0;
  opacity: 0.1;
  background-image: radial-gradient(
    circle,
    ${theme.colors.dotGrid} 1px,
    transparent 1px
  );
  background-size: 24px 24px;
`;

const Content = styled.div`
  position: relative;
  z-index: 10;
`;

const InnerContainer = styled.div`
  max-width: ${theme.screenMaxWidth};
  margin: 0 auto;
  padding: ${theme.spacing.xxxl};
`;

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing.xxxxl};
  align-items: center;
  min-height: 80vh;

  @media (min-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export function LandingPage({
  onPlayDaily,
  onExploreModes,
  onAuthClick,
  setCurrentScreen,
  onProfileClick,
}: LandingPageProps) {
  return (
    <Container>
      <DotGrid />
      <Content>
        <InnerContainer>
          <TwoColumnGrid>
            <LeftSide
              onPlayDaily={onPlayDaily}
              onExploreModes={onExploreModes}
              onAuthClick={onAuthClick}
              setCurrentScreen={setCurrentScreen}
              onProfileClick={onProfileClick}
            />
            <RightSide />
          </TwoColumnGrid>
        </InnerContainer>
      </Content>
    </Container>
  );
}
