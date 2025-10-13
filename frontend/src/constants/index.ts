export const modeDisplayNames: Record<string, string> = {
  daily: "Daily Puzzle",
  endless: "Endless Run",
  levelup: "Level Up",
};

// Re-export game mode configurations
export {
  type GameMode,
  type GameModeConfig,
  gameModeConfigs,
  getGameModeConfig,
} from "./gameModes";

export type Screen =
  | "landing"
  | "mode-selection"
  | "category-selection"
  | "game"
  | "select-level"
  | "instructions";

export const LevelStatus = {
  LOCKED: "locked",
  CRUSHED: "crushed",
  SOLID: "solid",
  FAILED: "failed",
  READY: "ready",
} as const;

export type LevelStatusType = (typeof LevelStatus)[keyof typeof LevelStatus];

export interface GuessResults {
  word_results: number[];
  score: number;
}

export interface LevelItem {
  puzzle_id: number;
  position: number;
  par_score: number;
  score?: number;
  attempts_data?: string;
  is_completed: boolean;
  status?: LevelStatusType;
}

export interface LevelsResponse {
  items: LevelItem[];
  next_cursor: number;
  batch_size: number;
}

export interface EndlessItem {
  slug: string;
  high_score: number;
}

export interface Word {
  text: string;
  status: "correct" | "misplaced" | "incorrect";
}

export interface Guess {
  words: Word[];
  rowSimilarityScore: number;
}
