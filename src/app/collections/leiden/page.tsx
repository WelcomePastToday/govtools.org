import type { Metadata } from "next";
import Link from "next/link";
import { getLeidenDb, getSyncMeta } from "@/lib/leidenDb";
import LeidenBrowser from "./LeidenBrowser";

export const metadata: Metadata = {
  title: "Leiden Dissertations Collection | GovTools",
  description:
    "Browse and search the Leiden International Dissertations Collection — ~350,000 European doctoral dissertations (1600s–1990) donated to the Internet Archive, digitized progressively.",
};

// ~350,000 is Leiden University's own estimate of the full physical collection
// (see Leiden/LEIDEN.md); the archive.org collection is still being scanned toward it.
const DIGITIZATION_TARGET = 350000;

export default function LeidenCollectionPage() {
  const db = getLeidenDb();
  const total = (db.prepare("SELECT COUNT(*) as n FROM items").get() as { n: number }).n;
  const meta = getSyncMeta();
  const syncedAt = meta.last_sync_run_at ?? null;

  return (
    <div className="min-h-screen bg-paper text-ink font-sans">
      <header className="border-b border-border bg-paper sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-baseline gap-4">
            <Link href="/" className="text-xl font-bold tracking-tight text-ink hover:text-accent transition-colors">
              GovTools
            </Link>
            <span className="text-xs text-text-secondary uppercase tracking-widest hidden sm:inline-block">
              Leiden Dissertations Collection
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://archive.org/details/leiden-university"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-text-secondary uppercase tracking-widest hover:text-accent transition-colors"
            >
              View on archive.org
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6">
        <section className="pb-3 mb-4 border-b border-border">
          <h1 className="text-xl font-bold tracking-tight text-ink">
            Leiden International Dissertations Collection
          </h1>
          <p className="text-xs text-text-secondary leading-snug max-w-2xl mt-1">
            European doctoral dissertations (1600s–1990), largely French and German, donated to the
            Internet Archive by Leiden University. Search by title, author, or institution, and filter
            by language or decade.
          </p>
          <p className="text-xs text-text-secondary leading-snug mt-2">
            <strong className="text-ink tabular-nums">{total.toLocaleString()}</strong> of an estimated{" "}
            <strong className="text-ink tabular-nums">{DIGITIZATION_TARGET.toLocaleString()}</strong>{" "}
            dissertations digitized so far.
            {syncedAt && <> Mirror last synced {syncedAt.slice(0, 10)}.</>}
          </p>
        </section>

        <LeidenBrowser />
      </main>

      <footer className="border-t border-border mt-4 py-3">
        <div className="max-w-5xl mx-auto px-6 text-[10px] text-text-secondary uppercase tracking-widest">
          GovTools · Leiden Dissertations Collection · metadata mirrored from archive.org
        </div>
      </footer>
    </div>
  );
}
