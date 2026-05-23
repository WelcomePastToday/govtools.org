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

const CATEGORY_HEADERS: Record<string, { title: string; tag: string; intro: string }> = {
  pipeline: {
    title: "Pipeline versions",
    tag: "Stage · 01",
    intro: "The mainline pipeline outputs. Each new version adds structure, context, or signal to the per-table card. Card variants and maps are derived from these as card-level transforms — they do not re-run Docling.",
  },
  card: {
    title: "Per-table card variants",
    tag: "Stage · 02",
    intro: "Card-level transforms of the same pipeline-v0.6.1 base. They differ only in what they keep, strip, or rewrite — never in what Docling extracted. They are cheap to generate, deterministic, and reproducible.",
  },
  map: {
    title: "Document-level map structures",
    tag: "Stage · 03",
    intro: "Maps aggregate information across all cards in a document — table-of-contents indexes, multi-page continuation lookups, time-and-place scopes. They are designed to support two-shot retrieval where the model first selects, then receives.",
  },
  mode: {
    title: "Evaluation modes",
    tag: "Stage · 04",
    intro: "The harness can serve cards to a model in different ways. Each mode tests a different question: oracle retrieval (M3-L4), all-cards bundling (M3-AC), or full-document linearization (M2c, M2a).",
  },
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

      <main className="max-w-5xl mx-auto px-6 py-16">

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-16 mb-16 border-b border-border">
          <div className="lg:pr-12">
            <div className="text-xs text-text-secondary uppercase tracking-widest mb-4">
              Variants and evaluation modes
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6 text-ink">
              Every variant has a page. Every page is honest about how it was generated.
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed">
              Inputs, generator script, AI use, OCR tool, approximate processing time, resource intensity, evaluation results, and known limitations — for every variant and evaluation mode tested in this project.
            </p>
          </div>
          <div className="lg:pt-8">
            <div className="text-xs text-text-secondary uppercase tracking-widest mb-3">
              How to read this index
            </div>
            <p className="text-sm leading-relaxed pt-4 border-t border-border text-ink">
              Variants are grouped by what they transform: a whole pipeline version, a single card, a document-level map, or the evaluation mode itself. Click any entry for the detailed input recipe, runtime characteristics, and evaluation results.
            </p>
          </div>
        </section>

        {(["pipeline", "card", "map", "mode"] as const).map((category) => {
          const variants = VARIANTS_BY_CATEGORY[category];
          if (variants.length === 0) return null;
          const h = CATEGORY_HEADERS[category];
          return (
            <section key={category} className="mb-16">
              <div className="flex items-baseline justify-between border-b border-border pb-2 mb-6">
                <h2 className="text-lg font-bold text-ink tracking-tight">{h.title}</h2>
                <span className="text-xs text-text-secondary uppercase tracking-widest">{h.tag}</span>
              </div>
              <p className="text-sm leading-relaxed text-text-secondary mb-8 max-w-3xl">{h.intro}</p>

              <ul className="border-t border-border">
                {variants.map((v) => (
                  <li key={v.slug}>
                    <Link
                      href={`/erschliessung/variants/${v.slug}`}
                      className="grid grid-cols-1 md:grid-cols-[1fr_120px_140px] gap-2 md:gap-6 py-5 border-b border-border hover:bg-panel transition-colors"
                    >
                      <div>
                        <div className="text-base font-medium text-ink mb-1">{v.name}</div>
                        <div className="text-sm text-text-secondary leading-relaxed">{v.oneLine}</div>
                      </div>
                      <div className="hidden md:flex items-start justify-end">
                        <span
                          className={`text-[10px] uppercase tracking-widest font-medium border px-2 py-0.5 ${STATUS_BADGE_CLASSES[v.status]}`}
                        >
                          {STATUS_LABEL[v.status]}
                        </span>
                      </div>
                      <div className="hidden md:flex items-start justify-end">
                        <span className="text-xs text-text-secondary tabular-nums whitespace-nowrap">
                          {v.results?.bestOpenModelScore
                            ? `Best: ${v.results.bestOpenModelScore}`
                            : v.results?.avgOpenTierPassRate
                              ? `Open: ${v.results.avgOpenTierPassRate}`
                              : "—"}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <section className="mt-16 pt-8 border-t border-border">
          <Link href="/erschliessung" className="text-sm text-accent hover:text-link-hover">
            ← Back to Erschließung overview
          </Link>
        </section>

      </main>

      <footer className="border-t border-border mt-16 py-8">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs text-text-secondary leading-relaxed">
            Variant metadata is drawn from the project repository at{" "}
            <a href="https://github.com/WelcomePastToday/Erschliessung" className="text-accent hover:text-link-hover">
              github.com/WelcomePastToday/Erschliessung
            </a>{" "}
            and is updated as new evaluation cycles complete.
          </p>
        </div>
      </footer>

    </div>
  );
}
