# Document extractions: design note

Status: for review, not built. Branch `feat/document-extractions`. Decisions from the grilling session on 2026-10-26.

## What it is

The Canon Agent reads supplier documents (SDS, COA, TDS, IFRA, spec sheets) and stores what they say in Lumexia as an **extraction**: facts with page, quote, method and confidence. Audits read the extraction instead of downloading and re-reading the file. Extractions are machine-made evidence, not canon. They never change canon, but a canon change request can cite them. Humans verify and override facts in the UI. The agent never can.

## Core rules

1. **One extraction per file content (sha256), not per document.** A document is an `ItemFile`, and several `ItemFile`s (and duplicate `File` uploads) can share the same content. They all show the same extraction.
2. **Replacing a document doesn't touch its extraction.** Replacement belongs to the `ItemFile` (`supersededAt`) and is reported as `documentReplaced`. An extraction is superseded only when the agent extracts the same content again.
3. **Document extraction status** is `missing | current | failed`. The spec's `stale` doesn't exist.
4. **"Extraction needed" is computed when read**, never emitted as an event: it means a current document whose content has no current extraction. There are no webhooks.
5. **Every agent write** goes through `lib/mcp/writes.ts` (rate limit, `idempotencyKey`, `dryRun` via rollback) and writes a `document_extraction_events` row.

## Schema (`prisma/subschemas/documents/`, edited by hand next to the subschema)

### `File` (changed)
- `sha256 String? @map("sha256")`, indexed, **not unique** (duplicate uploads exist). `storeUploadedFile` computes it for every new upload. For older files it's computed on demand: the first time an extraction is stored for one, the server reads the object from S3, hashes it and saves the result. There's no bulk backfill.

### `ItemFile` (changed): surrogates
- `surrogateForItemFileId String?`: the other item's document this one stands in for. It's backed by the **same `fileId`** (no copy).
- `surrogateReason String?`: required when `surrogateForItemFileId` is set.
- Not allowed on lot-scoped requirements (COA).
- Requirement evaluation adds `DocumentStatus` `"surrogate"`: it satisfies the requirement and shows amber. If the source document is superseded, the status becomes `"stale"`, the same way `derivedFrom` works.

### `DocumentExtraction` (`document_extractions`)
| field | notes |
|---|---|
| id | uuid |
| sha256 | indexed; the content key |
| status | `current \| superseded \| failed` (at most one `current` or `failed` per sha256, enforced in the write transaction because Prisma has no partial unique index) |
| supersededById | → the extraction that replaced it |
| extractorName, extractorVersion, model | identifies the agent tool and model |
| methods | `String[]`: which methods were used (`text_layer`, `vision`, `ocr`) |
| language, pageCount | |
| notes | supplier contradictions and caveats ("Section 2 classifies, Section 11 says no effects; Section 2 wins") |
| failureReason | when `failed` |
| reviewState | `unreviewed \| partially_verified \| verified`; **cached**, recomputed by code after every fact write and never set directly |
| createdById, apiKeyId, onBehalfOfId | |
| createdAt, updatedAt | |

### `DocumentExtractionText` (`document_extraction_texts`)
- `extractionId` (PK, 1:1) and `fullText`. Kept in its own table so default queries never load it.

### `FactDefinition` (`fact_definitions`): the catalog
| field | notes |
|---|---|
| key | unique slug, e.g. `flashpoint`, `exposure_limit` |
| label, description | |
| kind | `scalar \| enum \| claim \| row \| section` |
| valueSchema | JSON: enum options, row columns (name, type, required), claim wording |
| unitFamily | `temperature \| density \| concentration \| dose \| …` or null |
| safetyRelevant | defaults to true for agent-proposed keys |
| displayOrder | |
| status | `proposed \| approved \| deprecated` |
| mergedIntoId | set when a human merges this key into another |
| source | `seed \| agent \| human` |
| createdById, createdAt | |

`FactDefinitionFileType` (`fact_definition_file_types`): `factDefinitionId`, `fileTypeId` (an `ItemFileType`), `required Boolean`.

Seed: a config file of approved keys (the starter list plus Isaac's fuller list), upserted by the seed. Keys are deprecated or merged, never deleted.

### `ExtractedFact` (`extracted_facts`)
| field | notes |
|---|---|
| extractionId, definitionId | |
| scope | `material \| component` |
| componentName, componentCas | for component scope; a chemical name, never a trade name |
| value | JSON shaped by the definition: a claim is `{status: stated\|negated\|not_stated}`; a section is `{present, empty}`; a row holds its columns |
| printed | the value exactly as printed (`"93 °C (199 °F) closed cup"`; a range stays a range) |
| unit | as given |
| normalizedValue, normalizedUnit | Decimal in the family's canonical unit (°C, g/mL, %, mg/kg); null for unknown units, which are then left out of numeric search; ranges store lower/upper in `value` and the lower bound here |
| rowIndex | order within a `row` key |
| pageIndex, pageLabel | the 0-based PDF page (for deep links) and the sheet's printed page label |
| quote | exact text |
| method | `text_layer \| vision \| ocr \| human` |
| confidence | `high \| medium \| low` |
| needsHumanCheck | forced true for `vision`/`ocr` on safety-relevant keys |
| state | `active \| overridden` |
| replacesFactId | a human override points at the agent fact it overrides |
| verifiedById, verifiedAt | |
| createdById, createdAt | |

Indexes: `(definitionId, normalizedValue)`, `extractionId`, `componentCas`.

- Tables: one fact per row. Four exposure-limit rows are four `exposure_limit` facts with `rowIndex` 0–3, each with its own page and quote.
- An empty section is a `section` fact with `empty: true`. No `section` fact means "not captured".
- Derived flags ("has Prop 65 entries") are computed from row counts, never stored.

### `DocumentExtractionEvent` (`document_extraction_events`)
`extractionId?`, `factId?`, `factDefinitionId?`, `type`, `actorId`, `apiKeyId?`, `onBehalfOfId?`, `reason?`, `payload` (diff), `createdAt`.
Types: `stored`, `superseded`, `facts_updated`, `failed`, `failure_cleared`, `verified`, `unverified`, `overridden`, `override_reverted`, `key_created`, `key_approved`, `key_edited`, `key_merged`, `key_deprecated`.

### `CanonChangeRequestSource` (changed)
- `extractionId String?` and `factIds String[]`, under source type `supplierDocument`. `fileId` is filled in from the extraction's content, so a reviewer opens the PDF at the cited page.

## Rules

- **Review state:** `verified` = every active safety-relevant fact is verified; `partially_verified` = some are; otherwise `unreviewed`. Non-safety facts don't count. The review queue lists extractions that have unverified `needsHumanCheck` facts.
- **Completeness:** each document type's required keys (`FactDefinitionFileType.required`). Missing ones are reported as a warning and never block storing. INCI is required on TDS/spec sheets, not on SDS.
- **Re-extraction** (`supersedeExisting: true`): verification carries over to a new fact only when key, scope, component, normalizedValue (or value) and page all match. Verified facts that changed or disappeared come back as `conflicts` and appear on the extraction page. Human facts are always carried forward.
- **Overrides:** a human edit sets the agent fact to `overridden` and adds a verified `method: human` fact with `replacesFactId`. Reverting restores the agent fact. The agent can never write `method: human`, edit or remove human facts, or verify anything.
- **Agent corrections** to a verified fact reset its verification and are logged.
- **Any `extract:write` key** can correct or re-extract any agent-made extraction.
- **Failed:** stored per sha256 so audits stop retrying. A later successful store replaces it automatically. A human can clear it ("retry").
- **Supplier conflicts within a sheet** go in `notes` and aren't resolved silently. Section 2 wins for classification; Sections 1 and 3 win for CAS.
- **Agent-created keys:** usable immediately as `proposed`. The server refuses near-duplicates (normalized slug, label, kind) and returns the candidates. The agent can override that with `confirmNew: true` and a reason. The agent can't set `required` or edit approved keys.

## API key scope

`extract:write` is added to `apiKeyScopes` and `grantableScopes` (admin-granted), and registers the write tools below. Read tools use `read`.

## MCP tools

Read (`read` scope):
- `list_fact_definitions { documentTypeId?, includeProposed? = true }`
- `get_document_extraction { documentId? | sha256?, includeFullText? = false, includeHistory? = false }`. Returns `{ exists: false }`, or the extraction with facts, provenance, reviewState, completeness, conflicts, `documentReplaced`, and `contentMatches` (whether the document's file sha256 matches).
- `search_document_extractions { itemId?, supplierId?, documentTypeId?, factKey?, valueFilter?: { op: lt|lte|gt|gte|eq|contains, value, unit? }, claimStatus?, cas?, reviewState?, method?, needsHumanCheck?, status? = current, limit, cursor }`. Returns matching facts with their extraction, document and item. Never `fullText`.
- `get_item_extractions { itemId }`. For each current document: `extractionStatus` (`missing|current|failed`), `documentReplaced`, `surrogateOf`, reviewState, completeness.
- `get_material_documents_for_bom` (extended): adds extraction status per document, plus an `onlyNeedingExtraction` filter.
- `get_document_issues` (extended): adds an "extraction needed" category.

Write (`extract:write`; all take `idempotencyKey` and `dryRun`):
- `create_fact_definition { key, label, description, kind, valueSchema, unitFamily?, documentTypeIds[], confirmNew?, reason? }`
- `store_document_extraction { documentId, sha256, extractor: {name, version, model}, pageCount, language?, fullText?, facts[], notes?, supersedeExisting? }`
  - fact input: `{ key, scope, component?: {name, cas}, value, printed?, unit?, rowIndex?, page: {index, label?}, quote, method: text_layer|vision|ocr, confidence, needsHumanCheck? }`
  - Refuses: sha256 ≠ the document's content (hashing it from S3 first if needed); unknown or deprecated keys (merged keys are redirected); facts that don't match the key's shape; an existing `current` extraction without `supersedeExisting`.
  - Returns: the extraction, `conflicts[]`, completeness.
- `update_extraction_facts { extractionId, upsert[] (with factId to edit), remove[] (factIds), reason }`. Only on `current` extractions.
- `mark_extraction_failed { documentId, sha256, reason }`

Existing write tool (`write` scope): `attach_item_document` gains `surrogateFor { documentId, reason }`.

## UI

- **Files tab → document preview drawer → Extraction panel:** status, method badges, completeness warnings, a facts table grouped by key (rows shown as tables) with page links and quotes, verify / unverify / override / revert per fact, a conflicts list, a full-text viewer, and history.
- **Files tab:** an extraction status badge per document; "Use another item's document…" to create a surrogate; amber surrogate state on the checklist.
- **/quality/documents:** a surrogate filter; an extraction review queue (unverified `needsHumanCheck` facts); a fact search page (key, value filter, claim, CAS, review state).
- **Settings → Inventory → Documents → Fact catalog:** list and edit keys; approve, merge, deprecate; set required per document type and the safety flag. Same permission as the existing Documents requirements editor.

## PRs (all on `feat/document-extractions`; Isaac decides when to open the PR)

1. Schema + migration, `File.sha256`, catalog seed, `lib/documentExtractions`, `extract:write`, read and write MCP tools, tests
2. Surrogates: `ItemFile` columns, requirement status, Files tab action, `attach_item_document`
3. Extraction panel, verify/override/revert, document badges, review queue, catalog editor
4. Fact search page, BOM and issues tool extensions, canon evidence link, MCP docs (`docs/content/docs/mcp/index.mdx`)
5. Cross-checks: the same CAS under different names, Prop 65 / RTK / TSCA disagreements across materials, implied vs stated classification, composition vs INCI aliases

## Tests (acceptance)

- Keys without `extract:write` can't see or call the write tools. Existing tools and keys are unchanged.
- The agent can't verify, write `method: human`, or touch human facts. Correcting a verified fact resets its verification.
- A sha256 mismatch is refused, including for old files with no stored hash (they're hashed from S3).
- Two documents with the same content share one extraction. A duplicate `File` upload with the same content finds it too.
- Replacing a document leaves the extraction `current` and sets `documentReplaced`. A new upload with new content shows `missing`.
- Re-extraction carries verification only to matching facts and reports conflicts.
- `dryRun` output equals the real result. An idempotent retry creates nothing new.
- `fullText` never appears in search or list output, or by default in get output.
- A near-duplicate key is refused unless `confirmNew` is passed. Merging rewrites facts and keeps history.
- A surrogate satisfies the requirement as `surrogate` and turns `stale` when its source is replaced. It's refused for lot-scoped types.

## Changes from the original spec

- `stale` and "supersede the extraction when the document is replaced" are gone (rule 2).
- The SDS status `missing` / `surrogate` is no longer on the extraction. Surrogates are on `ItemFile`.
- "Extraction needed" events and webhooks are replaced by a computed read.
- `reviewState` is computed. INCI is required on TDS/spec sheets only.
- The fact catalog is in the database, the agent may add `proposed` keys, and there's no `other_statement`.
- The fuller key list from Isaac goes into the seed file.
