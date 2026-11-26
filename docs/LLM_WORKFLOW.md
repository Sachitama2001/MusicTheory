# ChatGPT / LLM Workflow

## In-app local API
When the app is served by `node server.mjs` with `OPENAI_API_KEY` set, the user may enter a harmony instruction, a rhythm instruction, or both at once:

- Harmony only: change Pad chord pitches/voicings and Bass notes when needed; preserve Drum events and timing.
- Rhythm only: change timing and articulation. Note count may increase or decrease; notes may be re-triggered, split or omitted. Bass / Pad may only reuse pitches already present in the same bar. Drums may use GM kick/snare/closed hi-hat. Velocity may vary modestly for accents.
- Combined: apply harmony first conceptually, then arrange rhythm around the new notes. Both the harmonic content and event density may change.
- All modes preserve BPM, meter, bar count and track identities unless the user explicitly requests otherwise.

The browser sends both instruction fields, current MIDI events, project settings and a ranked subset of normalized AI cards from `data/ai-index.json` to the loopback-only Node server. The server calls the OpenAI Responses API with Structured Outputs and `store: false`. The API key is never sent to the browser.

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
7. For rhythm-only edits, allow note count changes, re-triggers and omissions. Preserve Bass / Pad pitch vocabulary per bar; use standard GM drum types; velocity may vary modestly.
8. For combined edits, apply both requests coherently rather than enforcing either single-mode preservation rule.
8. For harmony edits, preserve all Drum events and do not silently change project settings.
9. Cite only record IDs present in the supplied knowledge excerpts.
10. Do not treat genre/mood associations as deterministic rules.

## JSON format

    {
      "candidates": [
        {
          "name": "シャッフル・フロウ",
          "summary": "Short explanation of the rhythmic change.",
          "sources": ["ARR-SHUFFLE-001"],
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

## Combined transformation contract
- Apply requested harmony changes to Pad / Bass first conceptually.
- Then design rhythmic articulation around the changed chord tones and bass notes.
- Drums may change; use only GM kick 36, snare 38 and closed hi-hat 42.
- Preserve tempo, meter, bar count and track roles.

## Rhythm-only transformation contract
- Retain BPM, meter and bar count.
- Do not preserve note count; add or omit repeated attacks when the groove requires it.
- Preserve pitch vocabulary per bar for Bass and Pad; every generated pitch must already exist in that bar.
- Reuse only existing drum note types; note count may change.
- Velocity may vary modestly for accents.
- Keep notes in their original bars.
- Pad may re-articulate or omit existing chord tones, but must not introduce pitches absent from the original bar.
- Use GM kick 36, snare 38 and closed hi-hat 42.
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
