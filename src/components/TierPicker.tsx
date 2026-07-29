import type { AutonomyTier } from '../types';
import { TIERS } from '../types';
import { TIER_DEFINITIONS, TIER_STYLES, isTierAllowed } from '../lib/tiers';

interface TierPickerProps {
  value: AutonomyTier;
  maxTier: AutonomyTier;
  maxTierReason?: string;
  onChange: (tier: AutonomyTier) => void;
  size?: 'sm' | 'md';
}

export function TierPicker({ value, maxTier, maxTierReason, onChange, size = 'md' }: TierPickerProps) {
  return (
    <div className="inline-flex rounded-lg border border-white/10 bg-black/30 p-0.5">
      {TIERS.map((tier) => {
        const allowed = isTierAllowed(tier, maxTier);
        const selected = tier === value;
        const style = TIER_STYLES[tier];
        const definition = TIER_DEFINITIONS[tier];

        const title = allowed
          ? `${tier} · ${definition.name}\n${definition.rule}`
          : `${tier} is blocked for this step.\n${maxTierReason ?? `Governance ceiling is ${maxTier}.`}`;

        return (
          <button
            key={tier}
            type="button"
            disabled={!allowed}
            onClick={() => onChange(tier)}
            title={title}
            className={[
              'rounded-md font-mono font-semibold transition',
              size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
              selected ? `${style.chip} ring-1` : 'text-slate-400 hover:text-slate-200 hover:bg-white/5',
              !allowed ? 'cursor-not-allowed text-slate-700 line-through hover:bg-transparent hover:text-slate-700' : '',
            ].join(' ')}
          >
            {tier}
          </button>
        );
      })}
    </div>
  );
}

export function TierChip({ tier }: { tier: AutonomyTier }) {
  const style = TIER_STYLES[tier];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${style.chip}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}
