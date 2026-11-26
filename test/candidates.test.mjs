import assert from "node:assert/strict";
import test from "node:test";
import {parseCandidates} from "../candidates.mjs";

const note = (pitch, start, duration = 0.5) => ({pitch, start, duration, velocity: 0.75});
const original = {
  bass: [note(36, 0), note(38, 3.5)],
  drums: [note(38, 1)],
  pad: [note(60, 0), note(64, 0), note(62, 3.5), note(65, 3.5)]
};
const current = {tracks: original, bars: 4, beatsPerBar: 3.5, rhythmOnly: true};

function wrap({bass = original.bass, drums = original.drums, pad = original.pad} = {}) {
  return {candidates: [{
    name: "Offbeat", summary: "Shorter notes after the beat", sources: ["ARR-RID-001"],
    tracks: [{name: "Bass", notes: bass}, {name: "Drums", notes: drums}, {name: "Pad", notes: pad}]
  }]};
}

test("a rhythm-only candidate can move notes without mutating the draft", () => {
  const shifted = [note(36, 0.5, 0.25), note(38, 4, 0.25)];
  const raw = wrap({bass: shifted, pad: [note(60, 1.5), note(64, 1.5), note(62, 4), note(65, 4)]});
  const candidates = parseCandidates(raw, current);
  assert.deepEqual(candidates[0].tracks.bass, shifted);
  assert.equal(original.bass[0].start, 0);
});

test("rhythm-only edits may add or remove repeated notes while preserving pitches per bar", () => {
  const expanded = wrap({
    bass: [note(36, 0, 0.25), note(36, 0.5, 0.25), note(36, 1.5, 0.25), note(38, 3.5, 0.25)],
    drums: [note(38, 0.5, 0.1), note(38, 1.5, 0.1), note(38, 3, 0.1)],
    pad: [note(60, 0, 0.25), note(64, 0, 0.25), note(60, 1, 0.25), note(64, 1, 0.25), note(62, 3.5, 0.25)]
  });
  const [candidate] = parseCandidates(expanded, current);
  assert.equal(candidate.tracks.bass.length, 4);
  assert.equal(candidate.tracks.drums.length, 3);
  assert.equal(candidate.tracks.pad.length, 5);
  assert.equal(candidate.tracks.bass[0].velocity, 0.75);
});

test("rhythm-only edits reject new pitches and notes crossing a barline", () => {
  assert.throws(() => parseCandidates(wrap({bass: [note(40, 0)]}), current), /reuse pitches already present/);
  assert.throws(() => parseCandidates(wrap({drums: [note(36, 0)]}), current), /reuse existing Drum note types/);
  assert.throws(() => parseCandidates(wrap({bass: [note(36, 3.25, 0.5)]}), current), /stay inside their original bar/);
});
test("rejects out-of-range, unsupported and overlapping notes before review", () => {
  const general = {...current, rhythmOnly: false};
  assert.throws(() => parseCandidates(wrap({drums: [note(42, 13.75)]}), general), /invalid Drums note/);
  assert.throws(() => parseCandidates(wrap({drums: [note(46, 1)]}), general), /invalid Drums note/);
  assert.throws(() => parseCandidates(wrap({bass: [note(36, 0, 2), note(38, 1)]}), general), /must not overlap/);
  const duplicate = wrap();
  duplicate.candidates[0].tracks[2].name = "Bass";
  assert.throws(() => parseCandidates(duplicate, general), /distinct Bass, Drums or Pad/);
});

test("a legacy partial import only replaces the named track", () => {
  const raw = {version: 1, tracks: [{name: "bass", notes: [{pitch: 40, start: 0, duration: 1}]}]};
  const [candidate] = parseCandidates(raw, {...current, rhythmOnly: false});
  assert.deepEqual(candidate.tracks.bass, [{pitch: 40, start: 0, duration: 1, velocity: 0.7}]);
  assert.deepEqual(candidate.tracks.pad, original.pad);
});

test("harmony candidates may change Pad and Bass but must preserve the Drum arrangement", () => {
  const harmony = {...current, rhythmOnly: false};
  const pad = [note(60, 0), note(65, 0), note(62, 3.5), note(67, 3.5)];
  const [candidate] = parseCandidates(wrap({pad}), harmony);
  assert.deepEqual(candidate.tracks.pad, pad);
  assert.deepEqual(candidate.tracks.drums, original.drums);
  assert.throws(() => parseCandidates(wrap({drums: [note(36, 0)]}), harmony), /Drums track unchanged/);
});
