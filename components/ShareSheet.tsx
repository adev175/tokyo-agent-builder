'use client';

import { useState } from 'react';
import { useLang } from '@/lib/i18n';

export default function ShareSheet({ url, qr, onClose }: { url: string; qr: string; onClose: () => void }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard needs a secure context; the URL is visible in the field anyway */
    }
  }

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(20,19,17,0.62)] p-7">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-field border-line w-full max-w-[340px] rounded-[2px] border px-5 pt-4 pb-6"
      >
        <div className="flex items-center justify-between">
          <span className="field-label">{t('shareThisPiece')}</span>
          <button onClick={onClose} className="text-ash px-1.5 text-[15px]">
            ✕
          </button>
        </div>
        <div className="border-rule mx-auto mt-4 w-[232px] border bg-white p-3.5">
          {qr ? <img src={qr} alt={`QR code for ${url}`} className="block h-auto w-full" /> : null}
        </div>
        <div className="relative mt-6">
          <input
            readOnly
            value={url}
            className="border-line mono w-full rounded-[2px] border py-3 pr-16 pl-3 text-[13px] outline-none"
          />
          <button onClick={copyUrl} className="field-label text-shu absolute top-1/2 right-1.5 -translate-y-1/2 px-2">
            {copied ? t('copied') : t('copy')}
          </button>
        </div>
        <a
          href={qr}
          download="tsugi-qr.png"
          className="field-label border-line mt-4 block rounded-[2px] border py-2.5 text-center"
        >
          {t('downloadQr')}
        </a>
      </div>
    </div>
  );
}
