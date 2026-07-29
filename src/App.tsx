import { useMemo, useState } from 'react';
import { useProcesses, useTierOverrides, resolveTiers } from './lib/store';
import { AutonomyBar } from './components/AutonomyBar';
import { Overview } from './components/Overview';
import { ProcessDetail } from './components/ProcessDetail';
import { ImportPanel } from './components/ImportPanel';
import { DatasetPanel } from './components/DatasetPanel';
import { EmptyState } from './components/EmptyState';
import { download } from './lib/export';

export default function App() {
  const { processes, importBundle, clear } = useProcesses();
  const { overrides, setTier, resetProcess } = useTierOverrides();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [datasetOpen, setDatasetOpen] = useState(false);

  const ordered = useMemo(() => [...processes].sort((a, b) => a.order - b.order), [processes]);
  const selected = ordered.find((process) => process.id === selectedId) ?? null;

  if (processes.length === 0) {
    return (
      <>
        <EmptyState
          onImportClick={() => setImportOpen(true)}
          onLoadDataset={(bundle) => importBundle(bundle, 'replace')}
        />
        {importOpen && <ImportPanel onImport={importBundle} onClose={() => setImportOpen(false)} />}
      </>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-72 shrink-0 flex-col border-r border-white/8 bg-black/20">
        <div className="border-b border-white/8 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Agentic SDLC</p>
          <p className="mt-0.5 text-sm text-slate-300">Automotive SPICE atlas</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
              selected === null ? 'bg-white/8 text-slate-100' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            Lifecycle waterfall
          </button>

          <p className="px-3 pt-4 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            Processes
          </p>
          {ordered.map((process) => {
            const tiers = resolveTiers(process, overrides);
            const active = process.id === selectedId;
            return (
              <button
                key={process.id}
                type="button"
                onClick={() => setSelectedId(process.id)}
                className={`mb-0.5 w-full rounded-lg px-3 py-2 text-left transition ${
                  active ? 'bg-white/8' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-baseline gap-2">
                  {process.isoClause && (
                    <span className="font-mono text-[11px] text-slate-600">{process.isoClause}</span>
                  )}
                  <span className={`text-sm ${active ? 'text-slate-100' : 'text-slate-400'}`}>{process.name}</span>
                </div>
                <div className="mt-1.5">
                  <AutonomyBar tiers={Object.values(tiers)} />
                </div>
              </button>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-white/8 p-2">
          <button
            type="button"
            onClick={() => setDatasetOpen(true)}
            className="w-full rounded-lg px-3 py-2 text-left text-xs text-slate-300 transition hover:bg-white/5 hover:text-slate-100"
          >
            Load process set…
          </button>
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="w-full rounded-lg px-3 py-2 text-left text-xs text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
          >
            Import JSON
          </button>
          <button
            type="button"
            onClick={() =>
              download('agentic-sdlc-processes.json', JSON.stringify({ version: 1, processes }, null, 2), 'application/json')
            }
            className="w-full rounded-lg px-3 py-2 text-left text-xs text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
          >
            Export all JSON
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm('Remove all loaded processes? Tier selections are kept.')) {
                clear();
                setSelectedId(null);
              }
            }}
            className="w-full rounded-lg px-3 py-2 text-left text-xs text-slate-600 transition hover:bg-white/5 hover:text-rose-300"
          >
            Clear all
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-8 py-10">
          {selected ? (
            <ProcessDetail
              process={selected}
              tiers={resolveTiers(selected, overrides)}
              onTierChange={(stepId, tier) => setTier(selected.id, stepId, tier)}
              onReset={() => resetProcess(selected.id)}
            />
          ) : (
            <Overview processes={ordered} overrides={overrides} onOpen={setSelectedId} />
          )}
        </div>
      </main>

      {importOpen && <ImportPanel onImport={importBundle} onClose={() => setImportOpen(false)} />}
      {datasetOpen && (
        <DatasetPanel
          onLoad={(bundle, mode) => {
            importBundle(bundle, mode);
            setSelectedId(null);
          }}
          onClose={() => setDatasetOpen(false)}
          loadedProcessIds={processes.map((process) => process.id)}
        />
      )}
    </div>
  );
}
