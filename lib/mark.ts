import { chatJson } from './llm';
import { configured } from './providers';
import type { Mark } from './types';

const PROMPT = `この画像に写っている落款・銘・箱書きの文字を読んでください。
篆書・草書・崩し字の可能性があります。読めない字は「〇」で示してください。
文字が写っていない場合は textRaw を null にしてください。
産地や作者を推測で補わないこと。読めた字だけを返すこと。
JSONのみ: {"textRaw":string|null,"reading":string|null,"interpretation":string|null,"confidence":number}`;

export async function readMark(imageDataUrl: string): Promise<Mark> {
  if (!configured('nosana')) throw new Error('nosana endpoint not configured');
  const { data } = await chatJson<Mark>({
    provider: 'nosana',
    temperature: 0.1,
    timeoutMs: 6000,
    maxTokens: 300,
    messages: [
      { role: 'system', content: 'You read Japanese seal script and calligraphy off photographs of craft objects.' },
      {
        role: 'user',
        content: [
          { type: 'text', text: PROMPT },
          { type: 'image_url', image_url: { url: imageDataUrl } },
        ],
      },
    ],
  });
  return {
    textRaw: data.textRaw ?? null,
    reading: data.reading ?? null,
    interpretation: data.interpretation ?? null,
    confidence: typeof data.confidence === 'number' ? data.confidence : 0.4,
  };
}
