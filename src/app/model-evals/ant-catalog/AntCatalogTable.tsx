"use client";

import { useState } from "react";
import type { AntModelRow } from "../_data/antCatalog";

type SortKey = "model" | "tier" | "accuracy" | "completed" | "valid" | "latency" | "tok" | "cost";
type Dir = "asc" | "desc";

// numeric sort value per column; null => always sorts last
function sortVal(r: AntModelRow, key: SortKey): number | string | null {
  switch (key) {
    case "model": return r.model;
    case "tier": return r.tier;
    case "accuracy": return r.accuracy;
    case "completed": return r.n > 0 ? r.ok / r.n : null;
    case "valid": return r.validOutputRate;
    case "latency": return r.avgLatencyS;
    case "tok": return r.avgRespTok;
    case "cost": return r.tier === "local" ? 0 : r.costPer1kDocs; // local = free = 0
  }
}

function fmtCost(r: AntModelRow): string {
  if (r.tier === "local") return "free";
  if (r.costPer1kDocs == null) return "—";
  return `$${r.costPer1kDocs.toFixed(2)}`;
}

function fmtAcc(r: AntModelRow): string {
  if (r.accuracy == null) return "—";
  return r.accuracy.toFixed(2) + (r.isPanel ? "*" : "");
}

const COLS: { key: SortKey; label: string; title?: string; align: "left" | "right"; num: boolean }[] = [
  { key: "model", label: "Model", align: "left", num: false },
  { key: "tier", label: "Tier", title: "Hosted = paid API · Local = free open model", align: "left", num: false },
  { key: "accuracy", label: "Accuracy", title: "Macro mean of per-field agreement vs the silver reference. * = panel member (inflated).", align: "right", num: true },
  { key: "completed", label: "Completed", title: "Documents that returned a usable result / documents attempted.", align: "right", num: true },
  { key: "valid", label: "Valid schema", title: "Share of outputs that parsed into the {value, code} schema — instruction-following, not correctness.", align: "right", num: true },
  { key: "latency", label: "Latency", title: "Average wall-clock seconds per document.", align: "right", num: true },
  { key: "tok", label: "Resp tok", title: "Average response tokens per document.", align: "right", num: true },
  { key: "cost", label: "$/1k docs", title: "Approximate cost per 1,000 documents (observed tokens × public list prices). Local models run free.", align: "right", num: true },
];

export default function AntCatalogTable({ rows }: { rows: AntModelRow[] }) {
  const [key, setKey] = useState<SortKey>("accuracy");
  const [dir, setDir] = useState<Dir>("desc");

  function onSort(k: SortKey) {
    if (k === key) {
      setDir(dir === "asc" ? "desc" : "asc");
    } else {
      setKey(k);
      // text defaults to A→Z, numbers default to high→low
      setDir(k === "model" || k === "tier" ? "asc" : "desc");
    }
  }

  const sorted = [...rows].sort((a, b) => {
    const va = sortVal(a, key);
    const vb = sortVal(b, key);
    if (va == null && vb == null) return 0;
    if (va == null) return 1; // nulls always last
    if (vb == null) return -1;
    let cmp: number;
    if (typeof va === "string" && typeof vb === "string") cmp = va.localeCompare(vb);
    else cmp = (va as number) - (vb as number);
    return dir === "asc" ? cmp : -cmp;
  });

  return (
    <table className="w-full text-xs leading-snug">
      <thead>
        <tr className="text-[10px] uppercase tracking-widest text-text-secondary">
          {COLS.map((c) => (
            <th
              key={c.key}
              title={c.title}
              onClick={() => onSort(c.key)}
              className={`py-1 font-medium cursor-pointer select-none hover:text-ink transition-colors ${
                c.align === "right" ? "px-2 text-right" : "pr-4 text-left"
              } ${key === c.key ? "text-ink" : ""}`}
            >
              {c.label}
              <span className="inline-block w-2.5">{key === c.key ? (dir === "asc" ? "▲" : "▼") : ""}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sorted.map((r) => {
          const accClass = r.isPanel
            ? "text-text-secondary italic"
            : r.accuracy == null
              ? "text-text-secondary"
              : r.accuracy >= 0.7 ? "text-status-success" : r.accuracy >= 0.55 ? "text-ink" : "text-status-warning";
          const compClass = r.ok === r.n ? "text-status-success" : r.ok / Math.max(1, r.n) >= 0.5 ? "text-ink" : "text-status-warning";
          return (
            <tr key={r.model} className="border-b border-border/60 hover:bg-panel transition-colors">
              <td className="py-1.5 pr-4 font-medium text-ink whitespace-nowrap">{r.model}</td>
              <td className="py-1.5 pr-4 text-text-secondary capitalize">{r.tier}</td>
              <td className={`py-1.5 px-2 tabular-nums text-right font-medium ${accClass}`}>{fmtAcc(r)}</td>
              <td className={`py-1.5 px-2 tabular-nums text-right ${compClass}`}>{r.ok}/{r.n}</td>
              <td className="py-1.5 px-2 tabular-nums text-right text-text-secondary">{r.validOutputRate == null ? "—" : (r.validOutputRate * 100).toFixed(0) + "%"}</td>
              <td className="py-1.5 px-2 tabular-nums text-right text-text-secondary">{r.avgLatencyS.toFixed(1)}s</td>
              <td className="py-1.5 px-2 tabular-nums text-right text-text-secondary">{r.avgRespTok}</td>
              <td className="py-1.5 pl-2 tabular-nums text-right font-medium text-ink">{fmtCost(r)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
