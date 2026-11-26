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
- Initial rhythm transformation: Riddim-inspired flow for sustained/simple MIDI patterns, preserving pitch material
- Prompt builder that packages user intent and local database excerpts for ChatGPT; JSON response import

## Run locally

Because the app loads JSON files and an ES module, serve the repository over HTTP rather than opening `index.html` directly.

```bash
python -m http.server 8000
```

Open http://localhost:8000.

The app uses the browser MIDI parser/writer library `@tonejs/midi` from esm.sh. No API key is required for local editing, playback, or MIDI export.

## GitHub Pages

Enable GitHub Pages in repository Settings → Pages → Deploy from a branch → `main` → `/ (root)`.

## LLM workflow

The first version does not call an LLM directly from the browser. Use **Build ChatGPT brief** to create a prompt containing the selected musical settings and relevant local knowledge-base records. Ask ChatGPT to return the documented JSON composition format, then paste that JSON into **Import AI JSON**. This avoids exposing an API key in client-side code.

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

The initial Riddim groove transformation is a heuristic starter, not a claim to model every Riddim subgenre. The knowledge base records source URLs and distinguishes sourced theory from project-specific interpretation.

## License

No license has been added yet. Add one before redistributing the project or its bundled data.
