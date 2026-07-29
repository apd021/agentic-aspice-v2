import { useMemo } from 'react';
import type { AutonomyTier, Process, RaciLetter } from '../types';
import { TIER_DEFINITIONS, missingGuardrails } from '../lib/tiers';
import { buildSwimlane } from '../lib/mermaid-source';
import { processToMarkdown, download } from '../lib/export';
import { Mermaid } from './Mermaid';
import { TierChip, TierPicker } from './TierPicker';
import { AutonomyBar } from './AutonomyBar';
import { Card, Label, List, Section, Table } from './ui';

const RACI_STYLES: Record<RaciLetter, string> = {
  R: 'bg-sky-500/15 text-sky-300',
  A: 'bg-rose-500/15 text-rose-300',
  C: 'bg-amber-500/15 text-amber-300',
  I: 'bg-slate-500/15 text-slate-400',
  '-': 'text-slate-700',
};

interface ProcessDetailProps {
  process: Process;
  tiers: Record<string, AutonomyTier>;
  onTierChange: (stepId: string, tier: AutonomyTier) => void;
  onReset: () => void;
}

export function ProcessDetail({ process, tiers, onTierChange, onReset }: ProcessDetailProps) {
  const humanRoles = process.roles.filter((role) => role.kind === 'human');
  const aiRoles = process.roles.filter((role) => role.kind === 'ai');
  const swimlane = useMemo(
    () => process.swimlaneMermaid ?? buildSwimlane(process, tiers),
    [process, tiers],
  );

  // A T3 step whose Accountable owner is also an agent breaks audit traceability.
  const accountabilityGaps = process.steps.filter((step) => {
    const tier = tiers[step.id] ?? step.defaultTier;
    if (tier !== 'T3') return false;
    const accountable = process.roles.filter((role) => step.raci[role.id] === 'A');
    return !accountable.some((role) => role.kind === 'human');
  });

  const guardrailGaps = process.steps.filter((step) =>
    missingGuardrails(tiers[step.id] ?? step.defaultTier, step.guardrails),
  );

  return (
    <div className="space-y-10 pb-24">
      <header className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            {process.isoClause && (
              <p className="font-mono text-xs text-slate-500">Automotive SPICE · {process.isoClause}</p>
            )}
            <h1 className="mt-1 text-2xl font-semibold text-slate-50">{process.name}</h1>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onReset}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
            >
              Reset tiers to default
            </button>
            <button
              type="button"
              onClick={() =>
                download(`${process.id}.md`, processToMarkdown(process, tiers), 'text/markdown;charset=utf-8')
              }
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/5"
            >
              Export Markdown
            </button>
          </div>
        </div>

        <div className="max-w-md">
          <AutonomyBar tiers={process.steps.map((step) => tiers[step.id] ?? step.defaultTier)} showLegend />
        </div>

        {(accountabilityGaps.length > 0 || guardrailGaps.length > 0) && (
          <div className="space-y-2 rounded-xl border border-amber-500/25 bg-amber-500/5 p-3.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">Governance warnings</p>
            {accountabilityGaps.length > 0 && (
              <p className="text-sm text-amber-100/80">
                {accountabilityGaps.length === 1 ? 'Step' : 'Steps'} {accountabilityGaps.map((s) => s.id).join(', ')}{' '}
                {accountabilityGaps.length === 1 ? 'runs' : 'run'} at T3 with no human marked Accountable in the RACI. An
                autonomous step still needs a named human owner for audit.
              </p>
            )}
            {guardrailGaps.length > 0 && (
              <p className="text-sm text-amber-100/80">
                {guardrailGaps.length === 1 ? 'Step' : 'Steps'} {guardrailGaps.map((s) => s.id).join(', ')}{' '}
                {guardrailGaps.length === 1 ? 'is' : 'are'} set to T2 or higher but{' '}
                {guardrailGaps.length === 1 ? 'declares' : 'declare'} no deterministic guardrail. The agent is committing
                work with nothing bounding it.
              </p>
            )}
          </div>
        )}
      </header>

      <Section number={1} title="Dual-track translation" subtitle="The same process expressed for people and for agents.">
        <div className="overflow-x-auto rounded-xl border border-white/8">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/[0.03]">
                <th className="w-40 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Dimension
                </th>
                <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-sky-300/80">
                  Human engineering track
                </th>
                <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-300/80">
                  AI agent operational track
                </th>
              </tr>
            </thead>
            <tbody>
              {process.translation.map((row) => (
                <tr key={row.dimension} className="border-b border-white/5 last:border-0 align-top">
                  <td className="px-3 py-3 font-medium text-slate-300">{row.dimension}</td>
                  <td className="px-3 py-3 text-slate-400">{row.human}</td>
                  <td className="px-3 py-3 text-slate-400">{row.ai}</td>
                </tr>
              ))}
              {process.translation.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-3 py-6 text-center text-sm italic text-slate-600">
                    No translation rows recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>

      <Section number={2} title="Purpose">
        <Card>
          <p className="text-sm leading-relaxed text-slate-300">{process.purpose}</p>
        </Card>
      </Section>

      <Section number={3} title="Scope">
        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <Label>Trigger · start</Label>
            <p className="text-sm text-slate-300">{process.scope.trigger}</p>
          </Card>
          <Card>
            <Label>End state · finish</Label>
            <p className="text-sm text-slate-300">{process.scope.endState}</p>
          </Card>
          <Card>
            <Label>In scope</Label>
            <List items={process.scope.inScope} />
          </Card>
          <Card>
            <Label>Out of scope</Label>
            <List items={process.scope.outOfScope} />
          </Card>
        </div>
      </Section>

      <Section number={4} title="Objectives and success measures">
        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <Label>Objectives</Label>
            <List items={process.objectives} />
          </Card>
          <Card>
            <Label>Success measures and exit gates</Label>
            <List items={process.successMeasures} />
          </Card>
        </div>
      </Section>

      <Section number={5} title="Roles involved">
        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <Label>Human engineering roles</Label>
            <div className="space-y-3">
              {humanRoles.map((role) => (
                <div key={role.id}>
                  <p className="text-sm font-medium text-sky-300">{role.name}</p>
                  <p className="text-sm text-slate-400">{role.description}</p>
                </div>
              ))}
              {humanRoles.length === 0 && <p className="text-sm italic text-slate-600">None defined.</p>}
            </div>
          </Card>
          <Card>
            <Label>AI agent personas</Label>
            <div className="space-y-3">
              {aiRoles.map((role) => (
                <div key={role.id}>
                  <p className="font-mono text-sm font-medium text-emerald-300">{role.name}</p>
                  <p className="text-sm text-slate-400">{role.description}</p>
                  {role.tooling && role.tooling.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {role.tooling.map((tool) => (
                        <span key={tool} className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[11px] text-slate-400">
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {aiRoles.length === 0 && <p className="text-sm italic text-slate-600">None defined.</p>}
            </div>
          </Card>
        </div>
      </Section>

      <Section number={6} title="SIPOC">
        <div className="grid gap-3 md:grid-cols-5">
          {(
            [
              ['Suppliers', process.sipoc.suppliers],
              ['Inputs', process.sipoc.inputs],
              ['Process', process.sipoc.process],
              ['Outputs', process.sipoc.outputs],
              ['Customers', process.sipoc.customers],
            ] as const
          ).map(([title, items]) => (
            <Card key={title}>
              <Label>{title}</Label>
              <List items={items} />
            </Card>
          ))}
        </div>
      </Section>

      <Section
        number={7}
        title="Cross-functional swimlane"
        subtitle="Regenerated from the tiers you select: steps move between the human and agent lanes as autonomy changes."
      >
        <Mermaid source={swimlane} />
      </Section>

      <Section
        number={8}
        title="Process steps and autonomy"
        subtitle="Human track and AI track side by side. Set the tier per task."
      >
        <div className="space-y-3">
          {process.steps.map((step) => {
            const tier = tiers[step.id] ?? step.defaultTier;
            const definition = TIER_DEFINITIONS[tier];
            return (
              <div key={step.id} className="rounded-xl border border-white/8 bg-white/[0.02]">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/5 p-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs text-slate-500">{step.id}</span>
                      <h3 className="text-sm font-semibold text-slate-100">{step.name}</h3>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">{step.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <TierPicker
                      value={tier}
                      maxTier={step.maxTier}
                      maxTierReason={step.maxTierReason}
                      onChange={(next) => onTierChange(step.id, next)}
                    />
                    <span className="text-[11px] text-slate-500">{definition.name}</span>
                  </div>
                </div>

                <div className="grid divide-y divide-white/5 md:grid-cols-2 md:divide-x md:divide-y-0">
                  <div className="p-4">
                    <Label>Human track</Label>
                    <p className="text-sm text-slate-300">{step.humanTrack}</p>
                    {tier === 'T0' && (
                      <p className="mt-2 text-xs text-slate-500">No agent participates at T0. The human performs the step end to end.</p>
                    )}
                  </div>
                  <div className="p-4">
                    <Label>AI agent track</Label>
                    <p className="text-sm text-slate-300">{step.aiTrack}</p>
                    {step.tools && step.tools.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {step.tools.map((tool) => (
                          <span key={tool} className="rounded bg-emerald-500/8 px-1.5 py-0.5 font-mono text-[11px] text-emerald-300/80">
                            {tool}
                          </span>
                        ))}
                      </div>
                    )}
                    {tier === 'T0' && (
                      <p className="mt-2 text-xs text-amber-400/70">Disabled at T0 — the agent track is documented but not executed.</p>
                    )}
                  </div>
                </div>

                {(step.systemOfRecord || step.guardrails || step.errorRecovery) && (
                  <div className="grid gap-4 border-t border-white/5 p-4 md:grid-cols-3">
                    {step.systemOfRecord && (
                      <div>
                        <Label>System of record</Label>
                        <p className="text-sm text-slate-400">{step.systemOfRecord}</p>
                        <p className="mt-1 text-xs text-slate-600">{definition.writeAccess}</p>
                      </div>
                    )}
                    {step.guardrails && step.guardrails.length > 0 && (
                      <div>
                        <Label>Guardrails</Label>
                        <List items={step.guardrails} />
                      </div>
                    )}
                    {step.errorRecovery && (
                      <div>
                        <Label>Error recovery</Label>
                        <p className="text-sm text-slate-400">{step.errorRecovery}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      <Section number={9} title="RACI matrix" subtitle="R responsible · A accountable · C consulted · I informed">
        <div className="overflow-x-auto rounded-xl border border-white/8">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/[0.03]">
                <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Step</th>
                <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Tier</th>
                {process.roles.map((role) => (
                  <th
                    key={role.id}
                    className={`px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider ${
                      role.kind === 'ai' ? 'text-emerald-300/70' : 'text-sky-300/70'
                    }`}
                  >
                    {role.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {process.steps.map((step) => {
                const tier = tiers[step.id] ?? step.defaultTier;
                return (
                  <tr key={step.id} className="border-b border-white/5 last:border-0">
                    <td className="px-3 py-2 font-mono text-xs text-slate-400">{step.id}</td>
                    <td className="px-3 py-2">
                      <TierChip tier={tier} />
                    </td>
                    {process.roles.map((role) => {
                      const letter = step.raci[role.id] ?? '-';
                      return (
                        <td key={role.id} className="px-3 py-2">
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded text-xs font-semibold ${RACI_STYLES[letter]}`}
                          >
                            {letter}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section number={10} title="Metrics and KPIs">
        <Table head={['Metric', 'Category', 'Definition', 'Target']}>
          {process.metrics.map((metric) => (
            <tr key={metric.name} className="border-b border-white/5 last:border-0 align-top">
              <td className="px-3 py-2.5 font-medium text-slate-300">{metric.name}</td>
              <td className="px-3 py-2.5 text-slate-500">{metric.category}</td>
              <td className="px-3 py-2.5 text-slate-400">{metric.definition}</td>
              <td className="px-3 py-2.5 font-mono text-xs text-slate-300">{metric.target}</td>
            </tr>
          ))}
          {process.metrics.length === 0 && (
            <tr>
              <td colSpan={4} className="px-3 py-6 text-center text-sm italic text-slate-600">
                No metrics recorded.
              </td>
            </tr>
          )}
        </Table>
      </Section>

      <Section number={11} title="Risks and controls">
        <Table head={['ID', 'Risk', 'Category', 'Impact', 'Preventative control', 'Fallback']}>
          {process.risks.map((risk) => (
            <tr key={risk.id} className="border-b border-white/5 last:border-0 align-top">
              <td className="px-3 py-2.5 font-mono text-xs text-slate-500">{risk.id}</td>
              <td className="px-3 py-2.5 text-slate-300">{risk.description}</td>
              <td className="px-3 py-2.5 text-slate-500">{risk.category}</td>
              <td className="px-3 py-2.5">
                <span
                  className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${
                    risk.impact === 'Critical' || risk.impact === 'High'
                      ? 'bg-rose-500/15 text-rose-300'
                      : risk.impact === 'Medium'
                        ? 'bg-amber-500/15 text-amber-300'
                        : 'bg-slate-500/15 text-slate-400'
                  }`}
                >
                  {risk.impact}
                </span>
              </td>
              <td className="px-3 py-2.5 text-slate-400">{risk.control}</td>
              <td className="px-3 py-2.5 text-slate-400">{risk.fallback}</td>
            </tr>
          ))}
          {process.risks.length === 0 && (
            <tr>
              <td colSpan={6} className="px-3 py-6 text-center text-sm italic text-slate-600">
                No risks recorded.
              </td>
            </tr>
          )}
        </Table>
      </Section>
    </div>
  );
}
