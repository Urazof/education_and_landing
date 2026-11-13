// Разворачивание переводимых полей кейса в один язык.
// В файле кейса поле = { en, ru } (или обычная строка — одинаково для всех языков). Компоненты получают уже
// «плоский» кейс (все поля — строки) и ничего не знают про переводы.
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';
import type { CaseData } from './caseSchema';

export interface LocalCase {
  id: string;
  data: CaseData;
}

const isLocalized = (v: unknown): v is { en: string; ru?: string } =>
  typeof v === 'object' && v !== null && !Array.isArray(v) && 'en' in v && Object.keys(v).every((k) => k === 'en' || k === 'ru');

// Предупреждения о пропущенном переводе печатаем один раз на путь (кейс разворачивается на нескольких страницах).
const warned = new Set<string>();

function resolve(v: unknown, lang: Lang, where: string): unknown {
  if (isLocalized(v)) {
    const text = v[lang];
    if (text !== undefined) return text;
    const key = `${lang}:${where}`;
    if (!warned.has(key)) {
      warned.add(key);
      console.warn(`[i18n] нет перевода ${lang}: ${where} — показан английский`);
    }
    return v.en;
  }
  if (Array.isArray(v)) return v.map((x, i) => resolve(x, lang, `${where}[${i}]`));
  if (typeof v === 'object' && v !== null) {
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, resolve(x, lang, `${where}.${k}`)]));
  }
  return v;
}

export function localizeCase(entry: CollectionEntry<'cases'>, lang: Lang): LocalCase {
  return { id: entry.id, data: resolve(entry.data, lang, entry.id) as CaseData };
}

// Все кейсы в нужном языке, по порядку `order`.
export async function getCases(lang: Lang): Promise<LocalCase[]> {
  const all = await getCollection('cases');
  return all.map((e) => localizeCase(e, lang)).sort((a, b) => a.data.order - b.data.order);
}
