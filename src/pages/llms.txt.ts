// /llms.txt — краткая карта сайта для языковых моделей (формат llmstxt.org): H1, цитата-резюме, разделы со ссылками.
// Генерируется при сборке из тех же коллекций, что и сайт (кейсы и публикации), поэтому не устаревает.
// Язык — английский: именно на нём написаны тексты кейсов.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { caseDescription } from '../lib/cases';
import { ui } from '../i18n/ui';

export const GET: APIRoute = async ({ site }) => {
  const origin = site!;
  const abs = (path: string) => new URL(path, origin).href;

  const cases = (await getCollection('cases')).sort((a, b) => a.data.order - b.data.order);
  const works = cases.filter((c) => !c.data.archive);
  const archive = cases.filter((c) => c.data.archive);
  const press = (await getCollection('press')).sort((a, b) => a.data.order - b.data.order);

  const caseLine = (c: (typeof cases)[number]) =>
    `- [${c.data.client}: ${c.data.title}](${abs(`/cases/${c.id}/`)}): ${caseDescription(c)}`;

  const lines = [
    '# Maria Tkachenko',
    '',
    `> ${ui.en['meta.description']}`,
    '',
    `Personal site of Maria Tkachenko, marketing leader and brand strategist. Available in English (${abs('/')}) and Russian (${abs('/ru/')}).`,
    '',
    '## Selected work',
    '',
    ...works.map(caseLine),
    '',
    ...(archive.length ? ['## Archive', '', ...archive.map(caseLine), ''] : []),
    '## Publications and podcasts',
    '',
    ...press.map((p) => `- [${p.data.outlet}: ${p.data.title}](${p.data.url})`),
    '',
    '## Recognition',
    '',
    '- Jury Member, E+ Awards (formerly Effie), 2024: https://eplus.marketing/award/jury/jury-old/2024',
    '',
    '## Contact',
    '',
    '- LinkedIn: https://www.linkedin.com/in/maria-tkachenko-k/',
    '- Telegram: https://t.me/marymishel',
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
