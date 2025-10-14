import type { LevelsResponse } from "../constants";
import { useApi, type ApiResponse } from "../utils/api";

/**
 * Level service hook. Automatically handles authentication if user is signed in.
 */
export function useLevelService() {
  const api = useApi();

  const getSpecifiedLevels = async (
    slug: string,
    afterPosition: number
  ): Promise<ApiResponse<LevelsResponse>> => {
    return await api.get<LevelsResponse>("/levelup/levels/", {
      params: {
        slug: slug,
        after_position: afterPosition.toString(),
      },
    });
  };

  const getCenteredLevels = async (
    slug: string,
    centerPosition?: number
  ): Promise<ApiResponse<LevelsResponse>> => {
    const params: { slug: string; center_position?: string } = { slug };

    if (centerPosition !== undefined) {
      params.center_position = centerPosition.toString();
    }

    return await api.get<LevelsResponse>("/levelup/levels/", { params });
  };

  const getPreviousLevels = async (
    slug: string,
    beforePosition: number
  ): Promise<ApiResponse<LevelsResponse>> => {
    return await api.get<LevelsResponse>("/levelup/levels/", {
      params: {
        slug: slug,
        before_position: beforePosition.toString(),
      },
    });
  };

  return { getSpecifiedLevels, getCenteredLevels, getPreviousLevels };
}

export function updateLevelService() {
  const api = useApi();

  const updateSpecifiedLevel = async (
    slug: string,
    levelNum: number,
    score: number,
    attempts_data: string,
    game_mode: string
  ): Promise<ApiResponse<LevelsResponse>> => {
    return await api.post<LevelsResponse>(
      "/levelup/levels/",
      { attempts_data: attempts_data }, // data object
      { params: { slug, level_num: levelNum, score, game_mode } } // config object with params
    );
  };

  return { updateSpecifiedLevel };
}
