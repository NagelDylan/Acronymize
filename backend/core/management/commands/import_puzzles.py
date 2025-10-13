import csv
import os
from django.core.management.base import BaseCommand, CommandError
from core.models import Puzzle, Category


class Command(BaseCommand):
    help = 'Import puzzles from CSV files'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirm you want to import puzzles',
        )

    def handle(self, *args, **options):
        if not options['confirm']:
            self.stdout.write(
                self.style.WARNING(
                    'This will import CSV puzzles. Use --confirm flag to proceed.'
                )
            )
            return

        # Get categories
        try:
            carta_category = Category.objects.get(slug='carta')
            gen_z_category = Category.objects.get(slug='gen-z')
        except Category.DoesNotExist as e:
            raise CommandError(f'Category not found: {e}')

        # Import carta_puzzles.csv
        carta_file = os.path.join('core', 'carta_puzzles.csv')
        carta_count = self.import_csv(carta_file, carta_category, 'carta')

        # Import gen_z_puzzles.csv
        gen_z_file = os.path.join('core', 'gen_z_puzzles.csv')
        gen_z_count = self.import_csv(gen_z_file, gen_z_category, 'gen-z')

        total = carta_count + gen_z_count
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully imported {total} puzzles '
                f'({carta_count} carta, {gen_z_count} gen-z)'
            )
        )

    def import_csv(self, file_path, category, category_name):
        if not os.path.exists(file_path):
            self.stdout.write(
                self.style.ERROR(f'File not found: {file_path}')
            )
            return 0

        count = 0
        with open(file_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)

            for row in reader:
                try:
                    puzzle = Puzzle.objects.create(
                        solution=row['solution'].strip(),
                        clue=row['clue'].strip(),
                        par_score=int(row['par_score']),
                        category=category,
                        position=int(row['position'])
                    )
                    count += 1

                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(
                            f'Error importing {category_name} row {count + 1}: {e}'
                        )
                    )
                    continue

        self.stdout.write(f'Imported {count} {category_name} puzzles')
        return count