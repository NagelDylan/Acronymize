import type { InteractiveCardProps } from "../types/components";
import { ScreenWrapper } from "./common/ScreenWrapper";
import { SelectionScreen } from "./common/SelectionScreen";
import { useUser } from "@clerk/clerk-react";

interface ModeSelectionProps {
  onAuthClick: () => void;
  onModeSelect: (mode: string) => void;
  onLoginRequired: (mode: string) => void;
  onDismiss: () => void;
}

export function ModeSelection({
  onAuthClick,
  onModeSelect,
  onLoginRequired,
  onDismiss,
}: ModeSelectionProps) {
  const { isSignedIn } = useUser();
  const handleModeClick = (mode: string, requiresAuth: boolean) => {
    if (requiresAuth && !isSignedIn) {
      onLoginRequired(mode);
    } else {
      onModeSelect(mode);
    }
  };

  const modeOptions: InteractiveCardProps[] = [
    {
      icon: "📅",
      title: "Daily Puzzle",
      description: "A new puzzle every day for everyone.",
      slug: "daily",
      onClick: () => handleModeClick("daily", false),
    },
    {
      icon: "♾️",
      title: "Endless Run",
      description: "Survive as many levels as you can.",
      slug: "endless",
      onClick: () => handleModeClick("endless", true),
    },
    {
      icon: "📈",
      title: "Level Up",
      description: "Progress through curated challenges.",
      slug: "levelup",
      onClick: () => handleModeClick("levelup", true),
    },
    {
      icon: "🎉",
      title: "Party Mode",
      description: "Challenge your friends.",
      slug: "party",
      onClick: () => {},
      disabled: true,
      badge: "Coming Soon",
    },
  ];

  return (
    <ScreenWrapper onDismiss={onDismiss} onAuthClick={onAuthClick}>
      <SelectionScreen title="Choose Your Mode" cards={modeOptions} />
    </ScreenWrapper>
  );
}
