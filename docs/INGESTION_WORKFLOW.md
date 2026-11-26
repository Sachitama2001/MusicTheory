# Knowledge Ingestion Workflow

## Purpose
Allow ChatGPT or another LLM to extract musical concepts from new human-authored sources while keeping existing records consistent and traceable.

## Required source packet
For every new source, collect:
- exact URL and page title
- author / organization
- publication date and access date (if visible)
- source type: book, lesson, article, video, academic paper, user-contributed transcription
- relevant concepts and a short paraphrase
- exact musical examples only when redistribution is permitted
- usage / licensing notes
- extraction confidence and reviewer

## Staging process
1. Fetch the exact source page. Do not infer details from a search snippet alone.
2. Identify whether the page is human-authored, academic, user-generated or AI-generated. If unknown, mark unknown.
3. Extract one concept per proposed record.
4. Map it to one of the five libraries:
   - Progression Library
   - Harmony Technique Library
   - Style & Mood Library
   - Arrangement Library
   - Composition Rules
5. Search existing records by normalized name, aliases, tags and example before creating a new record.
6. If the concept already exists, propose an additive source reference or correction rather than creating a duplicate.
7. If two sources disagree, preserve both claims and add a conflict record. Do not silently choose one.
8. Save the proposed record under `data/proposals/`, grouped by its target library, with `review_status = pending`. Proposals are not loaded by the app.
9. Human reviewer checks theory, spelling, examples, source attribution and licensing.
10. Only after approval, move the record into the canonical JSON file and update this registry.
11. Rebuild `data/ai-index.json` from all five canonical libraries. Each normalized card must include the source record ID, library, concept kind, keywords, applicable tracks, use case, operations, examples, constraints and provenance. Do not copy a pending record into the index.

## Required record provenance
Each canonical record should include:
- id
- name
- summary
- tags
- source.title
- source.author
- source.url
- source.accessed
- evidence_type
- confidence
- notes
- review_status

## Consistency rules
- Keep source claims distinct from project-specific heuristics.
- Do not generalize a genre association from one song or one tutorial into a universal rule.
- Store scale-degree patterns separately from key-specific chord spellings.
- Normalize enharmonic spellings only as a secondary field; preserve source spelling.
- For progression records, store harmonic rhythm and section context when known.
- For rhythm records, store grid, swing ratio, note onset pattern, duration, rests and track role.
- Never let an LLM overwrite a user-approved record without a proposed diff and human approval.

## Copyright and licensing
- Public web access is not permission to copy or redistribute.
- Prefer concise paraphrases and bibliographic metadata.
- Do not ingest full lyrics, full articles, sheet music or proprietary MIDI.
- Link to the original source.
- For downloadable MIDI/PDF, record the license and intended use before bundling it.

## ChordTube interoperability
- Store progressions as Roman numerals plus normalized chord symbols and key.
- Generate search queries from chord sequence strings only after user approval.
- Treat ChordTube as an external search destination until a documented API is verified.
- Do not scrape or automate access contrary to its terms.
