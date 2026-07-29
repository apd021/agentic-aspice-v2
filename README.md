# Agentic SDLC

An atlas for software lifecycle processes, described twice over: once as a human engineering process, once as an operational specification an AI agent can execute. Every task in every process carries an autonomy tier you choose.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:5173 and pick a process set.

## Bundled content

**Automotive SPICE, software engineering process group.** SWE.1 to SWE.6 in lifecycle order, from requirements analysis through to software verification, with each base practice as an individually tiered task. Forty tasks in total.

| Clause | Process | Tasks |
|---|---|---|
| SWE.1 | Software Requirements Analysis | 6 |
| SWE.2 | Software Architectural Design | 5 |
| SWE.3 | Software Detailed Design and Unit Construction | 5 |
| SWE.4 | Software Unit Verification | 5 |
| SWE.5 | Software Component Verification and Integration Verification | 7 |
| SWE.6 | Software Verification | 5 |

Process purposes, outcomes and base practice definitions come from Automotive SPICE PAM v4.0 clause 4.4. Everything else — roles, RACI, autonomy tiers, guardrails, metrics, risks and controls — is authored here, because the PAM deliberately does not prescribe them (see its Annex C.3.4 on why a PAM is not a development process blueprint). Treat the overlay as a starting position to argue with, not as compliance evidence.

## What the app does

**Lifecycle waterfall.** The loaded processes in sequence as a flow diagram, with the autonomy mix of each visible at a glance.

**Dual-track process pages.** Eleven sections per process: dual-track translation, purpose, scope (trigger, end state, in scope, out of scope), objectives and success measures, roles split into human roles and AI personas, SIPOC, cross-functional swimlane, detailed steps, RACI, metrics and KPIs, risks and controls. The human track and the agent track sit side by side on every step.

**Per-task autonomy selection.**

| Tier | Name | Rule |
|---|---|---|
| T0 | No agent | Step stays fully manual. Listed only for completeness of the flow. |
| T1 | Assist | Agent drafts, suggests or retrieves. A human reviews and takes every action. No writes to systems of record. |
| T2 | Execute with approval | Agent performs the step; a named human approves before the result is committed. |
| T3 | Autonomous | Agent performs and commits without per-instance approval, bounded by automated guardrails. |

Selections persist in the browser and redraw the swimlane: a task moves between the human and agent lanes as its tier changes, and a T2 task grows an explicit approval gate.

**Governance enforcement.** Each task declares a `maxTier` ceiling with a reason. Tiers above it are struck through and unselectable, and the reason appears on hover. In the SPICE dataset the ceilings cite the actual constraint — agreement is an act of the affected parties, release scope is a project risk decision, safety-related code needs human review evidence, and the party specifying a verification measure should not be the sole judge of its adequacy.

The page raises a warning when a task runs at T3 with no human marked Accountable, or sits at T2 or above with no deterministic guardrail declared.

**Export.** Any process exports as a Markdown governance document with your selected tiers baked in. The whole set exports as JSON.

## Adding your own processes

Two routes:

1. **Generate.** `public/meta-prompt.md` takes raw standard text and returns JSON in this app's schema. The landing page has a copy button. Paste the result into Import JSON; validation names the exact offending field.
2. **Author by hand.** `src/data/template.ts` is a blank skeleton with every field the app renders, and the import panel can insert it as JSON for you.

To ship a set with the app rather than importing it, add it to `DATASETS` in `src/data/datasets.ts`.

## Checks

```bash
npm run check
```

Two things run, and both are wired to fail the build rather than warn:

`check:dataset` validates what the type system cannot express — that every RACI key resolves to a declared role, that exactly one role is Accountable per task and that it is a human one, that no default tier exceeds its own ceiling, that every ceiling below T3 gives a reason, and that no task defaults to T2 or above without a guardrail.

`check:diagrams` runs Mermaid's real parser over every diagram the app can generate: each swimlane at its default tiers and at every tier forced as far as its ceiling allows, plus the waterfalls. Label quoting is a claim until a parser agrees, and the forced variants are what exercise the T2 approval-gate branch.

## Structure

```
src/
  types.ts                Process, ProcessStep, Role, SIPOC, RACI, metrics, risks
  lib/tiers.ts            T0-T3 definitions, ceiling checks, guardrail rules
  lib/mermaid-source.ts   Swimlane and waterfall generation with quoted labels
  lib/store.ts            localStorage persistence for processes and tier overrides
  lib/validate.ts         Import validation with field-level error messages
  lib/export.ts           Markdown and JSON export
  components/             UI
  data/spice/             SWE.1-SWE.6, one file per process, shared roles
  data/datasets.ts        Registry of bundled sets with provenance
  data/template.ts        Blank authoring skeleton
scripts/                  Dataset and diagram checks
public/meta-prompt.md     LLM meta-prompt producing importable JSON
```

## Notes

Mermaid labels are emitted quoted, subgraph titles included, because unquoted parentheses and colons crash the parser. If a diagram fails anyway, the panel shows the error and the offending source rather than rendering blank.

`Automotive-SPICE-PAM-v40.pdf` in the repository root is the source document. It is redistribution-restricted by the VDA; do not commit it to a shared remote.
