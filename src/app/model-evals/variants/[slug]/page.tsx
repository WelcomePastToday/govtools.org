import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VARIANTS, getVariant, type Variant } from "../../_data/variants";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return VARIANTS.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const variant = getVariant(slug);
  if (!variant) return { title: "Variant not found — Model Evals | GovTools" };
  return {
    title: `${variant.name} — Model Evals | GovTools`,
    description: variant.oneLine,
  };
}

const CATEGORY_LABEL: Record<Variant["category"], string> = {
  pipeline: "Pipeline version",
  card: "Per-table card variant",
  map: "Document-level map structure",
  mode: "Evaluation mode",
};

const STATUS_LABEL: Record<Variant["status"], string> = {
  "production-recommended": "Production · recommended",
  experimental: "Experimental",
  deprecated: "Deprecated",
  baseline: "Baseline",
  reference: "Reference / negative control",
};

const RESOURCE_LABEL: Record<Variant["generation"]["resourceIntensity"], string> = {
  low: "Low — CPU-only post-processing, runs in seconds",
  medium: "Medium — model inference or moderate I/O",
  high: "High — Docling extraction with OCR, multi-minute",
  "very-high": "Very high — exceeds typical context windows",
};

const DETERMINISM_LABEL: Record<Variant["generation"]["determinism"], string> = {
  deterministic: "Deterministic (same input → same output, byte-identical)",
  "deterministic-with-llm-step": "Mostly deterministic, with one bounded LLM step",
  "non-deterministic-llm": "Non-deterministic (LLM call without temperature pinning)",
};

const OCR_LABEL: Record<Variant["generation"]["ocrUsed"], string> = {
  yes: "Yes — this variant runs OCR itself",
  no: "No — works on born-digital text only",
  "inherits-from-docling": "Inherits from Docling's extraction step",
  "inherits-from-pipeline": "Inherits from the upstream pipeline variant",
};

export default async function VariantDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const variant = getVariant(slug);
  if (!variant) notFound();

  return (
    <div className="min-h-screen bg-paper text-ink font-sans">

      <header className="border-b border-border bg-paper sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-baseline gap-4">
            <Link href="/" className="text-xl font-bold tracking-tight text-ink hover:text-accent transition-colors">
              GovTools
            </Link>
            <span className="text-xs text-text-secondary uppercase tracking-widest hidden sm:inline-block">
              <Link href="/model-evals" className="hover:text-accent transition-colors">Model Evals</Link>
              <span className="mx-2">›</span>
              <Link href="/model-evals/variants" className="hover:text-accent transition-colors">Variants</Link>
              <span className="mx-2">›</span>
              {variant.name}
            </span>
          </div>
          <div className="text-xs font-medium text-text-secondary uppercase tracking-widest">
            {CATEGORY_LABEL[variant.category]}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">

        {/* Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-16 mb-16 border-b border-border">
          <div className="lg:pr-12">
            <div className="text-xs text-text-secondary uppercase tracking-widest mb-4">
              {CATEGORY_LABEL[variant.category]} · {STATUS_LABEL[variant.status]}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-6 text-ink">
              {variant.name}
            </h1>
            <p className="text-base text-text-secondary leading-relaxed">
              {variant.oneLine}
            </p>
          </div>
          <div className="lg:pt-8">
            <div className="text-xs text-text-secondary uppercase tracking-widest mb-3">
              In one paragraph
            </div>
            <p className="text-sm leading-relaxed pt-4 border-t border-border text-ink">
              {variant.description}
            </p>
          </div>
        </section>

        {/* Generation specifics */}
        <Section title="How the inputs are generated" tag="Generation · 01">

          <DetailGrid>
            <DetailRow label="Generator script">
              <code className="text-xs bg-panel px-1.5 py-0.5">{variant.generation.generatorScript}</code>
            </DetailRow>

            <DetailRow label="Input sources">
              <ul className="text-sm leading-relaxed text-ink space-y-1">
                {variant.generation.inputSources.map((src, i) => (
                  <li key={i}>• {src}</li>
                ))}
              </ul>
            </DetailRow>

            <DetailRow label="AI use">
              <div className="text-sm leading-relaxed text-ink">
                <span className="font-medium">
                  {variant.generation.aiUsed ? "Yes" : "No — pure deterministic transformation"}
                </span>
                {variant.generation.aiUsageNote && (
                  <div className="text-text-secondary mt-1">{variant.generation.aiUsageNote}</div>
                )}
              </div>
            </DetailRow>

            <DetailRow label="OCR / re-OCR">
              <div className="text-sm leading-relaxed text-ink">
                {OCR_LABEL[variant.generation.ocrUsed]}
                {variant.generation.ocrTool && (
                  <div className="text-text-secondary mt-1">
                    Tool: <code className="text-xs bg-panel px-1.5 py-0.5">{variant.generation.ocrTool}</code>
                  </div>
                )}
              </div>
            </DetailRow>

            <DetailRow label="Approximate processing time">
              <div className="text-sm leading-relaxed text-ink">{variant.generation.processingTime}</div>
            </DetailRow>

            <DetailRow label="Resource intensity">
              <div className="text-sm leading-relaxed text-ink">{RESOURCE_LABEL[variant.generation.resourceIntensity]}</div>
            </DetailRow>

            <DetailRow label="Determinism">
              <div className="text-sm leading-relaxed text-ink">{DETERMINISM_LABEL[variant.generation.determinism]}</div>
            </DetailRow>

            {variant.outputLocation && (
              <DetailRow label="Output location">
                <code className="text-xs bg-panel px-1.5 py-0.5">{variant.outputLocation}</code>
              </DetailRow>
            )}

            {variant.cardCount && (
              <DetailRow label="Cards produced">
                <div className="text-sm leading-relaxed text-ink">{variant.cardCount}</div>
              </DetailRow>
            )}

            {variant.introducedIn && (
              <DetailRow label="Introduced">
                <div className="text-sm leading-relaxed text-text-secondary">{variant.introducedIn}</div>
              </DetailRow>
            )}
          </DetailGrid>

        </Section>

        {/* Results */}
        {variant.results && (
          <Section title="Evaluation results" tag="Diagnostic · 02">
            <DetailGrid>
              {variant.results.bestOpenModelScore && (
                <DetailRow label="Best open-model score">
                  <div className="text-sm leading-relaxed text-ink">
                    <span className="font-medium">{variant.results.bestOpenModelScore}</span>
                    {variant.results.bestOpenModels && variant.results.bestOpenModels.length > 0 && (
                      <span className="text-text-secondary"> — {variant.results.bestOpenModels.join(", ")}</span>
                    )}
                  </div>
                </DetailRow>
              )}

              {variant.results.avgOpenTierPassRate && (
                <DetailRow label="Avg open-tier pass rate">
                  <div className="text-sm leading-relaxed text-ink">{variant.results.avgOpenTierPassRate}</div>
                </DetailRow>
              )}

              {variant.results.typicalCardSize && (
                <DetailRow label="Typical card size">
                  <div className="text-sm leading-relaxed text-ink">{variant.results.typicalCardSize}</div>
                </DetailRow>
              )}

              {variant.results.cycleNumber && (
                <DetailRow label="Evaluation cycle">
                  <div className="text-sm leading-relaxed text-ink">Cycle {variant.results.cycleNumber}</div>
                </DetailRow>
              )}

              {variant.results.relativeToBaseline && (
                <DetailRow label="Relative to v0.6.1 baseline">
                  <div className="text-sm leading-relaxed text-ink">{variant.results.relativeToBaseline}</div>
                </DetailRow>
              )}
            </DetailGrid>
          </Section>
        )}

        {/* Closes which questions */}
        {variant.closesQuestions && variant.closesQuestions.length > 0 && (
          <Section title="Questions this variant addresses" tag="Coverage · 03">
            <ul className="text-sm leading-relaxed text-ink space-y-2">
              {variant.closesQuestions.map((q, i) => (
                <li key={i} className="border-l-2 border-status-success bg-panel p-3">{q}</li>
              ))}
            </ul>
          </Section>
        )}

        {/* Example */}
        {variant.exampleHeader && (
          <Section title="Example transformation" tag="Sample · 04">
            <pre className="bg-panel border border-border p-6 overflow-x-auto text-xs leading-relaxed font-mono whitespace-pre-wrap text-ink">
              {variant.exampleHeader}
            </pre>
          </Section>
        )}

        {/* Caveats */}
        {variant.caveats && variant.caveats.length > 0 && (
          <Section title="Caveats and known limitations" tag="Scope · 05">
            <div className="border-l-2 border-status-warning bg-panel p-4">
              <ul className="text-sm leading-relaxed text-ink space-y-2">
                {variant.caveats.map((c, i) => (
                  <li key={i}>• {c}</li>
                ))}
              </ul>
            </div>
          </Section>
        )}

        {/* Related */}
        {variant.relatedSlugs && variant.relatedSlugs.length > 0 && (
          <Section title="Related variants" tag="Cross-reference · 06">
            <ul className="space-y-3">
              {variant.relatedSlugs.map((s) => {
                const related = getVariant(s);
                if (!related) return null;
                return (
                  <li key={s}>
                    <Link
                      href={`/model-evals/variants/${s}`}
                      className="grid grid-cols-[200px_1fr] gap-6 py-3 border-b border-border hover:bg-panel transition-colors"
                    >
                      <div className="text-xs text-text-secondary uppercase tracking-widest font-medium pt-1">
                        {CATEGORY_LABEL[related.category]}
                      </div>
                      <div>
                        <div className="text-base font-medium text-ink mb-1">{related.name}</div>
                        <div className="text-sm text-text-secondary leading-relaxed">{related.oneLine}</div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Section>
        )}

        {/* Back nav */}
        <section className="mt-16 pt-8 border-t border-border">
          <Link
            href="/model-evals/variants"
            className="text-sm text-accent hover:text-link-hover"
          >
            ← Back to all variants
          </Link>
        </section>

      </main>

      <footer className="border-t border-border mt-16 py-8">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs text-text-secondary leading-relaxed">
            Variant metadata is drawn from the project repository at{" "}
            <a href="https://github.com/WelcomePastToday/Model Evals" className="text-accent hover:text-link-hover">
              github.com/WelcomePastToday/Model Evals
            </a>{" "}
            and is updated as new evaluation cycles complete.
          </p>
        </div>
      </footer>

    </div>
  );
}

function Section({ title, tag, children }: { title: string; tag: string; children: React.ReactNode }) {
  return (
    <section className="mb-16">
      <div className="flex items-baseline justify-between border-b border-border pb-2 mb-6">
        <h2 className="text-lg font-bold text-ink tracking-tight">{title}</h2>
        <span className="text-xs text-text-secondary uppercase tracking-widest">{tag}</span>
      </div>
      {children}
    </section>
  );
}

function DetailGrid({ children }: { children: React.ReactNode }) {
  return <div className="border-t border-border">{children}</div>;
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-2 md:gap-6 py-4 border-b border-border">
      <div className="text-xs text-text-secondary uppercase tracking-widest font-medium pt-1">
        {label}
      </div>
      <div>{children}</div>
    </div>
  );
}
