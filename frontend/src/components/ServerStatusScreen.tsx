import { Github, RefreshCw, ServerOff } from "lucide-react";
import styled from "styled-components";
import { theme } from "../theme";

interface ServerStatusScreenProps {
  isChecking: boolean;
  onRetry: () => void;
}

const Container = styled.main`
  min-height: 100vh;
  display: grid;
  place-items: center;
  position: relative;
  overflow: hidden;
  padding: ${theme.spacing.xl};
  background-color: ${theme.colors.background};
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

const Card = styled.section`
  z-index: 1;
  width: min(100%, 520px);
  padding: ${theme.spacing.xxxl};
  text-align: center;
  border: 1px solid ${theme.colors.cardBorder};
  border-radius: ${theme.borderRadius.lg};
  background: ${theme.colors.cardBackground};
  box-shadow: ${theme.shadows.card};
`;

const IconWrap = styled.div`
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  margin: 0 auto ${theme.spacing.xl};
  color: ${theme.colors.accentRed};
  border-radius: 50%;
  background: rgba(229, 62, 62, 0.12);
`;

const Title = styled.h1`
  margin-bottom: ${theme.spacing.md};
  color: ${theme.colors.primaryText};
  font-size: ${theme.fontSizes.xxxl};
  font-weight: ${theme.fontWeights.bold};
`;

const Description = styled.p`
  max-width: 420px;
  margin: 0 auto ${theme.spacing.xxl};
  color: ${theme.colors.secondaryText};
  font-size: ${theme.fontSizes.base};
`;

const Actions = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
`;

const Action = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.sm};
  background: ${theme.colors.accentIndigo};
  font-weight: ${theme.fontWeights.medium};
  transition: background-color ${theme.transitions.fast};

  &:hover:not(:disabled) {
    background: ${theme.colors.accentIndigoDark};
  }

  &:disabled {
    cursor: wait;
    opacity: 0.7;
  }
`;

const SetupLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  color: ${theme.colors.primaryText};
  border: 1px solid ${theme.colors.cardBorderAlt};
  border-radius: ${theme.borderRadius.sm};
  font-weight: ${theme.fontWeights.medium};
  transition: border-color ${theme.transitions.fast};

  &:hover {
    border-color: ${theme.colors.secondaryText};
  }
`;

export function ServerStatusScreen({
  isChecking,
  onRetry,
}: ServerStatusScreenProps) {
  return (
    <Container>
      <DotGrid />
      <Card aria-live="polite">
        <IconWrap>
          {isChecking ? (
            <RefreshCw size={32} aria-hidden="true" />
          ) : (
            <ServerOff size={32} aria-hidden="true" />
          )}
        </IconWrap>
        <Title>{isChecking ? "Checking the server…" : "Server not up"}</Title>
        <Description>
          {isChecking
            ? "This should only take a moment."
            : "The game server isn't running right now. Please contact me if you'd like to play, or run the project locally using the setup instructions."}
        </Description>
        {!isChecking && (
          <Actions>
            <Action type="button" onClick={onRetry}>
              <RefreshCw size={18} aria-hidden="true" />
              Try again
            </Action>
            <SetupLink
              href="https://github.com/NagelDylan/Acronymize#-quick-start"
              target="_blank"
              rel="noreferrer"
            >
              <Github size={18} aria-hidden="true" />
              Run locally
            </SetupLink>
          </Actions>
        )}
      </Card>
    </Container>
  );
}
