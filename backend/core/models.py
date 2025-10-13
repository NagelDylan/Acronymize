# core/models.py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.conf import settings
from django.db.models import Max
from django.utils.translation import gettext_lazy as _
from django.db.models import Q

# This manager tells Django how to handle creating users with our custom model.
class UserManager(BaseUserManager):
    """
    User model manager where email is the unique identifier
    for authentication instead of usernames.
    """
    def create_user(self, email, username, password=None, **extra_fields):
        """
        Create and save a User with the given email and other data.
        Password is not used as Clerk handles authentication.
        """
        if not email:
            raise ValueError(_('The Email must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        # We don't set a password since Clerk is the auth source
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        """
        Create and save a SuperUser with the given email and other data.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        
        # Superuser is created via command line and won't have a Clerk ID initially.
        # Password can be set to None or an unusable password.
        user = self.create_user(email, username, **extra_fields)
        if password:
             user.set_password(password) # Optional: set a password for Django admin access
             user.save(using=self._db)
        return user

# This is our new, simplified User model.
class User(AbstractBaseUser):
    """
    Custom User model integrated with Clerk.
    Email is the primary identifier, and Clerk ID is stored for mapping.
    """

    # Use email as the unique identifier for the user
    email = models.EmailField(_('email address'), unique=True)

    # Password field with unusable default for Clerk users
    password = models.CharField(_('password'), max_length=128, default='!')

    # Add username field for display purposes and Django admin
    username = models.CharField(_('username'), max_length=150, blank=True)

    # Name fields
    first_name = models.CharField(_('first name'), max_length=150, blank=True)
    last_name = models.CharField(_('last name'), max_length=150, blank=True)

    # Store the unique Clerk User ID (nullable for Django admin users)
    clerk_id = models.CharField(max_length=255, unique=True, null=True, blank=True)

    # Standard user flags
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    # Use email as login identifier
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']  # Required when creating superuser

    objects = UserManager()

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        """Does the user have a specific permission?"""
        return self.is_superuser

    def has_module_perms(self, app_label):
        """Does the user have permissions to view the app `app_label`?"""
        return self.is_superuser


#This model represents a category type for acronyms.
class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True, help_text="A URL-friendly version of the name.")
    description = models.CharField(max_length=255)
    emoji = models.CharField(max_length=5)
    order = models.PositiveIntegerField(default=0, help_text="Controls the display order; lower numbers appear first.")
    is_active = models.BooleanField(default=True, help_text="Uncheck this to hide the category from the site.")
    creator = models.ForeignKey(User, null=True, blank=True, related_name='categories', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']
        verbose_name_plural = "Categories" # Fixes the admin panel showing "Categorys"

    def __str__(self):
        return f"{self.emoji} {self.name}"
    
class Puzzle(models.Model):
    solution = models.CharField(max_length=255, help_text="Full sentence solution", unique=True)
    clue = models.CharField(max_length=255, help_text="Clue to get the player started")
    par_score = models.PositiveIntegerField(default=5)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='puzzles')
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='puzzles'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    position = models.PositiveIntegerField(null=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['category', 'position']
    
    def __str__(self):
        return f"{self.solution} ({self.category.name})"
    
    def save(self, *args, **kwargs):
        if self.position is None:
            max_pos = Puzzle.objects.filter(category=self.category).aggregate(Max("position"))["position__max"] or 0
            self.position = max_pos + 1

        super().save(*args, **kwargs)

class UserProgress(models.Model):
    """
    Stores a user's progress and achievements across all game modes and categories.
    """
    class GameMode(models.TextChoices):
        LEVELS = 'levelup'
        ENDLESS = 'endless'
        DAILY = 'daily'

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="user_progress"
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="user_progress"
    )
    puzzle = models.ForeignKey(
        Puzzle,
        on_delete=models.CASCADE,
        related_name="progress_records",
        null=True,  # Can be null for 'Endless' mode
        blank=True
    )
    game_mode = models.CharField(
        max_length=128,
        choices=GameMode.choices,
        help_text="The game mode this progress record is for."
    )
    score = models.IntegerField(
        default=0,
        help_text="For Endless: highest round. For Levels and Daily: guess count"
    )
    attempts_data = models.TextField(
        blank=True,
        null=True,
        help_text="Stores the Wordle-style guess string for 'Levels' mode."
    )
    timestamp = models.DateTimeField(
        auto_now=True, # Automatically updates on every save
        help_text="The date and time this record was last updated."
    )

    class Meta:
        # This prevents duplicate entries for the same user on the same puzzle
        # or for the same user's endless score in the same category.
        indexes = [
            models.Index(fields=["user", "game_mode"]),
            models.Index(fields=["puzzle", "game_mode"])
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "puzzle", "game_mode"],
                condition=Q(game_mode='levelup'),
                name="uq_one_try_per_user_puzzle_in_levelup"
            )
        ]

    def __str__(self):
        if self.game_mode == self.GameMode.ENDLESS:
            return f"{self.user.username} - {self.category.name} Endless: {self.score}"
        elif self.puzzle:
            return f"{self.user.username} - {self.puzzle} ({self.game_mode}): {self.score}"
        return f"{self.user.username} - Progress Record {self.pk}"

class EndlessScore(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="endless_scores"
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="endless_scores"
    )
    high_score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "category"],
                name="uq_endless_user_category"
            )
        ]
        indexes = [
            models.Index(fields=["category", "-high_score"])
        ]
        verbose_name = "Endless Score"
        verbose_name_plural = "Endless Scores"
    
    def __str__(self):
        return f"{self.user_id}:{self.category_id} -> {self.high_score}"