import { chat, chatJson, costJpy } from './llm';
import { configured } from './providers';
import { identify, cueSheet, indexSize, embedSource, poolFor } from './crafts';
import { readMark } from './mark';
import { runPython, serveHtml, uploadFiles, daytonaConfigured } from './sandbox';
import { fetchSources, codegenPrompt, parseStdout, comparable, searchQuery } from './comps';
import { place } from './place';
import { seed } from './seed';
import { newId, put, slugify } from './store';
import type { Comps, CraftCandidate, ForgeEvent, Lang, LocalizedCopy, Mark, Piece, Place, Story, Vision } from './types';

const LANGS: Lang[] = ['en', 'zh', 'fr', 'ko'];
const LANG_LABEL: Record<Lang, string> = { en: 'English', zh: 'Chinese', fr: 'French', ko: 'Korean' };

class Bus {
  private queue: ForgeEvent[] = [];
  private waiter?: () => void;
  private closed = false;
  push(e: ForgeEvent) {
    this.queue.push(e);
    this.waiter?.();
    this.waiter = undefined;
  }
  end() {
    this.closed = true;
    this.waiter?.();
  }
  async *stream(): AsyncGenerator<ForgeEvent> {
    for (;;) {
      if (this.queue.length) {
        yield this.queue.shift()!;
        continue;
      }
      if (this.closed) return;
      await new Promise<void>((r) => (this.waiter = r));
    }
  }
}

const totals = { calls: 0, costJpy: 0 };

export interface ForgeInput {
  imageDataUrl: string;
  images?: string[];
  transcript: string;
  heritage?: string;
  audioDataUrl?: string;
  place?: Place | null;
  storeName?: string;
  storeOrigin?: string;
  storePeople?: string;
}

export function forge(input: ForgeInput): AsyncGenerator<ForgeEvent> {
  const bus = new Bus();
  const startedAll = Date.now();
  totals.calls = 0;
  totals.costJpy = 0;

  (async () => {
    const [visionR, markR] = await Promise.allSettled([see(bus, input.imageDataUrl), mark(bus, input.imageDataUrl)]);
    const vision = visionR.status === 'fulfilled' ? visionR.value : seed.vision;
    const markData = markR.status === 'fulfilled' ? markR.value : null;

    const [compsR, storyR] = await Promise.allSettled([
      comps(bus, vision),
      story(bus, vision, markData, input.transcript, input.heritage ?? '', input.storeOrigin ?? '', input.storePeople ?? ''),
    ]);
    const compsData = compsR.status === 'fulfilled' ? compsR.value : seed.comps;
    const storyData = storyR.status === 'fulfilled' ? storyR.value : seed.story;

    const localizedR = await Promise.allSettled([localize(bus, vision, storyData)]);
    const localized = localizedR[0].status === 'fulfilled' ? localizedR[0].value : seed.localized;

    const piece = await ship(
      bus,
      {
        imageDataUrl: input.imageDataUrl,
        images: input.images?.length ? input.images : [input.imageDataUrl],
        voice: input.transcript || input.heritage ? { transcriptJa: input.transcript, heritageJa: input.heritage ?? '', audioDataUrl: input.audioDataUrl } : null,
        vision,
        mark: markData,
        comps: compsData,
        story: storyData,
        localized,
        storeOrigin: (input.storeOrigin ?? '').trim() || storyData.storeOriginJa || '',
        storePeople: (input.storePeople ?? '').trim() || storyData.storePeopleJa || '',
      },
      input.place ?? null,
      input.storeName ?? '',
    );

    bus.push({
      t: 'done',
      storefrontUrl: `/market/store/${piece.storeSlug}`,
      sandboxUrl: piece.sandboxUrl,
      piece,
      totalMs: Date.now() - startedAll,
      totalCalls: totals.calls,
      totalCostJpy: Number(totals.costJpy.toFixed(2)),
    });
    bus.end();
  })().catch(() => bus.end());

  return bus.stream();
}

const SEE_PROMPT = `You are appraising a piece of Japanese craft from a single photograph.
First decide the material class from the surface itself — wood grain and turning lines are not glaze,
woven fibre is not lacquer, vitrified glaze is not paint on wood. "materialClass" must be exactly one of:
陶磁器 / 漆器 / 木工品 / 竹工品 / 人形 / 織物 / 染色品 / 和紙 / 金工品 / その他工芸品
Then describe only what is observable, in vocabulary that fits that material: for 陶磁器 the glaze, body
and foot ring; for 木工品 the grain, lathe marks and joinery; for 織物 the weave and dye; and so on.
Be specific: "thick raised overglaze enamel, green dominant" or "lathe-turned, painted freehand on bare
wood", never "decorated". Note at most four features a collector would care about.
Do NOT name a craft tradition, kiln, region or brand. Naming is done downstream.
Return only JSON: {"objectJa":string,"materialClass":string,"material":string[],"technique":string[],"condition":string,"features":string[],"confidence":number}`;

async function see(bus: Bus, imageDataUrl: string): Promise<Vision> {
  const t0 = Date.now();
  bus.push({ t: 'step_start', id: 'see', provider: 'qwen', label: 'see', labelJa: '見る' });
  try {
    const { data, result, calls } = await chatJson<Partial<Vision> & { objectJa: string; materialClass?: string }>({
      provider: 'qwen',
      temperature: 0.2,
      timeoutMs: 20000,
      messages: [
        { role: 'system', content: 'You are a careful Japanese craft appraiser. Observation only.' },
        {
          role: 'user',
          content: [
            { type: 'text', text: SEE_PROMPT },
            { type: 'image_url', image_url: { url: imageDataUrl } },
          ],
        },
      ],
    });
    const features = (data.features ?? []).slice(0, 4);
    bus.push({ t: 'log', id: 'see', line: `${data.materialClass ?? '素材不明'} · ${features[0] ?? 'features extracted'}` });

    const pool = poolFor(data.materialClass);
    let candidates = await identify([...features, ...(data.material ?? []), ...(data.technique ?? [])], data.materialClass);
    bus.push({
      t: 'log',
      id: 'see',
      line: `${indexSize()} METI crafts → ${pool.length} in ${data.materialClass ?? 'all'} · ${embedSource()} retrieval · ${candidates
        .map((c) => `${c.craftJa} ${c.score}`)
        .join('  ')}`,
    });

    // Relative margin, because absolute scores differ by an order of magnitude
    // between the embedding backends and the lexical fallback.
    const margin = candidates[0].score > 0 ? (candidates[0].score - candidates[1]?.score) / candidates[0].score : 0;
    let ambiguous = candidates.length > 1 && margin < 0.08;
    let extraCalls = 0;
    if (ambiguous) {
      const picked = await pickCandidate(imageDataUrl, candidates);
      extraCalls = 1;
      if (picked) {
        const chosen = candidates.findIndex((c) => c.craftJa === picked);
        if (chosen > 0) candidates = [candidates[chosen], ...candidates.filter((_, k) => k !== chosen)];
        ambiguous = false;
      }
      bus.push({
        t: 'log',
        id: 'see',
        line: `margin ${(margin * 100).toFixed(1)}% → constrained pick: ${picked ?? 'inconclusive, surfacing both'}`,
      });
    }

    const vision: Vision = {
      craft: candidates[0].craft,
      craftJa: candidates[0].craftJa,
      objectJa: data.objectJa ?? '器',
      material: data.material ?? [],
      technique: data.technique ?? [],
      regionGuess: candidates[0].prefecture,
      condition: data.condition ?? '',
      features,
      confidence: typeof data.confidence === 'number' ? data.confidence : candidates[0].score,
      candidates,
      ambiguous,
    };
    record(bus, 'see', 'qwen', t0, calls + extraCalls, result.promptTokens, result.completionTokens, vision);
    return vision;
  } catch (e) {
    bus.push({ t: 'step_fail', id: 'see', provider: 'qwen', ms: Date.now() - t0, error: msg(e) });
    throw e;
  }
}

/**
 * Naming stays a constrained choice: the model may only pick from candidates the
 * index retrieved, so it cannot fall back to whichever kiln name is most famous.
 */
async function pickCandidate(imageDataUrl: string, candidates: CraftCandidate[]): Promise<string | null> {
  const names = candidates.map((c) => c.craftJa);
  try {
    const r = await chat({
      provider: 'qwen',
      temperature: 0,
      timeoutMs: 10000,
      maxTokens: 24,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `写真の品はどの伝統に最も近いか、下の候補からひとつだけ選んでください。候補以外の名前は答えないこと。判断できない場合は unknown と答えてください。
${cueSheet(names)}
答えは次のいずれかひとつだけ: ${names.join(' / ')} / unknown`,
            },
            { type: 'image_url', image_url: { url: imageDataUrl } },
          ],
        },
      ],
    });
    return names.find((n) => r.text.includes(n)) ?? null;
  } catch {
    return null;
  }
}

async function mark(bus: Bus, imageDataUrl: string): Promise<Mark> {
  const t0 = Date.now();
  bus.push({ t: 'step_start', id: 'mark', provider: 'nosana', label: 'mark', labelJa: '銘' });
  try {
    const data = await readMark(imageDataUrl);
    bus.push({ t: 'log', id: 'mark', line: data.textRaw ? `読み: ${data.reading ?? data.textRaw}` : '銘なし' });
    record(bus, 'mark', 'nosana', t0, 1, 0, 0, data);
    return data;
  } catch (e) {
    bus.push({ t: 'step_fail', id: 'mark', provider: 'nosana', ms: Date.now() - t0, error: msg(e) });
    throw e;
  }
}

async function comps(bus: Bus, vision: Vision): Promise<Comps> {
  const t0 = Date.now();
  bus.push({ t: 'step_start', id: 'comps', provider: 'daytona', label: 'comps', labelJa: '相場' });
  const query = searchQuery(vision);
  let source = seed.comps.generatedCode;
  let calls = 0;
  let tokens = { p: 0, c: 0 };

  const sources = await fetchSources(query);
  bus.push({
    t: 'log',
    id: 'comps',
    line: sources.length
      ? `${sources.map((s) => `${s.name} ${Math.round(s.html.length / 1024)}KB`).join(' · ')} → sandbox`
      : 'no search HTML retrieved',
  });

  if (configured('aiand') && sources.length) {
    try {
      const r = await chat({
        provider: 'aiand',
        model: process.env.AIAND_CODE_MODEL || undefined,
        temperature: 0.3,
        timeoutMs: 15000,
        maxTokens: 2800,
        messages: [{ role: 'user', content: codegenPrompt(query, sources) }],
      });
      const cleaned = r.text.replace(/^```(?:python)?/m, '').replace(/```\s*$/m, '').trim();
      if (cleaned.includes('print')) source = cleaned;
      calls = 1;
      tokens = { p: r.promptTokens, c: r.completionTokens };
    } catch {
      bus.push({ t: 'log', id: 'comps', line: 'codegen fell back to cached parser' });
    }
  }
  bus.push({ t: 'code', id: 'comps', source });

  try {
    if (!daytonaConfigured()) throw new Error('DAYTONA_API_KEY missing');
    await uploadFiles(sources.map((s) => ({ path: `tsugi/${s.file}`, content: s.html })));
    const { stdout } = await runPython(source, 25);
    bus.push({ t: 'log', id: 'comps', line: `stdout: ${stdout.replace(/\s+/g, ' ').slice(0, 220)}` });
    const parsed = parseStdout(stdout);
    const scraped = parsed.items.map((i) => ({
      ...i,
      url: i.url?.startsWith('http') ? i.url : (sources.find((s) => s.name === i.source)?.url ?? sources[0]?.url ?? ''),
    }));
    const items = comparable(scraped, query);
    if (!items.length) throw new Error('parser returned no listings');
    const prices = items.map((i) => i.priceJpy).sort((a, b) => a - b);
    const band: [number, number] = [pct(prices, 0.2), pct(prices, 0.8)];
    const data: Comps = {
      items,
      bandJpy: band,
      recommendedJpy: Math.round(pct(prices, 0.5) / 500) * 500,
      method: `${scraped.length}件の出品から同等品${items.length}件を抽出し20〜80パーセンタイル。${parsed.method}`.trim(),
      generatedCode: source,
    };
    bus.push({
      t: 'log',
      id: 'comps',
      line: `${scraped.length} scraped → ${items.length} comparable ¥${band[0].toLocaleString()}–¥${band[1].toLocaleString()}`,
    });
    record(bus, 'comps', 'daytona', t0, calls + 1, tokens.p, tokens.c, data);
    return data;
  } catch (e) {
    bus.push({ t: 'step_fail', id: 'comps', provider: 'daytona', ms: Date.now() - t0, error: msg(e) });
    // The band is the seed's, so say so rather than passing a Kutani method line
    // off as this piece's benchmark.
    return { ...seed.comps, generatedCode: source, method: '相場の取得に失敗したため参考値を表示しています。' };
  }
}

const STORY_PROMPT = `あなたは日本の伝統工芸の作品カードを書く職人本人です。
以下の情報から、箱書き・作品の物語・手入れの説明を書いてください。
・一人称。謙譲を保ちつつ、技術への誇りは隠さない。
・箱書きは40字以内。作品名と作者の要素のみ。銘が読めていない場合は作者名を入れず、作品名だけにする。「某」「無名」等は書かない。
・「職人の音声メモ」が「（なし）」でない場合、それが最優先の情報源である。そこで職人が実際に話した
　具体的な内容（技法・材料・工程・エピソードなど）を物語に必ず一つ以上反映すること。観察情報だけで
　一般論を書き、音声メモの内容を無視することは禁止する。
・物語は2〜3文。産地・素材・技法の具体を必ず一つ以上含める。音声メモがある場合はそれを優先する。
・誇張、マーケティング表現、「唯一無二」等の常套句は使わない。
・情報が不足している点は書かない。推測で産地を書かない。
・「家族の記憶」が与えられた場合のみ heritageJa を書く。職人が語った事実だけを2文以内で整え、
　新しい事実を足さない。語られていなければ heritageJa は空文字にする。
・お店の由来（storeOriginJa）: 「お店のこと（入力済み）」が与えられていればそれをそのまま自然な文に整える。
　入力が空で、かつ音声メモ・家族の記憶の中に工房の由来や歴史（いつ・誰が始めたか等）が語られていれば、
　その内容だけから1〜2文で抽出する。どちらにも情報がなければ空文字にする。新しい事実を作らない。
・作り手（storePeopleJa）: 「作り手（入力済み）」が与えられていればそれをそのまま自然な文に整える。
　入力が空で、かつ音声メモ・家族の記憶の中に誰がこの工房で働いているかが語られていれば、その内容だけ
　から1文で抽出する。どちらにも情報がなければ空文字にする。新しい事実を作らない。
JSONのみで返答: {"titleJa":string,"inscriptionJa":string,"storyJa":string,"careJa":string,"heritageJa":string,"storeOriginJa":string,"storePeopleJa":string}`;

async function story(
  bus: Bus,
  vision: Vision,
  markData: Mark | null,
  transcript: string,
  heritage: string,
  storeOrigin: string,
  storePeople: string,
): Promise<Story> {
  const t0 = Date.now();
  bus.push({ t: 'step_start', id: 'story', provider: 'aiand', label: 'story', labelJa: '語り' });
  const context = `産地候補: ${vision.candidates.map((c) => `${c.craftJa}(${c.prefecture}) ${c.score}`).join('、')}
不確実: ${vision.ambiguous ? 'はい — 断定しないこと' : 'いいえ'}
器種: ${vision.objectJa}／素材: ${vision.material.join('、')}／技法: ${vision.technique.join('、')}
観察: ${vision.features.join('、')}
状態: ${vision.condition}
銘: ${markData?.textRaw ?? 'なし'}（読み: ${markData?.reading ?? '—'}）
職人の音声メモ: ${transcript || '（なし）'}
家族の記憶（職人が語った内容。ここにしか存在しない情報）: ${heritage || '（なし）'}
お店のこと（入力済み。空なら音声メモ・家族の記憶から由来を探す）: ${storeOrigin || '（空）'}
作り手（入力済み。空なら音声メモ・家族の記憶から探す）: ${storePeople || '（空）'}`;
  try {
    const { data, result, calls } = await chatJson<Story>({
      provider: 'aiand',
      temperature: 0.8,
      timeoutMs: 20000,
      messages: [
        { role: 'system', content: STORY_PROMPT },
        { role: 'user', content: context },
      ],
    });
    bus.push({ t: 'log', id: 'story', line: 'すべて国内推論 · ' + data.inscriptionJa });
    record(bus, 'story', 'aiand', t0, calls, result.promptTokens, result.completionTokens, data);
    return data;
  } catch (e) {
    bus.push({ t: 'step_fail', id: 'story', provider: 'aiand', ms: Date.now() - t0, error: msg(e) });
    throw e;
  }
}

async function localize(bus: Bus, vision: Vision, storyData: Story): Promise<Record<Lang, LocalizedCopy>> {
  const t0 = Date.now();
  bus.push({ t: 'step_start', id: 'localize', provider: 'gmi', label: 'localize', labelJa: '翻訳' });
  const payload = JSON.stringify({
    craft: vision.craft,
    craftJa: vision.craftJa,
    prefecture: vision.candidates[0]?.prefecture,
    technique: vision.technique,
    titleJa: storyData.titleJa,
    storyJa: storyData.storyJa,
    careJa: storyData.careJa,
    heritageJa: storyData.heritageJa ?? '',
  });
  const results = await Promise.allSettled(
    LANGS.map((lang) =>
      chatJson<LocalizedCopy>({
        provider: 'gmi',
        temperature: 0.6,
        timeoutMs: 15000,
        messages: [
          {
            role: 'system',
            content: `Localise this Japanese craft listing for a ${LANG_LABEL[lang]} collector.
Do not translate literally. Name the one thing a buyer in this market would recognise as the reason
this object is worth its price. Keep the artisan's voice. No marketing superlatives.
Write in ${LANG_LABEL[lang]}. Include a realistic shipping and export note.
"heritage" carries what the artisan said about their family: render it in their voice, add nothing,
and return an empty string when heritageJa is empty.
Return only JSON: {"title":string,"story":string,"whyItMatters":string,"shippingNote":string,"heritage":string}`,
          },
          { role: 'user', content: payload },
        ],
      }).then((r) => ({ lang, ...r })),
    ),
  );
  const out = { ...seed.localized };
  let calls = 0;
  let p = 0;
  let c = 0;
  for (const r of results) {
    if (r.status !== 'fulfilled') continue;
    out[r.value.lang] = r.value.data;
    calls += r.value.calls;
    p += r.value.result.promptTokens;
    c += r.value.result.completionTokens;
  }
  if (!calls) {
    bus.push({ t: 'step_fail', id: 'localize', provider: 'gmi', ms: Date.now() - t0, error: 'all four calls failed' });
    return out;
  }
  bus.push({ t: 'log', id: 'localize', line: `${calls} 言語 並列 · EN 中文 FR 한국어` });
  record(bus, 'localize', 'gmi', t0, calls, p, c, out);
  return out;
}

async function ship(
  bus: Bus,
  parts: Omit<Piece, 'id' | 'createdAt' | 'priceJpy' | 'place' | 'storeName' | 'storeSlug'>,
  captured: Place | null,
  storeName: string,
): Promise<Piece> {
  const t0 = Date.now();
  bus.push({ t: 'step_start', id: 'ship', provider: 'daytona', label: 'ship', labelJa: '出荷' });
  // A GPS fix from the workshop beats the prefecture the index inferred.
  const located = captured ?? place(parts.vision.candidates[0]?.prefecture ?? '', parts.vision.regionGuess ?? '');
  const id = newId();
  const name = storeName.trim() || `${parts.vision.craftJa}工房`;
  const piece: Piece = {
    ...parts,
    id,
    storeName: name,
    storeSlug: `${slugify(name, parts.vision.craft)}-${id}`,
    priceJpy: parts.comps.recommendedJpy,
    createdAt: new Date().toISOString(),
    place: located,
  };
  if (captured?.address) bus.push({ t: 'log', id: 'ship', line: `GPS ${captured.lat?.toFixed(4)},${captured.lng?.toFixed(4)} → ${captured.address}` });
  if (daytonaConfigured()) {
    try {
      piece.sandboxUrl = await serveHtml(mirrorHtml(piece));
      bus.push({ t: 'log', id: 'ship', line: `mirrored in sandbox → ${piece.sandboxUrl}` });
    } catch {
      bus.push({ t: 'log', id: 'ship', line: 'sandbox mirror skipped' });
    }
  }
  await put(piece);
  bus.push({
    t: 'log',
    id: 'ship',
    line: `store "${piece.storeName}" live → /market/store/${piece.storeSlug}`,
  });
  bus.push({ t: 'step_done', id: 'ship', provider: 'daytona', ms: Date.now() - t0, calls: 0, costJpy: 0, data: { id: piece.id } });
  return piece;
}

function mirrorHtml(piece: Piece): string {
  return `<!doctype html><meta charset="utf-8"><title>${piece.story.titleJa}</title>
<body style="background:#E6E6DF;color:#191917;font-family:'Noto Serif JP',serif;margin:0;padding:48px">
<div style="writing-mode:vertical-rl;font-size:26px;letter-spacing:.06em;height:280px">${piece.story.inscriptionJa}</div>
<hr style="border:0;border-top:1px solid #C6C4B9;margin:24px 0">
<p style="font-size:14px;line-height:2;max-width:34em">${piece.story.storyJa}</p>
<p style="font-size:14px;line-height:1.8;max-width:40em">${piece.localized.en.story}</p>
<div style="font-size:10px;letter-spacing:.1em;color:#6E6E68">COMPARABLE ¥${piece.comps.bandJpy[0].toLocaleString()}–¥${piece.comps.bandJpy[1].toLocaleString()}</div>
<div style="font-size:30px;color:#A8342A">¥${piece.priceJpy.toLocaleString()}</div>
<div style="font-size:10px;color:#6E6E68;margin-top:32px">継 TSUGI · served from a Daytona sandbox · /s/${piece.id}</div>`;
}

function record(
  bus: Bus,
  id: 'see' | 'mark' | 'comps' | 'story' | 'localize',
  provider: 'qwen' | 'nosana' | 'daytona' | 'aiand' | 'gmi',
  t0: number,
  calls: number,
  promptTokens: number,
  completionTokens: number,
  data: unknown,
) {
  const billed = provider === 'daytona' ? 'aiand' : provider;
  const cost = costJpy(billed as 'aiand', promptTokens, completionTokens);
  totals.calls += calls;
  totals.costJpy += cost;
  bus.push({ t: 'step_done', id, provider, ms: Date.now() - t0, calls, costJpy: Number(cost.toFixed(3)), data });
}

function pct(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  return sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
}

function msg(e: unknown): string {
  return e instanceof Error ? e.message : 'failed';
}
