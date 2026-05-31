// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Канонический адрес сайта. Используется для sitemap, OG-тегов, абсолютных ссылок.
  // TODO: заменить на реальный домен (кандидат: https://becom.ing) перед деплоем.
  site: 'https://example.com',

  // Встроенная интернационализация Astro.
  i18n: {
    defaultLocale: 'en',          // язык по умолчанию (контент кейсов на доске — EN)
    locales: ['en', 'ru'],        // поддерживаемые языки
    routing: {
      prefixDefaultLocale: false, // en — без префикса (/), ru — с префиксом (/ru/)
    },
  },

  // Tailwind v4 подключается как Vite-плагин (не через astro integration, как было в v3).
  vite: {
    // @ts-expect-error — Astro тянет vite@6, а @tailwindcss/vite — vite@8; типы Plugin не совпадают.
    // На сборку/рантайм НЕ влияет (build зелёный). Уберём, когда версии vite сойдутся в одну.
    plugins: [tailwindcss()],
  },
});
