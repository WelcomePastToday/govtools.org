import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Erschließung — Archival Evidence for Open Models | GovTools",
  description:
    "Compact Docling-derived evidence packages help open models answer difficult table questions from archival documents without loading the full PDF.",
};

// ─────────────────────── Data ───────────────────────

const KEY_METRICS = [
  { num: "13", label: "Evaluation questions across 3 source documents" },
  { num: "11/13", label: "Best open-model score on this diagnostic" },
  { num: "27 → 55%", label: "Open-tier pass-rate lift from CSV-format cards" },
  { num: "≤2 KB", label: "Typical compact evidence package per question" },
];

interface ModelRow {
  model: string;
  type: string;
  score: string;
  notes: string;
  highlight?: boolean;
  emphasis?: boolean;
}

const MODEL_ROWS: ModelRow[] = [
  { model: "Qwen2.5-7B",          type: "Open-weight",                  score: "11/13", notes: "", highlight: true },
  { model: "Granite-3.3-8B",      type: "Open model",                   score: "11/13", notes: "", highlight: true },
  { model: "Qwen2.5-Coder-7B",    type: "Open-weight, code-tuned",      score: "10/13", notes: "" },
  { model: "Llama-3 8B",          type: "Open-weight",                  score: "9/13",  notes: "" },
  { model: "DeepSeek-R1 8B",      type: "Open-weight, reasoning-tuned", score: "8/13",  notes: "" },
  { model: "Apertus 70B",         type: "Open model",                   score: "7/13",  notes: "", emphasis: true },
  { model: "EuroLLM 9B",          type: "Open model",                   score: "7/13",  notes: "", emphasis: true },
  { model: "Gemma-2 9B",          type: "Open-weight",                  score: "7/13",  notes: "" },
  { model: "Apertus 8B Instruct", type: "Open model",                   score: "6/13",  notes: "", emphasis: true },
  { model: "Mistral 7B",          type: "Open-weight",                  score: "6/13",  notes: "" },
  { model: "Qwen2.5-3B",          type: "Open-weight, small",           score: "6/13",  notes: "3B parameters; outperforms ClimateGPT-13B." },
  { model: "ClimateGPT-13B",      type: "Open-weight, domain-tuned",    score: "5/13",  notes: "Climate-domain Llama-2 fine-tune; 4K context cap.", emphasis: true },
  { model: "OLMo-2 7B",           type: "Open model",                   score: "4/13",  notes: "Weights, training data, and training code all released." },
  { model: "Phi-3-Mini 3.8B",     type: "Open-weight, small",           score: "4/13",  notes: "" },
  { model: "ClimateGPT-70B",      type: "Open-weight, domain-tuned",    score: "3/13",  notes: "" },
  { model: "ClimateGPT-7B",       type: "Open-weight, domain-tuned",    score: "3/13",  notes: "" },
];

const OUTPUT_TREE = `source/original.pdf                ← archival PDF (preserved by Internet Archive)
│
└── Docling extraction
    │
    ├── docling/
    │   ├── docling.json.gz        ← raw structured extraction (layout, tables, figures)
    │   ├── docling.md             ← full-document linearized Markdown
    │   └── docling_meta.json      ← extractor version, page count, run timing
    │
    ├── tables/                    ← one file per detected table
    │   ├── table_NNN.csv          (table data only)
    │   ├── table_NNN.parquet
    │   ├── table_NNN.html
    │   └── table_NNN.md
    │
    ├── table_context/             ← captions, headings, neighboring paragraphs
    │   └── table_NNN.context.json
    │
    ├── table_cards/               ← compact per-table evidence (base v0.6.1)
    │   └── table_NNN.card.md
    │
    ├── figures/                   ← cropped image regions
    │   └── figure_NNNN.png
    │
    ├── indexes/                   ← document-level maps
    │   ├── table_index.json / .jsonl
    │   ├── figures_index.json
    │   ├── entity_index.jsonl
    │   └── extraction_warnings.jsonl
    │
    ├── manifest.json              ← top-level inventory + checksums
    └── provenance.json            ← source URL, run metadata
            │
            └── card_sets/pipeline-v0.7-{variant}/<doc>/table_cards/
                └── table_NNN.card.md   ← card reshaped per evaluation variant
                                          (csv-only, micro-1k, table-only,
                                           labeled, table-normalized, …)`;

const VARIANTS = [
  { variant: "Project full v0.6.1 card (markdown + context envelope)", rate: "27%", size: "15–42 KB", slug: "pipeline-v0.6.1" },
  { variant: "Compact 1K card (caption + table only)", rate: "40%", size: "~1.2 KB", slug: "pipeline-v0.6.1-micro-1k" },
  { variant: "Compact 2K card (+ 1 paragraph)", rate: "49%", size: "~2 KB", slug: "pipeline-v0.6.1-micro-1k" },
  { variant: "Table-only (table + caption, no metadata)", rate: "52%", size: "~1 KB", slug: "pipeline-v0.6.1-table-only" },
  { variant: "CSV-only card (table data as CSV)", rate: "55%", size: "~1.5 KB", highlight: true, slug: "pipeline-v0.6.1-csv-only" },
  { variant: "Labeled-faithfulness card (per-section provenance labels)", rate: "49%", size: "~2.4 KB", slug: "pipeline-v0.6.1-labeled" },
  { variant: "Evidence-Preserving Table Normalization (cycle 30, net 0 — pulls up mid-tier, slight nudge down on top open models)", rate: "55%", size: "~1.5 KB", slug: "pipeline-v0.6.1-table-normalized" },
];

const OPTIONS = [
  { key: "A", name: "Make non-oracle retrieval work on the known corpus", desc: "Oracle retrieval (M3-L4) is saturated at 11/13 for top open models. The next milestone is end-to-end: the system selects the correct table from a document map and then answers — without the human pointing to the evidence. M3-IDX (two-shot table-of-contents lookup) and M3-HYDE (vector retrieval via nomic-embed-text) are the candidate mechanisms. Reach oracle parity on the 13-question diagnostic before testing new documents." },
  { key: "B", name: "Close the multi-page table stitching gap", desc: "Q-NOAA-CALC-001 fails for every model in this study because the pipeline splits the underlying table at a page break. Fixing this at the pipeline layer (the stitch-map variant is a start) closes the gap uniformly for every model tier — pipeline work that pays off across the entire panel." },
  { key: "C", name: "Standardize a minimal evidence-derivative set", desc: "Define the small set of derivatives institutions should publish alongside preserved PDFs. Likely candidates: docling.json.gz, per-table CSV, csv-only card, table_index, and provenance.json. Aim is one clear specification so any archive — IA or otherwise — can produce evidence packages open models can use." },
  { key: "D", name: "Build an open-model access layer for the derivatives", desc: "Expose cards, maps, indexes, and provenance through an HTTP API or MCP server so an open model running locally (Ollama, llama.cpp) can discover and request the right card on demand. Pairs naturally with the M3-IDX work in Option A." },
  { key: "E", name: "Explore multimodal evidence for VL-capable open models", desc: "Test whether figure crops and image-aware cards improve performance for open vision-language models (Qwen2.5-VL, InternVL, Molmo-2-O, Gemma-SEA-LION-VL, EuroLLM-VL). Useful where OCR introduces noise the text-only pipeline cannot recover." },
  { key: "F", name: "Held-out scaling pilot — gated on Option A", desc: "Once non-oracle retrieval reaches oracle parity on the known corpus, run a multi-document pilot to test generalization across government reports, scientific journals, and archival PDFs of varying scan quality and structure. Premature without A — scaling a system whose retrieval doesn't yet work just scales the failure mode." },
];

// ─────────────────────── Page ───────────────────────

export default function ErschliessungPage() {
  return (
    <div className="min-h-screen bg-paper text-ink font-sans">

      {/* ─────────── Header (matches govtools.org root) ─────────── */}
      <header className="border-b border-border bg-paper sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-baseline gap-4">
            <Link href="/" className="text-xl font-bold tracking-tight text-ink hover:text-accent transition-colors">
              GovTools
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/erschliessung/variants"
              className="text-xs font-medium text-text-secondary uppercase tracking-widest hover:text-accent transition-colors"
            >
              Variants
            </Link>
            <Link
              href="/erschliessung/public-interest"
              className="text-xs font-medium text-text-secondary uppercase tracking-widest hover:text-accent transition-colors"
            >
              Apertus + ClimateGPT
            </Link>
            <a
              href="/erschliessung/evaluation_runs/cycles/heatmap.html"
              className="text-xs font-medium text-text-secondary uppercase tracking-widest hover:text-accent transition-colors"
            >
              Cycle heatmap
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">

        {/* ─────────── Hero (asymmetric) ─────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-16 mb-16 border-b border-border">
          <div className="lg:pr-12">
            <div className="text-xs text-text-secondary uppercase tracking-widest mb-4">
              Compact archival evidence for open models
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6 text-ink">
              Docling extracts the structure. The pipeline turns it into evidence that open models can use.
            </h1>
          </div>
          <div className="lg:pt-8">
            <p className="text-lg text-text-secondary leading-relaxed mb-6">
              Compact Docling-derived evidence packages help open models answer difficult table questions from archival documents — without loading the full PDF or relying on a proprietary API workflow.
            </p>
            <div className="text-xs text-text-secondary uppercase tracking-widest mb-3">
              Primary takeaway
            </div>
            <p className="text-base font-medium leading-relaxed pt-4 border-t border-border">
              The most important variable is not only model size. It is whether the archive presents evidence in a form the model can actually use.
            </p>
          </div>
        </section>

        {/* ─────────── Key metrics ─────────── */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 border-t border-b border-border py-8">
            {KEY_METRICS.map((m, i) => (
              <div key={i} className="flex flex-col">
                <div className="text-3xl font-bold leading-none tracking-tight mb-2 text-ink">
                  {m.num}
                </div>
                <div className="text-xs text-text-secondary uppercase tracking-widest leading-snug">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─────────── What this project tests ─────────── */}
        <Section title="What this project tests" tag="Method · 01">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div>
              <p className="mb-4 text-sm leading-relaxed text-ink">
                This project tests whether archival PDFs — particularly those already preserved by the Internet Archive — can be transformed into compact, structured evidence packages that open models can use to answer real questions about table data.
              </p>
              <p className="text-sm leading-relaxed text-ink">
                The central finding: evidence packaging can materially improve open-model performance without requiring the full original PDF or a closed-source API workflow.
              </p>
            </div>
            <div>
              <p className="mb-4 text-sm leading-relaxed text-ink">
                The diagnostic benchmark uses 13 carefully authored questions across three archival source documents: two scanned marine biology journals (1947–48, 1956) and one born-digital NOAA fisheries report.
              </p>
              <p className="text-sm leading-relaxed text-ink">
                Each question tests a different rubric — direct cell lookup, multi-cell arithmetic, interpolation, negative-control refusal, and pattern inference.
              </p>
            </div>
          </div>
        </Section>

        {/* ─────────── PDF → Docling outputs tree ─────────── */}
        <Section title="What Docling produces from one PDF" tag="Outputs · 02">
          <p className="text-sm leading-relaxed mb-6 text-ink">
            Every source PDF is processed once. The pipeline writes its outputs to a content-addressed directory keyed by the PDF&apos;s SHA-256 — so the same input always produces the same on-disk tree. All evaluation-mode views (M3-L4 oracle, M3-AC all-cards, M2c full Markdown, M2a raw JSON) and all card variants are derived from this base tree.
          </p>
          <pre className="border border-border rounded-sm bg-panel/40 px-5 py-4 overflow-x-auto text-[11.5px] leading-[1.55] font-mono whitespace-pre text-ink mb-4">
            {OUTPUT_TREE}
          </pre>
          <p className="text-xs text-text-secondary leading-relaxed">
            Card variants do not re-run Docling — they only reshape the per-table card (what to keep, strip, or rewrite). That is why the variant comparison further down is a fair head-to-head: the underlying extraction is identical across all rows.
          </p>
        </Section>

        {/* ─────────── Open-model results ─────────── */}
        <Section title="Open-model results" tag="Diagnostic · 03">
          <p className="text-sm leading-relaxed mb-6 text-ink">
            All models evaluated under identical conditions: each received exactly one compact CSV-formatted evidence card per question (the relevant table only), plus the question and a single-sentence system instruction. No proprietary tooling was required to produce the cards.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Model type</th>
                  <th className="text-right">Highest Score</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {MODEL_ROWS.map((r, i) => (
                  <tr
                    key={i}
                    className={r.highlight ? "[&_td]:bg-panel font-medium" : ""}
                  >
                    <td className={r.highlight || r.emphasis ? "font-medium text-ink" : ""}>{r.model}</td>
                    <td className="text-text-secondary">{r.type}</td>
                    <td className="text-right tabular-nums font-medium">{r.score}</td>
                    <td className="text-text-secondary">{r.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-text-secondary mt-4 leading-relaxed">
            Two 7–8B-class open-weight models reach 11/13 on this diagnostic — strong open-model performance that approaches the closed reference baseline. The one-cell gap is a known pipeline issue (a table split across a page break) that is addressable on the pipeline side, not a model capability limit.
          </p>
        </Section>

        {/* ─────────── Core insight callout ─────────── */}
        <section className="mb-16 border-t border-b border-border py-8">
          <div className="text-xs text-text-secondary uppercase tracking-widest mb-2">
            Core insight
          </div>
          <p className="text-base font-medium text-ink leading-relaxed">
            Several open and open-weight models perform strongly when the table is delivered as a compact CSV-formatted evidence card rather than a full-document derivative. A 3-billion-parameter open model can outperform a 13-billion-parameter domain-oriented open model on the same task when the smaller model receives a better-shaped evidence package.
          </p>
        </section>

        {/* ─────────── How CSV-format cards lifted open-tier ─────────── */}
        <Section title="How CSV-format cards lifted open-tier performance" tag="Variant comparison · 04">
          <p className="text-sm leading-relaxed mb-6 text-ink">
            Across the full 13-question diagnostic, evidence packaging measurably lifts the average open-tier pass rate:
          </p>
          <table className="w-full text-[13px] mb-6">
            <thead>
              <tr>
                <th>Evidence variant served to the open model</th>
                <th className="text-right">Open-tier pass rate</th>
                <th className="text-right">Per-card size (typical)</th>
                <th className="text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              {VARIANTS.map((v, i) => (
                <tr key={i} className={v.highlight ? "[&_td]:bg-panel font-medium" : ""}>
                  <td className={v.highlight ? "font-medium" : ""}>{v.variant}</td>
                  <td className="text-right tabular-nums">{v.rate}</td>
                  <td className="text-right tabular-nums text-text-secondary">{v.size}</td>
                  <td className="text-right">
                    <Link href={`/erschliessung/variants/${v.slug}`} className="text-accent hover:text-link-hover text-xs">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-text-secondary mb-6 leading-relaxed">
            <Link href="/erschliessung/variants" className="text-accent hover:text-link-hover">
              See all variants and evaluation modes →
            </Link>{" "}
            Each variant has a dedicated page documenting input sources, generator script, AI use, OCR tooling, approximate processing time, resource intensity, and evaluation results.
          </p>
          <div className="border-l-2 border-ink pl-4 py-2 mt-8 text-sm leading-relaxed text-ink font-medium">
            CSV-format cards lift open-tier pass rate from 27% to 55% — a 28-percentage-point gain achieved purely by packaging the same extracted table data in a different format. No additional model fine-tuning. No proprietary tooling. The lift comes from how the archive presents the evidence.
          </div>
        </Section>

        {/* ─────────── Possible actions forward ─────────── */}
        <Section title="Possible actions forward" tag="Roadmap · 05">
          <div className="border-t border-border">
            {OPTIONS.map((o) => (
              <div key={o.key} className="grid grid-cols-[80px_1fr] gap-6 py-6 border-b border-border">
                <div className="text-xs text-text-secondary uppercase tracking-widest font-medium">
                  Option {o.key}
                </div>
                <div>
                  <div className="text-base font-medium text-ink mb-1">{o.name}</div>
                  <div className="text-sm text-text-secondary leading-relaxed">{o.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ─────────── Caveats ─────────── */}
        <Section title="Caveats" tag="Scope · 06">
          <div className="border-l-2 border-status-warning pl-4 py-1 text-sm leading-relaxed text-ink">
            This is a small diagnostic benchmark — 13 questions across 3 documents — not yet proof of broad generalization. Non-oracle retrieval (Option A) needs to reach oracle parity on the known corpus before any held-out scaling test (Option F) becomes meaningful. The benchmark is designed to surface pipeline failure modes and isolate the evidence-packaging variable; it is not a comprehensive evaluation of open-model capability for all archival use cases.
          </div>
        </Section>

      </main>

      {/* ─────────── Footer ─────────── */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs text-text-secondary leading-relaxed">
            Source: cycle 17 of the Erschließung evaluation harness, run 2026-05-22. Card variant: <code className="bg-panel px-1.5 py-0.5">pipeline-v0.7-csv-only</code>. Mode: <code className="bg-panel px-1.5 py-0.5">M3-L4</code> (oracle retrieval — one card per question). Question set: 13 active queries across V27, V35, NOAA-32079, pre-registered in <code className="bg-panel px-1.5 py-0.5">ADVANCED_QUERIES.md</code> before model evaluation. Project repository: <a href="https://github.com/WelcomePastToday/Erschliessung" className="text-accent hover:text-link-hover">github.com/WelcomePastToday/Erschliessung</a>.
          </p>
        </div>
      </footer>

    </div>
  );
}

// ─────────────────────── Subcomponents ───────────────────────

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

