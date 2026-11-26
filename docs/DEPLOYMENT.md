# Deployment

The app is a static site. It can run locally with:

    python -m http.server 8000 --bind 127.0.0.1

Open http://127.0.0.1:8000.

## GitHub Pages
1. Open repository Settings → Pages.
2. Set Build and deployment source to GitHub Actions.
3. Push to main (or run the Deploy MusicTheory Sketchpad workflow manually).
4. Open the [Pages site](https://sachitama2001.github.io/MusicTheory/) shown in the workflow deployment.

The workflow uploads the static app, its browser module and the canonical knowledge JSON. The local API server, tests and review proposals are not included. Pages supports only manual ChatGPT prompt copy and JSON import.

The browser imports @tonejs/midi from esm.sh. Internet access is required for that dependency. The app's knowledge JSON is fetched from the repository's data/ directory.

## Local OpenAI API
1. Install Node.js (22 or newer recommended) and set `OPENAI_API_KEY` in the terminal environment.
2. Run `node server.mjs` and open http://127.0.0.1:8000 instead of the Python server.
3. Enter a request and choose **Generate with OpenAI**. Without a key, the local app remains in manual mode.

The server listens only on loopback and accepts generation requests from the same origin. It uses the OpenAI Responses API, with `gpt-4.1-mini` by default. Set `OPENAI_MODEL` to another Responses model with Structured Outputs support if needed. Set `PORT` if 8000 is in use. Restart the server after changing its environment.

## Data and privacy
- Drafts and the previous pre-apply draft are stored in the current browser, separately for each origin. Export MIDI before moving between local and public URLs.
- MIDI files and audio stay in the browser. Only the API generation button sends a prompt containing project settings, note events, the request and canonical knowledge records to OpenAI.
- The Responses API request sets `store: false`. Standard API data handling and billing still apply. Keys stay in the server environment, never in browser storage or source files.
