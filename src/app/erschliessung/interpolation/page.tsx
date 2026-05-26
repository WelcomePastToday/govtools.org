import type { Metadata } from "next";
import ErschliessungPage from "../page";

export const metadata: Metadata = {
  title: "Interpolation — Erschließung | GovTools",
  description:
    "Compact CSV evidence cards let open models answer archival table questions that raw PDFs and giant Docling JSON cannot. Per-question evidence for Apertus 8B and ClimateGPT 13B.",
};

// The /interpolation URL now renders the same content as /erschliessung.
// The previous standalone deep-dive view has been folded into the main
// page so there is one canonical place to read the per-cell evidence.
export default function InterpolationPage() {
  return <ErschliessungPage />;
}
