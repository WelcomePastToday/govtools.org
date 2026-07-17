export type LeidenFilterParams = {
  q?: string;
  institution?: string;
  language?: string;
  yearFrom?: number | null;
  yearTo?: number | null;
};

export function parseFilterParams(params: URLSearchParams): LeidenFilterParams {
  return {
    q: params.get("q")?.trim() ?? "",
    institution: params.get("institution")?.trim() ?? "",
    language: params.get("language")?.trim() ?? "",
    yearFrom: params.get("yearFrom") ? Number(params.get("yearFrom")) : null,
    yearTo: params.get("yearTo") ? Number(params.get("yearTo")) : null,
  };
}

// Shared WHERE-clause builder for /api/leiden/search and /api/leiden/export —
// keeps filter semantics (FTS quoting, exact-match facets, year range)
// identical between browsing and exporting the same result set.
export function buildLeidenFilter(filter: LeidenFilterParams): {
  fromClause: string;
  whereClause: string;
  args: (string | number)[];
} {
  const where: string[] = [];
  const args: (string | number)[] = [];

  let fromClause = "items";
  if (filter.q) {
    fromClause = "items JOIN items_fts ON items.rowid = items_fts.rowid";
    where.push("items_fts MATCH ?");
    const ftsQuery = filter.q
      .split(/\s+/)
      .filter(Boolean)
      .map((term) => `"${term.replace(/"/g, '""')}"*`)
      .join(" ");
    args.push(ftsQuery);
  }
  if (filter.institution) {
    where.push("items.institution = ?");
    args.push(filter.institution);
  }
  if (filter.language) {
    where.push("items.language = ?");
    args.push(filter.language);
  }
  if (filter.yearFrom != null && !Number.isNaN(filter.yearFrom)) {
    where.push("items.year >= ?");
    args.push(filter.yearFrom);
  }
  if (filter.yearTo != null && !Number.isNaN(filter.yearTo)) {
    where.push("items.year <= ?");
    args.push(filter.yearTo);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { fromClause, whereClause, args };
}
