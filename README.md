# Love Surprise Website

A romantic, responsive surprise website served locally with Python and Flask. The frontend remains plain HTML, CSS and JavaScript.

## Run locally with Flask

1. Open a terminal in the `love-surprise-site` folder.
2. Install Flask: `python -m pip install -r requirements.txt`
3. Start the website: `python app.py`
4. Open `http://127.0.0.1:5000` in your browser.

## Features

- Birthday scrapbook-style passcode screen with a numeric keypad.
- Automatic birthday reveal with colorful party lights, a banner, two dancing avatars, three drummers, and fireworks.
- Upload photos into scratch-to-reveal memory cards.
- Full-screen animated fireworks with continuous volleys of 120 rockets, glowing trails, crackling sparks, and oversized rainbow-colored bursts.
- Romantic message and responsive photo gallery with local image upload.
- Reduced-motion preference support.

## Deploy to Netlify

This is a static site; Netlify does not need to run Flask or a build command.

- For a manual deploy, upload the contents of this folder to Netlify.
- For a Git-connected deploy where the repository root is the parent folder, set the base directory to `love-surprise-site`. Leave the build command empty and use `.` as the publish directory. If this folder is the repository root, the settings in `netlify.toml` already specify the publish directory.

Keep `index.html`, `styles.css`, `fireworks.css`, and `script.js` together in the published directory. Flask is only used for local development.
"# Surprise" 
