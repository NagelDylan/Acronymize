import { type FrontendPuzzleElement } from "../types/components";

export type GameMode = "levelup" | "endless" | "daily";

export type ScoringType = "guessCount" | "highScore" | "dailyCompletion";

export interface GameModeConfig {
  /** How scoring works for this mode */
  scoringType: ScoringType;

  /** Whether the game continues after winning a puzzle */
  continuousPlay: boolean;

  /** Whether to save progress after each game */
  saveProgress: boolean;

  /** How to load puzzles for this mode */
  puzzleLoadingStrategy: "levelBased" | "random" | "daily";

  /** Display name for the mode */
  displayName: string;

  /** Description for UI */
  description: string;

  /** Whether this mode requires authentication */
  requiresAuth: boolean;
}

export const gameModeConfigs: Record<GameMode, GameModeConfig> = {
  levelup: {
    scoringType: "guessCount",
    continuousPlay: false,
    saveProgress: true,
    puzzleLoadingStrategy: "levelBased",
    displayName: "Level Up",
    description: "Progress through levels with par scoring",
    requiresAuth: true,
  },

  endless: {
    scoringType: "highScore",
    continuousPlay: true,
    saveProgress: true,
    puzzleLoadingStrategy: "random",
    displayName: "Endless Run",
    description: "See how many puzzles you can solve in a row",
    requiresAuth: false,
  },

  daily: {
    scoringType: "dailyCompletion",
    continuousPlay: false,
    saveProgress: true,
    puzzleLoadingStrategy: "daily",
    displayName: "Daily Puzzle",
    description: "One special puzzle per day",
    requiresAuth: false,
  },
};

export function getGameModeConfig(mode: string): GameModeConfig {
  const config = gameModeConfigs[mode as GameMode];
  if (!config) {
    console.warn(`Unknown game mode: ${mode}, falling back to levelup`);
    return gameModeConfigs.levelup;
  }
  return config;
}
