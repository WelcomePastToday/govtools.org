import { NextResponse } from "next/server";
import { getLeidenDb, getSyncMeta } from "@/lib/leidenDb";

const TOP_INSTITUTIONS = 150;
const TOP_LANGUAGES = 15;

// archive.org's advancedsearch.php facet.field is broken for arbitrary fields
// (confirmed: facet.field=institution / facet.limit both error UNSUPPORTED_VALUE) —
// this local aggregation over the synced SQLite mirror is the replacement.
export async function GET() {
  const db = getLeidenDb();

  const institutions = db
    .prepare(
      `SELECT institution as value, COUNT(*) as count
       FROM items
       WHERE institution IS NOT NULL AND institution != ''
       GROUP BY institution
       ORDER BY count DESC
       LIMIT ?`
    )
    .all(TOP_INSTITUTIONS);

  // A slice of `language` values are corrupted (stray LLM-extraction leakage from IA's
  // own metadata pipeline, e.g. "German result likely as 'German'") — capping to the
  // top N by count keeps the dropdown to real languages, since garbage values are
  // near-singletons and sort to the bottom.
  const languages = db
    .prepare(
      `SELECT language as value, COUNT(*) as count
       FROM items
       WHERE language IS NOT NULL AND language != ''
       GROUP BY language
       ORDER BY count DESC
       LIMIT ?`
    )
    .all(TOP_LANGUAGES);

  const decades = db
    .prepare(
      `SELECT (year / 10) * 10 as value, COUNT(*) as count
       FROM items
       WHERE year IS NOT NULL
       GROUP BY value
       ORDER BY value ASC`
    )
    .all();

  const totals = db.prepare(`SELECT COUNT(*) as n FROM items`).get() as { n: number };
  const missingInstitution = db
    .prepare(`SELECT COUNT(*) as n FROM items WHERE institution IS NULL OR institution = ''`)
    .get() as { n: number };

  const meta = getSyncMeta();

  return NextResponse.json({
    institutions,
    languages,
    decades,
    total: totals.n,
    missingInstitution: missingInstitution.n,
    syncedAt: meta.last_sync_run_at ?? null,
  });
}
