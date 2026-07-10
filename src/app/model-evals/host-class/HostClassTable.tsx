"use client";

import { useState } from "react";
import type { HostModelRow } from "../_data/hostClass";

type SortKey = "model" | "tier" | "variant" | "accuracy" | "wrong" | "abstain" | "latency" | "price";
type Dir = "asc" | "desc";

// numeric sort value per column; null => always sorts last
function sortVal(r: HostModelRow, key: SortKey): number | string | null {
  switch (key) {
    case "model": return r.model;
    case "tier": return r.tier;
    case "variant": return r.variant;
    case "accuracy": return r.accuracy;
    case "wrong": return r.wrong;
    case "abstain": return r.abstain;
    case "latency": return r.latencyS;
    case "price": return r.tier === "local" ? 0 : r.priceIn; // local = free = 0
  }
}

function fmtPrice(r: HostModelRow): string {
  if (r.tier === "local") return "free";
  if (r.priceIn == null) return "—";
  return `$${r.priceIn.toFixed(2)}`;
}

function fmtAcc(r: HostModelRow): string {
  if (r.accuracy == null) return "—";
  return r.accuracy.toFixed(3);
}

const COLS: { key: SortKey; label: string; title?: string; align: "left" | "right"; num: boolean }[] = [
  { key: "model", label: "Model", align: "left", num: false },
  { key: "tier", label: "Tier", title: "Hosted = paid API · Local = free open model", align: "left", num: false },
  { key: "variant", label: "Variant", title: "The prompt strategy this model does best with (strict, evidence, fieldwise, fewshot, negative, candidate).", align: "left", num: false },
  { key: "accuracy", label: "Accuracy", title: "Macro mean over is_government, country_code, level, branch vs CISA-registry + curated ground truth. Abstentions excused from the denominator; perspective.frame_type excluded (known prompt-schema gap).", align: "right", num: true },
  { key: "wrong", label: "Wrong", title: "Count of confidently-wrong answers across the gold set.", align: "right", num: true },
  { key: "abstain", label: "Abstain", title: "Count of honest 'unknown' answers — not penalized like a wrong answer.", align: "right", num: true },
  { key: "latency", label: "Latency", title: "Average wall-clock seconds per host (0s = below measurement resolution for fast hosted calls).", align: "right", num: true },
  { key: "price", label: "$/Mtok in", title: "Public list price per million input tokens. Local models run free.", align: "right", num: true },
];

export default function HostClassTable({ rows }: { rows: HostModelRow[] }) {
  const [key, setKey] = useState<SortKey>("accuracy");
  const [dir, setDir] = useState<Dir>("desc");

  function onSort(k: SortKey) {
    if (k === key) {
      setDir(dir === "asc" ? "desc" : "asc");
    } else {
      setKey(k);
      // text defaults to A→Z, numbers default to high→low
      setDir(k === "model" || k === "tier" || k === "variant" ? "asc" : "desc");
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
          const accClass =
            r.accuracy == null
              ? "text-text-secondary"
              : r.accuracy >= 0.85 ? "text-status-success" : r.accuracy >= 0.6 ? "text-ink" : "text-status-warning";
          return (
            <tr key={r.model} className="border-b border-border/60 hover:bg-panel transition-colors">
              <td className="py-1.5 pr-4 font-medium text-ink whitespace-nowrap">{r.model}</td>
              <td className="py-1.5 pr-4 text-text-secondary capitalize">{r.tier}</td>
              <td className="py-1.5 pr-4 text-text-secondary whitespace-nowrap">{r.variant}</td>
              <td className={`py-1.5 px-2 tabular-nums text-right font-medium ${accClass}`}>{fmtAcc(r)}</td>
              <td className="py-1.5 px-2 tabular-nums text-right text-text-secondary">{r.wrong}</td>
              <td className="py-1.5 px-2 tabular-nums text-right text-text-secondary">{r.abstain}</td>
              <td className="py-1.5 px-2 tabular-nums text-right text-text-secondary">{r.latencyS.toFixed(1)}s</td>
              <td className="py-1.5 pl-2 tabular-nums text-right font-medium text-ink">{fmtPrice(r)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
