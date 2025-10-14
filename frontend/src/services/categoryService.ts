import { useCallback } from "react";
import type {
  InteractiveCardProps,
  CategoryWithDynamicFields,
} from "../types/components";
import { useApi, type ApiResponse } from "../utils/api";

/**
 * Maps a backend category object to frontend InteractiveCardProps
 */
function mapCategoryToInteractiveCard(
  category: CategoryWithDynamicFields
): InteractiveCardProps {
  return {
    icon: category.emoji,
    title: category.name,
    description: category.description,
    slug: category.slug,
    // Map dynamic fields added by backend
    highScore: category.high_score,
    badge: category.badge,
  };
}

/**
 * Category service hook. Automatically handles authentication if user is signed in.
 * Always returns system categories, and includes user-specific categories if a userId is provided.
 */
export function useCategoryService() {
  const api = useApi();

  const getCategories = useCallback(
    async (
      mode: string,
      userId?: string
    ): Promise<ApiResponse<InteractiveCardProps[]>> => {
      const params = { user_id: userId, game_mode: mode };

      const result = await api.get<CategoryWithDynamicFields[]>(
        "/categories/",
        { params }
      );

      if (result.success && result.data) {
        return {
          success: true,
          data: result.data.map(mapCategoryToInteractiveCard),
        };
      }

      return {
        success: false,
        error: result.error || "Failed to fetch categories",
      };
    },
    [api]
  );

  return { getCategories };
}
