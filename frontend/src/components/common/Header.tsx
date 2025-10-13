import styled from "styled-components";
import { ChevronLeft, X } from "lucide-react";
import { theme } from "../../theme";
import { useUser } from "@clerk/clerk-react";

interface HeaderProps {
  onDismiss: () => void;
  onAuthClick: () => void;
  isInGame?: boolean;
}

const HeaderContainer = styled.header`
  width: 100%;
  padding: ${theme.spacing.xl} ${theme.spacing.xxxl};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BackButton = styled.button`
  padding: ${theme.spacing.sm};
  color: ${theme.colors.primaryText};
  background: none;
  border: none;
  cursor: pointer;
  transition: color ${theme.transitions.fast};

  &:hover {
    color: ${theme.colors.white};
    cursor: pointer;
  }
`;

const LoginLink = styled.button`
  color: ${theme.colors.secondaryText};
  background: none;
  border: none;
  cursor: pointer;
  font-family: "Inter", sans-serif;
  font-size: ${theme.fontSizes.base};
  transition: color ${theme.transitions.fast};

  &:hover {
    color: ${theme.colors.primaryText};
  }
`;

export function Header({ onDismiss, isInGame, onAuthClick }: HeaderProps) {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <HeaderContainer>
      <BackButton onClick={onDismiss} aria-label="Go back">
        {isInGame ? <X size={24} /> : <ChevronLeft size={24} />}
      </BackButton>
      {isLoaded && !isSignedIn ? (
        <LoginLink onClick={onAuthClick}>Log In</LoginLink>
      ) : null}
    </HeaderContainer>
  );
}
