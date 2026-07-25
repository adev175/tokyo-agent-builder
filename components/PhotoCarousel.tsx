'use client';

import { useState } from 'react';

export default function PhotoCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  const shown = images.length ? images : [''];
  const step = (d: number) => setI((prev) => (prev + d + shown.length) % shown.length);

  return (
    <div className="w-full md:w-1/2">
      <div className="bg-plate border-rule relative aspect-square w-full overflow-hidden border">
        <div className="flex h-full w-full transition-transform duration-300" style={{ transform: `translateX(-${i * 100}%)` }}>
          {shown.map((src, k) => (
            <button key={k} onClick={() => setZoom(true)} className="h-full w-full flex-none" aria-label="Enlarge photograph">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={alt} className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
        {shown.length > 1 ? (
          <>
            <Arrow side="left" onClick={() => step(-1)} />
            <Arrow side="right" onClick={() => step(1)} />
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {shown.map((_, k) => (
                <button
                  key={k}
                  onClick={() => setI(k)}
                  aria-label={`Photo ${k + 1}`}
                  className="h-2 w-2 rounded-full"
                  style={{ background: k === i ? 'var(--shu)' : 'rgba(35,33,30,0.28)' }}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      {zoom ? (
        <div
          onClick={() => setZoom(false)}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-[rgba(20,19,17,0.93)] p-6"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shown[i]} alt="" className="max-h-full max-w-full object-contain" />
        </div>
      ) : null}
    </div>
  );
}

function Arrow({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={side === 'left' ? 'Previous photo' : 'Next photo'}
      className={`absolute top-1/2 flex h-[34px] w-[34px] -translate-y-1/2 items-center justify-center rounded-full text-[17px] text-[color:var(--field)] ${
        side === 'left' ? 'left-2.5' : 'right-2.5'
      }`}
      style={{ background: 'rgba(35,33,30,0.45)' }}
    >
      {side === 'left' ? '‹' : '›'}
    </button>
  );
}
