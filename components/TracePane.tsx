'use client';

import type { ForgeEvent, StepId } from '@/lib/types';

export interface Step {
  id: StepId;
  label: string;
  labelJa: string;
  provider: string;
  state: 'running' | 'done' | 'fail';
  ms?: number;
  calls?: number;
  costJpy?: number;
  logs: string[];
  code?: string;
  error?: string;
}

const PROVIDER_LABEL: Record<string, string> = {
  qwen: 'Qwen Cloud',
  nosana: 'Nosana',
  daytona: 'Daytona',
  aiand: 'ai&',
  gmi: 'GMI Cloud',
  groq: 'Groq',
};

export function reduceEvent(steps: Step[], e: ForgeEvent): Step[] {
  if (e.t === 'done') return steps;
  const next = [...steps];
  const i = next.findIndex((s) => s.id === (e as { id: StepId }).id);
  if (e.t === 'step_start') {
    const step: Step = { id: e.id, label: e.label, labelJa: e.labelJa, provider: e.provider, state: 'running', logs: [] };
    if (i < 0) next.push(step);
    else next[i] = step;
    return next;
  }
  if (i < 0) return next;
  const s = { ...next[i] };
  if (e.t === 'log') s.logs = [...s.logs, e.line];
  if (e.t === 'code') s.code = e.source;
  if (e.t === 'step_done') {
    s.state = 'done';
    s.ms = e.ms;
    s.calls = e.calls;
    s.costJpy = e.costJpy;
  }
  if (e.t === 'step_fail') {
    s.state = 'fail';
    s.ms = e.ms;
    s.error = e.error;
  }
  next[i] = s;
  return next;
}

export default function TracePane({ steps }: { steps: Step[] }) {
  return (
    <div className="mono px-5 py-4 text-[12px] leading-[1.7]">
      <div className="field-label border-rule border-b pb-2">forge trace</div>
      {steps.length === 0 ? <p className="jp text-ash mt-6 text-[13px]">Photograph a piece.</p> : null}

      {steps.map((s) => (
        <section key={s.id} className="border-rule border-b py-3">
          <div className="flex items-baseline gap-2">
            <span className={s.state === 'fail' ? 'text-shu' : s.state === 'running' ? 'text-dust' : 'text-sumi'}>●</span>
            <span className="jp text-[13px]">{s.labelJa}</span>
            <span>{s.label}</span>
            <span className="text-dust ml-auto">
              {s.ms !== undefined ? `${(s.ms / 1000).toFixed(1)}s` : '…'}
              {s.state === 'done' ? ' ✓' : ''}
            </span>
          </div>
          <div className="text-dust">
            {PROVIDER_LABEL[s.provider] ?? s.provider}
            {s.calls ? ` · ${s.calls} call${s.calls > 1 ? 's' : ''}` : ''}
            {s.costJpy ? ` · ¥${s.costJpy.toFixed(2)}` : ''}
          </div>
          {s.logs.map((l, k) => (
            <div key={k} className="jp text-ash mt-1 break-words">
              {l}
            </div>
          ))}
          {s.code ? (
            <pre className="border-rule bg-field mt-2 max-h-[190px] overflow-auto rounded-[2px] border p-2 text-[10px] leading-[1.5] whitespace-pre">
              {s.code}
            </pre>
          ) : null}
          {s.error ? <div className="text-shu mt-1">{s.error} · continuing</div> : null}
        </section>
      ))}
    </div>
  );
}
