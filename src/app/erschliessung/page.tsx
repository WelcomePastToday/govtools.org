import type { Metadata } from "next";
import Link from "next/link";
import { PUBLIC_INTEREST_PASSES, type Evaluation } from "./_data/publicInterestPasses";

export const metadata: Metadata = {
  title: "Erschließung — Archival evidence packaging for open models | GovTools",
  description:
    "Compact CSV evidence cards let open models answer archival table questions that raw PDFs and giant Docling JSON cannot. 27% → 55% open-tier pass-rate lift.",
};

// ─────────────────────── Data ───────────────────────

const HEADLINE_METRICS = [
  { num: "7/7",     label: "Questions Apertus + ClimateGPT answered with the compact CSV card" },
  { num: "0/7",     label: "Same questions on raw PDF or raw Docling JSON" },
  { num: "27 → 55%", label: "Open-tier pass-rate lift from CSV-format cards" },
  { num: "≤2 KB",   label: "Typical compact evidence package per question" },
];

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

interface OptionRow {
  key: string;
  name: string;
  status: "next" | "near-term" | "longer-term" | "gated";
}
const OPTIONS: OptionRow[] = [
  { key: "A", status: "next",        name: "Make non-oracle retrieval work on the known corpus (M3-IDX, M3-HYDE) — the next milestone now that oracle is saturated." },
  { key: "B", status: "near-term",   name: "Close the multi-page table stitching gap (Q-NOAA-CALC-001) — fixed at the pipeline layer lifts every model tier at once." },
  { key: "C", status: "near-term",   name: "Standardize a minimal evidence-derivative set archives publish alongside PDFs (docling.json.gz + csv-only card + table index + provenance)." },
  { key: "D", status: "longer-term", name: "Build an open-model access layer (HTTP API or MCP server) so local models can request the right card on demand." },
  { key: "E", status: "longer-term", name: "Explore multimodal evidence for VL-capable open models (Qwen2.5-VL, InternVL, Molmo-2-O, …)." },
  { key: "F", status: "gated",       name: "Held-out scaling pilot — gated on A. Premature without working non-oracle retrieval." },
];

const OPTION_LABEL: Record<OptionRow["status"], string> = {
  "next":        "Next",
  "near-term":   "Near-term",
  "longer-term": "Longer-term",
  "gated":       "Gated",
};
const OPTION_CLASSES: Record<OptionRow["status"], string> = {
  "next":        "border-status-success text-status-success",
  "near-term":   "border-border text-text-secondary",
  "longer-term": "border-border text-text-secondary",
  "gated":       "border-status-warning text-status-warning",
};

// Soft tints for the per-cell evidence (matches the interpolation deep-dive page)
const EVAL_BG: Record<Evaluation, string> = {
  correct:   "#e6f4ec",
  incorrect: "#fbeae8",
  partial:   "#fff4dc",
  "n/a":     "#f0f0f0",
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
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-baseline gap-4">
            <Link href="/" className="text-xl font-bold tracking-tight text-ink hover:text-accent transition-colors">
              GovTools
            </Link>
            <span className="text-xs text-text-secondary uppercase tracking-widest hidden sm:inline-block">
              Erschließung
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/erschliessung/variants" className="text-xs font-medium text-text-secondary uppercase tracking-widest hover:text-accent transition-colors">
              Input variants
            </Link>
            <Link href="/erschliessung/interpolation" className="text-xs font-medium text-text-secondary uppercase tracking-widest hover:text-accent transition-colors">
              Interpolation deep dive
            </Link>
            <a href="/erschliessung/heatmap.html" className="text-xs font-medium text-text-secondary uppercase tracking-widest hover:text-accent transition-colors">
              Cycle heatmap
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* ─────────── Hero (tight) ─────────── */}
        <section className="pb-8 mb-8 border-b border-border">
          <div className="text-xs text-text-secondary uppercase tracking-widest mb-3">
            Archival evidence packaging for open models
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight text-ink max-w-4xl">
            Many open models cannot receive PDF or full Docling JSON files. 1.5 KB CSV cards unlock answers.
          </h1>
        </section>

        {/* ─────────── Key metrics ─────────── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-border py-6 mb-12">
          {HEADLINE_METRICS.map((m, i) => (
            <div key={i}>
              <div className="text-2xl md:text-3xl font-bold leading-none tracking-tight text-ink mb-2">{m.num}</div>
              <div className="text-[11px] text-text-secondary uppercase tracking-widest leading-snug">{m.label}</div>
            </div>
          ))}
        </section>

        {/* ─────────── Input gradient (visual) ─────────── */}
        <Section title="Input gradient at a glance" tag="01">
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
            See <Link href="/erschliessung/interpolation" className="text-accent hover:text-link-hover">per-cell evidence ↓</Link>.
          </p>
        </Section>

        {/* ─────────── Per-cell evidence (compact table) ─────────── */}
        <Section title="Per-cell evidence" tag="02">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr className="border-b-2 border-ink">
                  <th className="text-left py-2 pr-3 text-[11px] uppercase tracking-widest text-text-secondary font-medium whitespace-nowrap">Model</th>
                  <th className="text-left py-2 pr-3 text-[11px] uppercase tracking-widest text-text-secondary font-medium">Question</th>
                  <th className="text-left py-2 pr-3 text-[11px] uppercase tracking-widest text-text-secondary font-medium" style={{ width: 90 }}>PDF</th>
                  <th className="text-left py-2 pr-3 text-[11px] uppercase tracking-widest text-text-secondary font-medium" style={{ width: 110 }}>Docling JSON</th>
                  <th className="text-left py-2 pr-3 text-[11px] uppercase tracking-widest text-text-secondary font-medium">Compact CSV card response</th>
                  <th className="text-left py-2 text-[11px] uppercase tracking-widest text-text-secondary font-medium whitespace-nowrap">Ground truth</th>
                </tr>
              </thead>
              <tbody>
                {PUBLIC_INTEREST_PASSES.map((row) => (
                  <tr key={`${row.qid}-${row.model}`} className="border-t border-border align-top">
                    <td className="py-2 pr-3 text-xs">
                      <div className="font-medium text-ink">{row.modelLabel.split(" (")[0]}</div>
                      <div className="text-text-secondary text-[10px]">{row.modelLabel.match(/\(([^)]+)\)/)?.[1]}</div>
                    </td>
                    <td className="py-2 pr-3 text-xs leading-snug max-w-md">
                      <span className="text-text-secondary uppercase tracking-widest text-[9px] mr-1">{row.qid}</span>
                      <span className="text-ink">{row.question.length > 130 ? row.question.slice(0, 130) + "…" : row.question}</span>
                    </td>
                    <td className="py-2 px-2 text-[11px]" style={{ backgroundColor: EVAL_BG[row.pdfEvaluation] }}>{evalChip(row.pdfEvaluation)}</td>
                    <td className="py-2 px-2 text-[11px]" style={{ backgroundColor: EVAL_BG[row.jsonEvaluation] }}>{evalChip(row.jsonEvaluation)}</td>
                    <td className="py-2 px-2 text-xs leading-snug" style={{ backgroundColor: EVAL_BG[row.cardEvaluation] }}>
                      <div className="mb-1">{evalChip(row.cardEvaluation)}</div>
                      <div className="font-mono text-[11px] whitespace-pre-wrap text-ink line-clamp-3">{row.cardResponse}</div>
                    </td>
                    <td className="py-2 text-xs text-ink font-medium">
                      {row.iaUrl ? (
                        <a href={row.iaUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-link-hover hover:underline">{row.groundTruth}</a>
                      ) : row.groundTruth}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-text-secondary mt-3 leading-relaxed">
            Positive-evidence table: rows are (model, question) cells where the compact CSV card produced a correct answer.{" "}
            <Link href="/erschliessung/interpolation" className="text-accent hover:text-link-hover">Open the full per-cell deep dive →</Link>
          </p>
        </Section>

        {/* ─────────── Variant lift chart (horizontal bars) ─────────── */}
        <Section title="Open-tier pass rate by card variant" tag="03">
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
        <Section title="Open-model scores on CSV-only" tag="04">
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
        <Section title="Where the project stands" tag="05">
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

        {/* ─────────── Roadmap (compact) ─────────── */}
        <Section title="Possible actions forward" tag="06">
          <ul className="border-t border-border">
            {OPTIONS.map((o) => (
              <li key={o.key} className="grid grid-cols-[60px_100px_1fr] gap-3 items-baseline py-3 border-b border-border">
                <span className="text-[11px] text-text-secondary uppercase tracking-widest font-medium">Option {o.key}</span>
                <span className={`text-[10px] uppercase tracking-widest font-medium border px-2 py-0.5 inline-block ${OPTION_CLASSES[o.status]}`}>
                  {OPTION_LABEL[o.status]}
                </span>
                <span className="text-sm text-ink leading-snug">{o.name}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* ─────────── Caveat (one-line) ─────────── */}
        <section className="border-l-2 border-status-warning pl-4 py-2 mb-4 text-sm text-ink leading-relaxed">
          Small diagnostic benchmark — 13 questions × 3 documents. Non-oracle retrieval needs to reach oracle parity on the known corpus before a held-out scaling pilot is meaningful.
        </section>

      </main>

      {/* ─────────── Footer ─────────── */}
      <footer className="border-t border-border mt-8 py-4">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-[11px] text-text-secondary leading-relaxed">
            Source: cycle 17 evaluation, card variant <code className="bg-panel px-1.5 py-0.5">pipeline-v0.7-csv-only</code>, mode <code className="bg-panel px-1.5 py-0.5">M3-L4</code> oracle retrieval. Project repository: <a href="https://github.com/WelcomePastToday/Erschliessung" className="text-accent hover:text-link-hover">github.com/WelcomePastToday/Erschliessung</a>.
            See <a href="/erschliessung/heatmap.html" className="text-accent hover:text-link-hover">full models × cycles heatmap</a>.
          </p>
        </div>
      </footer>

    </div>
  );
}

// ─────────────────────── Subcomponents ───────────────────────

function Section({ title, tag, children }: { title: string; tag: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <div className="flex items-baseline justify-between border-b border-border pb-1 mb-4">
        <h2 className="text-sm font-bold text-ink uppercase tracking-widest">{title}</h2>
        <span className="text-[10px] text-text-secondary uppercase tracking-widest">{tag}</span>
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
