// Конфиг content-коллекций (Astro 5). Описывает, ОТКУДА брать контент (loader)
// и КАКОЙ у него формат (schema на zod). Astro по схеме генерирует типы —
// в шаблонах будет автодополнение и проверка типов контента.

import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

// Любая ссылка в контенте: валидный URL без трекинг-параметров (utm_*, fbclid, igsh, gclid) — правило проекта.
const cleanUrl = z
  .string()
  .url()
  .refine((u) => !/[?&](utm_[a-z]+|fbclid|igsh|gclid)=/i.test(u), 'URL contains tracking parameters');

const cases = defineCollection({
  // glob-loader забирает все .md из папки. Имя файла (без .md) становится id записи.
  loader: glob({ pattern: '**/*.md', base: './src/content/cases' }),

  // Схема フ frontmatter каждого кейса. Astro провалит сборку, если файл ей не соответствует.
  schema: z.object({
    title: z.string(),               // заголовок кейса, напр. "Brand transformation"
    client: z.string(),              // "Grow Food" / "Priem"
    order: z.number(),               // порядок в списке Works
    external: cleanUrl.optional(), // ссылка на продукт
    social: z
      .array(z.object({ label: z.string(), url: cleanUrl }))
      .default([]),
    // Секции кейса: Context → Challenge → Strategy → Execution → Results → ...
    sections: z.array(
      z.object({
        heading: z.string(),
        body: z.string(),
        // Имена файлов картинок из src/assets (без пути). Резолвятся в CaseArticle
        // через import.meta.glob. Пусто = у секции нет иллюстраций.
        images: z.array(z.string()).default([]),
        // Видео для встраивания (YouTube). Каждое: url + ориентация.
        // vertical:true → вертикальный формат 9:16 (Shorts/сторис), иначе 16:9.
        // Принимаем и просто строку (= горизонтальное) для краткости.
        videos: z
          .array(
            z.union([
              cleanUrl,
              z.object({ url: cleanUrl, vertical: z.boolean().default(false) }),
            ]),
          )
          .default([])
          .transform((arr) =>
            arr.map((v) => (typeof v === 'string' ? { url: v, vertical: false } : v)),
          ),
        // Раскладка: default — картинки снизу, aside-right — текст слева/картинка справа,
        // aside-left — картинка слева/текст справа. Соответствует макету Miro.
        // default: текст→видео→картинки; aside-right: текст|картинка; aside-left: картинка|текст;
        // video-image: видео(шире)|картинка (для пар медиа без текста, напр. boxing+packaging GF)
        // spotlight: выделенный callout-блок (тонированная подложка) с опц. бейджем награды
        // (см. award) и опц. кнопкой-ссылкой (см. link). Впервые: Cofix «Campaign spotlight».
        // media-row: видео + картинки в ОДНОМ ряду общей высоты (сначала videos, потом images),
        // с cap высоты как у ImageRow. Для секции без heading/body. Впервые: Cofix (видео + 3 фото).
        layout: z.enum(['default', 'aside-right', 'aside-left', 'video-image', 'spotlight', 'media-row']).default('default'),
        // Ссылка-кнопка под текстом секции (напр. themeal.menu в «What came next»).
        link: z.object({ label: z.string(), url: cleanUrl }).optional(),
        // Список ссылок-референсов (напр. Credentials в WRC). label опционален — дефолт URL.
        links: z.array(z.object({ label: z.string().optional(), url: cleanUrl })).default([]),
        // Метрик-чипы (напр. Results в Eucerin): крупное значение + подпись.
        metrics: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
        // Текст ПОД чипсами (на макете: интро → чипсы → ещё текст → Context). Рендерится
        // после metrics в обычной раскладке. `body` при этом — текст ДО чипсов.
        after: z.string().optional(),
        // Маркированный список (буллеты) под текстом секции. Напр. Grow Food Execution:
        // подзаголовок (heading) + буллеты. Рендерится в обычной раскладке после body/after.
        bullets: z.array(z.string()).default([]),
        // Смысловой ПОДзаголовок (менее жирный, чем heading). Напр. Grow Food: под «Execution»
        // идут подзаголовки «Brand platform and identity» / «Product and digital». Рендерится
        // отдельной строкой перед bullets/после heading в обычной раскладке.
        subheading: z.string().optional(),
        // Бейдж награды для layout:spotlight (напр. "2× Bronze — Tagline Awards").
        award: z.string().optional(),
        // Доп. текст-блоки в ТОЙ ЖЕ колонке текста (для aside-right/aside-left): например
        // Challenge стоит сразу под Context слева от общей вертикальной картинки (Cofix).
        extra: z.array(z.object({ heading: z.string(), body: z.string() })).default([]),
      }),
    ),
    // Маркированные результаты (метрики).
    results: z.array(z.string()).default([]),
    // archive: true — кейс не отображается в Works, доступен только по прямой ссылке (напр. через Archive-чип).
    archive: z.boolean().default(false),
    // Медиа-слоты: label = название, video = YouTube URL (пусто = плейсхолдер).
    media: z.array(z.object({
      label: z.string(),
      video: z.string().optional(),
    })).default([]),
  }),
});

// Публикации и подкасты (секция Publications на главной). Один JSON-файл — loader `file`:
// каждый элемент массива = запись коллекции, поле `id` обязательно (loader берёт его как id записи).
// kind — ключ перевода (`press.<kind>` в ui.ts), поэтому enum, а не свободная строка.
// url БЕЗ utm_*/fbclid — схема это проверяет (правило проекта: никаких трекинг-параметров).
const press = defineCollection({
  loader: file('./src/content/press.json'),
  schema: z.object({
    outlet: z.string(),
    title: z.string(),
    kind: z.enum(['article', 'case', 'commentary', 'insight', 'podcast']),
    url: cleanUrl,
    order: z.number(),
  }),
});

export const collections = { cases, press };
