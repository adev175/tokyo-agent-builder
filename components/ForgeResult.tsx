'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import type { Piece } from '@/lib/types';

export default function ForgeResult({ piece }: { piece: Piece }) {
  const [qr, setQr] = useState('');
  const storeUrl = `/market/store/${piece.storeSlug}`;

  useEffect(() => {
    const full = `${window.location.origin}${storeUrl}`;
    QRCode.toDataURL(full, { margin: 0, width: 180, color: { dark: '#23211e', light: '#f2efe8' } }).then(setQr);
    // storeUrl is derived from piece.storeSlug, so piece alone is a sufficient dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [piece]);

  return (
    <div className="border-rule flex items-start gap-4 border-t px-5 py-4">
      <div className="min-w-0 flex-1">
        <div className="field-label normal-case text-shu">✓ your store is live</div>
        <a className="jp text-ink mt-1.5 block text-[16px]" href={storeUrl}>
          {piece.storeName}
        </a>
        <a className="mono text-shu mt-1 block text-[12px] break-all" href={storeUrl}>
          {typeof window !== 'undefined' ? window.location.origin : ''}
          {storeUrl}
        </a>
        {piece.sandboxUrl ? (
          <div className="text-dust mt-1.5 text-[11px] break-all">
            daytona mirror:{' '}
            <a href={piece.sandboxUrl} target="_blank" rel="noreferrer">
              {piece.sandboxUrl}
            </a>
          </div>
        ) : null}
      </div>
      {qr ? (
        <div className="flex flex-none flex-col items-center gap-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="" className="border-line h-[80px] w-[80px] border bg-white p-1.5" />
          <span className="field-label normal-case">scan or share</span>
        </div>
      ) : null}
    </div>
  );
}
