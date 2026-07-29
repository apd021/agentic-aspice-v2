import type { ProcessBundle } from '../types';
import { TIERS } from '../types';
import { TIER_DEFINITIONS } from '../lib/tiers';
import { DATASETS } from '../data/datasets';

interface EmptyStateProps {
  onLoadDataset: (bundle: ProcessBundle) => void;
}

export function EmptyState({ onLoadDataset }: EmptyStateProps) {
  return (
    <div className="mx-auto max-w-3xl px-8 py-20">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Agentic SDLC</p>
      <h1 className="mt-2 text-3xl font-semibold text-slate-50">Choose a process set to open</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-400">
        Each process is described twice over: once as a human engineering process, once as an operational specification
        an agent can execute. Every task carries an autonomy tier you choose.
      </p>

      <div className="mt-8 space-y-3">
        {DATASETS.map((dataset) => (
          <button
            key={dataset.id}
            type="button"
            onClick={() => onLoadDataset({ version: 1, processes: dataset.processes })}
            className="block w-full rounded-xl border border-white/8 bg-white/[0.02] p-4 text-left transition hover:border-white/20 hover:bg-white/[0.04]"
          >
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-sm font-medium text-slate-100">{dataset.name}</p>
              <span className="shrink-0 text-[11px] text-slate-500">{dataset.processes.length} processes</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{dataset.description}</p>
            <p className="mt-2 text-[11px] text-slate-600">{dataset.source}</p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600">{dataset.provenance}</p>
          </button>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-white/8 bg-white/[0.02] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Autonomy tiers</p>
        <dl className="mt-3 space-y-2">
          {TIERS.map((tier) => (
            <div key={tier} className="flex gap-3">
              <dt className="w-6 shrink-0 font-mono text-xs font-semibold text-slate-300">{tier}</dt>
              <dd className="text-sm text-slate-500">
                <span className="text-slate-300">{TIER_DEFINITIONS[tier].name}</span> — {TIER_DEFINITIONS[tier].rule}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
