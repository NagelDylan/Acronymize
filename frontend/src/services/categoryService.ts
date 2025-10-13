import type { InteractiveCardProps, Category } from "../types/components";
import { useApi, type ApiResponse } from "../utils/api";

/**
 * Maps a backend category object to frontend InteractiveCardProps
 */
function mapCategoryToInteractiveCard(
  category: Category
): InteractiveCardProps {
  return {
    icon: category.emoji,
    title: category.name,
    description: category.description,
    slug: category.slug,
  };
}

/**
 * Category service hook. Automatically handles authentication if user is signed in.
 * Always returns system categories, and includes user-specific categories if a userId is provided.
 */
export function useCategoryService() {
  const api = useApi();

  const getCategories = async (userId?: string): Promise<ApiResponse<InteractiveCardProps[]>> => {
    const params = userId ? { user_id: userId } : undefined;

    const result = await api.get<Category[]>('/categories/', { params });

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
  };

  return { getCategories };
}
