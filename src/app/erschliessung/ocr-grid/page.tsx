import type { Metadata } from "next";
import Link from "next/link";
import { OCR_METHODS, LICENSE_LABEL, LICENSE_TINT, type OcrMethod } from "../_data/ocrMethods";
import { OCR_GRID_RESULTS, OCR_GRID_META, type OcrGridCell } from "../_data/ocrGrid";

export const metadata: Metadata = {
  title: "Erschließung — OCR-method × open-model grid | GovTools",
  description: "Heatmap of open-model pass rates by OCR method on archival table questions, plus per-method cost and license.",
};

// Open-tier models (Ollama local; can't see images)
const OPEN_MODELS = [
  { slug: 'apertus-8b',     label: 'Apertus 8B',       vendor: 'Swiss AI' },
  { slug: 'climategpt-13b', label: 'ClimateGPT 13B',   vendor: 'climate-domain Llama-2' },
  { slug: 'qwen2.5-7b',     label: 'Qwen 2.5 7B',      vendor: 'Alibaba' },
] as const;

// Closed-tier flagship API models. Each gets two scoring modes:
//   - text-only (reads the OCR-generated card) → fills the 5 OCR-method columns
//   - direct vision (reads the raw page image) → fills the 6th "no OCR" column
const FLAGSHIP_MODELS = [
  { slug: 'grok-4',          label: 'Grok-4',           vendor: 'xAI' },
  { slug: 'gemini-2.5-pro',  label: 'Gemini 2.5 Pro',   vendor: 'Google' },
  { slug: 'gpt-4o',          label: 'GPT-4o',           vendor: 'OpenAI' },
] as const;

const OCR_METHODS_IN_GRID = ['docling-easyocr', 'mistral-ocr', 'gpt4o-vision', 'gemini-vision', 'pixtral-vision'];
const FLAGSHIP_METHODS_IN_GRID = [...OCR_METHODS_IN_GRID, 'none-direct-vision'];

function passColor(rate: number | null, q: number): string {
  if (rate === null) return '#f5f5f5';
  // 0..1 → red (low) → amber (mid) → green (high) for q=correct
  // For partial we use a lighter scale.
  const palettes = {
    correct: ['#fbeae8', '#fff4dc', '#e6f4ec', '#22c55e'],
    band:    ['#fbeae8', '#fff4dc', '#fff4dc', '#e6f4ec'],
  } as const;
  const p = palettes[q === 0 ? 'correct' : 'band'];
  if (rate >= 0.75) return p[3];
  if (rate >= 0.5)  return p[2];
  if (rate >= 0.25) return p[1];
  return p[0];
}

interface CellSummary {
  total: number;
  correct: number;  // midpoint_pass
  band: number;     // band_pass (includes correct)
  errors: number;
}

function summarize(rows: readonly OcrGridCell[], model: string, method: string): CellSummary {
  const cells = rows.filter((r) => r.model === model && r.method === method && !r.error);
  const errors = rows.filter((r) => r.model === model && r.method === method && r.error).length;
  const total = cells.length;
  const correct = cells.filter((r) => r.midpoint_pass === true).length;
  const band = cells.filter((r) => r.band_pass === true).length;
  return { total, correct, band, errors };
}

export default function OcrGridPage() {
  const ocrMethods = OCR_METHODS_IN_GRID
    .map((slug) => OCR_METHODS.find((m) => m.slug === slug)!)
    .filter(Boolean);
  const flagshipMethods = FLAGSHIP_METHODS_IN_GRID
    .map((slug) => OCR_METHODS.find((m) => m.slug === slug)!)
    .filter(Boolean);
  const allMethods = OCR_METHODS; // for the license + cost table

  return (
    <div className="min-h-screen bg-paper text-ink font-sans">
      <header className="border-b border-border bg-paper sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-baseline gap-4">
            <Link href="/" className="text-xl font-bold tracking-tight text-ink hover:text-accent transition-colors">
              GovTools
            </Link>
            <span className="text-xs text-text-secondary uppercase tracking-widest hidden sm:inline-block">
              Erschließung: OCR-method grid
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/erschliessung/interpolation" className="text-xs font-medium text-text-secondary uppercase tracking-widest hover:text-accent">
              Interpolation
            </Link>
            <Link href="/erschliessung/ocr-grid" className="text-xs font-medium text-text-secondary uppercase tracking-widest hover:text-accent">
              OCR grid
            </Link>
            <a href="/erschliessung/heatmap.html" className="text-xs font-medium text-text-secondary uppercase tracking-widest hover:text-accent">
              Tests heatmap
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <section className="pb-8 mb-8 border-b border-border">
          <div className="text-xs text-text-secondary uppercase tracking-widest mb-3">
            OCR-method grid · {OCR_GRID_META.generatedDate}
          </div>
          <h1 className="text-lg md:text-xl font-bold tracking-tight leading-snug text-ink max-w-4xl mb-6">
            Same open model, same interpolation question, different OCR method to build the card.
            <br />
            How much of the pass-rate gap is the model, and how much is the table extractor?
          </h1>
          <div className="text-sm leading-relaxed text-text-secondary max-w-4xl space-y-3">
            <p>
              For each of the 12 final interpolation candidates (Tier-2 verified on{' '}
              <Link href="/erschliessung/interpolation" className="text-accent hover:text-link-hover">/interpolation</Link>),
              we regenerated the table card using {ocrMethods.length} different OCR methods and re-ran 3 open
              models + 3 closed flagship APIs on each card — plus a "no OCR, direct vision" column where the
              flagship sees the page image directly. {OCR_GRID_META.totalCells} (model × method × question) cells total,
              {' '}<span className="text-status-success font-medium">{OCR_GRID_META.correctCells} correct</span> /
              {' '}<span className="text-text-secondary font-medium">{OCR_GRID_META.partialCells} partial</span> /
              {' '}<span className="text-status-warning font-medium">{OCR_GRID_META.incorrectCells} incorrect</span>.
            </p>
            <p>
              <em>correct</em> = asserted value strictly between the source-cell endpoints (real interpolation);{' '}
              <em>partial</em> = in tolerance band but at/outside endpoints (often endpoint-echo); <em>incorrect</em> = miss.
            </p>
          </div>
        </section>

        {/* ─────────── Heatmap grids — open + flagship ─────────── */}
        <Section title="Pass-rate heatmap — open models × OCR method">
          <p className="text-xs text-text-secondary mb-4 leading-relaxed max-w-4xl">
            Each cell shows <strong>correct/total</strong> across the 12 interp questions for that
            (model, OCR method) pair. Cells are tinted by correct-rate (red → amber → green). Local
            open models can only read text, so they see the OCR-generated card — not the page image.
          </p>
          <Heatmap models={OPEN_MODELS} methods={ocrMethods} />
          <p className="text-xs text-text-secondary mt-4 leading-relaxed max-w-4xl">
            <strong className="text-ink font-medium">What to look for.</strong> Variance going across a row tells you
            how much the OCR method matters for that particular model. Variance going down a column tells you how
            the same OCR method serves different open models. If a column is roughly green across all three models,
            that OCR method is producing usable cards for the open-tier. If a row is consistently green, that open
            model is robust to OCR noise.
          </p>
        </Section>

        <Section title="Pass-rate heatmap — flagship API models × OCR method (text) + direct vision">
          <p className="text-xs text-text-secondary mb-4 leading-relaxed max-w-4xl">
            Same 12 questions, but answered by closed-tier flagship APIs. The first 5 columns are
            the same OCR-text setup as above — flagship reads the per-OCR card, no image. The
            rightmost column <strong>No OCR — direct vision</strong> skips the OCR step entirely:
            the flagship sees the raw page image plus the question and answers in one shot.
          </p>
          <Heatmap models={FLAGSHIP_MODELS} methods={flagshipMethods} highlightDirectVision />
          <p className="text-xs text-text-secondary mt-4 leading-relaxed max-w-4xl">
            <strong className="text-ink font-medium">The question this answers.</strong> If the
            "direct vision" column is the greenest, the OCR pipeline is adding more noise than
            signal even for SOTA models — they'd be better off just looking at the page. If
            the best OCR column beats direct vision, OCR is structurally useful even for the
            top of the stack (and the cheapest OCR that hits that ceiling wins on cost).
          </p>
        </Section>

        {/* ─────────── Cost charts ─────────── */}
        <Section title="OCR computation cost — per-page">
          <p className="text-xs text-text-secondary mb-4 leading-relaxed max-w-4xl">
            Two axes: <strong>USD per page</strong> (commercial API list price; $0 for local
            tools) and <strong>seconds per page</strong> (wall-clock on the project's M-series
            Mac). The two are not interchangeable — a free local tool can be the slowest of
            the bunch, and the cheapest paid API can be the fastest.
          </p>
          <CostChart methods={allMethods} mode="full-doc" />
          <CostChart methods={allMethods} mode="tables-only" />
        </Section>

        {/* ─────────── License legend ─────────── */}
        <Section title="License and access">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Vendor</th>
                  <th>Family</th>
                  <th>Access</th>
                  <th>$/page</th>
                  <th>s/page</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {allMethods.map((m) => (
                  <tr key={m.slug}>
                    <td className="font-medium text-ink">{m.label}</td>
                    <td className="text-text-secondary">{m.vendor}</td>
                    <td className="text-text-secondary">{m.family}</td>
                    <td>
                      <span className={`text-[10px] uppercase tracking-widest font-medium border px-2 py-0.5 inline-block ${LICENSE_TINT[m.license]}`}>
                        {LICENSE_LABEL[m.license]}
                      </span>
                    </td>
                    <td className="text-right tabular-nums">{m.costPerPageUSD === 0 ? '$0' : `$${m.costPerPageUSD.toFixed(4)}`}</td>
                    <td className="text-right tabular-nums">{m.secondsPerPage}</td>
                    <td className="text-text-secondary text-[12px] leading-snug">{m.notes ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </main>
    </div>
  );
}

function Heatmap({
  models,
  methods,
  highlightDirectVision = false,
}: {
  models: readonly { slug: string; label: string; vendor: string }[];
  methods: OcrMethod[];
  highlightDirectVision?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <colgroup>
          <col style={{ minWidth: "160px" }} />
          {methods.map((m) => <col key={m.slug} style={{ minWidth: "150px" }} />)}
        </colgroup>
        <thead>
          <tr className="border-b-2 border-ink">
            <th className="text-left py-2 pr-3 font-medium text-xs uppercase tracking-widest text-text-secondary align-bottom">Model</th>
            {methods.map((m) => {
              const isDirect = highlightDirectVision && m.slug === 'none-direct-vision';
              return (
                <th key={m.slug} className={`text-left py-2 px-2 font-medium text-xs uppercase tracking-widest align-bottom ${isDirect ? 'text-ink border-l-2 border-ink bg-panel/30' : 'text-text-secondary'}`}>
                  <div>{m.label}</div>
                  <div className="font-normal normal-case tracking-normal text-[10px] text-text-secondary mt-0.5">{m.vendor.split(' (')[0]}</div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {models.map((mdl) => (
            <tr key={mdl.slug} className="border-t border-border align-top">
              <td className="py-3 pr-3 text-xs">
                <div className="font-medium text-ink">{mdl.label}</div>
                <div className="text-text-secondary">{mdl.vendor}</div>
              </td>
              {methods.map((m) => {
                const isDirect = highlightDirectVision && m.slug === 'none-direct-vision';
                const s = summarize(OCR_GRID_RESULTS, mdl.slug, m.slug);
                const correctRate = s.total > 0 ? s.correct / s.total : null;
                const bg = passColor(correctRate, 0);
                return (
                  <td key={m.slug} className={`py-3 px-2 text-xs ${isDirect ? 'border-l-2 border-ink' : ''}`} style={{ backgroundColor: bg }}>
                    {s.total === 0 ? (
                      <div className="text-text-secondary italic">no data</div>
                    ) : (
                      <>
                        <div className="text-ink font-medium tabular-nums text-sm">
                          {((correctRate ?? 0) * 100).toFixed(0)}%
                        </div>
                        <div className="text-text-secondary tabular-nums text-[11px]">
                          {s.correct}/{s.total} correct
                        </div>
                        {s.band > s.correct && (
                          <div className="text-text-secondary tabular-nums text-[10px] mt-1">
                            +{s.band - s.correct} band-only
                          </div>
                        )}
                        {s.errors > 0 && (
                          <div className="text-status-warning tabular-nums text-[10px]">
                            {s.errors} err
                          </div>
                        )}
                      </>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <div className="border-b border-border pb-1 mb-4">
        <h2 className="text-sm font-bold text-ink uppercase tracking-widest">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function CostChart({ methods, mode }: { methods: OcrMethod[]; mode: 'full-doc' | 'tables-only' }) {
  // For "tables only": multiply $/page and s/page by 0.10 of the total pages (≈ tables-per-doc).
  // V27 has ~21 of 874 tested-table pages = 2.4%; round up to 10% as a generous estimate
  // since any "tables-only" pipeline will also need to fetch nearby pages for context.
  const factor = mode === 'tables-only' ? 0.10 : 1.0;
  const pageCount = mode === 'tables-only' ? '≈87 pages (10% of 874)' : '874 pages (full V27)';

  // Sort by total cost descending
  const sorted = [...methods].sort((a, b) =>
    (b.costPerPageUSD * 874 * factor + b.secondsPerPage * 874 * factor / 60) -
    (a.costPerPageUSD * 874 * factor + a.secondsPerPage * 874 * factor / 60)
  );

  const maxUSD = Math.max(...sorted.map((m) => m.costPerPageUSD * 874 * factor));
  const maxSec = Math.max(...sorted.map((m) => m.secondsPerPage * 874 * factor / 60));

  return (
    <div className="mb-6 bg-panel/30 border border-border p-4">
      <div className="text-xs uppercase tracking-widest text-text-secondary mb-3 flex justify-between">
        <span>{mode === 'full-doc' ? 'Full V27 document' : 'V27 tested-table pages only'}</span>
        <span>{pageCount}</span>
      </div>
      <div className="space-y-1.5">
        {sorted.map((m) => {
          const usd = m.costPerPageUSD * 874 * factor;
          const min = m.secondsPerPage * 874 * factor / 60;
          return (
            <div key={m.slug} className="grid grid-cols-[180px_1fr_70px_1fr_70px] items-center gap-2 text-xs">
              <div className="text-ink">{m.label}</div>
              <div className="h-3 bg-panel border border-border relative">
                <div
                  className="absolute inset-y-0 left-0 bg-status-warning/60"
                  style={{ width: maxUSD > 0 ? `${(usd / maxUSD) * 100}%` : '0%' }}
                />
              </div>
              <div className="text-right tabular-nums">{usd === 0 ? '$0' : `$${usd.toFixed(2)}`}</div>
              <div className="h-3 bg-panel border border-border relative">
                <div
                  className="absolute inset-y-0 left-0 bg-text-secondary/60"
                  style={{ width: maxSec > 0 ? `${(min / maxSec) * 100}%` : '0%' }}
                />
              </div>
              <div className="text-right tabular-nums">{min.toFixed(0)} min</div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-[11px] text-text-secondary flex gap-4">
        <span><span className="inline-block w-3 h-3 bg-status-warning/60 align-middle mr-1"></span>USD cost</span>
        <span><span className="inline-block w-3 h-3 bg-text-secondary/60 align-middle mr-1"></span>wall-clock minutes</span>
      </div>
    </div>
  );
}
