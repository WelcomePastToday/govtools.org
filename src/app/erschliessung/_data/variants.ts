// Per-variant / per-test metadata for the Erschließung detail pages.
// One entry per slug; the dynamic route src/app/erschliessung/variants/[slug]/page.tsx
// reads this file and renders the detail page.
//
// Categories:
//   pipeline   — base pipeline versions (v0.3, v0.6, v0.6.1)
//   card       — per-table card variants (csv-only, micro-1k, …)
//   map        — per-document map structures (doc-index, stitch-map, …)
//   mode       — evaluation modes (M3-L4, M2c, M2a, M3-AC)

export type VariantCategory = "pipeline" | "card" | "map" | "mode";

export interface Variant {
  slug: string;
  name: string;
  category: VariantCategory;
  status: "production-recommended" | "experimental" | "deprecated" | "baseline" | "reference";
  oneLine: string;
  description: string;

  generation: {
    inputSources: string[];
    generatorScript: string;
    aiUsed: boolean;
    aiUsageNote?: string;
    ocrUsed: "yes" | "no" | "inherits-from-docling" | "inherits-from-pipeline";
    ocrTool?: string;
    processingTime: string;
    resourceIntensity: "low" | "medium" | "high" | "very-high";
    determinism: "deterministic" | "deterministic-with-llm-step" | "non-deterministic-llm";
  };

  results?: {
    bestOpenModelScore?: string;
    bestOpenModels?: string[];
    avgOpenTierPassRate?: string;
    typicalCardSize?: string;
    cycleNumber?: number;
    relativeToBaseline?: string;
  };

  outputLocation?: string;
  cardCount?: string;

  exampleHeader?: string; // for card variants — show the variant's header rendering
  examplePrompt?: string;
  exampleResponse?: string;

  caveats?: string[];
  knownLimitations?: string[];
  closesQuestions?: string[];

  introducedIn?: string;
  relatedSlugs?: string[];
}

export const VARIANTS: Variant[] = [

  // ─────────── Pipeline versions ───────────

  {
    slug: "pipeline-v0.6.1",
    name: "Pipeline v0.6.1 (full card)",
    category: "pipeline",
    status: "baseline",
    oneLine: "The reference full-featured card. All structural information Docling extracts, packaged into one Markdown card per detected table.",
    description: "The mainline pipeline output. Each card contains YAML frontmatter (provenance, table type, dimensions, page numbers), a caption, candidate-captions cross-check, inline rendered Markdown table, headings hierarchy, geographic and temporal scope claims, nearby paragraphs, and a context envelope JSON with deduped claims. Designed for models with sufficient context to read everything; baseline against which compact variants are measured.",
    generation: {
      inputSources: ["Source PDF (or IA Wayback URL)", "Docling-extracted JSON", "Docling-extracted text"],
      generatorScript: "extract_contextual_table_cards.py",
      aiUsed: false,
      ocrUsed: "inherits-from-docling",
      ocrTool: "Docling --force-reocr (Tesseract LSTM under the hood for OCR'd scans)",
      processingTime: "V27 (874 PDF pages, 186 tables): ~32 min on Apple-Silicon. NOAA-32079 (63 pages, 35 tables, born-digital): ~2 min.",
      resourceIntensity: "high",
      determinism: "deterministic",
    },
    results: {
      avgOpenTierPassRate: "27%",
      typicalCardSize: "15–42 KB per card",
      cycleNumber: 13,
      relativeToBaseline: "baseline (defines 0% lift)",
    },
    outputLocation: "user_urls_output_v0.3_reocr/sha256_<sha>/table_cards/",
    cardCount: "186 V27 + 186 V35 + 35 NOAA-32079 = 407 cards",
    caveats: [
      "Card size often exceeds 4K-context open models — content gets truncated mid-read.",
      "OCR noise propagates from Docling (e.g. column headers like 'I1I1I,000' for '111,000').",
      "Multi-page tables are split at the PDF page boundary — see pipeline-v0.7-stitched.",
    ],
    introducedIn: "v0.6 batch 1, 2026-05-21 — dedup patches added 2026-05-22 as v0.6.1.",
    relatedSlugs: ["pipeline-v0.6.1-csv-only", "pipeline-v0.6.1-stitched"],
  },

  // ─────────── v0.7 card variants ───────────

  {
    slug: "pipeline-v0.6.1-table-normalized",
    name: "Evidence-Preserving Table Normalization Layer",
    category: "card",
    status: "experimental",
    oneLine: "Five-layer deterministic OCR-confusable + column-type + table-context + authority normalizer with per-cell provenance. Repairs 444 cells across 123 cards in the V27/V35 corpus; 0 cells touched on born-digital NOAA.",
    description: "Implements the five-layer table-semantic normalization design: (1) visual-confusable detection (I↔1, O↔0, B↔8, S↔5, G↔6, Z↔2 — the cybersecurity-relevant subset that's also the systematic OCR error set); (2) column-type inference (integer, decimal, percentage, year, date, month, agency_code, country, species_name); (3) table-context correction using column-type prior + numeric range plausibility + ambiguity refusal; (4) authority matching against curated US federal agencies and ISO countries lists with confusable-aware Levenshtein distance; (5) confidence-preserving output — raw extraction always preserved alongside a `table.normalized.jsonl` side artifact carrying per-cell provenance (raw_cell, normalized_cell, column_type, column_range, reasons, confidence, ambiguous). No LLM in the loop. Zero hallucination risk. Designed for archival infrastructure where the raw extraction must never be silently overwritten.",
    generation: {
      inputSources: ["pipeline-v0.6.1 csv-only base", "Docling table CSVs", "Curated authority files (US federal agencies, ISO 3166 countries, months)"],
      generatorScript: "evaluation_runs/generate_table_normalized_variant.py (module: evaluation_runs/table_normalizer/)",
      aiUsed: false,
      ocrUsed: "inherits-from-pipeline",
      processingTime: "~6 seconds for all 407 cards.",
      resourceIntensity: "low",
      determinism: "deterministic",
    },
    results: {
      bestOpenModelScore: "10/13 (Qwen2.5-7B, Granite-3.3-8B, Llama-3 8B)",
      bestOpenModels: ["Qwen2.5-7B", "Granite-3.3-8B", "Llama-3 8B"],
      avgOpenTierPassRate: "~55% (unchanged net vs csv-only)",
      typicalCardSize: "~1.5 KB per card (same as csv-only — character substitution is byte-neutral)",
      cycleNumber: 30,
      relativeToBaseline: "Net zero on the 8-model panel, but a real distribution shift: mid-tier open models (Llama, Apertus, Gemma-2, Mistral) each gained one cell while the top two open models (Qwen-7B, Granite-8B) each lost one. Frontier (grok-4) flat. ClimateGPT-13B regressed two cells. Hypothesised mechanism: the strongest open models partly use OCR noise as a column-identification signal; the normalizer removes that signal, helping weaker models and slightly hurting stronger ones. 442 cells repaired across 123 cards (V27 166, V35 276, NOAA 0). Byte-identity guard verified zero noise on the 285 untouched tables.",
    },
    outputLocation: "card_sets/pipeline-v0.7-table-normalized/",
    cardCount: "407 cards + 123 .normalized.jsonl side artifacts",
    closesQuestions: ["Q-NAT-015 V35 rainfall — column header `my 1954` → `1954`, January `8I` → `81`, February long-term `I47` → `147`; the ground-truth answer cell `184` (Feb 1954) is byte-identical"],
    exampleHeader: "Side artifact (`table_039.normalized.jsonl`):\n\n```json\n{\n  \"raw_cell\": \"I47\",\n  \"normalized_cell\": \"147\",\n  \"column_type\": \"integer\",\n  \"column_range\": {\"min\": 84.0, \"max\": 1648.0, \"n\": 12},\n  \"reasons\": [\n    \"column_type=integer\",\n    \"in_range[84,1648]\",\n    \"confusable_substitution: 'I47' → '147'\"\n  ],\n  \"confidence\": 0.97,\n  \"ambiguous\": false\n}\n```",
    caveats: [
      "Visual-confusable substitution is bounded to character-recognition errors that have a small fixed alphabet. Errors caused by table-structure detection failures (bbox-level mistakes that put data in the wrong cell) are out of scope.",
      "Cycle 29 lesson: global formatting normalization is unsafe — even byte-level changes to em-dashes can alter local-model output. The refined cycle 30 build enforces byte-identity for tables the normalizer does not touch.",
      "The normalizer is deliberately conservative — when a confusable substitution yields multiple plausible candidates in range, the cell is marked ambiguous and kept raw. 0 ambiguous cells were generated on the current corpus.",
      "Genuinely illegible cells (e.g. V35 table_039 July long-term cell reads `oe)`) are left raw, not guessed. Refusal beats fabrication.",
    ],
    introducedIn: "v0.7 module, 2026-05-23 — full design doc at docs/table-semantic-normalizer.md in the project repository.",
    relatedSlugs: ["pipeline-v0.6.1-csv-only", "pipeline-v0.6.1-csv-normalized-rules"],
  },

  {
    slug: "pipeline-v0.6.1-csv-only",
    name: "CSV-only card",
    category: "card",
    status: "production-recommended",
    oneLine: "Table data rendered as raw CSV inside a Markdown code block. The most-effective open-tier variant.",
    description: "Strips the full v0.6.1 card down to caption + PDF page + the CSV that Docling already exported. No YAML frontmatter, no context envelope, no candidate captions, no nearby paragraphs. The hypothesis was that open models trained heavily on code parse CSV more reliably than Markdown tables wrapped in metadata. Confirmed by cycle 17: two 7-8B open-weight models (Qwen2.5-7B, Granite-3.3-8B) reach 11/13 on this variant, lifting the open-tier average pass rate from 27% to 55%.",
    generation: {
      inputSources: ["Existing pipeline-v0.6.1 cards (frontmatter for caption + page)", "Existing tables/table_NNN.csv (Docling export)"],
      generatorScript: "evaluation_runs/generate_map_variants.py:render_csv_only",
      aiUsed: false,
      ocrUsed: "inherits-from-pipeline",
      processingTime: "~5 seconds for 407 cards across 3 documents (CPU-only transform, no Docling re-run).",
      resourceIntensity: "low",
      determinism: "deterministic",
    },
    results: {
      bestOpenModelScore: "11/13",
      bestOpenModels: ["Qwen2.5-7B", "Granite-3.3-8B"],
      avgOpenTierPassRate: "55%",
      typicalCardSize: "~1.5 KB per card (median 903 bytes, max 34 KB)",
      cycleNumber: 17,
      relativeToBaseline: "+28 percentage points open-tier",
    },
    outputLocation: "card_sets/pipeline-v0.7-csv-only/",
    cardCount: "409 cards (407 base + 2 corrected overrides)",
    exampleHeader: "Cruise Number Total SEA,empty_header,DAY Total Station Dates,empty_header_1,Area covered,Nature of the survey & Techniques used",
    caveats: [
      "Docling's CSV exports sometimes have malformed headers (`empty_header` placeholders, concatenated multi-row headers). See `csv-normalized-rules` for a deterministic fix.",
      "Fused-row rows (e.g. cyprid `April May,1491 35,...`) still cause CELL_READ_ERROR. See `csv-demerged`.",
      "Multi-page tables are still split at the PDF page break. See `stitched`.",
    ],
    introducedIn: "v0.7 variant family, 2026-05-22.",
    relatedSlugs: ["pipeline-v0.6.1-csv-normalized-rules", "pipeline-v0.6.1-csv-demerged", "pipeline-v0.6.1-stitched"],
  },

  {
    slug: "pipeline-v0.6.1-csv-normalized-rules",
    name: "CSV-only with deterministic header normalization",
    category: "card",
    status: "experimental",
    oneLine: "CSV cards with column headers cleaned by deterministic rules (no LLM). Addresses cycle-17 CELL_READ_ERROR failures from malformed Docling headers.",
    description: "Builds on csv-only by post-processing the header row of each CSV. Rules: replace `empty_header` placeholders with positional `col_N` labels; snake-case existing labels; collapse consecutive underscores; truncate >60 chars; de-duplicate within the header row (suffix duplicates with `_2`, `_3`). Pure rule-based — no LLM in the loop, so the normalizer can never introduce new failure modes (unlike the cycle-27 LLM-normalized variant which hallucinated duplicate column names).",
    generation: {
      inputSources: ["pipeline-v0.6.1 csv-only base", "Docling table CSVs"],
      generatorScript: "evaluation_runs/generate_csv_normalized_rules.py",
      aiUsed: false,
      ocrUsed: "inherits-from-pipeline",
      processingTime: "~3 seconds for all 407 cards.",
      resourceIntensity: "low",
      determinism: "deterministic",
    },
    results: {
      typicalCardSize: "~1.5 KB per card (same as csv-only — header rewrite is byte-neutral)",
      cycleNumber: 28,
      relativeToBaseline: "evaluation pending re-run with deterministic version (cycle-27 LLM version regressed strong models)",
    },
    outputLocation: "card_sets/pipeline-v0.7-csv-normalized-rules/",
    cardCount: "407 cards (9 with duplicate columns resolved, 132 unchanged)",
    exampleHeader: "Before: `Cruise Number Total SEA,empty_header,DAY Total Station Dates,empty_header_1,Area covered,Nature of the survey & Techniques used`\n\nAfter: `cruise_number_total_sea,col_1,day_total_station_dates,col_3,area_covered,nature_of_the_survey_and_techniques_used`",
    caveats: [
      "Doesn't fix Docling's multi-row-header fusion — concatenated header text like 'Cruise Number Total SEA' is preserved as one slug; semantic splitting would require structural reconstruction.",
      "Conservative — `empty_header` becomes `col_N` rather than inferring the column's meaning. Models still need to determine from data what each column contains.",
    ],
    introducedIn: "v0.7 follow-up after cycle 27 LLM-normalizer regression, 2026-05-23.",
    relatedSlugs: ["pipeline-v0.6.1-csv-only"],
  },

  {
    slug: "pipeline-v0.6.1-csv-demerged",
    name: "CSV with row-de-merge",
    category: "card",
    status: "experimental",
    oneLine: "CSV cards with fused multi-row records split back. Addresses OCR-merged rows like the cyprid 'April May,1491 35,...' case.",
    description: "Docling sometimes fuses two or three adjacent table rows into a single CSV row with space-separated values within each cell. This variant detects and splits those rows back using conservative deterministic rules: row label must be 2-3 consecutive months OR consecutive years AND every cell must have N-matching token count (or 1 token, which is replicated across the merged rows). Conservative triggers prevent false positives.",
    generation: {
      inputSources: ["pipeline-v0.6.1 csv-only base", "Docling table CSVs"],
      generatorScript: "evaluation_runs/generate_row_demerge_variant.py",
      aiUsed: false,
      ocrUsed: "inherits-from-pipeline",
      processingTime: "~2 seconds for 407 cards.",
      resourceIntensity: "low",
      determinism: "deterministic",
    },
    results: {
      bestOpenModelScore: "10/13 (Qwen2.5-7B)",
      bestOpenModels: ["Qwen2.5-7B"],
      typicalCardSize: "~1.5 KB per card (de-merging adds rows, not bytes per row)",
      cycleNumber: 28,
      relativeToBaseline: "Mixed. Closes the cyprid fusion case (Q-NAT-012 now passes for Qwen2.5-7B, Granite-3.3-8B, Gemma-2 9B, and Apertus 8B Instruct), but introduces regressions on adjacent fused-row tables where the conservative trigger fires on data the model used to read correctly. Qwen2.5-7B 11→10; Granite-3.3-8B 11→9 versus csv-only baseline. Net open-tier change is slightly negative.",
    },
    outputLocation: "card_sets/pipeline-v0.7-csv-demerged/",
    cardCount: "407 cards (8 with row-de-merges applied; 14 rows total split)",
    closesQuestions: ["Q-NAT-012 (cyprid larvae April 1947) — confirmed closed for Qwen2.5-7B, Granite-3.3-8B, Gemma-2 9B, Apertus 8B Instruct, and the closed reference baseline"],
    exampleHeader: "Before: `April May,1491 35,137 a,110 68,2918 :`\n\nAfter:\n```\nApril,1491,137,110,2918\nMay,35,a,68,:\n```",
    caveats: [
      "Cycle 28 showed the de-merge is too eager on NOAA cruise schedule tables — splitting fused-year rows (e.g. '1974 1975') changed the table shape enough that Granite-3.3-8B regressed on Q-NOAA-PATTERN-001 and Q-NAT-015, where the un-split form had been answered correctly.",
      "Conservative trigger means some fused rows still pass through unsplit (e.g. 3-month rows like 'April May June' where some cells have only 1 token but others have 2).",
      "Replicated single-token values may not always be correct — when Docling fused two rows with the same value, we assume both rows shared it.",
      "OCR garbage in individual cells (e.g. 'a' instead of a number) is preserved, not corrected.",
      "Next iteration: scope the trigger by table type (month-labeled monthly-series only), not by row-pattern heuristic alone.",
    ],
    introducedIn: "v0.7 follow-up after cycle 26 + 27 diagnostics, 2026-05-23.",
    relatedSlugs: ["pipeline-v0.6.1-csv-only", "pipeline-v0.6.1-csv-normalized-rules"],
  },

  {
    slug: "pipeline-v0.6.1-stitched",
    name: "CSV with multi-page table stitching",
    category: "card",
    status: "experimental",
    oneLine: "Multi-page tables reunited across the PDF page break. Closes Q-NOAA-CALC-001 for frontier-tier reference; open models still need stronger arithmetic to use it.",
    description: "When the v0.6.1 pipeline flagged `extends_to_page_bottom: true` on a card, this variant inspects the next card and — if column structures match — concatenates the two CSVs minus the duplicate header. Direct evidence-side fix for the Q-NOAA-CALC-001 multi-page-table failure: table_017 (PDF page 18, cruises 50Y01–50Y11) + table_018 (PDF page 19, starts with 50Y12) become a single 24-row card containing all 12 1950 cruises plus continuations.",
    generation: {
      inputSources: ["pipeline-v0.6.1 cards with extends_to_page_bottom signal", "Docling table CSVs"],
      generatorScript: "evaluation_runs/generate_stitched_variant.py",
      aiUsed: false,
      ocrUsed: "inherits-from-pipeline",
      processingTime: "~3 seconds for 407 cards.",
      resourceIntensity: "low",
      determinism: "deterministic",
    },
    results: {
      bestOpenModelScore: "9/13 (Qwen2.5-7B, Granite-3.3-8B)",
      avgOpenTierPassRate: "open-tier dropped slightly versus csv-only (some models confused by larger card)",
      typicalCardSize: "5.5 KB for stitched cards (vs 1.9 KB un-stitched)",
      cycleNumber: 26,
      relativeToBaseline: "closes Q-NOAA-CALC-001 for the reference frontier model; open models still struggle with 12-cell arithmetic even with the data present",
    },
    outputLocation: "card_sets/pipeline-v0.7-stitched/",
    cardCount: "407 cards (15 stitched pairs detected — 6 V27, 3 V35, 6 NOAA)",
    closesQuestions: ["Q-NOAA-CALC-001 (cruise stations sum across page break) — for the frontier reference baseline"],
    caveats: [
      "Stitched cards are larger than un-stitched (~3× for NOAA case) — slightly above the 4K threshold that ClimateGPT-7B/13B require.",
      "Open-tier models still struggle to sum 12 cells correctly even when the data is present. The pipeline-side gap is closed; the model-side arithmetic gap is the remaining bottleneck.",
      "False positive risk: the column-compatibility check is heuristic. Two consecutive unrelated tables with similar columns could be falsely stitched (none observed in current corpus).",
    ],
    introducedIn: "v0.7 task #47/6 implementation, 2026-05-22.",
    relatedSlugs: ["pipeline-v0.6.1-csv-only", "pipeline-v0.6.1-stitch-map"],
  },

  {
    slug: "pipeline-v0.6.1-micro-1k",
    name: "Micro card (≤1K tokens)",
    category: "card",
    status: "experimental",
    oneLine: "Smallest viable card: caption + inline Markdown table + 6-line YAML. Targets the 4K-context open-model tier.",
    description: "Stripped to absolute minimum: caption + PDF page + the Markdown table inline + a 6-line YAML frontmatter (variant tag, table number, source SHA, faithfulness level). Roughly 1 KB / 250 tokens per card. Designed for open models with strict 4K context windows.",
    generation: {
      inputSources: ["pipeline-v0.6.1 cards", "Docling-extracted Markdown tables"],
      generatorScript: "evaluation_runs/generate_card_variants.py:render_micro_1k",
      aiUsed: false,
      ocrUsed: "inherits-from-pipeline",
      processingTime: "~2 seconds for all 407 cards.",
      resourceIntensity: "low",
      determinism: "deterministic",
    },
    results: {
      avgOpenTierPassRate: "40%",
      typicalCardSize: "~1.2 KB per card",
      cycleNumber: 14,
      relativeToBaseline: "+13 percentage points open-tier versus v0.6.1 baseline",
    },
    outputLocation: "card_sets/pipeline-v0.7-micro-1k/",
    cardCount: "407 cards",
    caveats: [
      "Strips all surrounding context — questions requiring methodology (e.g. interpolation) lose the explanatory paragraphs.",
      "Markdown table format performs worse than CSV on this benchmark; csv-only is the preferred compact format.",
    ],
    introducedIn: "v0.7 variant family, 2026-05-22.",
    relatedSlugs: ["pipeline-v0.6.1-csv-only", "pipeline-v0.6.1-table-only"],
  },

  {
    slug: "pipeline-v0.6.1-table-only",
    name: "Table-only card",
    category: "card",
    status: "experimental",
    oneLine: "Just the Markdown table + 1-line caption. No frontmatter, no metadata.",
    description: "The most stripped-down card: a 1-line caption and the rendered Markdown table. <500 tokens typical. Stress test of whether structured table data alone is enough.",
    generation: {
      inputSources: ["pipeline-v0.6.1 cards", "Docling-extracted Markdown tables"],
      generatorScript: "evaluation_runs/generate_card_variants.py:render_table_only",
      aiUsed: false,
      ocrUsed: "inherits-from-pipeline",
      processingTime: "~2 seconds for all 407 cards.",
      resourceIntensity: "low",
      determinism: "deterministic",
    },
    results: {
      avgOpenTierPassRate: "52%",
      typicalCardSize: "~1 KB per card (median ~600 bytes)",
      cycleNumber: 16,
      relativeToBaseline: "+25 percentage points open-tier versus v0.6.1 baseline",
    },
    outputLocation: "card_sets/pipeline-v0.7-table-only/",
    cardCount: "407 cards",
    introducedIn: "v0.7 variant family, 2026-05-22.",
    relatedSlugs: ["pipeline-v0.6.1-csv-only", "pipeline-v0.6.1-micro-1k"],
  },

  {
    slug: "pipeline-v0.6.1-labeled",
    name: "Labeled-faithfulness card",
    category: "card",
    status: "experimental",
    oneLine: "Full v0.6.1 card with every section explicitly tagged by provenance type (verbatim-cells, inherited, summarized, inferred).",
    description: "Same content as v0.6.1 but every section header carries an explicit `[VERBATIM-*]`, `[INHERITED]`, `[SUMMARIZED]`, or `[INFERRED]` tag. Tests whether explicit provenance labels improve a model's ability to refuse correctly on inferred-scope claims rather than accepting them as verbatim data.",
    generation: {
      inputSources: ["pipeline-v0.6.1 cards"],
      generatorScript: "evaluation_runs/generate_card_variants.py:render_labeled",
      aiUsed: false,
      ocrUsed: "inherits-from-pipeline",
      processingTime: "~2 seconds for all 407 cards.",
      resourceIntensity: "low",
      determinism: "deterministic",
    },
    results: {
      avgOpenTierPassRate: "49%",
      typicalCardSize: "~2.4 KB per card",
      cycleNumber: 18,
      relativeToBaseline: "+22 percentage points open-tier versus v0.6.1 baseline",
    },
    outputLocation: "card_sets/pipeline-v0.7-labeled/",
    cardCount: "407 cards",
    introducedIn: "v0.7 variant family, 2026-05-22.",
    relatedSlugs: ["pipeline-v0.6.1"],
  },

  // ─────────── Map structures ───────────

  {
    slug: "pipeline-v0.6.1-doc-index",
    name: "Document table-of-contents map",
    category: "map",
    status: "experimental",
    oneLine: "One card per document listing every detected table with caption, page, and dimensions. Enables two-shot retrieval.",
    description: "Single map per document. Lists every detected table: ID, caption, PDF page, doc page label, rows × columns, table type. ~3 KB per document — easily fits the smallest open-model context. Designed for two-shot retrieval: model reads the index, decides which table to request, then receives the specific card on a second call.",
    generation: {
      inputSources: ["All pipeline-v0.6.1 cards in a document", "Per-card frontmatter (caption, page, dims)"],
      generatorScript: "evaluation_runs/generate_map_variants.py:render_doc_index",
      aiUsed: false,
      ocrUsed: "inherits-from-pipeline",
      processingTime: "<1 second for all 3 documents (407 cards aggregated into 3 maps).",
      resourceIntensity: "low",
      determinism: "deterministic",
    },
    results: {
      bestOpenModelScore: "5/13 (Qwen2.5-7B, Granite-3.3-8B with M3-IDX two-shot mode)",
      bestOpenModels: ["Qwen2.5-7B", "Granite-3.3-8B"],
      avgOpenTierPassRate: "~25% across the 7 open models (vs ~55% under M3-L4 oracle)",
      typicalCardSize: "V27: 17 KB index map | V35: 18 KB | NOAA: 3 KB",
      cycleNumber: 31,
      relativeToBaseline: "Evaluated in cycle 31 via the new M3-IDX two-shot retrieval harness mode. Result: every model loses 2-6 cells vs the cycle 17 M3-L4 oracle ceiling. The strongest open models (Qwen-7B, Granite-8B) lose the most (-6 each) because the open-tier breakthrough was the oracle removing retrieval. Three structural failure modes surfaced: caption-quality bottleneck (Q-NAT-INT-001 had 0% retrieval — all V27 phosphorus-table captions read 'No caption detected.'), pipeline mis-label propagation (Q-NAT-012 had 5/8 models pick `table_124` instead of `table_125` because the pipeline mis-labels nauplii data as 'cyprid'), and negative-control retrieval immunity (Q-NOAA-NEG-001 had 0% retrieval but 88% pass because no table has 1948 data).",
    },
    outputLocation: "card_sets/pipeline-v0.7-doc-index/",
    cardCount: "3 maps (one per document)",
    caveats: [
      "Many V27/V35 entries read `'No caption detected.'` because Docling couldn't OCR a caption for that table — the model has to guess from `rows × cols` and `type` columns. This is the dominant bottleneck cycle 31 exposed.",
      "Pipeline mis-labels (a wrong caption assigned to a table) cause retrieval failures across every model. Q-NAT-012's 0% retrieval is entirely due to the table_124 caption saying 'cyprid' when the data is actually nauplii — same mis-label first caught in cycle 2.",
      "Negative-control questions are retrieval-immune: when no table has the answer, picking the wrong table still produces a correct refusal. Q-NOAA-NEG-001 had 0% retrieval correct but 88% verdict pass.",
      "Recommended next variant: enriched doc-index with 2-3 sample rows + column headers + scope info per table entry. Index size grows ~3× but stays well under any context limit.",
    ],
    introducedIn: "v0.7 map structures, 2026-05-22. Evaluated via M3-IDX mode, 2026-05-23.",
    relatedSlugs: ["pipeline-v0.6.1-stitch-map", "pipeline-v0.6.1-csv-only", "mode-m3-idx"],
  },

  {
    slug: "pipeline-v0.6.1-stitch-map",
    name: "Multi-page continuation map",
    category: "map",
    status: "experimental",
    oneLine: "Per-document map of which tables continue onto the next PDF page.",
    description: "Lists tables flagged `extends_to_page_bottom: true` and points to their continuation cards. Lightweight alternative to the stitched-card variant — instead of fusing the data, gives the model a cross-reference so it knows to request both halves under a two-shot pattern.",
    generation: {
      inputSources: ["All pipeline-v0.6.1 cards per document", "extends_to_page_bottom signal"],
      generatorScript: "evaluation_runs/generate_map_variants.py:render_stitch_map",
      aiUsed: false,
      ocrUsed: "inherits-from-pipeline",
      processingTime: "<1 second.",
      resourceIntensity: "low",
      determinism: "deterministic",
    },
    results: {
      relativeToBaseline: "not yet evaluated — requires two-shot retrieval harness mode",
    },
    outputLocation: "card_sets/pipeline-v0.7-stitch-map/",
    cardCount: "3 maps (one per document)",
    introducedIn: "v0.7 map structures, 2026-05-22.",
    relatedSlugs: ["pipeline-v0.6.1-stitched", "pipeline-v0.6.1-doc-index"],
  },

  // ─────────── Evaluation modes ───────────

  {
    slug: "mode-m3-l4",
    name: "M3-L4 — Oracle retrieval mode",
    category: "mode",
    status: "production-recommended",
    oneLine: "Model receives exactly one pre-selected card per question. Isolates 'can the model answer given perfect retrieval?'",
    description: "The harness uses the QUERIES registry to look up which card answers each question (e.g. Q-NOAA-LOOKUP-001 → table_017). Only that single card is wrapped in the source-artifact frame and sent to the model. Measures pure reading-and-reasoning capability, with the retrieval problem removed. This is the mode used for all per-variant evaluations.",
    generation: {
      inputSources: ["Active card-set variant (e.g. csv-only)", "Question registry (harness/core.py QUERIES dict)"],
      generatorScript: "evaluation_runs/cycle_runner.py:resolve_card_path + build_user_prompt",
      aiUsed: false,
      ocrUsed: "inherits-from-pipeline",
      processingTime: "~10 seconds per cell on local 7-8B open models; ~5 seconds on the reference frontier API.",
      resourceIntensity: "medium",
      determinism: "deterministic",
    },
    introducedIn: "Cycle 2.1, 2026-05-20.",
    relatedSlugs: ["mode-m2c", "mode-m2a", "mode-m3-ac", "mode-m3-idx"],
  },

  {
    slug: "mode-m3-idx",
    name: "M3-IDX — Two-shot retrieval mode",
    category: "mode",
    status: "experimental",
    oneLine: "Model picks a table from a per-document index, then receives that table. Tests retrieval + reading together; isolates the cost of removing the oracle.",
    description: "Two model calls per question. Call 1: serve the doc-index map (`pipeline-v0.7-doc-index/<sha>/doc-index.map.md`, ~3-18 KB) with the question; the model responds with `CHOICE: table_NNN`. Call 2: load the model-selected table card and serve it under the existing M3-L4 prompt; the model answers. The verdict is whether the answer passes the scorer. An additional metric, `retrieval_correct`, records whether the model's choice matched the oracle card_id — separating retrieval failure from reading failure. If the model fails to return a parseable choice, the cell is marked fail (no oracle fallback). Designed to expose the model's own ability to find the correct table, which the M3-L4 oracle mode hides.",
    generation: {
      inputSources: ["pipeline-v0.7-doc-index variant", "raw pipeline-v0.6.1 cards for the model-selected table", "Question registry (harness/core.py QUERIES dict — used only to validate retrieval correctness, NOT to choose the card)"],
      generatorScript: "evaluation_runs/cycle_runner.py:run_cell_idx + build_idx_call_1_prompt + build_idx_call_2_prompt + parse_chosen_table_id",
      aiUsed: false,
      aiUsageNote: "The harness itself is deterministic. The MODEL is the AI doing two calls per cell — that's the test, not a pipeline choice.",
      ocrUsed: "inherits-from-pipeline",
      processingTime: "~20-30 seconds per cell on local 7-8B open models (two model calls per cell). ~60 minutes for 8 models × 13 questions.",
      resourceIntensity: "medium",
      determinism: "deterministic",
    },
    introducedIn: "Cycle 31, 2026-05-23.",
    relatedSlugs: ["mode-m3-l4", "pipeline-v0.6.1-doc-index"],
  },

  {
    slug: "mode-m2c",
    name: "M2c — Docling Markdown mode",
    category: "mode",
    status: "experimental",
    oneLine: "Model receives Docling's full linearized Markdown for the entire document.",
    description: "Instead of one targeted card, the model gets `docling.md` — Docling's full linearized text version of the whole document. NOAA = ~260 KB; V27 = 4.1 MB; V35 = 2.8 MB. Tests whether the linearized full-document format works when the model has sufficient context. Frontier-tier reference handles V27/V35 fine; smaller open models overflow on the larger documents.",
    generation: {
      inputSources: ["Docling docling.md export (whole-document linearization)"],
      generatorScript: "Docling library — produced during the initial pipeline conversion",
      aiUsed: false,
      ocrUsed: "inherits-from-docling",
      ocrTool: "Docling --force-reocr",
      processingTime: "Docling conversion: ~25 min for V27 (with OCR); model inference: ~10 seconds per cell when prompt fits.",
      resourceIntensity: "high",
      determinism: "deterministic",
    },
    introducedIn: "Cycle 8, 2026-05-21.",
    relatedSlugs: ["mode-m3-l4", "mode-m2a"],
  },

  {
    slug: "mode-m2a",
    name: "M2a — Raw Docling JSON mode",
    category: "mode",
    status: "reference",
    oneLine: "Model receives the raw decompressed docling.json.gz. Demonstrates why specialized evidence packaging is needed at all.",
    description: "Tests the failure mode that motivated the project: hand a model the IA-provided default Docling derivative (the JSON) and ask a question. V27's docling.json is 633 MB compressed, ~972 MB / 200 M+ tokens decompressed — overflows every model's context window including the reference frontier baseline. This is the negative-control mode that defines the floor.",
    generation: {
      inputSources: ["Docling docling.json.gz export"],
      generatorScript: "Docling library — produced during the initial pipeline conversion",
      aiUsed: false,
      ocrUsed: "inherits-from-docling",
      ocrTool: "Docling --force-reocr",
      processingTime: "Docling conversion: 25+ min for OCR'd documents; model inference: errors out on payload size before producing a response.",
      resourceIntensity: "very-high",
      determinism: "deterministic",
    },
    results: {
      relativeToBaseline: "0% pass rate across all models — establishes the floor that the pipeline's other derivatives must beat.",
    },
    introducedIn: "Cycle 8, 2026-05-21.",
    relatedSlugs: ["mode-m2c", "mode-m3-l4"],
  },

  {
    slug: "mode-m3-ac",
    name: "M3-AC — All-cards mode",
    category: "mode",
    status: "experimental",
    oneLine: "Model receives every card in a document concatenated. Tests retrieval-without-oracle.",
    description: "All 35 NOAA cards (or all 186 V27 cards) concatenated and served to the model in one prompt. Tests whether models can locate and answer from a document-scale card bundle without pre-selection. NOAA bundle fits in frontier-tier context; V27/V35 bundles overflow most contexts.",
    generation: {
      inputSources: ["All cards in a document (active variant)"],
      generatorScript: "evaluation_runs/harness/core.py:load_all_cards",
      aiUsed: false,
      ocrUsed: "inherits-from-pipeline",
      processingTime: "Negligible bundling time; model inference: ~10-30 seconds per cell on bundles that fit context.",
      resourceIntensity: "medium",
      determinism: "deterministic",
    },
    introducedIn: "Cycle 4, 2026-05-21.",
    relatedSlugs: ["mode-m3-l4", "pipeline-v0.6.1-doc-index"],
  },
];

export function getVariant(slug: string): Variant | undefined {
  return VARIANTS.find((v) => v.slug === slug);
}

export const VARIANTS_BY_CATEGORY: Record<VariantCategory, Variant[]> = {
  pipeline: VARIANTS.filter((v) => v.category === "pipeline"),
  card: VARIANTS.filter((v) => v.category === "card"),
  map: VARIANTS.filter((v) => v.category === "map"),
  mode: VARIANTS.filter((v) => v.category === "mode"),
};
