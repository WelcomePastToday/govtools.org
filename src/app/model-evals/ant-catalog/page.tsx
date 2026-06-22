import type { Metadata } from "next";
import Link from "next/link";
import { ANT_MODEL_ROWS, ANT_RUN_META, ANT_ROUTING, type AntModelRow } from "../_data/antCatalog";

export const metadata: Metadata = {
  title: "ANT catalog-metadata model comparison | Model Evals",
  description:
    "Which model to use for extracting catalog metadata from government documents — reliability, speed, tokens, and cost across hosted and free local models. An Archival Notation Tracer (ANT) variation of the Model Evals benchmark.",
};

function fmtCost(r: AntModelRow): string {
  if (r.tier === "local") return "free";
  if (r.costPer1kDocs == null) return "—";
  return `$${r.costPer1kDocs.toFixed(2)}`;
}

function fmtAcc(r: AntModelRow): string {
  if (r.accuracy == null) return "—";
  return r.accuracy.toFixed(2) + (r.isPanel ? "*" : "");
}

function Row({ r }: { r: AntModelRow }) {
  const reliability = r.ok === r.n ? "text-status-success" : r.ok / Math.max(1, r.n) >= 0.5 ? "text-ink" : "text-status-warning";
  const accClass = r.isPanel
    ? "text-text-secondary italic"
    : r.accuracy == null
      ? "text-text-secondary"
      : r.accuracy >= 0.7 ? "text-status-success" : r.accuracy >= 0.55 ? "text-ink" : "text-status-warning";
  return (
    <tr className="border-b border-border/60 hover:bg-panel transition-colors">
      <td className="py-1.5 pr-4 font-medium text-ink whitespace-nowrap">{r.model}</td>
      <td className={`py-1.5 px-2 tabular-nums text-right font-medium ${accClass}`}>{fmtAcc(r)}</td>
      <td className={`py-1.5 px-2 tabular-nums text-right ${reliability}`}>{r.ok}/{r.n}</td>
      <td className="py-1.5 px-2 tabular-nums text-right text-text-secondary">{r.validOutputRate == null ? "—" : (r.validOutputRate * 100).toFixed(0) + "%"}</td>
      <td className="py-1.5 px-2 tabular-nums text-right text-text-secondary">{r.avgLatencyS.toFixed(1)}s</td>
      <td className="py-1.5 px-2 tabular-nums text-right text-text-secondary">{r.avgRespTok}</td>
      <td className="py-1.5 pl-2 tabular-nums text-right font-medium text-ink">{fmtCost(r)}</td>
    </tr>
  );
}

function Table({ rows, title, tag }: { rows: AntModelRow[]; title: string; tag: string }) {
  if (rows.length === 0) return null;
  return (
    <section className="mb-7">
      <div className="flex items-baseline justify-between border-b border-border pb-1 mb-2">
        <h2 className="text-xs font-bold text-ink uppercase tracking-widest">{title}</h2>
        <span className="text-[10px] text-text-secondary uppercase tracking-widest">{tag}</span>
      </div>
      <table className="w-full text-xs leading-snug">
        <thead>
          <tr className="text-[10px] uppercase tracking-widest text-text-secondary">
            <th className="py-1 pr-4 text-left font-medium">Model</th>
            <th className="py-1 px-2 text-right font-medium">Accuracy</th>
            <th className="py-1 px-2 text-right font-medium">OK/n</th>
            <th className="py-1 px-2 text-right font-medium">Valid schema</th>
            <th className="py-1 px-2 text-right font-medium">Latency</th>
            <th className="py-1 px-2 text-right font-medium">Resp tok</th>
            <th className="py-1 pl-2 text-right font-medium">$/1k docs</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <Row key={r.model} r={r} />
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default function AntCatalogPage() {
  const hosted = ANT_MODEL_ROWS.filter((r) => r.tier === "hosted");
  const local = ANT_MODEL_ROWS.filter((r) => r.tier === "local");

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
            <Link href="/model-evals" className="text-xs font-medium text-text-secondary uppercase tracking-widest hover:text-accent transition-colors">
              Overview
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6">
        <section className="pb-3 mb-4 border-b border-border flex items-baseline justify-between gap-4 flex-wrap">
          <h1 className="text-xl font-bold tracking-tight text-ink">
            Catalog-metadata extraction — model comparison
          </h1>
          <p className="text-xs text-text-secondary leading-snug max-w-2xl">
            One of two <strong className="text-ink">automated metadata-assertion pipeline</strong> evaluations:
            this tests the ability to <strong className="text-ink">create document metadata — especially
            government classification</strong>; the companion{" "}
            <Link href="/model-evals/interpolation" className="text-accent hover:text-link-hover">Interpolation</Link>{" "}
            evaluation tests reasoning over tables and charts inside PDFs. Which model to use for extracting catalog
            metadata (title, document type, date, subjects, named entities, issuing body, abstract…) from government
            documents. {ANT_RUN_META.models} models × {ANT_RUN_META.docs} documents. Generated {ANT_RUN_META.generated}.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-[10px] font-bold text-ink uppercase tracking-widest border-b border-border pb-1 mb-2">
            Reading this table
          </h2>
          <p className="text-xs text-text-secondary leading-snug">
            <strong className="text-ink">Accuracy</strong> = macro mean of per-field agreement vs a{" "}
            <strong className="text-ink">frontier-consensus silver reference</strong> (panel gpt-4.1 / claude-opus-4-8 /
            gemini-2.5-flash, with grok-4 arbitrating disagreements). Rows marked <strong className="text-ink">*</strong>{" "}
            are panel members — they <em>define</em> the reference, so their accuracy is circular/inflated; judge them
            by cost, not accuracy. <strong className="text-ink">Valid schema</strong> = share of outputs that parsed
            into the controlled {"{value,code}"} schema (instruction-following, not correctness). Sample = {ANT_RUN_META.docs} docs
            (directional). Cost is an approximate $/1,000-docs estimate (observed tokens × public list prices). Locals run free.
          </p>
        </section>

        <Table rows={hosted} title="Hosted (paid API)" tag="01" />
        <Table rows={local} title="Local open models (free)" tag="02" />

        {ANT_ROUTING.length > 0 && (
          <section className="mb-7">
            <div className="flex items-baseline justify-between border-b border-border pb-1 mb-2">
              <h2 className="text-xs font-bold text-ink uppercase tracking-widest">Per-field routing — best non-panel model</h2>
              <span className="text-[10px] text-text-secondary uppercase tracking-widest">03</span>
            </div>
            <p className="text-xs text-text-secondary leading-snug mb-2">
              Accuracy is field-dependent, so the cheapest correct pipeline routes each field to the best
              (non-panel) model for it rather than picking one model overall.
            </p>
            <table className="w-full text-xs leading-snug">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-text-secondary">
                  <th className="py-1 pr-4 text-left font-medium">Field</th>
                  <th className="py-1 px-2 text-left font-medium">Best model</th>
                  <th className="py-1 pl-2 text-right font-medium">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {ANT_ROUTING.map((r) => (
                  <tr key={r.field} className="border-b border-border/60 hover:bg-panel transition-colors">
                    <td className="py-1.5 pr-4 font-medium text-ink whitespace-nowrap">{r.field}</td>
                    <td className="py-1.5 px-2 text-text-secondary whitespace-nowrap">{r.bestModel ?? "—"}</td>
                    <td className="py-1.5 pl-2 tabular-nums text-right text-ink">{r.accuracy == null ? "—" : r.accuracy.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <section className="mb-6 text-xs text-text-secondary leading-snug">
          <h2 className="text-xs font-bold text-ink uppercase tracking-widest border-b border-border pb-1 mb-2">
            The cost story
          </h2>
          <p className="mb-1.5">
            The current catalog pipeline runs on <strong className="text-ink">grok-4.20</strong> (~grok-4 tier,
            ~0.74 accuracy here). Field-completeness alone suggested cheap/free models were equivalent — but{" "}
            <strong className="text-ink">accuracy tells a sharper story</strong>: free local models emit perfect
            schema yet get more values wrong (≈0.46–0.51), and <strong className="text-ink">gpt-4o-mini</strong>{" "}
            (~24× cheaper) drops to ≈0.55. The strongest genuinely-cheap, non-panel option is{" "}
            <strong className="text-ink">claude-haiku-4-5</strong> (≈0.65).
          </p>
          <p>
            Because accuracy is <strong className="text-ink">field-dependent</strong> (jurisdiction codes are easy
            for everyone; document type and title are not), the cheapest <em>correct</em> pipeline is{" "}
            <strong className="text-ink">per-field routing</strong> (table 03) rather than one model overall.
            Reference is frontier-consensus silver on {ANT_RUN_META.docs} docs — directional, not a human gold set.
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
