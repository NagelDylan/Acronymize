postgres=# CREATE USER acronymize WITH PASSWORD 'katgur-dUvjij-8qyrpo'
postgres-# CREATE DATABASE acronymize_db OWNER acronymize;

Set up backend:
source .venv/bin/activate
cd backend
python manage.py runserver
ngrok http 8000

Database view:
psql -U acronymize -d acronymize*db;
SELECT \* from core*{table}

superuser details:
Email address: super@user.com
Username: superUser
passowrd: bruhbruh111

rIbvec-tohbyr-quvty5

waht happens when there are multiple with same name with different users creating it. can they request each others?
consider a leaderboard
Make select your level start at the next up level, ake it so that it calls for more data when going backwards and forwards

postgresql://acronymize:katgur-dUvjij-8qyrpo@localhost:5432/acronymize_db
