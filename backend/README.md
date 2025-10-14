# Backend - Acronymize Django API

This directory contains the Django backend API for the Acronymize word puzzle game. Built with Django 4.2 and Django REST Framework, providing a robust, scalable API with PostgreSQL database integration and machine learning-powered similarity scoring.

## 🏗️ Tech Stack

- **Django 4.2** - Robust Python web framework
- **Django REST Framework** - Powerful toolkit for building Web APIs
- **PostgreSQL** - Advanced open-source relational database
- **Clerk** - Modern authentication and user management
- **Sentence Transformers** - ML models for semantic similarity scoring
- **Scikit-learn** - Machine learning library for advanced analytics
- **CORS Headers** - Cross-Origin Resource Sharing support

## 📦 Key Dependencies

### Core Framework
```python
Django==4.2.25                    # Web framework
djangorestframework==3.16.1       # REST API framework
psycopg2-binary==2.9.11          # PostgreSQL adapter
django-cors-headers==4.9.0        # CORS middleware
```

### Authentication & Security
```python
clerk_django==1.0.3              # Clerk Django integration
PyJWT==2.10.1                    # JSON Web Token handling
cryptography==45.0.7             # Cryptographic recipes
svix                              # Webhook verification
```

### Machine Learning & Analytics
```python
sentence-transformers==5.1.1     # Semantic similarity models
scikit-learn==1.6.1             # Machine learning library
torch==2.8.0                    # PyTorch for ML models
numpy==2.0.2                    # Numerical computing
```

### Utilities
```python
python-dotenv==1.1.1            # Environment variable management
requests==2.32.5                # HTTP library
pyngrok==7.4.0                  # Tunneling for development
```

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- PostgreSQL 12+
- pip (Python package installer)
- Virtual environment (recommended)

### Installation & Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment**
   ```bash
   # Create virtual environment
   python -m venv .venv

   # Activate virtual environment
   # On macOS/Linux:
   source .venv/bin/activate
   # On Windows:
   .venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r ../requirements.txt
   ```

4. **Environment Configuration**

   Create a `.env` file in the backend directory:
   ```env
   # Django Configuration
   SECRET_KEY=your-super-secret-django-key-here
   DEBUG=True

   # Database Configuration (PostgreSQL)
   DATABASE_URL=postgresql://username:password@localhost:5432/acronymize_db

   # Clerk Authentication (Required)
   CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key_here
   CLERK_SECRET_KEY=sk_test_your_clerk_secret_here
   CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here

   # CORS Settings (Development)
   CORS_ALLOW_ALL_ORIGINS=True
   ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com
   ```

   **Setting up PostgreSQL Database:**
   ```sql
   -- Connect to PostgreSQL as superuser
   CREATE DATABASE acronymize_db;
   CREATE USER acronymize_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE acronymize_db TO acronymize_user;
   ```

5. **Database Setup**
   ```bash
   # Run migrations to set up database tables
   python manage.py migrate

   # Create a superuser for Django admin (optional)
   python manage.py createsuperuser

   # Import initial puzzle data (optional)
   python manage.py import_puzzles
   ```

6. **Start Development Server**
   ```bash
   python manage.py runserver
   ```

   The API will be available at `http://localhost:8000`

## 🛠️ Management Commands

The backend includes several custom Django management commands for puzzle and data management:

```bash
# Import puzzle data from external sources
python manage.py import_puzzles

# Import all puzzle data with fixed formatting
python manage.py import_puzzles_fixed

# Reset all puzzle data (careful in production!)
python manage.py reset_puzzles

# Update wildcard puzzles with new categories
python manage.py update_wildcard_puzzles

# Import comprehensive puzzle dataset
python manage.py import_all_puzzles
```

### Creating Custom Puzzles

```bash
# Access Django admin to manually add puzzles
python manage.py runserver
# Navigate to http://localhost:8000/admin
```

## 📁 Project Structure

```
backend/
├── backend/                    # Django Project Configuration
│   ├── __init__.py
│   ├── settings.py            # Main Django settings
│   ├── urls.py                # Root URL configuration
│   ├── wsgi.py                # WSGI configuration for deployment
│   └── asgi.py                # ASGI configuration for async support
│
├── core/                      # Main Application Logic
│   ├── models.py              # Database models and relationships
│   ├── views.py               # API endpoints and business logic
│   ├── serializers.py         # Data serialization for API responses
│   ├── urls.py                # App-specific URL routing
│   ├── admin.py               # Django admin configuration
│   ├── apps.py                # App configuration
│   ├── constants.py           # App constants and enums
│   ├── auth_utils.py          # Authentication utilities
│   ├── tests.py               # Unit tests
│   │
│   ├── migrations/            # Database migrations
│   │   ├── 0001_initial.py    # Initial database schema
│   │   ├── 0002_category_*.py # Category model updates
│   │   ├── 0004_puzzle.py     # Puzzle model creation
│   │   └── ...                # Additional migrations
│   │
│   └── management/            # Custom Django commands
│       └── commands/
│           ├── import_puzzles.py         # Import puzzle data
│           ├── import_puzzles_fixed.py   # Import with fixes
│           ├── import_all_puzzles.py     # Comprehensive import
│           ├── reset_puzzles.py          # Reset puzzle data
│           └── update_wildcard_puzzles.py # Update wildcards
│
├── manage.py                  # Django management script
├── .env                       # Environment variables (not in git)
└── README.md                  # This file
```

## 🗄️ Database Models

### User Model (`core/models.py`)

Custom user model integrated with Clerk authentication:

```python
class User(AbstractBaseUser):
    email = models.EmailField(unique=True)           # Primary identifier
    username = models.CharField(max_length=150)      # Display name
    first_name = models.CharField(max_length=150)    # First name
    last_name = models.CharField(max_length=150)     # Last name
    clerk_id = models.CharField(unique=True)         # Clerk user ID
    is_active = models.BooleanField(default=True)    # Account status
    is_staff = models.BooleanField(default=False)    # Admin access
    is_superuser = models.BooleanField(default=False) # Superuser status
```

### Category Model

Puzzle categories with themes and difficulty levels:

```python
class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)      # Category name
    slug = models.SlugField(max_length=50, unique=True)      # URL-friendly name
    description = models.CharField(max_length=255)           # Category description
    emoji = models.CharField(max_length=5)                   # Visual identifier
    order = models.PositiveIntegerField(default=0)           # Display order
    is_active = models.BooleanField(default=True)            # Visibility
    creator = models.ForeignKey(User, on_delete=models.CASCADE) # Category creator
    created_at = models.DateTimeField(auto_now_add=True)     # Creation timestamp
```

### Puzzle Model

Individual puzzle data with solutions and metadata:

```python
class Puzzle(models.Model):
    solution = models.CharField(max_length=255, unique=True) # Full solution
    clue = models.CharField(max_length=255)                  # Puzzle clue
    par_score = models.PositiveIntegerField(default=5)       # Target guess count
    category = models.ForeignKey(Category, on_delete=models.CASCADE) # Category reference
    creator = models.ForeignKey(User, on_delete=models.CASCADE) # Puzzle creator
    position = models.PositiveIntegerField()                 # Order within category
    created_at = models.DateTimeField(auto_now_add=True)     # Creation timestamp
```

### User Progress Tracking

Comprehensive progress tracking across all game modes:

```python
class UserProgress(models.Model):
    class GameMode(models.TextChoices):
        LEVELS = 'levelup'     # Level progression mode
        ENDLESS = 'endless'    # Endless streak mode
        DAILY = 'daily'        # Daily puzzle mode

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    puzzle = models.ForeignKey(Puzzle, on_delete=models.CASCADE, null=True)
    game_mode = models.CharField(max_length=128, choices=GameMode.choices)
    score = models.IntegerField(default=0)           # Mode-specific scoring
    attempts_data = models.TextField()               # Wordle-style guess data
    timestamp = models.DateTimeField(auto_now=True)  # Last update time
```

## 🌐 API Endpoints

### Authentication Endpoints

**Clerk Webhook** (User Sync)
```http
POST /core/clerk
Content-Type: application/json
Authorization: Bearer <webhook-secret>

# Automatically syncs user data from Clerk
```

### Category Endpoints

**List Categories**
```http
GET /core/categories/
Response: List of active categories with metadata

# Optional query parameters:
?mode=endless    # Include high scores for endless mode
?mode=daily      # Include completion badges for daily mode
```

**Category Puzzle Count**
```http
GET /core/categories/{slug}/puzzles/count/
Response: { "count": 42 }
```

### Puzzle Endpoints

**Get Puzzle**
```http
GET /core/puzzles/{category_slug}/{level_num}/
Response: {
  "acronym": "L.T.M.E",
  "clue": "Things you see at the zoo",
  "par_score": 4,
  "position": 1
}
```

**Submit Guess**
```http
POST /core/puzzles/{category_slug}/guess/{level_num}/
Authorization: Bearer <clerk-jwt>
Content-Type: application/json

Request: {
  "guess": ["Lion", "Tiger", "Monkey", "Elephant"]
}

Response: {
  "correct": true,
  "word_feedback": [
    {"word": "Lion", "status": "correct"},
    {"word": "Tiger", "status": "correct"},
    {"word": "Monkey", "status": "correct"},
    {"word": "Elephant", "status": "correct"}
  ],
  "similarity_score": 100,
  "attempts": 3
}
```

**Get Solution**
```http
GET /core/puzzles/solution/{category_slug}/{level_num}/
Authorization: Bearer <clerk-jwt>

Response: {
  "solution": ["Lion", "Tiger", "Monkey", "Elephant"]
}
```

### Game Mode Endpoints

**Level Up Mode**
```http
GET /core/levelup/levels/
Authorization: Bearer <clerk-jwt>

Response: {
  "category_slug": {
    "unlocked_level": 5,
    "completed_puzzles": [1, 2, 3, 4],
    "current_progress": { "level": 5, "attempts": 2 }
  }
}
```

**Endless Mode**
```http
GET /core/endless/score/
Authorization: Bearer <clerk-jwt>

Response: {
  "category_slug": {
    "high_score": 15,
    "last_played": "2024-01-15T10:30:00Z"
  }
}

POST /core/endless/submit/
Authorization: Bearer <clerk-jwt>
Content-Type: application/json

Request: {
  "category": "animals",
  "score": 18
}
```

**Daily Puzzle**
```http
GET /core/daily/
Response: {
  "puzzle": {
    "acronym": "W.O.R.D",
    "clue": "Today's special theme",
    "category": "general"
  },
  "date": "2024-01-15",
  "completed": false  # If user is authenticated
}
```

## 🔐 Authentication System

### Clerk JWT Integration

The backend uses Clerk JWTs for secure authentication:

```python
# auth_utils.py
def verify_clerk_jwt(token: str) -> dict:
    """
    Verifies Clerk JWT token and returns user information.

    Returns:
        dict: Decoded JWT payload with user information

    Raises:
        ValueError: If token is invalid or expired
    """
    # Implementation details...

@clerk_authenticated
def protected_view(request):
    """
    Decorator automatically verifies JWT and adds user info to request.

    Request attributes added:
        - request.user_info: Complete JWT payload
        - request.clerk_user_id: Clerk user ID
    """
```

### User Synchronization

Clerk webhooks automatically sync user data:

```python
class ClerkWebhookView(APIView):
    """
    Handles Clerk webhook events to sync user data.

    Events handled:
        - user.created: Create new Django user
        - user.updated: Update existing user data
        - user.deleted: Mark user as inactive
    """
```

## 🤖 Machine Learning Integration

### Similarity Scoring System

The backend uses sentence transformers for intelligent similarity scoring:

```python
# Word similarity calculation
from sentence_transformers import SentenceTransformer

def calculate_word_similarity(guess_words: List[str], target_words: List[str]) -> float:
    """
    Calculate semantic similarity between guess and target words.

    Args:
        guess_words: List of user's guessed words
        target_words: List of correct solution words

    Returns:
        float: Similarity score between 0.0 and 1.0
    """
    model = SentenceTransformer('all-MiniLM-L6-v2')

    # Encode word lists to embeddings
    guess_embeddings = model.encode(guess_words)
    target_embeddings = model.encode(target_words)

    # Calculate cosine similarity
    similarity = cosine_similarity(guess_embeddings, target_embeddings)

    return float(np.mean(similarity))
```

### Word Status Classification

Advanced word matching with position awareness:

```python
class WordAccuracy(models.TextChoices):
    CORRECT = "correct"      # Right word, right position
    MISPLACED = "misplaced"  # Right word, wrong position
    INCORRECT = "incorrect"  # Wrong word entirely

def classify_word_accuracy(guess: List[str], solution: List[str]) -> List[dict]:
    """
    Classify each guessed word as correct, misplaced, or incorrect.

    Returns:
        List[dict]: Word feedback with status for each position
    """
```

## 🛡️ Security Features

### CORS Configuration

Properly configured for frontend-backend communication:

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",    # React development
    "http://localhost:5173",    # Vite development
    "https://your-domain.com",  # Production frontend
]

CORS_ALLOW_HEADERS = [
    'authorization',      # Clerk JWT tokens
    'content-type',      # JSON requests
    'ngrok-skip-browser-warning',  # Development tunneling
]
```

### Input Validation & Sanitization

- **Django Forms & Serializers** for input validation
- **SQL Injection Protection** via Django ORM
- **XSS Prevention** through proper serialization
- **Rate Limiting** on API endpoints (configurable)

### Error Handling

Comprehensive error handling with meaningful responses:

```python
# Custom error responses
{
  "error": "Invalid guess format",
  "details": "Expected 4 words, received 3",
  "status_code": 400
}
```

## 📊 Database Performance

### Indexing Strategy

Optimized database queries with strategic indexing:

```python
class UserProgress(models.Model):
    class Meta:
        indexes = [
            models.Index(fields=["user", "game_mode"]),      # User progress queries
            models.Index(fields=["puzzle", "game_mode"]),    # Puzzle analytics
            models.Index(fields=["category", "-score"]),     # Leaderboards
        ]

        constraints = [
            models.UniqueConstraint(
                fields=["user", "puzzle", "game_mode"],
                condition=Q(game_mode='levelup'),
                name="uq_one_try_per_user_puzzle_in_levelup"
            )
        ]
```

### Query Optimization

- **Select Related** for foreign key lookups
- **Prefetch Related** for reverse foreign keys
- **Database Query Analysis** with Django Debug Toolbar
- **Pagination** for large result sets

## 🚀 Deployment

### Environment Configuration

**Production Settings:**
```python
# settings.py - Production overrides
DEBUG = False
ALLOWED_HOSTS = ['your-api-domain.com']
CORS_ALLOW_ALL_ORIGINS = False  # Use specific origins

# Database connection pooling
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'OPTIONS': {
            'MAX_CONNS': 20,
            'conn_max_age': 600,
        }
    }
}
```

### Docker Deployment

Example Dockerfile:
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]
```

### Migration Management

```bash
# Production deployment steps
python manage.py collectstatic --noinput
python manage.py migrate --run-syncdb
python manage.py check --deploy
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test core

# Run with coverage
pip install coverage
coverage run manage.py test
coverage report
```

### Test Categories

- **Model Tests**: Database model validation
- **API Tests**: Endpoint functionality and security
- **Authentication Tests**: Clerk integration
- **Business Logic Tests**: Game mechanics and scoring

## 🐛 Common Issues & Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL connection
python manage.py dbshell

# Reset migrations (development only)
python manage.py migrate core zero
python manage.py migrate
```

### Clerk Authentication Issues
```python
# Debug JWT tokens
import jwt
decoded = jwt.decode(token, options={"verify_signature": False})
print(decoded)
```

### Performance Issues
```python
# Enable SQL query logging
LOGGING = {
    'version': 1,
    'loggers': {
        'django.db.backends': {
            'level': 'DEBUG',
        }
    }
}
```

## 📝 Contributing Guidelines

### Code Style
- Follow **PEP 8** Python style guidelines
- Use **Django best practices** for models and views
- Write **comprehensive docstrings** for functions
- Implement **proper error handling**

### Database Changes
- Always create **migrations** for model changes
- Write **reversible migrations** where possible
- Test migrations on **sample data**
- Document **breaking changes**

### API Development
```python
# API endpoint template
class YourAPIView(APIView):
    """
    Brief description of the endpoint functionality.

    Required permissions: [list permissions]
    """

    @clerk_authenticated
    def get(self, request):
        """Handle GET requests with proper error handling."""
        try:
            # Implementation
            return Response(data, status=200)
        except Exception as e:
            logger.error(f"Error in YourAPIView: {str(e)}")
            return Response(
                {"error": "Internal server error"},
                status=500
            )
```

---

## 🎯 Ready to Build Powerful APIs?

This Django backend provides a solid foundation for scalable word puzzle games with advanced features like machine learning integration, comprehensive user tracking, and robust authentication. The modular architecture makes it easy to extend functionality and add new game modes.

**Happy coding!** 🚀