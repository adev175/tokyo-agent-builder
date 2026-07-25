import type { Metadata } from 'next';
import { Noto_Serif_JP, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import { LangProvider } from '@/lib/i18n';
import './globals.css';

const jp = Noto_Serif_JP({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-jp', display: 'swap' });
const latin = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-latin', display: 'swap' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono-latin', display: 'swap' });

export const metadata: Metadata = {
  title: '継 TSUGI',
  description: 'One photograph, one voice memo, a four-language storefront for Japanese craft.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${jp.variable} ${latin.variable} ${mono.variable}`}>
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
