import styled from "styled-components";
import { theme } from "../../theme";
import { TypeAnimation } from "react-type-animation";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { type Screen } from "../../constants";

interface LeftSideProps {
  onPlayDaily: () => void;
  onExploreModes: () => void;
  onAuthClick: () => void;
  setCurrentScreen: (screen: Screen) => void;
  onProfileClick: () => void;
}

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${theme.spacing.xxl};
`;

const Title = styled.h1`
  color: ${theme.colors.white};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  line-height: 1.2;
  font-family: "Inter", sans-serif;
  text-align: center;
`;

const Tagline = styled.p`
  color: ${theme.colors.primaryText};
  font-size: ${theme.fontSizes.xl};
  font-family: "Inter", sans-serif;
  text-align: center;
`;

const ButtonStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const PrimaryButton = styled.button`
  padding: ${theme.spacing.lg} ${theme.spacing.xxxl};
  background-color: ${theme.colors.accentIndigo};
  color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.md};
  border: none;
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  font-weight: ${theme.fontWeights.bold};
  font-family: "Inter", sans-serif;
  font-size: ${theme.fontSizes.base};

  &:hover {
    background-color: ${theme.colors.accentIndigoDark};
  }
`;

const SecondaryButton = styled.button`
  padding: ${theme.spacing.lg} ${theme.spacing.xxxl};
  background-color: ${theme.colors.background};
  color: ${theme.colors.accentIndigo};
  border: 1px solid ${theme.colors.accentIndigo};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  font-weight: ${theme.fontWeights.bold};
  font-family: "Inter", sans-serif;
  font-size: ${theme.fontSizes.base};

  &:hover {
    background-color: ${theme.colors.accentIndigo};
    color: ${theme.colors.white};
  }
`;

const UtilityLinks = styled.div`
  display: flex;
  margin: auto;
  gap: ${theme.spacing.xl};
  font-size: ${theme.fontSizes.sm};

  & > *:not(:last-child)::after {
    content: "|";
    margin-left: ${theme.spacing.xl};
    color: ${theme.colors.secondaryText};
  }
`;

const UtilityLink = styled.button`
  color: ${theme.colors.secondaryText};
  background: none;
  border: none;
  cursor: pointer;
  transition: color ${theme.transitions.fast};
  font-family: "Inter", sans-serif;

  &:hover {
    color: ${theme.colors.primaryText};
  }
`;

export function LeftSide({
  onPlayDaily,
  onExploreModes,
  onAuthClick,
  setCurrentScreen,
  onProfileClick,
}: LeftSideProps) {
  return (
    <LeftColumn>
      <Title>
        <TypeAnimation
          sequence={[
            "Acronymize",
            1500,
            "Master the unsaid",
            1500,
            "The end of TL;DR",
            1500,
            "Decode the nonsense",
            1500,
          ]}
          wrapper="span"
          speed={10}
          style={{ fontSize: "2em", display: "inline-block" }}
          repeat={Infinity}
        />
      </Title>

      <Tagline>A new daily puzzle for word lovers.</Tagline>

      <ButtonStack>
        <PrimaryButton onClick={onPlayDaily}>Play Today's Puzzle</PrimaryButton>

        <SecondaryButton onClick={onExploreModes}>
          Explore Game Modes
        </SecondaryButton>
      </ButtonStack>

      <UtilityLinks>
        <UtilityLink onClick={() => setCurrentScreen("instructions")}>
          How to Play
        </UtilityLink>

        <SignedOut>
          <UtilityLink onClick={onAuthClick}>Log In / Sign Up</UtilityLink>
        </SignedOut>
        <SignedIn>
          <UtilityLink onClick={onProfileClick}>Profile</UtilityLink>
        </SignedIn>
      </UtilityLinks>
    </LeftColumn>
  );
}
