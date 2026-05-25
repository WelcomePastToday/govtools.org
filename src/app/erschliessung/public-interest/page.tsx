import type { Metadata } from "next";
import Link from "next/link";
import {
  PUBLIC_INTEREST_PASSES,
  PUBLIC_INTEREST_PASSES_META,
  type PublicInterestPassRow,
  type Evaluation,
} from "../_data/publicInterestPasses";

export const metadata: Metadata = {
  title: "Public-interest open models — what they answered correctly | Erschließung",
  description:
    "Per-question results for Apertus 8B Instruct (Swiss AI) and ClimateGPT 13B on the Erschließung 13-question diagnostic with compact CSV evidence cards.",
};

// Group rows by question so we can render two-row pairs (one per model) cleanly.
const rowsByQid: Record<string, PublicInterestPassRow[]> = {};
for (const r of PUBLIC_INTEREST_PASSES) {
  rowsByQid[r.qid] = rowsByQid[r.qid] || [];
  rowsByQid[r.qid].push(r);
}
const orderedQids = Array.from(new Set(PUBLIC_INTEREST_PASSES.map((r) => r.qid)));

const totalRows = PUBLIC_INTEREST_PASSES.length;
const distinctQuestions = new Set(PUBLIC_INTEREST_PASSES.map((r) => r.qid)).size;
const apertusRows = PUBLIC_INTEREST_PASSES.filter((r) => r.modelLabel.startsWith("Apertus")).length;
const climateRows = PUBLIC_INTEREST_PASSES.filter((r) => r.modelLabel.startsWith("ClimateGPT")).length;

// Background shading for response cells. Tints reflect each cell's own
// evaluation independently — same row can be green for the card column
// and gray for the JSON column.
const EVAL_BG: Record<Evaluation, string> = {
  correct:   "#e6f4ec", // soft green
  incorrect: "#fbeae8", // soft red/coral
  partial:   "#fff4dc", // soft amber
  "n/a":     "#f0f0f0", // soft gray
};

function evalChip(ev: Evaluation, size: "sm" | "xs" = "xs") {
  const cls =
    size === "sm"
      ? "inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-widest font-medium border"
      : "inline-flex items-center px-1.5 py-0.5 text-[9px] uppercase tracking-widest font-medium border";
  switch (ev) {
    case "correct":
      return <span className={`${cls} border-status-success text-status-success`}>✓ correct</span>;
    case "incorrect":
      return <span className={`${cls} border-status-warning text-status-warning`}>✗ incorrect</span>;
    case "partial":
      return <span className={`${cls} border-border text-text-secondary`}>~ partial</span>;
    default:
      return <span className={`${cls} border-border text-text-secondary`}>n/a</span>;
  }
}

export default function PublicInterestPage() {
  return (
    <div className="min-h-screen bg-paper text-ink font-sans">

      <header className="border-b border-border bg-paper sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-baseline gap-4">
            <Link href="/" className="text-xl font-bold tracking-tight text-ink hover:text-accent transition-colors">
              GovTools
            </Link>
            <span className="text-xs text-text-secondary uppercase tracking-widest hidden sm:inline-block">
              <Link href="/erschliessung" className="hover:text-accent transition-colors">
                Erschließung
              </Link>
              <span className="mx-2">›</span>
              Public-interest passes
            </span>
          </div>
          <div className="text-xs font-medium text-text-secondary uppercase tracking-widest">
            Apertus + ClimateGPT
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">

        {/* Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-16 mb-16 border-b border-border">
          <div className="lg:pr-12">
            <div className="text-xs text-text-secondary uppercase tracking-widest mb-4">
              Public-interest open models — per-question results
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6 text-ink">
              What Apertus and ClimateGPT actually answered correctly.
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed">
              Per-cell results for two mission-aligned open models on the
              Erschließung 13-question diagnostic, with the compact CSV-format
              evidence card served via oracle retrieval. The questions shown
              are the ones at least one of these two models answered correctly.
            </p>
          </div>
          <div className="lg:pt-8">
            <div className="text-xs text-text-secondary uppercase tracking-widest mb-3">
              The input gradient at a glance
            </div>
            <div className="pt-4 border-t border-border space-y-2 text-sm leading-relaxed text-ink">
              <p>
                Each row shows one question that these two public-interest open
                models <em>can</em> answer correctly when handed the compact
                Erschließung evidence card, and the failure modes of the same
                question under raw PDF and raw Docling JSON inputs.
              </p>
              <ul className="space-y-1 pt-2">
                <li>
                  <span className="font-medium">Raw PDF:</span>{" "}
                  <span className="text-text-secondary">{totalRows} N/A</span>{" "}
                  — text-only models can&apos;t ingest PDFs directly.
                </li>
                <li>
                  <span className="font-medium">Raw Docling JSON:</span>{" "}
                  <span className="text-text-secondary">{totalRows} N/A</span>{" "}
                  — ~1 GB JSON overflows the 4K-8K token context window.
                </li>
                <li>
                  <span className="font-medium">Compact CSV card:</span>{" "}
                  <span className="text-status-success">{totalRows} correct</span>{" "}
                  — {apertusRows} from Apertus 8B, {climateRows} from ClimateGPT 13B, across {distinctQuestions} distinct questions.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Setup */}
        <Section title="Setup" tag="Method · 01">
          <DetailGrid>
            <DetailRow label="Models">
              <ul className="text-sm leading-relaxed text-ink space-y-1">
                <li>· <span className="font-medium">Apertus 8B Instruct</span> — Swiss AI Initiative; mission-aligned for public-interest infrastructure</li>
                <li>· <span className="font-medium">ClimateGPT 13B</span> — climate-domain Llama-2-13B fine-tune; 4 K native context</li>
              </ul>
            </DetailRow>
            <DetailRow label="Three input columns">
              <ul className="text-sm leading-relaxed text-ink space-y-2">
                <li>
                  <span className="font-medium">Raw PDF</span> —{" "}
                  <span className="text-text-secondary">{PUBLIC_INTEREST_PASSES_META.pdfMode}</span>
                </li>
                <li>
                  <span className="font-medium">Raw Docling JSON</span> —{" "}
                  <span className="text-text-secondary">{PUBLIC_INTEREST_PASSES_META.jsonMode}.</span>{" "}
                  The decompressed JSON for V27/V35 is on the order of 30 MB; the model&apos;s context window is 4 K-8 K tokens.
                </li>
                <li>
                  <span className="font-medium">Compact CSV card</span> —{" "}
                  <code className="bg-panel px-1.5 py-0.5 text-xs">{PUBLIC_INTEREST_PASSES_META.cardVariant}</code>{" "}
                  under {PUBLIC_INTEREST_PASSES_META.cardMode}. {PUBLIC_INTEREST_PASSES_META.cardSizeNote}. Sourced from cycle{" "}
                  <code className="bg-panel px-1.5 py-0.5 text-xs">{PUBLIC_INTEREST_PASSES_META.cycleForCardColumn}</code>.
                </li>
              </ul>
            </DetailRow>
            <DetailRow label="Filter">
              <span className="text-sm leading-relaxed text-ink">
                One row per (model, question) cell where the model answered correctly on the compact-card input. Incorrect cells and cells where the model wasn&apos;t tested are not shown — this is a positive-evidence table.
              </span>
            </DetailRow>
          </DetailGrid>
        </Section>

        {/* Main table */}
        <Section title="Per-cell results" tag="Evidence · 02">

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-ink">
                  <th className="text-left py-2 pr-3 font-medium text-xs uppercase tracking-widest text-text-secondary whitespace-nowrap align-bottom">Model</th>
                  <th className="text-left py-2 pr-3 font-medium text-xs uppercase tracking-widest text-text-secondary align-bottom">Question</th>
                  <th className="text-left py-2 pr-3 font-medium text-xs uppercase tracking-widest text-text-secondary align-bottom">
                    <div>Raw PDF</div>
                    <div className="font-normal normal-case tracking-normal text-[10px] text-text-secondary mt-0.5">input source</div>
                  </th>
                  <th className="text-left py-2 pr-3 font-medium text-xs uppercase tracking-widest text-text-secondary align-bottom">
                    <div>Raw Docling JSON</div>
                    <div className="font-normal normal-case tracking-normal text-[10px] text-text-secondary mt-0.5">IA-default derivative</div>
                  </th>
                  <th className="text-left py-2 pr-3 font-medium text-xs uppercase tracking-widest text-text-secondary align-bottom">
                    <div>Compact CSV card</div>
                    <div className="font-normal normal-case tracking-normal text-[10px] text-text-secondary mt-0.5">Erschließung pipeline output</div>
                  </th>
                  <th className="text-left py-2 font-medium text-xs uppercase tracking-widest text-text-secondary whitespace-nowrap align-bottom">Correct answer</th>
                </tr>
              </thead>
              <tbody>
                {orderedQids.map((qid) => {
                  const group = rowsByQid[qid] ?? [];
                  return group.map((row, i) => (
                    <tr
                      key={`${qid}-${row.model}`}
                      className={
                        i === 0
                          ? "border-t border-border align-top"
                          : "border-t border-dotted border-border align-top"
                      }
                    >
                      <td className="py-3 pr-3 text-xs">
                        <div className="font-medium text-ink">{row.modelLabel.split(" (")[0]}</div>
                        <div className="text-text-secondary">{row.modelLabel.match(/\(([^)]+)\)/)?.[1]}</div>
                      </td>
                      <td className="py-3 pr-3 text-sm leading-snug max-w-[200px]">
                        <span className="text-text-secondary uppercase tracking-widest text-[10px] mr-1">{qid}</span>
                        <span className="text-ink">{row.question}</span>
                      </td>

                      {/* PDF input cell — brief N/A, narrow column */}
                      <td
                        className="py-3 px-3 text-xs leading-snug w-[140px]"
                        style={{ backgroundColor: EVAL_BG[row.pdfEvaluation] }}
                      >
                        <div className="mb-1.5">{evalChip(row.pdfEvaluation)}</div>
                        <div className="text-text-secondary italic">{row.pdfResponse}</div>
                      </td>

                      {/* Docling JSON input cell — brief N/A, narrow column */}
                      <td
                        className="py-3 px-3 text-xs leading-snug w-[160px]"
                        style={{ backgroundColor: EVAL_BG[row.jsonEvaluation] }}
                      >
                        <div className="mb-1.5">{evalChip(row.jsonEvaluation)}</div>
                        <div className={row.jsonEvaluation === "n/a" ? "text-text-secondary italic" : "font-mono text-ink whitespace-pre-wrap"}>
                          {row.jsonResponse}
                        </div>
                      </td>

                      {/* Compact CSV card cell — the actual response, wide */}
                      <td
                        className="py-3 px-3 text-sm leading-snug min-w-[420px]"
                        style={{ backgroundColor: EVAL_BG[row.cardEvaluation] }}
                      >
                        <div className="mb-1.5">{evalChip(row.cardEvaluation)}</div>
                        <div className="font-mono text-xs whitespace-pre-wrap text-ink">{row.cardResponse}</div>
                      </td>

                      <td className="py-3 text-sm tabular-nums text-ink font-medium max-w-[180px]">
                        {row.iaUrl ? (
                          <a
                            href={row.iaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:text-link-hover hover:underline"
                            title={`Open the source page on the Internet Archive — ${row.iaUrl}`}
                          >
                            {row.groundTruth}
                          </a>
                        ) : (
                          <span title="Source PDF is not currently on archive.org">
                            {row.groundTruth}
                          </span>
                        )}
                      </td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Footnote */}
        <Section title="Reading this table" tag="Notes · 03">
          <p className="text-sm leading-relaxed text-ink mb-3">
            Each row is one (model, question) cell from cycle 17 of the
            Erschließung evaluation harness. The model was served exactly
            one compact CSV-format evidence card per question (the relevant
            table only), wrapped in a single-sentence system instruction.
            No proprietary tooling was required to produce the cards.
          </p>
          <p className="text-sm leading-relaxed text-ink mb-3">
            The "Correct answer" column shows the pre-registered ground
            truth from <code className="bg-panel px-1.5 py-0.5 text-xs">ADVANCED_QUERIES.md</code>;
            the scorer logic is a per-question regex/lambda frozen before
            evaluation. The "Model response" column shows the model&apos;s
            verbatim answer, lightly trimmed for display.
          </p>
          <p className="text-sm leading-relaxed text-ink">
            Cycle 17 ran 14 models × 13 questions on the csv-only variant —
            see the{" "}
            <Link href="/erschliessung/evaluation_runs/cycles/heatmap.html" className="text-accent hover:text-link-hover">
              cycle heatmap
            </Link>{" "}
            for the full panel. The cycle 17 scores were later understood as
            an oracle ceiling (see cycle 31&apos;s reframing of the open-tier
            breakthrough), but the per-cell answers shown here are
            unchanged — they show what these models <em>can</em> answer
            correctly when handed the right table.
          </p>
        </Section>

        <section className="mt-16 pt-8 border-t border-border">
          <Link href="/erschliessung" className="text-sm text-accent hover:text-link-hover">
            ← Back to Erschließung overview
          </Link>
        </section>

      </main>

      <footer className="border-t border-border mt-16 py-8">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs text-text-secondary leading-relaxed">
            Source data:{" "}
            <code className="bg-panel px-1.5 py-0.5">evaluation_runs/cycles/cycle17/results.jsonl</code>{" "}
            in the project repository at{" "}
            <a href="https://github.com/WelcomePastToday/Erschliessung" className="text-accent hover:text-link-hover">
              github.com/WelcomePastToday/Erschliessung
            </a>
            . Regenerate this table by re-running{" "}
            <code className="bg-panel px-1.5 py-0.5">evaluation_runs/build_public_interest_passes.py</code>.
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
