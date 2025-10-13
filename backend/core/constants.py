from enum import IntEnum


class WordAccuracy(IntEnum):
    """
    Enum representing the accuracy of a guessed word in the puzzle.

    CORRECT: Word is correct and in the right position
    WRONG_LOCATION: Word exists in the solution but in wrong position
    WRONG: Word does not exist in the solution
    """
    CORRECT = 0
    WRONG_LOCATION = 1
    WRONG = 2