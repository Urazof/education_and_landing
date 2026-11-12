// Общие помощники для страниц кейсов (EN и RU используют одни и те же функции).
import type { CollectionEntry } from 'astro:content';

type CaseEntry = CollectionEntry<'cases'>;

export interface NextCase {
  id: string;
  title: string;
  client: string;
}

// Следующий кейс для ссылки «Next case» в конце страницы.
// Идём по порядку `order` среди кейсов Works (без archive) по кругу: после последнего — первый.
// Для архивного кейса (WRC) «следующего» нет — он не часть последовательности Works.
export function getNextCase(all: CaseEntry[], current: CaseEntry): NextCase | undefined {
  if (current.data.archive) return undefined;
  const list = all.filter((e) => !e.data.archive).sort((a, b) => a.data.order - b.data.order);
  if (list.length < 2) return undefined;
  const i = list.findIndex((e) => e.id === current.id);
  const next = list[(i + 1) % list.length];
  return { id: next.id, title: next.data.title, client: next.data.client };
}

// meta description кейса: первый непустой текст секции (Results / Context) — это уже написанный контент,
// ничего не придумываем. Схлопываем пробелы и режем по границе слова до ~155 символов (лимит сниппета Google).
export function caseDescription(entry: CaseEntry, max = 155): string {
  const raw = entry.data.sections.map((s) => s.body).find((b) => b && b.trim().length > 0) ?? '';
  const text = raw.replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,.;:—-]+$/, '') + '…';
}

// JSON-LD CreativeWork для страницы кейса. Язык контента — английский (тексты кейсов не переводились).
export function caseJsonLd(entry: CaseEntry, url: URL, site: URL) {
  const d = entry.data;
  const person = { '@type': 'Person', name: 'Maria Tkachenko', url: site.href };
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: `${d.client}: ${d.title}`,
    description: caseDescription(entry),
    url: url.href,
    mainEntityOfPage: url.href,
    inLanguage: 'en',
    author: person,
    creator: person,
    about: {
      '@type': 'Organization',
      name: d.client,
      ...(d.external ? { url: d.external } : {}),
    },
  };
}
