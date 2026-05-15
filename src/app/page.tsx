// Registry is volume-mounted and can change without a rebuild — always read fresh.
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import fs from 'fs/promises';
import path from 'path';
import YAML from 'yaml';

interface AppStatus {
  id: string;
  name: string;
  description: string;
  url: string;
  status: 'active' | 'maintenance' | 'error';
  hidden?: boolean;
  project_info?: {
    note: string;
    link_text: string;
    link_url: string;
  };
}

async function getRegistryApps(): Promise<AppStatus[]> {
  try {
    const registryPath = path.join(process.cwd(), 'govtools.registry.yaml');
    const fileContent = await fs.readFile(registryPath, 'utf-8');
    const parsed = YAML.parse(fileContent);

    return (parsed.apps || [])
      .filter((app: any) => !app.hidden)
      .map((app: any) => ({
        ...app,
        status: app.status || 'active',
      }));
  } catch (e) {
    console.error("Failed to load registry:", e);
    return [];
  }
}

async function getSystemHealth() {
  const keys = [
    { name: 'OpenAI API', usedBy: '', key: process.env.OPENAI_API_KEY, status: !!process.env.OPENAI_API_KEY },
    { name: 'Gemini API', usedBy: '', key: process.env.GEMINI_API_KEY, status: !!process.env.GEMINI_API_KEY },
    { name: 'Mistral API', usedBy: '', key: process.env.MISTRAL_API_KEY, status: !!process.env.MISTRAL_API_KEY },
    { name: 'Internet Archive S3', usedBy: 'Test Gov Document Change Monitor', key: process.env.IA_ACCESS_KEY, status: !!process.env.IA_ACCESS_KEY },
    { name: 'Resend Email', usedBy: 'Test FDLP Cataloger', key: process.env.RESEND_API_KEY, status: !!process.env.RESEND_API_KEY },
  ];
  return keys;
}

export default async function Home() {
  const [apps, health] = await Promise.all([
    getRegistryApps(),
    getSystemHealth()
  ]);

  return (
    <div className="min-h-screen bg-paper text-ink font-sans selection:bg-accent/10">

      {/* Header - Swiss Style: Minimal, Bordered, Functional */}
      <header className="border-b border-border bg-paper sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-baseline gap-4">
            <Link href="/" className="text-xl font-bold tracking-tight text-ink hover:text-accent transition-colors">
              GovTools
            </Link>
            <span className="text-xs text-text-muted uppercase tracking-widest hidden sm:inline-block">
              Civic Infrastructure Testbed
            </span>
          </div>
          <div className="text-xs font-medium text-text-muted">
            v1.0
          </div>
        </div>
      </header>

      {/* Main Content - Grid Layout */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12 items-start">

          {/* Primary Column: Tools */}
          <div>
            <div className="mb-4 flex items-baseline justify-between border-b border-border pb-2">
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">
                Tools in Testing
              </h2>
              <span className="text-xs text-text-muted">
                {apps.length} Active
              </span>
            </div>

            <div className="grid gap-6">
              {apps.map((app) => (
                <article key={app.id} className="group relative border border-border bg-white rounded-sm p-6 hover:border-accent transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <Link href={app.url} className="block">
                      <h3 className="text-lg font-bold text-ink group-hover:text-accent transition-colors  flex items-center gap-2">
                        {app.name}
                        {/* External link arrow if needed, but keeping plain for now */}
                      </h3>
                    </Link>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${app.status === 'active'
                      ? 'bg-status-success/10 text-status-success'
                      : 'bg-status-warning/10 text-status-warning'
                      }`}>
                      {app.status}
                    </span>
                  </div>

                  <p className="text-text-muted text-sm leading-relaxed mb-6 max-w-2xl">
                    {app.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                    {/* Project Link - Only show if different from main URL */}
                    {app.project_info && app.project_info.link_url !== app.url ? (
                      <Link
                        href={app.project_info.link_url}
                        className="text-xs font-medium text-text-muted hover:text-accent flex items-center gap-1"
                        target="_blank"
                      >
                        {app.project_info.link_text} ↗
                      </Link>
                    ) : (
                      <span className="text-xs text-text-muted italic opacity-50">Internal Tool</span>
                    )}

                    {/* Primary Action */}
                    <Link
                      href={app.url}
                      className="text-xs font-bold uppercase tracking-widest text-accent hover:text-link-hover transition-colors"
                    >
                      Open Tool →
                    </Link>
                  </div>
                </article>
              ))}

              {apps.length === 0 && (
                <div className="p-12 border border-dashed border-border rounded-sm text-center text-text-muted text-sm">
                  No tools currently active in the registry.
                </div>
              )}
            </div>
          </div>

          {/* Secondary Column: System Status */}
          <aside className="lg:sticky lg:top-24">
            <div className="mb-4 border-b border-border pb-2">
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">
                System Health
              </h2>
            </div>

            <div className="bg-panel border border-border rounded-sm p-5 space-y-4">
              {health.map((item) => (
                <div key={item.name} className="flex justify-between items-start text-xs gap-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-text-primary">{item.name}</span>
                    {item.usedBy && (
                      <span className="text-[10px] text-text-muted italic mt-0.5">{item.usedBy}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                    <span className="text-[10px] uppercase tracking-wider text-text-muted">
                      {item.status ? 'Live' : 'Offline'}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${item.status ? 'bg-status-success' : 'bg-status-error'
                        }`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Meta Info */}
            <div className="mt-8 text-[11px] text-text-muted leading-relaxed">

              <p>
                Metrics are updated continuously based on local service reporting.
              </p>
            </div>
          </aside>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-panel mt-auto">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h4 className="text-sm font-bold text-ink uppercase tracking-widest mb-2">GovTools</h4>
              <p className="text-xs text-text-muted max-w-md leading-relaxed">
                A neutral testing website for government document archiving and analysis experiments.
                Not affiliated with any government agency.
              </p>
            </div>
            <div className="text-xs text-text-muted">
              {new Date().getFullYear()} GovTools Test Projects
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
