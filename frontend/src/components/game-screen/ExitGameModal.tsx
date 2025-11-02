import { PopUpModal } from "../common/PopUpModal";

interface ExitModalProps {
  isOpen: boolean;
  gameMode?: string;
  onClose: () => void;
  onExitClick: () => void;
}

export function ExitGameModal({
  isOpen,
  onClose,
  onExitClick,
}: ExitModalProps) {
  return (
    <PopUpModal
      isOpen={isOpen}
      onClose={onClose}
      title="Leaving already?"
      description="If you quit now, this round's guesses and score will disappear into the void. Want to keep going?"
      primaryBtnDesc="Keep playing"
      secondaryBtnDesc="Exit Anyways"
      onPrimaryClick={onClose}
      onSecondaryClick={onExitClick}
    />
  );
}
