'use client';

import { useLang } from '@/lib/i18n';
import Storefront from './Storefront';
import type { Piece } from '@/lib/types';

export default function StorePage({ piece }: { piece: Piece }) {
  const { t } = useLang();
  const v = piece.vision;

  return (
    <div className="bg-bg flex min-h-screen justify-center">
      <div className="bg-paper w-full max-w-[1320px] xl:grid xl:grid-cols-[5fr_7fr] xl:items-start xl:gap-x-8 xl:px-6">
        <div className="border-rule border-b px-6 py-3 xl:col-span-2 xl:px-0">
          <a href="/market" className="mono text-sumi text-[12px] tracking-[0.06em]">
            ‹ {t('backToMarket')}
          </a>
        </div>

        <section className="border-rule border-b px-6 py-6 xl:sticky xl:top-6 xl:col-start-1 xl:border xl:border-b xl:px-5 xl:py-6">
          <div className="flex items-baseline justify-between gap-3">
            <span className="jp text-ink text-[26px] leading-tight">{piece.storeName}</span>
            <span className="field-label">{t('theWorkshop')}</span>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-4">
            <Stat label={t('craftType')} value={v.craft} sub={v.craftJa} />
            <Stat label={t('piecesLive')} value="1" />
            <Stat label={t('shipsFrom')} value={piece.place ? `${piece.place.prefecture}${piece.place.city}` : '—'} />
          </div>

          {piece.storeOrigin ? (
            <div className="border-rule mt-6 border-t pt-5">
              <span className="field-label">The Store</span>
              <p className="jp text-ink mt-2 text-[15px] leading-[1.95]">{piece.storeOrigin}</p>
            </div>
          ) : null}

          {piece.storePeople ? (
            <div className="border-rule mt-5 border-t pt-5">
              <span className="field-label">The People</span>
              <p className="jp text-ink mt-2 text-[15px] leading-[1.95]">{piece.storePeople}</p>
            </div>
          ) : null}
        </section>

        <div className="flex-1 xl:col-start-2">
          <Storefront piece={piece} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="field-label">{label}</span>
      <span className="text-[16px] leading-tight">{value}</span>
      {sub ? <span className="jp text-dust text-[12px]">{sub}</span> : null}
    </div>
  );
}
