// Конфиг content-коллекций (Astro 5). Описывает, ОТКУДА брать контент (loader)
// и КАКОЙ у него формат (schema на zod). Astro по схеме генерирует типы —
// в шаблонах будет автодополнение и проверка типов контента.

import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { caseShape, cleanUrl, localized } from './lib/caseSchema';

// Схема кейса — в src/lib/caseSchema.ts (там же `cleanUrl`). Переводимые поля пишутся как { en, ru } (см. localize.ts).
const cases = defineCollection({
  // glob-loader забирает все .md из папки. Имя файла (без .md) становится id записи.
  loader: glob({ pattern: '**/*.md', base: './src/content/cases' }),
  // Astro провалит сборку, если файл не соответствует схеме.
  schema: caseShape(localized),
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
