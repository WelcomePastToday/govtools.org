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

interface ProvenanceRow {
  artifact: string;
  detail: string;
  source: "ia-has-it" | "ia-derivable" | "rerun-docling" | "pipeline-only";
}

const PROVENANCE_ROWS: ProvenanceRow[] = [
  {
    artifact: "The PDF itself",
    detail: "The archival document — the only thing the Internet Archive is guaranteed to hold for an item.",
    source: "ia-has-it",
  },
  {
    artifact: "docling.json.gz",
    detail: "Docling's full structural extraction: layout, tables, captions, headings, figure bounding boxes, reading order. The Internet Archive holds this for items it has already processed. For unprocessed items, the pipeline runs Docling on the PDF once and produces it.",
    source: "ia-has-it",
  },
  {
    artifact: "Per-table CSV / Parquet / HTML / Markdown",
    detail: "One file per detected table, extracted from docling.json.gz. Pure transformation — no model needed, no second Docling pass needed.",
    source: "ia-derivable",
  },
  {
    artifact: "Table context envelopes",
    detail: "Captions, headings, and neighboring paragraphs for each table. All present in docling.json.gz; the pipeline just picks them out.",
    source: "ia-derivable",
  },
  {
    artifact: "Compact per-table evidence cards",
    detail: "The 1–2 KB CSV-format cards that drive the headline result. Built from the per-table CSV + selected context. No Docling re-run; no extra Internet Archive fetch beyond the JSON.",
    source: "ia-derivable",
  },
  {
    artifact: "Card variants (csv-only, micro-1k, table-normalized, …)",
    detail: "Reshapes of the base card. Each variant changes what the model sees, never what was extracted. All derive from docling.json.gz.",
    source: "ia-derivable",
  },
  {
    artifact: "Document-level maps (table index, figures index, entity index)",
    detail: "Per-document summaries used for two-shot retrieval and discovery. Derived from docling.json.gz alone.",
    source: "ia-derivable",
  },
  {
    artifact: "Figure image crops (PNG)",
    detail: "Cropped pixels for each detected figure. The bounding boxes are in docling.json.gz but the pixels are not — producing the PNGs requires either the original PDF + a crop step, or re-running Docling with extract_figures=True.",
    source: "rerun-docling",
  },
  {
    artifact: "manifest.json, provenance.json, docling_meta.json",
    detail: "Pipeline metadata: source URL, content-addressed hashes, extractor version, run timing. The pipeline writes these; they do not exist anywhere upstream.",
    source: "pipeline-only",
  },
];

const PROVENANCE_LABEL: Record<ProvenanceRow["source"], string> = {
  "ia-has-it":      "On the Internet Archive",
  "ia-derivable":   "Derivable from the JSON",
  "rerun-docling":  "Needs Docling re-run or PDF",
  "pipeline-only":  "Pipeline metadata only",
};

const PROVENANCE_CLASSES: Record<ProvenanceRow["source"], string> = {
  "ia-has-it":      "border-status-success text-status-success",
  "ia-derivable":   "border-border text-text-secondary",
  "rerun-docling":  "border-status-warning text-status-warning",
  "pipeline-only":  "border-border text-text-secondary",
};

const VARIANTS = [
  { variant: "Project full v0.6.1 card (markdown + context envelope)", rate: "27%", size: "15–42 KB", slug: "pipeline-v0.6.1" },
  { variant: "Compact 1K card (caption + table only)", rate: "40%", size: "~1.2 KB", slug: "pipeline-v0.6.1-micro-1k" },
  { variant: "Compact 2K card (+ 1 paragraph)", rate: "49%", size: "~2 KB", slug: "pipeline-v0.6.1-micro-1k" },
  { variant: "Table-only (table + caption, no metadata)", rate: "52%", size: "~1 KB", slug: "pipeline-v0.6.1-table-only" },
  { variant: "CSV-only card (table data as CSV)", rate: "55%", size: "~1.5 KB", highlight: true, slug: "pipeline-v0.6.1-csv-only" },
  { variant: "Labeled-faithfulness card (per-section provenance labels)", rate: "49%", size: "~2.4 KB", slug: "pipeline-v0.6.1-labeled" },
  { variant: "Evidence-Preserving Table Normalization (cycle 30, net 0 — pulls up mid-tier, slight nudge down on top open models)", rate: "55%", size: "~1.5 KB", slug: "pipeline-v0.6.1-table-normalized" },
];

interface OptionRow {
  key: string;
  name: string;
  desc: string;
  status: "next" | "near-term" | "longer-term" | "gated";
}

const OPTIONS: OptionRow[] = [
  { key: "A", status: "next",        name: "Make non-oracle retrieval work on the known corpus", desc: "Oracle retrieval (M3-L4) is saturated at 11/13 for top open models. The next milestone is end-to-end: the system selects the correct table from a document map and then answers — without the human pointing to the evidence. M3-IDX (two-shot table-of-contents lookup) and M3-HYDE (vector retrieval via nomic-embed-text) are the candidate mechanisms. Reach oracle parity on the 13-question diagnostic before testing new documents." },
  { key: "B", status: "near-term",   name: "Close the multi-page table stitching gap",            desc: "Q-NOAA-CALC-001 fails for every model in this study because the pipeline splits the underlying table at a page break. Fixing this at the pipeline layer (the stitch-map variant is a start) closes the gap uniformly for every model tier — pipeline work that pays off across the entire panel." },
  { key: "C", status: "near-term",   name: "Standardize a minimal evidence-derivative set",       desc: "Define the small set of derivatives institutions should publish alongside preserved PDFs. Likely candidates: docling.json.gz, per-table CSV, csv-only card, table_index, and provenance.json. Aim is one clear specification so any archive — IA or otherwise — can produce evidence packages open models can use." },
  { key: "D", status: "longer-term", name: "Build an open-model access layer for the derivatives", desc: "Expose cards, maps, indexes, and provenance through an HTTP API or MCP server so an open model running locally (Ollama, llama.cpp) can discover and request the right card on demand. Pairs naturally with the M3-IDX work in Option A." },
  { key: "E", status: "longer-term", name: "Explore multimodal evidence for VL-capable open models", desc: "Test whether figure crops and image-aware cards improve performance for open vision-language models (Qwen2.5-VL, InternVL, Molmo-2-O, Gemma-SEA-LION-VL, EuroLLM-VL). Useful where OCR introduces noise the text-only pipeline cannot recover." },
  { key: "F", status: "gated",       name: "Held-out scaling pilot — gated on Option A",          desc: "Once non-oracle retrieval reaches oracle parity on the known corpus, run a multi-document pilot to test generalization across government reports, scientific journals, and archival PDFs of varying scan quality and structure. Premature without A — scaling a system whose retrieval doesn't yet work just scales the failure mode." },
];

const OPTION_STATUS_LABEL: Record<OptionRow["status"], string> = {
  "next":        "Next",
  "near-term":   "Near-term",
  "longer-term": "Longer-term",
  "gated":       "Gated",
};

const OPTION_STATUS_CLASSES: Record<OptionRow["status"], string> = {
  "next":        "border-status-success text-status-success",
  "near-term":   "border-border text-text-secondary",
  "longer-term": "border-border text-text-secondary",
  "gated":       "border-status-warning text-status-warning",
};

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
              href="/erschliessung/interpolation"
              className="text-xs font-medium text-text-secondary uppercase tracking-widest hover:text-accent transition-colors"
            >
              Interpolation
            </Link>
            <a
              href="/erschliessung/heatmap.html"
              className="text-xs font-medium text-text-secondary uppercase tracking-widest hover:text-accent transition-colors"
            >
              Cycle heatmap
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">

        {/* ─────────── Hero ─────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-16 mb-16 border-b border-border">
          <div className="lg:col-span-8">
            <div className="text-xs text-text-secondary uppercase tracking-widest mb-4">
              Erschließung · Archival evidence packaging for open models
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6 text-ink">
              Evidence packaging changes what open models can do with archives.
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed">
              Docling extracts the structure. The pipeline turns that structure into compact, citable evidence packages — and changing the format alone lifts open-tier pass rate on a 13-question diagnostic from 27% to 55%, without fine-tuning or a proprietary API workflow.
            </p>
          </div>
          <div className="lg:col-span-4 lg:pt-2">
            <div className="text-xs text-text-secondary uppercase tracking-widest mb-3">
              The unit of access shifts
            </div>
            <p className="text-base font-medium leading-relaxed pt-4 border-t border-border text-ink">
              Not the whole PDF. Not the giant Docling JSON. The specific table or evidence slice a model needs to answer a question.
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

        {/* ─────────── How CSV-format cards lifted open-tier ─────────── */}
        <Section title="How CSV-format cards lifted open-tier performance" tag="Evidence packaging · 01">
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

        {/* ─────────── Open-model results ─────────── */}
        <Section title="Open-model results" tag="Diagnostic · 02">
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
            Two 7–8B-class open-weight models reach 11/13 on this diagnostic — strong open-model performance approaching the closed reference baseline. The one-cell gap is a known pipeline issue (a table split across a page break) that is addressable on the pipeline side, not a model capability limit.
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

        {/* ─────────── Where the project stands ─────────── */}
        <section className="mb-16">
          <div className="flex items-baseline justify-between border-b border-border pb-2 mb-6">
            <h2 className="text-lg font-bold text-ink tracking-tight">Where the project stands</h2>
            <span className="text-xs text-text-secondary uppercase tracking-widest">Status · 03</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border-l-2 border-status-success pl-4">
              <div className="text-xs uppercase tracking-widest mb-2 text-status-success font-medium">
                Saturated
              </div>
              <p className="text-sm leading-relaxed text-ink mb-2 font-medium">
                Oracle-retrieval evidence cards.
              </p>
              <p className="text-sm leading-relaxed text-text-secondary">
                When the right table is pre-selected for the model (mode M3-L4), top open models reach 11/13 on the diagnostic. The remaining one-cell gap is a known pipeline issue — Q-NOAA-CALC-001, a table the pipeline splits at a PDF page break — not a model capability limit.
              </p>
            </div>
            <div className="border-l-2 border-status-warning pl-4">
              <div className="text-xs uppercase tracking-widest mb-2 text-status-warning font-medium">
                Next bottleneck
              </div>
              <p className="text-sm leading-relaxed text-ink mb-2 font-medium">
                Non-oracle retrieval on the known corpus.
              </p>
              <p className="text-sm leading-relaxed text-text-secondary">
                The system must select the right evidence package itself before asking the model. Two-shot table-of-contents lookup (M3-IDX) and vector retrieval over pre-embedded cards (M3-HYDE) are the candidate mechanisms. Reaching oracle parity here is the gate before any held-out scaling pilot becomes meaningful.
              </p>
            </div>
          </div>
        </section>

        {/* ─────────── What this project tests ─────────── */}
        <Section title="What this project tests" tag="Method · 04">
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

        {/* ─────────── Where each artifact comes from ─────────── */}
        <Section title="Where each artifact comes from" tag="Provenance · 05">
          <p className="text-sm leading-relaxed mb-6 text-ink">
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
          <p className="text-xs text-text-secondary mt-6 leading-relaxed">
            <strong className="text-ink font-medium">Why this matters for scale.</strong> If the Internet Archive holds <code className="bg-panel px-1.5 py-0.5">docling.json.gz</code> for an item, every evidence package shown on this page — including the compact CSV cards that produced the headline 11/13 open-tier result — can be generated from that single file. No re-running Docling. No re-downloading the PDF. The archive&apos;s existing Docling derivative is enough.
          </p>
        </Section>

        {/* ─────────── Possible actions forward ─────────── */}
        <Section title="Possible actions forward" tag="Roadmap · 06">
          <p className="text-xs text-text-secondary uppercase tracking-widest mb-6">
            Sequenced by readiness — Option A is the next gate; the held-out scaling pilot waits on it.
          </p>
          <div className="border-t border-border">
            {OPTIONS.map((o) => (
              <div key={o.key} className="grid grid-cols-[80px_100px_1fr] gap-6 py-6 border-b border-border items-baseline">
                <div className="text-xs text-text-secondary uppercase tracking-widest font-medium">
                  Option {o.key}
                </div>
                <div>
                  <span className={`text-[10px] uppercase tracking-widest font-medium border px-2 py-0.5 ${OPTION_STATUS_CLASSES[o.status]}`}>
                    {OPTION_STATUS_LABEL[o.status]}
                  </span>
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
        <Section title="Caveats" tag="Scope · 07">
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

