import type { CompItem } from './types';

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';
const MAX_BYTES = 700_000;

export interface Source {
  name: string;
  file: string;
  html: string;
  url: string;
}

/**
 * Daytona sandboxes have no general egress (package registries only), so the
 * search pages are fetched here and handed to the sandbox as files. The agent's
 * parser still runs where untrusted HTML cannot touch the app server.
 */
export async function fetchSources(query: string): Promise<Source[]> {
  const targets = [
    { name: 'Yahoo Auctions', file: 'yahoo.html', url: `https://auctions.yahoo.co.jp/search/search?p=${encodeURIComponent(query)}&n=50` },
    { name: 'Mercari', file: 'mercari.html', url: `https://jp.mercari.com/search?keyword=${encodeURIComponent(query)}` },
  ];
  const results = await Promise.allSettled(
    targets.map(async (t) => {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 6000);
      try {
        const res = await fetch(t.url, {
          headers: { 'user-agent': UA, 'accept-language': 'ja,en;q=0.8' },
          signal: ctrl.signal,
        });
        const html = (await res.text()).slice(0, MAX_BYTES);
        return { ...t, html };
      } finally {
        clearTimeout(timer);
      }
    }),
  );
  return results.filter((r) => r.status === 'fulfilled' && r.value.html.length > 1000).map((r) => (r as PromiseFulfilledResult<Source>).value);
}

/**
 * Marketplace sellers write 「こけし」, not 「宮城伝統こけし」, and a four-term query
 * returns nothing. Strip the designation prefix and drop redundant terms.
 */
export function searchQuery(v: { craftJa: string; objectJa: string; technique: string[]; regionGuess: string | null }): string {
  const pref = (v.regionGuess ?? '').replace(/[都道府県]$/, '');
  const name = (pref ? v.craftJa.replace(pref, '') : v.craftJa).replace('伝統', '');
  const parts = [name];
  // Technique words are deliberately left out: 「旋盤加工」 pulls in lathe tooling,
  // and the object name already narrows the search enough.
  if (!name.includes(v.objectJa) && !v.objectJa.includes(name)) parts.push(v.objectJa);
  return parts.join(' ').trim();
}

// The craft name itself is often written without its prefecture prefix in listings
// (こけし for 宮城伝統こけし), so the tail of each token is what a title match can rely on.
export function keywords(query: string): string[] {
  const parts = query.split(/\s+/).filter(Boolean);
  const out = new Set<string>();
  for (const p of parts) {
    out.add(p);
    if (p.length > 4) out.add(p.slice(-3));
  }
  return [...out].slice(0, 6);
}

export function codegenPrompt(query: string, sources: Source[]): string {
  return `Write a self-contained Python 3 script (standard library only: json, re, html) that extracts
comparable resale listings for "${query}" from search-result HTML that has already been downloaded
for you. There is NO network access in this sandbox — do not import urllib or attempt any request.

Files, relative to the working directory:
${sources.map((s) => `  tsugi/${s.file}  — ${s.name} search results (${Math.round(s.html.length / 1024)} KB)`).join('\n')}

Yahoo Auctions puts structured attributes on each result's anchor. They sit on separate lines with
OTHER attributes in between, so a single regex requiring them to be adjacent will match nothing:
  <a class="Product__imageLink ..."
     data-auction-id="w1235748888"
     data-auction-category="2084060159"
     data-auction-title="骨董 九谷焼 川田稔 赤小紋 盃 色絵 金彩"
     data-auction-img="https://..."
     data-auction-price="1210"          <- current price, integer yen, no commas
The reliable recipe: split the file on 'data-auction-id="' and for each chunk read the id up to the
next '"', then search that chunk for data-auction-title="..." and data-auction-price="...".
The item URL is https://page.auctions.yahoo.co.jp/jp/auction/<data-auction-id>.
Each anchor repeats twice per result, so de-duplicate by auction id.
Mercari's markup differs and may yield nothing — that is acceptable, skip it silently.

Rules: unescape HTML entities, strip commas from prices, drop anything outside 500..3000000 yen,
de-duplicate by title, keep at most 30 items. Do not filter by keyword — extract everything you find.
Keep the script under 80 lines: no comments, no helper classes, no argparse. Brevity matters more than defence.
Print exactly one JSON object to stdout:
{"items":[{"title":str,"priceJpy":int,"url":str,"source":str}],"method":str}
"method" is one human-readable sentence in Japanese describing how the numbers were derived.
Fail closed: print {"items":[],"method":"..."} on any error. Return only the Python source, no fences.`;
}

export function parseStdout(stdout: string): { items: CompItem[]; method: string } {
  const start = stdout.indexOf('{');
  const end = stdout.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('no JSON on stdout');
  const parsed = JSON.parse(stdout.slice(start, end + 1)) as { items?: CompItem[]; method?: string };
  const items = (parsed.items ?? []).filter((i) => Number.isFinite(i.priceJpy) && i.priceJpy > 500 && i.priceJpy < 3_000_000);
  return { items, method: parsed.method ?? '' };
}

const LOTS = ['セット', 'まとめ', '一括', '大量', 'ペア', '２個', '2個', '3個', '体', '客揃'];
const JUNK = ['ジャンク', '訳あり', '難あり', '割れ', '修理', '空箱', '箱のみ', 'レプリカ', '印刷', 'ポスター', '写真'];

/**
 * Comparability is a business rule, not a parsing concern, so it stays here in code
 * we control: a lot of nine dolls and a souvenir keyring are not comps for one piece.
 */
export function comparable(items: CompItem[], query: string): CompItem[] {
  const keys = keywords(query);
  const onTopic = items.filter(
    (i) => keys.some((k) => i.title.includes(k)) && !LOTS.some((w) => i.title.includes(w)) && !JUNK.some((w) => i.title.includes(w)),
  );
  const pool = onTopic.length >= 3 ? onTopic : items;
  const sorted = [...pool].sort((a, b) => a.priceJpy - b.priceJpy);
  const median = sorted[Math.floor(sorted.length / 2)]?.priceJpy ?? 0;
  const trimmed = pool.filter((i) => i.priceJpy >= median * 0.3);
  return (trimmed.length >= 3 ? trimmed : pool).slice(0, 12);
}
