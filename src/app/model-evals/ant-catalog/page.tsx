import type { Metadata } from "next";
import Link from "next/link";
import { ANT_MODEL_ROWS, ANT_RUN_META, ANT_FIELD_COLS, ANT_FIELD_MATRIX } from "../_data/antCatalog";
import AntCatalogTable from "./AntCatalogTable";

export const metadata: Metadata = {
  title: "ANT catalog-metadata model comparison | Model Evals",
  description:
    "Which model to use for extracting catalog metadata from government documents — accuracy, schema validity, speed, and cost across hosted and free local models. An Archival Notation Tracer (ANT) variation of the Model Evals benchmark.",
};

const PANEL = new Set(ANT_MODEL_ROWS.filter((r) => r.isPanel).map((r) => r.model));
const tierOf = (model: string) => ANT_MODEL_ROWS.find((r) => r.model === model)?.tier;

// Three distinct "best" claims — never collapse these into one. Panel members
// define the silver reference, so their accuracy is circular/inflated; a
// "best overall" that quietly means "best paid flagship" is exactly the
// framing we want to avoid crowning without the free/local counterpart.
const scored = ANT_MODEL_ROWS.filter((r) => r.accuracy != null);
const bestOverall = scored.reduce((a, b) => ((b.accuracy ?? -1) > (a.accuracy ?? -1) ? b : a));
const bestNonPanelPaid = scored
  .filter((r) => r.tier === "hosted" && !r.isPanel)
  .reduce((a, b) => ((b.accuracy ?? -1) > (a.accuracy ?? -1) ? b : a));
const bestFree = scored
  .filter((r) => r.tier === "local")
  .reduce((a, b) => ((b.accuracy ?? -1) > (a.accuracy ?? -1) ? b : a));
const freeVsPaidGap =
  bestNonPanelPaid.accuracy != null && bestFree.accuracy != null
    ? bestNonPanelPaid.accuracy - bestFree.accuracy
    : null;

// Per-field best FREE/local model (mirrors the host-classification eval's
// "best free model" routing table) — computed from the same shipped matrix,
// no re-run needed.
const bestFreePerField = ANT_FIELD_MATRIX.map((row) => {
  let best: { model: string; score: number } | null = null;
  for (const col of ANT_FIELD_COLS) {
    if (tierOf(col.model) !== "local") continue;
    const v = row.scores[col.model];
    if (v != null && (best == null || v > best.score)) best = { model: col.model, score: v };
  }
  return { field: row.field, best };
}).filter((r) => r.best != null) as { field: string; best: { model: string; score: number } }[];

export default function AntCatalogPage() {
  return (
    <div className="min-h-screen bg-paper text-ink font-sans">
      <header className="border-b border-border bg-paper sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-baseline gap-4">
            <Link href="/" className="text-xl font-bold tracking-tight text-ink hover:text-accent transition-colors">
              GovTools
            </Link>
            <span className="text-xs text-text-secondary uppercase tracking-widest hidden sm:inline-block">
              Model Evals: ANT catalog eval
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/model-evals/variants" className="text-xs font-medium text-text-secondary uppercase tracking-widest hover:text-accent transition-colors">
              Variants
            </Link>
            <Link href="/model-evals/host-class" className="text-xs font-medium text-text-secondary uppercase tracking-widest hover:text-accent transition-colors">
              Host Classification
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
            Catalog-metadata extraction — model comparison
          </h1>
          <p className="text-xs text-text-secondary leading-snug max-w-2xl mt-1">
            Which model best extracts catalog metadata (title, document type, date, subjects, named entities,
            issuing body) from government documents. {ANT_RUN_META.models} models × {ANT_RUN_META.docs} documents,
            generated {ANT_RUN_META.generated}. Companion to the{" "}
            <Link href="/model-evals/interpolation" className="text-accent hover:text-link-hover">Interpolation</Link>{" "}
            eval (reasoning over tables and charts in PDFs).
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-[10px] font-bold text-ink uppercase tracking-widest border-b border-border pb-1 mb-2">
            Reading this table
          </h2>
          <p className="text-xs text-text-secondary leading-snug">
            Click any column to sort. <strong className="text-ink">Accuracy</strong> = macro mean of per-field
            agreement vs a <strong className="text-ink">frontier-consensus silver reference</strong> (panel gpt-4.1 /
            claude-opus-4-8 / gemini-2.5-flash, grok-4 arbitrating). Rows marked <strong className="text-ink">*</strong>{" "}
            are panel members — they <em>define</em> the reference, so their accuracy is circular/inflated; judge them
            by cost, not accuracy. <strong className="text-ink">Completed</strong> = documents that returned a usable
            result / attempted. <strong className="text-ink">Valid schema</strong> = share of outputs that parsed
            into the controlled {"{value, code}"} schema (instruction-following, not correctness).{" "}
            <strong className="text-ink">$/1k docs</strong> = approximate cost per 1,000 documents (observed tokens ×
            public list prices); locals run free. Sample = {ANT_RUN_META.docs} docs (directional).
          </p>
        </section>

        <section className="mb-7">
          <div className="flex items-baseline justify-between border-b border-border pb-1 mb-2">
            <h2 className="text-xs font-bold text-ink uppercase tracking-widest">All models — hosted &amp; local</h2>
            <span className="text-[10px] text-text-secondary uppercase tracking-widest">01 · sortable</span>
          </div>
          <AntCatalogTable rows={ANT_MODEL_ROWS} />
        </section>

        {ANT_FIELD_MATRIX.length > 0 && (
          <section className="mb-7">
            <div className="flex items-baseline justify-between border-b border-border pb-1 mb-2">
              <h2 className="text-xs font-bold text-ink uppercase tracking-widest">Per-field accuracy — every model</h2>
              <span className="text-[10px] text-text-secondary uppercase tracking-widest">02</span>
            </div>
            <p className="text-xs text-text-secondary leading-snug mb-2">
              Accuracy is field-dependent, so the cheapest correct pipeline routes each field to its best model
              rather than picking one model overall. Each cell is per-field agreement accuracy.{" "}
              <strong className="text-ink">Gold</strong> = best non-panel model for that field (cost-agnostic routing
              pick). <strong className="text-status-success">Green ring</strong> = best <em>free/local</em> model for
              that field (table 03) — the pick if you can only route to models with no per-token cost.
            </p>
            <div className="overflow-x-auto">
              <table className="text-xs leading-snug border-collapse">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-text-secondary">
                    <th className="py-1 pr-3 text-left font-medium sticky left-0 bg-background">Field</th>
                    {ANT_FIELD_COLS.map((c) => (
                      <th
                        key={c.model}
                        title={c.model + (c.macro == null ? "" : ` · macro ${c.macro.toFixed(2)}`) + (tierOf(c.model) === "local" ? " · free/local" : "")}
                        className={`py-1 px-2 text-right font-medium whitespace-nowrap ${c.isPanel ? "text-text-secondary/60" : ""}`}
                      >
                        {c.short}{c.isPanel ? "°" : ""}{tierOf(c.model) === "local" ? "†" : ""}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ANT_FIELD_MATRIX.map((r) => {
                    const freeBestModel = bestFreePerField.find((f) => f.field === r.field)?.best?.model;
                    return (
                      <tr key={r.field} className="border-b border-border/60 hover:bg-panel transition-colors">
                        <td className="py-1.5 pr-3 font-medium text-ink whitespace-nowrap sticky left-0 bg-background">{r.field}</td>
                        {ANT_FIELD_COLS.map((c) => {
                          const v = r.scores[c.model];
                          const isBest = r.bestModel === c.model;
                          const isFreeBest = freeBestModel === c.model;
                          return (
                            <td
                              key={c.model}
                              className={`py-1.5 px-2 tabular-nums text-right ${
                                isBest
                                  ? "font-bold text-accent bg-accent/10"
                                  : c.isPanel
                                    ? "text-text-secondary/60"
                                    : "text-ink"
                              } ${isFreeBest ? "ring-1 ring-inset ring-status-success" : ""}`}
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
              ° panel / reference-defining model (gpt-4.1, opus, gemini-flash) — its accuracy is circular and
              shown muted, not eligible as a routing target. † free/local (Ollama) model. Gold = best non-panel
              model per field; green ring = best free/local model per field (table 03). Columns ordered by macro accuracy.
            </p>
          </section>
        )}

        <section className="mb-7">
          <div className="flex items-baseline justify-between border-b border-border pb-1 mb-2">
            <h2 className="text-xs font-bold text-ink uppercase tracking-widest">Per-field routing — best free/local model</h2>
            <span className="text-[10px] text-text-secondary uppercase tracking-widest">03</span>
          </div>
          <p className="text-xs text-text-secondary leading-snug mb-2">
            The best <strong className="text-ink">free, local</strong> (Ollama) model for each field — the pick if
            the pipeline can only route to models with $0 per-token cost, no matter what table 01&rsquo;s single
            best-overall model is.
          </p>
          <table className="text-xs leading-snug border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-text-secondary">
                <th className="py-1 pr-4 text-left font-medium">Field</th>
                <th className="py-1 pr-4 text-left font-medium">Best free model</th>
                <th className="py-1 px-2 text-right font-medium">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {bestFreePerField.map((r) => (
                <tr key={r.field} className="border-b border-border/60 hover:bg-panel transition-colors">
                  <td className="py-1.5 pr-4 font-medium text-ink whitespace-nowrap">{r.field}</td>
                  <td className="py-1.5 pr-4 text-ink whitespace-nowrap">{r.best.model}</td>
                  <td className={`py-1.5 px-2 tabular-nums text-right font-medium ${r.best.score >= 0.85 ? "text-status-success" : r.best.score >= 0.6 ? "text-ink" : "text-status-warning"}`}>
                    {r.best.score.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mb-6 text-xs text-text-secondary leading-snug">
          <h2 className="text-xs font-bold text-ink uppercase tracking-widest border-b border-border pb-1 mb-2">
            The cost story
          </h2>
          <p className="mb-1.5">
            Best free/local model: <strong className="text-ink">{bestFree.model}</strong> ={" "}
            {bestFree.accuracy?.toFixed(3)}. Best non-panel paid model:{" "}
            <strong className="text-ink">{bestNonPanelPaid.model}</strong> = {bestNonPanelPaid.accuracy?.toFixed(3)}.
            Gap: <strong className="text-ink">{freeVsPaidGap != null ? (freeVsPaidGap >= 0 ? "+" : "") + freeVsPaidGap.toFixed(3) : "—"}</strong>{" "}
            — free local models are not yet competitive here on raw accuracy, though they emit perfectly-formed
            schema every time. (Best overall, including circular panel members:{" "}
            <strong className="text-ink">{bestOverall.model}</strong> = {bestOverall.accuracy?.toFixed(3)} — not a
            deployable target, since it defines the reference it's scored against.)
          </p>
          <p>
            Because accuracy is <strong className="text-ink">field-dependent</strong> (jurisdiction codes are easy
            for everyone; document type and title are not), the cheapest <em>correct</em> pipeline is{" "}
            <strong className="text-ink">per-field routing</strong> (tables 02–03) rather than one model overall —
            and the free-model routing table (03) shows exactly where a $0 pipeline is viable field-by-field vs.
            where paying still helps. Reference is frontier-consensus silver on {ANT_RUN_META.docs} docs —
            directional, not a human gold set.
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
          GovTools · Model Evals · ANT catalog-metadata variation
        </div>
      </footer>
    </div>
  );
}
