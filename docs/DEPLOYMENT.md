# Deployment

The app is a static site. It can run locally with:

    python -m http.server 8000

Open http://localhost:8000.

## GitHub Pages
1. Open repository Settings → Pages.
2. Set Build and deployment source to GitHub Actions.
3. Push to main (or run the Deploy MusicTheory Sketchpad workflow manually).
4. Open the Pages URL shown in the workflow deployment.

The browser imports @tonejs/midi from esm.sh. Internet access is required for that dependency. The app's knowledge JSON is fetched from the repository's data/ directory.

## Data and privacy
- Drafts are saved in localStorage in the current browser.
- MIDI files are imported locally and exported locally.
- The app does not upload MIDI or audio to a server.
- The ChatGPT prompt builder copies local project state and knowledge excerpts into a text prompt; the user chooses whether to send it to an LLM.
- Do not put API keys in index.html or any client-side JavaScript.
