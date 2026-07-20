import Database from "better-sqlite3";

// Built by Leiden/build_index_lookup.py, which folds the append-only
// output/index.jsonl event log (accessioning + curation updates) down to
// "latest row per ant_id" — this is the resolved, ANT-assertion-backed view,
// distinct from leidenDb.ts's raw IA-metadata mirror used for search/browse.
const DB_PATH = process.env.LEIDEN_INDEX_DB_PATH ?? "/Volumes/8tb/work/ant/Leiden/leiden_index_lookup.db";

// Built by Leiden/build_assertions_lookup.py — resolves a `selected_assertion`
// id (stored in index.jsonl) back to its source/method/confidence. Needed
// because accessioning always stores a REAL assertion UUID for every field
// (there's no way to tell an ia_item_metadata assertion apart from a
// human_curation one just by looking at the id itself).
const ASSERTIONS_DB_PATH =
  process.env.LEIDEN_ASSERTIONS_DB_PATH ?? "/Volumes/8tb/work/ant/Leiden/leiden_assertions_lookup.db";

let db: Database.Database | null = null;
let assertionsDb: Database.Database | null = null;

export function getLeidenIndexDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  }
  return db;
}

function getAssertionsDb(): Database.Database {
  if (!assertionsDb) {
    assertionsDb = new Database(ASSERTIONS_DB_PATH, { readonly: true, fileMustExist: true });
  }
  return assertionsDb;
}

// `selected_assertion` is either a real assertion_id (written by accessioning
// for every field), or the literal string "ia_item_metadata" (a placeholder
// curation.py writes for fields it passed through untouched) — the literal
// resolves directly without a lookup.
export function resolveAssertionSource(selectedAssertion: string): string {
  if (selectedAssertion === "ia_item_metadata") return "ia_item_metadata";
  const row = getAssertionsDb()
    .prepare("SELECT source FROM assertions_lookup WHERE assertion_id = ?")
    .get(selectedAssertion) as { source: string } | undefined;
  return row?.source ?? "unknown";
}

export type DisplayMetadataField = { value: unknown; selected_assertion: string };
export type IndexSummary = {
  first_seen?: string | null;
  last_seen?: string | null;
  extraction_status?: string | null;
  rejected_fields?: Record<string, string>;
};

export function getResolvedIndex(
  antId: string
): { displayMetadata: Record<string, DisplayMetadataField>; summary: IndexSummary } | null {
  const row = getLeidenIndexDb()
    .prepare("SELECT display_metadata_json, summary_json FROM index_lookup WHERE ant_id = ?")
    .get(antId) as { display_metadata_json: string; summary_json: string } | undefined;
  if (!row) return null;
  return {
    displayMetadata: JSON.parse(row.display_metadata_json),
    summary: JSON.parse(row.summary_json),
  };
}
