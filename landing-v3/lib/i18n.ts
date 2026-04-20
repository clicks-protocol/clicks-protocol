/**
 * Minimal i18n for Clicks landing.
 *
 * Parallel routes under app/{cn,ko,ja}/ pass the matching dict to
 * shared Components. EN stays as default (no wrapper needed on app/page.tsx).
 *
 * Extending: add new top-level keys to Dictionary, fill per-locale files,
 * keep fallback to EN for unmigrated fields.
 */

import en from '@/content/i18n/en';
import cn from '@/content/i18n/cn';
import ko from '@/content/i18n/ko';
import ja from '@/content/i18n/ja';

export type Locale = 'en' | 'cn' | 'ko' | 'ja';

export const LOCALES: { code: Locale; label: string; path: string; htmlLang: string; flag: string }[] = [
  { code: 'en', label: 'English',  path: '/',    htmlLang: 'en',    flag: '🌐' },
  { code: 'cn', label: '中文',     path: '/cn',  htmlLang: 'zh-CN', flag: '🇨🇳' },
  { code: 'ko', label: '한국어',   path: '/ko',  htmlLang: 'ko',    flag: '🇰🇷' },
  { code: 'ja', label: '日本語',   path: '/ja',  htmlLang: 'ja',    flag: '🇯🇵' },
];

export const DEFAULT_LOCALE: Locale = 'en';

export type Dictionary = typeof en;

export const dictionaries: Record<Locale, Dictionary> = {
  en,
  cn: { ...en, ...cn } as Dictionary,
  ko: { ...en, ...ko } as Dictionary,
  ja: { ...en, ...ja } as Dictionary,
};

export function getDict(locale: Locale = DEFAULT_LOCALE): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}
