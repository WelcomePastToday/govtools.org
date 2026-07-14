import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchArchiveItem } from "@/lib/archiveOrg";

type Props = { params: Promise<{ identifier: string }> };

const MISSING_CHECK: { key: string; label: string }[] = [
  { key: "institution", label: "university" },
  { key: "department", label: "department" },
  { key: "major_professor", label: "major professor" },
  { key: "publisher", label: "publisher" },
  { key: "date", label: "date" },
  { key: "creator", label: "author" },
];

function asText(value: string | string[] | undefined): string | null {
  if (value == null) return null;
  return Array.isArray(value) ? value.join("; ") : value;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { identifier } = await params;
  const item = await fetchArchiveItem(identifier);
  const title = asText(item?.metadata.title) ?? identifier;
  return {
    title: `${title} | Leiden Dissertations Collection`,
    description: `Metadata and full text for "${title}" from the Leiden International Dissertations Collection on archive.org.`,
  };
}

export default async function LeidenItemPage({ params }: Props) {
  const { identifier } = await params;
  const item = await fetchArchiveItem(identifier);

  if (!item) notFound();

  const m = item.metadata;
  const title = asText(m.title) ?? "(untitled)";
  const creator = asText(m.creator);
  const date = asText(m.date);
  const institution = asText(m.institution);
  const department = asText(m.department);
  const majorProfessor = asText(m.major_professor);
  const publisher = asText(m.publisher);
  const language = asText(m.language);

  const missing = MISSING_CHECK.filter((f) => !asText(m[f.key]));

  const pdf = item.files.find((f) => f.format?.toLowerCase().includes("pdf"));
  const detailsUrl = `https://archive.org/details/${encodeURIComponent(identifier)}`;
  const pdfUrl =
    pdf && item.server && item.dir
      ? `https://${item.server}${item.dir}/${encodeURIComponent(pdf.name)}`
      : null;

  return (
    <div className="min-h-screen bg-paper text-ink font-sans">
      <header className="border-b border-border bg-paper sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/" className="text-xl font-bold tracking-tight text-ink hover:text-accent transition-colors">
            GovTools
          </Link>
          <Link
            href="/collections/leiden"
            className="text-xs font-medium text-text-secondary uppercase tracking-widest hover:text-accent transition-colors"
          >
            ← Leiden Dissertations Collection
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6">
        <section className="pb-3 mb-4 border-b border-border">
          <h1 className="text-xl font-bold tracking-tight text-ink">{title}</h1>
          {creator && <p className="text-sm text-text-secondary mt-1">{creator}</p>}
        </section>

        {missing.length > 0 && (
          <section className="mb-5 border border-status-warning/30 bg-status-warning/5 rounded-sm px-3 py-2">
            <p className="text-[10px] uppercase tracking-widest text-status-warning font-medium mb-1">
              Missing fields
            </p>
            <p className="text-xs text-text-secondary">
              {missing.map((f) => f.label).join(", ")} — not present in this item&apos;s archive.org
              metadata. (Curation of gaps like this is planned for a later phase of this explorer.)
            </p>
          </section>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mb-6 text-xs">
          <Field label="University" value={institution} />
          <Field label="Department" value={department} />
          <Field label="Date" value={date ? date.slice(0, 10) : null} />
          <Field label="Language" value={language} />
          <Field label="Major professor" value={majorProfessor} />
          <Field label="Publisher" value={publisher} />
          <Field label="Identifier" value={identifier} mono />
        </section>

        <section className="flex flex-wrap gap-3 mb-6">
          <a
            href={detailsUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs px-3 py-1.5 border border-border rounded-sm text-ink hover:border-accent hover:text-accent transition-colors"
          >
            View on archive.org →
          </a>
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs px-3 py-1.5 border border-border rounded-sm text-ink hover:border-accent hover:text-accent transition-colors"
            >
              Open PDF →
            </a>
          )}
        </section>
      </main>

      <footer className="border-t border-border mt-4 py-3">
        <div className="max-w-5xl mx-auto px-6 text-[10px] text-text-secondary uppercase tracking-widest">
          GovTools · Leiden Dissertations Collection · metadata mirrored from archive.org
        </div>
      </footer>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string | null; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-text-secondary">{label}</p>
      <p className={`text-ink ${mono ? "font-mono text-[11px]" : ""}`}>{value || "—"}</p>
    </div>
  );
}
