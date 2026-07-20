import { NextResponse } from "next/server";
import { getResolvedIndex, resolveAssertionSource } from "@/lib/leidenIndexDb";

// Public, stable read API over ANT's resolved (assertion-backed) metadata —
// this is what serves Jos Damen's original ask (Wikipedia/Wikidata tooling
// pulling title/author/university/year/link programmatically, rather than
// scraping the browse UI). Keep this shape stable: v2 only ADDS fields
// (e.g. institution_qid once Wikidata reconciliation lands in Wave 3), it
// never removes or renames what v1 already returns.
export async function GET(_req: Request, { params }: { params: Promise<{ identifier: string }> }) {
  const { identifier } = await params;
  const resolved = getResolvedIndex(identifier);

  if (!resolved) {
    return NextResponse.json(
      { ant_id: identifier, resolution_status: "not_found" },
      { status: 404 }
    );
  }

  const { displayMetadata, summary } = resolved;
  const fields: Record<string, { value: unknown; source: string }> = {};
  for (const [field, entry] of Object.entries(displayMetadata)) {
    fields[field] = {
      value: entry.value,
      source: resolveAssertionSource(entry.selected_assertion),
    };
  }

  return NextResponse.json({
    ant_id: identifier,
    resolution_status: "matched",
    access_state: "public",
    visibility_state: "public",
    archive_org_url: `https://archive.org/details/${encodeURIComponent(identifier)}`,
    fields,
    missing_fields: Object.keys(summary.rejected_fields ?? {}),
    extraction_status: summary.extraction_status ?? null,
    first_seen: summary.first_seen ?? null,
    last_seen: summary.last_seen ?? null,
  });
}
