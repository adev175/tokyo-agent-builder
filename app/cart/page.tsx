'use client';

import { useState } from 'react';
import { useCart, yen, SHIPPING_JPY } from '@/lib/cart';
import { useLang } from '@/lib/i18n';

export default function Cart() {
  const { t } = useLang();
  const [lines, write] = useCart();
  const [placed, setPlaced] = useState(false);
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.priceJpy * l.qty, 0);
  const shipping = lines.length ? SHIPPING_JPY : 0;
  const update = (i: number, qty: number) => {
    setPlaced(false);
    write(lines.map((l, k) => (k === i ? { ...l, qty: Math.max(1, qty) } : l)));
  };

  return (
    <div className="bg-bg flex min-h-screen justify-center">
      <div className="bg-paper flex min-h-screen w-full max-w-[480px] flex-col lg:max-w-[1080px] lg:grid lg:grid-cols-[7fr_5fr] lg:items-start lg:gap-x-8 lg:px-6">
        <header className="bg-panel border-rule sticky top-0 z-10 flex items-center justify-between border-b px-5 py-4 lg:col-span-2 lg:px-0">
          <a href="/market" className="mono text-sumi text-[12px] tracking-[0.06em]">
            ‹ {t('backToMarket')}
          </a>
          <div className="flex items-baseline gap-2">
            <span className="jp text-shu text-[21px] leading-none">継</span>
            <span className="mono text-[15px] tracking-[0.16em]">TSUGI</span>
          </div>
        </header>

        <div className="flex items-baseline justify-between px-5 pt-6 lg:col-start-1 lg:px-0">
          <div className="flex items-baseline gap-3">
            <span className="jp text-ink text-[28px]">買い物籠</span>
            <span className="field-label">{t('cart')}</span>
          </div>
          <span className="mono text-dust text-[12px]">
            {count} {count === 1 ? 'item' : 'items'}
          </span>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-col items-center gap-3.5 px-5 py-[72px] lg:col-start-1 lg:px-0">
            <span className="jp text-rule text-[54px]">空</span>
            <span className="text-ash text-[15px]">{t('cartEmpty')}</span>
            <a href="/market" className="field-label">
              {t('continueBrowsing')}
            </a>
          </div>
        ) : (
          <div className="flex flex-col px-5 pt-5 lg:col-start-1 lg:px-0">
            {lines.map((l, i) => (
              <div key={l.id} className="border-rule flex gap-4 border-t py-4">
                <div className="border-line bg-plate h-[74px] w-[74px] flex-none overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.image} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <a href={`/market/store/${l.storeSlug}`} className="jp text-ink text-[17px] tracking-[0.04em]">
                    {l.nameJp}
                  </a>
                  <span className="text-ash text-[13px]">{l.nameEn}</span>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="border-line bg-field flex items-center rounded-[2px] border">
                      <button className="h-[30px] w-8 text-[15px]" onClick={() => update(i, l.qty - 1)}>
                        −
                      </button>
                      <span className="mono min-w-[26px] text-center text-[13px]">{l.qty}</span>
                      <button className="h-[30px] w-8 text-[15px]" onClick={() => update(i, l.qty + 1)}>
                        +
                      </button>
                    </div>
                    <span className="jp text-[17px]">{yen(l.priceJpy * l.qty)}</span>
                  </div>
                </div>
                <button
                  aria-label="Remove item"
                  className="text-dust flex-none self-start p-1"
                  onClick={() => write(lines.filter((_, k) => k !== i))}
                >
                  ✕
                </button>
              </div>
            ))}

            <div className="border-rule flex flex-col gap-2.5 border-t pt-5 pb-2 lg:hidden">
              <Row label={t('subtotal')} value={yen(subtotal)} />
              <Row label={t('shipping')} value={yen(shipping)} />
              <Row label={t('importDuties')} value={t('atCheckout')} dim />
            </div>
          </div>
        )}

        <footer className="bg-panel border-rule sticky bottom-0 z-10 mt-auto flex flex-col gap-3 border-t px-5 py-4 lg:sticky lg:top-24 lg:col-start-2 lg:row-start-2 lg:mt-8 lg:self-start lg:rounded-[2px] lg:border">
          <div className="hidden flex-col gap-2.5 lg:flex">
            <Row label={t('subtotal')} value={yen(subtotal)} />
            <Row label={t('shipping')} value={yen(shipping)} />
            <Row label={t('importDuties')} value={t('atCheckout')} dim />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="field-label">{t('total')}</span>
            <span className="jp text-shu text-[30px] leading-none">{yen(subtotal + shipping)}</span>
          </div>
          <button
            disabled={!lines.length}
            onClick={() => setPlaced(true)}
            className="field-label bg-shu text-field w-full rounded-[2px] py-4 disabled:bg-[color:var(--dust)]"
          >
            {placed ? t('orderPlaced') : t('checkout')}
          </button>
          <span className="text-dust text-center text-[12px]">{t('shipsWorldwide')}</span>
        </footer>
      </div>
    </div>
  );
}

function Row({ label, value, dim }: { label: string; value: string; dim?: boolean }) {
  return (
    <div className={`flex justify-between ${dim ? 'text-dust text-[13px]' : 'text-ash text-[14px]'}`}>
      <span>{label}</span>
      <span className="mono">{value}</span>
    </div>
  );
}
