import { useState } from 'react';
import type { ProcessBundle } from '../types';
import { parseBundle } from '../lib/validate';
import { PROCESS_TEMPLATE } from '../data/template';

interface ImportPanelProps {
  onImport: (bundle: ProcessBundle, mode: 'replace' | 'merge') => void;
  onClose: () => void;
}

export function ImportPanel({ onImport, onClose }: ImportPanelProps) {
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');

  function submit() {
    const result = parseBundle(text);
    if ('errors' in result) {
      setErrors(result.errors);
      return;
    }
    setErrors([]);
    onImport(result.bundle, mode);
    onClose();
  }

  async function loadFile(file: File) {
    setText(await file.text());
    setErrors([]);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-white/10 bg-[#0d1117] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-3.5">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Import process JSON</h2>
            <p className="text-xs text-slate-500">Paste the output of the meta-prompt, or drop a .json file.</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-500 transition hover:text-slate-200">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            onDrop={(event) => {
              const file = event.dataTransfer.files[0];
              if (file) {
                event.preventDefault();
                void loadFile(file);
              }
            }}
            placeholder='{ "version": 1, "processes": [ ... ] }'
            spellCheck={false}
            className="h-72 w-full resize-none rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-xs text-slate-300 outline-none placeholder:text-slate-700 focus:border-white/25"
          />

          {errors.length > 0 && (
            <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/5 p-3">
              <p className="text-xs font-semibold text-rose-300">{errors.length} problem(s) found</p>
              <ul className="mt-1.5 space-y-1">
                {errors.map((error) => (
                  <li key={error} className="font-mono text-xs text-rose-200/70">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={() => setText(JSON.stringify({ version: 1, processes: [PROCESS_TEMPLATE] }, null, 2))}
            className="mt-3 text-xs text-slate-500 underline underline-offset-2 transition hover:text-slate-300"
          >
            Insert blank template
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/8 px-5 py-3.5">
          <div className="flex gap-1 rounded-lg border border-white/10 p-0.5">
            {(['merge', 'replace'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setMode(option)}
                className={`rounded-md px-2.5 py-1 text-xs capitalize transition ${
                  mode === option ? 'bg-white/10 text-slate-100' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-xs text-slate-400 transition hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={text.trim().length === 0}
              className="rounded-lg bg-slate-100 px-3.5 py-1.5 text-xs font-medium text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              Import
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
