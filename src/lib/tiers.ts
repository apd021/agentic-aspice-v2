import type { AutonomyTier, TierDefinition } from '../types';
import { TIERS } from '../types';

export const TIER_DEFINITIONS: Record<AutonomyTier, TierDefinition> = {
  T0: {
    tier: 'T0',
    name: 'No agent',
    rule: 'Entirely human-driven. Included to preserve end-to-end process visibility.',
    writeAccess: 'None. No automated script or LLM tool call participates.',
    banned: 'Any agent involvement, including drafting or retrieval.',
  },
  T1: {
    tier: 'T1',
    name: 'Assist',
    rule: 'Agent prepares recommendations, fetches data, or runs analysis. A human makes all decisions and executes every change.',
    writeAccess: 'Read-only. Zero write access to systems of record.',
    banned: 'Merging PRs, changing ticket status, committing code, deploying builds.',
  },
  T2: {
    tier: 'T2',
    name: 'Execute with approval',
    rule: 'Agent carries out the task; a designated human reviewer must sign off before any artefact is finalized or forwarded.',
    writeAccess: 'Staging artefacts only: draft PRs, draft tickets, proposed diffs.',
    banned: 'Direct push to protected branches, unreviewed deployment, deleting environments.',
  },
  T3: {
    tier: 'T3',
    name: 'Autonomous',
    rule: 'Agent executes and commits independently, with no per-action human review, constrained only by programmatic safeguards.',
    writeAccess: 'Full write within the declared guardrails and blast radius.',
    banned:
      'Production schema drops, security policy overrides, contractual or financial commitments, destructive git history rewrites.',
  },
};

export const TIER_STYLES: Record<AutonomyTier, { chip: string; dot: string; bar: string; label: string }> = {
  T0: {
    chip: 'bg-slate-500/12 text-slate-300 ring-slate-400/25',
    dot: 'bg-slate-400',
    bar: 'bg-slate-500',
    label: 'T0 · Manual',
  },
  T1: {
    chip: 'bg-sky-500/12 text-sky-300 ring-sky-400/25',
    dot: 'bg-sky-400',
    bar: 'bg-sky-500',
    label: 'T1 · Assist',
  },
  T2: {
    chip: 'bg-amber-500/12 text-amber-300 ring-amber-400/25',
    dot: 'bg-amber-400',
    bar: 'bg-amber-500',
    label: 'T2 · Approve',
  },
  T3: {
    chip: 'bg-emerald-500/12 text-emerald-300 ring-emerald-400/25',
    dot: 'bg-emerald-400',
    bar: 'bg-emerald-500',
    label: 'T3 · Autonomous',
  },
};

export function tierRank(tier: AutonomyTier): number {
  return TIERS.indexOf(tier);
}

export function isTierAllowed(tier: AutonomyTier, maxTier: AutonomyTier): boolean {
  return tierRank(tier) <= tierRank(maxTier);
}

/**
 * A T2 or T3 step with no deterministic guardrail is a governance hole:
 * the agent is committing work with nothing bounding it.
 */
export function missingGuardrails(tier: AutonomyTier, guardrails?: string[]): boolean {
  return tierRank(tier) >= tierRank('T2') && (!guardrails || guardrails.length === 0);
}
