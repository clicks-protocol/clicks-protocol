import type { Metadata } from 'next';
import cn from '@/content/i18n/cn';

export const metadata: Metadata = {
  title: cn.meta.title,
  description: cn.meta.description,
  alternates: { canonical: '/cn' },
  openGraph: {
    title: cn.meta.title,
    description: cn.meta.description,
    url: 'https://clicksprotocol.xyz/cn',
    type: 'website',
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary_large_image',
    title: cn.meta.title,
    description: cn.meta.description,
  },
};

export default function CNLayout({ children }: { children: React.ReactNode }) {
  return children;
}
