import type { Provider } from './types';
import { providers, configured, fallbackEnabled } from './providers';

export interface ChatResult {
  text: string;
  ms: number;
  promptTokens: number;
  completionTokens: number;
  provider: Provider;
}

export class LlmError extends Error {
  constructor(
    public provider: Provider,
    message: string,
  ) {
    super(`${provider}: ${message}`);
  }
}

const JSON_NUDGE = 'Return only JSON, no prose, no code fences.';

export async function chat(opts: {
  provider: Exclude<Provider, 'daytona'>;
  messages: unknown[];
  json?: boolean;
  temperature?: number;
  timeoutMs?: number;
  maxTokens?: number;
  model?: string;
}): Promise<ChatResult> {
  const cfg = providers[opts.provider];
  if (!configured(opts.provider)) throw new LlmError(opts.provider, 'not configured');

  const messages = opts.json ? withJsonNudge(opts.messages) : opts.messages;
  const started = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 20000);

  try {
    const res = await fetch(`${cfg.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${cfg.apiKey}` },
      body: JSON.stringify({
        model: opts.model || cfg.model,
        messages,
        temperature: opts.temperature ?? 0.7,
        max_tokens: opts.maxTokens ?? 1200,
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new LlmError(opts.provider, `HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
    const body = (await res.json()) as {
      choices?: { message?: { content?: string; reasoning_content?: string; reasoning?: string } }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    const msg = body.choices?.[0]?.message;
    return {
      // Some OpenAI-compatible endpoints put a thinking model's only output in
      // reasoning_content and leave content empty.
      text: msg?.content || msg?.reasoning_content || msg?.reasoning || '',
      ms: Date.now() - started,
      promptTokens: body.usage?.prompt_tokens ?? 0,
      completionTokens: body.usage?.completion_tokens ?? 0,
      provider: opts.provider,
    };
  } catch (e) {
    if (e instanceof LlmError) throw e;
    throw new LlmError(opts.provider, e instanceof Error ? e.message : 'failed');
  } finally {
    clearTimeout(timer);
  }
}

export async function chatJson<T>(opts: {
  provider: Exclude<Provider, 'daytona'>;
  messages: unknown[];
  temperature?: number;
  timeoutMs?: number;
  maxTokens?: number;
}): Promise<{ data: T; result: ChatResult; calls: number }> {
  const first = await chat({ ...opts, json: true });
  const parsed = tryParse<T>(first.text);
  if (parsed) return { data: parsed, result: first, calls: 1 };

  if (!fallbackEnabled || !configured('groq')) {
    const retry = await chat({ ...opts, json: true, temperature: 0 });
    const fixed = tryParse<T>(retry.text);
    if (!fixed) throw new LlmError(opts.provider, 'unparseable JSON');
    return { data: fixed, result: { ...first, ms: first.ms + retry.ms }, calls: 2 };
  }
  const repair = await chat({
    provider: 'groq',
    temperature: 0,
    json: true,
    messages: [
      { role: 'system', content: 'Repair the following into valid JSON. Preserve every value verbatim.' },
      { role: 'user', content: first.text.slice(0, 6000) },
    ],
  });
  const fixed = tryParse<T>(repair.text);
  if (!fixed) throw new LlmError(opts.provider, 'unparseable JSON after repair');
  return { data: fixed, result: { ...first, ms: first.ms + repair.ms }, calls: 2 };
}

export function costJpy(provider: Exclude<Provider, 'daytona'>, promptTokens: number, completionTokens: number): number {
  return ((promptTokens + completionTokens) / 1000) * providers[provider].jpyPer1kTokens;
}

function withJsonNudge(messages: unknown[]): unknown[] {
  const copy = messages.map((m) => ({ ...(m as Record<string, unknown>) }));
  const sys = copy.find((m) => m.role === 'system');
  if (sys && typeof sys.content === 'string') sys.content = `${sys.content}\n${JSON_NUDGE}`;
  else copy.unshift({ role: 'system', content: JSON_NUDGE });
  return copy;
}

function tryParse<T>(raw: string): T | null {
  const stripped = raw
    .replace(/^\s*```(?:json)?/i, '')
    .replace(/```\s*$/, '')
    .trim();
  const start = stripped.search(/[[{]/);
  const end = Math.max(stripped.lastIndexOf('}'), stripped.lastIndexOf(']'));
  if (start < 0 || end < start) return null;
  try {
    return JSON.parse(stripped.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}
