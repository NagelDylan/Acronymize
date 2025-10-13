import csv
import os
from django.core.management.base import BaseCommand, CommandError
from django.db import models
from core.models import Puzzle, Category


class Command(BaseCommand):
    help = 'Import all puzzles from CSV files with improved error handling'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirm you want to import puzzles',
        )
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Reset puzzle table before importing',
        )

    def handle(self, *args, **options):
        if not options['confirm']:
            self.stdout.write(
                self.style.WARNING(
                    'This will import CSV puzzles. Use --confirm flag to proceed.'
                )
            )
            return

        if options['reset']:
            count = Puzzle.objects.count()
            Puzzle.objects.all().delete()
            self.stdout.write(f'Reset: deleted {count} existing puzzles')

        # Get categories
        try:
            carta_category = Category.objects.get(slug='carta')
            gen_z_category = Category.objects.get(slug='gen-z')
            wildcard_category = Category.objects.get(slug='the-wildcard')
        except Category.DoesNotExist as e:
            raise CommandError(f'Category not found: {e}')

        # Get next available position
        max_position = Puzzle.objects.aggregate(
            max_pos=models.Max('position')
        )['max_pos'] or 0

        # Import carta_puzzles.csv
        carta_file = os.path.join('core', 'carta_puzzles.csv')
        carta_count, max_position = self.import_csv_with_position(
            carta_file, carta_category, 'carta', max_position
        )

        # Import gen_z_puzzles.csv
        gen_z_file = os.path.join('core', 'gen_z_puzzles.csv')
        gen_z_count, max_position = self.import_csv_with_position(
            gen_z_file, gen_z_category, 'gen-z', max_position
        )

        # Import wildcard_acronyms.csv (no position column)
        wildcard_file = os.path.join('core', 'wildcard_acronyms.csv')
        wildcard_count, max_position = self.import_csv_simple(
            wildcard_file, wildcard_category, 'wildcard', max_position
        )

        total = carta_count + gen_z_count + wildcard_count
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully imported {total} puzzles '
                f'({carta_count} carta, {gen_z_count} gen-z, {wildcard_count} wildcard)'
            )
        )

    def import_csv_with_position(self, file_path, category, category_name, start_position):
        """Import CSV files that have a position column"""
        if not os.path.exists(file_path):
            self.stdout.write(
                self.style.ERROR(f'File not found: {file_path}')
            )
            return 0, start_position

        count = 0
        current_position = start_position

        with open(file_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)

            for row_num, row in enumerate(reader, 1):
                try:
                    # Clean and validate data
                    solution = row['solution'].strip()
                    clue = row['clue'].strip()

                    # Handle par_score with default
                    try:
                        par_score = int(row['par_score']) if row['par_score'].strip() else 5
                    except (ValueError, AttributeError):
                        par_score = 5

                    # Skip if already exists
                    if Puzzle.objects.filter(solution=solution).exists():
                        self.stdout.write(
                            f'Skipping duplicate solution: {solution}'
                        )
                        continue

                    # Use auto-incrementing position
                    current_position += 1

                    puzzle = Puzzle.objects.create(
                        solution=solution,
                        clue=clue,
                        par_score=par_score,
                        category=category,
                        position=current_position
                    )
                    count += 1

                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(
                            f'Error importing {category_name} row {row_num}: {e}'
                        )
                    )
                    continue

        self.stdout.write(f'Imported {count} {category_name} puzzles')
        return count, current_position

    def import_csv_simple(self, file_path, category, category_name, start_position):
        """Import CSV files that only have solution, clue, par_score columns"""
        if not os.path.exists(file_path):
            self.stdout.write(
                self.style.ERROR(f'File not found: {file_path}')
            )
            return 0, start_position

        count = 0
        current_position = start_position

        with open(file_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)

            for row_num, row in enumerate(reader, 1):
                try:
                    # Clean and validate data
                    solution = row['solution'].strip()
                    clue = row['clue'].strip()

                    # Handle par_score with default
                    try:
                        par_score = int(row['par_score']) if row['par_score'].strip() else 5
                    except (ValueError, AttributeError):
                        par_score = 5

                    # Skip if already exists
                    if Puzzle.objects.filter(solution=solution).exists():
                        self.stdout.write(
                            f'Skipping duplicate solution: {solution}'
                        )
                        continue

                    # Use auto-incrementing position
                    current_position += 1

                    puzzle = Puzzle.objects.create(
                        solution=solution,
                        clue=clue,
                        par_score=par_score,
                        category=category,
                        position=current_position
                    )
                    count += 1

                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(
                            f'Error importing {category_name} row {row_num}: {e}'
                        )
                    )
                    continue

        self.stdout.write(f'Imported {count} {category_name} puzzles')
        return count, current_position