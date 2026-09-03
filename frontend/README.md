# Frontend - Acronymize React Application

This directory contains the React frontend for the Acronymize word puzzle game. Built with React 19, TypeScript, and Vite for a modern, fast, and type-safe development experience.

## 🏗️ Tech Stack

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe JavaScript for better development experience
- **Vite** - Fast build tool and development server
- **Styled Components** - CSS-in-JS for component-level styling
- **Clerk** - Modern authentication and user management
- **React Router DOM** - Client-side routing and navigation

## 📦 Key Dependencies

### UI & Styling
```json
{
  "@radix-ui/*": "Modern, accessible UI primitives",
  "styled-components": "CSS-in-JS styling solution",
  "lucide-react": "Beautiful & consistent icon library"
}
```

### State Management & Utilities
```json
{
  "react-hook-form": "Performant forms with minimal re-renders",
  "react-type-animation": "Smooth typing animations",
  "react-spinners": "Loading indicators",
  "clsx": "Conditional className utilities"
}
```

### Authentication & Data
```json
{
  "@clerk/clerk-react": "User authentication and management",
  "dotenv": "Environment variable management"
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn package manager
- Backend API running on `http://localhost:8000` (see backend README)

### Installation & Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**

   Create a `.env` file in the frontend directory:
   ```env
   # Clerk Authentication (Required)
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key_here

   # API Configuration
   VITE_API_BASE_URL=http://localhost:8000/api
   VITE_API_TIMEOUT=10000

   # Development Settings
   VITE_ENV=development
   ```

   **Obtaining Clerk Keys:**
   - Sign up at [Clerk.dev](https://clerk.dev)
   - Create a new application
   - Copy your publishable key from the dashboard

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run preview      # Preview production build locally

# Production
npm run build        # Build for production (outputs to ./dist)

# Code Quality
npm run lint         # Run ESLint for code quality checks
npm run type-check   # Run TypeScript compiler for type checking
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/              # React Components
│   │   ├── landing-page/       # Landing page specific components
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LeftSide.tsx    # Game preview and branding
│   │   │   └── RightSide.tsx   # Action buttons and navigation
│   │   │
│   │   ├── game-screen/        # Game interface components
│   │   │   ├── GameScreen.tsx  # Main game container
│   │   │   ├── InputBar.tsx    # Word input interface
│   │   │   ├── EndGameModal.tsx # Game completion modal
│   │   │   ├── ExitGameModal.tsx # Game exit confirmation
│   │   │   └── PipCounter.tsx  # Progress indicator
│   │   │
│   │   ├── common/             # Reusable UI components
│   │   │   ├── Header.tsx      # App header with navigation
│   │   │   ├── ScreenWrapper.tsx # Layout wrapper
│   │   │   ├── BlankModal.tsx  # Base modal component
│   │   │   ├── PopUpModal.tsx  # Popup modal variant
│   │   │   ├── InteractiveCard.tsx # Clickable card component
│   │   │   └── SelectionScreen.tsx # Generic selection interface
│   │   │
│   │   ├── GuessRow.tsx        # Word guess display with feedback
│   │   ├── ModeSelection.tsx   # Game mode selection screen
│   │   ├── CategorySelection.tsx # Category selection screen
│   │   ├── LevelSelection.tsx  # Level selection screen
│   │   ├── Instructions.tsx    # Game instructions
│   │   ├── AuthModal.tsx       # Clerk authentication modal
│   │   ├── LoginModal.tsx      # Login prompt modal
│   │   └── ProfileModal.tsx    # User profile modal
│   │
│   ├── services/               # API Communication Layer
│   │   ├── puzzleService.ts    # Puzzle-related API calls
│   │   ├── categoryService.ts  # Category management
│   │   ├── levelServices.ts    # Level progression APIs
│   │   └── endlessService.ts   # Endless mode APIs
│   │
│   ├── hooks/                  # Custom React Hooks
│   │   ├── useProgressSaver.ts # Progress saving logic
│   │   └── usePuzzleLoader.ts  # Puzzle loading logic
│   │
│   ├── types/                  # TypeScript Type Definitions
│   │   ├── index.ts           # Core game types
│   │   └── components.ts      # Component prop types
│   │
│   ├── constants/             # App Constants & Configuration
│   │   ├── index.ts          # General constants
│   │   └── gameModes.ts      # Game mode configurations
│   │
│   ├── utils/                 # Utility Functions
│   │   ├── api.ts            # API configuration and helpers
│   │   └── auth.ts           # Authentication utilities
│   │
│   ├── App.tsx               # Root application component
│   ├── main.tsx              # Application entry point
│   └── theme.ts              # Design system configuration
│
├── public/                    # Static Assets
├── dist/                      # Production build output (generated)
├── package.json               # Dependencies and scripts
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
├── eslint.config.js          # ESLint configuration
└── README.md                 # This file
```

## 🎮 Application Architecture

### Screen Navigation System

The app uses a state-driven navigation system managed in `App.tsx`:

```typescript
type Screen =
  | "landing"           // Landing page with game preview
  | "mode-selection"    // Choose game mode
  | "category-selection" // Choose puzzle category
  | "select-level"      // Choose level (Level Up mode only)
  | "game"              // Active game screen
  | "instructions"      // How to play
```

### Component Design Patterns

**Modular Components**: Each screen is broken into focused, reusable components
```typescript
// Example: Game screen composition
<GameScreen>
  <InputBar onSubmit={handleGuess} />
  <GuessRow words={guess} similarity={score} />
  <PipCounter current={round} total={maxRounds} />
</GameScreen>
```

**Props Interface Pattern**: Consistent prop typing across components
```typescript
interface ComponentProps {
  onDismiss: () => void;      // Consistent navigation pattern
  onAuthClick: () => void;    // Consistent auth pattern
  // ... component-specific props
}
```

### State Management Strategy

**Local State**: React useState for component-level state
**Game State**: Centralized in main App component, passed down via props
**Authentication**: Managed by Clerk with React Context
**API State**: Handled by custom hooks (`usePuzzleLoader`, `useProgressSaver`)

## 🎨 Styling System

### Theme Configuration (`theme.ts`)

```typescript
export const theme = {
  colors: {
    background: '#111111',      // Primary dark background
    white: '#FFFFFF',          // Primary text
    secondaryText: '#E0E0E0',  // Secondary text
    mutedText: '#888888',      // Muted text
    primary: '#4F46E5',        // Brand color (indigo)
    accentGreen: '#2E7D32',    // Correct feedback
    accentYellow: '#B59458',   // Misplaced feedback
  },
  spacing: {
    xs: '4px', sm: '8px', md: '16px',
    lg: '24px', xl: '32px', xxl: '48px'
  },
  borderRadius: {
    sm: '8px', md: '16px', lg: '24px'
  }
}
```

### Styling Approach

1. **Styled Components** for component-level styling and theme integration
2. **CSS-in-JS** for dynamic styling based on props/state
3. **Custom CSS Reset** with base styles in `index.css`

```typescript
const WordTile = styled.div<{ $status: WordStatus }>`
  background-color: ${props =>
    props.$status === 'correct' ? theme.colors.accentGreen : 'transparent'
  };
  // More dynamic styling...
`;
```

## 🔐 Authentication Integration

### Clerk Setup

The app uses Clerk for modern, secure authentication:

```typescript
// main.tsx - Clerk Provider setup
import { ClerkProvider } from '@clerk/clerk-react';

const clerk_pub_key = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

<ClerkProvider publishableKey={clerk_pub_key}>
  <App />
</ClerkProvider>
```

### Authentication Flow

1. **Modal-Based Login**: Custom `LoginModal` explains benefits before redirecting
2. **JWT Integration**: Automatic JWT token handling for API authentication
3. **User Context**: Access user info throughout the app via Clerk hooks
4. **Protected Features**: Level Up mode requires authentication

```typescript
// Example: Protected route pattern
const { isSignedIn } = useAuth();

const handleModeSelect = (mode: string) => {
  if (mode === 'levelup' && !isSignedIn) {
    setShowLoginModal(true);
    return;
  }
  // Continue with mode selection...
};
```

## 🌐 API Integration

### Service Layer Architecture

All API communication is abstracted into service modules:

```typescript
// services/puzzleService.ts
export const usePuzzleService = () => ({
  getPuzzle: async (categorySlug: string, level: number) => {
    // API call with error handling
  },
  submitGuess: async (guess: string[], puzzleId: string) => {
    // Guess validation API call
  }
});
```

### Error Handling Strategy

- **Graceful Degradation**: App continues to function with limited features on API errors
- **User Feedback**: Clear error messages for network issues
- **Retry Logic**: Automatic retry for transient failures
- **Offline Support**: Basic offline functionality where possible

## 🎯 Game Logic Implementation

### Word Validation System

```typescript
interface Word {
  text: string;
  status: "correct" | "misplaced" | "incorrect";
}

// GuessRow component handles visual feedback
<GuessRow
  words={validatedWords}
  rowSimilarityScore={similarityPercent}
  showHoverEffect={true}
/>
```

### Similarity Scoring

Real-time similarity feedback with gradient visualization:
- **Red to Yellow to Green** gradient based on semantic similarity
- **0-100%** scoring system
- **Visual Progress Bar** for immediate feedback

### Game Mode Configurations

```typescript
export const gameModeConfigs = {
  levelup: {
    scoringType: "guessCount",
    continuousPlay: false,
    requiresAuth: true
  },
  endless: {
    scoringType: "highScore",
    continuousPlay: true,
    requiresAuth: false
  },
  daily: {
    scoringType: "dailyCompletion",
    continuousPlay: false,
    requiresAuth: false
  }
};
```

## 🚀 Build & Deployment

### Production Build

```bash
npm run build
```

Optimized build output in `./dist/`:
- **Code Splitting**: Automatic route-based code splitting
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Images and fonts optimized
- **Gzip Compression**: Enabled for smaller bundle sizes

### Production Deployment

The app is deployed to the custom domain **acronymize.nagelbros.com**:

```typescript
// vite.config.ts
export default defineConfig({
  base: "/",  // Root path for custom domain
  // ... other config
});
```

**Deploy to Production:**
1. Build the project: `npm run build`
2. Deploy `dist/` folder to your hosting provider
3. Configure DNS settings to point to your hosting provider

### Environment-Specific Builds

**Development**:
- Hot Module Replacement
- Source maps enabled
- Development API endpoints

**Production**:
- Minified bundles
- Production API endpoints
- Error tracking enabled

## 🧪 Development Best Practices

### Code Organization

- **Feature-based structure** for components
- **Barrel exports** for clean imports
- **Consistent naming** conventions
- **Type-first development** with TypeScript

### Performance Optimization

- **React.memo()** for expensive components
- **useMemo()** for costly calculations
- **Code splitting** at route level
- **Image optimization** for game assets
- **Bundle analysis** to monitor size

### Accessibility

- **Semantic HTML** structure
- **ARIA labels** for interactive elements
- **Keyboard navigation** support
- **Color contrast** compliance
- **Screen reader** compatibility

## 🐛 Debugging & Development Tools

### Browser DevTools Integration

- **React Developer Tools** extension recommended
- **Clerk Developer Tools** for auth debugging
- **Network tab** for API debugging
- **Console logging** with structured messages

### Common Development Issues

**Hot Reload Issues**:
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

**TypeScript Errors**:
```bash
# Type check without running
npm run type-check
```

**Clerk Authentication Issues**:
- Verify `.env` variables are set correctly
- Check Clerk dashboard configuration
- Ensure domain allowlist includes `localhost:3000`

## 📝 Contributing Guidelines

### Code Style

- Use **TypeScript** for all new components
- Follow **React Hooks** patterns
- Implement **error boundaries** for complex components
- Write **prop documentation** with TypeScript interfaces

### Component Development

```typescript
// Component template
interface MyComponentProps {
  /** Description of the prop */
  title: string;
  /** Optional click handler */
  onClick?: () => void;
}

export function MyComponent({ title, onClick }: MyComponentProps) {
  // Component implementation
  return (
    <div>
      {title}
    </div>
  );
}
```

### Testing Recommendations

- **Component testing** with React Testing Library
- **API mocking** for service layer tests
- **E2E testing** for critical user flows
- **Accessibility testing** for compliance

---

## 🎮 Ready to Build Amazing Puzzles?

With this modern React frontend, you have all the tools needed to create engaging word puzzle experiences. The modular architecture makes it easy to add new game modes, customize styling, and extend functionality.

**Happy coding!** 🚀
