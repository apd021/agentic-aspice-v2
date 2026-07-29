/**
 * Runs Mermaid's real parser over every diagram the app can generate.
 *
 * The label-quoting rule in mermaid-source.ts is only a claim until something
 * parses the output. This turns "the labels look quoted" into "Mermaid accepts
 * every swimlane and waterfall we can produce", including the T2 approval-gate
 * variant that only appears at certain tier selections.
 */
import { JSDOM } from 'jsdom';
import { DATASETS } from '../src/data/datasets';
import { buildSwimlane, buildWaterfall } from '../src/lib/mermaid-source';
import { TIERS } from '../src/types';
import type { AutonomyTier, Process } from '../src/types';
import { isTierAllowed } from '../src/lib/tiers';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true });
const globals = globalThis as unknown as Record<string, unknown>;
globals.window = dom.window;
globals.document = dom.window.document;
// Node 24 exposes `navigator` as a getter-only global, so it needs redefining
// rather than assigning.
Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator,
  configurable: true,
  writable: true,
});

const { default: mermaid } = await import('mermaid');
mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' });

interface Case {
  label: string;
  source: string;
}

const cases: Case[] = [];

for (const dataset of DATASETS) {
  cases.push({ label: `${dataset.id} waterfall`, source: buildWaterfall(dataset.processes) });

  for (const process of dataset.processes) {
    // Default selection, plus every tier forced as far as its ceiling allows.
    // The forced cases exercise both lanes and the T2 approval-gate branch.
    const selections: Array<[string, Record<string, AutonomyTier>]> = [
      ['defaults', Object.fromEntries(process.steps.map((step) => [step.id, step.defaultTier]))],
    ];

    for (const tier of TIERS) {
      selections.push([
        `all ${tier} within ceiling`,
        Object.fromEntries(
          process.steps.map((step) => [step.id, isTierAllowed(tier, step.maxTier) ? tier : step.maxTier]),
        ),
      ]);
    }

    for (const [name, tiers] of selections) {
      cases.push({ label: `${process.id} swimlane (${name})`, source: buildSwimlane(process as Process, tiers) });
    }
  }
}

const failures: Array<{ label: string; error: string; source: string }> = [];

for (const testCase of cases) {
  try {
    await mermaid.parse(testCase.source);
  } catch (cause) {
    failures.push({
      label: testCase.label,
      error: cause instanceof Error ? cause.message : String(cause),
      source: testCase.source,
    });
  }
}

if (failures.length > 0) {
  console.error(`Diagram check failed: ${failures.length} of ${cases.length} diagram(s) did not parse.\n`);
  for (const failure of failures) {
    console.error(`  ${failure.label}\n    ${failure.error.split('\n').join('\n    ')}\n`);
    console.error(`${failure.source}\n`);
  }
  process.exit(1);
}

console.log(`Diagram check passed: ${cases.length} generated diagram(s) parsed by Mermaid.`);
