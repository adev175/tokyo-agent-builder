export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Browser dictation (SpeechRecognition) only exists in Chromium — Safari and Firefox
 * silently produce audio with no text at all. Groq hosts Whisper, so every recording
 * gets a real, accurate transcript here regardless of the artisan's browser, on top of
 * whatever live captions Chromium already showed.
 */
export async function POST(req: Request) {
  const { audioDataUrl, language } = (await req.json()) as { audioDataUrl?: string; language?: string };
  if (!audioDataUrl?.startsWith('data:')) {
    return Response.json({ error: 'audioDataUrl required' }, { status: 400 });
  }
  const key = process.env.GROQ_API_KEY;
  if (!key) return Response.json({ error: 'transcription not configured' }, { status: 503 });
  const baseUrl = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1';

  // MediaRecorder reports mimeType with codec params attached (e.g. "audio/webm;codecs=opus"),
  // so the header before the comma can contain its own semicolons ahead of the final ";base64" —
  // a naive "first semicolon" split truncates there and the whole parse comes back empty.
  const commaIdx = audioDataUrl.indexOf(',');
  if (commaIdx < 0) return Response.json({ error: 'invalid audio data' }, { status: 400 });
  const header = audioDataUrl.slice(5, commaIdx); // strip "data:" prefix
  if (!header.endsWith(';base64')) return Response.json({ error: 'invalid audio data' }, { status: 400 });
  const mimeBase = header.slice(0, -';base64'.length).split(';')[0] || 'audio/webm';
  const b64 = audioDataUrl.slice(commaIdx + 1);
  const buf = Buffer.from(b64, 'base64');
  const ext = mimeBase.includes('webm') ? 'webm' : mimeBase.includes('ogg') ? 'ogg' : mimeBase.includes('mp4') ? 'mp4' : 'wav';

  const form = new FormData();
  form.append('file', new Blob([buf], { type: mimeBase }), `audio.${ext}`);
  // The full (non-turbo) model reads Japanese noticeably more accurately than the distilled
  // turbo variant — worth the extra latency here since this is the artisan's actual words.
  form.append('model', process.env.GROQ_WHISPER_MODEL || 'whisper-large-v3');
  if (language) form.append('language', language);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30000);
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/audio/transcriptions`, {
      method: 'POST',
      headers: { authorization: `Bearer ${key}` },
      body: form,
      signal: ctrl.signal,
    });
    if (!res.ok) {
      return Response.json({ error: `HTTP ${res.status}: ${(await res.text()).slice(0, 200)}` }, { status: 502 });
    }
    const data = (await res.json()) as { text?: string };
    return Response.json({ text: (data.text ?? '').trim() });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : 'transcription failed' }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
