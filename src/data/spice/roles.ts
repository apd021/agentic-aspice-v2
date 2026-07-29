import type { Role } from '../../types';

/**
 * The PAM defines processes, outcomes and base practices — it deliberately does
 * not define roles (see Annex C.3.3 on why a PAM is not a development process
 * blueprint). The human roles below are a conventional automotive software
 * organisation mapped onto the SWE process group; adjust them to your own
 * org chart. Role ids are stable because the RACI matrices key off them.
 */
export const HUMAN_ROLES: Record<string, Role> = {
  requirementsEngineer: {
    id: 'req-engineer',
    name: 'SW Requirements Engineer',
    kind: 'human',
    description: 'Owns the software requirements: their content, structure, characteristics and agreement with affected parties.',
  },
  architect: {
    id: 'architect',
    name: 'Software Architect',
    kind: 'human',
    description: 'Owns the software architecture, its static and dynamic aspects, and the recorded design rationale.',
  },
  developer: {
    id: 'developer',
    name: 'Software Developer',
    kind: 'human',
    description: 'Owns the detailed design of components and the construction of software units against coding principles.',
  },
  verificationEngineer: {
    id: 'verification-engineer',
    name: 'Verification Engineer',
    kind: 'human',
    description: 'Owns verification measures, their selection against release scope, and the recorded verification results.',
  },
  integrator: {
    id: 'integrator',
    name: 'Integration Engineer',
    kind: 'human',
    description: 'Owns the integration sequence, preconditions and the integrated software baseline.',
  },
  qualityAssurance: {
    id: 'quality-assurance',
    name: 'Quality Assurance',
    kind: 'human',
    description: 'Independent assurance that the process is performed and its work products conform (SUP.1).',
  },
  configManager: {
    id: 'config-manager',
    name: 'Configuration Manager',
    kind: 'human',
    description: 'Controls baselines, identification and change history of the work products (SUP.8).',
  },
  projectManager: {
    id: 'project-manager',
    name: 'Project Manager',
    kind: 'human',
    description: 'Owns scope, estimates and release scope decisions that constrain this process (MAN.3).',
  },
  safetyManager: {
    id: 'safety-manager',
    name: 'Functional Safety Manager',
    kind: 'human',
    description: 'Confirms safety requirements, ASIL decomposition and safety-related evidence are adequate.',
  },
};

export const {
  requirementsEngineer,
  architect,
  developer,
  verificationEngineer,
  integrator,
  qualityAssurance,
  configManager,
  projectManager,
  safetyManager,
} = HUMAN_ROLES;

/**
 * Reason strings reused across autonomy ceilings. Each cites the constraint
 * that actually stops the step being autonomous, rather than a vague appeal to
 * caution.
 */
export const CEILING_REASONS = {
  agreement:
    'Agreement is an act performed by affected parties, and Annex C.6 of the PAM treats "agree" as evidence of human commitment. An agent can prepare the agreement but cannot be the agreeing party.',
  designJudgement:
    'Selecting a structure and recording its rationale is an engineering judgement that an assessor will attribute to a named person. The agent proposes; a human decides and owns the decision.',
  releaseScope:
    'Selection against release scope is a project and risk decision owned by the project and the customer, not a property the agent can derive.',
  safetyCode:
    'Safety-related code requires human review evidence. ISO 26262-6 expects reviewed implementation, so an agent cannot self-merge into the delivered baseline.',
  verificationIntegrity:
    'The party specifying a verification measure must not be the sole party judging its adequacy, or the verification loses independence.',
} as const;
