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
  access: string;
  score: string;
  notes: string;
  highlight?: boolean;
  comparator?: boolean;
  emphasis?: boolean;
}

const MODEL_ROWS: ModelRow[] = [
  { model: "Qwen2.5-7B", type: "Open-weight", access: "Local / reproducible", score: "11/13", notes: "Strong result with compact evidence packages.", highlight: true },
  { model: "Granite-3.3-8B", type: "Open-weight", access: "Local / reproducible", score: "11/13", notes: "Strong result with compact evidence packages.", highlight: true },
  { model: "Qwen2.5-Coder-7B", type: "Open-weight, code-tuned", access: "Local / reproducible", score: "10/13", notes: "Code-tuning did not beat the general 7B variant on this benchmark." },
  { model: "Llama-3 8B", type: "Open-weight", access: "Local / reproducible", score: "9/13", notes: "Consistent across most evidence variants." },
  { model: "DeepSeek-R1 8B", type: "Open-weight, reasoning-tuned", access: "Local / reproducible", score: "8/13", notes: "Reasoning fine-tuning gave a modest lift." },
  { model: "Apertus 70B", type: "Open / Swiss public-interest model", access: "Local or hosted endpoint", score: "7/13", notes: "Swiss AI Initiative. Larger Apertus variant.", emphasis: true },
  { model: "EuroLLM 9B", type: "Open / EU public-interest model", access: "Local / reproducible", score: "7/13", notes: "UTTER consortium. European public-interest tier coverage.", emphasis: true },
  { model: "Gemma-2 9B", type: "Open-weight", access: "Local / reproducible", score: "7/13", notes: "" },
  { model: "Apertus 8B Instruct", type: "Open / Swiss public-interest model", access: "Local or hosted endpoint", score: "6/13", notes: "Swiss AI Initiative. Mission-aligned for public-interest infrastructure.", emphasis: true },
  { model: "Mistral 7B", type: "Open-weight", access: "Local / reproducible", score: "6/13", notes: "" },
  { model: "Qwen2.5-3B", type: "Open-weight, small", access: "Local / reproducible (≤2 GB)", score: "6/13", notes: "3-billion-parameter model outperforms 13B domain model." },
  { model: "ClimateGPT-13B", type: "Domain-oriented open model", access: "Collaboration / batch run", score: "5/13", notes: "Climate-domain Llama-2 fine-tune. 4K context cap constrains larger artifacts.", emphasis: true },
  { model: "OLMo-2 7B", type: "Open / fully-open (AI2)", access: "Local / reproducible", score: "4/13", notes: "Fully open weights, data, and training code." },
  { model: "Phi-3-Mini 3.8B", type: "Open-weight, small", access: "Local / reproducible (≤2.5 GB)", score: "4/13", notes: "" },
  { model: "ClimateGPT-70B", type: "Domain-oriented open model", access: "Collaboration / batch run", score: "3/13", notes: "Larger climate-domain Llama-2 variant." },
  { model: "ClimateGPT-7B", type: "Domain-oriented open model", access: "Collaboration / batch run", score: "3/13", notes: "Smaller climate-domain Llama-2 variant." },
  { model: "PublicAI model endpoint", type: "Public-interest endpoint", access: "Partner endpoint", score: "—", notes: "Evaluation planned. Will be included when tested." },
  { model: "Closed reference baseline", type: "Proprietary reference", access: "External comparator only", score: "12/13", notes: "Included only to contextualize the diagnostic ceiling. Not the focus of this work.", comparator: true },
];

const BENEFITS = [
  { key: "01", name: "Open access", desc: "Archival knowledge becomes usable by open models. No API gatekeeping between researchers and preserved collections." },
  { key: "02", name: "Institutional control", desc: "Workflows can run on-premises or through trusted partners. Sensitive material never leaves controlled infrastructure." },
  { key: "03", name: "Provenance", desc: "Answers remain tied to specific tables, page numbers, rows, and source documents. Every cited value is traceable." },
  { key: "04", name: "Efficiency", desc: "Compact derivatives reduce the need to send full PDFs or large JSON files into model context — a ~2 KB card versus ~600 MB of source PDF and JSON." },
  { key: "05", name: "Public-interest AI", desc: "Supports Apertus, ClimateGPT, PublicAI, EuroLLM, and other open or domain-specific systems aligned with non-commercial missions." },
];

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
  { key: "A", name: "Continue open-model benchmarking", desc: "Evaluate Apertus 8B, Apertus 70B, ClimateGPT, PublicAI endpoints, and other open or open-weight models across the same evidence tiers. Build out the open-tier capability map." },
  { key: "B", name: "Standardize a minimal open-model evidence set", desc: "Define the canonical small set of derivatives institutions should publish alongside preserved PDFs. Likely candidates: table CSV, table card, csv-only card, table index, provenance manifest." },
  { key: "C", name: "Run a 5,000-document open-model pilot", desc: "Test whether the results generalize across government reports, scientific journals, and archival PDFs at scale — covering varied document structures, languages, and conditions." },
  { key: "D", name: "Prioritize multi-page table stitching", desc: "Close the known Q-NOAA-CALC-001 gap — a table the pipeline splits at a page break, which no model in this study can answer. Fixing this at the pipeline layer closes the gap for every model tier simultaneously." },
  { key: "E", name: "Build an open-model access layer", desc: "Expose cards, maps, indexes, and provenance through API, MCP server, or local retrieval tooling so open models can discover and request evidence on demand." },
  { key: "F", name: "Explore multimodal evidence for open models", desc: "Test whether figure crops and image-aware cards improve performance for open models that accept visual input (Qwen2.5-VL, InternVL, Molmo-2-O, Gemma-SEA-LION-VL, EuroLLM-VL)." },
];

const PROMPT_TEXT = `[SYSTEM]
You are answering a single information-extraction question. Use ONLY the supplied source material. Do not use prior knowledge. Give a clear, concrete answer with the specific number, name, year, or value asked for.

[USER]
--- SOURCE ARTIFACT (M3-L4 — corrected card) ---
# Table 085 — No caption detected.

PDF page: 355

\`\`\`csv
Year,Weight of fish landed (tons),Edible phosphorus in fish landed (tons),Phosphorus available for growth in Channel (tons),Usable phosphorus landed as percentage of phosphorus available for growth (Ch)
1925,"81,000",115,"I1I1I,000",O-104
1926,"79,000",103,"137,000",0-075
1927,"74,000",96,"100,000",0-096
1928,"71,000",92,"126,000",0:073
1929,"95,000",123,"126,000",0-098
1930 1931,"58,000 76,000",75 99,"== 5,000",== -104
1930 1931,"58,000 76,000",75 99,"== 95,000",== 0-104
1932,"88,000",II4,"86,000",0°133
1933,"95,000",123,"97,000",O'127
1934,"93,000",121,"88,000",0'137
1935,"65,000",85,"77,000",O-IIO
1936,"79,000",103,"86,000",0-120
1937,"76,000",99,"88,000",O-1I2
\`\`\`

--- END ARTIFACT ---

Question:
Looking at the annual fish-catch table in Vol 27, how much less fish weight was caught in 1934 than the year before? Show both source values and the difference.

Answer concisely. Cite the row/cell/section you used.`;

const RESPONSE_TEXT = `Source:
1934: 93,000 tons
1933: 95,000 tons
Difference: 2,000 tons less`;

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
            <span className="text-xs text-text-secondary uppercase tracking-widest hidden sm:inline-block">
              Erschließung · Archival Evidence for Open Models
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/erschliessung/variants"
              className="text-xs font-medium text-text-secondary uppercase tracking-widest hover:text-accent transition-colors"
            >
              Variants
            </Link>
            <div className="text-xs font-medium text-text-secondary uppercase tracking-widest">
              Diagnostic benchmark · 2026-05-23
            </div>
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
            <p className="text-lg text-text-secondary leading-relaxed">
              Compact Docling-derived evidence packages help open models answer difficult table questions from archival documents — without loading the full PDF or relying on a proprietary API workflow.
            </p>
          </div>
          <div className="lg:pt-8">
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
          <div className="grid grid-cols-1 md:grid-cols-4 border-t border-b border-border">
            {KEY_METRICS.map((m, i) => (
              <div
                key={i}
                className={`p-6 ${i < KEY_METRICS.length - 1 ? "md:border-r border-border" : ""}`}
              >
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
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

        {/* ─────────── Open-model results ─────────── */}
        <Section title="Open-model results" tag="Diagnostic · 02">
          <p className="text-sm leading-relaxed mb-6 text-ink">
            All models evaluated under identical conditions: each received exactly one compact CSV-formatted evidence card per question (the relevant table only), plus the question and a single-sentence system instruction. No proprietary tooling was required to produce the cards.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Model type</th>
                  <th>Access mode</th>
                  <th className="text-right">Score</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {MODEL_ROWS.map((r, i) => (
                  <tr
                    key={i}
                    className={
                      r.comparator
                        ? "italic text-text-secondary [&_td]:border-t-2 [&_td]:border-t-ink"
                        : r.highlight
                          ? "[&_td]:bg-panel font-medium"
                          : ""
                    }
                  >
                    <td className={r.highlight || r.emphasis ? "font-medium text-ink" : ""}>{r.model}</td>
                    <td className="text-text-secondary">{r.type}</td>
                    <td className="text-text-secondary">{r.access}</td>
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
        <section className="mb-16 border-l-2 border-status-success bg-panel p-6">
          <div className="text-xs text-text-secondary uppercase tracking-widest mb-2">
            Core insight
          </div>
          <p className="text-base font-medium text-ink leading-relaxed">
            Several open and open-weight models perform strongly when the table is delivered as a compact CSV-formatted evidence card rather than a full-document derivative. A 3-billion-parameter open model can outperform a 13-billion-parameter domain-oriented open model on the same task when the smaller model receives a better-shaped evidence package.
          </p>
        </section>

        {/* ─────────── Why this matters ─────────── */}
        <Section title="Why this matters" tag="Rationale · 03">
          <p className="text-sm leading-relaxed mb-8 text-ink">
            Internet Archive and similar public-interest institutions need AI workflows that are auditable, reproducible, affordable, and not fully dependent on proprietary APIs. This project tests whether archival PDFs can be converted into compact evidence packages that open models can use directly. The results suggest that derivative design — choosing what to extract, how to package it, and how to expose it — can make preserved documents more accessible to open AI systems running in institutional environments.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-5 border-t border-border">
            {BENEFITS.map((b, i) => (
              <div
                key={b.key}
                className={`p-6 ${i < BENEFITS.length - 1 ? "md:border-r border-border" : ""}`}
              >
                <div className="text-xs text-text-secondary uppercase tracking-widest mb-3">
                  {b.key}
                </div>
                <div className="text-base font-medium text-ink mb-2">{b.name}</div>
                <div className="text-sm text-text-secondary leading-snug">{b.desc}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ─────────── Worked example ─────────── */}
        <Section title="Worked example: a domain-oriented open model reasons correctly" tag="Evidence · 04">
          <p className="text-sm leading-relaxed mb-6 text-ink">
            The strongest demonstration of the evidence-packaging hypothesis is showing a 13-billion-parameter open model — specifically a domain-oriented Llama-2-based model with a 4,096-token context cap — execute a multi-step reasoning task correctly when given only a 1.9 KB CSV-formatted evidence card.
          </p>

          <SubHead>The question (Q-NAT-006)</SubHead>
          <div className="border-l-2 border-accent bg-panel p-4 text-sm mb-6 leading-relaxed">
            Looking at the annual fish-catch table in Vol 27, how much less fish weight was caught in 1934 than the year before? Show both source values and the difference.
          </div>
          <p className="text-xs text-text-secondary mb-8">
            <span className="uppercase tracking-widest mr-2">Ground truth</span>
            2,000 less; 1933 = 95,000; 1934 = 93,000.
          </p>

          <SubHead>The complete input the open model received</SubHead>
          <pre className="bg-panel border border-border p-6 overflow-x-auto text-xs leading-relaxed font-mono whitespace-pre mb-2 text-ink">
            {PROMPT_TEXT}
          </pre>
          <p className="text-xs text-text-secondary mb-8">
            Total prompt: 1,920 characters (~480 tokens). Fits in a 4K-context open model. OCR noise is visible in derived columns — the relevant 1933 and 1934 cells in column 2 are clean.
          </p>

          <SubHead>The open model&apos;s verbatim response</SubHead>
          <pre className="bg-panel border-l-2 border-status-success border-r border-y border-border p-6 text-xs leading-relaxed font-mono whitespace-pre mb-2 text-ink">
            {RESPONSE_TEXT}
          </pre>
          <p className="text-xs uppercase tracking-widest mb-6 text-status-success font-medium">
            ✓ Verdict: pass
          </p>

          <p className="text-sm leading-relaxed mb-3 text-ink">The 13B open model successfully:</p>
          <ul className="text-sm leading-relaxed text-ink list-disc list-inside space-y-1 mb-4">
            <li>Located the 1933 row and read column 2: <span className="font-medium">95,000 tons</span></li>
            <li>Located the 1934 row and read column 2: <span className="font-medium">93,000 tons</span></li>
            <li>Computed the difference: <span className="font-medium">95,000 − 93,000 = 2,000</span></li>
            <li>Identified the direction: <em>less</em> (because 1934 &lt; 1933)</li>
            <li>Cited both source values per the question&apos;s instruction</li>
          </ul>
          <p className="text-sm leading-relaxed text-ink">
            That is multi-step table reasoning by an open 13B model on a 4K context window — using only a 1.9 KB CSV-formatted evidence card derived from the IA-preservation pipeline.
          </p>
        </Section>

        {/* ─────────── How CSV-format cards lifted open-tier ─────────── */}
        <Section title="How CSV-format cards lifted open-tier performance" tag="Variant comparison · 05">
          <p className="text-sm leading-relaxed mb-6 text-ink">
            Across the full 13-question diagnostic, evidence packaging measurably lifts the average open-tier pass rate:
          </p>
          <table className="w-full text-sm mb-6">
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
          <div className="border-l-2 border-status-warning bg-panel p-4 text-sm leading-relaxed text-ink">
            CSV-format cards lift open-tier pass rate from 27% to 55% — a 28-percentage-point gain achieved purely by packaging the same extracted table data in a different format. No additional model fine-tuning. No proprietary tooling. The lift comes from how the archive presents the evidence.
          </div>
        </Section>

        {/* ─────────── Possible actions forward ─────────── */}
        <Section title="Possible actions forward" tag="Roadmap · 06">
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
        <Section title="Caveats" tag="Scope · 07">
          <div className="border-l-2 border-status-warning bg-panel p-4 text-sm leading-relaxed text-ink">
            This is a small diagnostic benchmark — 13 questions across 3 documents — not yet proof of broad generalization. Results from the held-out scaling test (Option C) will be needed before any operational claim about IA-scale extraction. The benchmark is designed to surface pipeline failure modes and isolate the evidence-packaging variable; it is not a comprehensive evaluation of open-model capability for all archival use cases.
          </div>
        </Section>

        {/* ─────────── Conclusion ─────────── */}
        <Section title="Conclusion" tag="Synthesis · 08">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <p className="text-sm leading-relaxed text-ink">
              This project reveals a practical path from preservation derivatives to open-model evidence infrastructure. Docling gives the Internet Archive a rich structural substrate. The pipeline adds the context, provenance, indexing, and packaging that open models need to answer table-grounded questions.
            </p>
            <p className="text-sm leading-relaxed text-ink">
              The strategic decision is not whether to replace Docling or chase proprietary model capability. It is which downstream evidence derivatives the Internet Archive should standardize, evaluate, store, and expose so open models can use archival collections responsibly at scale.
            </p>
          </div>
        </Section>

      </main>

      {/* ─────────── Footer ─────────── */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs text-text-secondary leading-relaxed">
            Source: cycle 17 of the Erschließung evaluation harness, run 2026-05-22. Card variant: <code className="bg-panel px-1.5 py-0.5">pipeline-v0.7-csv-only</code>. Mode: <code className="bg-panel px-1.5 py-0.5">M3-L4</code> (oracle retrieval — one card per question). Question set: 13 active queries across V27, V35, NOAA-32079, pre-registered in <code className="bg-panel px-1.5 py-0.5">ADVANCED_QUERIES.md</code> before model evaluation. Worked example is the verbatim prompt and response from the open project repository at <a href="https://github.com/WelcomePastToday/Erschliessung" className="text-accent hover:text-link-hover">github.com/WelcomePastToday/Erschliessung</a>.
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

function SubHead({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base font-medium text-ink mt-8 mb-3 tracking-tight">{children}</h3>
  );
}
