const TRACK_NAMES = ["Bass", "Drums", "Pad"];
const DRUM_PITCHES = [36, 38, 42];
const EPSILON = 1e-6;
export const LIBRARIES = ["progressions", "harmony-techniques", "style-moods", "arrangements", "composition-rules"];

const object = properties => ({
  type: "object", properties, required: Object.keys(properties), additionalProperties: false
});
const array = items => ({type: "array", items});
const string = {type: "string"};
export const candidateSchema = object({
  candidates: array(object({
    name: string,
    summary: string,
    sources: array(string),
    tracks: array(object({
      name: {...string, enum: TRACK_NAMES},
      notes: array(object({
        pitch: {type: "integer"}, start: {type: "number"},
        duration: {type: "number"}, velocity: {type: "number"}
      }))
    }))
  }))
});

export function parseCandidates(input, {tracks, bars, beatsPerBar, rhythmOnly, mode}) {
  const editMode = mode || (rhythmOnly ? "rhythm" : "harmony");
  const legacy = input && !Object.hasOwn(input, "candidates") && Array.isArray(input.tracks);
  const candidates = legacy ? [{name: "Imported candidate", summary: "", sources: [], tracks: input.tracks}] : input?.candidates;
  if (!Array.isArray(candidates) || candidates.length < 1 || candidates.length > 2) {
    throw new Error("Provide one or two candidates in a candidates array.");
  }
  return candidates.map((candidate, index) => {
    const label = `Candidate ${index + 1}`;
    if (!candidate || typeof candidate.name !== "string" || !candidate.name.trim() ||
        typeof candidate.summary !== "string" || !Array.isArray(candidate.sources) ||
        !candidate.sources.every(id => typeof id === "string" && id.trim())) {
      throw new Error(`${label}: include a name, summary and array of source IDs.`);
    }
    if (!Array.isArray(candidate.tracks) || candidate.tracks.length < 1 ||
        candidate.tracks.length > 3 || (!legacy && candidate.tracks.length !== 3)) {
      throw new Error(`${label}: include Bass, Drums and Pad exactly once.`);
    }
    const result = {...tracks};
    const seen = new Set();
    for (const track of candidate.tracks) {
      const name = typeof track?.name === "string" && TRACK_NAMES.find(n => n.toLowerCase() === track.name.toLowerCase());
      if (!name || seen.has(name) || !Array.isArray(track.notes) || track.notes.length > 1024) {
        throw new Error(`${label}: use distinct Bass, Drums or Pad tracks, each with up to 1024 notes.`);
      }
      seen.add(name);
      result[name.toLowerCase()] = track.notes.map((note, i) => {
        if (!note || typeof note !== "object") throw new Error(`${label}: invalid ${name} note ${i + 1}.`);
        const {pitch, start, duration, velocity = legacy ? 0.7 : undefined} = note;
        if (!Number.isInteger(pitch) || pitch < 0 || pitch > 127 ||
            (name === "Drums" && !DRUM_PITCHES.includes(pitch)) ||
            !Number.isFinite(start) || start < 0 || start >= bars * beatsPerBar ||
            !Number.isFinite(duration) || duration <= 0 || start + duration > bars * beatsPerBar + EPSILON ||
            !Number.isFinite(velocity) || velocity < 0 || velocity > 1) {
          throw new Error(`${label}: invalid ${name} note ${i + 1} (pitch, time or velocity).`);
        }
        return {pitch, start, duration, velocity};
      });
    }
    const bass = [...result.bass].sort((a, b) => a.start - b.start);
    if (bass.some((note, i) => i && bass[i - 1].start + bass[i - 1].duration > note.start + EPSILON)) {
      throw new Error(`${label}: Bass notes must not overlap.`);
    }
    if (editMode === "harmony" && eventFingerprint(result.drums) !== eventFingerprint(tracks.drums)) {
      throw new Error(label + ": harmony edits must leave the Drums track unchanged.");
    }
    if (editMode === "rhythm") {
      validateRhythmOnly(result, tracks, {bars, beatsPerBar}, label);
    }
    return {...candidate, tracks: result};
  });
}

function validateRhythmOnly(candidateTracks, originalTracks, {bars, beatsPerBar}, label) {
  for (const name of Object.keys(candidateTracks)) {
    const source = originalTracks[name] || [];
    const candidate = candidateTracks[name] || [];
    const sourceByBar = Array.from({length: bars}, () => new Set());
    for (const note of source) {
      const bar = Math.floor(note.start / beatsPerBar);
      if (bar >= 0 && bar < bars) sourceByBar[bar].add(note.pitch);
    }
    const allowedDrumPitches = new Set(DRUM_PITCHES);
    for (const note of candidate) {
      const bar = Math.floor(note.start / beatsPerBar);
      if (bar < 0 || bar >= bars || note.start + note.duration > (bar + 1) * beatsPerBar + EPSILON) {
        throw new Error(label + ": " + name + " notes must stay inside their original bar.");
      }
      if (name === "drums") {
        if (!allowedDrumPitches.has(note.pitch)) {
          throw new Error(label + ": rhythm edits may use only GM kick, snare and closed hi-hat pitches.");
        }
      } else if (!sourceByBar[bar].has(note.pitch)) {
        throw new Error(label + ": " + name + " may only reuse pitches already present in the same bar.");
      }
    }
  }
}

function eventFingerprint(notes) {
  return JSON.stringify([...notes].map(({pitch, start, duration, velocity}) => ({pitch, start, duration, velocity})).sort((a, b) => a.start - b.start || a.pitch - b.pitch || a.duration - b.duration || a.velocity - b.velocity));
}
