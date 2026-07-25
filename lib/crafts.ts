import raw from './crafts.data.json';
import type { CraftCandidate } from './types';

interface CraftRow {
  craftJa: string;
  craft: string;
  prefecture: string;
  category: string;
  materials: string[];
  techniques: string[];
  visualCues: string[];
}

const rows = raw as CraftRow[];
const docs = rows.map(
  (r) =>
    `${r.craftJa} ${r.craft}。${r.prefecture} ${r.category}。素材: ${r.materials.join('、')}。技法: ${r.techniques.join('、')}。特徴: ${r.visualCues.join('。')}`,
);

const g = globalThis as unknown as { __tsugiIndex?: Promise<number[][]>; __tsugiEmbedSource?: string };

export function indexSize(): number {
  return rows.length;
}

export function embedSource(): string {
  return g.__tsugiEmbedSource ?? 'lexical';
}

// Material is the one thing a photograph shows reliably — wood grain is not glaze —
// so it gates the candidate pool. Neighbouring categories stay in because lacquer
// sits on wood and dolls are turned from it.
const KIN: Record<string, string[]> = {
  陶磁器: ['陶磁器'],
  漆器: ['漆器', '木工品'],
  木工品: ['木工品', '人形', '漆器', '竹工品'],
  竹工品: ['竹工品', '木工品'],
  人形: ['人形', '木工品', '染色品'],
  織物: ['織物', '染色品'],
  染色品: ['染色品', '織物'],
  和紙: ['和紙', 'その他工芸品'],
  金工品: ['金工品'],
};

export function poolFor(materialClass?: string): number[] {
  const allowed = materialClass ? KIN[materialClass] : undefined;
  const gated = allowed ? rows.map((_, i) => i).filter((i) => allowed.includes(rows[i].category)) : [];
  return gated.length >= 4 ? gated : rows.map((_, i) => i);
}

export async function identify(features: string[], materialClass?: string): Promise<CraftCandidate[]> {
  const query = features.join('。');
  const pool = poolFor(materialClass);
  const lex = pool.map((i) => lexical(query, docs[i]));
  let cos: number[] | null = null;
  try {
    const index = await getIndex();
    const [q] = await embed([query]);
    cos = pool.map((i) => cosine(index[i], q));
  } catch {
    g.__tsugiEmbedSource = 'lexical';
  }
  // Raw cosines over these documents sit in a narrow band around 0.5, so both
  // signals are min-max normalised before blending or the margin means nothing.
  const nLex = normalize(lex);
  const nCos = cos ? normalize(cos) : null;
  const blended = pool.map((_, k) => (nCos ? 0.65 * nCos[k] + 0.35 * nLex[k] : nLex[k]));
  return top3(blended.map((score, k) => ({ i: pool[k], score })));
}

function normalize(v: number[]): number[] {
  const min = Math.min(...v);
  const max = Math.max(...v);
  return max > min ? v.map((x) => (x - min) / (max - min)) : v.map(() => 0);
}

function top3(scored: { i: number; score: number }[]): CraftCandidate[] {
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ i, score }) => ({
      craftJa: rows[i].craftJa,
      craft: rows[i].craft,
      prefecture: rows[i].prefecture,
      category: rows[i].category,
      score: Number(score.toFixed(3)),
    }));
}

export function rowFor(craftJa: string): CraftRow | undefined {
  return rows.find((r) => r.craftJa === craftJa);
}

export function cueSheet(craftJa: string[]): string {
  return craftJa
    .map((name) => {
      const r = rowFor(name);
      return r ? `${r.craftJa} (${r.prefecture}) — ${r.techniques.join('、')}。${r.visualCues.join('。')}` : name;
    })
    .join('\n');
}

function getIndex(): Promise<number[][]> {
  if (!g.__tsugiIndex) {
    g.__tsugiIndex = embed(docs).catch((e) => {
      g.__tsugiIndex = undefined;
      throw e;
    });
  }
  return g.__tsugiIndex;
}

async function embed(inputs: string[]): Promise<number[][]> {
  const targets = [
    {
      source: 'nosana',
      baseUrl: process.env.NOSANA_BASE_URL,
      key: process.env.NOSANA_API_KEY ?? 'nosana',
      model: process.env.NOSANA_EMBED_MODEL || process.env.NOSANA_MODEL,
    },
    {
      source: 'gmi',
      baseUrl: process.env.GMI_BASE_URL,
      key: process.env.GMI_API_KEY,
      model: process.env.GMI_EMBED_MODEL,
    },
    {
      source: 'qwen',
      baseUrl: process.env.QWEN_BASE_URL,
      key: process.env.QWEN_API_KEY,
      model: process.env.QWEN_EMBED_MODEL || 'text-embedding-v4',
    },
  ].filter((t) => t.baseUrl && t.model);

  for (const t of targets) {
    try {
      const vecs: number[][] = [];
      // Batch of 10 is the smallest documented per-request limit across these endpoints.
      for (let i = 0; i < inputs.length; i += 10) {
        const slice = inputs.slice(i, i + 10);
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 6000);
        const res = await fetch(`${t.baseUrl!.replace(/\/$/, '')}/embeddings`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: `Bearer ${t.key}` },
          body: JSON.stringify({ model: t.model, input: slice, dimensions: 512 }),
          signal: ctrl.signal,
        }).finally(() => clearTimeout(timer));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = (await res.json()) as { data?: { embedding: number[] }[] };
        const batch = body.data?.map((d) => d.embedding);
        if (!batch || batch.length !== slice.length) throw new Error('short batch');
        vecs.push(...batch);
      }
      g.__tsugiEmbedSource = t.source;
      return vecs;
    } catch {
      continue;
    }
  }
  throw new Error('no embedding endpoint available');
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

function lexical(query: string, doc: string): number {
  const q = query.toLowerCase();
  const words = q.split(/[^a-z\u3040-\u30ff\u4e00-\u9faf]+/).filter((w) => w.length > 2);
  const grams = new Set<string>(words);
  for (const w of q.match(/[\u3040-\u9faf]{2,}/g) ?? []) {
    for (let i = 0; i < w.length - 1; i++) grams.add(w.slice(i, i + 2));
  }
  const d = doc.toLowerCase();
  let hits = 0;
  for (const gram of grams) if (d.includes(gram)) hits++;
  return grams.size ? hits / grams.size : 0;
}
