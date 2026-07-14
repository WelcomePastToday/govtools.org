import { NextResponse } from "next/server";
import { fetchArchiveItem } from "@/lib/archiveOrg";

// Live fetch, not the local mirror — the mirror only carries the fields used for
// search/facets. Detail views want the freshest data plus the file list (for the
// "read online" / PDF link), and this is a low-volume per-item call. This route
// also doubles as the seed of the eventual public read API (Wave 2).
export async function GET(_req: Request, { params }: { params: Promise<{ identifier: string }> }) {
  const { identifier } = await params;

  let data;
  try {
    data = await fetchArchiveItem(identifier);
  } catch {
    return NextResponse.json({ error: "archive.org is unreachable" }, { status: 502 });
  }

  if (!data) {
    return NextResponse.json({ error: "item not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
