import { modeDisplayNames } from "../constants";
import { PopUpModal } from "./common/PopUpModal";

interface LoginModalProps {
  isOpen: boolean;
  gameMode?: string;
  onClose: () => void;
  onLogin: () => void;
}

export function LoginModal({
  isOpen,
  onClose,
  onLogin,
  gameMode,
}: LoginModalProps) {
  return (
    <PopUpModal
      isOpen={isOpen}
      onClose={onClose}
      title="Track Your Progress"
      description={`Sign up or log in to play ${
        gameMode ? `"${modeDisplayNames[gameMode]}"` : "new modes"
      }, unlock new levels, and save your custom acronyms.`}
      primaryBtnDesc="Sign Up / Log In"
      secondaryBtnDesc="Maybe Later"
      onPrimaryClick={onLogin}
      onSecondaryClick={onClose}
    />
  );
}
