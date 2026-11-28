from pathlib import Path
import re

from flask import Flask, abort, send_from_directory


BASE_DIR = Path(__file__).resolve().parent
app = Flask(__name__, static_folder=None)


@app.get("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")


@app.get("/<path:filename>")
def site_file(filename):
    if filename in {"styles.css", "fireworks.css", "script.js"}:
        return send_from_directory(BASE_DIR, filename)

    if re.fullmatch(r"assets/photos/memory-\d{2}\.jpg", filename):
        return send_from_directory(BASE_DIR / "assets" / "photos", filename.rsplit("/", 1)[-1])

    if re.fullmatch(r"assets/music/[A-Za-z0-9][A-Za-z0-9._-]*\.(mp3|ogg|wav|m4a)", filename, re.IGNORECASE):
        return send_from_directory(BASE_DIR / "assets" / "music", filename.rsplit("/", 1)[-1])

    abort(404)


if __name__ == "__main__":
    app.run(debug=False)
