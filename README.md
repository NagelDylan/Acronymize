# Acronymize 🧩

**Acronymize** is a modern web-based word puzzle game that challenges players to guess words that form acronyms based on given themes and clues. Think Wordle meets acronym puzzles with multiple engaging game modes and real-time feedback.

[Play Here](https://acronymize.nagelbros.com)

## 🎮 Game Features

### Three Engaging Game Modes

- **🏆 Level Up Mode** - Progress through structured levels with par scoring. Requires authentication to track progress.
- **🔄 Endless Mode** - See how many puzzles you can solve in a row! Compete for high scores.
- **📅 Daily Puzzle** - One special puzzle per day for all players to enjoy.

### Interactive Gameplay

- **Wordle-Style Feedback**:
  - 🟢 **Green**: Correct word in correct position
  - 🟡 **Gold**: Correct word in wrong position
  - ⚪ **Gray**: Incorrect word
- **Similarity Scoring**: Visual progress bars show how close your guesses are to the solution
- **Themed Categories**: Multiple puzzle categories with unique themes and difficulty levels
- **Par Scoring System**: Challenge yourself to solve puzzles within the target guess count

## 🏗️ Architecture

This is a full-stack application with a clear separation between frontend and backend:

```
acronymize/
├── frontend/          # React + TypeScript + Vite
├── backend/           # Django + PostgreSQL + REST API
├── README.md         # This file
└── requirements.txt  # Python dependencies
```

### Technology Stack

**Frontend**

- **React 19** with TypeScript for type-safe UI development
- **Vite** for fast development and optimized builds
- **Styled Components** for component-based styling
- **Clerk** for seamless user authentication
- **React Router** for client-side navigation

**Backend**

- **Django 4.2** with Django REST Framework
- **PostgreSQL** for robust data persistence
- **Clerk JWT Integration** for secure authentication
- **Machine Learning**: Sentence transformers for similarity scoring
- **CORS** configured for seamless frontend-backend communication

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+
- **PostgreSQL** 12+
- **Git** for version control

### Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/acronymize.git
   cd acronymize
   ```

2. **Backend Setup**

   ```bash
   # Create Python virtual environment
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate

   # Install Python dependencies
   pip install -r requirements.txt

   # Set up environment variables (see backend/README.md)
   cp backend/.env.example backend/.env

   # Run database migrations
   cd backend
   python manage.py migrate
   python manage.py runserver
   ```

3. **Frontend Setup**

   ```bash
   # In a new terminal
   cd frontend

   # Install dependencies
   npm install

   # Set up environment variables (see frontend/README.md)
   cp .env.example .env

   # Start development server
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## 📁 Project Structure

```
acronymize/
├── frontend/                    # React Frontend Application
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   │   ├── landing-page/   # Landing page components
│   │   │   ├── game-screen/    # Game interface components
│   │   │   └── common/         # Shared UI components
│   │   ├── services/           # API communication layer
│   │   ├── hooks/              # Custom React hooks
│   │   ├── types/              # TypeScript type definitions
│   │   ├── constants/          # App constants and configurations
│   │   └── utils/              # Utility functions
│   ├── public/                 # Static assets
│   └── package.json           # Frontend dependencies
│
├── backend/                     # Django Backend API
│   ├── backend/               # Django project configuration
│   ├── core/                  # Main application logic
│   │   ├── models.py          # Database models
│   │   ├── views.py           # API endpoints
│   │   ├── serializers.py     # Data serialization
│   │   ├── urls.py            # URL routing
│   │   └── management/        # Django management commands
│   └── manage.py              # Django management script
│
├── requirements.txt           # Python dependencies
├── CLAUDE.md                  # Claude AI development guidelines
└── README.md                  # This file
```

## 🎯 Game Mechanics

### Acronym Puzzle System

Players are given a clue (e.g., "How players describe this game") and must guess words that form the specified acronym. Each letter of the acronym corresponds to one word that fits the clue.

**Example:**

- Clue: "How players describe this game"
- Acronym: GOAT
- Possible Solution: **Greatest Of All Time**

### Scoring and Progress

- **Level Up Mode**: Track progress through structured levels with par scores
- **Endless Mode**: Build streaks and compete for high scores
- **Daily Puzzles**: Complete daily challenges for consistent engagement
- **Progress Tracking**: Comprehensive user analytics and achievement system

## 🔧 Development

### Available Commands

**Frontend (from `frontend/` directory):**

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Run ESLint for code quality
```

**Backend (from `backend/` directory):**

```bash
python manage.py runserver          # Start Django development server
python manage.py migrate           # Apply database migrations
python manage.py makemigrations    # Create new database migrations
python manage.py createsuperuser   # Create admin user
python manage.py import_puzzles    # Import puzzle data
```

### Environment Configuration

Both frontend and backend require environment variables for proper configuration. Check the respective README files in each directory for detailed setup instructions.

## 🚀 Deployment

### Frontend Deployment

The frontend is deployed to the custom domain **acronymize.nagelbros.com**. See `frontend/README.md` for deployment instructions.

### Backend Deployment

The Django backend can be deployed on platforms like Heroku, DigitalOcean, or AWS. Database configuration supports PostgreSQL for production environments.

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests if applicable
4. Commit your changes: `git commit -m 'Add feature description'`
5. Push to your fork: `git push origin feature-name`
6. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices for frontend code
- Use Django coding standards for backend development
- Write meaningful commit messages
- Add tests for new features
- Update documentation for significant changes

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 📞 Contact

- **Developer**: Dylan Nagel
- **GitHub**: [Your GitHub Profile](https://github.com/yourusername)
- **Issues**: [Report bugs or request features](https://github.com/yourusername/acronymize/issues)

## 🙏 Acknowledgments

- Built with modern web technologies and best practices
- Inspired by word puzzle games like Wordle
- Uses machine learning for intelligent similarity scoring
- Integrated with Clerk for seamless user authentication

---

**Ready to play?** Visit the live game or set up your development environment to start contributing! 🎮
