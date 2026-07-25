'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import PhotoCarousel from './PhotoCarousel';
import ShareSheet from './ShareSheet';
import PieceMap from './PieceMap';
import CartBadge from './CartBadge';
import { addToCart, yen } from '@/lib/cart';
import { useLang, LANGS } from '@/lib/i18n';
import type { Piece } from '@/lib/types';

export default function Storefront({ piece }: { piece: Piece }) {
  const { lang, setLang, t } = useLang();
  const [qr, setQr] = useState('');
  const [share, setShare] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [url, setUrl] = useState(`/market/store/${piece.storeSlug}`);
  const copy = piece.localized[lang];
  const v = piece.vision;
  const seal = piece.mark?.textRaw?.replace(/\s/g, '') ?? null;

  useEffect(() => {
    const full = `${window.location.origin}/market/store/${piece.storeSlug}`;
    setUrl(full);
    QRCode.toDataURL(full, { margin: 0, width: 240, color: { dark: '#23211e', light: '#f2efe8' } }).then(setQr);
  }, [piece.storeSlug]);

  function add() {
    addToCart(
      {
        id: piece.id,
        storeSlug: piece.storeSlug,
        nameJp: `${v.craftJa}　${v.objectJa}`,
        nameEn: copy.title,
        priceJpy: piece.priceJpy,
        image: piece.imageDataUrl,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <article className="bg-paper mx-auto flex min-h-full w-full max-w-[1040px] flex-col">
      <header className="bg-panel border-rule sticky top-0 z-10 flex items-center justify-between gap-3 border-b px-6 py-4">
        <div className="flex items-baseline gap-2">
          <span className="jp text-shu text-[21px] leading-none">継</span>
          <span className="mono text-[15px] tracking-[0.16em]">TSUGI</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="field-label normal-case">
            {v.candidates[0]?.prefecture ?? ''} · {piece.storeName}
          </span>
          <CartBadge />
        </div>
      </header>

      <section className="flex flex-col gap-7 px-6 pt-7 md:flex-row md:gap-9">
        <PhotoCarousel images={piece.images?.length ? piece.images : [piece.imageDataUrl]} alt={v.craft} />
        <div className="flex flex-1 items-start justify-end gap-4">
          <div className="jp flex flex-row-reverse items-start gap-4">
            <div className="text-ink vertical h-[230px] text-[40px] leading-[1.16] tracking-[0.06em] md:h-[250px] md:text-[44px]">
              {v.craftJa}　{v.objectJa}
            </div>
            <div className="text-ash vertical h-[230px] pt-1 text-[22px] leading-[1.2] tracking-[0.08em] md:h-[250px] md:text-[25px]">
              {v.technique[0] ?? ''}
            </div>
            {piece.place ? (
              <div className="text-dust vertical h-[230px] pt-1 text-[13px] leading-[1.9] tracking-[0.06em] md:h-[250px]">
                {piece.place.prefecture}
                {piece.place.city}
                {seal ? `　銘 ${seal}` : ''}
              </div>
            ) : null}
          </div>
          {seal ? <div className="seal h-[50px] w-[50px] flex-none text-[22px]">{seal.slice(0, 2)}</div> : null}
        </div>
      </section>

      {v.ambiguous ? (
        <p className="jp text-ash px-6 pt-6 text-[13px]">
          likely {v.candidates[0]?.craftJa}, possibly {v.candidates[1]?.craftJa} — 産地は断定していません
        </p>
      ) : null}

      <section className="border-rule mt-7 grid grid-cols-2 gap-y-5 border-t px-6 pt-6 md:grid-cols-4">
        <Field label={t('kiln')} value={v.craft} sub={v.candidates[0]?.prefecture} />
        <Field label={t('technique')} value={v.technique.slice(0, 2).join(' / ') || '—'} sub={v.objectJa} />
        <Field label={t('body')} value={v.material.slice(0, 2).join(' / ') || '—'} />
        <Field label={t('condition')} value={v.condition.slice(0, 20) || '—'} sub={`conf ${v.confidence.toFixed(2)}`} />
      </section>

      <section className="border-rule mt-7 grid grid-cols-1 gap-7 border-t px-6 pt-7 md:grid-cols-2 md:gap-9">
        <p className="jp text-ink text-[17px] leading-[2.05] tracking-[0.01em]">{piece.story.storyJa}</p>
        <div>
          <div className="mb-4 flex gap-2">
            {LANGS.map((l) => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className={`jp border-line rounded-[2px] border px-2.5 py-1 text-[12px] ${
                  lang === l.id ? 'bg-sumi text-field' : 'text-ash'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <h1 className="text-[16px] font-medium">{copy.title}</h1>
          <p className="text-ash mt-3 text-[15px] leading-[1.75]">{copy.story}</p>
          <p className="text-dust mt-4 text-[14px] leading-[1.7]">{copy.whyItMatters}</p>
        </div>
      </section>

      {piece.story.heritageJa || piece.voice?.heritageJa ? (
        <section className="border-rule mt-8 grid grid-cols-1 gap-7 border-t px-6 pt-7 md:grid-cols-2 md:gap-9">
          <div>
            <span className="field-label">職人の言葉 · in the artisan&apos;s words</span>
            <p className="jp text-ink mt-3.5 text-[17px] leading-[2.05]">
              {piece.story.heritageJa || piece.voice?.heritageJa}
            </p>
            {piece.voice?.audioDataUrl ? (
              <audio controls src={piece.voice.audioDataUrl} className="mt-4 h-9 w-full max-w-[320px]" />
            ) : null}
          </div>
          {copy.heritage ? <p className="text-ash self-end text-[15px] leading-[1.75]">{copy.heritage}</p> : null}
        </section>
      ) : null}

      <section className="border-rule mt-8 grid grid-cols-1 gap-7 border-t px-6 pt-7 pb-9 md:grid-cols-2 md:gap-9">
        <div>
          <span className="field-label">{t('theWorkshop')}</span>
          {piece.place ? <PieceMap place={piece.place} /> : null}
          <p className="jp text-ash mt-2.5 text-[14px] leading-[1.8]">{piece.place?.note}</p>
        </div>
        <div>
          <span className="field-label">{t('shippingAndCare')}</span>
          <p className="text-ash mt-3.5 text-[14px] leading-[1.7]">{copy.shippingNote}</p>
          <p className="jp text-ash mt-3 text-[14px] leading-[1.9]">{piece.story.careJa}</p>
          <p className="jp text-dust mt-3 text-[13px] leading-[1.8]">{piece.comps.method}</p>
        </div>
      </section>

      <footer className="bg-panel border-rule sticky bottom-0 z-10 mt-auto flex flex-col gap-3 border-t px-6 py-4">
        <div className="flex items-end justify-between gap-5">
          <div className="flex flex-col gap-1.5">
            <span className="mono text-dust text-[11px]">
              {t('comparable')} {yen(piece.comps.bandJpy[0])}–{yen(piece.comps.bandJpy[1])} · {piece.comps.items.length} {t('live')}
            </span>
            <span className="jp text-shu text-[32px] leading-none md:text-[36px]">{yen(piece.priceJpy)}</span>
          </div>
          <button onClick={() => setShare(true)} className="flex flex-none flex-col items-center gap-1.5">
            {qr ? <img src={qr} alt="" className="h-[58px] w-[58px]" /> : <div className="h-[58px] w-[58px]" />}
            <span className="mono text-dust text-[10px]">/{piece.storeSlug}</span>
          </button>
        </div>
        <div className="flex items-stretch gap-3">
          <div className="border-line bg-field flex flex-none items-center rounded-[2px] border">
            <button className="w-10 text-[18px]" onClick={() => setQty(Math.max(1, qty - 1))}>
              −
            </button>
            <span className="mono min-w-[32px] text-center text-[15px]">{qty}</span>
            <button className="w-10 text-[18px]" onClick={() => setQty(qty + 1)}>
              +
            </button>
          </div>
          <button onClick={add} className="field-label bg-shu text-field flex-1 rounded-[2px] py-3.5">
            {added ? `✓ ${t('added')}` : t('addToCart')}
          </button>
          <button onClick={() => setShare(true)} className="field-label border-line rounded-[2px] border px-3.5">
            {t('share')}
          </button>
        </div>
      </footer>

      {share ? <ShareSheet url={url} qr={qr} onClose={() => setShare(false)} /> : null}
    </article>
  );
}

function Field({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-1.5 pr-4">
      <span className="field-label">{label}</span>
      <span className="text-[17px] leading-tight">{value}</span>
      {sub ? <span className="jp text-dust text-[13px]">{sub}</span> : null}
    </div>
  );
}
