import { useState, useEffect } from "react";
import styled from "styled-components";
import { theme } from "../../theme";
import { type Screen } from "../../constants";

interface EndGameModalProps {
  isOpen: boolean;
  result: string;
  answer: string;
  emojiGrid: string;
  onCopy: () => void;
  onClose?: () => void;
  mode: string;
  setCurrentScreen: (screen: Screen) => void;
  isStillAlive: Boolean;
}

const Overlay = styled.div<{ $isOpen: boolean }>`
  display: ${(props) => (props.$isOpen ? "flex" : "none")};
  position: fixed;
  inset: 0;
  z-index: 50;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.lg};
  font-family: "Inter", sans-serif;
`;

const OverlayBackground = styled.div`
  position: absolute;
  inset: 0;
  background-color: ${theme.colors.modalOverlay};
`;

const EmojiGrid = styled.pre`
  font-size: ${theme.fontSizes.xxl};
  line-height: 1.2;
  white-space: pre-wrap;
  text-align: center;
`;

const CopyButton = styled.button<{ $isHovered: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.sm};
  transition: all ${theme.transitions.fast};
  color: ${theme.colors.primaryText};
  background-color: ${(props) =>
    props.$isHovered ? theme.colors.buttonHover : theme.colors.buttonDefault};
  border: none;
  cursor: pointer;
  font-family: "Inter", sans-serif;
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.medium};
`;

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

const Timer = styled.div`
  color: ${theme.colors.secondaryText};
  font-size: ${theme.fontSizes.sm};
  text-align: center;
`;

export function EndGameModal({
  isOpen,
  result,
  answer,
  emojiGrid,
  onCopy,
  onClose,
  mode,
  setCurrentScreen,
  isStillAlive,
}: EndGameModalProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("23:14:55");
  const [displayAnswer, setDisplayAnswer] = useState("");
  const [primaryHovered, setPrimaryHovered] = useState(false);
  const [secondaryHovered, setSecondaryHovered] = useState(false);

  useEffect(() => {
    const words = answer.toLowerCase().split(" ");
    console.log(answer);
    const newAnswer = words.map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    setDisplayAnswer(newAnswer.join(" "));
  }, [answer]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
          2,
          "0"
        )}:${String(seconds).padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Determines the primary button's action based on the game mode
  const primaryClick = () => {
    if (mode === "levelup") {
      setCurrentScreen("select-level");
    } else if (mode === "endless") {
      setDisplayAnswer("...");
      if (!onClose) return;
      // If the player is alive, continue to the next round, otherwise go to landing.
      isStillAlive ? onClose() : setCurrentScreen("landing");
    } else if (mode === "daily") {
      setCurrentScreen("category-selection");
    }
  };

  // Determines the primary button's text based on the game mode
  const primaryText = () => {
    if (mode === "levelup") {
      return "Back to Level Selection";
    }
    if (mode === "endless") {
      return isStillAlive ? "Next Round" : "Exit to Landing";
    }
    if (mode === "daily") {
      return "Try Other Category!";
    }
    return ""; // Default case
  };

  // The secondary button's action is always to exit to the main menu
  const secondaryClick = () => {
    setCurrentScreen("landing");
  };

  // Determines the secondary button's text based on the game mode
  const secondaryText = () => {
    if (mode === "levelup") {
      return "Exit to Main Menu";
    }
    if (mode === "endless") {
      return "Exit (lose progress)";
    }
    if (mode === "daily") {
      return "Exit to Landing";
    }
    return ""; // Default case
  };

  return (
    <Overlay $isOpen={isOpen}>
      <OverlayBackground onClick={primaryClick} />
      <ModalContent>
        <Title>{result}</Title>

        <Description>
          The answer was: {displayAnswer == "" ? "..." : displayAnswer}
        </Description>

        {/* <EmojiGrid>{emojiGrid}</EmojiGrid> */}

        {/* <CopyButton
            onClick={primaryClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            $isHovered={isHovered}
          >
            Copy Results
          </CopyButton> */}

        {/* --- Reusable Button Group --- */}
        <PrimaryButton
          onClick={primaryClick}
          onMouseEnter={() => setPrimaryHovered(true)}
          onMouseLeave={() => setPrimaryHovered(false)}
        >
          {primaryText()}
        </PrimaryButton>
        {isStillAlive ? (
          <SecondaryButton
            onClick={secondaryClick}
            onMouseEnter={() => setSecondaryHovered(true)}
            onMouseLeave={() => setSecondaryHovered(false)}
          >
            {secondaryText()}
          </SecondaryButton>
        ) : null}

        {/* Timer is only shown for the "daily" mode
        {mode === "daily" && <Timer>Next puzzle in {timeRemaining}</Timer>} */}
      </ModalContent>
    </Overlay>
  );
}
