# Knowledge Base Data Model

Five JSON libraries live under data/.

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

## Libraries
1. Progression Library — scale-degree patterns, reference-key examples, harmonic rhythm and section use.
2. Harmony Technique Library — prerequisites, transformation, before/after example, voice-leading notes and risks.
3. Style & Mood Library — descriptive traits and associations; these are tendencies, not rules.
4. Arrangement Library — track role, rhythmic grid, onset/duration patterns and genre context.
5. Composition Rules — constraints, priorities, resolution and variation rules.

## Provenance and updates
- Never present AI-generated interpretations as source facts.
- Preserve exact source URLs and author attribution.
- Store paraphrases, not large copyrighted passages.
- New sources enter as proposed records with review_status pending; pending records are visible in the app but excluded from LLM context.
- Conflicting entries coexist with a conflict note until human review.
- Updates are additive and versioned; never silently overwrite existing records.
- Store last-reviewed and source-access dates.
- The app displays source links and allows text search across records.
