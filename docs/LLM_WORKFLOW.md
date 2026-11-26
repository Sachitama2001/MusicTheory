# ChatGPT / LLM Workflow

## In-app local API
When the app is served by `node server.mjs` with `OPENAI_API_KEY` set, the user enters a request on the page and chooses one of two edit categories:

- `harmony`: change Pad chord pitches/voicings and Bass notes when needed. The Drum events are immutable.
- `rhythm`: change timing and articulation. Note count may increase or decrease; notes may be re-triggered, split or omitted. Bass / Pad may only reuse pitches already present in the same bar. Drums may only reuse existing drum note types. Velocity may vary modestly for accents. Preserve tempo, meter, bar boundaries and track roles.

The browser sends the prompt, current MIDI events, project settings and approved local knowledge records to the loopback-only Node server. The server calls the OpenAI Responses API with Structured Outputs and `store: false`. The API key is never sent to the browser.

The first valid candidate is applied automatically. The original arrangement is retained for undo. If the model returns a second candidate, the user can select and apply it. The candidate validator checks track names, note ranges, overlaps, bar boundaries and category-specific preservation rules.

The default model is `gpt-6-luna`; set `OPENAI_MODEL` to another Responses API model with Structured Outputs support when needed.

## Static / manual fallback
GitHub Pages cannot run the local Node API or protect an OpenAI API key. On the static site, use the collapsed manual workflow:
1. Build the ChatGPT brief.
2. Send it to ChatGPT.
3. Paste the returned JSON into the app.
4. Review and apply the candidate.

## Assistant responsibilities
1. Parse the request into musical constraints.
2. Retrieve only approved records from the five local libraries.
3. Separate source-backed theory from project heuristics.
4. Generate Bass, Drums and Pad only.
5. Respect key, scale, BPM, meter and maximum 16 bars.
6. Offer up to two candidates when practical.
7. For rhythm-only edits, allow note count changes, re-triggers and omissions. Preserve pitch vocabulary per bar and existing drum note types; velocity may vary modestly.
8. For harmony edits, preserve all Drum events and do not silently change project settings.
9. Cite only record IDs present in the supplied knowledge excerpts.
10. Do not treat genre/mood associations as deterministic rules.

## JSON format

    {
      "candidates": [
        {
          "name": "シャッフル・フロウ",
          "summary": "Short explanation of the rhythmic change.",
          "sources": ["ARR-RID-001"],
          "tracks": [
            {
              "name": "Bass",
              "notes": [
                {"pitch": 36, "start": 0, "duration": 1.5, "velocity": 0.78}
              ]
            },
            {
              "name": "Drums",
              "notes": [
                {"pitch": 36, "start": 0, "duration": 0.2, "velocity": 0.9},
                {"pitch": 42, "start": 0.5, "duration": 0.1, "velocity": 0.45}
              ]
            },
            {
              "name": "Pad",
              "notes": [
                {"pitch": 60, "start": 0, "duration": 4, "velocity": 0.5}
              ]
            }
          ]
        }
      ]
    }

Start and duration are in quarter-note beats from the start. Pitch is MIDI note number. Velocity is 0–1. Drums use GM kick 36, snare 38 and closed hi-hat 42.

## Rhythm-only transformation contract
- Retain BPM, meter and bar count.
- Do not preserve note count; add or omit repeated attacks when the groove requires it.
- Preserve pitch vocabulary per bar for Bass and Pad; every generated pitch must already exist in that bar.
- Reuse only existing drum note types; note count may change.
- Velocity may vary modestly for accents.
- Keep notes in their original bars.
- Pad may re-articulate or omit existing chord tones, but must not introduce pitches absent from the original bar.
- Preserve kick/snare/hi-hat identities.
- Explain the rhythmic changes.
- Prefer subtle and stronger alternatives when practical.

## Harmony suggestion contract
- Keep Drum events exactly unchanged.
- Preserve the current tempo, meter, key, scale and bar count.
- May alter Pad voicings, chord tones and Bass notes to support the harmony.
- May replace a chord or insert a passing chord.
- Explain expected color and voice-leading effect.
- Cite relevant knowledge-base IDs.
- Always show the original progression alongside the candidate.
- Do not overwrite user work without the explicit AI apply action.
