import { NextRequest } from "next/server";
import { getLeidenDb } from "@/lib/leidenDb";
import { buildLeidenFilter, parseFilterParams } from "@/lib/leidenQuery";

const ALL_FIELDS = [
  "identifier", "title", "creator", "date", "year", "language",
  "institution", "department", "major_professor", "publisher", "addeddate",
] as const;
const DEFAULT_FIELDS = [
  "identifier", "title", "creator", "date", "language",
  "institution", "department", "major_professor", "publisher",
];

const PAGE_SIZE_DEFAULT = 50;
const PAGE_SIZE_MAX = 200;
const BATCH_SIZE = 1000; // rows accumulated per stream chunk

function csvEscape(value: unknown): string {
  if (value == null) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function errorResponse(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}

// Field- and scope-selectable export (json/jsonl/csv), reusing the same filter
// semantics as /api/leiden/search. Streams the SQLite cursor directly rather
// than building a job queue — a local read over even the full 143k+ rows is
// fast enough (no network/payload fetch involved) to serve synchronously.
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  const format = (params.get("format") ?? "csv").toLowerCase();
  if (!["csv", "jsonl", "json"].includes(format)) {
    return errorResponse("format must be one of: csv, jsonl, json");
  }
  const scope = (params.get("scope") ?? "filtered").toLowerCase();
  if (!["view", "filtered", "all"].includes(scope)) {
    return errorResponse("scope must be one of: view, filtered, all");
  }

  const requestedFields = params.get("fields")?.split(",").map((f) => f.trim()).filter(Boolean);
  const fields =
    requestedFields && requestedFields.length
      ? requestedFields.filter((f) => (ALL_FIELDS as readonly string[]).includes(f))
      : DEFAULT_FIELDS;
  if (fields.length === 0) {
    return errorResponse("no valid fields selected");
  }

  const db = getLeidenDb();
  const selectCols = fields.map((f) => `items.${f}`).join(", ");

  let sql: string;
  let sqlArgs: (string | number)[];

  if (scope === "all") {
    sql = `SELECT ${selectCols} FROM items ORDER BY items.identifier ASC`;
    sqlArgs = [];
  } else {
    const { fromClause, whereClause, args } = buildLeidenFilter(parseFilterParams(params));
    sql = `SELECT ${selectCols} FROM ${fromClause} ${whereClause} ORDER BY items.date DESC`;
    sqlArgs = [...args];
    if (scope === "view") {
      const page = Math.max(1, Number(params.get("page") ?? "1") || 1);
      const pageSize = Math.min(
        PAGE_SIZE_MAX,
        Math.max(1, Number(params.get("pageSize") ?? PAGE_SIZE_DEFAULT) || PAGE_SIZE_DEFAULT)
      );
      sql += " LIMIT ? OFFSET ?";
      sqlArgs.push(pageSize, (page - 1) * pageSize);
    }
  }

  const rowIterator = db.prepare(sql).iterate(...sqlArgs) as IterableIterator<Record<string, unknown>>;
  const encoder = new TextEncoder();
  let isFirstJsonRow = true;

  const stream = new ReadableStream({
    start(controller) {
      if (format === "csv") controller.enqueue(encoder.encode(fields.join(",") + "\r\n"));
      else if (format === "json") controller.enqueue(encoder.encode("["));
    },
    pull(controller) {
      let buf = "";
      let count = 0;
      let exhausted = false;

      while (count < BATCH_SIZE) {
        const { value: row, done } = rowIterator.next();
        if (done) {
          exhausted = true;
          break;
        }
        count++;
        if (format === "csv") {
          buf += fields.map((f) => csvEscape(row[f])).join(",") + "\r\n";
        } else if (format === "jsonl") {
          buf += JSON.stringify(row) + "\n";
        } else {
          buf += (isFirstJsonRow ? "" : ",") + JSON.stringify(row);
          isFirstJsonRow = false;
        }
      }

      if (buf) controller.enqueue(encoder.encode(buf));
      if (exhausted) {
        if (format === "json") controller.enqueue(encoder.encode("]"));
        controller.close();
      }
    },
  });

  const ext = format === "json" ? "json" : format === "jsonl" ? "jsonl" : "csv";
  const contentType =
    format === "csv" ? "text/csv" : format === "jsonl" ? "application/x-ndjson" : "application/json";

  return new Response(stream, {
    headers: {
      "Content-Type": `${contentType}; charset=utf-8`,
      "Content-Disposition": `attachment; filename="leiden-dissertations-${scope}.${ext}"`,
    },
  });
}
