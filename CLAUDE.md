# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an "Acronym" word puzzle game - a React-based web application where players guess words that form acronyms based on given themes. The game features multiple modes, daily puzzles, and a scoring system with similarity meters.

## Architecture

**Planned Full-Stack Structure:**
- **Frontend**: React 19 + TypeScript + Vite with Tailwind CSS 4
- **Backend**: Django (Python web framework) for API and game logic
- Communication via REST API between frontend and Django backend

**Frontend Structure:**
- Component-based architecture with pages and common components
- State-driven screen navigation system (`App.tsx` manages routing between screens: landing, mode-selection, theme-selection, game)
- Key components include `GuessRow` for displaying word guesses with status indicators and similarity scores

**Backend:**
- Django framework for handling game logic, user authentication, and puzzle management
- API endpoints for game mechanics, daily puzzles, and user sessions
- Currently empty/placeholder directory - Django backend implementation pending

## Development Commands

**Frontend (from `frontend/` directory):**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (runs TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

**Backend (planned Django commands from `backend/` directory):**
- `python manage.py runserver` - Start Django development server
- `python manage.py migrate` - Apply database migrations
- `python manage.py makemigrations` - Create new database migrations
- `python manage.py createsuperuser` - Create admin user
- `python manage.py test` - Run Django tests

## Key Game Mechanics

The core gameplay revolves around:
- Acronym puzzles where each letter corresponds to a word
- Theme-based word suggestions (e.g., "What you see at the zoo" → L.T.M.E)
- Word status system: correct (green), misplaced (gold), incorrect (gray)
- Row similarity scoring (0-100%) with gradient visualization
- Multiple game modes including daily puzzles

## Component Architecture Notes

- `App.tsx` acts as main router with screen state management
- `LandingPage.tsx` serves as entry point with game preview
- `GuessRow.tsx` is reusable component for displaying word attempts with visual feedback
- Authentication system is stubbed but login modals/flows are architected
- Game screens for mode selection, theme selection, and gameplay are referenced but not yet implemented

## Styling Approach

Uses Tailwind CSS with a dark theme:
- Primary background: `#111111` with dot grid pattern overlay
- Text colors: white (`#FFFFFF`), light gray (`#E0E0E0`), muted (`#888888`)
- Primary brand color: `#4F46E5` (indigo)
- Game feedback colors: green (`#2E7D32`), gold (`#B59458`), red-orange gradient for similarity meter