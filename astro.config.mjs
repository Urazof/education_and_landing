// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Канонический адрес сайта. Используется для sitemap, OG, canonical, hreflang.
  site: 'https://mariatkachenko.savor.ing',

  // Встроенная интернационализация Astro.
  i18n: {
    defaultLocale: 'en',          // язык по умолчанию (контент кейсов на доске — EN)
    locales: ['en', 'ru'],        // поддерживаемые языки
    routing: {
      prefixDefaultLocale: false, // en — без префикса (/), ru — с префиксом (/ru/)
    },
  },

  // Интеграции сборки. sitemap обходит все страницы и пишет sitemap-index.xml при build.
  integrations: [
    sitemap({
      // Проставляет hreflang-связи между языковыми версиями прямо в карте сайта.
      // Ключи — наши locale-коды, значения — BCP-47 теги для поисковика.
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en-US', ru: 'ru-RU' },
      },
    }),
  ],

  // Tailwind v4 подключается как Vite-плагин (не через astro integration, как было в v3).
  vite: {
    // @ts-expect-error — Astro тянет vite@6, а @tailwindcss/vite — vite@8; типы Plugin не совпадают.
    // На сборку/рантайм НЕ влияет (build зелёный). Уберём, когда версии vite сойдутся в одну.
    plugins: [tailwindcss()],
  },
});
