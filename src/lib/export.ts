import type { AutonomyTier, Process } from '../types';
import { TIER_DEFINITIONS } from './tiers';
import { buildSwimlane } from './mermaid-source';

function bullets(items: string[] | undefined): string {
  if (!items || items.length === 0) return '_None recorded._\n';
  return `${items.map((item) => `- ${item}`).join('\n')}\n`;
}

function cell(value: string | undefined): string {
  return (value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

/**
 * Renders the process as a governance document. This is the artefact that goes
 * into an audit pack, so the selected tiers are baked in rather than defaults.
 */
export function processToMarkdown(process: Process, tiers: Record<string, AutonomyTier>): string {
  const out: string[] = [];
  const humanRoles = process.roles.filter((r) => r.kind === 'human');
  const aiRoles = process.roles.filter((r) => r.kind === 'ai');

  out.push(`# ${process.isoClause ? `${process.isoClause} — ` : ''}${process.name}\n`);

  out.push('## 1. Dual-track translation\n');
  if (process.translation.length > 0) {
    out.push('| Dimension | Human engineering track | AI agent operational track |');
    out.push('|---|---|---|');
    for (const row of process.translation) {
      out.push(`| ${cell(row.dimension)} | ${cell(row.human)} | ${cell(row.ai)} |`);
    }
    out.push('');
  } else {
    out.push('_None recorded._\n');
  }

  out.push('## 2. Purpose\n');
  out.push(`${process.purpose}\n`);

  out.push('## 3. Scope\n');
  out.push(`**Trigger (start):** ${process.scope.trigger}\n`);
  out.push(`**End state (finish):** ${process.scope.endState}\n`);
  out.push('**In scope:**\n');
  out.push(bullets(process.scope.inScope));
  out.push('**Out of scope:**\n');
  out.push(bullets(process.scope.outOfScope));

  out.push('## 4. Objectives and success measures\n');
  out.push('**Objectives:**\n');
  out.push(bullets(process.objectives));
  out.push('**Success measures:**\n');
  out.push(bullets(process.successMeasures));

  out.push('## 5. Roles involved\n');
  out.push('**Human roles:**\n');
  out.push(bullets(humanRoles.map((r) => `**${r.name}** — ${r.description}`)));
  out.push('**AI agent roles:**\n');
  out.push(
    bullets(
      aiRoles.map((r) => {
        const tooling = r.tooling && r.tooling.length > 0 ? ` Tooling: ${r.tooling.join(', ')}.` : '';
        return `**${r.name}** — ${r.description}${tooling}`;
      }),
    ),
  );

  out.push('## 6. SIPOC\n');
  out.push('| Suppliers | Inputs | Process | Outputs | Customers |');
  out.push('|---|---|---|---|---|');
  const depth = Math.max(
    process.sipoc.suppliers.length,
    process.sipoc.inputs.length,
    process.sipoc.process.length,
    process.sipoc.outputs.length,
    process.sipoc.customers.length,
    1,
  );
  for (let i = 0; i < depth; i += 1) {
    out.push(
      `| ${cell(process.sipoc.suppliers[i])} | ${cell(process.sipoc.inputs[i])} | ${cell(
        process.sipoc.process[i],
      )} | ${cell(process.sipoc.outputs[i])} | ${cell(process.sipoc.customers[i])} |`,
    );
  }
  out.push('');

  out.push('## 7. Cross-functional swimlane\n');
  out.push('```mermaid');
  out.push(process.swimlaneMermaid ?? buildSwimlane(process, tiers));
  out.push('```\n');

  out.push('## 8. Process steps and autonomy matrix\n');
  out.push('| Step | Task | Tier | Human responsibility | AI agent action | System of record and guardrails |');
  out.push('|---|---|---|---|---|---|');
  for (const step of process.steps) {
    const tier = tiers[step.id] ?? step.defaultTier;
    const guardrails = step.guardrails && step.guardrails.length > 0 ? ` Guardrails: ${step.guardrails.join('; ')}` : '';
    out.push(
      `| ${cell(step.id)} | ${cell(step.name)} | **${tier}** ${cell(TIER_DEFINITIONS[tier].name)} | ${cell(
        step.humanTrack,
      )} | ${cell(step.aiTrack)} | ${cell(step.systemOfRecord)}${cell(guardrails)} |`,
    );
  }
  out.push('');

  out.push('## 9. RACI matrix\n');
  if (process.roles.length > 0) {
    out.push(`| Step | ${process.roles.map((r) => cell(r.name)).join(' | ')} |`);
    out.push(`|---|${process.roles.map(() => '---').join('|')}|`);
    for (const step of process.steps) {
      out.push(`| ${cell(step.id)} | ${process.roles.map((r) => step.raci[r.id] ?? '-').join(' | ')} |`);
    }
    out.push('');
  } else {
    out.push('_No roles defined._\n');
  }

  out.push('## 10. Metrics and KPIs\n');
  if (process.metrics.length > 0) {
    out.push('| Metric | Category | Definition | Target |');
    out.push('|---|---|---|---|');
    for (const metric of process.metrics) {
      out.push(`| ${cell(metric.name)} | ${cell(metric.category)} | ${cell(metric.definition)} | ${cell(metric.target)} |`);
    }
    out.push('');
  } else {
    out.push('_None recorded._\n');
  }

  out.push('## 11. Risks and controls\n');
  if (process.risks.length > 0) {
    out.push('| ID | Risk | Category | Impact | Preventative control | Fallback |');
    out.push('|---|---|---|---|---|---|');
    for (const risk of process.risks) {
      out.push(
        `| ${cell(risk.id)} | ${cell(risk.description)} | ${cell(risk.category)} | ${cell(risk.impact)} | ${cell(
          risk.control,
        )} | ${cell(risk.fallback)} |`,
      );
    }
    out.push('');
  } else {
    out.push('_None recorded._\n');
  }

  return out.join('\n');
}

export function download(filename: string, contents: string, mime: string): void {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
