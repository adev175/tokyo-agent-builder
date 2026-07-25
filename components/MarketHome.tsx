'use client';

import { useMemo, useState } from 'react';
import { useLang, LANGS } from '@/lib/i18n';
import { yen } from '@/lib/cart';
import CartBadge from './CartBadge';
import type { Piece } from '@/lib/types';

const CATEGORY_EN: Record<string, string> = {
  陶磁器: 'Ceramics',
  漆器: 'Lacquer',
  木工品: 'Wood',
  竹工品: 'Bamboo',
  人形: 'Dolls',
  織物: 'Textiles',
  染色品: 'Dyework',
  和紙: 'Paper',
  金工品: 'Metal',
  その他工芸品: 'Other',
};

export default function MarketHome({ pieces }: { pieces: Piece[] }) {
  const { lang, setLang, t } = useLang();
  const [q, setQ] = useState('');

  const prefectures = useMemo(() => new Set(pieces.map((p) => p.place?.prefecture).filter(Boolean)).size, [pieces]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of pieces) {
      const cat = p.vision.candidates[0]?.category || 'その他工芸品';
      counts.set(cat, (counts.get(cat) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [pieces]);

  const regions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of pieces) {
      const pref = p.place?.prefecture;
      if (pref) counts.set(pref, (counts.get(pref) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [pieces]);

  const query = q.trim().toLowerCase();
  const matches = (p: Piece) => {
    if (!query) return true;
    const cat = p.vision.candidates[0]?.category ?? '';
    const hay = [
      p.storeName,
      p.vision.craft,
      p.vision.craftJa,
      p.vision.objectJa,
      cat,
      CATEGORY_EN[cat] ?? '',
      p.place?.prefecture,
      p.place?.city,
      p.localized[lang]?.title,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return hay.includes(query);
  };
  const filtered = pieces.filter(matches);

  return (
    <main className="bg-paper min-h-screen">
      <header className="bg-panel border-rule sticky top-0 z-10 flex items-center gap-3 border-b px-6 py-4">
        <a href="/" className="flex items-baseline gap-2">
          <span className="jp text-shu text-[19px] leading-none">継</span>
          <span className="mono text-[14px] tracking-[0.16em]">TSUGI</span>
        </a>
        <nav className="ml-6 hidden items-center gap-5 lg:flex">
          <a href="#categories" className="field-label normal-case">
            {t('navCategories')}
          </a>
          <a href="#stores" className="field-label normal-case">
            {t('navStores')}
          </a>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden gap-1.5 sm:flex">
            {LANGS.map((l) => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className={`jp border-line rounded-[2px] border px-2 py-1 text-[12px] ${lang === l.id ? 'bg-sumi text-field' : 'text-ash'}`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <a href="/forge" className="field-label border-line hidden rounded-[2px] border px-3 py-1.5 sm:block">
            {t('becomeASeller')}
          </a>
          <CartBadge />
        </div>
      </header>

      <div className="bg-panel border-rule border-b px-6 py-14 text-center">
        <span className="field-label">{t('marketKicker')}</span>
        <h1 className="jp text-ink mt-3 text-[clamp(30px,5vw,50px)] leading-tight">{t('marketHeadline')}</h1>
        <p className="text-ash mx-auto mt-3 max-w-[540px] text-[15px] leading-[1.75]">{t('marketSubhead')}</p>

        <div className="border-line bg-field mx-auto mt-8 flex max-w-[640px] items-stretch overflow-hidden rounded-[3px] border shadow-sm">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-[15px] outline-none"
          />
          <button className="field-label bg-shu text-field px-6 normal-case">{t('searchButton')}</button>
        </div>

        {categories.length ? (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="field-label normal-case">{t('popular')}</span>
            {categories.slice(0, 5).map(([cat]) => (
              <button
                key={cat}
                onClick={() => setQ(cat)}
                className="jp border-line rounded-full border px-3 py-1.5 text-[13px]"
              >
                {cat}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mono text-dust mt-8 flex items-baseline justify-center gap-6 text-[12px]">
          <span>
            <span className="text-ink">{pieces.length}</span> {t('statMakers')}
          </span>
          <span>
            <span className="text-ink">{pieces.length}</span> {t('statPiecesLive')}
          </span>
          <span>
            <span className="text-ink">{prefectures}</span> {t('statPrefectures')}
          </span>
        </div>
      </div>

      {query ? (
        <div className="border-rule bg-field flex items-center justify-between border-b px-6 py-3">
          <span className="mono text-[12px]">
            {filtered.length} {t('resultsFor')} &ldquo;{q.trim()}&rdquo;
          </span>
          <button onClick={() => setQ('')} className="field-label text-shu normal-case">
            {t('clear')}
          </button>
        </div>
      ) : null}

      <div id="categories" className="mx-auto max-w-[1200px] px-6 pt-11">
        <SectionHeader jp={t('categoriesJp')} en={t('navCategories')} />
        <div className="mt-4 grid grid-cols-2 gap-2.5 md:grid-cols-4">
          {categories.map(([cat, count]) => (
            <button
              key={cat}
              onClick={() => setQ(cat)}
              className="border-line bg-field flex items-center justify-between gap-2 rounded-[2px] border px-3.5 py-3"
            >
              <span className="flex items-baseline gap-2">
                <span className="jp text-ink text-[15px]">{cat}</span>
                <span className="text-ash text-[12px]">{CATEGORY_EN[cat] ?? cat}</span>
              </span>
              <span className="mono text-dust text-[11px]">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {regions.length ? (
        <div className="mx-auto max-w-[1200px] px-6 pt-9">
          <SectionHeader jp={t('byRegion')} en={t('byRegionEn')} />
          <div className="mt-3.5 flex gap-2 overflow-x-auto pb-1">
            {regions.map(([pref, count]) => (
              <button
                key={pref}
                onClick={() => setQ(pref)}
                className="border-line flex flex-none items-baseline gap-2 rounded-full border px-3.5 py-2"
              >
                <span className="jp text-[13px]">{pref}</span>
                <span className="mono text-dust text-[11px]">{count}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-[1200px] px-6 pt-11">
        <SectionHeader jp={t('trendingJp')} en={t('trendingEn')} />
        {filtered.length ? (
          <div className="mt-[18px] grid grid-cols-2 gap-x-[18px] gap-y-7 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => (
              <a key={p.id} href={`/market/store/${p.storeSlug}`} className="text-sumi flex flex-col gap-2">
                <div className="border-rule bg-plate relative aspect-square w-full overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.images?.[0] ?? p.imageDataUrl} alt={p.vision.craft} className="h-full w-full object-cover" />
                </div>
                <span className="jp text-ink text-[14px] leading-tight">
                  {p.vision.craftJa}　{p.vision.objectJa}
                </span>
                <span className="text-ash text-[12px] leading-snug">
                  {p.storeName} · {p.place?.prefecture ?? ''}
                </span>
                <span className="jp text-shu text-[15px]">{yen(p.priceJpy)}</span>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-ash mt-5 text-[14px]">
            {t('noResultsPieces')} &ldquo;{q.trim()}&rdquo;.
          </p>
        )}
      </div>

      <div id="stores" className="mx-auto max-w-[1200px] px-6 pt-12">
        <SectionHeader jp={t('storesJp')} en={t('storesEn')} />
        {filtered.length ? (
          <div className="mt-4 grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <a
                key={p.id}
                href={`/market/store/${p.storeSlug}`}
                className="border-line bg-field flex items-center gap-4 rounded-[2px] border px-4 py-4"
              >
                <div className="border-rule bg-plate h-16 w-16 flex-none overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.images?.[0] ?? p.imageDataUrl} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="jp text-ink text-[15px] leading-tight">{p.storeName}</div>
                  <div className="text-ash mt-0.5 text-[12px]">{p.localized[lang]?.title ?? p.vision.craft}</div>
                  <div className="field-label mt-1 normal-case">
                    {p.place ? `${p.place.prefecture}${p.place.city}` : ''} · 1 {t('piecesLive').toLowerCase()}
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-ash mt-5 text-[14px]">
            {t('noResultsStores')} &ldquo;{q.trim()}&rdquo;.
          </p>
        )}
      </div>

      <div className="bg-sumi mt-14 px-6 py-12">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="field-label">{t('sellKicker')}</span>
            <h2 className="jp text-field mt-3 text-[clamp(24px,3vw,32px)] leading-snug">{t('sellHeadline')}</h2>
            <p className="mt-3 max-w-[440px] text-[14px] leading-[1.75] text-[#b5b1a8]">{t('sellSubhead')}</p>
          </div>
          <div>
            <div className="flex flex-col gap-2.5">
              {[t('sellStep1'), t('sellStep2'), t('sellStep3')].map((step, i) => (
                <div key={i} className="flex items-baseline gap-2.5">
                  <span className="mono text-shu text-[11px]">0{i + 1}</span>
                  <span className="text-[13px] text-[#d6d3ca]">{step}</span>
                </div>
              ))}
            </div>
            <a href="/forge" className="field-label bg-shu text-field mt-6 block max-w-[380px] rounded-[2px] py-3.5 text-center normal-case">
              {t('applyToSell')}
            </a>
          </div>
        </div>
      </div>

      <footer className="border-rule flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4">
        <span className="mono text-dust text-[11px]">継 TSUGI · {t('footerTag')} · © 2026</span>
        <div className="flex items-center gap-4">
          <a href="#stores" className="field-label normal-case">
            {t('navStores')}
          </a>
          <a href="/cart" className="field-label normal-case">
            {t('cart')}
          </a>
          <a href="/forge" className="field-label text-shu normal-case">
            {t('becomeASeller')}
          </a>
        </div>
      </footer>
    </main>
  );
}

function SectionHeader({ jp, en }: { jp: string; en: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="jp text-ink text-[21px]">{jp}</span>
      <span className="field-label">{en}</span>
    </div>
  );
}
