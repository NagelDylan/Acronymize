import csv
import os
from django.core.management.base import BaseCommand, CommandError
from django.db import models
from core.models import Puzzle, Category


class Command(BaseCommand):
    help = 'Update wildcard puzzles with corrected CSV data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirm you want to update wildcard puzzles',
        )
        parser.add_argument(
            '--file',
            type=str,
            default='wildcard_full_solutions.csv',
            help='CSV file to import (default: wildcard_full_solutions.csv)',
        )

    def handle(self, *args, **options):
        if not options['confirm']:
            self.stdout.write(
                self.style.WARNING(
                    'This will replace all wildcard puzzles with corrected data. '
                    'Use --confirm flag to proceed.'
                )
            )
            return

        # Get wildcard category
        try:
            wildcard_category = Category.objects.get(slug='the-wildcard')
        except Category.DoesNotExist:
            raise CommandError('Wildcard category (slug: the-wildcard) not found')

        # Delete existing wildcard puzzles
        existing_count = wildcard_category.puzzles.count()
        wildcard_category.puzzles.all().delete()
        self.stdout.write(f'Deleted {existing_count} existing wildcard puzzles')

        # Import from new CSV file
        csv_file = options['file']
        if not os.path.exists(csv_file):
            raise CommandError(f'CSV file not found: {csv_file}')

        count = self.import_corrected_puzzles(csv_file, wildcard_category)

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully updated wildcard puzzles: '
                f'removed {existing_count}, imported {count} new puzzles'
            )
        )

    def import_corrected_puzzles(self, file_path, category):
        """Import corrected wildcard puzzles from CSV"""
        count = 0

        # Get next available position
        max_position = Puzzle.objects.aggregate(
            max_pos=models.Max('position')
        )['max_pos'] or 0
        current_position = max_position

        with open(file_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)

            for row_num, row in enumerate(reader, 1):
                try:
                    # Clean and validate data
                    solution = row['solution'].strip()
                    clue = row['clue'].strip()

                    # Skip empty rows
                    if not solution:
                        continue

                    # Handle par_score with default
                    try:
                        par_score = int(row['par_score']) if row['par_score'].strip() else 5
                    except (ValueError, AttributeError):
                        par_score = 5

                    # Skip if already exists (shouldn't happen since we deleted all wildcard puzzles)
                    if Puzzle.objects.filter(solution=solution).exists():
                        self.stdout.write(
                            f'Skipping duplicate solution: {solution}'
                        )
                        continue

                    # Create puzzle with auto-incrementing position
                    current_position += 1

                    puzzle = Puzzle.objects.create(
                        solution=solution,
                        clue=clue,
                        par_score=par_score,
                        category=category,
                        position=current_position
                    )
                    count += 1

                    self.stdout.write(f'Imported: {solution}')

                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(
                            f'Error importing row {row_num}: {e}'
                        )
                    )
                    continue

        return count