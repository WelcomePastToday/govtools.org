import { NextRequest, NextResponse } from "next/server";
import { getLeidenDb, LeidenItem } from "@/lib/leidenDb";

const PAGE_SIZE_DEFAULT = 50;
const PAGE_SIZE_MAX = 200;

// Mirrors the response shape used by ANT's review_server.py (/api/records),
// extended with total/page for pagination — 143k+ rows can't ship as one blob.
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const q = params.get("q")?.trim() ?? "";
  const institution = params.get("institution")?.trim() ?? "";
  const language = params.get("language")?.trim() ?? "";
  const yearFrom = params.get("yearFrom") ? Number(params.get("yearFrom")) : null;
  const yearTo = params.get("yearTo") ? Number(params.get("yearTo")) : null;
  const page = Math.max(1, Number(params.get("page") ?? "1") || 1);
  const pageSize = Math.min(PAGE_SIZE_MAX, Math.max(1, Number(params.get("pageSize") ?? PAGE_SIZE_DEFAULT) || PAGE_SIZE_DEFAULT));
  const offset = (page - 1) * pageSize;

  const SORT_COLUMNS = new Set(["date", "title", "creator", "institution", "year"]);
  const sortCol = params.get("sort");
  const sortBy = sortCol && SORT_COLUMNS.has(sortCol) ? sortCol : "date";
  const sortDir = params.get("dir") === "asc" ? "ASC" : "DESC";

  const db = getLeidenDb();

  const where: string[] = [];
  const args: (string | number)[] = [];

  let fromClause = "items";
  if (q) {
    fromClause = "items JOIN items_fts ON items.rowid = items_fts.rowid";
    where.push("items_fts MATCH ?");
    // FTS5 special chars in free text can throw a syntax error — quote each term.
    const ftsQuery = q
      .split(/\s+/)
      .filter(Boolean)
      .map((term) => `"${term.replace(/"/g, '""')}"*`)
      .join(" ");
    args.push(ftsQuery);
  }
  if (institution) {
    where.push("items.institution = ?");
    args.push(institution);
  }
  if (language) {
    where.push("items.language = ?");
    args.push(language);
  }
  if (yearFrom != null && !Number.isNaN(yearFrom)) {
    where.push("items.year >= ?");
    args.push(yearFrom);
  }
  if (yearTo != null && !Number.isNaN(yearTo)) {
    where.push("items.year <= ?");
    args.push(yearTo);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const total = (
    db.prepare(`SELECT COUNT(*) as n FROM ${fromClause} ${whereClause}`).get(...args) as { n: number }
  ).n;

  const items = db
    .prepare(
      `SELECT items.identifier, items.title, items.creator, items.date, items.year,
              items.language, items.institution, items.department, items.major_professor,
              items.publisher, items.addeddate
       FROM ${fromClause} ${whereClause}
       ORDER BY items.${sortBy} ${sortDir} NULLS LAST
       LIMIT ? OFFSET ?`
    )
    .all(...args, pageSize, offset) as LeidenItem[];

  return NextResponse.json({ total, page, pageSize, items });
}
