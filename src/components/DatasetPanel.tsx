import { useState } from 'react';
import type { ProcessBundle } from '../types';
import { DATASETS } from '../data/datasets';

interface DatasetPanelProps {
  onLoad: (bundle: ProcessBundle, mode: 'replace' | 'merge') => void;
  onClose: () => void;
  /** Ids already loaded, so the panel can say which set is open. */
  loadedProcessIds: string[];
}

/**
 * Bundled sets have to stay reachable after something is already loaded,
 * otherwise a single stale process hides the entire library behind it.
 */
export function DatasetPanel({ onLoad, onClose, loadedProcessIds }: DatasetPanelProps) {
  const [mode, setMode] = useState<'replace' | 'merge'>('replace');
  const loaded = new Set(loadedProcessIds);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-white/10 bg-[#0d1117] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-3.5">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Load a process set</h2>
            <p className="text-xs text-slate-500">Bundled sets that ship with the app.</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-500 transition hover:text-slate-200">
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {DATASETS.map((dataset) => {
            const alreadyLoaded = dataset.processes.every((process) => loaded.has(process.id));
            return (
              <button
                key={dataset.id}
                type="button"
                onClick={() => {
                  onLoad({ version: 1, processes: dataset.processes }, mode);
                  onClose();
                }}
                className="block w-full rounded-xl border border-white/8 bg-white/[0.02] p-4 text-left transition hover:border-white/20 hover:bg-white/[0.04]"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-sm font-medium text-slate-100">{dataset.name}</p>
                  <span className="shrink-0 text-[11px] text-slate-500">
                    {alreadyLoaded ? 'currently loaded' : `${dataset.processes.length} processes`}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">{dataset.description}</p>
                <p className="mt-2 text-[11px] text-slate-600">{dataset.source}</p>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/8 px-5 py-3.5">
          <div className="flex gap-1 rounded-lg border border-white/10 p-0.5">
            {(['replace', 'merge'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setMode(option)}
                className={`rounded-md px-2.5 py-1 text-xs capitalize transition ${
                  mode === option ? 'bg-white/10 text-slate-100' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-600">
            {mode === 'replace' ? 'Replaces everything currently loaded.' : 'Adds to what is already loaded.'}
          </p>
        </div>
      </div>
    </div>
  );
}
