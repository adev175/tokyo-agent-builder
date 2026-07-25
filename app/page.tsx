'use client';

import { useLang, LANGS } from '@/lib/i18n';

export default function Landing() {
  const { lang, setLang, t } = useLang();

  return (
    <main className="bg-paper flex min-h-screen flex-col">
      <header className="border-rule flex items-center gap-3 border-b px-6 py-4">
        <span className="jp text-shu text-[22px] leading-none">継</span>
        <span className="mono text-[15px] tracking-[0.16em]">TSUGI</span>
        <div className="ml-auto flex gap-1.5">
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
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-9 px-6 py-16">
        <div className="seal flex h-[132px] w-[132px] items-center justify-center">
          <span className="jp text-[76px] leading-none">継</span>
        </div>
        <p className="jp text-ash max-w-[36em] text-center text-[14px] leading-[1.9]">{t('tagline')}</p>

        <div className="grid w-full max-w-[820px] grid-cols-1 gap-5 md:grid-cols-2">
          <a
            href="/market"
            className="border-line bg-field group flex flex-col gap-4 rounded-[2px] border p-8 transition-colors hover:border-[color:var(--shu)]"
          >
            <span className="jp text-ink text-[28px] leading-none">市</span>
            <div>
              <div className="text-ink text-[19px] font-medium">{t('chooseBuyer')}</div>
              <p className="text-ash mt-2 text-[14px] leading-[1.7]">{t('chooseBuyerDesc')}</p>
            </div>
            <span className="field-label text-shu mt-auto">{t('chooseBuyerCta')} ›</span>
          </a>

          <a
            href="/forge"
            className="border-line bg-field group flex flex-col gap-4 rounded-[2px] border p-8 transition-colors hover:border-[color:var(--shu)]"
          >
            <span className="jp text-ink text-[28px] leading-none">職</span>
            <div>
              <div className="text-ink text-[19px] font-medium">{t('chooseCraftsman')}</div>
              <p className="text-ash mt-2 text-[14px] leading-[1.7]">{t('chooseCraftsmanDesc')}</p>
            </div>
            <span className="field-label text-shu mt-auto">{t('chooseCraftsmanCta')} ›</span>
          </a>
        </div>
      </div>

      <footer className="border-rule text-dust border-t px-6 py-4 text-center text-[11px]">
        <a href="/forge" className="mono">
          {t('forCraftsmen')}
        </a>
      </footer>
    </main>
  );
}
