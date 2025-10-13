import type { EndlessItem } from "../constants";
import { useApi, type ApiResponse } from "../utils/api";
import { type FrontendPuzzleElement } from "../types";

/**
 * Endless service hook. Automatically handles authentication if user is signed in.
 */
export function useEndlessService() {
  const api = useApi();

  const getAllHighScores = async (): Promise<ApiResponse<EndlessItem[]>> => {
    return await api.get<EndlessItem[]>("/endless/score/");
  };

  return { getAllHighScores };
}

export function updateEndlessHighScore() {
  const api = useApi();

  const updateSpecifiedHighScore = async (
    slug: string,
    score: number
  ): Promise<ApiResponse> => {
    return await api.post(
      "/endless/submit/",
      {}, // empty data object
      { params: { slug, score } } // config object with params
    );
  };

  return { updateSpecifiedHighScore };
}

interface LevelPacketResponse {
  puzzles: FrontendPuzzleElement[];
  count: number;
  total_available: number;
  filtered_positions: number[];
}

export function levelPacketService() {
  const api = useApi();

  const getLevelPacket = async (
    slug: string,
    lastPositions?: number[]
  ): Promise<ApiResponse<LevelPacketResponse>> => {
    // Prepare request body with last_position data if provided
    const requestBody = lastPositions && lastPositions.length > 0
      ? { last_position: lastPositions }
      : {};

    // Backend expects GET but with optional POST body
    // Since our API utility doesn't support GET with body, we use the request body approach
    // The backend will read from request.body for last_position filtering
    return await api.post<LevelPacketResponse>(
      "/endless/levels/",
      requestBody,
      { params: { slug } }
    );
  };

  return { getLevelPacket };
}
