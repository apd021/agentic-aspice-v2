import type { Process } from '../types';

/**
 * Blank authoring skeleton. Every field the app renders appears here, so an
 * LLM handed this shape has nowhere to invent a structure of its own.
 */
export const PROCESS_TEMPLATE: Process = {
  id: 'process-id',
  isoClause: '6.4.x',
  name: 'Process name',
  order: 1,
  purpose: 'Two or three sentences on why this process exists and the risk it removes from the lifecycle.',
  scope: {
    trigger: 'The event, webhook or artefact that starts the process.',
    endState: 'The completion criteria or artefact handoff that ends it.',
    inScope: ['Activity this process governs'],
    outOfScope: ['Activity deferred to an adjacent process'],
  },
  objectives: ['Outcome-oriented engineering goal'],
  successMeasures: ['Quantitative pass/fail gate required to exit'],
  translation: [
    { dimension: 'Primary intent', human: '', ai: '' },
    { dimension: 'Execution modality', human: '', ai: '' },
    { dimension: 'Input and output formats', human: '', ai: '' },
    { dimension: 'Governance and quality', human: '', ai: '' },
  ],
  roles: [
    { id: 'human-role-1', name: 'Role name', kind: 'human', description: 'What this role is answerable for.' },
    {
      id: 'agent-role-1',
      name: 'ExampleAgent',
      kind: 'ai',
      description: 'System role of the agent in one sentence.',
      tooling: ['tool_name(args)'],
      context: ['What must be in the context window'],
    },
  ],
  sipoc: {
    suppliers: ['Team or system providing input'],
    inputs: ['Artefact ingested'],
    process: ['High level transformation phase'],
    outputs: ['Deliverable produced'],
    customers: ['Downstream consumer'],
  },
  steps: [
    {
      id: '1.1',
      name: 'Step name',
      description: 'Neutral statement of the task.',
      defaultTier: 'T1',
      maxTier: 'T2',
      maxTierReason: 'Why this step can never be fully autonomous.',
      humanTrack: 'The review, judgement or ritual the human performs.',
      aiTrack: 'The concrete tool-calling behaviour of the agent.',
      tools: ['tool_name(args)'],
      inputs: ['Input artefact'],
      outputs: ['Output artefact'],
      systemOfRecord: 'Jira, GitHub, CI/CD',
      guardrails: ['Deterministic check that bounds the agent'],
      errorRecovery: 'What happens when the step fails or confidence is low.',
      raci: { 'human-role-1': 'A', 'agent-role-1': 'R' },
    },
  ],
  metrics: [
    { name: 'Metric name', definition: 'How it is calculated.', target: '0', category: 'Quality' },
  ],
  risks: [
    {
      id: 'R1',
      description: 'What could go wrong.',
      category: 'AI hallucination',
      impact: 'High',
      control: 'Automated preventative control.',
      fallback: 'Rollback procedure.',
    },
  ],
};
