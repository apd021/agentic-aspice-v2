/**
 * Data model for a dual-track Automotive SPICE process description:
 * one narrative for human engineering teams, one operational spec for AI agents.
 */

export type AutonomyTier = 'T0' | 'T1' | 'T2' | 'T3';

export const TIERS: AutonomyTier[] = ['T0', 'T1', 'T2', 'T3'];

export interface TierDefinition {
  tier: AutonomyTier;
  name: string;
  rule: string;
  writeAccess: string;
  banned: string;
}

export type RaciLetter = 'R' | 'A' | 'C' | 'I' | '-';

export type RoleKind = 'human' | 'ai';

export interface Role {
  id: string;
  name: string;
  kind: RoleKind;
  /** What this role is answerable for within the process. */
  description: string;
  /** For AI roles: the tools, APIs and scopes the agent is granted. */
  tooling?: string[];
  /** For AI roles: what the agent must be given to operate. */
  context?: string[];
}

export interface ProcessStep {
  /** Stable identifier, e.g. "1.1". Used as the RACI and export key. */
  id: string;
  name: string;
  /** Neutral statement of the task, independent of who or what performs it. */
  description: string;
  /** Autonomy tier proposed by the process author. */
  defaultTier: AutonomyTier;
  /**
   * Governance ceiling. The UI refuses to let a user select above this.
   * Use it to encode "this can never be autonomous".
   */
  maxTier: AutonomyTier;
  /** Why the ceiling exists. Shown when a tier is blocked. */
  maxTierReason?: string;
  /** Human engineering track: the ritual, review or judgement required. */
  humanTrack: string;
  /** AI agent track: the concrete tool-calling behaviour. */
  aiTrack: string;
  /** Named tool or API invocations available to the agent for this step. */
  tools?: string[];
  inputs?: string[];
  outputs?: string[];
  /** Systems of record this step reads or writes. */
  systemOfRecord?: string;
  /** Deterministic checks that bound the agent. Required for T2 and T3. */
  guardrails?: string[];
  /** What to do when the step fails or the agent is not confident. */
  errorRecovery?: string;
  /** roleId -> RACI letter. */
  raci: Record<string, RaciLetter>;
}

export interface Sipoc {
  suppliers: string[];
  inputs: string[];
  /** 3-5 high level sequential transformation phases. */
  process: string[];
  outputs: string[];
  customers: string[];
}

export interface TranslationRow {
  dimension: string;
  human: string;
  ai: string;
}

export interface Scope {
  trigger: string;
  endState: string;
  inScope: string[];
  outOfScope: string[];
}

export interface Metric {
  name: string;
  definition: string;
  target: string;
  category: 'Velocity' | 'Quality' | 'Governance' | 'Cost';
}

export interface Risk {
  id: string;
  description: string;
  category: string;
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
  control: string;
  fallback: string;
}

export interface Process {
  id: string;
  /** e.g. "6.4.4" */
  isoClause: string;
  name: string;
  /** Waterfall stage this process belongs to; drives ordering in the flow view. */
  order: number;
  purpose: string;
  scope: Scope;
  objectives: string[];
  successMeasures: string[];
  translation: TranslationRow[];
  roles: Role[];
  sipoc: Sipoc;
  /**
   * Optional hand-authored Mermaid swimlane. When absent the app generates one
   * from the steps, with all labels quoted so the parser cannot choke.
   */
  swimlaneMermaid?: string;
  steps: ProcessStep[];
  metrics: Metric[];
  risks: Risk[];
}

/** Shape accepted by the JSON import panel. */
export interface ProcessBundle {
  version: 1;
  processes: Process[];
}
