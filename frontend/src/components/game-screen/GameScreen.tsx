import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { GuessRow } from "../GuessRow";
import { EndGameModal } from "./EndGameModal";
import { theme } from "../../theme";
import { ScreenWrapper } from "../common/ScreenWrapper";
import { ExitGameModal } from "./ExitGameModal";
import { InputBar } from "./InputBar";
import { type Guess, type Screen } from "../../constants";
import { type CategoryType } from "../../types/components";
import { type FrontendPuzzleElement } from "../../types/components";
import { usePuzzleLoader } from "../../hooks/usePuzzleLoader";
import { useProgressSaver } from "../../hooks/useProgressSaver";
import { PipCounter } from "./PipCounter";
import { usePuzzleService } from "../../services/puzzleService";
import { getPuzzleSolution } from "../../services/puzzleService";

interface GameScreenProps {
  mode: string;
  category: CategoryType | null;
  setCurrentScreen: (screen: Screen) => void;
  puzzle: FrontendPuzzleElement | null;
  level_num: number;
}

const GameWrapper = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  height: 100%;
`;

const ModeIndicator = styled.div`
  margin-bottom: ${theme.spacing.xxxl};
  text-align: center;
  color: ${theme.colors.secondaryText};
  font-size: ${theme.fontSizes.sm};
  font-family: "Inter", sans-serif;
`;

const ThemeText = styled.div`
  color: ${theme.colors.secondaryText};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.normal};
  margin-bottom: ${theme.spacing.sm};
  font-family: "Inter", sans-serif;
  text-align: center;
`;

const Acronym = styled.div`
  color: ${theme.colors.primaryText};
  font-size: ${theme.fontSizes.xxxxl};
  font-weight: ${theme.fontWeights.bold};
  letter-spacing: 32px;
  margin-right: -32px;
  font-family: "Inter", sans-serif;
  text-align: center;
`;

const GuessArea = styled.div`
  margin-top: 48px;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
  max-height: 340px;
  overflow-y: auto;
  padding-right: ${theme.spacing.sm};
  scroll-behavior: smooth;

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
    scrollbar-gutter: stable;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.cardBorder};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.secondaryText};
  }
`;

const ScoreDisplay = styled.div`
  text-align: center;
  color: ${theme.colors.primaryText};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
  margin-bottom: ${theme.spacing.md};
  font-family: "Inter", sans-serif;
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: ${theme.colors.secondaryText};
  font-size: ${theme.fontSizes.base};
  margin: ${theme.spacing.xl} 0;
  font-family: "Inter", sans-serif;
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: #ff6b6b;
  font-size: ${theme.fontSizes.base};
  margin: ${theme.spacing.xl} 0;
  font-family: "Inter", sans-serif;
`;

export function GameScreen({
  mode,
  category,
  setCurrentScreen,
  puzzle: initialPuzzle,
  level_num,
}: GameScreenProps) {
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [currentPuzzle, setCurrentPuzzle] =
    useState<FrontendPuzzleElement | null>(initialPuzzle);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const { getPuzzleGuessResults } = usePuzzleService();
  const [isEndModalOpen, setisEndModalOpen] = useState(false);
  const [golfResult, setGolfResult] = useState<string>("");
  const [normResult, setNormResult] = useState<string>("");
  const inputBarRef = useRef<any>(null);
  const guessAreaRef = useRef<HTMLDivElement>(null);
  const [emojiGrid, setEmojiGrid] = useState("");
  const [isStillAlive, setIsStillAlive] = useState(true);
  const [solution, setSolution] = useState("");

  // Auto-scroll to bottom when new guess is added
  useEffect(() => {
    if (guessAreaRef.current) {
      guessAreaRef.current.scrollTop = guessAreaRef.current.scrollHeight;
    }
  }, [guesses.length]);

  const getGolfTerm = (guessCount: number, parScore: number): string => {
    const scoreDiff = guessCount - parScore;

    switch (scoreDiff) {
      case -3:
        return "Albatross! 🦅";
      case -2:
        return "Eagle! 🦅";
      case -1:
        return "Birdie! 🐦";
      case 0:
        return "Par! ⛳";
      case 1:
        return "Bogey! 😬";
      case 2:
        return "Double Bogey! 😰";
      case 3:
        return "Triple Bogey! 🫨";
      default:
        if (scoreDiff < -3) return "Condor! 🦅✨";
        return `${Math.abs(scoreDiff)} Over Par! 😵`;
    }
  };

  const generateEmojiGrid = (finalGuesses: Guess[]): string => {
    let newEmojiGrid = "";
    for (const guess of finalGuesses) {
      let emojiLine = "";
      for (const word of guess.words) {
        if (word.status === "correct") {
          emojiLine += "🟩";
        } else if (word.status === "misplaced") {
          emojiLine += "🟨";
        } else {
          emojiLine += "⬜️";
        }
      }
      if (newEmojiGrid) {
        newEmojiGrid += "\n";
      }
      newEmojiGrid += emojiLine;
    }
    return newEmojiGrid;
  };

  const getResultMessage = (
    finalGuesses: Guess[],
    puzzle: FrontendPuzzleElement
  ): string => {
    switch (mode) {
      case "levelup":
        return getGolfTerm(finalGuesses.length, puzzle.par_score);
      case "endless":
        return `Round ${roundsCompleted + 1} Complete! 🎯`;
      case "daily":
        return `Daily Puzzle Complete! ⭐`;
      default:
        return "Puzzle Complete! 🎉";
    }
  };

  const getDisplayName = (mode: string) => {
    switch (mode) {
      case "endless":
        return "Endless";
      case "daily":
        return "Daily";
      default:
        return "Level Up";
    }
  };

  // Initialize puzzle loader
  const puzzleLoader = usePuzzleLoader({
    mode,
    category,
    initialPuzzle,
    levelNum: level_num,
    setCurrentPuzzle,
  });

  // Use current puzzle from loader or fallback to initial
  useEffect(() => {
    setCurrentPuzzle(currentPuzzle || initialPuzzle);
  }, []);

  // Initialize progress saver
  const progressSaver = useProgressSaver({
    mode,
    category,
  });

  // Load initial puzzle for modes that need it
  useEffect(() => {
    if (!initialPuzzle && category) {
      switch (mode) {
        case "endless":
          puzzleLoader.loadRandomPuzzle();
          break;
        case "daily":
          puzzleLoader.loadDailyPuzzle();
          break;
        case "levelup":
          if (level_num > 0) {
            puzzleLoader.loadPuzzleForLevel(level_num);
          }
          break;
      }
    }
  }, [mode, category, initialPuzzle, level_num]);

  const handleExitEndGameModal = async () => {
    if (!currentPuzzle) return;

    if (mode === "endless") {
      // Load next puzzle and continue
      await puzzleLoader.loadRandomPuzzle();
      setGuesses([]);
      setCurrentPuzzle;
      setRoundsCompleted((prev) => prev + 1);
      setisEndModalOpen(false);
    }
  };

  const handleContainerClick = () => {
    inputBarRef.current?.focus();
  };

  const handleCopyResults = () => {
    let shareText = "";

    if (mode == "endless") {
      shareText = `Acronymize • Endless - Round ${roundsCompleted + 1}`;
    } else {
      shareText = `Acronymize • ${getDisplayName(
        mode
      )} - Round - ${golfResult}}`;
    }

    shareText += `\n\n${emojiGrid}}`;

    navigator.clipboard.writeText(shareText);
    console.log("Results copied to clipboard!");
  };

  const handleEndGameProcess = async () => {
    if (!currentPuzzle || !category) return;

    setisEndModalOpen(true);

    const solution = await getPuzzleSolution(
      category?.slug,
      currentPuzzle.position
    );

    setSolution(solution);

    // Save progress based on mode configuration
    const saved = await progressSaver.saveProgress(
      guesses,
      currentPuzzle,
      roundsCompleted
    );

    if (!saved) {
      console.warn("Failed to save progress");
    }
  };

  // Enhanced guess submit handler
  const handleGuessSubmit = async (guess: string) => {
    if (!category || !currentPuzzle) return;

    const result = await getPuzzleGuessResults(
      category.slug,
      currentPuzzle.position,
      guess
    );
    if (!result.success || !result.data) return;

    const wordAccuracy = result.data.word_results;
    const score = result.data.score;

    // Map integer accuracy to status strings
    const getStatusFromAccuracy = (
      accuracy: number
    ): "correct" | "misplaced" | "incorrect" => {
      switch (accuracy) {
        case 0:
          return "correct";
        case 1:
          return "misplaced";
        case 2:
          return "incorrect";
        default:
          return "incorrect";
      }
    };

    const newGuesses = [...guesses];
    newGuesses.push({
      words: guess.split(" ").map((word, i) => ({
        text: word,
        status: getStatusFromAccuracy(wordAccuracy[i]),
      })),
      rowSimilarityScore: score * 100,
    });

    setGuesses(newGuesses);
    setCurrentGuess("");

    if (mode == "endless" && newGuesses.length > currentPuzzle.par_score - 1) {
      setIsStillAlive(false);
      setNormResult(`Round ${roundsCompleted + 1} Failed! ‼️`);
      setEmojiGrid(generateEmojiGrid(guesses));

      await handleEndGameProcess();
    }

    if (score === 1) {
      setGolfResult(getGolfTerm(newGuesses.length, currentPuzzle.par_score));
      setNormResult(getResultMessage(newGuesses, currentPuzzle));
      setEmojiGrid(generateEmojiGrid(guesses));
      await handleEndGameProcess();
    }
  };

  // Loading state
  if (puzzleLoader.isLoading) {
    return (
      <ScreenWrapper
        onDismiss={() => setIsExitModalOpen(true)}
        onAuthClick={() => console.log("Auth clicked")}
        isInGame={true}
      >
        <GameWrapper>
          <ModeIndicator>{getDisplayName(mode)}</ModeIndicator>
          <LoadingMessage>Loading puzzle...</LoadingMessage>
        </GameWrapper>
      </ScreenWrapper>
    );
  }

  // Error state
  if (puzzleLoader.error) {
    return (
      <ScreenWrapper
        onDismiss={() => setIsExitModalOpen(true)}
        onAuthClick={() => console.log("Auth clicked")}
        isInGame={true}
      >
        <GameWrapper>
          <ModeIndicator>{getDisplayName(mode)}</ModeIndicator>
          <ErrorMessage>Error: {puzzleLoader.error}</ErrorMessage>
        </GameWrapper>
      </ScreenWrapper>
    );
  }

  // No puzzle state
  if (!currentPuzzle) {
    return (
      <ScreenWrapper
        onDismiss={() => setIsExitModalOpen(true)}
        onAuthClick={() => console.log("Auth clicked")}
        isInGame={true}
      >
        <GameWrapper>
          <ModeIndicator>{getDisplayName(mode)}</ModeIndicator>
          <ErrorMessage>No puzzle available</ErrorMessage>
        </GameWrapper>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      onDismiss={() => setIsExitModalOpen(true)}
      onAuthClick={() => console.log("Auth clicked")}
      isInGame={true}
    >
      <ExitGameModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onExitClick={() => setCurrentScreen("landing")}
      />
      <GameWrapper onClick={handleContainerClick}>
        <ModeIndicator>
          {getDisplayName(mode)} • {category ? category.title : "No Category"}
        </ModeIndicator>

        {mode == "endless" && (
          <ScoreDisplay>Round {roundsCompleted + 1}</ScoreDisplay>
        )}

        <ThemeText>{currentPuzzle.clue} </ThemeText>

        <Acronym>{currentPuzzle.acronym}</Acronym>

        <PipCounter
          currentGuesses={guesses.length}
          par={currentPuzzle.par_score}
          mode={mode}
        />

        <GuessArea ref={guessAreaRef}>
          {guesses.map((guess, index) => (
            <GuessRow
              key={index}
              words={guess.words}
              rowSimilarityScore={guess.rowSimilarityScore}
              isHighlighted={
                index === guesses.length - 1 && currentGuess === ""
              }
            />
          ))}
        </GuessArea>

        <InputBar
          ref={inputBarRef}
          currentGuess={currentGuess}
          onGuessChange={setCurrentGuess}
          onSubmit={handleGuessSubmit}
          acronym={currentPuzzle.acronym}
          setOpenExitModal={() => setIsExitModalOpen(true)}
        />
      </GameWrapper>

      <EndGameModal
        isOpen={isEndModalOpen}
        result={normResult}
        answer={solution}
        emojiGrid={emojiGrid}
        onCopy={handleCopyResults}
        onClose={handleExitEndGameModal}
        mode={mode}
        setCurrentScreen={setCurrentScreen}
        isStillAlive={isStillAlive}
      />
    </ScreenWrapper>
  );
}
