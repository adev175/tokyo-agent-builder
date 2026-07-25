import { getSandbox } from '@/lib/sandbox';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function GET() {
  const started = Date.now();
  try {
    const sandbox = await getSandbox();
    return Response.json({ ok: true, id: sandbox.id, ms: Date.now() - started });
  } catch (e) {
    return Response.json({ ok: false, error: e instanceof Error ? e.message : 'failed', ms: Date.now() - started });
  }
}
