import sqlite3
from pathlib import Path
from typing import Dict, List

from flask import Flask, g, redirect, render_template, request, session, url_for
from werkzeug.security import check_password_hash, generate_password_hash

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "duolingo_clone.db"

app = Flask(__name__)
app.secret_key = "dev-secret-change-me"

LANGUAGES: Dict[str, Dict[str, List[str]]] = {
    "Spanish": {
        "Phrases": [
            "Hola", "Buenos días", "Buenas noches", "Gracias", "Por favor", "¿Cómo estás?",
            "Me llamo...", "¿Dónde está el baño?", "Encantado de conocerte",
        ],
        "Travel": [
            "¿Cuánto cuesta?", "Necesito ayuda", "Una mesa para dos, por favor", "La cuenta, por favor", "¿Hablas inglés?",
        ],
    },
    "French": {
        "Phrases": [
            "Bonjour", "Bonsoir", "Merci", "S'il vous plaît", "Comment ça va?", "Je m'appelle...", "Enchanté",
        ],
        "Travel": [
            "Combien ça coûte?", "J'ai besoin d'aide", "Une table pour deux, s'il vous plaît", "L'addition, s'il vous plaît", "Parlez-vous anglais?",
        ],
    },
}


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(exc):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    db = get_db()
    db.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            display_name TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            language TEXT NOT NULL,
            skill TEXT NOT NULL,
            completed INTEGER NOT NULL DEFAULT 0,
            UNIQUE(user_id, language, skill),
            FOREIGN KEY(user_id) REFERENCES users(id)
        );
        """
    )
    db.commit()


@app.before_request
def ensure_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    init_db()


def current_user():
    user_id = session.get("user_id")
    if not user_id:
        return None
    user = get_db().execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    return user


def login_required(func):
    from functools import wraps

    @wraps(func)
    def wrapper(*args, **kwargs):
        if not current_user():
            return redirect(url_for("login"))
        return func(*args, **kwargs)

    return wrapper


@app.route("/")
def home():
    user = current_user()
    return render_template("home.html", user=user, languages=LANGUAGES)


@app.route("/register", methods=["GET", "POST"])
def register():
    error = None
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        display_name = request.form.get("display_name", "").strip()
        password = request.form.get("password", "")
        if not email or not password or not display_name:
            error = "All fields are required."
        else:
            db = get_db()
            try:
                db.execute(
                    "INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)",
                    (email, generate_password_hash(password), display_name),
                )
                db.commit()
                return redirect(url_for("login"))
            except sqlite3.IntegrityError:
                error = "An account with that email already exists."
    return render_template("register.html", error=error)


@app.route("/login", methods=["GET", "POST"])
def login():
    error = None
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        user = get_db().execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        if user and check_password_hash(user["password_hash"], password):
            session["user_id"] = user["id"]
            return redirect(url_for("dashboard"))
        error = "Invalid credentials."
    return render_template("login.html", error=error)


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("home"))


@app.route("/dashboard")
@login_required
def dashboard():
    user = current_user()
    db = get_db()
    progress_rows = db.execute(
        "SELECT language, skill, completed FROM progress WHERE user_id = ?",
        (user["id"],),
    ).fetchall()
    progress = {(row["language"], row["skill"]): row["completed"] for row in progress_rows}
    return render_template("dashboard.html", user=user, languages=LANGUAGES, progress=progress)


@app.route("/lesson/<language>/<skill>")
@login_required
def lesson(language: str, skill: str):
    if language not in LANGUAGES or skill not in LANGUAGES[language]:
        return redirect(url_for("dashboard"))
    phrases = LANGUAGES[language][skill]
    user = current_user()
    db = get_db()
    db.execute(
        "INSERT OR IGNORE INTO progress (user_id, language, skill, completed) VALUES (?, ?, ?, 0)",
        (user["id"], language, skill),
    )
    db.commit()
    return render_template("lesson.html", language=language, skill=skill, phrases=phrases)


@app.route("/complete/<language>/<skill>", methods=["POST"])
@login_required
def complete_skill(language: str, skill: str):
    db = get_db()
    user = current_user()
    db.execute(
        "UPDATE progress SET completed = 1 WHERE user_id = ? AND language = ? AND skill = ?",
        (user["id"], language, skill),
    )
    db.commit()
    return redirect(url_for("dashboard"))


@app.route("/practice")
@login_required
def practice():
    user = current_user()
    db = get_db()
    row = db.execute(
        "SELECT language, skill FROM progress WHERE user_id = ? AND completed = 0 ORDER BY id LIMIT 1",
        (user["id"],),
    ).fetchone()
    upcoming = (row["language"], row["skill"]) if row else None
    return render_template("practice.html", upcoming=upcoming)


if __name__ == "__main__":
    app.run(debug=True)
