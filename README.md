# Love Surprise Website

A romantic, responsive surprise website served locally with Python and Flask. The frontend remains plain HTML, CSS and JavaScript.

## Run locally with Flask

1. Open a terminal in the `love-surprise-site` folder.
2. Install Flask: `python -m pip install -r requirements.txt`
3. Start the website: `python app.py`
4. Open `http://127.0.0.1:5000` in your browser.

## Features

- Birthday scrapbook-style passcode screen with a numeric keypad.
- Interactive envelope, the existing four-digit passcode, and a cinematic birthday reveal with lights, a banner, dancers, drummers, cake, candles, confetti, and fireworks.
- Long, responsive birthday story with a November 2026 calendar and live countdown to November 30.
- Three scrapbook-style photo chapters featuring all 11 supplied photos in `assets/photos/`, a full-screen photo viewer, and session-only photo uploads.
- A featured original scrapbook photo in the final birthday note, plus an in-page Telugu romantic song preview with a supplied-photo collage, volume control, and optional local song upload.
- An editable love letter, a local-file music player, an interactive candle wish, and a replayable final surprise.
- Reduced-motion support and keyboard-accessible controls.
- Full-screen animated fireworks with colorful rockets, glowing trails, and sparks.
- Reduced-motion preference support.

## Deploy to Netlify

This is a static site; Netlify does not need to run Flask or a build command.

- For a manual deploy, upload the contents of this folder to Netlify.
- For a Git-connected deploy where the repository root is the parent folder, set the base directory to `love-surprise-site`. Leave the build command empty and use `.` as the publish directory. If this folder is the repository root, the settings in `netlify.toml` already specify the publish directory.

Keep `index.html`, the CSS and JavaScript files, and the `assets/` directory together in the published directory. Flask is only used for local development. To use the music player, choose an MP3 you own or have permission to use in the page; you can also keep that audio file in `assets/music/` for the Flask-served version.
"# Surprise" 
