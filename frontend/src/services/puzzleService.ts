import { type FrontendPuzzleElement } from "../types";
import { useApi, apiClient, type ApiResponse } from "../utils/api";

interface GuessResults {
  word_results: number[];
  score: number;
}

/**
 * Hook version: Puzzle service with authentication support
 */
export function usePuzzleService() {
  const api = useApi();

  const getPuzzle = async (
    slug: string,
    level_num: number
  ): Promise<ApiResponse<FrontendPuzzleElement>> => {
    const result = await api.get<FrontendPuzzleElement>(
      `/puzzles/${slug}/${level_num}/`
    );

    if (result.success && result.data) {
      // Format clue text consistently
      result.data.clue =
        result.data.clue.charAt(0).toUpperCase() +
        result.data.clue.substring(1).toLowerCase();
    }

    return result;
  };

  const getPuzzleGuessResults = async (
    slug: string,
    level_num: number,
    guess: string
  ): Promise<ApiResponse<GuessResults>> => {
    return await api.post<GuessResults>(
      `/puzzles/${slug}/guess/${level_num}/`,
      { message: guess }
    );
  };

  return { getPuzzle, getPuzzleGuessResults };
}

/**
 * Non-hook version: Fetches the puzzle with specified level and category slug
 */
export async function getPuzzle(
  slug: string,
  level_num: number
): Promise<FrontendPuzzleElement> {
  try {
    const result = await apiClient.get<FrontendPuzzleElement>(
      `/puzzles/${slug}/${level_num}/`
    );

    if (result.success && result.data) {
      // Format clue text consistently
      result.data.clue =
        result.data.clue.charAt(0).toUpperCase() +
        result.data.clue.substring(1).toLowerCase();
      return result.data;
    }

    throw new Error(result.error || "Failed to fetch puzzle");
  } catch (error) {
    console.error("Failed to fetch puzzle:", error);
    throw error;
  }
}

/**
 * Getst the puzzle solution
 */
export async function getPuzzleSolution(
  slug: string,
  level_num: number
): Promise<string> {
  try {
    const result = await apiClient.get<any>(
      `/puzzles/solution/${slug}/${level_num}/`
    );

    if (result.success && result.data) {
      // Format clue text consistently
      const solution =
        result.data.solution.charAt(0).toUpperCase() +
        result.data.solution.substring(1).toLowerCase();
      return solution;
    }

    throw new Error(result.error || "Failed to fetch solution");
  } catch (error) {
    console.error("Failed to fetch puzzle:", error);
    throw error;
  }
}

/**
 * Non-hook version: Submits a guess for the puzzle and gets results
 */
export async function getPuzzleGuessResults(
  slug: string,
  level_num: number,
  guess: string
): Promise<GuessResults> {
  try {
    const result = await apiClient.post<GuessResults>(
      `/puzzles/${slug}/guess/${level_num}/`,
      { message: guess }
    );

    if (result.success && result.data) {
      return result.data;
    }

    throw new Error(result.error || "Failed to submit guess");
  } catch (error) {
    console.error("Failed to submit guess:", error);
    throw error;
  }
}

export async function getWordOfDay(
  slug: string
): Promise<FrontendPuzzleElement> {
  try {
    const result = await apiClient.get<FrontendPuzzleElement>(`/daily/`, {
      params: { slug },
    });

    if (result.success && result.data) {
      return result.data;
    }

    throw new Error(result.error || "Failed to retrieve word of the day");
  } catch (error) {
    console.error("Failed to submit guess:", error);
    throw error;
  }
}
