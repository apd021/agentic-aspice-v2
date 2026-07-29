import { useCallback, useEffect, useState } from 'react';
import type { AutonomyTier, Process, ProcessBundle } from '../types';

const PROCESS_KEY = 'agentic-sdlc:processes:v1';
const TIER_KEY = 'agentic-sdlc:tiers:v1';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable (private window, quota). Selections stay in memory.
  }
}

/** Tier overrides are keyed "processId::stepId" so they survive re-import. */
export type TierOverrides = Record<string, AutonomyTier>;

export function useProcesses() {
  const [processes, setProcesses] = useState<Process[]>(() => read<Process[]>(PROCESS_KEY, []));

  useEffect(() => {
    write(PROCESS_KEY, processes);
  }, [processes]);

  const importBundle = useCallback((bundle: ProcessBundle, mode: 'replace' | 'merge') => {
    setProcesses((current) => {
      if (mode === 'replace') return bundle.processes;
      const byId = new Map(current.map((p) => [p.id, p]));
      for (const incoming of bundle.processes) byId.set(incoming.id, incoming);
      return [...byId.values()].sort((a, b) => a.order - b.order);
    });
  }, []);

  const clear = useCallback(() => setProcesses([]), []);

  return { processes, setProcesses, importBundle, clear };
}

export function useTierOverrides() {
  const [overrides, setOverrides] = useState<TierOverrides>(() => read<TierOverrides>(TIER_KEY, {}));

  useEffect(() => {
    write(TIER_KEY, overrides);
  }, [overrides]);

  const setTier = useCallback((processId: string, stepId: string, tier: AutonomyTier) => {
    setOverrides((current) => ({ ...current, [`${processId}::${stepId}`]: tier }));
  }, []);

  const resetProcess = useCallback((processId: string) => {
    setOverrides((current) => {
      const next: TierOverrides = {};
      for (const [key, value] of Object.entries(current)) {
        if (!key.startsWith(`${processId}::`)) next[key] = value;
      }
      return next;
    });
  }, []);

  return { overrides, setTier, resetProcess };
}

/** Resolved tier per step id for a single process. */
export function resolveTiers(process: Process, overrides: TierOverrides): Record<string, AutonomyTier> {
  const resolved: Record<string, AutonomyTier> = {};
  for (const step of process.steps) {
    resolved[step.id] = overrides[`${process.id}::${step.id}`] ?? step.defaultTier;
  }
  return resolved;
}
