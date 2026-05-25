import type { Metadata } from "next";
import Link from "next/link";
import { VARIANTS_BY_CATEGORY, type Variant } from "../_data/variants";

export const metadata: Metadata = {
  title: "Variants and evaluation modes — Erschließung | GovTools",
  description:
    "Detailed inputs, processing time, AI use, OCR, and results for every Erschließung pipeline variant, card variant, document map, and evaluation mode.",
};

const STATUS_BADGE_CLASSES: Record<Variant["status"], string> = {
  "production-recommended": "border-status-success text-status-success",
  experimental: "border-accent text-accent",
  baseline: "border-border text-text-secondary",
  reference: "border-border text-text-secondary",
  deprecated: "border-status-warning text-status-warning",
};

const STATUS_LABEL: Record<Variant["status"], string> = {
  "production-recommended": "Recommended",
  experimental: "Experimental",
  baseline: "Baseline",
  reference: "Reference",
  deprecated: "Deprecated",
};

const CATEGORY_HEADERS: Record<string, { title: string; tag: string }> = {
  pipeline: { title: "Pipeline versions",          tag: "01" },
  card:     { title: "Per-table card variants",    tag: "02" },
  map:      { title: "Document-level maps",        tag: "03" },
  mode:     { title: "Evaluation modes",           tag: "04" },
};

export default function VariantsIndexPage() {
  return (
    <div className="min-h-screen bg-paper text-ink font-sans">

      <header className="border-b border-border bg-paper sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-baseline gap-4">
            <Link href="/" className="text-xl font-bold tracking-tight text-ink hover:text-accent transition-colors">
              GovTools
            </Link>
            <span className="text-xs text-text-secondary uppercase tracking-widest hidden sm:inline-block">
              <Link href="/erschliessung" className="hover:text-accent transition-colors">Erschließung</Link>
              <span className="mx-2">›</span>
              Variants
            </span>
          </div>
          <div className="text-xs font-medium text-text-secondary uppercase tracking-widest">
            Variants index
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6">

        <section className="pb-3 mb-4 border-b border-border flex items-baseline justify-between gap-4 flex-wrap">
          <h1 className="text-xl font-bold tracking-tight text-ink">
            Variants and evaluation modes
          </h1>
          <p className="text-xs text-text-secondary leading-snug max-w-2xl">
            Every variant has a detail page documenting inputs, generator script, AI use, OCR tool, processing time, results, and known limitations.
          </p>
        </section>

        {(["pipeline", "card", "map", "mode"] as const).map((category) => {
          const variants = VARIANTS_BY_CATEGORY[category];
          if (variants.length === 0) return null;
          const h = CATEGORY_HEADERS[category];
          return (
            <section key={category} className="mb-4">
              <div className="flex items-baseline justify-between border-b border-border pb-1 mb-1">
                <h2 className="text-xs font-bold text-ink uppercase tracking-widest">{h.title}</h2>
                <span className="text-[10px] text-text-secondary uppercase tracking-widest">{h.tag}</span>
              </div>

              <ul>
                {variants.map((v) => (
                  <li key={v.slug}>
                    <Link
                      href={`/erschliessung/variants/${v.slug}`}
                      className="grid grid-cols-[1fr_auto_auto] gap-4 items-baseline py-1 border-b border-border/60 hover:bg-panel transition-colors text-xs leading-snug"
                    >
                      <div className="min-w-0 flex items-baseline gap-2 flex-wrap">
                        <span className="font-medium text-ink truncate">{v.name}</span>
                        <span className="text-text-secondary truncate">— {v.oneLine}</span>
                      </div>
                      <span
                        className={`text-[9px] uppercase tracking-widest font-medium border px-1.5 py-px ${STATUS_BADGE_CLASSES[v.status]}`}
                      >
                        {STATUS_LABEL[v.status]}
                      </span>
                      <span className="text-text-secondary tabular-nums text-[11px] min-w-[80px] text-right">
                        {v.results?.bestOpenModelScore
                          ? `Best ${v.results.bestOpenModelScore}`
                          : v.results?.avgOpenTierPassRate
                            ? `Open ${v.results.avgOpenTierPassRate}`
                            : "—"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <section className="mt-4 pt-2 border-t border-border">
          <Link href="/erschliessung" className="text-xs text-accent hover:text-link-hover">
            ← Back to Erschließung overview
          </Link>
        </section>

      </main>

      <footer className="border-t border-border mt-4 py-2">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[10px] text-text-secondary leading-snug">
            Variant metadata drawn from{" "}
            <a href="https://github.com/WelcomePastToday/Erschliessung" className="text-accent hover:text-link-hover">
              github.com/WelcomePastToday/Erschliessung
            </a>
            ; updated as evaluation cycles complete.
          </p>
        </div>
      </footer>

    </div>
  );
}
