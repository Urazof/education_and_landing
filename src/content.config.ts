// Конфиг content-коллекций (Astro 5). Описывает, ОТКУДА брать контент (loader)
// и КАКОЙ у него формат (schema на zod). Astro по схеме генерирует типы —
// в шаблонах будет автодополнение и проверка типов контента.

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const cases = defineCollection({
  // glob-loader забирает все .md из папки. Имя файла (без .md) становится id записи.
  loader: glob({ pattern: '**/*.md', base: './src/content/cases' }),

  // Схема フ frontmatter каждого кейса. Astro провалит сборку, если файл ей не соответствует.
  schema: z.object({
    title: z.string(),               // заголовок кейса, напр. "Brand transformation"
    client: z.string(),              // "Grow Food" / "Priem"
    order: z.number(),               // порядок в списке Works
    external: z.string().url().optional(), // ссылка на продукт
    social: z
      .array(z.object({ label: z.string(), url: z.string().url() }))
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
              z.string().url(),
              z.object({ url: z.string().url(), vertical: z.boolean().default(false) }),
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
        layout: z.enum(['default', 'aside-right', 'aside-left', 'video-image']).default('default'),
        // Ссылка-кнопка под текстом секции (напр. themeal.menu в «What came next»).
        link: z.object({ label: z.string(), url: z.string().url() }).optional(),
        // Список ссылок-референсов (напр. Credentials в WRC). label опционален — дефолт URL.
        links: z.array(z.object({ label: z.string().optional(), url: z.string().url() })).default([]),
        // Метрик-чипы (напр. Results в Eucerin): крупное значение + подпись.
        metrics: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
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

export const collections = { cases };
