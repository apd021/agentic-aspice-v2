import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'strict',
  flowchart: { curve: 'basis', htmlLabels: true },
  themeVariables: {
    background: '#0a0c10',
    primaryColor: '#151a22',
    primaryTextColor: '#e6e8ec',
    primaryBorderColor: '#2b333f',
    lineColor: '#5a6572',
    fontSize: '13px',
  },
});

let renderCounter = 0;

interface MermaidProps {
  source: string;
}

/**
 * Renders Mermaid source, and on a parse failure shows the offending source
 * instead of blanking the panel — a broken diagram should not hide the spec.
 */
export function Mermaid({ source }: MermaidProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    renderCounter += 1;
    const id = `mermaid-${renderCounter}`;

    mermaid
      .render(id, source)
      .then(({ svg }) => {
        if (cancelled || !hostRef.current) return;
        hostRef.current.innerHTML = svg;
        setError(null);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setError(cause instanceof Error ? cause.message : String(cause));
      });

    return () => {
      cancelled = true;
      // Mermaid leaves a measurement node behind on failure.
      document.getElementById(`d${id}`)?.remove();
    };
  }, [source]);

  if (error) {
    return (
      <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-4">
        <p className="text-sm font-medium text-rose-300">Diagram failed to render</p>
        <p className="mt-1 text-xs text-rose-200/70">{error}</p>
        <pre className="mt-3 overflow-x-auto rounded bg-black/40 p-3 text-xs text-slate-300">{source}</pre>
      </div>
    );
  }

  return <div ref={hostRef} className="mermaid-host overflow-x-auto rounded-lg border border-white/8 bg-black/20 p-4" />;
}
