import { ScreenWrapper } from "./common/ScreenWrapper";
import { SelectionScreen } from "./common/SelectionScreen";
import type { InteractiveCardProps, CategoryType } from "../types/components";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useCategoryService } from "../services/categoryService";
import { modeDisplayNames } from "../constants";

interface CategorySelectionProps {
  onAuthClick: () => void;
  onCategorySelect: (category: CategoryType) => void;
  onDismiss: () => void;
  selectedMode: string;
}

export function CategorySelection({
  onAuthClick,
  onCategorySelect,
  onDismiss,
  selectedMode,
}: CategorySelectionProps) {
  const [categories, setCategories] = useState<InteractiveCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoaded } = useUser();

  // Use the new category service hook - automatically handles auth
  const { getCategories } = useCategoryService();

  const customCategory: InteractiveCardProps = {
    icon: "✍️",
    description: "Challenge your friends with custom puzzles.",
    title: "Custom",
    slug: "custom",
    disabled: true,
    badge: "Coming Soon",
  };

  useEffect(() => {
    console.log(
      "🔄 useEffect triggered - isLoaded:",
      isLoaded,
      "user:",
      user?.id
    );

    const loadCategories = async () => {
      if (!isLoaded) {
        console.log("⏳ Waiting for Clerk to load...");
        return;
      }

      console.log("🚀 Starting loadCategories...");
      setIsLoading(true);

      try {
        // The hook automatically handles authentication if user is signed in
        const clerkUserId = user?.id;
        console.log("🔍 Calling getCategories with userId:", clerkUserId);
        const result = await getCategories(selectedMode, clerkUserId);

        console.log("📡 API Response:", result);

        if (result.success && result.data) {
          // Add custom category to the list
          const categoriesWithCustom = [...result.data, customCategory];
          setCategories(categoriesWithCustom);
          console.log(
            "✅ Categories loaded successfully:",
            categoriesWithCustom.length
          );
        } else {
          // Handle API error with standardized error message
          console.error("❌ API Error:", result.error);
        }
      } catch (error) {
        // Handle unexpected errors
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, [isLoaded, user?.id, selectedMode]);

  const handleCategoryClick = (category: InteractiveCardProps) => {
    // Convert InteractiveCardProps to CategoryType
    const categoryType: CategoryType = {
      icon: category.icon,
      title: category.title,
      description: category.description,
      slug: category.slug,
    };
    onCategorySelect(categoryType);
  };

  const categoriesWithHandlers = categories.map((category) => ({
    ...category,
    onClick: () => handleCategoryClick(category),
  }));


  return (
    <ScreenWrapper onDismiss={onDismiss} onAuthClick={onAuthClick}>
      <SelectionScreen
        title={
          !isLoading
            ? modeDisplayNames[selectedMode] || selectedMode
            : "Loading categories..."
        }
        cards={categoriesWithHandlers}
      />
    </ScreenWrapper>
  );
}
