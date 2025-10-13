import { ScreenWrapper } from "./common/ScreenWrapper";
import { SelectionScreen } from "./common/SelectionScreen";
import type { InteractiveCardProps, ThemeType } from "../types/components";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useCategoryService } from "../services/categoryService";
import { modeDisplayNames } from "../constants";

interface ThemeSelectionProps {
  onAuthClick: () => void;
  onThemeSelect: (theme: ThemeType) => void;
  onDismiss: () => void;
  selectedMode: string;
}

export function ThemeSelection({
  onAuthClick,
  onThemeSelect,
  onDismiss,
  selectedMode,
}: ThemeSelectionProps) {
  const [categories, setCategories] = useState<InteractiveCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoaded } = useUser();

  // Use the new category service hook - automatically handles auth
  const { getCategories } = useCategoryService();

  const customCategory: InteractiveCardProps = {
    icon: "✍️",
    description: "Turn inside jokes into puzzles to challenge your friends.",
    title: "Custom",
    slug: "custom",
  };

  useEffect(() => {
    console.log("🔄 useEffect triggered - isLoaded:", isLoaded, "user:", user?.id);

    const loadCategories = async () => {
      if (!isLoaded) {
        console.log("⏳ Waiting for Clerk to load...");
        return;
      }

      console.log("🚀 Starting loadCategories...");
      setLoading(true);
      setError(null);

      try {
        // The hook automatically handles authentication if user is signed in
        const clerkUserId = user?.id;
        console.log("🔍 Calling getCategories with userId:", clerkUserId);
        const result = await getCategories(clerkUserId);

        console.log("📡 API Response:", result);

        if (result.success && result.data) {
          // Add custom category to the list
          const categoriesWithCustom = [...result.data, customCategory];
          setCategories(categoriesWithCustom);
          console.log("✅ Categories loaded successfully:", categoriesWithCustom.length);
        } else {
          // Handle API error with standardized error message
          setError(result.error || "Failed to load categories");
          console.error("❌ API Error:", result.error);
        }
      } catch (error) {
        // Handle unexpected errors
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setError(errorMessage);
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [isLoaded, user]); // Removed getCategories to prevent infinite loop

  const handleThemeClick = (category: InteractiveCardProps) => {
    // Convert InteractiveCardProps to ThemeType
    const themeType: ThemeType = {
      icon: category.icon,
      title: category.title,
      description: category.description,
      slug: category.slug,
    };
    onThemeSelect(themeType);
  };

  const categoriesWithHandlers = categories.map((category) => ({
    ...category,
    onClick: () => handleThemeClick(category),
  }));

  // // Handle different states from the API response
  // if (loading) {
  //   return (
  //     <ScreenWrapper onDismiss={onDismiss} onAuthClick={onAuthClick}>
  //       <div className="flex items-center justify-center h-64">
  //         <div className="text-lg">Loading categories...</div>
  //       </div>
  //     </ScreenWrapper>
  //   );
  // }

  // if (error) {
  //   return (
  //     <ScreenWrapper onDismiss={onDismiss} onAuthClick={onAuthClick}>
  //       <div className="flex flex-col items-center justify-center h-64 space-y-4">
  //         <div className="text-lg text-red-500">Failed to load categories</div>
  //         <div className="text-sm text-gray-500">{error}</div>
  //         <button
  //           onClick={() => window.location.reload()}
  //           className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  //         >
  //           Retry
  //         </button>
  //       </div>
  //     </ScreenWrapper>
  //   );
  // }

  return (
    <ScreenWrapper onDismiss={onDismiss} onAuthClick={onAuthClick}>
      <SelectionScreen
        title={modeDisplayNames[selectedMode] || selectedMode}
        cards={categoriesWithHandlers}
      />
    </ScreenWrapper>
  );
}
