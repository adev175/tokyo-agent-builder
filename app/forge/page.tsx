'use client';

import { useEffect, useState } from 'react';
import TracePane, { reduceEvent, type Step } from '@/components/TracePane';
import Storefront from '@/components/Storefront';
import ForgeResult from '@/components/ForgeResult';
import CraftsmanWizard, { type WizardState } from '@/components/CraftsmanWizard';
import CartBadge from '@/components/CartBadge';
import type { ForgeEvent, Piece } from '@/lib/types';

const STAGES = ['see', 'mark', 'comps', 'story', 'localize', 'ship'];

export default function ForgeConsole() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [piece, setPiece] = useState<Piece | null>(null);
  const [running, setRunning] = useState(false);
  const [traceOpen, setTraceOpen] = useState(false);
  const [score, setScore] = useState('…');
  const [wizard, setWizard] = useState<WizardState>({
    storeName: '',
    storeOrigin: '',
    storePeople: '',
    images: [],
    transcript: '',
    heritage: '',
    place: null,
  });

  useEffect(() => {
    fetch('/api/prewarm').catch(() => {});
    fetch('/api/health')
      .then((r) => r.json())
      .then((h: { score?: string }) => setScore(h.score ?? '0/6'))
      .catch(() => setScore('0/6'));
  }, []);

  async function run() {
    setRunning(true);
    setSteps([]);
    setPiece(null);
    const res = await fetch('/api/forge', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        imageDataUrl: wizard.images[0] ?? '',
        images: wizard.images,
        transcript: wizard.transcript,
        heritage: wizard.heritage,
        audioDataUrl: wizard.audioDataUrl,
        place: wizard.place,
        storeName: wizard.storeName,
        storeOrigin: wizard.storeOrigin,
        storePeople: wizard.storePeople,
      }),
    });
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.trim()) continue;
        const e = JSON.parse(line) as ForgeEvent;
        if (e.t === 'done') {
          setPiece(e.piece);
        } else {
          setSteps((prev) => reduceEvent(prev, e));
        }
      }
    }
    setRunning(false);
  }

  const doneCount = steps.filter((s) => s.state === 'done').length;

  return (
    <main className="bg-paper min-h-screen">
      <header className="bg-panel border-rule flex items-center gap-4 border-b px-5 py-3.5">
        <a href="/" className="mono text-sumi text-[12px] tracking-[0.06em]">
          ‹ tsugi
        </a>
        <span className="jp text-shu text-[19px] leading-none">継</span>
        <span className="mono text-[14px] tracking-[0.16em]">TSUGI · forge</span>
        <button
          onClick={() => setTraceOpen(true)}
          className="field-label border-line ml-auto flex items-center gap-2 rounded-[2px] border px-2.5 py-1.5 normal-case"
        >
          {running ? `forging ${doneCount}/${STAGES.length}…` : 'trace'}
          <span className={score.startsWith('6') ? 'text-sumi' : 'text-shu'}>●</span>
        </button>
        <CartBadge />
      </header>

      <div className="flex min-h-[calc(100vh-53px)] flex-col md:flex-row">
        <section className="border-rule w-full shrink-0 border-b md:w-[420px] md:border-r md:border-b-0">
          <CraftsmanWizard value={wizard} onChange={setWizard} onForge={run} running={running} />
          {piece ? <ForgeResult piece={piece} /> : null}
        </section>

        <section className="bg-bg flex-1 overflow-x-hidden">
          {piece ? (
            <Storefront piece={piece} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="jp text-ash text-[13px]">Photograph a piece.</p>
            </div>
          )}
        </section>
      </div>

      {traceOpen ? (
        <div onClick={() => setTraceOpen(false)} className="fixed inset-0 z-50 flex justify-end bg-[rgba(20,19,17,0.45)]">
          <div onClick={(e) => e.stopPropagation()} className="bg-paper border-line h-full w-full max-w-[380px] overflow-y-auto border-l">
            <div className="border-rule bg-panel sticky top-0 flex items-center justify-between border-b px-5 py-3">
              <span className="field-label">forge trace</span>
              <button onClick={() => setTraceOpen(false)} className="text-ash px-1 text-[15px]">
                ✕
              </button>
            </div>
            <TracePane steps={steps} />
          </div>
        </div>
      ) : null}
    </main>
  );
}
