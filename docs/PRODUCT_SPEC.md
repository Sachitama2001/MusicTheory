# Product Specification

## Product intent
MusicTheory is a lightweight composition sketchpad, not a replacement for a production DAW. It turns a textual idea into a short editable MIDI draft, lets the user audition and adjust it, then exports MIDI for a local DAW.

## MVP constraints
- Maximum 16 bars.
- Exactly three tracks: Bass, Drums, Pad.
- Bass: monophonic notes.
- Drums: kick, snare, hi-hat only (GM pitches 36, 38, 42).
- Pad: chord tones / block chords.
- Simple preview synthesis only; no high-fidelity sound design.
- MIDI import/export and browser playback.
- Note creation, deletion, movement and range selection.
- Key, scale, BPM, meter and Roman-numeral progression controls.
- Harmony and rhythm are separate arrangement categories.
- First rhythm milestone: transform sustained/simple MIDI into style-selectable grooves while preserving the pitch vocabulary within each bar. Riddim is one optional profile among several, not the app's default focus.

## Visual design
Inspired by the supplied reference: key, 12-note circle of fifths, tempo, meter, progression and piano-roll note editor. Color distinguishes tonic, tonic-triad tones, other scale tones and chromatic notes. The center summarizes the selected scale's characteristic intervals; these are listening tendencies, not deterministic mood labels. Exclude waveform, loudness, spectrum, vector-scope, stem analysis and mastering panels.

## Milestones
### M0 — Browser sketchpad
Static app, scale-aware Roman numeral progression, three MIDI tracks, preview playback, MIDI import/export.

### M1 — Arrangement suggestions
Harmony: voicing alternatives, chord substitution and passing chords.
Rhythm: timing and articulation transformations that may add, re-trigger or omit note events while preserving the original pitch vocabulary.
With the local API, apply the first valid candidate automatically, retain the original for undo, and allow the user to switch to another returned candidate. Harmony edits must leave Drums unchanged; rhythm-only edits preserve all pitches and velocities.

### M2 — Groove engine
Input sustained or repetitive Bass / Drums / Pad MIDI. Offer selectable rhythm directions such as straight pop, shuffle, half-time, breakbeat, funk, math-rock and Riddim. Allow note re-triggers, additions and omissions. Preserve the pitch vocabulary within each bar, track identity, tempo, meter and bar boundaries. Compare subtle and stronger candidates.

### M3 — Knowledge ingestion
Store source metadata, author, publication date, URL, concepts, paraphrase and licensing notes. Require human review before merging updates. Preserve provenance and conflicts.

## Non-goals
Full DAW, audio recording, mixing, mastering, plugin hosting, high-quality synthesis, more than three tracks, more than 16 bars, automatic cloud LLM calls with a client-side secret.
