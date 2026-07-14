"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type LeidenItem = {
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

type SearchResponse = { total: number; page: number; pageSize: number; items: LeidenItem[] };
type FacetsResponse = {
  institutions: { value: string; count: number }[];
  languages: { value: string; count: number }[];
  decades: { value: number; count: number }[];
  total: number;
  missingInstitution: number;
  syncedAt: string | null;
};

type SortKey = "date" | "title" | "creator" | "institution" | "year";
type Dir = "asc" | "desc";

const PAGE_SIZE = 50;

const MISSING_FIELDS: { key: keyof LeidenItem; label: string }[] = [
  { key: "institution", label: "university" },
  { key: "department", label: "department" },
  { key: "major_professor", label: "major professor" },
  { key: "publisher", label: "publisher" },
];

function missingBadges(item: LeidenItem) {
  return MISSING_FIELDS.filter((f) => !item[f.key]);
}

export default function LeidenBrowser() {
  const [facets, setFacets] = useState<FacetsResponse | null>(null);
  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");
  const [institution, setInstitution] = useState("");
  const [language, setLanguage] = useState("");
  const [decade, setDecade] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortKey>("date");
  const [dir, setDir] = useState<Dir>("desc");
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [resolvedKey, setResolvedKey] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/leiden/facets")
      .then((r) => r.json())
      .then(setFacets)
      .catch(() => setFacets(null));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  // Reset to page 1 whenever a filter changes — adjusted during render (React's
  // documented pattern for "resetting state when inputs change") rather than in an
  // effect, so it doesn't cause an extra render pass.
  const filterKey = `${qDebounced}|${institution}|${language}|${decade}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (qDebounced) params.set("q", qDebounced);
    if (institution) params.set("institution", institution);
    if (language) params.set("language", language);
    if (decade) {
      params.set("yearFrom", decade);
      params.set("yearTo", String(Number(decade) + 9));
    }
    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));
    params.set("sort", sort);
    params.set("dir", dir);
    return params.toString();
  }, [qDebounced, institution, language, decade, page, sort, dir]);

  useEffect(() => {
    fetch(`/api/leiden/search?${queryString}`)
      .then((r) => r.json())
      .then((data: SearchResponse) => {
        setResult(data);
        setResolvedKey(queryString);
      });
  }, [queryString]);

  const loading = resolvedKey !== queryString;

  const totalPages = useMemo(
    () => (result ? Math.max(1, Math.ceil(result.total / PAGE_SIZE)) : 1),
    [result]
  );

  function onSort(key: SortKey) {
    if (key === sort) {
      setDir(dir === "asc" ? "desc" : "asc");
    } else {
      setSort(key);
      setDir(key === "title" || key === "creator" || key === "institution" ? "asc" : "desc");
    }
  }

  const COLS: { key: SortKey; label: string }[] = [
    { key: "title", label: "Title" },
    { key: "creator", label: "Author" },
    { key: "institution", label: "University" },
    { key: "year", label: "Year" },
  ];

  return (
    <section>
      <div className="flex flex-wrap gap-2 mb-3">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title, author, university…"
          className="flex-1 min-w-[220px] text-xs px-3 py-1.5 border border-border rounded-sm bg-paper text-ink placeholder:text-text-muted focus:outline-none focus:border-accent"
        />
        <select
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          className="text-xs px-2 py-1.5 border border-border rounded-sm bg-paper text-ink max-w-[220px]"
        >
          <option value="">All universities</option>
          {facets?.institutions.map((f) => (
            <option key={f.value} value={f.value}>
              {f.value} ({f.count.toLocaleString()})
            </option>
          ))}
        </select>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="text-xs px-2 py-1.5 border border-border rounded-sm bg-paper text-ink"
        >
          <option value="">All languages</option>
          {facets?.languages.map((f) => (
            <option key={f.value} value={f.value}>
              {f.value} ({f.count.toLocaleString()})
            </option>
          ))}
        </select>
        <select
          value={decade}
          onChange={(e) => setDecade(e.target.value)}
          className="text-xs px-2 py-1.5 border border-border rounded-sm bg-paper text-ink"
        >
          <option value="">All decades</option>
          {facets?.decades.map((f) => (
            <option key={f.value} value={f.value}>
              {f.value}s ({f.count.toLocaleString()})
            </option>
          ))}
        </select>
      </div>

      {facets && facets.missingInstitution > 0 && (
        <p className="text-[10px] text-text-secondary uppercase tracking-widest mb-2">
          {facets.missingInstitution.toLocaleString()} items are missing a university value
        </p>
      )}

      <div className="flex items-baseline justify-between border-b border-border pb-1 mb-2">
        <h2 className="text-xs font-bold text-ink uppercase tracking-widest">
          {result ? `${result.total.toLocaleString()} results` : "Loading…"}
        </h2>
        <span className="text-[10px] text-text-secondary uppercase tracking-widest">
          {loading ? "updating…" : `page ${page} / ${totalPages}`}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs leading-snug">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-text-secondary">
              {COLS.map((c) => (
                <th
                  key={c.key}
                  onClick={() => onSort(c.key)}
                  className={`py-1 pr-4 text-left font-medium cursor-pointer select-none hover:text-ink transition-colors ${
                    sort === c.key ? "text-ink" : ""
                  }`}
                >
                  {c.label}
                  <span className="inline-block w-2.5">{sort === c.key ? (dir === "asc" ? "▲" : "▼") : ""}</span>
                </th>
              ))}
              <th className="py-1 pr-4 text-left font-medium">Language</th>
              <th className="py-1 text-left font-medium">Flags</th>
            </tr>
          </thead>
          <tbody>
            {result?.items.map((item) => {
              const badges = missingBadges(item);
              return (
                <tr key={item.identifier} className="border-b border-border/60 hover:bg-panel transition-colors align-top">
                  <td className="py-1.5 pr-4 font-medium text-ink max-w-[320px]">
                    <Link href={`/collections/leiden/${encodeURIComponent(item.identifier)}`} className="hover:text-accent">
                      {item.title || "(untitled)"}
                    </Link>
                  </td>
                  <td className="py-1.5 pr-4 text-text-secondary whitespace-nowrap">{item.creator || "—"}</td>
                  <td className="py-1.5 pr-4 text-text-secondary max-w-[240px]">{item.institution || "—"}</td>
                  <td className="py-1.5 pr-4 tabular-nums text-text-secondary">{item.year ?? "—"}</td>
                  <td className="py-1.5 pr-4 text-text-secondary whitespace-nowrap">{item.language || "—"}</td>
                  <td className="py-1.5">
                    {badges.length > 0 && (
                      <span
                        className="text-[10px] text-status-warning uppercase tracking-widest"
                        title={`Missing: ${badges.map((b) => b.label).join(", ")}`}
                      >
                        {badges.length} missing
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-3 text-xs">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="px-2 py-1 border border-border rounded-sm text-text-secondary disabled:opacity-40 hover:text-ink transition-colors"
        >
          ← Prev
        </button>
        <span className="text-text-secondary">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="px-2 py-1 border border-border rounded-sm text-text-secondary disabled:opacity-40 hover:text-ink transition-colors"
        >
          Next →
        </button>
      </div>
    </section>
  );
}
