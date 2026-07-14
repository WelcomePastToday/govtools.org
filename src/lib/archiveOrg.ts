export type ArchiveItemFile = {
  name: string;
  format?: string;
  size?: string;
};

export type ArchiveItemMetadata = {
  metadata: Record<string, string | string[] | undefined>;
  files: ArchiveItemFile[];
  server?: string;
  dir?: string;
};

export async function fetchArchiveItem(identifier: string): Promise<ArchiveItemMetadata | null> {
  const res = await fetch(`https://archive.org/metadata/${encodeURIComponent(identifier)}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data || !data.metadata) return null;
  return data as ArchiveItemMetadata;
}
