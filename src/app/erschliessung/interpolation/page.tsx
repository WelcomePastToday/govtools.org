import type { Metadata } from "next";
import Link from "next/link";
import { PUBLIC_INTEREST_PASSES, type Evaluation } from "../_data/publicInterestPasses";

export const metadata: Metadata = {
  title: "Erschließung — Archival evidence packaging for open models | GovTools",
  description:
    "Compact CSV evidence cards let open models answer archival table questions that raw PDFs and giant Docling JSON cannot. 27% → 55% open-tier pass-rate lift.",
};

// ─────────────────────── Data ───────────────────────

interface VariantBar {
  variant: string;
  rate: number; // percentage 0-100
  size: string;
  highlight?: boolean;
}
const VARIANT_BARS: VariantBar[] = [
  { variant: "Project full v0.6.1 card (markdown + context envelope)", rate: 27, size: "15–42 KB" },
  { variant: "Compact 1 K card (caption + table only)",                rate: 40, size: "~1.2 KB" },
  { variant: "Compact 2 K card (+ 1 paragraph)",                       rate: 49, size: "~2 KB" },
  { variant: "Labeled-faithfulness card (per-section provenance)",     rate: 49, size: "~2.4 KB" },
  { variant: "Table-only card (table + caption, no metadata)",         rate: 52, size: "~1 KB" },
  { variant: "CSV-only card (table data as CSV) — recommended",        rate: 55, size: "~1.5 KB", highlight: true },
  { variant: "Evidence-Preserving Table Normalization",                rate: 55, size: "~1.5 KB" },
];

interface ModelRow {
  model: string;
  type: string;
  score: string;
  passes: number;
  highlight?: boolean;
}
const MODEL_ROWS: ModelRow[] = [
  { model: "Qwen2.5-7B",          type: "Open-weight",                  score: "11/13", passes: 11, highlight: true },
  { model: "Granite-3.3-8B",      type: "Open model",                   score: "11/13", passes: 11, highlight: true },
  { model: "Qwen2.5-Coder-7B",    type: "Open-weight, code-tuned",      score: "10/13", passes: 10 },
  { model: "Llama-3 8B",          type: "Open-weight",                  score: "9/13",  passes: 9  },
  { model: "DeepSeek-R1 8B",      type: "Open-weight, reasoning-tuned", score: "8/13",  passes: 8  },
  { model: "Apertus 70B",         type: "Open model",                   score: "7/13",  passes: 7  },
  { model: "EuroLLM 9B",          type: "Open model",                   score: "7/13",  passes: 7  },
  { model: "Gemma-2 9B",          type: "Open-weight",                  score: "7/13",  passes: 7  },
  { model: "Apertus 8B Instruct", type: "Open model",                   score: "6/13",  passes: 6  },
  { model: "Mistral 7B",          type: "Open-weight",                  score: "6/13",  passes: 6  },
  { model: "Qwen2.5-3B",          type: "Open-weight, small",           score: "6/13",  passes: 6  },
  { model: "ClimateGPT-13B",      type: "Open-weight, domain-tuned",    score: "5/13",  passes: 5  },
  { model: "OLMo-2 7B",           type: "Open model",                   score: "4/13",  passes: 4  },
  { model: "Phi-3-Mini 3.8B",     type: "Open-weight, small",           score: "4/13",  passes: 4  },
  { model: "ClimateGPT-70B",      type: "Open-weight, domain-tuned",    score: "3/13",  passes: 3  },
  { model: "ClimateGPT-7B",       type: "Open-weight, domain-tuned",    score: "3/13",  passes: 3  },
];

// Provenance — answers "what work does each artifact need?" for an Internet Archive item
interface ProvenanceRow {
  artifact: string;
  detail: string;
  source: "ia-has-it" | "ia-derivable" | "rerun-docling" | "pipeline-only";
}
const PROVENANCE_ROWS: ProvenanceRow[] = [
  { artifact: "The PDF itself",                                            source: "ia-has-it",     detail: "The archival document — the only thing the Internet Archive is guaranteed to hold for an item." },
  { artifact: "docling.json.gz",                                           source: "ia-has-it",     detail: "Docling's full structural extraction: layout, tables, captions, headings, figure bounding boxes, reading order. The Internet Archive holds this for items it has already processed. For unprocessed items, the pipeline runs Docling on the PDF once and produces it." },
  { artifact: "Per-table CSV / Parquet / HTML / Markdown",                 source: "ia-derivable",  detail: "One file per detected table, extracted from docling.json.gz. Pure transformation — no model needed, no second Docling pass needed." },
  { artifact: "Table context envelopes",                                   source: "ia-derivable",  detail: "Captions, headings, and neighboring paragraphs for each table. All present in docling.json.gz; the pipeline just picks them out." },
  { artifact: "Compact per-table evidence cards",                          source: "ia-derivable",  detail: "The 1–2 KB CSV-format cards that drive the headline result. Built from the per-table CSV + selected context. No Docling re-run; no extra Internet Archive fetch beyond the JSON." },
  { artifact: "Card variants (csv-only, micro-1k, table-normalized, …)",   source: "ia-derivable",  detail: "Reshapes of the base card. Each variant changes what the model sees, never what was extracted. All derive from docling.json.gz." },
  { artifact: "Document-level maps (table index, figures index, entity index)", source: "ia-derivable", detail: "Per-document summaries used for two-shot retrieval and discovery. Derived from docling.json.gz alone." },
  { artifact: "Figure image crops (PNG)",                                  source: "rerun-docling", detail: "Cropped pixels for each detected figure. The bounding boxes are in docling.json.gz but the pixels are not — producing the PNGs requires either the original PDF + a crop step, or re-running Docling with extract_figures=True." },
  { artifact: "manifest.json, provenance.json, docling_meta.json",         source: "pipeline-only", detail: "Pipeline metadata: source URL, content-addressed hashes, extractor version, run timing. The pipeline writes these; they do not exist anywhere upstream." },
];
const PROVENANCE_LABEL: Record<ProvenanceRow["source"], string> = {
  "ia-has-it":     "On the Internet Archive",
  "ia-derivable":  "Derivable from the JSON",
  "rerun-docling": "Needs Docling re-run or PDF",
  "pipeline-only": "Pipeline metadata only",
};
const PROVENANCE_CLASSES: Record<ProvenanceRow["source"], string> = {
  "ia-has-it":     "border-status-success text-status-success",
  "ia-derivable":  "border-border text-text-secondary",
  "rerun-docling": "border-status-warning text-status-warning",
  "pipeline-only": "border-border text-text-secondary",
};

// Soft tints for the per-cell evidence (matches the interpolation deep-dive page)
const EVAL_BG: Record<Evaluation, string> = {
  correct:   "#e6f4ec", // soft green
  incorrect: "#fbeae8", // soft red/coral
  partial:   "#fff4dc", // soft amber
  "n/a":     "#f5ebeb", // soft rose — slightly more red than the previous gray
};
function evalChip(ev: Evaluation) {
  const base = "inline-flex items-center px-1.5 py-0.5 text-[9px] uppercase tracking-widest font-medium border";
  if (ev === "correct")   return <span className={`${base} border-status-success text-status-success`}>✓ correct</span>;
  if (ev === "incorrect") return <span className={`${base} border-status-warning text-status-warning`}>✗ incorrect</span>;
  if (ev === "partial")   return <span className={`${base} border-border text-text-secondary`}>~ partial</span>;
  return <span className={`${base} border-border text-text-secondary`}>n/a</span>;
}

// ─────────────────────── Page ───────────────────────

export default function ErschliessungPage() {
  const totalRows = PUBLIC_INTEREST_PASSES.length;
  const distinctQuestions = new Set(PUBLIC_INTEREST_PASSES.map((r) => r.qid)).size;

  return (
    <div className="min-h-screen bg-paper text-ink font-sans">

      {/* ─────────── Header ─────────── */}
      <header className="border-b border-border bg-paper sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-baseline gap-4">
            <Link href="/" className="text-xl font-bold tracking-tight text-ink hover:text-accent transition-colors">
              GovTools
            </Link>
            <span className="text-xs text-text-secondary uppercase tracking-widest hidden sm:inline-block">
              Erschließung: Interpolation examples
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/erschliessung/interpolation" className="text-xs font-medium text-text-secondary uppercase tracking-widest hover:text-accent transition-colors">
              Interpolation
            </Link>
            <a href="/erschliessung/heatmap.html" className="text-xs font-medium text-text-secondary uppercase tracking-widest hover:text-accent transition-colors">
              Tests heatmap
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* ─────────── Hero ─────────── */}
        <section className="pb-8 mb-8 border-b border-border">
          <div className="text-xs text-text-secondary uppercase tracking-widest mb-3">
            Archival evidence packaging for open models
          </div>
          <h1 className="text-lg md:text-xl font-bold tracking-tight leading-snug text-ink max-w-4xl mb-6">
            Many open models cannot interpolate table data from PDF or full Docling.JSON files, the files are too large for the models context window.
            <br />
            1.5 KB CSV table cards can allow models to generate answers.
          </h1>
          <div className="text-sm leading-relaxed text-text-secondary max-w-4xl space-y-3">
            <p>
              The Erschließung project tested 24 open/open-weight models, plus 6 closed-reference comparators, on a 13-question benchmark from three archival documents: two scanned marine biology journals and one born-digital NOAA fisheries report.
            </p>
            <p>
              Across 36 cycles, the project evaluated 28 evidence-derivative formats, from raw Docling JSON and full Markdown cards to compact CSV, micro-cards, table-only, stitched, normalized, and column-context variants. It also tested multiple retrieval modes, including oracle cards, all-cards, two-shot index retrieval, HYDE/vector retrieval, full-document Markdown, and raw Docling JSON.
            </p>
            <p className="text-ink">
              <strong className="font-medium">The headline finding:</strong> better evidence packaging lifted the open-tier pass rate from 27% to 55%, with two 7&ndash;8B open models reaching 11/13 on compact CSV cards.
            </p>
          </div>
        </section>

        {/* ─────────── Input gradient (visual) ─────────── */}
        <Section title="Input gradient at a glance">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border">
            <InputCard
              label="Raw PDF"
              sublabel="The archival item itself"
              outcome="0 / 7 correct"
              outcomeKind="fail"
              detail="Apertus 8B and ClimateGPT 13B are text-only models. They cannot ingest a PDF binary."
            />
            <InputCard
              label="Raw Docling JSON"
              sublabel="The IA-default derivative"
              outcome="0 / 7 correct"
              outcomeKind="fail"
              detail="~30 MB decompressed. The model's 4 K – 8 K context window overflows before reasoning starts."
            />
            <InputCard
              label="Compact CSV card"
              sublabel="Erschließung pipeline output"
              outcome="7 / 7 correct"
              outcomeKind="pass"
              detail="~1.5 KB per question. Table data as CSV inside a Markdown code block. The model reads it and answers."
            />
          </div>
          <p className="text-xs text-text-secondary mt-3 leading-relaxed">
            Sample: 7 (model, question) cells across {distinctQuestions} distinct questions on the 13-question diagnostic.
          </p>
        </Section>

        {/* ─────────── Per-cell evidence (full table from /interpolation) ─────────── */}
        <Section title="Interpolation evidence">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse" style={{ tableLayout: "auto" }}>
              <colgroup>
                <col style={{ minWidth: "100px" }} />     {/* Model */}
                <col style={{ minWidth: "280px" }} />     {/* Question */}
                <col style={{ minWidth: "130px", width: "130px" }} />   {/* PDF */}
                <col style={{ minWidth: "150px", width: "150px" }} />   {/* JSON */}
                <col style={{ minWidth: "360px" }} />     {/* Card response */}
                <col style={{ minWidth: "110px" }} />     {/* Correct answer */}
              </colgroup>
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
                {PUBLIC_INTEREST_PASSES.map((row, idx) => {
                  const prevQid = idx > 0 ? PUBLIC_INTEREST_PASSES[idx - 1].qid : null;
                  const isNewQ = row.qid !== prevQid;
                  return (
                    <tr
                      key={`${row.qid}-${row.model}`}
                      className={isNewQ ? "border-t border-border align-top" : "border-t border-dotted border-border align-top"}
                    >
                      <td className="py-3 pr-3 text-xs">
                        <div className="font-medium text-ink">{row.modelLabel.split(" (")[0]}</div>
                        <div className="text-text-secondary">{row.modelLabel.match(/\(([^)]+)\)/)?.[1]}</div>
                      </td>
                      <td className="py-3 pr-3 text-sm leading-snug">
                        <span className="text-text-secondary uppercase tracking-widest text-[10px] mr-1">{row.qid}</span>
                        <span className="text-ink">{row.question}</span>
                        {row.promptSourceUrl && (
                          <div className="mt-1.5">
                            <a
                              href={row.promptSourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block text-[10px] uppercase tracking-widest text-accent hover:text-link-hover hover:underline"
                              title="Open the full system + user prompt on GitHub (new tab)"
                            >
                              view full prompt →
                            </a>
                          </div>
                        )}
                      </td>

                      {/* PDF input cell */}
                      <td className="py-3 px-3 text-xs leading-snug" style={{ backgroundColor: EVAL_BG[row.pdfEvaluation] }}>
                        <div className="mb-1.5">{evalChip(row.pdfEvaluation)}</div>
                        <div className="text-text-secondary italic">{row.pdfResponse}</div>
                      </td>

                      {/* Docling JSON input cell */}
                      <td className="py-3 px-3 text-xs leading-snug" style={{ backgroundColor: EVAL_BG[row.jsonEvaluation] }}>
                        <div className="mb-1.5">{evalChip(row.jsonEvaluation)}</div>
                        <div className={row.jsonEvaluation === "n/a" ? "text-text-secondary italic" : "font-mono text-ink whitespace-pre-wrap"}>
                          {row.jsonResponse}
                        </div>
                      </td>

                      {/* Compact CSV card cell — the actual response */}
                      <td className="py-3 px-3 text-sm leading-snug" style={{ backgroundColor: EVAL_BG[row.cardEvaluation] }}>
                        <div className="mb-1.5">{evalChip(row.cardEvaluation)}</div>
                        <div className="font-mono text-xs whitespace-pre-wrap text-ink">{row.cardResponse}</div>
                        {(row.cardSourceUrl || row.chatUrl) && (
                          <div className="mt-2 pt-1.5 border-t border-border/60 flex flex-wrap gap-x-4 gap-y-1">
                            {row.cardSourceUrl && (
                              <a
                                href={row.cardSourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block text-[10px] uppercase tracking-widest text-accent hover:text-link-hover hover:underline"
                                title="Open the verbatim card the model was served (new tab)"
                              >
                                view card content →
                              </a>
                            )}
                            {row.chatUrl && (
                              <a
                                href={row.chatUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block text-[10px] uppercase tracking-widest text-accent hover:text-link-hover hover:underline"
                                title="Open the shared chat session for this answer (new tab)"
                              >
                                view chat →
                              </a>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3 text-sm tabular-nums text-ink font-medium">
                        {row.iaUrl ? (
                          <a
                            href={row.iaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:text-link-hover hover:underline"
                            title={row.iaUrl.includes("archive.org") ? `Open the source page on the Internet Archive — ${row.iaUrl}` : `Open the source PDF — ${row.iaUrl}`}
                          >
                            {row.groundTruth}
                          </a>
                        ) : (
                          <span title="Source not currently available online">{row.groundTruth}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Provenance — collapsed by default; expands to show the PDF → derivatives chain */}
          <details className="mt-6 border-t border-border pt-4 group">
            <summary className="cursor-pointer text-xs uppercase tracking-widest text-text-secondary hover:text-ink select-none">
              <span className="group-open:hidden">How each artifact relates to the source PDF and Docling output ↓</span>
              <span className="hidden group-open:inline">Hide derivation table ↑</span>
            </summary>
            <div className="mt-4">
              <p className="text-xs text-text-secondary mb-4 leading-relaxed max-w-4xl">
                The practical question is not where files sit on disk — it is what work is needed to obtain each artifact. For an Internet Archive item that has already been Docling-processed, the JSON is a free download. The compact evidence cards, table CSVs, document indexes, and card variants are all derivable from that one file without re-running Docling. Only the figure pixel crops need either the source PDF or a Docling re-run with figure extraction enabled.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr>
                      <th>Artifact</th>
                      <th className="w-[170px]">How to get it</th>
                      <th>Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PROVENANCE_ROWS.map((r, i) => (
                      <tr key={i}>
                        <td className="font-medium text-ink align-top">{r.artifact}</td>
                        <td className="align-top">
                          <span className={`text-[10px] uppercase tracking-widest font-medium border px-2 py-0.5 inline-block ${PROVENANCE_CLASSES[r.source]}`}>
                            {PROVENANCE_LABEL[r.source]}
                          </span>
                        </td>
                        <td className="text-text-secondary align-top">{r.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-text-secondary mt-4 leading-relaxed max-w-4xl">
                <strong className="text-ink font-medium">Why this matters for scale.</strong> If the Internet Archive holds <code className="bg-panel px-1.5 py-0.5">docling.json.gz</code> for an item, every evidence package shown on this page — including the compact CSV cards — can be generated from that single file. No re-running Docling. No re-downloading the PDF.
              </p>
            </div>
          </details>
        </Section>

        {/* ─────────── Variant lift chart (horizontal bars) ─────────── */}
        <Section title="Open-tier pass rate by card variant">
          <p className="text-xs text-text-secondary mb-4 leading-relaxed">
            The same 13-question diagnostic, the same model panel, the same source documents. Only the card format changes.
          </p>
          <div className="space-y-2">
            {VARIANT_BARS.map((v, i) => (
              <div key={i} className="grid grid-cols-[1fr_320px_70px] items-center gap-3 text-xs">
                <div className={v.highlight ? "font-medium text-ink" : "text-ink"}>
                  {v.variant}
                  <span className="text-text-secondary ml-2 text-[10px]">{v.size}</span>
                </div>
                <div className="h-4 bg-panel border border-border relative">
                  <div
                    className={`absolute inset-y-0 left-0 ${v.highlight ? "bg-ink" : "bg-text-secondary/60"}`}
                    style={{ width: `${v.rate}%` }}
                  />
                </div>
                <div className={`text-right tabular-nums ${v.highlight ? "font-bold text-ink" : "text-text-secondary"}`}>
                  {v.rate}%
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-secondary mt-4 leading-relaxed">
            <strong className="text-ink font-medium">28-point lift from packaging alone.</strong> No fine-tuning, no proprietary tooling.
            See <Link href="/erschliessung/variants" className="text-accent hover:text-link-hover">all input variants →</Link>
          </p>
        </Section>

        {/* ─────────── Open-model scores ─────────── */}
        <Section title="Open-model scores on CSV-only">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Type</th>
                  <th className="text-right">Score</th>
                  <th>Pass rate</th>
                </tr>
              </thead>
              <tbody>
                {MODEL_ROWS.map((r, i) => (
                  <tr key={i} className={r.highlight ? "[&_td]:bg-panel font-medium" : ""}>
                    <td className={r.highlight ? "font-medium text-ink" : ""}>{r.model}</td>
                    <td className="text-text-secondary">{r.type}</td>
                    <td className="text-right tabular-nums font-medium">{r.score}</td>
                    <td>
                      <div className="h-2 bg-panel border border-border relative" style={{ width: 220 }}>
                        <div
                          className={r.highlight ? "absolute inset-y-0 left-0 bg-ink" : "absolute inset-y-0 left-0 bg-text-secondary/60"}
                          style={{ width: `${(r.passes / 13) * 100}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ─────────── Where the project stands ─────────── */}
        <Section title="Where the project stands">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-l-2 border-status-success pl-4">
              <div className="text-[11px] uppercase tracking-widest mb-1 text-status-success font-medium">Saturated</div>
              <p className="text-sm text-ink font-medium mb-1">Oracle-retrieval evidence cards.</p>
              <p className="text-xs text-text-secondary leading-relaxed">Top open models reach 11/13 when the right table is pre-selected. The remaining cell is a multi-page table the pipeline splits at a page break — a pipeline fix, not a model gap.</p>
            </div>
            <div className="border-l-2 border-status-warning pl-4">
              <div className="text-[11px] uppercase tracking-widest mb-1 text-status-warning font-medium">Next bottleneck</div>
              <p className="text-sm text-ink font-medium mb-1">Non-oracle retrieval on the known corpus.</p>
              <p className="text-xs text-text-secondary leading-relaxed">The system must select the right card itself before asking the model. M3-IDX (two-shot table-of-contents) and M3-HYDE (vector retrieval) are the candidates.</p>
            </div>
          </div>
        </Section>

      </main>

      {/* ─────────── Footer ─────────── */}
      <footer className="border-t border-border mt-8 py-4">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[11px] text-text-secondary leading-relaxed">
            Source: cycle 17 evaluation, card variant <code className="bg-panel px-1.5 py-0.5">pipeline-v0.7-csv-only</code>, mode <code className="bg-panel px-1.5 py-0.5">M3-L4</code> oracle retrieval.
          </p>
        </div>
      </footer>

    </div>
  );
}

// ─────────────────────── Subcomponents ───────────────────────

function Section({ title, children }: { title: string; tag?: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <div className="border-b border-border pb-1 mb-4">
        <h2 className="text-sm font-bold text-ink uppercase tracking-widest">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function InputCard({
  label,
  sublabel,
  outcome,
  outcomeKind,
  detail,
}: {
  label: string;
  sublabel: string;
  outcome: string;
  outcomeKind: "pass" | "fail";
  detail: string;
}) {
  const colorCls = outcomeKind === "pass" ? "text-status-success" : "text-status-warning";
  const bgCls = outcomeKind === "pass" ? "bg-paper" : "bg-paper";
  return (
    <div className={`p-6 ${bgCls}`}>
      <div className="text-[11px] uppercase tracking-widest text-text-secondary mb-1">{sublabel}</div>
      <div className="text-lg font-bold text-ink mb-3">{label}</div>
      <div className={`text-2xl font-bold tabular-nums mb-3 ${colorCls}`}>{outcome}</div>
      <p className="text-xs text-text-secondary leading-relaxed">{detail}</p>
    </div>
  );
}
