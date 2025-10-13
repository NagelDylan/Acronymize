import styled from "styled-components";
import { theme } from "../../theme";
import { BlankModal } from "./BlankModal";

interface PopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  primaryBtnDesc: string;
  secondaryBtnDesc: string;
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
}

const ModalContent = styled.div`
  position: relative;
  background-color: ${theme.colors.modalBackground};
  padding: ${theme.spacing.xxxl};
  border-radius: ${theme.borderRadius.md};
  max-width: 448px;
  width: 100%;
  border: 1px solid ${theme.colors.cardBorder};
`;

const Title = styled.h2`
  color: ${theme.colors.primaryText};
  font-size: ${theme.fontSizes.xxl};
  font-weight: ${theme.fontWeights.bold};
  margin-bottom: ${theme.spacing.lg};
  font-family: "Inter", sans-serif;
  text-align: center;
`;

const Description = styled.p`
  color: ${theme.colors.secondaryText};
  margin-bottom: ${theme.spacing.xxxl};
  font-family: "Inter", sans-serif;
  text-align: center;
`;

const PrimaryButton = styled.button`
  width: 100%;
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background-color: ${theme.colors.accentIndigo};
  color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.sm};
  border: none;
  cursor: pointer;
  transition: background-color ${theme.transitions.fast};
  margin-bottom: ${theme.spacing.lg};
  font-family: "Inter", sans-serif;
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.medium};

  &:hover {
    background-color: ${theme.colors.accentIndigoDark};
  }
`;

const SecondaryButton = styled.button`
  width: 100%;
  color: ${theme.colors.secondaryText};
  background: none;
  border: none;
  cursor: pointer;
  transition: color ${theme.transitions.fast};
  font-size: ${theme.fontSizes.sm};
  font-family: "Inter", sans-serif;

  &:hover {
    color: ${theme.colors.primaryText};
  }
`;

export function PopUpModal({
  isOpen,
  onClose,
  title,
  description,
  primaryBtnDesc,
  secondaryBtnDesc,
  onPrimaryClick,
  onSecondaryClick,
}: PopUpModalProps) {
  return (
    <BlankModal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <Title>{title}</Title>
        <Description>{description}</Description>
        <PrimaryButton onClick={onPrimaryClick}>{primaryBtnDesc}</PrimaryButton>
        <SecondaryButton onClick={onSecondaryClick}>
          {secondaryBtnDesc}
        </SecondaryButton>
      </ModalContent>
    </BlankModal>
  );
}
