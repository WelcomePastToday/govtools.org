import Database from "better-sqlite3";

// The metadata mirror lives in the Leiden project repo (synced by
// Leiden/sync_leiden_metadata.py), not in govtools.org itself — override with
// LEIDEN_DB_PATH if that repo is checked out somewhere else.
const DB_PATH = process.env.LEIDEN_DB_PATH ?? "/Volumes/8tb/work/ant/Leiden/leiden_metadata.db";

let db: Database.Database | null = null;

export function getLeidenDb(): Database.Database {
  if (!db) {
    // Read-only connection — no journal_mode pragma needed (and WAL would fail here,
    // since it requires creating -wal/-shm sidecar files next to a read-only DB).
    db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  }
  return db;
}

export type LeidenItem = {
  identifier: string;
  title: string | null;
  creator: string | null;
  date: string | null;
  year: number | null;
  language: string | null;
  institution: string | null;
  department: string | null;
  major_professor: string | null;
  publisher: string | null;
  addeddate: string | null;
};

export function getSyncMeta(): Record<string, string> {
  const rows = getLeidenDb().prepare("SELECT key, value FROM sync_meta").all() as {
    key: string;
    value: string;
  }[];
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}
