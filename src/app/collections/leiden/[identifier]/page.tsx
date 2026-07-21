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

// WCAG 3.1.2 (Language of Parts) -- this collection is majority German/French,
// and the `language` metadata field already tells us which, so map it to a
// real lang attribute instead of leaving foreign-language titles unmarked.
const LANG_CODES: Record<string, string> = {
  german: "de",
  french: "fr",
  latin: "la",
  english: "en",
  dutch: "nl",
  swedish: "sv",
  italian: "it",
  spanish: "es",
  danish: "da",
};

function langCode(language: string | null): string | undefined {
  if (!language) return undefined;
  return LANG_CODES[language.trim().toLowerCase()];
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

  const titleLang = langCode(language);

  return (
    <div className="min-h-screen bg-paper text-ink font-sans">
      <header className="border-b border-border bg-paper sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/" className="text-xl font-bold tracking-tight text-ink hover:text-accent focus:outline-2 focus:outline-accent focus:outline-offset-1 rounded-sm transition-colors">
            GovTools
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6">
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="flex items-center gap-1.5 text-xs text-text-secondary uppercase tracking-widest">
            <li>
              <Link href="/collections/leiden" className="hover:text-accent focus:outline-2 focus:outline-accent focus:outline-offset-1 rounded-sm transition-colors">
                Leiden Dissertations Collection
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink truncate max-w-[280px]">
              {title}
            </li>
          </ol>
        </nav>

        <section className="pb-3 mb-4 border-b border-border">
          <h1 className="text-xl font-bold tracking-tight text-ink" lang={titleLang}>
            {title}
          </h1>
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
          <Field label="University" value={institution} lang={titleLang} />
          <Field label="Department" value={department} lang={titleLang} />
          <Field label="Date" value={date ? date.slice(0, 10) : null} />
          <Field label="Language" value={language} />
          <Field label="Major professor" value={majorProfessor} lang={titleLang} />
          <Field label="Publisher" value={publisher} lang={titleLang} />
          <Field label="Identifier" value={identifier} mono />
        </section>

        <section className="flex flex-wrap gap-3 mb-6">
          <a
            href={detailsUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs px-3 py-1.5 border border-border rounded-sm text-ink hover:border-accent hover:text-accent focus:outline-2 focus:outline-accent focus:outline-offset-1 transition-colors"
          >
            View on archive.org<span aria-hidden="true"> →</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs px-3 py-1.5 border border-border rounded-sm text-ink hover:border-accent hover:text-accent focus:outline-2 focus:outline-accent focus:outline-offset-1 transition-colors"
            >
              Open PDF<span aria-hidden="true"> →</span>
              <span className="sr-only"> (opens in a new tab)</span>
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

function Field({
  label,
  value,
  mono,
  lang,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
  lang?: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-text-secondary">{label}</p>
      <p className={`text-ink ${mono ? "font-mono text-[11px]" : ""}`} lang={value ? lang : undefined}>
        {value || <span aria-label="Not available">—</span>}
      </p>
    </div>
  );
}
