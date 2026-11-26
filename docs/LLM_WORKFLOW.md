# ChatGPT / LLM Workflow

## Generate, compare and apply

- **Manual (including GitHub Pages):** Use **Build ChatGPT brief**, send it to ChatGPT, then paste the returned JSON into **Load AI JSON**. No API key is needed in the sketchpad.
- **Local API:** Start the [local server](DEPLOYMENT.md#local-openai-api) with `OPENAI_API_KEY`, enter a request and choose **Generate with OpenAI**. The API response loads into the same candidate review.
- **Review:** Choose a candidate, read its summary and source IDs, and use **Preview original** and **Preview candidate** to compare. Neither preview changes the draft.
- **Apply:** Use **Apply candidate** to replace the notes without changing the project settings. **Restore pre-AI draft** returns to the draft saved before the last application, including after reloading the page. Confirming restore replaces later edits.

If the draft or its settings change after generating a brief or candidates, generate again for the updated draft.

## Candidate JSON

Return one JSON object without prose or a Markdown fence. Use two distinct candidates when practical; one is also supported. Each candidate has a short `summary`, relevant knowledge record IDs in `sources` (or an empty array), and exactly one Bass, Drums and Pad track. Use empty `notes` for intentionally silent tracks.

```json
{
  "candidates": [
    {
      "name": "Short bass and sustained pad",
      "summary": "Leave space after the downbeat bass note while the pad sustains.",
      "sources": ["ARR-POP-001"],
      "tracks": [
        {"name": "Bass", "notes": [{"pitch": 36, "start": 0, "duration": 1.5, "velocity": 0.78}]},
        {"name": "Drums", "notes": [{"pitch": 36, "start": 0, "duration": 0.2, "velocity": 0.9}]},
        {"name": "Pad", "notes": [
          {"pitch": 60, "start": 0, "duration": 3, "velocity": 0.5},
          {"pitch": 64, "start": 0, "duration": 3, "velocity": 0.5},
          {"pitch": 67, "start": 0, "duration": 3, "velocity": 0.5}
        ]}
      ]
    }
  ]
}
```

`start` and `duration` are in quarter-note beats from the start; a 7/8 bar is 3.5 units. Keep notes in the current project range (up to 16 bars), use MIDI pitches 0–127 and velocity 0–1. Bass notes must not overlap. Drums use only GM kick (36), snare (38) and closed hi-hat (42). A legacy `{ "tracks": [...] }` / version 1 object can also be loaded as one candidate; omitted tracks and current project settings are retained.

## Rhythm and harmony contracts

**Rhythm only** changes onsets and durations, not note counts, pitches or velocities. Each note stays within the bar in which it originally started. Pad chord tones keep a common onset and the chord groups stay in order. **Try Riddim flow** prepares a rhythm-only brief for half-time and triplet-shuffle options; it does not mutate notes or call the API.

Harmony candidates may alter pitches, voicings or insert passing chords. Explain the musical effect and distinguish sourced theory from creative suggestions.
