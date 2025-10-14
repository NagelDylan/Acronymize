export interface InteractiveCardProps {
  icon: string;
  title: string;
  description: string;
  slug: string;
  onClick?: () => void;
  disabled?: boolean;
  badge?: string;
  showInfo?: boolean;
  onInfoHover?: (isHovered: boolean) => void;
  tooltipContent?: string;
  highScore?: number;
}

export interface CategoryType {
  icon: string;
  title: string;
  description: string;
  slug: string;
}

// Backend Django model interface for categories
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  emoji: string;
  order: number;
  is_active: boolean;
  creator: number | null;
  created_at: string;
}

// Category with optional dynamic fields added by backend based on game mode
export interface CategoryWithDynamicFields extends Category {
  high_score?: number;  // Added for endless mode
  badge?: string;       // Added for daily mode (e.g., "Completed")
}

export interface FrontendPuzzleElement {
  acronym: string;
  clue: string;
  par_score: number;
  position: number;
}
