// OCR method metadata for /erschliessung/ocr-grid.
// Generated 2026-05-27 from the multi-tool OCR comparison on V27 + V35 + NOAA.
//
// Cost notes:
//   - USD per page: published API rates as of 2026-05; for local tools, $0 (compute only).
//   - Seconds per page: measured wall-clock on the project's M-series Mac (CPU/MPS),
//     averaged across 2-20 pages of the V27 scan (1947 marine biology journal, 300 DPI).
//   - "Full doc" cost = process every page in the source PDF. "Tables only" cost =
//     only the pages that contain tested tables (≈10% of V27, ≈3% of NOAA).

export type License = 'open-source-local' | 'open-source-paid-api' | 'commercial-paid';

export interface OcrMethod {
  slug: string;             // grid column id
  label: string;            // display name
  vendor: string;           // org or repo
  family: 'pdf-parser' | 'image-ocr' | 'vision-llm' | 'multimodal-llm';
  license: License;
  free: boolean;            // free at point of use (no $)
  localRunnable: boolean;   // can we run it locally on this Mac?
  costPerPageUSD: number;   // 0 for local-only
  secondsPerPage: number;   // measured locally or estimated from rate-limited cloud
  notes?: string;
}

export const OCR_METHODS: OcrMethod[] = [
  {
    slug: 'docling-easyocr',
    label: 'Docling + EasyOCR',
    vendor: 'IBM (Docling) + JaidedAI (EasyOCR)',
    family: 'pdf-parser',
    license: 'open-source-local',
    free: true,
    localRunnable: true,
    costPerPageUSD: 0,
    secondsPerPage: 16,
    notes: 'Erschließung pipeline default. Force-full-page OCR mode (–force-reocr).',
  },
  {
    slug: 'docling-tesseract',
    label: 'Docling + Tesseract',
    vendor: 'IBM (Docling) + Google (Tesseract)',
    family: 'pdf-parser',
    license: 'open-source-local',
    free: true,
    localRunnable: true,
    costPerPageUSD: 0,
    secondsPerPage: 3,
    notes: 'Faster than EasyOCR variant on this hardware; comparable accuracy on V27 scans.',
  },
  {
    slug: 'tesseract',
    label: 'Tesseract 5.5',
    vendor: 'Google (now community-maintained)',
    family: 'image-ocr',
    license: 'open-source-local',
    free: true,
    localRunnable: true,
    costPerPageUSD: 0,
    secondsPerPage: 1,
    notes: 'Plain text + hOCR output. No table-structure recovery; needs a layout layer on top.',
  },
  {
    slug: 'paddleocr',
    label: 'PaddleOCR / PP-Structure',
    vendor: 'PaddlePaddle (Baidu)',
    family: 'image-ocr',
    license: 'open-source-local',
    free: true,
    localRunnable: true,
    costPerPageUSD: 0,
    secondsPerPage: 8,
    notes: 'Includes table structure recognition (SLANet). Strong on born-digital tables.',
  },
  {
    slug: 'surya',
    label: 'Surya',
    vendor: 'datalab.to',
    family: 'image-ocr',
    license: 'open-source-local',
    free: true,
    localRunnable: true,
    costPerPageUSD: 0,
    secondsPerPage: 15,
    notes: 'OCR + layout + reading order + table recognition. Modern transformer-based.',
  },
  {
    slug: 'marker',
    label: 'Marker',
    vendor: 'datalab.to',
    family: 'pdf-parser',
    license: 'open-source-local',
    free: true,
    localRunnable: true,
    costPerPageUSD: 0,
    secondsPerPage: 80,
    notes: 'PDF → markdown with reading-order tables. Slower but high-fidelity.',
  },
  {
    slug: 'olmocr',
    label: 'olmOCR (Qwen2-VL 7B)',
    vendor: 'Allen Institute for AI',
    family: 'multimodal-llm',
    license: 'open-source-local',
    free: true,
    localRunnable: true,
    costPerPageUSD: 0,
    secondsPerPage: 480,
    notes: '7B vision LLM, GPU-recommended. ~5-10 min/page on CPU/MPS. Not yet tested in grid (transformers 5.x compatibility).',
  },
  {
    slug: 'mistral-ocr',
    label: 'Mistral OCR',
    vendor: 'Mistral AI',
    family: 'pdf-parser',
    license: 'commercial-paid',
    free: false,
    localRunnable: false,
    costPerPageUSD: 0.003,
    secondsPerPage: 1.3,
    notes: 'Dedicated OCR endpoint (mistral-ocr-latest). Returns per-page markdown; very fast.',
  },
  {
    slug: 'gpt4o-vision',
    label: 'GPT-4o Vision',
    vendor: 'OpenAI',
    family: 'vision-llm',
    license: 'commercial-paid',
    free: false,
    localRunnable: false,
    costPerPageUSD: 0.0075,
    secondsPerPage: 9,
    notes: 'Vision endpoint of GPT-4o. ~$0.005-$0.01/page depending on image size at 300 DPI.',
  },
  {
    slug: 'gemini-vision',
    label: 'Gemini 2.5 Pro Vision',
    vendor: 'Google',
    family: 'vision-llm',
    license: 'commercial-paid',
    free: false,
    localRunnable: false,
    costPerPageUSD: 0.012,
    secondsPerPage: 25,
    notes: 'Free tier exists but quota-limited; paid tier ~$0.005-0.025/page. Lowest rate limits of the 3 hosted vision LLMs.',
  },
  {
    slug: 'pixtral-vision',
    label: 'Pixtral 12B',
    vendor: 'Mistral AI',
    family: 'vision-llm',
    license: 'commercial-paid',
    free: false,
    localRunnable: false,
    costPerPageUSD: 0.001,
    secondsPerPage: 25,
    notes: 'Open weights (Apache 2.0) but tested here via Mistral API. ~$0.0005-0.001/page at ~1.1K image tokens.',
  },
  {
    slug: 'none-direct-vision',
    label: 'No OCR — direct vision',
    vendor: 'Grok-4 + Gemini 2.5 Pro + GPT-4o (avg)',
    family: 'vision-llm',
    license: 'commercial-paid',
    free: false,
    localRunnable: false,
    // Average of the three flagship vision rates ($0.012 + $0.0075 + ~$0.01 grok-4) / 3 ≈ $0.0098
    costPerPageUSD: 0.0098,
    secondsPerPage: 15,
    notes: 'Flagship vision LLM sees the raw page image + the question — no OCR step. Only meaningful for flagship rows (open models can\'t see images).',
  },
];

export const LICENSE_LABEL: Record<License, string> = {
  'open-source-local': 'Open-source · runnable locally for free',
  'open-source-paid-api': 'Open-source weights · paid hosted API',
  'commercial-paid': 'Commercial · paid API',
};

export const LICENSE_TINT: Record<License, string> = {
  'open-source-local': 'border-status-success text-status-success',
  'open-source-paid-api': 'border-border text-text-secondary',
  'commercial-paid': 'border-status-warning text-status-warning',
};
