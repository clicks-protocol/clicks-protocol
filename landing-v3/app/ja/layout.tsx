import type { Metadata } from 'next';
import ja from '@/content/i18n/ja';

export const metadata: Metadata = {
  title: ja.meta.title,
  description: ja.meta.description,
  alternates: { canonical: '/ja' },
  openGraph: {
    title: ja.meta.title,
    description: ja.meta.description,
    url: 'https://clicksprotocol.xyz/ja',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: ja.meta.title,
    description: ja.meta.description,
  },
};

export default function JALayout({ children }: { children: React.ReactNode }) {
  return children;
}
