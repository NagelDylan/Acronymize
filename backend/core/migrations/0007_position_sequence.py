from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ("core", "0006_remove_puzzle_daily_puzzle_date_puzzle_position"),  # adjust to your latest migration
    ]

    operations = [
        migrations.RunSQL(
            # 1) Create a dedicated sequence for the position column
            sql="""
                CREATE SEQUENCE IF NOT EXISTS core_puzzle_position_seq START WITH 1;
            """,
            reverse_sql="""
                DROP SEQUENCE IF EXISTS core_puzzle_position_seq;
            """,
        ),
        migrations.RunSQL(
            # 2) Set the column default to nextval(sequence)
            sql="""
                ALTER TABLE core_puzzle
                ALTER COLUMN position SET DEFAULT nextval('core_puzzle_position_seq');
            """,
            reverse_sql="""
                ALTER TABLE core_puzzle
                ALTER COLUMN position DROP DEFAULT;
            """,
        ),
        migrations.RunSQL(
            # 3) Align the sequence with current max(position) (safe even when empty)
            sql="""
                SELECT setval(
                    'core_puzzle_position_seq',
                    COALESCE((SELECT MAX(position) FROM core_puzzle), 1)
                );
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]