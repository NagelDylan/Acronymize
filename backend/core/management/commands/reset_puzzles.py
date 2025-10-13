from django.core.management.base import BaseCommand
from core.models import Puzzle


class Command(BaseCommand):
    help = 'Reset all puzzles in the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirm you want to delete all puzzles',
        )

    def handle(self, *args, **options):
        if not options['confirm']:
            self.stdout.write(
                self.style.WARNING(
                    'This will delete ALL puzzles. Use --confirm flag to proceed.'
                )
            )
            return

        count = Puzzle.objects.count()
        Puzzle.objects.all().delete()

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully deleted {count} puzzles from the database.'
            )
        )