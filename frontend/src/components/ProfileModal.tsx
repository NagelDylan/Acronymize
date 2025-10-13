import { UserProfile } from "@clerk/clerk-react";
import { BlankModal } from "./common/BlankModal";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <BlankModal isOpen={isOpen} onClose={() => onClose()}>
      <UserProfile routing="virtual" />
    </BlankModal>
  );
}
