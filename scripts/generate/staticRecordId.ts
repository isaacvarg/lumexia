import { v5 as uuidv5 } from 'uuid';

// Deterministic ID derivation for static records.
//
// Static-record tables (statuses, types, etc.) are referenced throughout the app
// by name via configs/staticRecords/*.ts. Historically their IDs were random
// (`@default(uuid())`), so a freshly-seeded DB never matched the IDs compiled
// into a pre-built image — forcing a post-deploy `next build` to reconcile them.
//
// Instead we derive each ID as a UUIDv5 of "<table>:<key>" under a fixed
// namespace. The same record name always maps to the same UUID on every machine
// and every deployment, so the seeder and the build-time generator agree by
// construction — no database and no rebuild required to keep them in sync.
//
// The namespace is an arbitrary, permanent constant: NEVER change it, or every
// derived ID changes and existing databases would no longer match.
const NAMESPACE = '7a8c2551-9461-4db7-8243-f73acc116e77';

// `table` is the static-record export name (e.g. "requestStatuses"); `key` is the
// camelCased record name (e.g. "requested"). Both the seeder
// (scripts/initialization/main.ts) and the generator (scripts/generate/scaffold.ts)
// derive these identically so the inserted row ID equals the compiled-in ID.
export const staticRecordId = (table: string, key: string): string =>
  uuidv5(`${table}:${key}`, NAMESPACE);
