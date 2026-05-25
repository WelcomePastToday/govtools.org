import type { Metadata } from "next";
import Link from "next/link";
import {
  PUBLIC_INTEREST_PASSES,
  PUBLIC_INTEREST_PASSES_META,
  type PublicInterestPassRow,
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
const correctCount = PUBLIC_INTEREST_PASSES.filter((r) => r.evaluation === "correct").length;
const incorrectCount = PUBLIC_INTEREST_PASSES.filter((r) => r.evaluation === "incorrect").length;

function evalChip(ev: PublicInterestPassRow["evaluation"]) {
  switch (ev) {
    case "correct":
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-widest font-medium border border-status-success text-status-success">
          ✓ correct
        </span>
      );
    case "incorrect":
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-widest font-medium border border-status-warning text-status-warning">
          ✗ incorrect
        </span>
      );
    case "partial":
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-widest font-medium border border-border text-text-secondary">
          ~ partial
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-widest font-medium border border-border text-text-secondary">
          n/a
        </span>
      );
  }
}

// Background shading for the model-response + evaluation cells.
// Soft tints that read clearly under the Swiss-style neutral palette.
const EVAL_BG: Record<PublicInterestPassRow["evaluation"], string> = {
  correct:   "#e6f4ec", // soft green
  incorrect: "#fbeae8", // soft red/coral
  partial:   "#fff4dc", // soft amber
  "n/a":     "#f0f0f0", // soft gray
};

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
              At a glance
            </div>
            <p className="text-sm leading-relaxed pt-4 border-t border-border text-ink">
              <span className="font-medium">{correctCount} correct</span>{" "}
              · <span className="font-medium">{incorrectCount} incorrect</span>{" "}
              across {totalRows} model-question cells covering{" "}
              {PUBLIC_INTEREST_PASSES_META.questionCountWithAtLeastOnePass}{" "}
              questions. The same cell pattern recurs across other open and
              open-weight models — see the{" "}
              <Link href="/erschliessung/evaluation_runs/cycles/heatmap.html" className="text-accent hover:text-link-hover">
                full heatmap
              </Link>{" "}
              for the multi-cycle view.
            </p>
          </div>
        </section>

        {/* Setup */}
        <Section title="Setup" tag="Method · 01">
          <DetailGrid>
            <DetailRow label="Evaluation cycle">
              <code className="text-xs bg-panel px-1.5 py-0.5">{PUBLIC_INTEREST_PASSES_META.cycle}</code>
            </DetailRow>
            <DetailRow label="Card variant">
              <code className="text-xs bg-panel px-1.5 py-0.5">{PUBLIC_INTEREST_PASSES_META.variant}</code>
              <span className="text-text-secondary text-xs ml-2">{PUBLIC_INTEREST_PASSES_META.cardSizeNote}</span>
            </DetailRow>
            <DetailRow label="Mode">
              <span className="text-sm text-ink">{PUBLIC_INTEREST_PASSES_META.mode}</span>
            </DetailRow>
            <DetailRow label="Models">
              <ul className="text-sm leading-relaxed text-ink space-y-1">
                <li>· <span className="font-medium">Apertus 8B Instruct</span> — Swiss AI Initiative; mission-aligned for public-interest infrastructure</li>
                <li>· <span className="font-medium">ClimateGPT 13B</span> — climate-domain Llama-2-13B fine-tune; 4 K native context</li>
              </ul>
            </DetailRow>
            <DetailRow label="Filter">
              <span className="text-sm leading-relaxed text-ink">
                Questions where AT LEAST ONE of the two models was correct ({PUBLIC_INTEREST_PASSES_META.questionCountWithAtLeastOnePass} of 13). Questions where neither model passed are not shown.
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
                  <th className="text-left py-2 pr-3 font-medium text-xs uppercase tracking-widest text-text-secondary whitespace-nowrap">Model</th>
                  <th className="text-left py-2 pr-3 font-medium text-xs uppercase tracking-widest text-text-secondary">Question</th>
                  <th className="text-left py-2 pr-3 font-medium text-xs uppercase tracking-widest text-text-secondary">Model response</th>
                  <th className="text-left py-2 pr-3 font-medium text-xs uppercase tracking-widest text-text-secondary whitespace-nowrap">Evaluation</th>
                  <th className="text-left py-2 font-medium text-xs uppercase tracking-widest text-text-secondary whitespace-nowrap">Correct answer</th>
                </tr>
              </thead>
              <tbody>
                {orderedQids.map((qid) => {
                  const group = rowsByQid[qid] ?? [];
                  return group.map((row, i) => {
                    const tintBg = EVAL_BG[row.evaluation];
                    return (
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
                        <td className="py-3 pr-3 text-sm leading-snug">
                          <span className="text-text-secondary uppercase tracking-widest text-[10px] mr-1">{qid}</span>
                          <span className="text-ink">{row.question}</span>
                        </td>
                        <td
                          className="py-3 px-3 text-sm text-ink leading-snug"
                          style={{ backgroundColor: tintBg }}
                        >
                          <div className="font-mono text-xs whitespace-pre-wrap max-w-[460px] text-ink">
                            {row.modelResponse}
                          </div>
                        </td>
                        <td
                          className="py-3 px-3 whitespace-nowrap"
                          style={{ backgroundColor: tintBg }}
                        >
                          {evalChip(row.evaluation)}
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
                    );
                  });
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
