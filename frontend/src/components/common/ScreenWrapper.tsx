import { Header } from "./Header";
import styled from "styled-components";
import { theme } from "../../theme";
import { useUser } from "@clerk/clerk-react";

interface ScreenWrapperProps {
  onDismiss: () => void;
  onAuthClick: () => void;
  children: React.ReactNode;
  isInGame?: boolean;
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
  opacity: 0.03;
  background-image: radial-gradient(
    circle,
    ${theme.colors.dotGrid} 1px,
    transparent 1px
  );
  background-size: 24px 24px;
  pointer-events: none;
`;

const InnerContainer = styled.div`
  max-width: ${theme.screenMaxWidth};
  margin: 0 auto;
  padding: ${theme.spacing.xl} ${theme.spacing.xxxl} ${theme.spacing.xxxl}
    ${theme.spacing.xxxl};
  height: 100%;
`;

export const ScreenWrapper = ({
  onDismiss,
  onAuthClick,
  children,
  isInGame,
}: ScreenWrapperProps) => {
  return (
    <Container>
      <DotGrid />
      <Header
        onDismiss={onDismiss}
        onAuthClick={onAuthClick}
        isInGame={isInGame}
      />
      <InnerContainer> {children}</InnerContainer>
    </Container>
  );
};
