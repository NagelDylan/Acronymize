import { useCallback } from "react";
import { type GameModeConfig, getGameModeConfig } from "../constants/gameModes";
import { type CategoryType } from "../types/components";
import { type FrontendPuzzleElement } from "../types/components";
import { updateLevelService } from "../services/levelServices";
import { updateEndlessHighScore } from "../services/endlessService";
import type { Guess } from "../constants";

interface UseProgressSaverProps {
  mode: string;
  category: CategoryType | null;
}

interface UseProgressSaverReturn {
  saveProgress: (
    guesses: Guess[],
    puzzle: FrontendPuzzleElement,
    roundsCompleted?: number
  ) => Promise<boolean>;
  config: GameModeConfig;
}

export function useProgressSaver({
  mode,
  category,
}: UseProgressSaverProps): UseProgressSaverReturn {
  const config = getGameModeConfig(mode);
  const { updateSpecifiedLevel } = updateLevelService();
  const { updateSpecifiedHighScore } = updateEndlessHighScore();

  const generateEmojiGrid = (guesses: Guess[]): string => {
    let emojiGrid = "";
    for (const guess of guesses) {
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
      if (emojiGrid) {
        emojiGrid += "\n";
      }
      emojiGrid += emojiLine;
    }
    return emojiGrid;
  };

  const saveLevelupProgress = useCallback(
    async (
      guesses: Guess[],
      puzzle: FrontendPuzzleElement
    ): Promise<boolean> => {
      if (!category) return false;

      try {
        const emojiGrid = generateEmojiGrid(guesses);
        const result = await updateSpecifiedLevel(
          category.slug,
          puzzle.position,
          guesses.length,
          emojiGrid,
          mode
        );
        return result.success;
      } catch (error) {
        console.error("Failed to save levelup progress:", error);
        return false;
      }
    },
    [category, updateSpecifiedLevel]
  );

  const saveEndlessProgress = useCallback(
    async (
      guesses: Guess[],
      puzzle: FrontendPuzzleElement,
      roundsCompleted: number = 0
    ): Promise<boolean> => {
      if (!category) return false;

      try {
        // For endless mode, we save the high score (rounds completed)
        const result = await updateSpecifiedHighScore(
          category.slug,
          roundsCompleted + 1
        );
        return result.success;
      } catch (error) {
        console.error("Failed to save endless progress:", error);
        return false;
      }
    },
    [category, updateSpecifiedHighScore]
  );

  const saveDailyProgress = useCallback(
    async (
      guesses: Guess[],
      puzzle: FrontendPuzzleElement
    ): Promise<boolean> => {
      if (!category) return false;

      try {
        const emojiGrid = generateEmojiGrid(guesses);
        const result = await updateSpecifiedLevel(
          category.slug,
          puzzle.position,
          guesses.length,
          emojiGrid,
          mode
        );
        return result.success;
      } catch (error) {
        console.error("Failed to save daily progress:", error);
        return false;
      }
    },
    [category, updateSpecifiedLevel]
  );

  const saveProgress = useCallback(
    async (
      guesses: Guess[],
      puzzle: FrontendPuzzleElement,
      roundsCompleted?: number
    ): Promise<boolean> => {
      if (!config.saveProgress) {
        return true; // No saving required for this mode
      }

      switch (config.scoringType) {
        case "guessCount":
          return await saveLevelupProgress(guesses, puzzle);

        case "highScore":
          return await saveEndlessProgress(
            guesses,
            puzzle,
            roundsCompleted || 0
          );

        case "dailyCompletion":
          return await saveDailyProgress(guesses, puzzle);

        default:
          console.warn(`Unknown scoring type: ${config.scoringType}`);
          return false;
      }
    },
    [config, saveLevelupProgress, saveEndlessProgress, saveDailyProgress]
  );

  return {
    saveProgress,
    config,
  };
}
