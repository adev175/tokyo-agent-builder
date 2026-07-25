import { Daytona } from '@daytonaio/sdk';
import { providers } from '@/lib/providers';
import { daytonaConfigured } from '@/lib/sandbox';

export const runtime = 'nodejs';
export const maxDuration = 60;

type Status = { ok: boolean; ms: number; note?: string; model?: string };

async function pingLlm(name: 'aiand' | 'qwen' | 'gmi' | 'nosana'): Promise<Status> {
  const cfg = providers[name];
  const started = Date.now();
  if (!cfg.baseUrl || !cfg.model) return { ok: false, ms: 0, note: 'env not set' };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 3000);
  try {
    const res = await fetch(`${cfg.baseUrl.replace(/\/$/, '')}/models`, {
      headers: { authorization: `Bearer ${cfg.apiKey}` },
      signal: ctrl.signal,
    });
    return { ok: res.ok, ms: Date.now() - started, model: cfg.model, note: res.ok ? undefined : `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, ms: Date.now() - started, note: e instanceof Error ? e.message : 'unreachable' };
  } finally {
    clearTimeout(timer);
  }
}

// Lists sandboxes rather than creating one: a health poll must never consume quota.
async function pingDaytona(): Promise<Status> {
  const started = Date.now();
  if (!daytonaConfigured()) return { ok: false, ms: 0, note: 'DAYTONA_API_KEY not set' };
  try {
    const daytona = new Daytona({ apiKey: process.env.DAYTONA_API_KEY! });
    let live = 0;
    for await (const _ of daytona.list()) live++;
    return { ok: true, ms: Date.now() - started, note: `api reachable · ${live} sandbox(es) live` };
  } catch (e) {
    return { ok: false, ms: Date.now() - started, note: e instanceof Error ? e.message.slice(0, 120) : 'unreachable' };
  }
}

export async function GET() {
  const [aiand, qwen, gmi, nosana, daytona] = await Promise.all([
    pingLlm('aiand'),
    pingLlm('qwen'),
    pingLlm('gmi'),
    pingLlm('nosana'),
    pingDaytona(),
  ]);
  const qoder: Status = { ok: true, ms: 0, note: 'build-time: this repo was written by the Qoder agent' };
  const six = [aiand, qwen, gmi, nosana, daytona, qoder];
  return Response.json(
    {
      aiand,
      qwen,
      gmi,
      nosana,
      daytona,
      qoder,
      score: `${six.filter((s) => s.ok).length}/6`,
    },
    { headers: { 'cache-control': 'no-store' } },
  );
}
