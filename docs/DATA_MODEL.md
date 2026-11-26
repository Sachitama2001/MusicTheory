# Knowledge Base Data Model

Five canonical JSON libraries live under data/. A generated `data/ai-index.json` is a compact retrieval index, not a sixth theory library. It normalizes the five libraries into AI cards.

## Shared record fields
- id: stable identifier
- name: human-readable title
- summary: concise explanation
- tags: genre, mood, technique or use-case tags
- source: title, author/organization, URL, publication/update date and access date
- review_status: pending / approved / merged (optional)
- evidence_type: human-authored, academic, observed-example, project-original
- confidence: high, medium, low
- notes: limitations, caveats and licensing notes
- normalized AI card: `kind`, `keywords`, `applies_to`, `when_to_use`, `operations`, `example`, `constraints`, `provenance`

## Libraries
1. Progression Library — scale-degree patterns, reference-key examples, harmonic rhythm and section use.
2. Harmony Technique Library — prerequisites, transformation, before/after example, voice-leading notes and risks.
3. Style & Mood Library — descriptive traits and associations; these are tendencies, not rules.
4. Arrangement Library — track role, rhythmic grid, onset/duration patterns and genre context.
5. Composition Rules — constraints, priorities, resolution and variation rules.

## AI retrieval index
- `data/ai-index.json` is generated from the five canonical libraries; it stores IDs and compact paraphrased cards rather than replacing source records.
- Each card identifies its library and concept kind (progression pattern, harmony technique, rhythm pattern, style profile, composition rule, etc.).
- Retrieval filters by edit intent (harmony, rhythm, combined), tags, aliases and user wording, then sends only a small ranked subset to the model.
- Keep source URLs and evidence type on every card. Do not merge a project heuristic into a source-backed claim.

## Provenance and updates
- Never present AI-generated interpretations as source facts.
- Preserve exact source URLs and author attribution.
- Store paraphrases, not large copyrighted passages.
- New sources enter as proposed records with review_status pending; pending records are visible in the app but excluded from LLM context.
- Conflicting entries coexist with a conflict note until human review.
- Updates are additive and versioned; never silently overwrite existing records.
- Store last-reviewed and source-access dates.
- The app displays source links and allows text search across records.
