import type { AutonomyTier, Process } from '../types';
import { tierRank } from './tiers';

/**
 * Mermaid's parser breaks on parentheses, brackets, colons and quotes inside
 * labels. Every label this module emits is wrapped in double quotes with inner
 * quotes downgraded, which is the only reliably safe form.
 */
function label(text: string, maxLength = 58): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  const clipped = flat.length > maxLength ? `${flat.slice(0, maxLength - 1)}…` : flat;
  return `"${clipped.replace(/"/g, "'")}"`;
}

/** Mermaid node ids must be alphanumeric-ish; step ids like "1.1" are not. */
function nodeId(prefix: string, raw: string): string {
  return `${prefix}_${raw.replace(/[^a-zA-Z0-9]/g, '_')}`;
}

type Lane = 'human' | 'ai';

/** Who owns the step at a given tier decides which swimlane it sits in. */
function laneForTier(tier: AutonomyTier): Lane {
  return tierRank(tier) <= tierRank('T1') ? 'human' : 'ai';
}

/**
 * Builds a cross-functional swimlane from the steps and their currently
 * selected tiers, so the diagram re-draws as autonomy decisions change.
 */
export function buildSwimlane(process: Process, tiers: Record<string, AutonomyTier>): string {
  const lines: string[] = ['flowchart LR'];
  const humanNodes: string[] = [];
  const aiNodes: string[] = [];
  const sorNodes = new Map<string, string>();
  const edges: string[] = [];

  const sequence: string[] = [];

  for (const step of process.steps) {
    const tier = tiers[step.id] ?? step.defaultTier;
    const lane = laneForTier(tier);
    const primary = nodeId(lane === 'human' ? 'H' : 'A', step.id);
    const text = label(`${step.id} ${step.name}`);

    if (lane === 'human') {
      humanNodes.push(`    ${primary}[${text}]`);
    } else {
      aiNodes.push(`    ${primary}[${text}]`);
    }
    sequence.push(primary);

    // T2 means the agent acts but a human gates the result: show both nodes.
    if (tier === 'T2') {
      const gate = nodeId('G', step.id);
      humanNodes.push(`    ${gate}{${label(`Approve ${step.id}`)}}`);
      edges.push(`  ${primary} --> ${gate}`);
      sequence[sequence.length - 1] = gate;
    }

    if (step.systemOfRecord) {
      const sorKey = step.systemOfRecord.replace(/[^a-zA-Z0-9]/g, '_');
      const sor = nodeId('S', sorKey);
      if (!sorNodes.has(sor)) {
        sorNodes.set(sor, `    ${sor}[(${label(step.systemOfRecord, 40)})]`);
      }
      edges.push(`  ${sequence[sequence.length - 1]} -.-> ${sor}`);
    }
  }

  if (humanNodes.length > 0) {
    lines.push('  subgraph HUMAN["Human Engineering Roles"]');
    lines.push('    direction TB');
    lines.push(...humanNodes);
    lines.push('  end');
  }
  if (aiNodes.length > 0) {
    lines.push('  subgraph AGENTS["AI Autonomous Agents"]');
    lines.push('    direction TB');
    lines.push(...aiNodes);
    lines.push('  end');
  }
  if (sorNodes.size > 0) {
    lines.push('  subgraph RECORDS["Systems of Record"]');
    lines.push('    direction TB');
    lines.push(...sorNodes.values());
    lines.push('  end');
  }

  for (let i = 0; i < sequence.length - 1; i += 1) {
    lines.push(`  ${sequence[i]} --> ${sequence[i + 1]}`);
  }
  lines.push(...edges);

  return lines.join('\n');
}

/** Top-level waterfall across every loaded process. */
export function buildWaterfall(processes: Process[]): string {
  if (processes.length === 0) return 'flowchart LR\n  EMPTY["No processes loaded"]';

  const ordered = [...processes].sort((a, b) => a.order - b.order);
  const lines: string[] = ['flowchart LR'];

  for (const process of ordered) {
    lines.push(`  ${nodeId('P', process.id)}[${label(`${process.isoClause} ${process.name}`)}]`);
  }
  for (let i = 0; i < ordered.length - 1; i += 1) {
    lines.push(`  ${nodeId('P', ordered[i].id)} --> ${nodeId('P', ordered[i + 1].id)}`);
  }
  return lines.join('\n');
}
