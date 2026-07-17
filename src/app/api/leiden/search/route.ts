import { NextRequest, NextResponse } from "next/server";
import { getLeidenDb, LeidenItem } from "@/lib/leidenDb";
import { buildLeidenFilter, parseFilterParams } from "@/lib/leidenQuery";

const PAGE_SIZE_DEFAULT = 50;
const PAGE_SIZE_MAX = 200;

// Mirrors the response shape used by ANT's review_server.py (/api/records),
// extended with total/page for pagination — 143k+ rows can't ship as one blob.
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get("page") ?? "1") || 1);
  const pageSize = Math.min(PAGE_SIZE_MAX, Math.max(1, Number(params.get("pageSize") ?? PAGE_SIZE_DEFAULT) || PAGE_SIZE_DEFAULT));
  const offset = (page - 1) * pageSize;

  const SORT_COLUMNS = new Set(["date", "title", "creator", "institution", "year"]);
  const sortCol = params.get("sort");
  const sortBy = sortCol && SORT_COLUMNS.has(sortCol) ? sortCol : "date";
  const sortDir = params.get("dir") === "asc" ? "ASC" : "DESC";

  const db = getLeidenDb();
  const { fromClause, whereClause, args } = buildLeidenFilter(parseFilterParams(params));

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
