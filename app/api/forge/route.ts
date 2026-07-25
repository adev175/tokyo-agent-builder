import { forge, type ForgeInput } from '@/lib/pipeline';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<ForgeInput>;
  const images = (body.images ?? []).filter((i) => i.startsWith('data:'));
  const imageDataUrl = body.imageDataUrl || images[0] || '';

  const encoder = new TextEncoder();
  const events = forge({
    imageDataUrl,
    images,
    transcript: body.transcript ?? '',
    heritage: body.heritage ?? '',
    audioDataUrl: body.audioDataUrl,
    place: body.place ?? null,
    storeName: body.storeName ?? '',
  });

  const stream = new ReadableStream({
    async pull(controller) {
      const { value, done } = await events.next();
      if (done) {
        controller.close();
        return;
      }
      controller.enqueue(encoder.encode(JSON.stringify(value) + '\n'));
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'application/x-ndjson; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      'x-accel-buffering': 'no',
    },
  });
}
