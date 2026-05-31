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
        // YouTube URLs для встраивания видео (несколько = сетка). Пусто = нет видео.
        videos: z.array(z.string()).default([]),
        // Раскладка: default — картинки снизу, aside-right — текст слева/картинка справа,
        // aside-left — картинка слева/текст справа. Соответствует макету Miro.
        layout: z.enum(['default', 'aside-right', 'aside-left']).default('default'),
        // Ссылка-кнопка под текстом секции (напр. themeal.menu в «What came next»).
        link: z.object({ label: z.string(), url: z.string().url() }).optional(),
      }),
    ),
    // Маркированные результаты (метрики).
    results: z.array(z.string()).default([]),
    // Медиа-слоты: label = название, video = YouTube URL (пусто = плейсхолдер).
    media: z.array(z.object({
      label: z.string(),
      video: z.string().optional(),
    })).default([]),
  }),
});

export const collections = { cases };
