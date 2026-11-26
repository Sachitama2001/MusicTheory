# MusicTheory

A lightweight browser-based composition sketchpad for creating editable 3-track MIDI drafts.

## Product scope

- Up to 16 bars, configurable key, scale, BPM and time signature
- Roman-numeral progression editing and circle-of-fifths key navigation
- Three tracks only: Bass (monophonic), Drums (kick / snare / hi-hat), Pad (chords)
- In-browser preview playback using simple synthesized sounds
- Note selection, add, delete and move
- MIDI import/export
- Harmony suggestions from a curated local knowledge base
- Riddim-inspired timing suggestions that preserve pitches and Pad chord groups
- Compare and audition AI candidates before applying; restore the pre-apply draft
- Manual prompt/JSON workflow on GitHub Pages; optional local OpenAI API generation

## Run locally

Because the app loads JSON files and an ES module, serve the repository over HTTP rather than opening `index.html` directly.

```bash
python -m http.server 8000 --bind 127.0.0.1
```

Open http://127.0.0.1:8000. To use the optional OpenAI API instead, set `OPENAI_API_KEY` in your terminal environment and run:

```bash
node server.mjs
```

Node.js 22 or newer is recommended. Open http://127.0.0.1:8000 and choose **Generate with OpenAI**. Do not put the key in the browser or commit it. This button sends the request, current arrangement and local knowledge records to OpenAI; API charges may apply.

The app uses the browser MIDI parser/writer library `@tonejs/midi` from esm.sh. No API key is required for local editing, playback, or MIDI export.

## GitHub Pages

The [published app](https://sachitama2001.github.io/MusicTheory/) uses the manual ChatGPT workflow. Use **GitHub Actions** as the Pages source (see [deployment](docs/DEPLOYMENT.md)).

## LLM workflow

Use **Build ChatGPT brief** and paste it into ChatGPT, then paste the reply into **Load AI JSON**. With the local API server, **Generate with OpenAI** loads candidates directly. In both modes, preview the original and each candidate before using **Apply candidate**.

See:
- `docs/PRODUCT_SPEC.md`
- `docs/LLM_WORKFLOW.md`
- `docs/DATA_MODEL.md`
- `docs/SOURCES.md`

## Knowledge-base hierarchy

1. Progression Library
2. Harmony Technique Library
3. Style & Mood Library
4. Arrangement Library
5. Composition Rules

The Riddim suggestions are heuristics, not a claim to model every Riddim subgenre. The knowledge base distinguishes sourced theory from project-specific interpretations. Records in [data/proposals](data/proposals/) are pending human review and are not used by the app.

## License

No license has been added yet. Add one before redistributing the project or its bundled data.
