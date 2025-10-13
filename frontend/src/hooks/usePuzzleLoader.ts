import { useState, useCallback } from "react";
import { type FrontendPuzzleElement } from "../types/components";
import { type CategoryType } from "../types/components";
import { usePuzzleService } from "../services/puzzleService";
import { levelPacketService } from "../services/endlessService";
import { getWordOfDay } from "../services/puzzleService";

interface UsePuzzleLoaderProps {
  mode: string;
  category: CategoryType | null;
  initialPuzzle?: FrontendPuzzleElement | null;
  levelNum?: number;
  setCurrentPuzzle: (puzzle: FrontendPuzzleElement) => void;
}

interface UsePuzzleLoaderReturn {
  isLoading: boolean;
  error: string | null;
  loadNextPuzzle: () => Promise<void>;
  loadPuzzleForLevel: (level: number) => Promise<void>;
  loadDailyPuzzle: () => Promise<void>;
  loadRandomPuzzle: () => Promise<void>;
}

export function usePuzzleLoader({
  mode,
  category,
  levelNum = 0,
  setCurrentPuzzle,
}: UsePuzzleLoaderProps): UsePuzzleLoaderReturn {
  const { getPuzzle } = usePuzzleService();
  const { getLevelPacket } = levelPacketService();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState(levelNum);

  // Queue management state for endless mode
  const [puzzleQueue, setPuzzleQueue] = useState<FrontendPuzzleElement[]>([]);
  const [currentPosition, setCurrentPosition] = useState(0);

  const PREFETCH_THRESHOLD = 3; // When to start loading more puzzles

  const loadPuzzleForLevel = useCallback(
    async (level: number) => {
      if (!category) {
        setError("No category selected");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await getPuzzle(category.slug, level);
        if (result.success && result.data) {
          setCurrentPuzzle(result.data);
          setCurrentLevel(level);
        } else {
          setError(result.error || "Failed to load puzzle");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load puzzle");
      } finally {
        setIsLoading(false);
      }
    },
    [category, getPuzzle]
  );

  const loadRandomPuzzle = useCallback(async () => {
    if (!category) {
      setError("No category selected");
      return;
    }

    // Check if we need to load more puzzles (queue is running low)
    const remainingPuzzles = puzzleQueue.length - currentPosition;
    if (remainingPuzzles <= PREFETCH_THRESHOLD) {
      setIsLoading(true);
      setError(null);

      try {
        // Get the last 3 puzzle positions to avoid repeats
        let lastPositions: number[] = [];
        if (puzzleQueue.length >= 3) {
          const recentPuzzles = puzzleQueue.slice(
            Math.max(0, currentPosition - 3),
            currentPosition
          );
          lastPositions = recentPuzzles.map((puzzle) => puzzle.position);
        }

        // Load new batch of puzzles
        const result = await getLevelPacket(category.slug, lastPositions);

        if (result.success && result.data?.puzzles) {
          // Add new puzzles to the queue (replacing old ones if needed)
          setPuzzleQueue(result.data.puzzles);
          setCurrentPosition(0);

          // Set the first puzzle from the new batch
          if (result.data.puzzles.length > 0) {
            const firstPuzzle = result.data.puzzles[0];
            setCurrentPuzzle(firstPuzzle);
            setCurrentPosition(1);
          } else {
            setError("No puzzles available");
          }
        } else {
          setError(result.error || "Failed to load puzzle batch");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load puzzle batch"
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      // Use next puzzle from existing queue
      if (currentPosition < puzzleQueue.length) {
        const nextPuzzle = puzzleQueue[currentPosition];
        setCurrentPuzzle(nextPuzzle);
        setCurrentPosition((prev) => prev + 1);
      } else {
        setError("No more puzzles in queue");
      }
    }
  }, [category, puzzleQueue, currentPosition, getLevelPacket]);

  const loadDailyPuzzle = useCallback(async () => {
    if (!category) {
      setError("No category selected");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // For now, we'll use level 1 as the daily puzzle
      // In a real implementation, this would call a dedicated daily puzzle endpoint
      const result = await getWordOfDay(category.slug);

      if (result) {
        setCurrentPuzzle(result);
      } else {
        setError("Failed to load daily puzzle");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load daily puzzle"
      );
    } finally {
      setIsLoading(false);
    }
  }, [category, getPuzzle]);

  const loadNextPuzzle = useCallback(async () => {
    switch (mode) {
      case "levelup":
        await loadPuzzleForLevel(currentLevel + 1);
        break;
      case "endless":
        await loadRandomPuzzle();
        break;
      case "daily":
        await loadDailyPuzzle();
        break;
    }
  }, [
    mode,
    currentLevel,
    loadPuzzleForLevel,
    loadRandomPuzzle,
    loadDailyPuzzle,
  ]);

  return {
    isLoading,
    error,
    loadNextPuzzle,
    loadPuzzleForLevel,
    loadDailyPuzzle,
    loadRandomPuzzle,
  };
}
