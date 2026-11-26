# ChatGPT / LLM Workflow

## Safe first version
The browser app does not contain an API key and does not call an LLM directly. It creates a prompt containing project settings and relevant local database excerpts. The user sends that prompt to ChatGPT, then pastes the returned JSON into the app.

## Assistant responsibilities
1. Parse the request into musical constraints.
2. Retrieve relevant records from the five local libraries.
3. Separate source-backed theory from creative suggestions.
4. Generate Bass, Drums and Pad only.
5. Respect key, scale, BPM, meter and maximum 16 bars.
6. Offer at least two candidates when practical.
7. For rhythm-only edits, preserve pitches and harmony; change onset and duration only unless asked otherwise.
8. Never silently change tempo, meter, key or progression.
9. Return JSON and cite matching knowledge record IDs.

## JSON format
    {
      "version": 1,
      "project": {
        "key": "C",
        "scale": "major",
        "bpm": 140,
        "meter": [4, 4],
        "bars": 8
      },
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

Start and duration are in quarter-note beats from the start. Pitch is MIDI note number. Velocity is 0–1. Drums use GM kick 36, snare 38 and closed hi-hat 42.

## Rhythm-only transformation contract
Input: existing note events and target style / groove.
Output: same track names and same pitch material, with changed onset positions and durations. Must:
- retain BPM and meter
- stay within the bar range
- preserve bass pitch identity and pad chord membership
- preserve drum pitch identity
- explain rhythmic changes
- provide subtle and stronger variants when practical

## Harmony suggestion contract
Suggestions may replace a chord, alter voicing/inversion, or insert a passing chord. Explain expected color and voice-leading effect. Always show the original progression. Do not overwrite user work without explicit apply action.
