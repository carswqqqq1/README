# Language Quest (Duolingo-inspired demo)

This lightweight Flask app imitates core Duolingo flows: account creation, login, a dashboard of skills, quick phrase lessons, and a practice queue backed by SQLite.

## Running locally
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the app:
   ```bash
   flask --app app run --debug
   ```
3. Open http://localhost:5000 in your browser.

## Features
- User registration and login using hashed passwords (SQLite persistence).
- Dashboard of sample Spanish and French skills with completion tracking.
- Lesson view showing phrases and a button to mark the skill complete.
- Practice queue that surfaces the next incomplete skill.
- Responsive styling inspired by Duolingo’s layout.

## Notes
- The database file (`duolingo_clone.db`) is created automatically on first run.
- This is a teaching demo, not a production-ready clone. Add your own languages and exercises in `app.py` under `LANGUAGES`.
