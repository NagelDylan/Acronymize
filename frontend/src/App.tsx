import { useState } from "react";
import { LandingPage } from "./components/landing-page/LandingPage";
import { ModeSelection } from "./components/ModeSelection";
import { CategorySelection } from "./components/CategorySelection";
import { GameScreen } from "./components/game-screen/GameScreen";
import { LoginModal } from "./components/LoginModal";
import { type Screen } from "./constants";
import { AuthModal } from "./components/AuthModal";
import { type CategoryType } from "./types/components";
import { LevelSelection } from "./components/LevelSelection";
import { usePuzzleService } from "./services/puzzleService";
import { type FrontendPuzzleElement } from "./types/components";
import { InstructionsPage } from "./components/Instructions";
import { ProfileModal } from "./components/ProfileModal";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedMode, setSelectedMode] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(
    null
  );
  const [showClerkModal, setShowClerkModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(-1);
  const [curPuzzle, setCurPuzzle] = useState<FrontendPuzzleElement | null>(
    null
  );

  const { getPuzzle } = usePuzzleService();

  const handleAuthClick = () => {
    setShowLoginModal(true);
  };

  const handleLoginAccept = () => {
    setShowLoginModal(false);
    setShowClerkModal(true);
  };

  const handlePlayDaily = () => {
    setSelectedMode("daily");
    setCurrentScreen("category-selection");
  };

  const handleExploreModes = () => {
    setCurrentScreen("mode-selection");
  };

  const handleModeSelect = (mode: string) => {
    setSelectedMode(mode);
    setCurrentScreen("category-selection");
  };

  const handleCategorySelect = async (category: CategoryType) => {
    setSelectedCategory(category);

    if (selectedMode === "levelup") {
      setCurrentScreen("select-level");
    } else {
      // For endless and daily modes, go directly to game
      // The GameScreen will handle puzzle loading internally
      setCurPuzzle(null); // Let GameScreen load the appropriate puzzle
      setCurrentScreen("game");
    }
  };

  const handleLoginRequired = (mode: string) => {
    setSelectedMode(mode);
    setShowLoginModal(true);
  };

  const handleBackFromModeSelection = () => {
    setCurrentScreen("landing");
  };

  const handleBackFromCategorySelection = () => {
    setCurrentScreen("mode-selection");
  };

  const handleLevelSelection = async (level_num: number) => {
    setSelectedLevel(level_num);
    if (selectedCategory) {
      const result = await getPuzzle(selectedCategory.slug, level_num);
      if (!result.success || !result.data) return;
      setCurPuzzle(result.data);
      setCurrentScreen("game");
    }
  };

  return (
    <>
      {currentScreen === "landing" && (
        <LandingPage
          onPlayDaily={handlePlayDaily}
          onExploreModes={handleExploreModes}
          onAuthClick={handleLoginAccept}
          setCurrentScreen={setCurrentScreen}
          onProfileClick={() => {
            setShowUserProfileModal(true);
          }}
        />
      )}
      {currentScreen === "mode-selection" && (
        <ModeSelection
          onAuthClick={handleAuthClick}
          onModeSelect={handleModeSelect}
          onDismiss={handleBackFromModeSelection}
          onLoginRequired={handleLoginRequired}
        />
      )}
      {currentScreen === "category-selection" && (
        <CategorySelection
          onAuthClick={handleAuthClick}
          onCategorySelect={handleCategorySelect}
          onDismiss={handleBackFromCategorySelection}
          selectedMode={selectedMode}
        />
      )}
      {currentScreen === "game" && (
        <GameScreen
          mode={selectedMode}
          category={selectedCategory}
          setCurrentScreen={setCurrentScreen}
          puzzle={curPuzzle}
          level_num={selectedLevel > 0 ? selectedLevel : 1}
        />
      )}
      {currentScreen == "select-level" && (
        <LevelSelection
          onAuthClick={handleAuthClick}
          onDismiss={() => setCurrentScreen("category-selection")}
          onLevelSelect={handleLevelSelection}
          category={selectedCategory}
        />
      )}
      {currentScreen == "instructions" && (
        <InstructionsPage
          onAuthClick={handleAuthClick}
          onDismiss={() => setCurrentScreen("landing")}
        />
      )}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          setSelectedMode("");
        }}
        onLogin={handleLoginAccept}
        gameMode={selectedMode}
      />
      <AuthModal
        isOpen={showClerkModal}
        onClose={() => setShowClerkModal(false)}
      />
      <ProfileModal
        isOpen={showUserProfileModal}
        onClose={() => setShowUserProfileModal(false)}
      />
    </>
  );
}
