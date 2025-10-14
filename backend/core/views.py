# core/views.py
from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Category, Puzzle, UserProgress, User, EndlessScore
from .serializers import CategorySerializer
from .constants import WordAccuracy
from django.db.models import Q,OuterRef, Subquery, IntegerField,CharField, Exists
from django.db import transaction
from django.http import HttpResponse, JsonResponse
import json
import difflib
from datetime import date
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.conf import settings
from svix.webhooks import Webhook, WebhookVerificationError
from core.models import User
from django.http import JsonResponse
from .auth_utils import verify_clerk_jwt, extract_user_id_from_token
from functools import wraps
import logging

logger = logging.getLogger(__name__)

BATCH_SIZE_DEFAULT = 20

def clerk_authenticated(view_func):
    """
    Decorator that verifies Clerk JWT tokens and attaches user info to the request.

    Adds the following to the request object:
    - request.user_info: Complete JWT payload
    - request.clerk_user_id: Clerk user ID (from 'sub' claim)
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        # Check for Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            logger.warning("Missing Authorization header")
            return JsonResponse({"error": "Authorization header required"}, status=401)

        if not auth_header.startswith("Bearer "):
            logger.warning("Invalid Authorization header format")
            return JsonResponse({"error": "Invalid authorization format. Expected 'Bearer <token>'"}, status=401)

        # Extract token
        try:
            token = auth_header.split("Bearer ")[1].strip()
            if not token:
                raise ValueError("Empty token")
        except (IndexError, ValueError):
            logger.warning("Invalid token format in Authorization header")
            return JsonResponse({"error": "Invalid token format"}, status=401)

        # Verify JWT token
        try:
            payload = verify_clerk_jwt(token)
            user_id = payload.get('sub')

            if not user_id:
                logger.error("JWT payload missing 'sub' claim")
                return JsonResponse({"error": "Invalid token - missing user ID"}, status=401)

            # Attach user info to request
            request.user_info = payload
            request.clerk_user_id = user_id

            logger.debug(f"Authentication successful for user: {user_id}")

        except ValueError as e:
            logger.warning(f"JWT verification failed: {e}")
            return JsonResponse({"error": "Invalid or expired token"}, status=401)

        except Exception as e:
            logger.error(f"Unexpected authentication error: {e}")
            return JsonResponse({"error": "Authentication failed"}, status=401)

        return view_func(request, *args, **kwargs)
    return wrapper

def getAcronymFromSolution(solution):
    """
    Extracts the acronym from a solution by taking the first letter of each word.

    Args:
        solution (str): The full sentence solution (e.g., "Lions Tigers Monkeys Elephants")

    Returns:
        str: The acronym (e.g., "LTME")
    """
    if not solution:
        return ""

    words = solution.strip().split()
    acronym = "".join(word[0].upper() for word in words if word)
    return acronym

def normalize_word(word):
    """
    Normalizes a word by removing common punctuation and converting to lowercase.

    This allows for comparison between words with and without punctuation.
    For example: "don't" becomes "dont", "well-known" becomes "wellknown"

    Args:
        word (str): The word to normalize

    Returns:
        str: The normalized word with punctuation removed and lowercased
    """
    if not word:
        return ""

    # Remove common punctuation characters but keep letters and numbers
    import string
    # Remove punctuation except for spaces (we'll handle spaces separately)
    translator = str.maketrans('', '', string.punctuation)
    normalized = word.translate(translator).lower()
    return normalized

class CategoryListView(ListAPIView):
    """
        This view returns a list of all active system categories
        and all categories created by a specific user if the 'user_id'
        query parameter is provided.
    """
    serializer_class = CategorySerializer

    def get(self, request):
        is_system_category = Q(creator__isnull=True)
        user_id = request.query_params.get('user_id')
        game_mode = request.query_params.get('game_mode')

        query = is_system_category
        user = None

        if user_id:
            try:
                user = User.objects.get(clerk_id=user_id)
                is_users_category = Q(creator=user)
                query = query | is_users_category
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=404)

        categories = Category.objects.filter(query, is_active=True)

        # Serialize categories first
        serializer = self.get_serializer(categories, many=True)
        categories_data = serializer.data

        # Add dynamic data if user exists and game_mode specified
        if user and game_mode:
            if game_mode == "endless":
                # Create a dictionary mapping a category's ID to its high score.
                # This fetches all relevant scores for the user in a single, efficient database query.
                score_map = {score.category_id: score.high_score
                            for score in EndlessScore.objects.filter(user=user)}

                # Now, loop through your list of categories.
                for cat_data in categories_data:
                    cat_id = cat_data['id']
                    # Use the dictionary for a fast lookup.
                    # .get() is used to safely return None if the key doesn't exist.
                    high_score = score_map.get(cat_id)
                    if high_score is not None:
                        cat_data['high_score'] = high_score

            elif game_mode == "daily":
                today = date.today()
                completed_categories = set(
                    UserProgress.objects.filter(
                        user=user,
                        game_mode=game_mode,
                        timestamp__date=today
                    ).values_list('category_id', flat=True)
                )

                print(completed_categories)

                for cat_data in categories_data:
                    cat_id = cat_data['id']
                    if cat_id in completed_categories:
                        cat_data['badge'] = "Completed"

        print(categories_data)
        return Response(categories_data)

class CategoryPuzzleCountView(APIView):
    """
    API view that returns the count of puzzles for a specific category.
    """
    def get(self, request, slug):
        category = get_object_or_404(Category, slug__iexact=slug)
        count = Puzzle.objects.filter(category=category).count()
        return Response({'count': count})
    
class PuzzleRequest(APIView):
    """
    API view that returns puzzle data for a specific category and level number.
    """
    def get(self, request, slug, level_num):
        # Get the category safely
        category = get_object_or_404(Category, slug__iexact=slug)

        # Get the puzzle for this category and level number safely
        puzzle = get_object_or_404(
            Puzzle,
            category=category,
            position=level_num
        )

        data = {'acronym': getAcronymFromSolution(puzzle.solution),
            'clue': puzzle.clue, "par_score": puzzle.par_score, "position": puzzle.position}

        # Return structured JSON response
        return JsonResponse(data)

class PuzzleSolution(APIView):
    """
    API view that returns puzzle solution for specific category and level number
    """

    def get(self, request, slug, level_num):
        # Get the category safely
        category = get_object_or_404(Category, slug__iexact=slug)

        # Get the puzzle for this category and level number safely
        puzzle = get_object_or_404(
            Puzzle,
            category=category,
            position=level_num
        )

        data = {'solution': puzzle.solution}

        # Return structured JSON response
        return JsonResponse(data)
    

class PuzzleGuessResponse(APIView):
    """
    API view that returns the accuracy of each word + total sentence closeness
    """
    @staticmethod
    def _similarityScore(a: str, b: str):
        """
        Calculate similarity between two strings using SequenceMatcher.
        Returns a score between 0.0 and 1.0 where 1.0 is identical.
        """
        return difflib.SequenceMatcher(None, a.lower(), b.lower()).ratio()


    def post(self, request, slug, level_num):
        print(request.body)
        # Get the category safely
        category = get_object_or_404(Category, slug__iexact=slug)

        # Get the puzzle for this category and level number safely
        puzzle = get_object_or_404(
            Puzzle,
            category=category,
            position=level_num
        )

        request_data = json.loads(request.body)
        
        message = request_data.get('message')
        
        if not message:
            return HttpResponse("No message attribute", status=404)

        guessed_words = message.lower().split(" ")
        real_words = puzzle.solution.lower().split(" ")
        word_results = []

        print(puzzle.solution)

        all_correct = True
        for i in range(len(guessed_words)):
            # Normalize both words for comparison to handle punctuation differences
            normalized_guessed = normalize_word(guessed_words[i])
            normalized_real = normalize_word(real_words[i])

            if normalized_guessed == normalized_real:
                word_results.append(WordAccuracy.CORRECT)
            elif normalized_guessed in normalized_real:
                word_results.append(WordAccuracy.WRONG_LOCATION)
                all_correct = False
            else:
                word_results.append(WordAccuracy.WRONG)
                all_correct = False

    
        if (all_correct):
            score = 1
        else:
            # Normalize both sentences for similarity comparison to handle punctuation
            normalized_message = ' '.join(normalize_word(word) for word in message.split())
            normalized_solution = ' '.join(normalize_word(word) for word in puzzle.solution.split())
            score = round(PuzzleGuessResponse._similarityScore(normalized_message, normalized_solution), 2)
            if score == 1:
                score = 0.99
        

        data = {
            "word_results": word_results,
            "score": score
        }

        return JsonResponse(data)
    
@method_decorator(csrf_exempt, name='dispatch')
class ClerkWebhookView(APIView):
    def post(self, request, *args, **kwargs):
        print("Webhook received!")
        headers = request.headers
        payload = request.body.decode('utf-8')

        secret = settings.CLERK_WEBHOOK_SECRET

        try:
            # Create a Webhook instance and verify
            wh = Webhook(secret)
            event = wh.verify(payload, headers)
        except WebhookVerificationError as e:
            print(f"Error verifying webhook: {e}")
            return Response({"error": "Invalid signature"}, status=400)
        
        event_type = event['type']
        data = event['data']

        if event_type == 'user.created':
            # Get email from the first email address
            email = data['email_addresses'][0]['email_address']

            User.objects.create(
                clerk_id=data['id'],
                email=email,
                username=data.get('username') or email,  # Use username or fall back to email
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', ''),
            )
            print(f"User {data['id']} created in database.")

        elif event_type == 'user.updated':
            user = User.objects.filter(clerk_id=data['id']).first()
            if user:
                email = data['email_addresses'][0]['email_address']
                user.email = email
                user.username = data.get('username') or email
                user.first_name = data.get('first_name', '')
                user.last_name = data.get('last_name', '')
                user.save()
                print(f"User {data['id']} updated.")

        return Response(status=200)
    
@method_decorator(clerk_authenticated, name='dispatch')
class LevelupLevelsView(ListAPIView):
    def get_user_progression_center(self, user, category_id):
        """
        Find the appropriate center position for the user based on their progress.
        Returns the position of the first unlocked level (highest completed + 1).
        If user has no progress, returns position 1.
        """
        # Get the highest completed level position for this user in this category
        highest_completed = UserProgress.objects.filter(
            user=user,
            game_mode=UserProgress.GameMode.LEVELS,
            puzzle__category_id=category_id,
            # Only consider truly completed levels (user has a score)
        ).select_related('puzzle').order_by('-puzzle__position').first()

        if highest_completed:
            # Return the next level after the highest completed (first unlocked)
            return highest_completed.puzzle.position + 1
        else:
            # No progress yet, start at level 1
            return 1

    def get(self, request):
        user_id = request.clerk_user_id
        print (user_id)
        try:
            user = User.objects.get(clerk_id=user_id)
        except User.DoesNotExist:
            logger.error(f"User with clerk_id {user_id} not found in database")
            return Response({"error": "User not found"}, status=404)

        slug = request.query_params.get("slug")
        category_id = Category.objects.get(slug=slug).id

        # Get pagination parameters
        after_position_raw = request.query_params.get("after_position")
        before_position_raw = request.query_params.get("before_position")
        center_position_raw = request.query_params.get("center_position")

        # Determine loading mode and position
        if center_position_raw is not None:
            # Centered loading mode
            try:
                center_position = int(center_position_raw)
            except ValueError:
                center_position = self.get_user_progression_center(user, category_id)
        elif after_position_raw is None and before_position_raw is None:
            # Initial load with no parameters - use user's progression center
            center_position = self.get_user_progression_center(user, category_id)
        else:
            center_position = None

        qs = Puzzle.objects.all().order_by("position")
        if category_id:
            try:
                qs = qs.filter(category_id=category_id)
            except ValueError:
                # Invalid slug, ignore filter
                pass

        # Apply position filtering based on mode
        if center_position is not None:
            # Centered loading: get levels around the center position
            # Load half batch size before and half after the center
            half_batch = BATCH_SIZE_DEFAULT // 2
            start_position = max(1, center_position - half_batch)
            end_position = center_position + half_batch
            qs = qs.filter(position__gte=start_position, position__lte=end_position)
        elif after_position_raw is not None:
            # Forward pagination
            try:
                after_position = int(after_position_raw)
                qs = qs.filter(position__gt=after_position)
            except ValueError:
                #ignore bad cursor, treat like initial page
                pass
        elif before_position_raw is not None:
            # Backward pagination
            try:
                before_position = int(before_position_raw)
                qs = qs.filter(position__lt=before_position).order_by("-position")
            except ValueError:
                #ignore bad cursor
                pass

        levelup_progress = UserProgress.objects.filter(
            user=user,
            game_mode=UserProgress.GameMode.LEVELS,
            puzzle=OuterRef("pk"),
        )

        score_sq = Subquery(levelup_progress.values("score")[:1], output_field=IntegerField())
        attempts_sq = Subquery(levelup_progress.values("attempts_data")[:1], output_field=CharField())
        completed_exists = Exists(levelup_progress)

        # fetch one extra to determine has_more/has_prev
        limit = BATCH_SIZE_DEFAULT + 1
        annotated = (
            qs.annotate(
                user_score=score_sq,
                user_attempts=attempts_sq,
                is_completed=completed_exists
            )
            .values("id", "position", "par_score", "user_score", "user_attempts", "is_completed")[:limit]
        )

        rows = list(annotated)

        # Handle backward pagination ordering
        if before_position_raw is not None:
            rows = rows[::-1]  # Reverse the order for backward pagination

        # Determine pagination state
        has_more = len(rows) > BATCH_SIZE_DEFAULT
        if has_more:
            rows = rows[:BATCH_SIZE_DEFAULT]

        # Calculate prev/next cursors and has_prev
        has_prev = False
        prev_cursor = None
        next_cursor = None

        if rows:
            first_position = rows[0]["position"]
            last_position = rows[-1]["position"]

            if center_position is not None:
                # For centered loading, check if there are levels before/after
                has_prev = Puzzle.objects.filter(category_id=category_id, position__lt=first_position).exists()
                has_more = Puzzle.objects.filter(category_id=category_id, position__gt=last_position).exists()
                prev_cursor = first_position - 1 if has_prev else -1
                next_cursor = last_position if has_more else -1
            elif before_position_raw is not None:
                # Backward pagination
                has_prev = Puzzle.objects.filter(category_id=category_id, position__lt=first_position).exists()
                prev_cursor = first_position - 1 if has_prev else -1
                next_cursor = last_position
            else:
                # Forward pagination (existing behavior)
                has_prev = Puzzle.objects.filter(category_id=category_id, position__lt=first_position).exists()
                prev_cursor = first_position - 1 if has_prev else -1
                next_cursor = last_position if has_more else -1

        items = [
            {
                "puzzle_id": r["id"],
                "position": r["position"],
                "par_score": r["par_score"],
                "score": r["user_score"],
                "attempts_data": r["user_attempts"],
                "is_completed": bool(r["is_completed"])
            }
            for r in rows
        ]

        payload = {
            "items": items,
            "next_cursor": next_cursor,
            "prev_cursor": prev_cursor,
            "has_more": has_more,
            "has_prev": has_prev,
            "batch_size": BATCH_SIZE_DEFAULT,
            "center_position": center_position,
        }
        return Response(payload)
    

    def post(self, request):
        user_id = request.clerk_user_id

        # Get user
        try:
            user = User.objects.get(clerk_id=user_id)
        except User.DoesNotExist:
            logger.error(f"User with clerk_id {user_id} not found in database")
            return Response({"error": "User not found"}, status=404)

        # Validate and get query parameters
        slug = request.query_params.get("slug")
        level_num = request.query_params.get("level_num")
        score = request.query_params.get("score")
        game_mode = request.query_params.get("game_mode")

        if not all([slug, level_num, score]):
            return Response({"error": "Missing required parameters: slug, level_num, score"}, status=400)

        try:
            level_num = int(level_num)
            score = int(score)
        except ValueError:
            return Response({"error": "level_num and score must be integers"}, status=400)

        # Get category and puzzle
        try:
            category = Category.objects.get(slug=slug)
        except Category.DoesNotExist:
            return Response({"error": "Category not found"}, status=404)

        try:
            puzzle = Puzzle.objects.get(position=level_num, category=category)
        except Puzzle.DoesNotExist:
            return Response({"error": "Puzzle does not exist"}, status=404)

        # Parse and validate request body
        try:
            data = json.loads(request.body)
            attempts_data = data.get('attempts_data')
            if attempts_data is None:
                return Response({"error": "Missing attempts_data in request body"}, status=400)
        except (json.JSONDecodeError, KeyError) as e:
            return Response({"error": "Invalid JSON in request body"}, status=400)

        # Check if progress already exists to prevent duplicates (only for today)
        try:
            today = date.today()
            existing_progress = UserProgress.objects.filter(
                user=user,
                puzzle=puzzle,
                game_mode=game_mode,
                timestamp__date=today  # Only check for completion today
            ).first()

            if existing_progress:
                # Progress already exists - don't create duplicate or update
                return Response({
                    "success": True,
                    "message": "Progress already recorded",
                    "id": existing_progress.id
                }, status=200)

            # Create new progress record only if none exists
            new_user_progress = UserProgress.objects.create(
                user=user,
                category=category,
                puzzle=puzzle,
                game_mode=game_mode,
                score=score,
                attempts_data=attempts_data
            )
            return Response({"success": True, "id": new_user_progress.id}, status=201)
        except Exception as e:
            logger.error(f"Failed to create user progress: {e}")
            return Response({"error": "Failed to save progress"}, status=500) 
    
@method_decorator(clerk_authenticated, name='dispatch')
class EndlessMyScoreView(APIView):
    """
    GET /api/endless/score/
    Returns high scores for all endless mode categories (system + user-created)
    """

    def get(self, request):
        user_id = request.clerk_user_id

        # Get user
        try:
            user = User.objects.get(clerk_id=user_id)
        except User.DoesNotExist:
            logger.error(f"User with clerk_id {user_id} not found in database")
            return Response({"error": "User not found"}, status=404)

        # Get all active categories (system categories + user's own categories)
        categories = Category.objects.filter(
            Q(creator__isnull=True) | Q(creator=user),
            is_active=True
        ).order_by('order', 'name')

        # Get user's endless scores for these categories
        user_scores = {
            score.category_id: score.high_score
            for score in EndlessScore.objects.filter(
                user=user,
                category__in=categories
            ).select_related('category')
        }

        # Build response with category info and scores
        results = []
        for category in categories:
            results.append({
                "category_slug": category.slug,
                "high_score": user_scores.get(category.id, 0)
            })

        return Response(results)
    
    
@method_decorator(clerk_authenticated, name='dispatch')
class EndlessSubmitView(APIView):
    """
    POST /api/endless/submit/?slug=<slug>&score=<score>
    Updates only if higher
    Returns success status
    """

    def post(self, request):
        user_id = request.clerk_user_id

        # Get user
        try:
            user = User.objects.get(clerk_id=user_id)
        except User.DoesNotExist:
            logger.error(f"User with clerk_id {user_id} not found in database")
            return Response({"error": "User not found"}, status=404)

        # Validate required parameters
        slug = request.query_params.get("slug")
        score_str = request.query_params.get("score")

        if not all([slug, score_str]):
            return Response({"error": "Missing required parameters: slug, score"}, status=400)

        # Convert and validate score
        try:
            score = int(score_str)
            if score < 0:
                return Response({"error": "Score must be non-negative"}, status=400)
        except ValueError:
            return Response({"error": "Score must be an integer"}, status=400)

        # Get category
        try:
            category = Category.objects.get(slug=slug)
        except Category.DoesNotExist:
            return Response({"error": "Category not found"}, status=404)

        # Update score atomically
        try:
            with transaction.atomic():
                row, created = EndlessScore.objects.select_for_update().get_or_create(
                    user=user, category=category, defaults={"high_score": score}
                )

                # If record exists and new score is higher, update it
                if not created and score > row.high_score:
                    row.high_score = score
                    row.save()

            return Response({"success": True, "high_score": row.high_score}, status=200)
        except Exception as e:
            logger.error(f"Failed to update endless score: {e}")
            return Response({"error": "Failed to update score"}, status=500)
            

@method_decorator(clerk_authenticated, name='dispatch')
class EndlessLevelPacket(APIView):
    """
    GET/POST /api/endless/levels/?slug=<slug>
    Returns a random list of puzzles from specified category
    POST body (optional): {"last_position": [1, 5, 8]} --> positions to exclude from results
    """

    def _get_puzzle_data(self, request):
        """Shared logic for both GET and POST methods"""
        user_id = request.clerk_user_id

        # Get user
        try:
            user = User.objects.get(clerk_id=user_id)
        except User.DoesNotExist:
            logger.error(f"User with clerk_id {user_id} not found in database")
            return Response({"error": "User not found"}, status=404)
        
        limit = 5

        # Validate required parameters
        slug = request.query_params.get("slug")
        if not slug:
            return Response({"error": "Missing required parameter: slug"}, status=400)


        # Get category (system categories or user's own categories)
        try:
            category = Category.objects.get(
                Q(slug=slug) & (Q(creator__isnull=True) | Q(creator=user))
            )
        except Category.DoesNotExist:
            logger.error(f"Category with slug {slug} not found")
            return Response({"error": "Category not found"}, status=404)

        # Parse optional last_position data from request body
        last_positions = []
        if request.body:
            try:
                data = json.loads(request.body)
                last_positions = data.get('last_position', [])
                if not isinstance(last_positions, list):
                    return Response({"error": "last_position must be an array"}, status=400)
            except (json.JSONDecodeError, KeyError):
                # Ignore invalid JSON, continue without filtering
                pass

        # Start with all puzzles in category
        puzzles_query = Puzzle.objects.filter(category=category)

        # Apply last_position filtering if we have positions to exclude
        if last_positions:
            try:
                # Convert to integers and filter out puzzles with these positions
                exclude_positions = [int(pos) for pos in last_positions]
                puzzles_query = puzzles_query.exclude(position__in=exclude_positions)
                logger.info(f"Filtering out puzzles at positions: {exclude_positions}")
            except (ValueError, TypeError):
                # Invalid position data, continue without filtering
                logger.warning(f"Invalid last_position data: {last_positions}")

        # Get total count and apply limit
        total_count = puzzles_query.count()
        if total_count == 0:
            return Response({"error": "No puzzles available"}, status=404)

        final_limit = min(total_count, limit)
        random_puzzles = puzzles_query.order_by('?')[:final_limit]

        # Prepare response data
        puzzle_data = []
        for puzzle in random_puzzles:
            puzzle_data.append({
                "position": puzzle.position,
                "clue": puzzle.clue,
                "par_score": puzzle.par_score,
                "acronym": getAcronymFromSolution(puzzle.solution),
            })

        return Response({
            "puzzles": puzzle_data,
            "count": len(puzzle_data),
            "total_available": total_count,
            "filtered_positions": last_positions
        })

    def get(self, request):
        """Handle GET requests"""
        return self._get_puzzle_data(request)

    def post(self, request):
        """Handle POST requests (same logic as GET, but can accept request body)"""
        return self._get_puzzle_data(request)
    

class WordOfTheDay(APIView):
    """
    GET/ /api/daily/?slug=<slug>
    Returns the word of the day given the specified category slug
    """
    def get(self, request):
        # Validate required parameters
        slug = request.query_params.get("slug")

        if not slug:
            return Response({"error": "Missing slug parameter"}, status=400)
        
         # Get category
        try:
            category = Category.objects.get(slug=slug, creator=None)
        except Category.DoesNotExist:
            return Response({"error": "Category not found"}, status=404)
        
        # Get all puzzles for this category
        all_puzzles = Puzzle.objects.filter(category=category)

        if not all_puzzles.exists():
            return Response({"error": "No puzzles available for this category"}, status=404)

        # Use current date to deterministically select puzzle for today
        today = date.today()
        # Create a consistent seed from the date (days since epoch)
        date_seed = (today - date(1970, 1, 1)).days

        # Use modulo to select puzzle index - ensures same puzzle each day
        puzzle_count = all_puzzles.count()
        selected_index = date_seed % puzzle_count

        # Get the puzzle at the calculated index
        selected_puzzle = all_puzzles.order_by('position')[selected_index]

        # Prepare response data
        puzzle_data = {
            'acronym': getAcronymFromSolution(selected_puzzle.solution),
            'clue': selected_puzzle.clue,
            'par_score': selected_puzzle.par_score,
            'position': selected_puzzle.position
        }

        return Response(puzzle_data)