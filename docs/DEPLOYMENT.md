# Deployment

## Local app with automatic AI MIDI updates

1. Install Node.js 22 or newer.
2. Set `OPENAI_API_KEY` in your terminal environment.
3. Run:

       npm start

4. Open http://127.0.0.1:8000.

macOS / Linux:

    export OPENAI_API_KEY="your-api-key"
    npm start

Windows PowerShell:

    $env:OPENAI_API_KEY="your-api-key"
    npm start

The local server listens only on loopback. It keeps the API key on the server and accepts same-origin requests only. The default model is `gpt-6.2-astra`; set `OPENAI_MODEL` to another model with Responses API Structured Outputs support if needed. Set `PORT` if 8000 is occupied.

The page's **AIで生成して反映** button sends the prompt, current three-track MIDI, project settings and approved knowledge records to the local server. The first valid candidate is applied automatically. The original MIDI is kept for undo, and any additional candidate can be selected and applied.

OpenAI API usage is billed separately from a ChatGPT subscription. The server sends `store: false` in its Responses API request. Standard API data handling and billing still apply.

## GitHub Pages

1. Open repository Settings → Pages.
2. Set Build and deployment source to GitHub Actions.
3. Push to main or run the Deploy workflow.
4. Open https://sachitama2001.github.io/MusicTheory/.

GitHub Pages is static hosting. It cannot keep an OpenAI API key secret or run `server.mjs`. The published page therefore offers the manual prompt / JSON workflow only. For automatic AI updates, run the local Node server. A hosted automatic version would need a separately deployed serverless backend with a secret environment variable.

## Browser MIDI

The app imports `@tonejs/midi` from esm.sh. Internet access is required for that dependency. MIDI files and audio remain in the browser; the local API sends only the prompt and arrangement data when the AI button is used.

Drafts and the previous pre-AI draft are saved in localStorage separately for each origin. Export MIDI before moving between the local app and GitHub Pages.
