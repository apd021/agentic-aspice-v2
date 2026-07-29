import type { AutonomyTier } from '../types';
import { TIERS } from '../types';
import { TIER_STYLES } from '../lib/tiers';

/** Proportion of steps sitting at each tier — the "how autonomous is this?" glance. */
export function AutonomyBar({ tiers, showLegend = false }: { tiers: AutonomyTier[]; showLegend?: boolean }) {
  const total = tiers.length || 1;
  const counts = TIERS.map((tier) => ({ tier, count: tiers.filter((t) => t === tier).length }));

  return (
    <div className="space-y-1.5">
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        {counts.map(({ tier, count }) =>
          count === 0 ? null : (
            <div
              key={tier}
              className={TIER_STYLES[tier].bar}
              style={{ width: `${(count / total) * 100}%` }}
              title={`${tier}: ${count} of ${total} steps`}
            />
          ),
        )}
      </div>
      {showLegend && (
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {counts.map(({ tier, count }) => (
            <span key={tier} className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className={`h-1.5 w-1.5 rounded-full ${TIER_STYLES[tier].dot}`} />
              {tier} · {count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
