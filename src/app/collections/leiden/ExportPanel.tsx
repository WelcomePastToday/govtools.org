"use client";

import { useState } from "react";

type Scope = "view" | "filtered" | "all";
type Format = "csv" | "jsonl" | "json";

const FIELD_OPTIONS: { key: string; label: string; defaultOn: boolean }[] = [
  { key: "title", label: "Title", defaultOn: true },
  { key: "creator", label: "Author", defaultOn: true },
  { key: "date", label: "Date", defaultOn: true },
  { key: "language", label: "Language", defaultOn: true },
  { key: "institution", label: "University", defaultOn: true },
  { key: "department", label: "Department", defaultOn: true },
  { key: "major_professor", label: "Major professor", defaultOn: true },
  { key: "publisher", label: "Publisher", defaultOn: true },
  { key: "year", label: "Year (separate from date)", defaultOn: false },
  { key: "addeddate", label: "Date added to archive.org", defaultOn: false },
];

export default function ExportPanel({
  filterParams,
  viewCount,
  filteredCount,
  grandTotal,
}: {
  filterParams: URLSearchParams;
  viewCount: number;
  filteredCount: number;
  grandTotal: number;
}) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<Format>("csv");
  const [scope, setScope] = useState<Scope>("filtered");
  const [fields, setFields] = useState<Set<string>>(
    new Set(FIELD_OPTIONS.filter((f) => f.defaultOn).map((f) => f.key))
  );

  function toggleField(key: string) {
    setFields((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const exportUrl = (() => {
    const params = new URLSearchParams(filterParams);
    params.set("format", format);
    params.set("scope", scope);
    params.set("fields", Array.from(fields).join(","));
    return `/api/leiden/export?${params.toString()}`;
  })();

  const scopeCount = scope === "view" ? viewCount : scope === "filtered" ? filteredCount : grandTotal;
  const panelId = "leiden-export-panel";

  return (
    <div className="border border-border rounded-sm mb-4">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-ink hover:bg-panel focus:outline-2 focus:outline-accent focus:outline-offset-1 transition-colors"
      >
        <span>Export</span>
        <span className="text-text-secondary" aria-hidden="true">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div id={panelId} className="px-3 pb-3 pt-1 border-t border-border text-xs">
          <div className="flex flex-wrap gap-4 mb-3">
            <label className="flex items-center gap-2">
              <span className="text-text-secondary">Format</span>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as Format)}
                className="px-2 py-1 border border-border rounded-sm bg-paper text-ink focus:outline-2 focus:outline-accent focus:outline-offset-1"
              >
                <option value="csv">CSV</option>
                <option value="jsonl">JSON Lines</option>
                <option value="json">JSON</option>
              </select>
            </label>

            <label className="flex items-center gap-2">
              <span className="text-text-secondary">Scope</span>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as Scope)}
                className="px-2 py-1 border border-border rounded-sm bg-paper text-ink focus:outline-2 focus:outline-accent focus:outline-offset-1"
              >
                <option value="view">Current page ({viewCount.toLocaleString()})</option>
                <option value="filtered">Matching current filters ({filteredCount.toLocaleString()})</option>
                <option value="all">Entire collection ({grandTotal.toLocaleString()})</option>
              </select>
            </label>
          </div>

          <fieldset className="mb-3 border-0 p-0 m-0">
            <legend className="text-text-secondary mb-1.5 px-0">Fields</legend>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {FIELD_OPTIONS.map((f) => (
                <label key={f.key} className="flex items-center gap-1.5 text-ink">
                  <input
                    type="checkbox"
                    checked={fields.has(f.key)}
                    onChange={() => toggleField(f.key)}
                    className="accent-accent focus:outline-2 focus:outline-accent focus:outline-offset-1"
                  />
                  {f.label}
                </label>
              ))}
            </div>
          </fieldset>

          <p role="status" aria-live="polite">
            {fields.size === 0 ? (
              <span className="text-text-secondary">Select at least one field to export.</span>
            ) : (
              <a
                href={exportUrl}
                className="inline-block px-3 py-1.5 border border-accent rounded-sm text-accent hover:bg-accent/5 focus:outline-2 focus:outline-accent focus:outline-offset-1 transition-colors"
              >
                Download {scopeCount.toLocaleString()} rows ({format.toUpperCase()})<span aria-hidden="true"> →</span>
              </a>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
