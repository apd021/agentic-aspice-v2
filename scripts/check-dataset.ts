/**
 * Integrity check for bundled process datasets.
 *
 * The type system guarantees shape but not meaning: a RACI key can be a typo, a
 * T3 step can end up with no human owner, a ceiling can sit below its own
 * default. Those are the failures that would quietly produce a wrong governance
 * document, so they are checked here and wired into `npm run check`.
 */
import { DATASETS } from '../src/data/datasets';
import { TIERS } from '../src/types';
import { buildSwimlane, buildWaterfall } from '../src/lib/mermaid-source';
import { tierRank } from '../src/lib/tiers';

const problems: string[] = [];
let stepCount = 0;

for (const dataset of DATASETS) {
  const seenProcessIds = new Set<string>();

  for (const process of dataset.processes) {
    const where = `${dataset.id} / ${process.id}`;

    if (seenProcessIds.has(process.id)) problems.push(`${where}: duplicate process id.`);
    seenProcessIds.add(process.id);

    const roleIds = new Set(process.roles.map((role) => role.id));
    const humanRoleIds = new Set(process.roles.filter((role) => role.kind === 'human').map((role) => role.id));

    if (humanRoleIds.size === 0) problems.push(`${where}: no human roles defined.`);
    if (roleIds.size !== process.roles.length) problems.push(`${where}: duplicate role id.`);

    const seenStepIds = new Set<string>();
    const referencedRoleIds = new Set<string>();

    for (const step of process.steps) {
      stepCount += 1;
      const stepWhere = `${where} / ${step.id}`;

      if (seenStepIds.has(step.id)) problems.push(`${stepWhere}: duplicate step id.`);
      seenStepIds.add(step.id);

      if (!TIERS.includes(step.defaultTier)) problems.push(`${stepWhere}: invalid defaultTier "${step.defaultTier}".`);
      if (!TIERS.includes(step.maxTier)) problems.push(`${stepWhere}: invalid maxTier "${step.maxTier}".`);

      if (tierRank(step.defaultTier) > tierRank(step.maxTier)) {
        problems.push(`${stepWhere}: defaultTier ${step.defaultTier} exceeds maxTier ${step.maxTier}.`);
      }
      if (step.maxTier !== 'T3' && !step.maxTierReason) {
        problems.push(`${stepWhere}: ceiling is ${step.maxTier} but no maxTierReason is given.`);
      }

      // Every T2+ step must be bounded by something deterministic.
      if (tierRank(step.defaultTier) >= tierRank('T2') && (step.guardrails ?? []).length === 0) {
        problems.push(`${stepWhere}: default tier ${step.defaultTier} with no guardrails declared.`);
      }

      const accountable: string[] = [];
      for (const [roleId, letter] of Object.entries(step.raci)) {
        if (!roleIds.has(roleId)) problems.push(`${stepWhere}: RACI key "${roleId}" is not a declared role id.`);
        referencedRoleIds.add(roleId);
        if (!['R', 'A', 'C', 'I', '-'].includes(letter)) {
          problems.push(`${stepWhere}: RACI letter "${letter}" for "${roleId}" is not R, A, C, I or -.`);
        }
        if (letter === 'A') accountable.push(roleId);
      }

      if (accountable.length === 0) problems.push(`${stepWhere}: no role marked Accountable.`);
      if (accountable.length > 1) problems.push(`${stepWhere}: ${accountable.length} roles marked Accountable.`);
      if (!accountable.some((roleId) => humanRoleIds.has(roleId))) {
        problems.push(`${stepWhere}: Accountable role is not human, which breaks audit traceability.`);
      }

      if (!step.humanTrack) problems.push(`${stepWhere}: humanTrack is empty.`);
      if (!step.aiTrack) problems.push(`${stepWhere}: aiTrack is empty.`);
    }

    for (const roleId of roleIds) {
      if (!referencedRoleIds.has(roleId)) {
        problems.push(`${where}: role "${roleId}" is declared but appears in no RACI row.`);
      }
    }

    // The generated diagrams are what the user actually sees; make sure the
    // source at least contains no unquoted label, the classic parser crash.
    const defaults = Object.fromEntries(process.steps.map((step) => [step.id, step.defaultTier]));
    for (const [label, source] of [
      ['swimlane', buildSwimlane(process, defaults)],
      ['waterfall', buildWaterfall(dataset.processes)],
    ] as const) {
      for (const line of source.split('\n')) {
        const bracketed = line.match(/\[(?!\()([^\]]*)\]/);
        if (bracketed && !bracketed[1].startsWith('"')) {
          problems.push(`${where}: unquoted ${label} label in "${line.trim()}".`);
        }
      }
    }
  }
}

const processCount = DATASETS.reduce((total, dataset) => total + dataset.processes.length, 0);

if (problems.length > 0) {
  console.error(`Dataset check failed: ${problems.length} problem(s).\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

console.log(
  `Dataset check passed: ${DATASETS.length} dataset(s), ${processCount} process(es), ${stepCount} step(s).`,
);
