import type { Metadata } from 'next';
import ko from '@/content/i18n/ko';

export const metadata: Metadata = {
  title: ko.meta.title,
  description: ko.meta.description,
  alternates: { canonical: '/ko' },
  openGraph: {
    title: ko.meta.title,
    description: ko.meta.description,
    url: 'https://clicksprotocol.xyz/ko',
    type: 'website',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: ko.meta.title,
    description: ko.meta.description,
  },
};

export default function KOLayout({ children }: { children: React.ReactNode }) {
  return children;
}
