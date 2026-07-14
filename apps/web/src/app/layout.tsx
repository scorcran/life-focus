import type { ReactNode } from 'react';
import { Playfair_Display, Public_Sans } from 'next/font/google';
import './globals.css';

// Self-hosted via next/font (fonts are downloaded at build time and served from
// our own origin — no external font CDN, no first-paint FOUT). Exposed as CSS
// variables consumed by globals.css.
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-playfair',
  display: 'swap',
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-public-sans',
  display: 'swap',
});

export const metadata = {
  title: 'Life Focus',
  description: 'Calm, whole-life planning intelligence.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${publicSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
