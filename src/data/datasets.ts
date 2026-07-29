import type { Process } from '../types';
import { SPICE_SWE_PROCESSES } from './spice';

export interface Dataset {
  id: string;
  name: string;
  source: string;
  description: string;
  /** What in the dataset is quoted from the standard and what is authored here. */
  provenance: string;
  processes: Process[];
}

export const DATASETS: Dataset[] = [
  {
    id: 'automotive-spice-swe',
    name: 'Automotive SPICE — software engineering process group',
    source: 'Automotive SPICE PAM v4.0, clause 4.4 (SWE.1 to SWE.6)',
    description:
      'The six software engineering processes in lifecycle order, from requirements analysis through to software verification, each with its base practices as individual tasks.',
    provenance:
      'Process purposes, outcomes and base practice definitions are taken from the PAM. Roles, RACI, autonomy tiers, guardrails, metrics and risks are authored here as the agentic overlay — the PAM deliberately does not prescribe them.',
    processes: SPICE_SWE_PROCESSES,
  },
];
