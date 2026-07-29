import type { Process } from '../../types';
import { SWE1 } from './swe1';
import { SWE2 } from './swe2';
import { SWE3 } from './swe3';
import { SWE4 } from './swe4';
import { SWE5 } from './swe5';
import { SWE6 } from './swe6';

/**
 * The Automotive SPICE software engineering process group in lifecycle order.
 * Purposes, outcomes and base practices come from PAM v4.0 clause 4.4; the
 * dual-track overlay, autonomy tiers, RACI, metrics and risks do not — the PAM
 * deliberately avoids prescribing them (Annex C.3.4).
 */
export const SPICE_SWE_PROCESSES: Process[] = [SWE1, SWE2, SWE3, SWE4, SWE5, SWE6];

export { SWE1, SWE2, SWE3, SWE4, SWE5, SWE6 };
