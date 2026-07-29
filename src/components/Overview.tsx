import { useMemo } from 'react';
import type { Process } from '../types';
import type { TierOverrides } from '../lib/store';
import { resolveTiers } from '../lib/store';
import { buildWaterfall } from '../lib/mermaid-source';
import { TIER_DEFINITIONS } from '../lib/tiers';
import { TIERS } from '../types';
import { Mermaid } from './Mermaid';
import { AutonomyBar } from './AutonomyBar';
import { Card, Section } from './ui';

interface OverviewProps {
  processes: Process[];
  overrides: TierOverrides;
  onOpen: (processId: string) => void;
}

export function Overview({ processes, overrides, onOpen }: OverviewProps) {
  const ordered = useMemo(() => [...processes].sort((a, b) => a.order - b.order), [processes]);
  const waterfall = useMemo(() => buildWaterfall(processes), [processes]);

  const allTiers = ordered.flatMap((process) => Object.values(resolveTiers(process, overrides)));

  return (
    <div className="space-y-10 pb-24">
      <header>
        <h1 className="text-2xl font-semibold text-slate-50">Lifecycle waterfall</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-slate-400">
          Every loaded Automotive SPICE process in sequence. Each carries a human engineering description and its
          machine-executable translation, with an autonomy tier chosen per task.
        </p>
      </header>

      <Section number={1} title="Process flow">
        <Mermaid source={waterfall} />
      </Section>

      <Section number={2} title="Autonomy posture" subtitle={`${allTiers.length} tasks across ${ordered.length} processes.`}>
        <Card>
          <AutonomyBar tiers={allTiers} showLegend />
        </Card>
      </Section>

      <Section number={3} title="Processes">
        <div className="grid gap-3 md:grid-cols-2">
          {ordered.map((process) => {
            const tiers = resolveTiers(process, overrides);
            return (
              <button
                key={process.id}
                type="button"
                onClick={() => onOpen(process.id)}
                className="rounded-xl border border-white/8 bg-white/[0.02] p-4 text-left transition hover:border-white/20 hover:bg-white/[0.04]"
              >
                <div className="flex items-baseline gap-2">
                  {process.isoClause && <span className="font-mono text-xs text-slate-500">{process.isoClause}</span>}
                  <h3 className="text-sm font-semibold text-slate-100">{process.name}</h3>
                </div>
                <p className="mt-1.5 line-clamp-2 text-sm text-slate-400">{process.purpose}</p>
                <div className="mt-3">
                  <AutonomyBar tiers={Object.values(tiers)} />
                </div>
                <p className="mt-2 text-[11px] text-slate-500">{process.steps.length} tasks</p>
              </button>
            );
          })}
        </div>
      </Section>

      <Section number={4} title="Autonomy tiers" subtitle="The selection available on every task.">
        <div className="overflow-x-auto rounded-xl border border-white/8">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/[0.03]">
                {['Tier', 'Name', 'Operational rule', 'Write access', 'Banned at this tier'].map((heading) => (
                  <th key={heading} className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIERS.map((tier) => {
                const definition = TIER_DEFINITIONS[tier];
                return (
                  <tr key={tier} className="border-b border-white/5 last:border-0 align-top">
                    <td className="px-3 py-3 font-mono text-sm font-semibold text-slate-200">{tier}</td>
                    <td className="px-3 py-3 font-medium text-slate-300">{definition.name}</td>
                    <td className="px-3 py-3 text-slate-400">{definition.rule}</td>
                    <td className="px-3 py-3 text-slate-400">{definition.writeAccess}</td>
                    <td className="px-3 py-3 text-slate-500">{definition.banned}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
