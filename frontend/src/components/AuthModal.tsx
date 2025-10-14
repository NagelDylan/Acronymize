import { SignIn, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { BlankModal } from "./common/BlankModal";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  // 1. Get the user's sign-in status from the useUser hook
  const { isSignedIn } = useUser();

  // 2. Use useEffect to watch for changes in `isSignedIn`
  useEffect(() => {
    // If the modal is open AND the user is now signed in...
    if (isOpen && isSignedIn) {
      // ...close the modal.
      onClose();
    }
  }, [isSignedIn, isOpen, onClose]); // This effect runs whenever these values change

  if (!isOpen) {
    return null;
  }

  return (
    <BlankModal isOpen={isOpen} onClose={() => onClose()}>
      <SignIn
        forceRedirectUrl={
          window.location.hostname !== "localhost" ? "/Acronymize" : undefined
        }
      />
    </BlankModal>
  );
}
