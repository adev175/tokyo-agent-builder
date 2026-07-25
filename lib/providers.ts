import type { Provider } from './types';

export interface ProviderConfig {
  name: Provider;
  label: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  jpyPer1kTokens: number;
}

export const providers: Record<Exclude<Provider, 'daytona'>, ProviderConfig> = {
  aiand: {
    name: 'aiand',
    label: 'ai&',
    baseUrl: process.env.AIAND_BASE_URL ?? '',
    apiKey: process.env.AIAND_API_KEY ?? '',
    model: process.env.AIAND_MODEL ?? '',
    jpyPer1kTokens: 0.03,
  },
  qwen: {
    name: 'qwen',
    label: 'Qwen Cloud',
    baseUrl: process.env.QWEN_BASE_URL ?? '',
    apiKey: process.env.QWEN_API_KEY ?? '',
    model: process.env.QWEN_MODEL ?? '',
    jpyPer1kTokens: 0.24,
  },
  gmi: {
    name: 'gmi',
    label: 'GMI Cloud',
    baseUrl: process.env.GMI_BASE_URL ?? '',
    apiKey: process.env.GMI_API_KEY ?? '',
    model: process.env.GMI_MODEL ?? '',
    jpyPer1kTokens: 0.09,
  },
  nosana: {
    name: 'nosana',
    label: 'Nosana',
    baseUrl: process.env.NOSANA_BASE_URL ?? '',
    apiKey: process.env.NOSANA_API_KEY ?? 'nosana',
    model: process.env.NOSANA_MODEL ?? '',
    jpyPer1kTokens: 0.0,
  },
  groq: {
    name: 'groq',
    label: 'Groq (fallback)',
    baseUrl: process.env.GROQ_BASE_URL ?? 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY ?? '',
    model: process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile',
    jpyPer1kTokens: 0.1,
  },
};

export function configured(p: Exclude<Provider, 'daytona'>): boolean {
  const c = providers[p];
  return Boolean(c.baseUrl && c.model);
}

export const fallbackEnabled = process.env.ENABLE_FALLBACK !== 'false';
