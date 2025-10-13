import { useEffect, useState } from "react";
import styled from "styled-components";
import { ChevronLeft as ChevronLeftIcon, ChevronRight } from "lucide-react";
import { theme } from "../theme";
import { ScreenWrapper } from "./common/ScreenWrapper";
import { useLevelService } from "../services/levelServices";
import { useUser } from "@clerk/clerk-react";
import { type CategoryType } from "../types";
import type { LevelItem, LevelStatusType } from "../constants";
import { LevelStatus } from "../constants";

interface LevelSelectionProps {
  onAuthClick: () => void;
  onDismiss: () => void;
  onLevelSelect: (level_num: number) => Promise<void>;
  category: CategoryType | null;
}

const NO_MORE_LEVELS = -1;

const Title = styled.h1`
  color: ${theme.colors.primaryText};
  font-size: ${theme.fontSizes.xxxxl};
  font-weight: ${theme.fontWeights.bold};
  margin-bottom: ${theme.spacing.xxxxl};
  text-align: center;
  font-family: "Inter", sans-serif;
`;

const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 800px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${theme.spacing.xxxl};
`;

const CarouselWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const LevelCard = styled.div<{ $position: "prev" | "current" | "next" }>`
  position: absolute;
  width: 400px;
  height: 320px;
  background-color: ${theme.colors.cardBackground};
  border: 1px solid ${theme.colors.cardBorder};
  border-radius: ${theme.borderRadius.md};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xl};
  transition: all 0.3s ease;
  cursor: ${(props) => (props.$position === "current" ? "default" : "pointer")};

  ${(props) => {
    switch (props.$position) {
      case "prev":
        return `
          left: -100px;
          transform: scale(0.8);
          opacity: 0.3;
          z-index: 1;
        `;
      case "current":
        return `
          left: 50%;
          transform: translateX(-50%) scale(1);
          opacity: 1;
          z-index: 10;
          box-shadow: ${theme.shadows.card};
        `;
      case "next":
        return `
          right: -100px;
          transform: scale(0.8);
          opacity: 0.3;
          z-index: 1;
        `;
    }
  }}

  &:hover {
    ${(props) =>
      props.$position !== "current" &&
      `
      opacity: 0.5;
    `}
  }
`;

const LevelNumber = styled.div`
  font-size: 80px;
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primaryText};
  font-family: "Inter", sans-serif;
  line-height: 1;
`;

const StatusBadge = styled.div<{ $status: LevelStatusType }>`
  padding: ${theme.spacing.sm} ${theme.spacing.xl};
  border-radius: 9999px;
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.medium};
  font-family: "Inter", sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${(props) => {
    switch (props.$status) {
      case "locked":
        return `
          background-color: ${theme.colors.secondaryText};
          color: ${theme.colors.background};
        `;
      case "crushed":
        return `
          background-color: ${theme.colors.accentGreen};
          color: ${theme.colors.white};
        `;
      case "solid":
        return `
          background-color: ${theme.colors.accentYellow};
          color: ${theme.colors.background};
        `;
      case "failed":
        return `
          background-color: #E53E3E;
          color: ${theme.colors.white};
        `;
    }
  }}
`;

const InnerContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  flex-direction: column;
`;

const NavigationButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 20;
  background-color: ${theme.colors.cardBackground};
  border: 1px solid ${theme.colors.cardBorder};
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  color: ${theme.colors.primaryText};

  &:hover:not(:disabled) {
    background-color: ${theme.colors.accentIndigo};
    border-color: ${theme.colors.accentIndigo};
    color: ${theme.colors.white};
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const PrevButton = styled(NavigationButton)`
  left: -60px;
`;

const NextButton = styled(NavigationButton)`
  right: -60px;
`;

const PlayButton = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.xxxl};
  background-color: ${theme.colors.accentIndigo};
  color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.sm};
  border: none;
  cursor: pointer;
  transition: background-color ${theme.transitions.fast};
  font-family: "Inter", sans-serif;
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.bold};

  &:hover:not(:disabled) {
    background-color: ${theme.colors.accentIndigoDark};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  margin-bottom: ${theme.spacing.lg};
`;

const Hint = styled.p`
  color: ${theme.colors.secondaryText};
  font-size: ${theme.fontSizes.sm};
  text-align: center;
  font-family: "Inter", sans-serif;
`;

const statusLabels: Record<LevelStatusType, string> = {
  locked: "Locked",
  crushed: "Crushed It",
  solid: "Solid Effort",
  failed: "Glorious Failure",
  ready: "",
};

export function LevelSelection({
  onAuthClick,
  onDismiss,
  onLevelSelect,
  category,
}: LevelSelectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoaded } = useUser();
  const [afterPosition, setAfterPosition] = useState(0);
  const [levels, setLevels] = useState<LevelItem[]>([]);
  const { getSpecifiedLevels } = useLevelService();

  const calculateLevelStatus = (
    par_score: number,
    score: number | undefined,
    is_completed: boolean,
    isLocked: boolean
  ): LevelStatusType => {
    // If explicitly locked (due to previous level not completed), show as locked
    if (isLocked) {
      return LevelStatus.LOCKED;
    }

    // If not completed yet but available to play, show as failed (playable)
    if (!is_completed || score === undefined) {
      return LevelStatus.READY; // Available to play, no score yet
    }

    // If completed, show performance based on score vs par
    if (score < par_score) {
      return LevelStatus.CRUSHED;
    } else if (score === par_score) {
      return LevelStatus.SOLID;
    } else {
      return LevelStatus.FAILED;
    }
  };

  const processLevelsWithStatus = (
    rawLevels: LevelItem[],
    existingLevels: LevelItem[] = []
  ): LevelItem[] => {
    return rawLevels.map((level, index) => {
      // Progressive unlocking logic:
      // - First level of the entire series is always unlocked
      // - Subsequent levels are locked until previous level is completed
      let isLocked = false;

      // Calculate the absolute position of this level in the complete series
      const absoluteIndex = existingLevels.length + index;

      if (absoluteIndex > 0) {
        // For levels after the very first, check if previous level is completed
        let prevLevel: LevelItem | undefined;

        if (index > 0) {
          // Previous level is in current batch
          prevLevel = rawLevels[index - 1];
        } else {
          // Previous level is in existing levels array (cross-pagination)
          prevLevel = existingLevels[existingLevels.length - 1];
        }

        isLocked = !prevLevel?.is_completed;
      }

      const status = calculateLevelStatus(
        level.par_score,
        level.score,
        level.is_completed,
        isLocked
      );

      return {
        ...level,
        status,
      };
    });
  };

  useEffect(() => {
    console.log(
      "🔄 useEffect triggered - isLoaded:",
      isLoaded,
      "user:",
      user?.id
    );

    const loadLevels = async () => {
      if (!category || afterPosition == NO_MORE_LEVELS) return;
      if (!isLoaded) {
        console.log("⏳ Waiting for Clerk to load...");
        return;
      }

      console.log("🚀 Starting loadLevels...");

      try {
        // The hook automatically handles authentication if user is signed in
        const clerkUserId = user?.id;
        console.log("🔍 Calling getSpecifiedLevels with userId:", clerkUserId);
        const slug = category?.slug ? category.slug : "";
        const result = await getSpecifiedLevels(slug, afterPosition);

        console.log("📡 API Response:", result);

        if (result.success && result.data) {
          // Process the raw level items to add status field
          // For initial load, no existing levels; for pagination, pass current levels
          const existingLevels = afterPosition === 0 ? [] : levels;
          const processedLevels = processLevelsWithStatus(
            result.data.items,
            existingLevels
          );

          // For initial load, replace levels; for pagination, append
          const updatedLevels =
            afterPosition === 0
              ? processedLevels
              : [...levels, ...processedLevels];
          setLevels(updatedLevels);

          // Update cursor for potential next load
          if (result.data.next_cursor !== NO_MORE_LEVELS) {
            setAfterPosition(result.data.next_cursor);
          } else {
            setAfterPosition(NO_MORE_LEVELS);
          }
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

    loadLevels();
  }, [isLoaded, user]); // Removed getCategories to prevent infinite loop

  const loadMoreLevels = async () => {
    if (!category || afterPosition === NO_MORE_LEVELS || isLoading) return;

    setIsLoading(true);

    try {
      const slug = category.slug;
      const result = await getSpecifiedLevels(slug, afterPosition);

      if (result.success && result.data) {
        // For pagination, pass existing levels to ensure proper cross-pagination unlocking
        const processedLevels = processLevelsWithStatus(
          result.data.items,
          levels
        );
        const updatedLevels = [...levels, ...processedLevels];
        setLevels(updatedLevels);

        if (result.data.next_cursor !== NO_MORE_LEVELS) {
          setAfterPosition(result.data.next_cursor);
        } else {
          setAfterPosition(NO_MORE_LEVELS);
        }
      }
    } catch (error) {
      console.error("Error loading more levels:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < levels.length - 1) {
      setCurrentIndex(currentIndex + 1);

      // Load more levels if we're 3 levels from the end and can load more
      if (
        currentIndex >= levels.length - 4 &&
        afterPosition !== NO_MORE_LEVELS &&
        !isLoading
      ) {
        loadMoreLevels();
      }
    }
  };

  const handleCardClick = (position: "prev" | "next") => {
    if (position === "prev" && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (position === "next" && currentIndex < levels.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const currentLevel = levels[currentIndex];
  const prevLevel = currentIndex > 0 ? levels[currentIndex - 1] : null;
  const nextLevel =
    currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;

  // Early return if no levels loaded or current level doesn't exist
  if (!currentLevel) {
    return (
      <ScreenWrapper onDismiss={onDismiss} onAuthClick={onAuthClick}>
        <Title>Loading levels...</Title>
      </ScreenWrapper>
    );
  }

  // Ensure status has fallback values
  const currentStatus = currentLevel.status || LevelStatus.LOCKED;
  const prevStatus = prevLevel?.status || LevelStatus.LOCKED;
  const nextStatus = nextLevel?.status || LevelStatus.LOCKED;

  return (
    <ScreenWrapper onDismiss={onDismiss} onAuthClick={onAuthClick}>
      <Title>Select Your Level</Title>
      <InnerContainer>
        <CarouselContainer>
          <CarouselWrapper>
            {prevLevel && (
              <LevelCard
                $position="prev"
                onClick={() => handleCardClick("prev")}
              >
                <LevelNumber>{prevLevel.position}</LevelNumber>
                <StatusBadge $status={prevStatus}>
                  {statusLabels[prevStatus]}
                </StatusBadge>
              </LevelCard>
            )}

            <LevelCard $position="current">
              <LevelNumber>{currentLevel.position}</LevelNumber>
              {currentStatus !== "ready" ? (
                <StatusBadge $status={currentStatus}>
                  {statusLabels[currentStatus]}
                </StatusBadge>
              ) : null}
            </LevelCard>

            {nextLevel && (
              <LevelCard
                $position="next"
                onClick={() => handleCardClick("next")}
              >
                <LevelNumber>{nextLevel.position}</LevelNumber>
                <StatusBadge $status={nextStatus}>
                  {statusLabels[nextStatus]}
                </StatusBadge>
              </LevelCard>
            )}
          </CarouselWrapper>

          <PrevButton
            onClick={handlePrev}
            disabled={currentIndex === 0}
            aria-label="Previous level"
          >
            <ChevronLeftIcon size={24} />
          </PrevButton>

          <NextButton
            onClick={handleNext}
            disabled={currentIndex === levels.length - 1}
            aria-label="Next level"
          >
            <ChevronRight size={24} />
          </NextButton>
        </CarouselContainer>

        <PlayButton
          onClick={() => {
            onLevelSelect(currentLevel.position);
          }}
          disabled={currentStatus === LevelStatus.LOCKED}
        >
          {currentStatus === LevelStatus.LOCKED
            ? "Locked"
            : "Play Level " + currentLevel.position}
        </PlayButton>

        <Hint>Use arrow buttons or click adjacent cards to navigate</Hint>
      </InnerContainer>
    </ScreenWrapper>
  );
}
