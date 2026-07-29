import type { ReactNode } from 'react';

export function Section({
  number,
  title,
  subtitle,
  children,
  actions,
}: {
  number: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="scroll-mt-24" id={`part-${number}`}>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <div>
          <h2 className="flex items-baseline gap-2.5 text-base font-semibold text-slate-100">
            <span className="font-mono text-xs text-slate-500">{String(number).padStart(2, '0')}</span>
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-white/8 bg-white/[0.02] p-4 ${className}`}>{children}</div>;
}

export function List({ items, empty = 'Not recorded' }: { items?: string[]; empty?: string }) {
  if (!items || items.length === 0) return <p className="text-sm text-slate-600 italic">{empty}</p>;
  return (
    <ul className="space-y-1.5">
      {items.map((item, index) => (
        <li key={index} className="flex gap-2 text-sm text-slate-300">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-600" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{children}</p>;
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/8">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-white/8 bg-white/[0.03]">
            {head.map((heading) => (
              <th key={heading} className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
