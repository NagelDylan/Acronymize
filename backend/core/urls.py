# core/urls.py
from django.urls import path
from .views import CategoryListView, CategoryPuzzleCountView, PuzzleRequest, PuzzleGuessResponse, PuzzleSolution, ClerkWebhookView, LevelupLevelsView, EndlessMyScoreView, EndlessSubmitView, EndlessLevelPacket, WordOfTheDay

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('categories/<slug:slug>/puzzles/count/', CategoryPuzzleCountView.as_view(), name='category-puzzle-count'),
    path('puzzles/<slug:slug>/<int:level_num>/', PuzzleRequest.as_view(), name='category-puzzle-retrieve'),
    path('puzzles/<slug:slug>/guess/<int:level_num>/', PuzzleGuessResponse.as_view(), name='category-puzzle-guess-check'),
    path('puzzles/solution/<slug:slug>/<int:level_num>/', PuzzleSolution.as_view(), name='category-puzzle-solution'),
    path('clerk', ClerkWebhookView.as_view()),
    path("levelup/levels/", LevelupLevelsView.as_view(), name="levelup-levels"),
    path("endless/score/", EndlessMyScoreView.as_view(), name="endless-score"),
    path("endless/submit/", EndlessSubmitView.as_view(), name="endless-submit"),
    path("endless/levels/", EndlessLevelPacket.as_view(), name="endless-level-packet"),
    path("daily/", WordOfTheDay.as_view(), name="daily-word-get")
]