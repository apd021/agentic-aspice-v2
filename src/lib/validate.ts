import type { Process, ProcessBundle } from '../types';
import { TIERS } from '../types';

/**
 * Hand-rolled validation rather than a schema library: the import path is the
 * seam where LLM-generated JSON arrives, and the error messages need to name
 * the exact field so the prompt can be corrected.
 */
export function parseBundle(raw: string): { bundle: ProcessBundle } | { errors: string[] } {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    return { errors: [`Not valid JSON: ${(error as Error).message}`] };
  }

  const errors: string[] = [];

  // Accept a bare array or a single process object as a convenience.
  let processes: unknown;
  if (Array.isArray(data)) {
    processes = data;
  } else if (data && typeof data === 'object' && 'processes' in data) {
    processes = (data as { processes: unknown }).processes;
  } else {
    processes = [data];
  }

  if (!Array.isArray(processes)) {
    return { errors: ['Expected an array of processes, or an object with a "processes" array.'] };
  }

  processes.forEach((candidate, index) => {
    const where = `processes[${index}]`;
    if (!candidate || typeof candidate !== 'object') {
      errors.push(`${where} is not an object.`);
      return;
    }
    const p = candidate as Partial<Process>;
    for (const field of ['id', 'name', 'purpose'] as const) {
      if (!p[field]) errors.push(`${where}.${field} is required.`);
    }
    if (!p.scope) errors.push(`${where}.scope is required (trigger, endState, inScope, outOfScope).`);
    if (!Array.isArray(p.steps) || p.steps.length === 0) {
      errors.push(`${where}.steps must be a non-empty array.`);
    } else {
      p.steps.forEach((step, stepIndex) => {
        const stepWhere = `${where}.steps[${stepIndex}]`;
        if (!step.id) errors.push(`${stepWhere}.id is required.`);
        if (!step.defaultTier) errors.push(`${stepWhere}.defaultTier is required.`);
        if (step.defaultTier && !TIERS.includes(step.defaultTier)) {
          errors.push(`${stepWhere}.defaultTier "${step.defaultTier}" is not one of T0, T1, T2, T3.`);
        }
        if (step.maxTier && !TIERS.includes(step.maxTier)) {
          errors.push(`${stepWhere}.maxTier "${step.maxTier}" is not one of T0, T1, T2, T3.`);
        }
      });
    }
  });

  if (errors.length > 0) return { errors };

  const normalised = (processes as Process[]).map((p, index) => ({
    ...p,
    order: typeof p.order === 'number' ? p.order : index + 1,
    isoClause: p.isoClause ?? '',
    objectives: p.objectives ?? [],
    successMeasures: p.successMeasures ?? [],
    translation: p.translation ?? [],
    roles: p.roles ?? [],
    metrics: p.metrics ?? [],
    risks: p.risks ?? [],
    sipoc: p.sipoc ?? { suppliers: [], inputs: [], process: [], outputs: [], customers: [] },
    steps: p.steps.map((step) => ({
      ...step,
      maxTier: step.maxTier ?? 'T3',
      raci: step.raci ?? {},
    })),
  }));

  return { bundle: { version: 1, processes: normalised } };
}
