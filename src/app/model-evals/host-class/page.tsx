import type { Metadata } from "next";
import Link from "next/link";
import { HOST_MODEL_ROWS, HOST_ROUTING, HOST_RUN_META } from "../_data/hostClass";
import HostClassTable from "./HostClassTable";

export const metadata: Metadata = {
  title: "Host/domain classification model comparison | Model Evals",
  description:
    "Which model to use for classifying a government website's jurisdiction from its archived page content — is_government, country, governance level, branch, operator role — across hosted and free local models, scored against CISA-registry ground truth.",
};

// Best variant per model (from HOST_MODEL_ROWS) sorted by accuracy, for the
// leaderboard table and for pivoting the per-field matrix below.
const sortedByAcc = [...HOST_MODEL_ROWS].sort(
  (a, b) => (b.accuracy ?? -1) - (a.accuracy ?? -1)
);

const FIELD_ORDER = [
  "is_government",
  "country_code",
  "level",
  "branch",
  "operator_role",
  "organization_name",
  "perspective.frame_type",
];
const matFields = FIELD_ORDER.filter((f) =>
  HOST_MODEL_ROWS.some((r) => r.fields[f] != null)
);
const routingByField = Object.fromEntries(HOST_ROUTING.map((r) => [r.field, r]));

const bestFree = sortedByAcc.find((r) => r.tier === "local");
const bestPaid = sortedByAcc.find((r) => r.tier === "hosted");
const gap =
  bestPaid?.accuracy != null && bestFree?.accuracy != null
    ? bestPaid.accuracy - bestFree.accuracy
    : null;

export default function HostClassPage() {
  return (
    <div className="min-h-screen bg-paper text-ink font-sans">
      <header className="border-b border-border bg-paper sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-baseline gap-4">
            <Link href="/" className="text-xl font-bold tracking-tight text-ink hover:text-accent transition-colors">
              GovTools
            </Link>
            <span className="text-xs text-text-secondary uppercase tracking-widest hidden sm:inline-block">
              Model Evals: Host classification
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/model-evals/ant-catalog" className="text-xs font-medium text-text-secondary uppercase tracking-widest hover:text-accent transition-colors">
              ANT Catalog
            </Link>
            <Link href="/model-evals" className="text-xs font-medium text-text-secondary uppercase tracking-widest hover:text-accent transition-colors">
              Overview
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6">
        <section className="pb-3 mb-4 border-b border-border">
          <h1 className="text-xl font-bold tracking-tight text-ink">
            Host/domain jurisdiction classification — model comparison
          </h1>
          <p className="text-xs text-text-secondary leading-snug max-w-2xl mt-1">
            Which model best classifies a government website&rsquo;s jurisdiction — is it a government host,
            which country, which governance level (federal/state/local/tribal/&hellip;), which branch, who
            operates it — from real archived page content. {HOST_RUN_META.models} models ×{" "}
            {HOST_RUN_META.hosts} hosts × {HOST_RUN_META.variants} prompt variants. Ground truth is the{" "}
            <strong className="text-ink">CISA .gov registry</strong> plus curated international/control cases
            (institutional authority) — hosted models are contestants here, not referees. Companion to the{" "}
            <Link href="/model-evals/ant-catalog" className="text-accent hover:text-link-hover">ANT Catalog</Link>{" "}
            eval (document metadata extraction).
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-[10px] font-bold text-ink uppercase tracking-widest border-b border-border pb-1 mb-2">
            Reading this table
          </h2>
          <p className="text-xs text-text-secondary leading-snug">
            Click any column to sort. Each row is a model at <strong className="text-ink">its own best-performing
            prompt variant</strong> (of 6 tested: strict, evidence, fieldwise, fewshot, negative, candidate).{" "}
            <strong className="text-ink">Accuracy</strong> = macro mean over is_government, country_code, level,
            branch (abstentions excused from the denominator; <code className="text-[11px]">perspective.frame_type</code>{" "}
            excluded — a known prompt-schema gap, shown separately below).{" "}
            <strong className="text-ink">Wrong</strong> / <strong className="text-ink">Abstain</strong> are raw
            counts across the {HOST_RUN_META.hosts}-host gold set — an honest &ldquo;unknown&rdquo; is not
            penalized the way a confidently wrong answer is.
          </p>
        </section>

        <section className="mb-7">
          <div className="flex items-baseline justify-between border-b border-border pb-1 mb-2">
            <h2 className="text-xs font-bold text-ink uppercase tracking-widest">All models — hosted &amp; local</h2>
            <span className="text-[10px] text-text-secondary uppercase tracking-widest">01 · sortable</span>
          </div>
          <HostClassTable rows={HOST_MODEL_ROWS} />
        </section>

        {matFields.length > 0 && (
          <section className="mb-7">
            <div className="flex items-baseline justify-between border-b border-border pb-1 mb-2">
              <h2 className="text-xs font-bold text-ink uppercase tracking-widest">Per-field accuracy — every model</h2>
              <span className="text-[10px] text-text-secondary uppercase tracking-widest">02</span>
            </div>
            <p className="text-xs text-text-secondary leading-snug mb-2">
              Each cell is that model&rsquo;s per-field accuracy <em>at its own best overall variant</em> (table 01).
              The highlighted cell is the best <strong className="text-ink">free</strong> model for that field at
              its field-optimal variant (table 03 below) — which can differ from a model&rsquo;s single best-overall
              variant shown here.
            </p>
            <div className="overflow-x-auto">
              <table className="text-xs leading-snug border-collapse">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-text-secondary">
                    <th className="py-1 pr-3 text-left font-medium sticky left-0 bg-background">Field</th>
                    {sortedByAcc.map((r) => (
                      <th
                        key={r.model}
                        title={`${r.model} (${r.variant})${r.accuracy == null ? "" : ` · macro ${r.accuracy.toFixed(2)}`}`}
                        className={`py-1 px-2 text-right font-medium whitespace-nowrap ${r.tier === "hosted" ? "" : "text-text-secondary/60"}`}
                      >
                        {r.model}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matFields.map((f) => {
                    const routed = routingByField[f];
                    return (
                      <tr key={f} className="border-b border-border/60 hover:bg-panel transition-colors">
                        <td className="py-1.5 pr-3 font-medium text-ink whitespace-nowrap sticky left-0 bg-background">{f}</td>
                        {sortedByAcc.map((r) => {
                          const v = r.fields[f];
                          const isRouted = routed && routed.bestModel === r.model;
                          return (
                            <td
                              key={r.model}
                              className={`py-1.5 px-2 tabular-nums text-right ${
                                isRouted
                                  ? "font-bold text-accent bg-accent/10"
                                  : r.tier === "hosted"
                                    ? "text-ink"
                                    : "text-text-secondary/60"
                              }`}
                            >
                              {v == null ? "—" : v.toFixed(2)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-text-secondary leading-snug mt-2">
              Highlighted = the free-model routing pick for that field (table 03) — note it may use a different
              prompt variant than shown for that model in table 01, so the highlighted number can differ slightly
              from the cell&rsquo;s own column position. Columns ordered by macro accuracy (table 01).
            </p>
          </section>
        )}

        <section className="mb-7">
          <div className="flex items-baseline justify-between border-b border-border pb-1 mb-2">
            <h2 className="text-xs font-bold text-ink uppercase tracking-widest">Per-field routing — best free model</h2>
            <span className="text-[10px] text-text-secondary uppercase tracking-widest">03</span>
          </div>
          <p className="text-xs text-text-secondary leading-snug mb-2">
            The best <strong className="text-ink">free, local</strong> model for each field, at that field&rsquo;s
            own best variant (searched across all variants independently per field — not constrained to a
            model&rsquo;s single best-overall variant, unlike tables 01–02).
          </p>
          <table className="text-xs leading-snug border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-text-secondary">
                <th className="py-1 pr-4 text-left font-medium">Field</th>
                <th className="py-1 pr-4 text-left font-medium">Best free model</th>
                <th className="py-1 pr-4 text-left font-medium">Variant</th>
                <th className="py-1 px-2 text-right font-medium">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {HOST_ROUTING.map((r) => (
                <tr key={r.field} className="border-b border-border/60 hover:bg-panel transition-colors">
                  <td className="py-1.5 pr-4 font-medium text-ink whitespace-nowrap">{r.field}</td>
                  <td className="py-1.5 pr-4 text-ink whitespace-nowrap">{r.bestModel}</td>
                  <td className="py-1.5 pr-4 text-text-secondary whitespace-nowrap">{r.variant}</td>
                  <td className={`py-1.5 px-2 tabular-nums text-right font-medium ${r.accuracy >= 0.85 ? "text-status-success" : r.accuracy >= 0.6 ? "text-ink" : "text-status-warning"}`}>
                    {r.accuracy.toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mb-7">
          <div className="flex items-baseline justify-between border-b border-border pb-1 mb-2">
            <h2 className="text-xs font-bold text-ink uppercase tracking-widest">Model-consensus explorer — ungolded fields</h2>
            <span className="text-[10px] text-text-secondary uppercase tracking-widest">04</span>
          </div>
          <p className="text-xs text-text-secondary leading-snug mb-2">
            Two fields have <strong className="text-ink">no ground-truth labels</strong> —{" "}
            <code className="text-[11px]">host_lifecycle_status</code> and{" "}
            <code className="text-[11px]">content_function</code> — so model <em>agreement</em> is the best signal
            we have. The explorer shows, per host, the vote distribution across all models (strict variant, one
            vote each) for every field, with a click-through to the archived page so you can check the popular answer against
            the real URL. (Consensus: <code className="text-[11px]">host_lifecycle_status</code> is near-unanimous
            &ldquo;active&rdquo;; <code className="text-[11px]">content_function</code> shows real disagreement.)
          </p>
          <a
            href="/model-evals/host-class/consensus"
            className="inline-block text-xs font-medium text-accent hover:text-link-hover border border-border rounded px-3 py-1.5 hover:border-accent transition-colors"
          >
            Open the consensus explorer →
          </a>
        </section>

        <section className="mb-6 text-xs text-text-secondary leading-snug">
          <h2 className="text-xs font-bold text-ink uppercase tracking-widest border-b border-border pb-1 mb-2">
            The cost story
          </h2>
          <p className="mb-1.5">
            Best free model: <strong className="text-ink">{bestFree?.model}</strong> ({bestFree?.variant}) ={" "}
            {bestFree?.accuracy?.toFixed(3)}. Best paid model:{" "}
            <strong className="text-ink">{bestPaid?.model}</strong> ({bestPaid?.variant}) ={" "}
            {bestPaid?.accuracy?.toFixed(3)}. Gap:{" "}
            <strong className="text-ink">{gap != null ? (gap >= 0 ? "+" : "") + gap.toFixed(3) : "—"}</strong>{" "}
            — for host-jurisdiction classification, free local models are essentially competitive with the
            frontier, and cheaper hosted models (gpt-4o-mini, haiku) sit close behind.
          </p>
          <p className="mb-1.5">
            The one field where <strong className="text-ink">paying clearly helps</strong> is{" "}
            <strong className="text-ink">organization_name</strong> (free-text agency-name recall) — best free is
            olmo2:7b at 0.596, well behind claude-sonnet-4-6&rsquo;s 0.723. Everywhere else (jurisdiction fields,
            operator_role), free is fully competitive: route free by default, escalate to a paid model only for
            organization_name.
          </p>
          <p>
            <strong className="text-ink">Self-reported confidence is not a trustworthy accept/abstain gate.</strong>{" "}
            Across nearly all models, mean confidence on correct answers ≈ mean confidence on wrong answers —
            several models are <em>more</em> confident when wrong (e.g. gpt-4.1: 0.86 correct vs 0.97 wrong;
            claude-opus-4-8: 0.81 vs 0.90). Confidence does not discriminate right from wrong here, so it cannot
            gate an auto-accept pipeline on its own.
          </p>
        </section>

        <section className="mt-4 pt-2 border-t border-border">
          <Link href="/model-evals" className="text-xs text-accent hover:text-link-hover">
            ← Back to Model Evals overview
          </Link>
        </section>
      </main>

      <footer className="border-t border-border mt-4 py-3">
        <div className="max-w-5xl mx-auto px-6 text-[10px] text-text-secondary uppercase tracking-widest">
          GovTools · Model Evals · Host classification
        </div>
      </footer>
    </div>
  );
}
