import styled from "styled-components";
import { theme } from "../../theme";

interface BlankModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Overlay = styled.div<{ $isOpen: boolean }>`
  display: ${(props) => (props.$isOpen ? "flex" : "none")};
  position: fixed;
  inset: 0;
  z-index: 50;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.lg};
`;

const OverlayBackground = styled.div`
  position: absolute;
  inset: 0;
  background-color: ${theme.colors.modalOverlay};
`;

export const BlankModal = ({ isOpen, onClose, children }: BlankModalProps) => {
  return (
    <Overlay $isOpen={isOpen}>
      <OverlayBackground onClick={onClose} />
      {children}
    </Overlay>
  );
};
