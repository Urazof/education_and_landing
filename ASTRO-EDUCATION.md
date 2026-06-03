# ASTRO-EDUCATION

> Живой учебник по этому проекту. Сюда пишем **всю** разработку: разбор кода построчно,
> паттерны с объяснениями, идеи и решения. Цель — чтобы человек без опыта с Astro мог
> открыть файл и понять, как всё устроено и почему.
>
> Документ растёт по этапам. Каждый этап реализации (см. `CONTEXT_LANDING.md` §6 / раздел «План»)
> добавляет сюда новый раздел.

## Оглавление
- [0. Что такое Astro и зачем он здесь](#0-что-такое-astro-и-зачем-он-здесь)
- [1. Ментальная модель: как Astro рендерит сайт](#1-ментальная-модель-как-astro-рендерит-сайт)
- [2. Версии и команды](#2-версии-и-команды)
- [3. Структура проекта](#3-структура-проекта)
- [4. Анатомия `.astro`-файла](#4-анатомия-astro-файла)
- [5. Разбор каждого файла построчно](#5-разбор-каждого-файла-построчно)
- [6. Паттерны, которые мы используем](#6-паттерны-которые-мы-используем)
- [7. Глоссарий](#7-глоссарий)
- [8. Этап 2: вёрстка главной по макету](#8-этап-2-вёрстка-главной-по-макету)
- [9. Деплой: как сайт попадает в интернет](#9-деплой-как-сайт-попадает-в-интернет)
- [10. Этап 3: страницы кейсов и динамические маршруты](#10-этап-3-страницы-кейсов-и-динамические-маршруты)
- [11. Этап 4: SEO-фундамент](#11-этап-4-seo-фундамент)
- [12. Этап 5: дизайн-полировка и computer-vision-воркфлоу](#12-этап-5-дизайн-полировка-и-computer-vision-воркфлоу)
- [13. Этап 6: UI-полировка — hero-layout, медиа-выравнивание, адаптив фото](#13-этап-6-ui-полировка)
- [14. Этап 7: два новых кейса — WRC Academy и Philips](#14-этап-7-два-новых-кейса--wrc-academy-и-philips)
- [15. Этап 8: Eucerin + Archive-редизайн](#15-этап-8-eucerin--archive-редизайн)
- [Журнал этапов](#журнал-этапов)

---

## 0. Что такое Astro и зачем он здесь

**Astro** — это фреймворк для сайтов, ориентированных на контент (лэндинги, блоги, портфолио,
доки). Его главная идея — **server-first, ноль JS по умолчанию**.

Что это значит на практике:
- Ты пишешь компоненты (`.astro`), Astro во время **сборки** превращает их в обычный **HTML**.
- В браузер по умолчанию **не уезжает JavaScript** — поэтому страницы лёгкие и быстрые, и это
  отлично для **SEO** (поисковику отдаётся готовый HTML, а не пустой `<div>`, который дорисовывает JS).
- JS добавляется **точечно** и только там, где нужна интерактивность («острова», см. ниже).

Почему именно Astro для нашего лэндинга-портфолио:
1. **SEO** (приоритет пользователя) — статический HTML из коробки, плюс встроенные sitemap/meta.
2. **Простота добавления контента** (второй приоритет) — кейсы лежат в Markdown, добавить кейс =
   добавить `.md`-файл. Никакого редеплоя логики.
3. **Многостраничность и i18n** (en/ru) — встроенная маршрутизация по папкам и по языкам.
4. Можно подключить React/Vue/Svelte позже, если понадобится интерактив — но платить за это JS’ом
   будем только на нужных компонентах.

Чем отличается от Next.js: Next — это React-фреймворк (всё — React-компоненты, JS уезжает в браузер
по умолчанию). Astro — HTML-first, JS опционален. Для статичного контента Astro проще и легче;
для сложного приложения (наша будущая видеоплатформа) лучше подойдёт что-то вроде Next — поэтому мы
их и **разделили** (лэндинг на Astro, платформа потом — отдельно).

---

## 1. Ментальная модель: как Astro рендерит сайт

Ключевое, что нужно уложить в голове — **где выполняется код**.

```
              СБОРКА (на твоём компьютере / на сервере деплоя)        БРАУЗЕР пользователя
              ────────────────────────────────────────────          ───────────────────
  .astro  ─▶  frontmatter (--- код ---) выполняется ЗДЕСЬ      ─▶     получает готовый HTML
              (читает Markdown, ходит в API, считает данные)          (по умолчанию без JS)
```

- Всё, что между `---` в начале `.astro`-файла (**frontmatter**), — это серверный код. Он бежит
  один раз при сборке. Его результат «впекается» в HTML. В браузер этот код **не попадает**.
- Всё, что после второго `---`, — **шаблон** (HTML + вставки `{...}`). Из него получается финальная
  разметка.
- Поскольку сайт у нас **статический** (`output: "static"` — режим по умолчанию), на выходе —
  папка `dist/` с готовыми `.html`, `.css`, картинками. Её можно положить на любой статический
  хостинг (Vercel/Netlify/Cloudflare Pages) — сервер с Node не нужен.

**«Острова» (islands).** Если на странице нужен интерактив (слайдер, переключатель), ты делаешь
отдельный компонент-«остров» и помечаешь его директивой `client:*` (например `client:visible`).
Только он получит JS; остальная страница останется статичным HTML. В Этапе 1 островов нет — всё
статика.

**Маршрутизация по файлам.** Каждый файл в `src/pages/` становится страницей по своему пути:
- `src/pages/index.astro` → `/`
- `src/pages/ru/index.astro` → `/ru/`
- (позже) `src/pages/cases/[slug].astro` → `/cases/grow-food`, `/cases/priem` — динамические маршруты.

---

## 2. Версии и команды

Установлено (зафиксировано в `package.json` / `package-lock.json`):

| Пакет | Версия | Зачем |
|---|---|---|
| `astro` | 5.18.2 | сам фреймворк |
| `tailwindcss` | 4.3.0 | utility-CSS |
| `@tailwindcss/vite` | 4.3.0 | плагин, встраивающий Tailwind v4 в сборку Vite |
| `@astrojs/check` | 0.9.9 | проверка типов в `.astro` |
| `@astrojs/sitemap` | 3.7.3 | генерация `sitemap-index.xml` при сборке (Этап 4) |
| `typescript` | 5.9.3 | типы |

Команды (`npm run <script>`, скрипты заданы в `package.json`):
- `npm run dev` — локальный дев-сервер с горячей перезагрузкой (обычно http://localhost:4321).
- `npm run build` — сборка в `dist/` (то, что деплоим).
- `npm run preview` — локально посмотреть, что получилось в `dist/`.
- `npm run check` — проверка типов и ошибок в шаблонах.

---

## 3. Структура проекта

```
education_and_landing/
├── astro.config.mjs        # конфиг Astro: домен, i18n, плагин Tailwind
├── tsconfig.json           # настройки TypeScript (строгий режим)
├── package.json            # зависимости и команды
├── public/                 # статика «как есть» — копируется в dist без обработки
│   ├── favicon.svg
│   └── robots.txt          # правила для краулеров + ссылка на sitemap (Этап 4)
├── src/
│   ├── styles/
│   │   └── global.css      # вход Tailwind + дизайн-токены (@theme)
│   ├── i18n/
│   │   └── ui.ts           # словарь интерфейсных строк (en/ru) + переводчик
│   ├── content.config.ts   # описание content-коллекций (схема кейсов на zod)
│   ├── content/
│   │   └── cases/
│   │       ├── grow-food.md # кейс 1 (контент во frontmatter)
│   │       └── priem.md     # кейс 2
│   ├── layouts/
│   │   └── Base.astro      # общий каркас страницы (<html><head><body>)
│   ├── components/
│   │   ├── Nav.astro       # шапка с навигацией
│   │   ├── Footer.astro    # подвал
│   │   └── CaseCard.astro  # карточка кейса в секции Works
│   └── pages/
│       ├── index.astro     # главная (EN, "/")
│       └── ru/
│           └── index.astro # главная (RU, "/ru/")
├── .design/                # артефакты дизайна (Miro-экспорт, спеки, картинки) — не часть сборки
└── dist/                   # результат build (в .gitignore)
```

Разница `public/` vs `src/`:
- `public/` — файлы копируются в итог **без изменений** по тому же пути (`public/favicon.svg` → `/favicon.svg`).
  Сюда кладут то, что не нужно обрабатывать: favicon, `robots.txt`, готовые PDF.
- `src/` — всё, что Astro **обрабатывает** (компилирует, оптимизирует, проверяет типы).

---

## 4. Анатомия `.astro`-файла

`.astro` — это HTML с «подвалом данных» сверху. Структура всегда такая:

```astro
---
// 1) FRONTMATTER — серверный JS/TS. Бежит при сборке. В браузер не попадает.
import Something from '../components/Something.astro';
const name = 'Maria';
---

<!-- 2) ШАБЛОН — HTML с вставками. Из него получается финальная разметка. -->
<h1>Hello, {name}!</h1>     <!-- {name} — вставка значения из frontmatter -->
<Something prop="value" />  <!-- использование другого компонента -->

<style>
  /* 3) (опционально) СТИЛИ — по умолчанию scoped: применяются только к этому компоненту */
  h1 { color: red; }
</style>
```

Три важных механизма шаблона:
- **Вставка `{выражение}`** — печатает значение. `{1 + 1}` → `2`, `{name}` → `Maria`.
- **Атрибуты-выражения** — `<a href={url}>`: значение берётся из переменной.
- **Списки через `.map()`** — `{items.map((x) => <li>{x}</li>)}` рисует элемент на каждый элемент массива.

---

## 5. Разбор каждого файла построчно

### 5.1 `package.json`
```json
{
  "name": "maria-portfolio",
  "type": "module",        // используем ES-модули (import/export), а не require
  "version": "0.1.0",
  "private": true,         // защита от случайной публикации в npm
  "scripts": {             // короткие команды: npm run dev / build / preview / check
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check"
  },
  "dependencies": {        // нужны и в рантайме сборки
    "astro": "^5.0.0"      // ^ = «совместимые обновления» внутри мажорной версии 5
  },
  "devDependencies": {     // нужны только при разработке/сборке
    "@astrojs/check": "^0.9.0",
    "@tailwindcss/vite": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.0"
  }
}
```

### 5.2 `astro.config.mjs`
```js
// @ts-check                       // включает проверку типов в этом JS-файле
import { defineConfig } from 'astro/config';   // хелпер: даёт автодополнение по конфигу
import tailwindcss from '@tailwindcss/vite';   // Tailwind v4 = Vite-плагин
import sitemap from '@astrojs/sitemap';        // интеграция: карта сайта при сборке (Этап 4)

export default defineConfig({
  // ⚠️ PROVISIONAL: портфолио на субдомене becom.ing, домен ещё не зарегистрирован.
  // Из site строятся sitemap, canonical, OG, hreflang — заменить на реальный перед деплоем.
  site: 'https://maria.becom.ing',

  i18n: {                          // встроенная интернационализация
    defaultLocale: 'en',           // язык по умолчанию
    locales: ['en', 'ru'],         // список языков
    routing: {
      prefixDefaultLocale: false,  // en без префикса ("/"), ru с префиксом ("/ru/")
    },
  },

  integrations: [                  // интеграции сборки
    sitemap({                      // обходит все страницы → sitemap-index.xml + sitemap-0.xml
      i18n: {                      // проставляет hreflang-связи языковых версий В САМОЙ карте
        defaultLocale: 'en',
        locales: { en: 'en-US', ru: 'ru-RU' },  // locale-код → BCP-47 тег для поисковика
      },
    }),
  ],

  vite: {                          // Astro построен на Vite; сюда прокидываем его плагины
    plugins: [tailwindcss()],      // подключаем Tailwind в конвейер сборки
  },
});
```
**`site` vs `integrations`.** `site` — фундамент SEO: без него все абсолютные ссылки сломаны.
`integrations` — список расширений Astro; `sitemap()` подключается именно так (это полноценная
интеграция, в отличие от Tailwind, который в v4 — Vite-плагин). Подробно про SEO — §11.

**Почему Tailwind через Vite, а не интеграцию?** В Tailwind v3 ставили `@astrojs/tailwind`.
В v4 подход изменили: Tailwind стал Vite-плагином + конфиг переехал в CSS (`@theme`). Это текущий
рекомендованный способ.

**Про `// @ts-expect-error` над `plugins`.** Astro 5.18 внутри использует `vite@6`, а
`@tailwindcss/vite@4.3` тянет `vite@8`. Тип `Plugin` из vite 8 не совпадает с тем, что ожидает
конфиг Astro (vite 6) — `astro check` ругается. На **сборку и рантайм это не влияет** (`npm run
build` зелёный), поэтому мы помечаем строку `@ts-expect-error` с комментарием. Когда обе зависимости
сойдутся на одной мажорной версии vite, подавление можно будет убрать (тогда `@ts-expect-error` сам
станет «неиспользуемым» и подсветится — это сигнал удалить его). Проверить дерево версий:
`npm ls vite`.

### 5.3 `tsconfig.json`
```json
{
  "extends": "astro/tsconfigs/strict",  // берём строгий пресет Astro (макс. проверки типов)
  "include": [".astro/types.d.ts", "**/*"], // .astro/types.d.ts — автогенерируемые типы (контент, маршруты)
  "exclude": ["dist"]                   // собранную папку не проверяем
}
```
`.astro/` создаётся самим Astro при `dev`/`build` — там лежат типы для `astro:content` и т.п.
Поэтому она в `.gitignore`, но включена в проверку типов.

### 5.4 `src/styles/global.css`
```css
@import "tailwindcss";   /* единственный вход Tailwind v4: base + utilities */

@theme {                 /* объявляем дизайн-токены прямо в CSS */
  --color-ink: #1a1a1a;  /* → утилиты bg-ink, text-ink, border-ink */
  --color-paper: #ffffff;
  --color-gf-green: #21c24b;   /* токены бренда Grow Food (из логотипа на Miro) */
  --color-gf-lime: #b6f03c;
  --color-gf-dark: #0e3b1e;
  --color-priem-purple: #5b2a86;  /* токены бренда Priem */
  --color-priem-yellow: #f4c400;
  --font-sans: "Inter", system-ui, sans-serif;
}

html { scroll-behavior: smooth; }  /* плавная прокрутка к якорям #about/#works */
body { font-family: var(--font-sans); color: var(--color-ink); background: var(--color-paper); }
```
**Магия `@theme`:** объявил `--color-ink` — и сразу получил классы `text-ink`, `bg-ink`,
`border-ink`. Не нужно отдельно описывать палитру в JS-конфиге, как было в v3.

### 5.5 `src/i18n/ui.ts`
```ts
export const languages = { en: 'English', ru: 'Русский' } as const;
// as const → TypeScript понимает точные строковые литералы, а не просто string.

export const defaultLang = 'en';

export const ui = {                 // словарь: ключ → перевод, для каждого языка
  en: { 'nav.about': 'About', 'nav.works': 'Works', /* ... */ },
  ru: { 'nav.about': 'Обо мне', 'nav.works': 'Работы', /* ... */ },
} as const;

export type UiKey = keyof (typeof ui)['en']; // тип = объединение всех ключей en-словаря
export type Lang = keyof typeof ui;          // тип = 'en' | 'ru'

export function useTranslations(lang: Lang) {        // фабрика переводчика
  return function t(key: UiKey): string {            // возвращает функцию t(key)
    return ui[lang][key] ?? ui[defaultLang][key];    // нет перевода → откат на en (?? = «или»)
  };
}
```
**Паттерн:** `const t = useTranslations('ru'); t('nav.about')` → `'Обо мне'`. Типы не дадут
опечатться в ключе — `t('nav.aboutt')` подсветится ошибкой ещё до запуска.

### 5.6 `src/content.config.ts`
```ts
import { defineCollection, z } from 'astro:content';  // z = zod, библиотека валидации схем
import { glob } from 'astro/loaders';                 // loader: откуда брать контент

const cases = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cases' }),
  // glob берёт все .md из папки. Имя файла без .md → id записи (grow-food.md → id "grow-food").

  schema: z.object({                  // схема frontmatter каждого .md. Не совпало → ошибка сборки.
    title: z.string(),
    client: z.string(),
    order: z.number(),
    external: z.string().url().optional(),   // .optional() — поле необязательное
    social: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
    sections: z.array(z.object({
      heading: z.string(),
      body: z.string(),
      images: z.array(z.string()).default([]),  // имена файлов картинок секции (см. §10.8)
    })),
    results: z.array(z.string()).default([]),  // .default([]) — если нет, подставит пустой массив
    media: z.array(z.string()).default([]),    // слоты медиа «coming soon» (см. §10.9)
  }),
});

export const collections = { cases };  // регистрируем коллекцию под именем "cases"
```
**Зачем схема:** это контракт. Если в `.md` забыть `title` или написать `order: "1"` строкой
вместо числа — сборка упадёт с понятной ошибкой, а не молча сломает страницу. Плюс из схемы
Astro генерирует TypeScript-типы: в шаблоне `entry.data.title` знает, что это строка.

### 5.7 `src/content/cases/grow-food.md` (и `priem.md`)
```yaml
---                         # YAML-frontmatter: структурированные данные кейса
title: Brand transformation
client: Grow Food
order: 1                    # число → попадёт в сортировку списка Works
external: https://growfood.pro/
social:
  - { label: IG, url: "https://instagram.com/" }   # массив объектов
  - { label: TG, url: "https://t.me/" }
sections:
  - heading: Context
    body: >-                # >- = «свёрнутый» блок: переносы строк станут пробелами,
      Grow Food is a ...    #      финальный перевод строки убирается. Удобно для длинного текста.
  - heading: Challenge
    body: >- ...
results:
  - "+200% brand awareness growth within a year after the rebrand"
---

Full brand platform: positioning, identity, and rollout across every touchpoint.
# ^ это «тело» Markdown. Сейчас не используется в рендере, но доступно как контент при желании.
```
**Решение по моделированию:** мы положили секции кейса (`Context/Challenge/...`) в **структурное**
поле `sections` (массив), а не в свободный Markdown-текст. Так рендер кейса будет
data-driven: пробежимся по `sections.map(...)` и одинаково оформим каждый блок. Добавить кейс =
скопировать `.md`, заменить тексты.

### 5.8 `src/layouts/Base.astro`
```astro
---
import '../styles/global.css';   // импорт CSS в layout = стили на всех страницах, где он используется

interface Props {                // описываем, какие props принимает компонент (типобезопасность)
  title: string;
  description?: string;          // ? = необязательный
  lang?: 'en' | 'ru';
}

const { title, description = '...', lang = 'en' } = Astro.props;
// Astro.props — объект переданных пропсов. Деструктурируем со значениями по умолчанию.
---

<!doctype html>
<html lang={lang}>            <!-- атрибут из переменной: важно для SEO и доступности -->
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <slot name="head" />       <!-- ИМЕНОВАННЫЙ слот: страница может добавить теги в <head> -->
  </head>
  <body class="min-h-screen antialiased">
    <slot />                   <!-- БЕЗЫМЯННЫЙ слот: сюда встанет содержимое страницы -->
  </body>
</html>
```
**Слоты** — это «дырки», куда родитель вставляет контент. `<slot />` — главная дырка;
`<slot name="head" />` — именованная, заполняется через `<Fragment slot="head">...</Fragment>`.
Паттерн layout: один каркас `<html>/<head>/<body>` на все страницы, не дублируем мету в каждой.

### 5.9 `src/components/Nav.astro`
```astro
---
import { useTranslations, type Lang } from '../i18n/ui';
interface Props { lang: Lang; }
const { lang } = Astro.props;
const t = useTranslations(lang);              // переводчик под текущий язык
const base = lang === 'en' ? '' : `/${lang}`; // префикс пути: en → "", ru → "/ru"
---
<header class="border-b-2 border-ink">
  <nav class="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
    <a href={`${base}/`} class="font-semibold tracking-tight">Maria Tkachenko</a>
    <ul class="flex gap-6 text-sm">
      <li><a href={`${base}/#about`} class="hover:underline">{t('nav.about')}</a></li>
      <li><a href={`${base}/#works`} class="hover:underline">{t('nav.works')}</a></li>
    </ul>
  </nav>
</header>
```
Tailwind-классы по-человечески: `mx-auto` — центрируем блок; `flex ... justify-between` —
лого слева, меню справа; `max-w-5xl` — ограничиваем ширину контента; `px-6 py-4` — внутренние
отступы; `border-b-2 border-ink` — нижняя граница 2px цветом нашего токена `ink`.
`base` решает i18n-ссылки: на ru-странице ссылки ведут на `/ru/...`.

### 5.10 `src/components/Footer.astro`
```astro
---
import { useTranslations, type Lang } from '../i18n/ui';
interface Props { lang: Lang; }
const { lang } = Astro.props;
const t = useTranslations(lang);
const year = new Date().getFullYear();   // год вычисляется ПРИ СБОРКЕ (это серверный код)
---
<footer class="border-t-2 border-ink">
  <div class="... flex-col gap-2 ... sm:flex-row sm:justify-between">
    <span>© {year} Maria Tkachenko. {t('footer.rights')}.</span>
    <div class="flex gap-4"> <a>LinkedIn</a> <a>Telegram</a> <a>WhatsApp</a> </div>
  </div>
</footer>
```
`sm:` — это **breakpoint-префикс** Tailwind: стиль применяется от ширины `sm` (≈640px) и выше.
Так делается адаптив: по умолчанию (мобайл) колонка (`flex-col`), на широких экранах — строка
(`sm:flex-row`). Это **mobile-first** подход.

### 5.11 `src/components/CaseCard.astro`
```astro
---
import { type Lang } from '../i18n/ui';
interface Props { href: string; title: string; client: string; lang: Lang; }
const { href, title, client } = Astro.props;
---
<a href={href}
   class="group flex aspect-square flex-col justify-end border-2 border-ink p-6
          transition-colors hover:bg-ink hover:text-paper">
  <p class="text-sm uppercase tracking-wide opacity-70">{client}</p>
  <h3 class="mt-1 text-2xl font-bold">{title}</h3>
</a>
```
**Слабая связанность:** карточка НЕ знает про content-коллекцию. Она принимает готовые `href/title/
client`. Так её можно переиспользовать с любыми данными, а логика «откуда данные» живёт на странице.
`aspect-square` — квадрат; `hover:bg-ink hover:text-paper` — инверсия цветов при наведении;
`transition-colors` — плавный переход.

### 5.12 `src/pages/index.astro` (главная EN)
```astro
---
import { getCollection } from 'astro:content';   // API чтения коллекций
import Base from '../layouts/Base.astro';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
import CaseCard from '../components/CaseCard.astro';
import { useTranslations } from '../i18n/ui';

const lang = 'en';
const t = useTranslations(lang);

const cases = (await getCollection('cases'))           // читаем все кейсы (await — это асинхронно)
  .sort((a, b) => a.data.order - b.data.order);        // сортируем по order (1, 2, ...)
---
<Base title="Maria Tkachenko — Brand strategist" lang={lang}>
  <Nav lang={lang} />
  <main class="mx-auto max-w-5xl px-6">
    <section id="about" class="py-20"> ...hero... </section>
    <section id="works" class="py-12">
      <h2>{t('works.title')}</h2>
      <div class="grid gap-6 sm:grid-cols-2">
        {cases.map((entry) => (              {/* на каждый кейс — карточка */}
          <CaseCard href={`/cases/${entry.id}`}
                    title={entry.data.title}
                    client={entry.data.client}
                    lang={lang} />
        ))}
      </div>
    </section>
  </main>
  <Footer lang={lang} />
</Base>
```
Здесь видно весь конвейер: страница **читает данные** (getCollection) → **готовит** (sort) →
**рендерит** через переиспользуемые компоненты. `entry.id` — это имя файла кейса (`grow-food`),
из него строим ссылку `/cases/grow-food` (саму страницу кейса сделаем в Этапе 3).

### 5.13 `src/pages/ru/index.astro` (главная RU)
То же, что EN, но `lang = 'ru'`, тексты hero на русском, и ссылки на кейсы с префиксом `/ru/...`.
Пути импортов на уровень глубже (`../../`), потому что файл лежит в подпапке `ru/`.

### 5.14 `public/favicon.svg`
Иконка вкладки. SVG = векторная, чёткая на любом экране. Временная заглушка (буква «M» на чёрном).
Лежит в `public/`, поэтому доступна по `/favicon.svg` без обработки.

---

## 6. Паттерны, которые мы используем

1. **Layout + Slots** — единый каркас страницы (`Base.astro`), страницы наполняют его через слоты.
   Меняешь мету/шрифт в одном месте — меняется везде.
2. **Типизированные Props** (`interface Props` + `Astro.props`) — компонент документирует свой
   «вход», ошибки ловятся на этапе типов.
3. **Content Collections + zod** — контент отделён от кода, валидируется схемой, типизирован.
   Добавление кейса не требует трогать шаблоны.
4. **Data-driven рендер** (`.map()` по коллекции) — список works генерируется из данных.
5. **i18n словарём + префиксом пути** — один набор компонентов, тексты из `ui.ts`, язык — проп.
6. **Дизайн-токены в `@theme`** — единый источник цветов/шрифтов, утилиты Tailwind из коробки.
7. **Слабая связанность компонентов** — `CaseCard` не знает про источник данных; данные готовит страница.
8. **Mobile-first адаптив** — базовые стили для мобайла, `sm:`/`md:` добавляют для широких экранов.

---

## 7. Глоссарий

- **SSG (Static Site Generation)** — генерация готового HTML на этапе сборки. Наш режим (`output: "static"`).
- **Frontmatter** — блок между `---`. В `.astro` это серверный код; в `.md` — YAML-данные.
- **Slot** — место в компоненте, куда родитель вставляет контент.
- **Props** — входные параметры компонента.
- **Island (остров)** — интерактивный компонент с JS, помеченный `client:*`. Пока не используем.
- **zod** — библиотека описания и проверки схем данных.
- **Loader** — источник контента для коллекции (у нас `glob` по `.md`).
- **Breakpoint** — порог ширины экрана для адаптивных стилей (`sm`, `md`, `lg`...).
- **Token (дизайн-токен)** — именованная переменная дизайна (цвет, шрифт) в `@theme`.
- **Vite** — быстрый сборщик, на котором работает Astro.

---

## 8. Этап 2: вёрстка главной по макету

В Этапе 1 страница была скелетом (nav + короткий hero + works). В Этапе 2 мы привели её к
**структуре макета Miro 1:1** и применили несколько новых приёмов. Главная идея этапа —
**композиция из секционных компонентов**: страница больше не содержит разметку секций сама,
она лишь «собирает» их в нужном порядке.

### 8.1 Соответствие макет → код

| Секция макета (`.design/specs/00-site-overview.md`) | Компонент | Статус |
|---|---|---|
| Header: `About`/`Works` слева, соц-иконки справа | `Nav.astro` + `SocialLinks.astro` | ✅ 1:1 |
| Hero: текст слева, фото справа | `Hero.astro` | ✅ (фото — плейсхолдер) |
| About (2 абзаца) + bridge-строка | `About.astro` | ✅ 1:1 |
| Works: 2 карточки | `Works.astro` + `CaseCard.astro` | ✅ (превью брендов) |
| Archive | `Archive.astro` | ⏳ заглушка (нет контента на доске) |
| Publications: сетка 3×2 | `Publications.astro` | ⏳ заглушка (нет логотипов) |

### 8.2 Новый паттерн: композиция из секционных компонентов

Сравни `index.astro` до и после:
- **Было (Этап 1):** вся разметка hero/works прямо в странице → дублируется между `/` и `/ru/`.
- **Стало (Этап 2):** страница импортирует секции и расставляет их:
```astro
<main class="mx-auto max-w-5xl px-6">
  <Hero lang={lang} />
  <About lang={lang} />
  <Works lang={lang} />
  <Archive lang={lang} />
  <Publications lang={lang} />
</main>
```
Каждая секция — отдельный файл, принимает `lang` и сама берёт тексты из `ui.ts`. Плюсы:
страница читается как оглавление; правки секции локальны; en/ru-страницы отличаются **только** `lang`.

### 8.3 Новый паттерн: `astro:assets` и `<Image>`

Картинки бренда теперь оптимизируются автоматически. В `Works.astro`:
```astro
import growFood from '../assets/growfood-logo.png';  // импорт картинки из src/ даёт ImageMetadata
```
В `CaseCard.astro`:
```astro
import { Image } from 'astro:assets';
<Image src={image} alt={alt} class="h-full w-full object-cover" />
```
Что делает `<Image>` при сборке: конвертирует в современный формат (**WebP**), ужимает, проставляет
`width`/`height` (чтобы страница не «прыгала» при загрузке — это важно для метрики CLS и SEO).
В логах сборки видно: `growfood-logo` 75kB → 43kB, `priem-logo` 10kB → 1kB.

> Почему картинки в `src/assets/`, а не в `public/`? Только то, что в `src/`, проходит через
> оптимизатор. Файлы из `public/` отдаются как есть. Поэтому фото для `<Image>` кладём в `src/`.

### 8.4 Новый паттерн: переиспользуемый компонент со списком-пропом

`SocialLinks.astro` не знает, какие именно соцсети — он принимает массив и рисует кружки:
```astro
interface Social { label: string; url: string; }
interface Props { items: Social[]; }
const { items } = Astro.props;
...
{items.map((s) => (
  <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}> {s.label} </a>
))}
```
`target="_blank"` — открыть в новой вкладке; `rel="noopener noreferrer"` — безопасность (новая
вкладка не получит доступ к `window.opener`); `aria-label` — доступность для скринридеров (текст
«LI» сам по себе непонятен). В Этапе 3 этот же компонент переиспользуем на страницах кейсов (там
IG/TG/VK).

### 8.5 Построчно — ключевые новые/изменённые файлы

**`src/components/Hero.astro`** — двухколоночный hero:
```astro
<div class="grid items-center gap-10 sm:grid-cols-[1fr_auto]">
```
`grid-cols-[1fr_auto]` — произвольный шаблон колонок Tailwind: первая колонка тянется (`1fr`),
вторая по содержимому (`auto`). На мобайле (без `sm:`) колонок нет — блоки идут друг под другом.
```astro
<div class="aspect-[3/4] ... border-2 border-ink" role="img" aria-label={t('hero.photoAlt')}>Photo</div>
```
Плейсхолдер фото: `aspect-[3/4]` держит пропорции портрета; `role="img"`+`aria-label` — чтобы
скринридер понимал, что это будущее изображение. Заменим на `<Image>` в Этапе 4.

**`src/components/About.astro`** — `space-y-5` ставит вертикальные отступы между абзацами;
bridge-строка крупнее и жирная (`text-xl font-semibold`), как акцент в макете.

**`src/components/Works.astro`** — здесь живёт логика данных (`getCollection('cases')`, сортировка,
сопоставление картинок по `entry.id`). `Record<string, ImageMetadata>` — словарь «id кейса →
картинка». Страницы об этом не знают — это и есть слабая связанность.

**`src/components/Archive.astro` / `Publications.astro`** — заглушки. У Publications сетка 6 ячеек
(3×2 по макету) генерируется так:
```astro
const cells = Array.from({ length: 6 }); // массив из 6 пустых элементов — чтобы было что перебрать
...
<div class="grid grid-cols-2 gap-4 sm:grid-cols-3">{cells.map(() => <div .../>)}</div>
```
`border-dashed` — пунктир, визуально кричит «это плейсхолдер». На мобайле 2 колонки, на `sm:` — 3
(6 ячеек → 2 ряда по 3 = сетка 3×2, как в макете).

**`src/components/Nav.astro`** — переписан под макет: слева `About`/`Works`, справа `<SocialLinks>`.
Тексто-лого убрано (в макете его нет; имя звучит в hero).

**`src/components/Footer.astro`** — ужат до строки копирайта (соцсети уехали в шапку).

**`src/pages/index.astro` и `ru/index.astro`** — стали тонкими: только импорт секций и их порядок.

### 8.6 Что осталось плейсхолдерами (и почему)
- **Фото в hero** — нет файла фотографии Марии.
- **Archive / Publications** — на доске это пустые рамки, реального контента (проектов, логотипов) нет.
- **Соц-URL** — стоят заглушки (`linkedin.com/`, `t.me/` …), нужны реальные профили.
- **`site` в `astro.config.mjs`** — `https://example.com`, ждёт выбранный домен (`becom.ing`?).

Всё это помечено `TODO`/`coming soon` в коде и перечислено в `CONTEXT_LANDING.md` §9.

---

## 9. Деплой: как сайт попадает в интернет

> Этот раздел — теория (код пока не трогаем). Цель — понять, что такое деплой статического
> сайта, чем он отличается от «обычного» хостинга, и почему наш проект можно опубликовать
> **бесплатно**.

### 9.1 Главная идея: у нас на выходе просто папка

`npm run build` собирает проект в папку **`dist/`** — это готовые `.html`, `.css`, картинки.
Никакого «работающего сервера» внутри нет: это набор файлов, как фотографии в папке. «Задеплоить»
= **положить эту папку на сервер, который раздаёт файлы по HTTP**.

```
исходники (src/, .md)  ──[ npm run build ]──▶  dist/  ──[ загрузка на хостинг ]──▶  https://сайт
       что мы пишем                         готовый HTML            раздаётся миру
```

Это называется **статический сайт** (SSG, см. глоссарий). Сравни с двумя другими типами:

| Тип | Что крутится на сервере | Пример | Что нужно от хостинга |
|---|---|---|---|
| **Статика (наш случай)** | ничего, только отдача файлов | Astro `output: static` | просто файловый CDN — **дёшево/бесплатно** |
| SSR (сервер-рендер) | Node генерит HTML на каждый запрос | Next.js SSR, Astro SSR | живой Node-процесс — дороже |
| SPA | один пустой `index.html` + большой JS | классический React | как статика, но плохо для SEO |

Наш сайт — первая строка. Поэтому ему **не нужен Node на сервере**, отсюда и бесплатные тарифы:
раздавать готовые файлы провайдеру почти ничего не стоит.

### 9.2 Бесплатные хостинги — сравнение

| Хостинг | Трафик (free) | Сборок/мес | Домен + SSL | Нюанс |
|---|---|---|---|---|
| **Cloudflare Pages** | **без лимита** | 500 | ✅ free | DNS-домен у того же провайдера — субдомен в пару кликов |
| Netlify | 100 ГБ/мес | 300 мин | ✅ free | формы из коробки (Netlify Forms) |
| Vercel | 100 ГБ/мес | щедро | ✅ free | free-план запрещает коммерцию (для портфолио — серая зона) |
| GitHub Pages | 100 ГБ (soft) | через Actions | ✅ free | возни больше: сам настраиваешь Action и `base` |

**Наш выбор — Cloudflare Pages** (рекомендация; в `CONTEXT_LANDING.md` ещё не зафиксировано): безлимитный трафик,
нет вопросов про «коммерческое использование», и домен мы и так планируем держать на Cloudflare,
так что субдомен `maria.<домен>` привяжется в той же панели.

### 9.3 Два способа задеплоить

**А. Git-интеграция (CI/CD) — рекомендуемый.**
Подключаешь GitHub-репозиторий к Cloudflare Pages один раз и задаёшь:
- Build command: `npm run build`
- Output directory: `dist`

Дальше при каждом `git push` хостинг сам клонирует репо, запускает сборку и публикует `dist/`.
Это и есть **CI/CD** (Continuous Integration / Continuous Deployment): «запушил → автоматически
собралось и выехало в прод». Пуш в ветку с PR обычно даёт ещё и **preview-ссылку** (отдельный
URL для проверки до слияния в `main`).

**Б. Прямая загрузка (вручную).**
```bash
npm run build
npx wrangler pages deploy dist
```
`wrangler` — CLI Cloudflare. Собрал локально → залил папку. Без Git, удобно для разового теста.

### 9.4 Что обязательно сделать в коде перед первым деплоем

1. **`site` в `astro.config.mjs`** — заменить заглушку `https://example.com` на реальный домен.
   Без этого `sitemap` и Open Graph-теги сгенерируются с неправильным абсолютным URL.
2. **Sitemap** — `npx astro add sitemap` (это Этап 4). Astro сгенерит `/sitemap-index.xml` — карту
   для поисковиков.
3. **`robots.txt`** — положить в `public/`, указать в нём ссылку на sitemap.

Пункты 2–3 — часть Этапа 4 (SEO), здесь упомянуты, чтобы видеть всю картину перед публикацией.

### 9.5 Глоссарий деплоя
- **Деплой** — публикация собранного сайта на сервер, доступный из интернета.
- **CDN** — сеть серверов по всему миру, раздающих копии твоих файлов из ближайшей к юзеру точки
  (быстрее загрузка → лучше SEO).
- **CI/CD** — автоматизация «собрать и выложить» по триггеру (у нас — `git push`).
- **Preview deploy** — временный отдельный URL для проверки изменений до слияния в прод.
- **SSL/TLS** — шифрование (`https://`). На всех перечисленных хостингах выдаётся бесплатно и авто.

---

## 10. Этап 3: страницы кейсов и динамические маршруты

В Этапах 1–2 у нас были только «статичные» страницы (`index.astro` → один URL). В Этапе 3
появляется новое: **одна страница-шаблон порождает много URL** — по странице на каждый кейс.
Это и есть **динамический маршрут**.

### 10.1 Главная идея: `[slug].astro` + `getStaticPaths`

Файл с квадратными скобками в имени — `src/pages/cases/[slug].astro` — это **шаблон маршрута**,
а не одна страница. `slug` — параметр, который подставляется в URL. Чтобы Astro знал, какие
именно значения `slug` существуют (ведь сайт статический — все страницы создаются при сборке),
шаблон обязан экспортировать функцию **`getStaticPaths`**:

```astro
export async function getStaticPaths() {
  const cases = await getCollection('cases');   // читаем все кейсы из коллекции
  return cases.map((entry) => ({
    params: { slug: entry.id },   // entry.id = имя файла → /cases/grow-food, /cases/priem
    props: { entry },             // саму запись прокидываем в страницу как проп
  }));
}
```

Что здесь происходит при сборке:
- `getStaticPaths` возвращает **массив маршрутов**. На каждый элемент Astro генерит отдельный HTML.
- `params.slug` определяет **URL** (`/cases/grow-food`).
- `props.entry` — **данные**, которые получит страница. Их забираем через `Astro.props`:
  ```astro
  const { entry } = Astro.props;
  ```

> **Почему `params` и `props` раздельно?** `params` — это часть адреса (то, что в URL).
> `props` — произвольные данные для рендера. Мы могли бы по `slug` заново искать кейс внутри
> страницы, но раз уже нашли в `getStaticPaths` — просто передаём готовый объект через `props`.
> Меньше работы и нет повторного поиска.

### 10.2 Архитектура: тонкие страницы + один компонент-статья

Кейс-страниц у нас четыре (2 кейса × 2 языка), но вёрстка у них одна. Чтобы не дублировать,
вся разметка кейса живёт в **`src/components/CaseArticle.astro`**, а страницы — тонкие:

```
src/pages/cases/[slug].astro       (lang='en')  ┐
                                                 ├─▶  CaseArticle.astro  (вся вёрстка кейса)
src/pages/ru/cases/[slug].astro    (lang='ru')  ┘
```

Каждая страница делает три вещи: `getStaticPaths`, задаёт `lang` и `<title>`/`description`,
и отдаёт `entry` в `<CaseArticle>`. Это тот же приём «тонкая страница = оглавление», что и на
главной (§8.2).

### 10.3 Типизация записи коллекции — `CollectionEntry`

`CaseArticle` принимает не «голый объект», а **типизированную запись коллекции**:

```astro
import type { CollectionEntry } from 'astro:content';
interface Props {
  entry: CollectionEntry<'cases'>;   // тип выводится из схемы zod в content.config.ts
  lang: Lang;
}
```

`CollectionEntry<'cases'>` — это тип, который Astro **сгенерировал из нашей zod-схемы**. Поэтому
`entry.data.title` известно как `string`, `entry.data.results` — как `string[]`, а опечатка
`entry.data.titlle` подсветится ошибкой ещё до сборки. Связь «схема → типы → автодополнение»
работает бесплатно.

### 10.4 Рендер data-driven: секции и метрики

Тело кейса мы рисуем перебором массива `sections` (тот самый структурный массив из §5.7):

```astro
{sections.map((s) => (
  <section>
    <h2 class="text-sm uppercase tracking-widest opacity-70">{s.heading}</h2>
    <p class="mt-3 text-lg leading-relaxed">{s.body}</p>
  </section>
))}
```

Добавить/убрать блок в кейсе = править `.md`, шаблон не трогаем. Блок **Results** рисуется из
отдельного массива `results` (метрики), обёрнут в рамку — это визуальный акцент, как в макете.

### 10.5 Условный рендер — `&&`

Не у каждого кейса есть лого, внешняя ссылка и соцсети. Чтобы не рисовать пустые блоки,
используем приём **`условие && разметка`**:

```astro
{external && (
  <a href={external} target="_blank" rel="noopener noreferrer">{t('case.visit')} ↗</a>
)}
{social.length > 0 && <SocialLinks items={social} />}
```

Как читается: «если `external` истинно — отрендерить ссылку, иначе ничего». В JSX/Astro
`false`/`null`/`undefined` просто **не выводятся** в HTML. Это стандартный способ показать
блок только при наличии данных. `SocialLinks` здесь — **тот самый** компонент из шапки (§8.4),
переиспользован без изменений: на главной в нём LI/WA/TG, тут — IG/TG или IG/VK из `.md` кейса.

### 10.6 i18n кейсов: что переведено, а что нет

Сейчас **контент** кейсов (тексты Context/Challenge/…) — единый, английский: он лежит в одном
`.md` без языковых вариантов. Переводится только **обвязка** (кнопка «Visit website»,
заголовок «Results», nav, footer) — через ключи `case.*` в `ui.ts`. Поэтому `/ru/cases/grow-food`
показывает английский разбор кейса в русском интерфейсе.

> Когда понадобится полный перевод кейсов — это отдельное решение по моделированию: либо два
> `.md` на язык (`grow-food.en.md` / `grow-food.ru.md`), либо языковые поля внутри схемы. Пока
> по макету контент EN — не усложняем.

### 10.7 Связь с главной

Карточки в `Works.astro` ведут на `${base}/cases/${entry.id}` (§8.5), а назад-ссылка в
`CaseArticle` — на `${base}/#works`. `base` (`''` для en, `/ru` для ru) держит навигацию внутри
выбранного языка. Круг замкнулся: главная → кейс → обратно к Works, на обоих языках.

### 10.8 Картинки внутри секций (как свёрстано в Miro)

В Miro страница кейса — это не сплошной текст: картинки стоят **внутри своих секций** (фото
«было/стало» у Context, иллюстрация у Challenge, широкий кадр у Execution). Чтобы повторить это
data-driven, мы расширили схему (§5.6): у секции появилось поле `images` — **массив имён файлов**
из `src/assets`.

```yaml
- heading: Challenge
  body: >- …
  images:
    - growfood-challenge.png      # имя файла, без пути
```

**Почему имена файлов строкой, а не импорт?** В `.md` нельзя написать `import`. Поэтому в `.md`
лежит только **имя**, а превратить его в оптимизируемую картинку — задача компонента. Делаем это
через `import.meta.glob`:

```astro
const imageModules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/*.{png,jpg,jpeg,webp,avif}',
  { eager: true },               // eager = импортировать сразу при сборке, а не лениво
);
const assets: Record<string, ImageMetadata> = {};
for (const [path, mod] of Object.entries(imageModules)) {
  const name = path.split('/').pop();   // '../assets/x.png' → 'x.png'
  if (name) assets[name] = mod.default; // строим словарь «имя файла → картинка»
}
```

`import.meta.glob` — это возможность Vite: по маске собрать **все** подходящие файлы в объект
`{ путь: модуль }`. С `eager: true` модули подгружаются сразу, и `mod.default` — это
`ImageMetadata` (та самая, что нужна `<Image>`). Дальше в шаблоне: `assets[file]` → `<Image>`.

Рендер картинок секции (с адаптивной сеткой — два кадра Priem встают в ряд на широком экране):

```astro
{s.images.length > 0 && (
  <div class:list={['mt-6 grid gap-4', s.images.length > 1 && 'sm:grid-cols-2']}>
    {s.images.map((file) => assets[file] ? (
      <Image src={assets[file]} alt={`${client} — ${s.heading}`} class="w-full border-2 border-ink" />
    ) : null)}
  </div>
)}
```

**`class:list`** — директива Astro для условных классов: принимает массив, выкидывает `false`/
`null`, склеивает остальное. Здесь `sm:grid-cols-2` добавляется **только если картинок больше
одной** — иначе одиночный кадр занимает всю ширину.

### 10.9 Медиа-слоты «coming soon»

На доске есть рамки-плейсхолдеры под медиа, которых ещё нет: скринкасты приложения/сайта, гайд,
рекламные ролики, фото упаковки. По спеке (`00-site-overview.md`) русские подписи в этих рамках —
**служебные пометки автора**, а не контент сайта. Мы смоделировали их полем `media` (массив строк)
и дали нейтральные **английские** ярлыки, а рендерим как пунктирные тайлы-заглушки:

```astro
{media.length > 0 && (
  <div class="grid gap-4 sm:grid-cols-2">
    {media.map((label) => (
      <div class="flex aspect-video items-center justify-center border-2 border-dashed border-ink/40 …">
        {label}
      </div>
    ))}
  </div>
)}
```

Когда появятся реальные файлы (скринкасты/ролики/фото), эти слоты заменим на `<Image>`/видео-эмбеды
(Vimeo/YouTube, см. `CONTEXT_LANDING.md` §4) — структура страницы уже готова их принять.

---

## 11. Этап 4: SEO-фундамент

Сайт-портфолио живёт ради того, чтобы его **находили**. Этап 4 — это техническая база SEO:
сделать сайт понятным для поисковика и красивым при шеринге в соцсетях. Ничего из этого не видно
глазом на странице — всё живёт в `<head>` и в служебных файлах.

### 11.0 Ключевая зависимость: `site`

Почти весь SEO строится на **абсолютных** URL (`https://домен/путь`). Поэтому первое — поле `site`
в `astro.config.mjs`. Из него Astro строит canonical, hreflang, OG-ссылки и sitemap.

> ⚠️ **Домен ещё не выбран окончательно.** Стоит **временное** `https://maria.becom.ing` (план:
> портфолио на субдомене becom.ing). Перед реальным деплоем заменить на настоящий — это **одна
> строка** в конфиге (+ одна в `public/robots.txt`). Всё остальное подтянется автоматически.

### 11.1 Sitemap — карта сайта

`@astrojs/sitemap` подключается в `integrations` (§5.2). При `build` она обходит все
сгенерированные страницы и пишет `dist/sitemap-index.xml` (оглавление) → `sitemap-0.xml` (сами URL).
Зачем: поисковику не нужно угадывать структуру — он берёт готовый список всех 6 страниц.

Мы передали ей `i18n`-настройку, и в карте появились **перекрёстные hreflang-связи**:
```xml
<url>
  <loc>https://maria.becom.ing/cases/priem/</loc>
  <xhtml:link rel="alternate" hreflang="en-US" href=".../cases/priem/"/>
  <xhtml:link rel="alternate" hreflang="ru-RU" href=".../ru/cases/priem/"/>
</url>
```
Так Google понимает: en- и ru-версии — это **одна** страница на двух языках, а не дубликат
(дубликаты вредят ранжированию).

### 11.2 `robots.txt`

Лежит в `public/` → копируется в корень как `/robots.txt`. Это первый файл, который читает краулер:
```
User-agent: *
Allow: /
Sitemap: https://maria.becom.ing/sitemap-index.xml
```
`User-agent: *` — правило для всех роботов; `Allow: /` — разрешаем обходить всё; `Sitemap:` — прямая
ссылка на карту (абсолютная, того же домена).

### 11.3 SEO-теги в `Base.astro` — единое место для всех страниц

Layout — идеальное место для `<head>`-тегов: задаём один раз, работает на всех страницах. Страница
передаёт только данные (`title`, `description`, `ogType`, опц. `ogImage`), а сборка тегов — в `Base`.

**Canonical.** «Какой URL этой страницы считать главным» — защита от дублей (со слешем/без,
с трекинг-параметрами):
```astro
const canonical = new URL(Astro.url.pathname, Astro.site!);   // абсолютный URL текущей страницы
...
<link rel="canonical" href={canonical} />
```
`Astro.url` — адрес текущей страницы при сборке; `Astro.site` — домен из конфига. `new URL(путь,
база)` склеивает их в абсолютный. `!` (non-null assertion) — говорим TS «`site` точно задан»
(он задан в конфиге).

**hreflang.** Для каждой страницы перечисляем её версии на других языках. Пути считает хелпер
`alternateLinks` из `ui.ts` (§5.5) — он зеркалит правило маршрутизации (снять `/ru` → базовый путь):
```astro
{alternates.map((alt) => (
  <link rel="alternate" hreflang={alt.lang} href={new URL(alt.path, site)} />
))}
<link rel="alternate" hreflang="x-default" href={new URL('/', site)} />
```
`x-default` — версия «по умолчанию» для языков, которых у нас нет (указываем на en-главную).

**Open Graph + Twitter Card.** Как ссылка выглядит при шеринге (заголовок, описание, картинка):
```astro
<meta property="og:type" content={ogType} />        {/* website | article */}
<meta property="og:title" content={title} />
<meta property="og:url" content={canonical} />
<meta property="og:locale" content={localeTag[lang]} />  {/* en_US | ru_RU */}
{ogImageUrl && <meta property="og:image" content={ogImageUrl} />}
```
Картинка (`og:image`) рендерится **только если страница её передала** (условный `&&`, §10.5).
Соц-картинки 1200×630 у нас пока нет → тег опущен, а `twitter:card` падает на `summary` (без
большой картинки). Это честно: лучше не отдавать битую ссылку на картинку.

**`og:type` по страницам.** Главная — `website` (дефолт в `Base`), кейсы передают `ogType="article"`
(содержательно это статьи-разборы). Меняет только сигнал соцсетям, не вёрстку.

### 11.4 Почему теги — в `<head>`, а не в теле

Поисковик и соцсети-боты читают именно `<head>` (часто даже не рендеря тело). У нас сайт —
статический HTML (SSG), поэтому все эти теги **уже впечатаны** в файл на этапе сборки: боту не нужно
выполнять JS, чтобы их увидеть. Это и есть главное SEO-преимущество Astro из §0 — здесь оно «выстрелило».

### 11.5 Что осталось на потом (Этап 4 не закрыт полностью)
- **Реальный домен** → заменить `site` и `Sitemap:` в robots.txt.
- **Соц-картинка** (`og:image`, 1200×630) — нет файла; добавим в `public/` и пробросим `ogImage`.
- **Lighthouse-прогон** — замерить производительность/доступность/SEO вживую после деплоя.
- **Структурированные данные** (JSON-LD `Person`/`Article`) — следующий уровень SEO, опционально.

### 11.6 Глоссарий (SEO)
- **canonical** — тег, указывающий «главный» URL страницы; борется с дублями.
- **hreflang** — тег связи языковых версий; `x-default` — версия по умолчанию.
- **Open Graph (OG)** — протокол мета-тегов для превью ссылок в соцсетях/мессенджерах.
- **sitemap** — XML-карта всех страниц для поисковиков.
- **robots.txt** — текстовый файл с правилами обхода для краулеров.
- **BCP-47** — стандарт языковых тегов (`en-US`, `ru-RU`).

---

## 12. Этап 5: дизайн-полировка и computer-vision-воркфлоу

Этапы 1–4 строили **структуру** (вёрстку, контент, SEO). Этап 5 — про **визуальное качество**:
довести готовый сайт до состояния «на него приятно смотреть». Это отдельный навык: тут важны не
новые фичи, а мелочи — скругления, толщина обводок, ширина строки текста, единообразие иконок.
Главный приём этапа — **визуальная проверка через скриншоты** (computer vision): мы не угадываем,
как выглядит сайт, а буквально его фотографируем и смотрим.

### 12.1 Computer-vision-воркфлоу: как «увидеть» свой сайт

Раньше мы правили код вслепую. Теперь цикл такой:

```
  правка кода  ─▶  npm run dev (живой сервер)  ─▶  headless-браузер делает скриншот
        ▲                                                      │
        └──────────────  смотрю на PNG, нахожу косяк  ◀────────┘
```

**Headless-браузер** — это браузер без окна (Chrome/Edge), которым управляют из командной строки.
Он умеет открыть страницу и сохранить её снимок в PNG. На Windows Chrome лежит по пути
`C:\Program Files\Google\Chrome\Application\chrome.exe`, и снимок делается так:

```powershell
& $chrome --headless=new --disable-gpu --hide-scrollbars `
          --window-size=1280,2400 --screenshot="out.png" "http://localhost:4321/"
```

- `--headless=new` — новый безоконный режим Chrome.
- `--window-size=1280,2400` — «ширина экрана» 1280px (десктоп) и высокий холст, чтобы влезла вся
  длинная страница (Chrome снимает страницу целиком, а не только видимую часть).
- `--virtual-time-budget=3000` — подождать до 3с, пока страница дорисуется (картинки/шрифты), и
  только потом снимать. Без него длинные страницы иногда не успевают и снимок не создаётся.
- `--hide-scrollbars` — убрать полосу прокрутки из кадра.

Дальше PNG **читается тем же инструментом, что и текст** — и его видно как изображение. Если деталь
мелкая (иконки в шапке, толщина рамки), снимок **кропают** (вырезают фрагмент) и при необходимости
увеличивают через `System.Drawing` (встроенная графика .NET в PowerShell):

```powershell
Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Image]::FromFile("shot.png")
$rect = New-Object System.Drawing.Rectangle(1030, 8, 130, 46)   # x,y,ширина,высота вырезаемой области
$bmp  = New-Object System.Drawing.Bitmap(390, 138)              # увеличиваем в 3×
$g    = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = 'NearestNeighbor'                        # без размытия — пиксели чёткие
$g.DrawImage($src, (New-Object System.Drawing.Rectangle(0,0,390,138)), $rect, 'Pixel')
$bmp.Save("crop.png")
```

Именно так мы поймали два бага, которые на глаз в коде не видны: сплющенную иконку LinkedIn и
слишком толстые рамки у Publications.

### 12.2 Баг сплющенной иконки: почему `h-5 w-5` ломает картинку

В шапке три соц-иконки рисовались так:
```astro
<Image src={s.icon} alt={s.label} class="h-5 w-5 ..." />
```
`h-5 w-5` = «высота 20px, ширина 20px» — **жёсткий квадрат**. Это нормально, **если исходный файл
тоже квадратный**. Но `icon-li.png` был **1200×800** (соотношение 3:2), а `icon-tg.png` и
`icon-wa.png` — квадратные (800×800, 500×500). Когда неквадратную картинку засовывают в квадрат
`20×20`, браузер её **сжимает по ширине** — отсюда «сплющенный» LinkedIn.

> **Правило:** размеры в CSS (`h-5 w-5`) **не кропают**, а **масштабируют**. Если пропорции
> CSS-бокса не совпадают с пропорциями файла — картинка искажается. Лечится либо `object-contain`
> (вписать без искажения, но останутся поля), либо приведением **самого файла** к нужным пропорциям.

Мы выбрали второе — **обрезали файл до квадрата**, потому что у LinkedIn-картинки вокруг логотипа
были лишнее пустое поле и значок ®. Кроп делали через `System.Drawing`: сначала programmatically
нашли границы чёрного логотипа (сканируя пиксели, игнорируя правую зону с ®), затем вырезали
квадрат с небольшим полем по центру логотипа и **перезаписали** `icon-li.png` (590→560px квадрат).
Теперь все три файла квадратные → `h-5 w-5` рисует их одинаково, без искажений.

> **Почему правка файла, а не CSS?** `object-contain` оставил бы вокруг «in» пустые поля и значок ®,
> и иконка визуально была бы мельче соседних. Приведя файл к чистому квадрату-логотипу, мы получили
> единый визуальный вес у всех трёх. Оригинал лежал в git — мы пару раз `git checkout -- file` и
> перекропировали, пока ® не ушёл из кадра. Git тут — «кнопка отмены» для бинарников.

### 12.3 Скругление углов: `rounded-[5px]` на всех рамках

Задача дизайна — единый радиус скругления **5px у всех блоков с обводкой**. В Tailwind есть готовые
классы (`rounded`, `rounded-md`, `rounded-lg`), но они дают свои значения (4px, 6px, 8px). Чтобы
задать **точное** значение, используют **arbitrary value** — произвольное значение в квадратных
скобках:

```
rounded-[5px]      /* border-radius: 5px; ровно как просили */
```

Это общий механизм Tailwind: `[...]` = «вставь сюда именно это CSS-значение». Работает с любым
свойством: `w-[37px]`, `top-[3px]`, `bg-[#abc123]`, `grid-cols-[1fr_auto]`. Удобно, когда дизайн
требует число, которого нет в стандартной шкале.

Мы прошли по всем «обведённым» блокам и добавили `rounded-[5px]`:
- чипы Publications, пунктирные плейсхолдеры (Archive, медиа-слоты кейса);
- кнопки «Visit website» / ссылки в кейсе (`border-2`);
- картинки и видео-фреймы в кейсе, карточки Works (у них нет рамки, но скругление уголков
  делает композицию цельной — `overflow-hidden rounded-[5px]` обрезает контент по скруглению).

> **`overflow-hidden` + `rounded`:** само по себе скругление рамки не обрезает то, что внутри
> (картинку, фон). Чтобы содержимое тоже «подстриглось» под уголки, родителю нужен
> `overflow-hidden`. Поэтому у карточек Works и видео-контейнеров стоят оба класса.

### 12.4 Толщина обводки: `border` против `border-2`

Толщина рамки в Tailwind: `border` = 1px, `border-2` = 2px, `border-4` = 4px. У Publications рамки
были `border-2` (2px) — на ч/б макете это выглядело тяжело и «технично». Сделали **тонкими**:
`border` (1px) + приглушили цвет `border-ink/30` (наш чёрный с прозрачностью 30%). Тонкая
полупрозрачная рамка читается как аккуратный контур-тег, а не как жирная коробка.

> **`/30`-синтаксис** — это **opacity-модификатор** цвета в Tailwind: `border-ink/30` =
> «цвет `ink`, но с альфой 30%». Работает для любого цвета и свойства: `bg-ink/90`, `text-ink/70`,
> `border-ink/30`. Удобно делать мягкие контуры и подложки из **одного** токена, не заводя
> отдельные «светлые» цвета.

### 12.5 «Контейнеры должны соотноситься с текстом» — про длину строки

Классическое правило типографики: **строка длиннее ~75 символов читается тяжело** — глаз теряет
начало следующей строки. У нас весь контент жил в `max-w-5xl` (1024px), и абзацы hero растягивались
на всю эту ширину. Исправили, ограничив **текстовые** блоки отдельно от **структурных**:

```astro
<div class="grid ... sm:grid-cols-[minmax(0,1fr)_auto]">
  <div class="max-w-xl">         {/* текст hero: не шире ~36rem ≈ комфортная строка */}
    <h1 ...>…</h1>
    <p ...>…</p>
  </div>
  <div>…фото…</div>
</div>
<p class="mx-auto mt-10 max-w-2xl text-center ...">{bridge}</p>   {/* центрированный bridge сужен */}
```

- `max-w-xl` (≈36rem/576px) на колонке текста — строка становится короче и комфортнее.
- `minmax(0,1fr)` вместо `1fr` в grid — техническая деталь: `1fr` иногда «распирает» колонку под
  длинный неразрывный контент; `minmax(0,1fr)` разрешает колонке **сжиматься** ниже ширины контента,
  и `max-w-xl` реально срабатывает.
- `mx-auto max-w-2xl` на bridge-строке — центрируем и не даём растянуться на всю ширину.

> **Структурная ширина ≠ ширина текста.** Секции по-прежнему `max-w-5xl` (чтобы две карточки Works
> вставали в ряд), но **читаемый текст** внутри сужен. Это и есть «контейнер соотносится с
> текстом»: рамка блока следует за содержимым, а не наоборот.

### 12.6 Publications: подготовка к ссылкам (data-driven, опять)

На макете Miro в рамках Publications могут быть **ссылки** (на статьи/подкасты). Мы заранее
заложили это в данные, не дожидаясь финальных URL: каждый пункт — объект `{ label, url? }`, а рендер
выбирает тег по наличию `url`:

```astro
{items.map((item) =>
  item.url
    ? <a href={item.url} target="_blank" rel="noopener noreferrer" class={chipLink}>{item.label}</a>
    : <div class={chipStatic}>{item.label}</div>
)}
```

Это тот же приём **условного рендера** (§10.5), но применённый к **выбору тега**: есть ссылка —
кликабельный `<a>` с hover-инверсией; нет — статичный `<div>`. Когда придут реальные URL (сверяем с
доской Miro), достаточно дописать `url:` в массив — вёрстку не трогаем.

### 12.7 Чему учит этап

- **Дизайн проверяют глазами, а не воображением.** Скриншот + кроп ловят то, что в коде незаметно.
- **Искажение картинки** почти всегда = несовпадение пропорций файла и CSS-бокса. Чини файл или
  ставь `object-contain`.
- **Arbitrary values `[...]`** дают точные значения, когда шкалы Tailwind не хватает.
- **Opacity-модификатор `/NN`** — мягкие контуры и подложки из одного токена.
- **Длина строки** — реальный параметр читабельности; текст сужают независимо от секции.
- **Готовь данные под будущее** (опц. `url`) — потом не придётся переписывать вёрстку.

### 12.8 Иконки как inline-SVG (вместо растровых PNG)

В §12.2 мы чинили сплющенную растровую иконку обрезкой файла. Но три PNG-иконки всё равно были
**неоднородны**: разные исходные холсты, разная «толщина» чёрного квадрата, разный радиус скруглений.
Сравнивать и подгонять растр — гиблое дело. Правильное решение для иконок — **векторные SVG-глифы из
одного набора** ([simple-icons](https://simpleicons.org/)). Тогда они по определению одинаковы:
один `viewBox="0 0 24 24"`, один способ покраски, один размер.

Мы встроили глифы **инлайном** прямо в `Nav.astro` — массив `{ label, url, path }`, где `path` —
это строка `d` (геометрия глифа), и рисуем:
```astro
<svg viewBox="0 0 24 24" class="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
  <path d={s.path} />
</svg>
```
Ключевые моменты:
- **`fill="currentColor"`** — глиф красится текущим цветом текста. Значит цветом управляет CSS:
  `text-ink/80` на ссылке + `hover:text-ink`. Один механизм цвета для всех трёх → единообразие.
- **`viewBox` + `h/w`** — иконка масштабируется векторно, без искажений на любом размере (в отличие
  от растра из §12.2). Размер один (`18px`) → одинаковый визуальный вес.
- **`aria-hidden="true"`** на `<svg>` + **`aria-label`** на родительской `<a>` — для скринридера
  важна ссылка-назначение («LinkedIn»), а декоративный глиф он пропускает.

> **Inline-SVG vs `<img src=icon.svg>`:** инлайн позволяет красить глиф через `currentColor` и
> анимировать в CSS (hover), не делая лишних сетевых запросов. Для пары иконок инлайн — оптимально.
> Растровые `icon-*.png` после этого осиротели (больше нигде не используются) — их можно удалить.

### 12.9 Моделирование ориентации видео (union + `transform` в zod)

Видео в кейсе бывают **горизонтальные** (16:9, обычный YouTube) и **вертикальные** (9:16, Shorts/
сторис). Раньше схема знала только `videos: string[]` и насильно рисовала всё как 16:9 — вертикальные
ролики плющились. Нужно хранить ориентацию.

Чтобы не раздувать `.md` (где большинство видео — горизонтальные), мы сделали поле, принимающее
**И строку, И объект**, через `z.union`, а потом привели всё к единому виду через `.transform`:
```ts
videos: z
  .array(z.union([
    z.string().url(),                                           // "…": горизонтальное (кратко)
    z.object({ url: z.string().url(), vertical: z.boolean().default(false) }),
  ]))
  .default([])
  .transform((arr) => arr.map((v) =>
    typeof v === 'string' ? { url: v, vertical: false } : v))   // → всегда { url, vertical }
```
- **`z.union([...])`** — «значение одного из этих типов». Позволяет писать в `.md` либо просто URL,
  либо `{ url: "...", vertical: true }`.
- **`.transform(fn)`** — пост-обработка после валидации: zod прогоняет данные через `fn` и в код
  отдаёт уже **нормализованный** результат. Поэтому в компоненте мы всегда работаем с `{url, vertical}`
  и не пишем `typeof` в шаблоне. Грязь нормализации спрятана в схеме — один раз.

В `.md` помечаем только вертикальные, остальное — строкой:
```yaml
videos:
  - { url: "https://www.youtube.com/shorts/4knLhGeQk_g", vertical: true }
  - https://www.youtube.com/watch?v=KwDQtDInBhY     # горизонтальное — просто строка
```

### 12.10 Компонент `VideoGroup`: ориентация → раскладка

Раскладку видео вынесли в отдельный компонент `VideoGroup.astro`, чтобы не дублировать iframe-логику
в четырёх местах `CaseArticle`. Он делит видео на две группы и раскладывает по-разному:
```astro
const verticals = videos.filter((v) => v.vertical);
const horizontals = videos.filter((v) => !v.vertical);
```
- **Вертикальные** — `aspect-[9/16] max-w-[260px]` в `flex flex-wrap` ряду (узкие, встают рядышком).
- **Горизонтальные** — `aspect-video` (16:9) на всю ширину, стопкой.

`aspect-[9/16]` / `aspect-video` фиксируют **пропорции** контейнера, а внутри `<iframe class="h-full
w-full">`. Так видео не «плющится»: рамка держит форму, плеер её заполняет. Это в точности повторяет
замысел доски Miro, где высокие боксы-плейсхолдеры = вертикаль, широкие = горизонталь.

> **Почему `overflow-hidden rounded-[5px]` на контейнере, а не на `<iframe>`:** у iframe скругление
> углов работает капризно (контент плеера прямоугольный). Скругляем **обёртку** и прячем «уголки»
> плеера через `overflow-hidden` — тот же приём, что с картинками в §12.3.

> **`loading="lazy"` и скриншоты:** мы ставим ленивую загрузку iframe (видео тяжёлые — грузим только
> при подходе к вьюпорту). Побочный эффект: на **headless-скриншоте** видео ниже экрана могут не
> успеть загрузиться и выглядят пустыми серыми боксами (`bg-ink/5`). В реальном браузере при прокрутке
> они подгружаются. Это артефакт инструмента проверки, а не баг вёрстки — важно не спутать.

### 12.11 Редизайн карточек Works: изображение + градиент вместо «выбеленного» оверлея

Карточки кейсов на главной были «черновыми»: фон-картинка под **белым оверлеем `bg-white/90`** —
изображение почти не видно, выглядит выцветшим. Хуже того, из-за светлого фона у одной карточки
скругление углов читалось сильнее, чем у другой (иллюзия «разных радиусов»).

Переверстали по best-practice для портфолио — **показать работу, а текст сделать читаемым поверх**:
```astro
<a class="group relative block aspect-[4/3] overflow-hidden rounded-[5px] border border-ink/10">
  <Image class="absolute inset-0 h-full w-full object-cover
                transition-transform duration-500 group-hover:scale-105" />
  <div class="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent"></div>
  <div class="absolute inset-x-0 bottom-0 p-5">
    <p class="text-xs uppercase tracking-wide text-paper/80">{client}</p>
    <h3 class="text-xl font-bold text-paper">{title}</h3>
  </div>
</a>
```
Разбор приёмов:
- **`absolute inset-0` поверх `relative`-родителя** — классический «слоёный пирог»: картинка, поверх
  градиент, поверх текст. `inset-0` = `top/right/bottom/left: 0` (растянуть на весь родитель).
- **`bg-gradient-to-t from-ink/85 ... to-transparent`** — затемнение **снизу вверх**: внизу почти
  чёрное (читается белый текст), вверху прозрачное (видно картинку). Это стандартный приём «подложки
  под подпись», который не прячет изображение целиком (в отличие от старого сплошного `white/90`).
- **`object-cover`** — картинка заполняет рамку `aspect-[4/3]`, обрезая лишнее (не искажая пропорции).
- **`group` + `group-hover:scale-105` + `transition-transform`** — при наведении на ссылку (`group`)
  картинка слегка увеличивается. `group` — это «помечаю родителя, чтобы дети реагировали на его
  hover». `duration-500` делает зум плавным.
- **Единое оформление обеих карточек** — раз структура одна, и скругление, и градиент, и поведение
  одинаковы → исчезла иллюзия «разных углов».

> **Контекст-решение:** макет Miro был ч/б черновиком. Показав реальные кейс-изображения, мы добавили
> странице цвет и «портфолишность», не ломая минималистичную типографику вокруг. Это пример того, как
> «оптимизировать дизайн» ≠ «слепо копировать вайрфрейм»: вайрфрейм задаёт структуру, а визуал мы
> доводим под реальный контент.

### 12.12 Ряд медиа одинаковой высоты (исправляет §12.10)

В §12.10 видео делились на ДВА ряда: вертикальные отдельно, горизонтальные отдельно. Но доска Miro
показала другое: в секции боксы видео/картинок стоят **в ОДНУ линию, общей высоты**, а ширина
зависит от ориентации (вертикальный — узкий, горизонтальный — широкий). Это правильнее и компактнее.

**Главный приём — общая высота + ширина из пропорций.** Если задать элементу фиксированную высоту и
`aspect-ratio`, ширина вычислится сама. Поставим всем элементам ряда **одну высоту** — они выровняются,
а широкие/узкие получатся за счёт разных aspect:
```astro
<div class="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start" style={`--row-h:${height}px`}>
  {videos.map((v) => (
    <div class:list={[
      'overflow-hidden rounded-[5px]',
      v.vertical
        ? 'aspect-[9/16] w-full max-w-[220px] sm:h-[var(--row-h)] sm:w-auto sm:max-w-none'
        : 'aspect-video w-full sm:h-[var(--row-h)] sm:w-auto',
    ]}>
      <iframe ... class="h-full w-full" />
    </div>
  ))}
</div>
```
Разбор:
- **`sm:h-[var(--row-h)] sm:w-auto`** — на десктопе высота фиксирована (общая для ряда), ширина
  свободна → `aspect-ratio` задаёт её: вертикаль `9/16` от высоты 300 = 169px, горизонталь `16/9` =
  533px. Высота одна → элементы стоят в линию ровно, как боксы на доске.
- **`--row-h` через `style={...}`** — CSS-переменная, прокинутая инлайн-стилем из пропа `height`.
  Зачем переменная, а не просто `sm:h-[300px]`? Чтобы высоту ряда можно было задать **параметром
  компонента** (`<VideoGroup height={300}>`), не плодя классы. `var(--row-h)` читает её в Tailwind
  arbitrary value.
- **Мобайл (`w-full`, без `sm:`)** — каждый элемент во всю ширину, стопкой: на телефоне ряд из
  широкого видео не влезет, поэтому `flex-col` → `sm:flex-row`. Это снова **mobile-first** (§5.10).
- Тот же `ImageRow.astro` для пары картинок: `<Image class="w-full sm:h-[var(--row-h)] sm:w-auto">` —
  две картинки разной формы встают в ряд одной высоты (как `667×431` + `287×431` у Priem).

> **Почему «высота + w-auto», а не grid с долями?** Grid с `grid-cols-[2fr_1fr]` задал бы ширины, но
> высоты вышли бы разными (каждая картинка своей пропорции). Нам нужно ОБРАТНОЕ: одинаковая высота,
> свободная ширина. Поэтому фикс-высота + `w-auto` + `aspect`/натуральные пропорции — и ряд выровнен.

### 12.13 Шапка кейса: лого слева, текст-со-ссылками справа

Доска задаёт шапку кейса как **горизонтальный баннер**: слева квадратный логотип (~172px), справа —
название + ссылка на сайт + соцсети. Раньше мы рисовали их стопкой (лого сверху, текст под ним).
Чинится flex-раскладкой:
```astro
<header class="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
  <div class="w-[120px] shrink-0 overflow-hidden rounded-[5px] sm:w-[150px]">
    <Image src={logo} alt={client} class="h-auto w-full object-contain" />
  </div>
  <div>… client / h1 / Visit + SocialLinks …</div>
</header>
```
- **`shrink-0`** на колонке лого — не сжиматься, держать ширину; текст занимает остаток.
- **`overflow-hidden rounded-[5px]` на ОБёртке лого**, а не на `<Image>` — почему: логотип Priem был
  «острым» фиолетовым квадратом без скругления. Оборачиваем в скруглённый `div` с `overflow-hidden`,
  и любые углы картинки обрезаются по 5px (как с видео/картинками, §12.3). Теперь скруглены **все**
  изображения, включая лого.
- **Мобайл** — `flex-col`: лого над текстом; десктоп — `sm:flex-row`: в линию.

### 12.14 Hero-баннер и единая ширина секций

**Баннер вместо «фото рядом с текстом».** Чтобы hero читался как ОДИН блок, обернули текст+фото в
общую подложку:
```astro
<div class="grid items-center gap-8 rounded-[5px] bg-ink/[0.04] p-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-12">
  <div class="max-w-xl"> …текст… </div>
  <Image class="w-40 rounded-[5px] shadow-sm sm:w-48" />
</div>
```
- **`bg-ink/[0.04]`** — почти незаметная подложка (4% чёрного). Она визуально «связывает» текст и фото
  в один прямоугольник-баннер. `shadow-sm` на фото добавляет лёгкую глубину.
- `minmax(0,1fr)_auto` — текст-колонка тянется, фото по контенту (как в §8.5).
- Это компромисс без вырезанного фото: фон-подложка объединяет блок, и обрезать задний план у
  портрета не обязательно (хотя вырезанный PNG дал бы ещё более «баннерный» вид — это открытый выбор).

**Единая ширина секций.** Внутри кейса разные секции имели разные `max-w` (заголовок `2xl`, текст
`3xl`, медиа — полный `5xl`) → ширина «плавала». Убрали внутренние `max-w` → всё выравнивается по
контейнеру `max-w-5xl`, как секции на главной. Урок: **внешний контейнер задаёт колонку один раз**
(`<main class="mx-auto max-w-5xl">`), а внутренние блоки не должны произвольно её сужать, иначе край
«прыгает» от секции к секции.

> **Адаптив — это Tailwind, не Astro.** Частый вопрос. Astro лишь генерит HTML/CSS; за «резину»
> отвечают **breakpoint-классы Tailwind** (`sm:` ≈640px, `md:` ≈768px, `lg:` ≈1024px). Мы пишем
> mobile-first: базовые классы = телефон, `sm:`/`md:` добавляют поведение для широких экранов. Astro
> тут ни при чём — он бы так же отдал эти классы в любом фреймворке.

---

## 14. Этап 7: два новых кейса — WRC Academy и Philips

Два новых кейса добавлены **по аналогии** с Grow Food и Priem, но каждый ввёл новые паттерны
в схему и рендер. Цель этого раздела — разобрать только то, что появилось впервые.

### 14.1 Паттерн «секция без заголовка» — продолжение нарратива

В WRC кейсе секция Execution физически одна, но текст разбит на несколько тематических кусков
(соцсети, коммуникации со стейкхолдерами, работа с командами). Каждый кусок — отдельный абзац,
но они не заслуживают отдельного heading-уровня.

В `.md` это выглядит так:
```yaml
sections:
  - heading: Execution
    body: >-
      Built the full communications infrastructure…
    images:
      - wrc-execution-2.png
      - wrc-execution-1.jpg

  - heading: ""           # пустая строка = нет заголовка
    body: >-
      Led communications with stakeholders…
    images:
      - wrc-execution-3.jpg
      - wrc-execution-4.jpg

  - heading: ""
    body: >-
      Managed communications with international rally teams…
```

В `CaseArticle.astro` рендер уже учитывал `hasHeading`:
```astro
const hasHeading = Boolean(s.heading);
…
<p class={proseText}>
  {hasHeading && <strong>{s.heading} </strong>}{s.body}
</p>
```
Если `heading: ""` — `Boolean("")` = `false` → `<strong>` не рендерится, остаётся чистый абзац.
**Никаких изменений в коде не потребовалось** — паттерн работал уже с Этапа 3.

> **Почему несколько секций, а не один большой `body`?** Потому что у каждой части могут быть
> свои `images` или `videos`. Yaml-блок `>-` — это одна строка без переносов; разбить на абзацы
> внутри него нельзя. Поэтому «продолжение» моделируем как новую секцию с пустым heading.

### 14.2 Поле `links` — список ссылок-референсов

WRC кейс добавил секцию Credentials — список источников (статьи, вики, медиа). Это не кнопка
«Visit website» (`link: {label, url}`) и не соц-иконка — просто перечень URL для дотошного
читателя.

**Схема (`content.config.ts`):**
```ts
links: z.array(
  z.object({
    label: z.string().optional(),   // необязателен: если нет — покажем URL
    url: z.string().url(),
  }),
).default([]),
```

**В `.md`:**
```yaml
- heading: Credentials
  body: ""
  links:
    - url: https://www.wrc.com/en/news/portugal-2011-the-rally-that-pushed-woda-to-breaking-point
    - url: https://www.sportireland.ie/news/baltic-battle-for-breen-in-rally-estonia
    - url: https://wrc.fandom.com/wiki/2011_WRC_Academy_Season
```
`label` не указан — отобразится сам URL.

**Рендер в default-layout (`CaseArticle.astro`):**
```astro
{s.links.length > 0 && (
  <ul class="mt-4 space-y-1">
    {s.links.map((l) => (
      <li>
        <a href={l.url} target="_blank" rel="noopener noreferrer"
           class="break-all text-sm opacity-60 hover:opacity-100 hover:underline">
          {l.label ?? l.url}
        </a>
      </li>
    ))}
  </ul>
)}
```

Разбор классов:
- `break-all` — URL-ы длинные и без пробелов; без этого они вылезают за границы контейнера на мобиле.
- `opacity-60` — ссылки визуально приглушены (референсы вторичны, не контент); `hover:opacity-100` —
  при наведении становятся чёткими.
- `{l.label ?? l.url}` — оператор `??` (nullish coalescing): если `label` `null`/`undefined` →
  взять `url` как текст. Это позволяет в `.md` не писать `label` для длинных URL — они сами читаются
  как подтверждение источника.

> Отличие от `link` (кнопка): `link` — один призыв к действию с красивым ярлыком (кнопка styled
> как border-button). `links` — список сырых ссылок-источников; стилизованы намеренно тише.

### 14.3 Изменение типа `media`: от строк к объектам

В Этапе 3 `media` хранил массив **строк** — просто ярлыки для плейсхолдеров:
```ts
// было (Этап 3)
media: z.array(z.string()).default([]),
```
```yaml
media:
  - Brand film
  - Product video
```

Это работало, пока реальных видео не было. Philips кейс добавил **реальный Vimeo-ролик** — нужно
хранить и label, и URL видео. Поле переделано в массив объектов:

```ts
// стало
media: z.array(z.object({
  label: z.string(),
  video: z.string().optional(),   // URL для iframe; отсутствует = плейсхолдер
})).default([]),
```

**В `.md`:**
```yaml
# Philips — реальное видео
media:
  - label: Brand film
    video: https://vimeo.com/513292169

# Если видео ещё нет — плейсхолдер (video: не указан)
media:
  - label: Brand film
  - label: Product video
```

**Рендер (`CaseArticle.astro`):**
```astro
{media.map((item) => (
  item.video ? (
    // реальный embed
    <div class={`aspect-video w-full overflow-hidden rounded-[5px] bg-ink/5
                 ${media.length === 1 ? 'sm:h-[390px] sm:w-auto' : 'sm:w-[48%]'}`}>
      <iframe src={embedUrl(item.video)} title={item.label} loading="lazy"
              class="h-full w-full" allow={allow} allowfullscreen />
    </div>
  ) : (
    // плейсхолдер
    <div class={`flex aspect-video w-full items-center justify-center
                 rounded-[5px] border border-dashed border-ink/40 text-sm opacity-50
                 ${media.length === 1 ? 'sm:w-[65%]' : 'sm:w-[48%]'}`}>
      {item.label}
    </div>
  )
))}
```

Ключевой момент: **один и тот же массив** может содержать оба варианта — готовые видео и
плейсхолдеры. Когда появится реальный URL → просто добавить `video:` в `.md`.

> **Почему `media` отдельно от `sections`?** Медиа-блок вынесен в конец страницы — это «финальный
> аккорд» (кино, ролик, бренд-фильм), а не иллюстрация к конкретному разделу. Структурно это
> другой уровень: не «картинка к тексту», а «видео само по себе».

### 14.4 Логотипы новых кейсов

В `CaseArticle.astro` словарь `logos` — явный Map `id → ImageMetadata`. Добавить кейс = добавить
два импорта и одну строку:
```astro
import wrcLogo from '../assets/wrc-logo.png';
import philipsLogo from '../assets/philips-logo.png';

const logos: Record<string, ImageMetadata> = {
  'grow-food': growFood,
  priem:       priemLogo,
  wrc:         wrcLogo,      // новый
  philips:     philipsLogo,  // новый
};
```
`entry.id` (= имя файла без `.md`) используется как ключ. Это работает надёжно, пока файл называется
`wrc.md` → id `wrc`, и логотип кладётся как `wrc-logo.png`. Соглашение стоит соблюдать при добавлении новых кейсов.

### 14.5 Works: 4 карточки, сетка 2×2

`Works.astro` накапливает фоновые изображения карточек в словарь `images`. Для новых кейсов:
```astro
import wrcCardBg     from '../assets/wrc-card-bg.jpg';
import philipsCardBg from '../assets/philips-card-bg.png';

const images: Record<string, ImageMetadata> = {
  'grow-food': growFoodCardBg,
  priem:       priemCardBg,
  wrc:         wrcCardBg,
  philips:     philipsCardBg,
};
```
Если для нового кейса фона нет — подставляется `worksPreview` (fallback):
```astro
image={images[entry.id] ?? worksPreview}
```

Сетка `sm:grid-cols-2` с 4 кейсами автоматически даёт **2 ряда по 2** — дополнительных стилей
не требовалось. `order` в `.md` управляет порядком через сортировку `getCollection → sort`.

### 14.6 Паттерн «кейс без results-блока»

Grow Food и Priem имели поле `results: [...]` — маркированный блок метрик. WRC и Philips передают
метрики **внутри тела секции** (последний section.body) и оставляют `results: []`.

В `CaseArticle.astro` рендер `results` был ещё в Этапе 3:
```astro
{results.length > 0 && (
  <section class="mt-16 ...">
    <ul>…</ul>
  </section>
)}
```
`results: []` → `length === 0` → блок не рендерится. Ничего менять не нужно.

> Этот паттерн учит важному принципу: **данные нейтральны, рендер — условный**. Поле может быть
> пустым, и это не ошибка. Компонент сам решает, что показывать, в зависимости от наличия данных.

---

### Этап 7 — Два новых кейса (2026-06-02) ✅

- **WRC Academy** (`wrc.md`, order 3): кейс про спортивный бренд 2011 г. Новые паттерны:
  пустой `heading` (продолжение нарратива), поле `links` (референс-список), `results: []`.
- **Philips** (`philips.md`, order 4): бренд-платформа «Feel the Music». Новые паттерны:
  реальный embed в `media` (`{label, video}`), YouTube в `sections[].videos`.
- **Схема** расширена: добавлено `sections[].links`; `media` переделан с `string[]` на `{label, video?}[]`.
- **CaseArticle**: рендер `links` (`<ul>` muted-ссылок) + рендер `media` с iframe-ветвлением.
- **Works**: 4 фоновых изображения, 4 карточки в сетке 2×2.
- `priem-case-logo.png` заменён на более лёгкий файл (80 kB → 11 kB).
- `npm run build` + `check` — должны быть зелёные (схема расширена обратно-совместимо: `.default([])`).

---

## 15. Этап 8: Eucerin + Archive-редизайн

### 15.1 Archive: чип-ссылка вместо раздела с заголовком

**До:** секция `#archive` содержала `<h2>Archive</h2>` и dashed-плейсхолдер с текстом
«More projects — coming soon.»

**После:** заголовок убран; весь раздел — один кликабельный чип, ведущий на кейс WRC.

```astro
<section id="archive" class="border-t-1 border-ink py-16">
  <a
    href={`${base}/cases/wrc`}
    class="flex h-32 w-full items-center justify-center rounded-[5px]
           border border-ink/30 px-4 py-3 text-center text-sm font-medium
           transition-colors hover:bg-ink/[0.06]"
  >
    {t('archive.title')}
  </a>
</section>
```

**Почему такой дизайн:**
- Чип выглядит как Publications — «нарочито скромная» ссылка, не кричащая кнопка.
- `h-32 w-full` сохраняет визуальный вес секции (прежний плейсхолдер тоже был `h-32`).
- `t('archive.title')` = «Archive» / «Архив» — одна строка уже переводится из словаря.
- Убранный `<h2>` — намеренный выбор: сам чип несёт роль заголовка.

> **`w-full` на `<a>`:** по умолчанию `<a>` — строчный элемент, он не растягивается на ширину
> родителя. Класс `flex` переводит его в flex-контейнер (блочный), `w-full` — на всю ширину.
> Без `w-full` `<a>` сжался бы к тексту.

### 15.2 Поле `archive` в схеме — фильтрация кейсов из Works

Проблема: WRC переходит из Works в Archive, но страница `/cases/wrc` должна остаться рабочей.
Нужен механизм «этот кейс существует, но не показывается в сетке Works».

**Схема (`content.config.ts`):**
```ts
archive: z.boolean().default(false),
// archive: true → кейс скрыт из Works, доступен только по прямой ссылке.
```

**`wrc.md`:**
```yaml
archive: true
```

**`Works.astro`:**
```ts
const cases = (await getCollection('cases'))
  .filter((e) => !e.data.archive)   // скрываем archive-кейсы
  .sort((a, b) => a.data.order - b.data.order);
```

`getCollection` возвращает ВСЕ кейсы из коллекции. Фильтрация до сортировки — правильный
порядок: сначала убираем ненужные, потом сортируем оставшиеся. Иначе порядок может нарушиться
из-за «дырок» в `order`.

> **Почему не удалять `wrc.md`:** страница `/cases/wrc` должна работать (Archive-чип на неё
> ссылается). Удаление `.md` уничтожило бы страницу. Флаг `archive: true` — это «мягкое
> исключение» из выборки без удаления контента.

### 15.3 Новый кейс Eucerin: структура и особенности

**Структура контента (в порядке секций на доске Miro):**

```
Заголовок: Brand launch / Eucerin
Соцсети на доске: IG / VK / YT (URL не известны → social: [])
Медиа: Vimeo 418987467 (Brand film)

Секции:
  Context    → 2 изображения (eucerin-context-1/2)
  Challenge  → 2 изображения (eucerin-challenge-1/2)
  Strategy   → 2 изображения (eucerin-strategy-1/2)
  Execution  → текст (Content & production, без изображений)
  ""         → текст (Community & engagement) + 2 изображения (eucerin-execution-1/2)
  Results    → сводный текст метрик (15M+ reach, 30K+ followers, 3% ER)
```

**Почему Results — последняя секция, хотя на Miro они в начале:**
На доске Miro метрики показаны вверху как «сводка» — типичный дизайн для презентации. В кейсе
(нарративный формат) правильнее рассказать историю сначала, а результаты — в конце. Это осознанное
отклонение от компоновки доски в пользу читабельности страницы.

**Две колонки Execution → две последовательные секции:**
На доске Execution разбита на две параллельные колонки: «Content and production» (слева) и
«Community and engagement» (справа). В HTML/Markdown параллельность невозможна без компонента.
Решение: две секции подряд — первая с heading «Execution», вторая с `heading: ""` (паттерн из §14.1).

### 15.4 Скачивание ассетов из Miro через MCP + PowerShell

Изображений Eucerin в репо не было. Логотип и card-bg были скачаны прямо из Miro в рамках
сессии без участия пользователя:

**Шаг 1 — получить временный download URL через MCP:**
```
mcp__miro__image_get_url(miro_url: "https://miro.com/app/board/...?moveToWidget=<item_id>")
→ { download_url: "https://r.miro.com/..." }
```

**Шаг 2 — скачать через PowerShell:**
```powershell
Invoke-WebRequest -Uri $downloadUrl -OutFile "src\assets\eucerin-logo.png" -UseBasicParsing
```

URL действителен временно (~15 мин), поэтому загрузка должна быть сразу после получения URL.
Astro затем автоматически оптимизирует PNG → WebP при сборке:
- `eucerin-logo.png`: 107 kB → 13 kB WebP
- `eucerin-card-bg.png`: 1354 kB → 70 kB WebP

> **Изображения внутри секций** (eucerin-context-1/2, challenge, strategy, execution) пока
> отсутствуют — это плейсхолдеры в `.md`. `CaseArticle` проверяет `assets[file]` и просто
> пропускает отсутствующие файлы без ошибки. Страница работает без них, картинки появятся
> когда пользователь добавит файлы.

### 15.5 Поле `metrics` — метрик-чипы внутри секции

На доске Miro у Eucerin Results показаны не буллет-листом, а тремя стилизованными блоками:
крупное число + подпись, бежевый фон. Это невозможно выразить через `body: string` — нужна
структура `{value, label}`.

**Схема (внутри `sections[]`):**
```ts
metrics: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
```

**В `.md`:**
```yaml
- heading: Results
  body: >-
    Built awareness and loyalty... 80%+ of all SMM content was produced locally...
  metrics:
    - { value: "15M+", label: "target audience reached" }
    - { value: "30K+", label: "brand followers gained" }
    - { value: "3%",   label: "average ER" }
```

**Рендер (`CaseArticle.astro`, default layout):**
```astro
{s.metrics.length > 0 && (
  <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
    {s.metrics.map((m) => (
      <div class="rounded-[5px] border border-[#eeeeee] bg-[#f5f5ed] px-5 py-6">
        <p class="text-4xl font-bold text-ink">{m.value}</p>
        <p class="mt-1 text-sm text-ink/60">{m.label}</p>
      </div>
    ))}
  </div>
)}
```

Цвета (`#f5f5ed` фон, `#eeeeee` бордер) взяты точно с доски Miro. На мобиле — стопкой
(`grid-cols-1`), на десктопе — три в ряд (`sm:grid-cols-3`).

> **Порядок секций как дизайн-решение.** На доске Results идёт ПЕРЕД Context — это намеренный
> выбор: «покажи результат сразу, потом рассказывай историю». В `.md` секция Results просто
> стоит первой в массиве `sections[]`. Компонент рендерит их в том порядке, в каком они
> записаны — никаких специальных флагов не нужно.

### 15.7 Итог: Works с 4 кейсами, WRC в Archive

**Сетка Works после изменений:**

| Позиция | Кейс | order | archive |
|---|---|---|---|
| 1 (верх-лево) | Grow Food | 1 | false |
| 2 (верх-право) | Priem | 2 | false |
| 3 (низ-лево) | Eucerin | 3 | false |
| 4 (низ-право) | Philips | 4 | false |
| — (только /cases/wrc) | WRC Academy | 3 | **true** |

WRC имеет `order: 3` и Eucerin тоже `order: 3` — конфликта нет, т.к. WRC отфильтрован до сортировки.

---

### Этап 8 — Eucerin + Archive-редизайн (2026-06-03) ✅

- **Archive.astro**: убран `<h2>`, заменён на `<a>`-чип `h-32 w-full` стиля Publications,
  ссылающийся на `/cases/wrc`. §15.1.
- **Схема**: поле `archive: boolean` добавлено в `content.config.ts`. §15.2.
- **wrc.md**: `archive: true` — скрыт из Works, страница существует. §15.2.
- **eucerin.md**: новый кейс из Miro (order 3, Brand launch, 6 секций, Vimeo-медиа). §15.3.
- **Ассеты**: `eucerin-logo.png` + `eucerin-card-bg.png` скачаны через `image_get_url` + PowerShell. §15.4.
- **Works.astro**: фильтр `!e.data.archive` + Eucerin в `images`-словаре. §15.2, §15.5.
- **CaseArticle.astro**: `eucerin` добавлен в `logos`-словарь. 
- `npm run check` — 0/0/0. `npm run build` — 12 страниц (2 языка × 6 кейсов), зелёный.
- **Ожидает пользователя**: изображения секций Eucerin, реальные соцссылки (IG/VK/YT).

---

## Журнал этапов

### Этап 1 — Инициализация (2026-05-30) ✅
- Установлены Astro 5.18.2, Tailwind 4.3.0, TS 5.9.3.
- Настроены: i18n (en/ru), content-коллекция `cases` со схемой, дизайн-токены, базовый layout.
- Созданы: `Base`, `Nav`, `Footer`, `CaseCard`, главные `/` и `/ru/`, 2 кейса в Markdown.
- `npm run build` — зелёный, 2 страницы собраны.
- **Что НЕ сделано (по плану дальше):** страницы кейсов (`/cases/[slug]`), полная вёрстка секций
  главной (Archive, Publications, фото/видео), SEO-теги/sitemap, перевод контента кейсов на RU.

### Этап 2 — Вёрстка главной по макету (2026-05-30) ✅
- Главная приведена к структуре Miro 1:1: Hero(2 кол.) + About + Bridge + Works + Archive + Publications.
- Новые компоненты: `Hero`, `About`, `Works`, `Archive`, `Publications`, `SocialLinks`; обновлены
  `Nav` (ссылки+соцсети), `CaseCard` (бренд-превью), `Footer` (копирайт), обе страницы (композиция секций).
- Применили: композицию секционных компонентов, `astro:assets` `<Image>` (→ WebP), переиспользуемый
  `SocialLinks` со списком-пропом, расширили словарь `ui.ts` (en+ru).
- `npm run build` + `npm run check` — зелёные. Картинки оптимизированы в WebP.
- **Плейсхолдеры:** фото в hero, Archive/Publications, соц-URL, `site` в конфиге (подробности §8.6).

### Этап 3 — Страницы кейсов (2026-05-31) ✅
- Динамический маршрут `src/pages/cases/[slug].astro` (+ `/ru/cases/[slug].astro`) с `getStaticPaths`
  из коллекции `cases` → 4 страницы кейсов (2 кейса × 2 языка).
- Новый компонент `CaseArticle.astro` (вся вёрстка кейса): назад-ссылка → шапка (лого/клиент/
  заголовок) → внешняя ссылка + соцсети → секции Context→…→Results(+What came next) → блок метрик.
- **Картинки кейсов на своих местах** (как в Miro): схема расширена (`sections[].images`, `media`),
  реальные ассеты скопированы в `src/assets`, резолв через `import.meta.glob`, рендер `<Image>`
  внутри секций + медиа-слоты «coming soon» (§10.8–10.9). 7 картинок оптимизированы в WebP.
- Применили: динамические маршруты, `CollectionEntry<'cases'>`-типизацию, условный рендер (`&&`),
  `class:list`, `import.meta.glob`; переиспользовали `SocialLinks`; ключи `case.*` в `ui.ts` (en+ru).
- `npm run build` + `npm run check` — зелёные, **6 страниц** собрано.
- **Контент кейсов** пока единый EN; переведена только обвязка (§10.6). **Внешний URL Priem** —
  под вопросом (в спеке `growfood.pro`, вероятно артефакт парсинга; ждём подтверждения).
  **Медиа-ярлыки** — нейтральные EN, выведены из RU-пометок автора (нужны реальные файлы).

> Следующий этап (4): SEO — `@astrojs/sitemap`, OG-теги, `robots.txt`, замена `site` в конфиге;
> плюс фото Марии в hero и реальные медиа в слоты кейсов (скринкасты/ролики/фото).

### Этап 4 — SEO-фундамент (2026-05-31) ✅
- Установлен `@astrojs/sitemap@3.7.3`, подключён в `integrations` с i18n → `sitemap-index.xml` +
  `sitemap-0.xml` с перекрёстными hreflang (en-US/ru-RU) для всех 6 страниц.
- `astro.config.mjs`: `site` сменён с заглушки `example.com` на **provisional** `https://maria.becom.ing`.
- `public/robots.txt`: разрешён обход + ссылка на sitemap.
- `Base.astro` расширен: **canonical**, **hreflang** (en/ru/x-default), **Open Graph** + **Twitter Card**;
  `og:type` = website (главная) / article (кейсы); `og:image` опционален (нет соц-картинки — тег опущен).
- `i18n/ui.ts`: хелперы `alternateLinks(pathname)` и `localeTag` для языковых версий и BCP-47.
- `npm run build` + `check` — зелёные; проверено: sitemap и SEO-теги в `<head>` корректны.
- **Не закрыто:** реальный домен (заменить `site` + robots), соц-картинка `og:image` 1200×630,
  Lighthouse-прогон, JSON-LD (опц.). Подробности — §11.5.

> Следующий шаг: либо контент-правки (домен, фото Марии в hero, соц-URL, реальный URL Priem),
> либо деплой на Cloudflare Pages (см. §9 + `CONTEXT_LANDING.md`).

### Этап 5 — Дизайн-полировка (2026-06-01) ✅
- **Computer-vision-воркфлоу:** наладили цикл «правка → `npm run dev` → headless-скриншот Chrome →
  кроп через `System.Drawing` → визуальная проверка». Так нашли два невидимых в коде бага. Разбор — §12.1.
- **Иконка LinkedIn (сплющивание):** причина — `icon-li.png` был 1200×800 (3:2), а `h-5 w-5` —
  жёсткий квадрат → сжатие по ширине. Файл обрезан до квадрата 560×560 вокруг логотипа (убраны поле
  и значок ®). Теперь все три соц-иконки квадратные и единообразные. Разбор — §12.2.
- **Скругление 5px у всех рамок:** добавлен `rounded-[5px]` (arbitrary value) на чипы Publications,
  пунктирные плейсхолдеры (Archive, медиа-слоты), кнопки/ссылки кейса, картинки и видео-фреймы,
  карточки Works (`overflow-hidden rounded-[5px]`). Разбор — §12.3.
- **Тонкая обводка Publications:** `border-2` → `border` (1px) + `border-ink/30` (opacity-модификатор).
  Чипы переведены на data-модель `{ label, url? }` — готовы стать ссылками. Разбор — §12.4, §12.6.
- **Контейнеры под текст:** колонка hero сужена до `max-w-xl`, bridge — `mx-auto max-w-2xl`;
  `grid-cols-[minmax(0,1fr)_auto]` чтобы `max-w` реально срабатывал. Фото hero скруглено. Разбор — §12.5.
- `npm run check` — зелёный (0 ошибок). Все правки проверены скриншотами (главная + кейс).
### Этап 5b — Редизайн (computer-vision round 2, 2026-06-01) ✅
По фидбеку пользователя («схема Miro была черновиком — сделать красиво»):
- **Иконки шапки → inline-SVG** (simple-icons LI/TG/WA): единый `viewBox`, `currentColor`, `18px` —
  снят разнобой размеров/скруглений. `Nav.astro` больше не использует растровые `icon-*.png`. §12.8.
- **Ориентация видео**: схема `videos` → `{ url, vertical }` через `z.union` + `.transform`; новый
  `VideoGroup.astro` (вертикальные 9:16 в ряд, горизонтальные 16:9 во всю ширину). Проставлены
  ориентиры по фидбеку (GF Execution #1,#2 вертикальные; Priem Execution #1 вертикальное). §12.9–12.10.
- **Ширина кейсов = главной**: `CaseArticle` `max-w-3xl`→`max-w-5xl`, текст ограничен `max-w-3xl`. §12.2 (Этап 5b).
- **Карточки Works переверстаны**: изображение + нижний градиент + заголовок вместо «выбеленного»
  `white/90`-оверлея; единое оформление → нет иллюзии разных углов; hover-zoom. §12.11.
- **Miro перечитан** (`board_list_items`): подтверждено — **внутри рамок Publications ссылок нет**
  (7 чипов = текстовые `shape`, border 1px). Реальные ссылки на доске: growfood/priem/themeal — уже в коде.
- `npm run check` — зелёный (0/0/0). Проверено скриншотами (главная + оба кейса) через Chrome headless.

> Следующий шаг: контент-доводка (Context-картинка GF, фото в hero уже есть), затем деплой
> (см. блок «ЧИНИМ ДЕПЛОЙ» в `CONTEXT_LANDING.md`).

### Этап 5c — Раскладка по доске + баннер (2026-06-01) ✅
По детальному фидбеку (сверено с геометрией доски через `board_list_items`):
- **Медиа в один ряд общей высоты** (исправлен подход §12.10): `VideoGroup` + новый `ImageRow` —
  flex-ряд, `sm:h-[var(--row-h)] sm:w-auto` + `aspect-*`, высота фикс., ширина из пропорций. §12.12.
- **Шапка кейса**: лого слева (`shrink-0`, скруглено `overflow-hidden rounded-[5px]`), текст+ссылки
  справа. У Priem лого был острый фиолетовый квадрат — теперь скруглён. §12.13.
- **Единая ширина секций кейса**: убраны плавающие `max-w-2xl/3xl` → всё по `max-w-5xl`. §12.14.
- **Hero-баннер главной**: текст+фото в единой подложке `bg-ink/[0.04]` + `shadow-sm`; bridge `max-w-4xl`
  в одну строку. §12.14.
- **Адаптив = Tailwind** (`sm:`/`md:`), не Astro — зафиксировано в §12.14.
- `npm run check` — зелёный (0/0/0). Проверено скриншотами (главная + оба кейса).
- **Не сделано (ждёт пользователя):** URL для чипов Publications (MCP не отдаёт widget-ссылки);
  выбор визуального направления и финального стиля hero-баннера (вопрос отклонён, вернёмся).

> Разрешения: `bypassPermissions` откатывается в project-local settings; стоят `deny` на git
> commit/push/merge и gh pr — коммиты/PR делает пользователь. Перед продолжением — рестарт сессии.

---

## 13. Этап 6: UI-полировка

### 13.1 CLAUDE.md — автоматизация контекста

Файл `CLAUDE.md` в корне проекта читается Claude Code **автоматически** при старте каждой сессии.
Это полный эквивалент системного промта для проекта. Содержит инструкции:
- читать `CONTEXT_LANDING.md` и `ASTRO-EDUCATION.md` при старте;
- если файлы не существуют — создать со скелетом;
- дополнять оба файла после каждого изменения.

Это устраняет необходимость писать вручную «восстанови контекст» в начале каждой сессии.

### 13.2 Hero: flush-фото с object-cover

**Задача:** фото справа от текста должно упираться в правый, верхний и нижний края баннера.
Банальные `self-end` + негативные отступы давали артефакты. Финальное решение:

```html
<!-- Внешняя оболочка: overflow-hidden клипает углы фото по радиусу div -->
<div class="overflow-hidden rounded-[5px] bg-ink/[0.08] sm:min-h-[260px]">
  <div class="grid items-stretch gap-4 p-4
              sm:grid-cols-[minmax(0,1fr)_220px] sm:gap-0 sm:p-0">

    <!-- Текст: собственный padding на десктопе -->
    <div class="flex flex-col justify-center sm:py-4 sm:pl-7 sm:pr-5">
      ...текст...
    </div>

    <!-- Фото: центрируется на мобиле, flush-right на десктопе -->
    <div class="flex justify-center sm:block sm:self-stretch">
      <Image
        class="w-44 rounded-[5px]
               sm:h-full sm:w-full sm:rounded-l-[5px] sm:object-cover sm:object-top"
        loading="eager"
      />
    </div>
  </div>
</div>
```

**Почему `overflow-hidden` на внешнем div, а не рамки у фото:**
- `overflow-hidden` + `rounded-[5px]` на контейнере автоматически клипает всё внутри по радиусу.
- Не нужно дублировать `rounded-*` для каждого дочернего элемента у краёв.
- Левые углы фото НЕ у края внешнего div — overflow-hidden их не трогает. Нужен явный `sm:rounded-l-[5px]`.

**`sm:self-stretch`** — grid-item растягивается на всю высоту строки. Без него элемент центрируется
(`items-stretch` тут управляет всеми дочерними). Потом `sm:h-full` на `<Image>` заполняет wrapper.

**`sm:object-cover sm:object-top`** — изображение заполняет контейнер с кропом. `object-top` гарантирует,
что верхняя часть (лицо) не обрезается при кропе снизу.

**`sm:min-h-[260px]`** — якорная высота баннера. Без неё при коротком тексте баннер схлопывается.
Фото с `h-full` заполнит высоту в любом случае — но нужна база.

**Мобиль:** `flex justify-center sm:block` на wrapper → на мобиле wrapper flex-ом центрирует фото.
На десктопе `sm:block` сбрасывает flex → обычный блок, который растягивается grid-ом.

### 13.3 VideoGroup: isSingleHorizontal + flex-1 для пар

**Одиночное горизонтальное видео — чуть крупнее:**
```ts
const isSingleHorizontal = videos.length === 1 && !videos[0].vertical;
const rowH = isSingleHorizontal ? Math.round(height * 1.3) : height;
// 300px * 1.3 = 390px → ширина 390 * 16/9 ≈ 693px
```
Применяется через CSS-переменную `--row-h` в inline-стиле контейнера.

**Согласование ширины media-секции с VideoGroup:**
Секция `media[]` в конце кейса рендерит видео не через VideoGroup, а напрямую. Чтобы одиночное
видео там имело ту же ширину, что одиночное в VideoGroup (693px):
```jsx
// вместо sm:w-[65%] (≈634px)
media.length === 1 ? 'sm:h-[390px] sm:w-auto' : 'sm:w-[48%]'
```
`aspect-video` + `sm:h-[390px] sm:w-auto` → браузер считает ширину из aspect-ratio: 390 × 16/9 ≈ 693px.

**Два элемента в ряд — одинаковая суммарная ширина:**
Проблема: ImageRow (2 картинки) и VideoGroup (2 видео) в одной секции могут иметь разные суммарные
ширины из-за разных aspect-ratio контента.
Решение: при `length === 2` используем `sm:flex-1 sm:min-w-0` вместо `sm:w-auto`:

```tsx
// ImageRow
class={`... sm:h-[var(--row-h)] ${images.length === 2 ? 'sm:flex-1 sm:min-w-0' : 'sm:w-auto'}`}

// VideoGroup
v.vertical
  ? `... sm:h-[var(--row-h)] sm:max-w-none ${videos.length === 2 ? 'sm:flex-1 sm:min-w-0' : 'sm:w-auto'}`
  : `... sm:h-[var(--row-h)] ${videos.length === 2 ? 'sm:flex-1 sm:min-w-0' : 'sm:w-auto'}`
```

`sm:flex-1` = `flex: 1 1 0%` → каждый item занимает равную долю ширины flex-row.
При height фикс. и `object-cover` — изображения не деформируются. Iframes заполняют контейнер. ✓

### 13.4 Publications: data-модель + hover

Чипы переведены на объект `{ label, url? }`. Если `url` задан — рендерится `<a>`, иначе `<div>`:
```tsx
const chipLink = `${chip} hover:bg-ink/[0.06]`; // мягкое затемнение, не инверт
const chipStatic = `${chip} text-ink/80`;

items.map(item =>
  item.url
    ? <a href={item.url} target="_blank" class={chipLink}>...</a>
    : <div class={chipStatic}>...</div>
)
```
`hover:bg-ink/[0.06]` = 6% непрозрачности — поверх светлого фона едва заметное потемнение без инверта.

### 13.5 Якорная навигация: убираем автоскролл

Ссылка «← Back to home» в `CaseArticle.astro` вела на `${base}/#works`. При переходе браузер
прокручивал страницу к секции Works — неожиданное поведение для пользователя.
Исправление: `${base}/` (без якоря) → возврат на верх страницы.

### 13.6 Адаптивные паттерны этой сессии

| Паттерн | Tailwind | Результат |
|---|---|---|
| Элемент flush к краю | `overflow-hidden` на родителе | клип по border-radius |
| Фото на всю высоту grid-строки | `self-stretch` + `h-full w-full object-cover` | photo fills row |
| Центрирование одиночного flex-item | `justify-center` на контейнере | элемент по центру |
| Равная ширина N элементов | `flex-1 min-w-0` | поровну делят ширину ряда |
| Пропорциональная ширина по ratio | `flex: ratio 1 0%` + CSS var | широкое шире, узкое уже |
| Фиксированная ширина из aspect+height | `h-[390px] w-auto` + `aspect-video` | ширина = 390×16/9 |
| Мягкий hover | `hover:bg-ink/[0.06]` | 6% затемнение |

### 13.7 ImageRow: пропорциональный flex по aspect ratio

**Проблема.** Ряд из широкого (`priem-execution-wide.jpg`) и вертикального (`priem-execution-tall.jpg`)
фото с `flex-1` (равные доли) давал каждому 50% ширины. Вертикальное фото в 50% × 300px — широкий
прямоугольник с сильным кропом по высоте. Узкое по природе изображение не должно занимать столько же
места, сколько широкое.

**Решение — `flex-grow = aspect_ratio`.**  
Если задать каждому item `flex: ratio 1 0%`, flex распределит ширину пропорционально:
```
item_width_i = (ratio_i / Σ ratio_j) × container_width
```
Широкое (16:9 ≈ 1.78) → ~73% ряда ≈ 698px. Вертикальное (2:3 ≈ 0.67) → ~27% ≈ 262px.
Высота у обоих фиксирована через `--row-h`. `object-cover` убирает небольшой кроп.

**Доступ к размерам оригинала в Astro.**  
`astro:assets` обогащает импортированные изображения метаданными. `ImageMetadata` включает
`width` и `height` оригинала — они доступны в frontmatter как `im.src.width / im.src.height`.

**Реализация.**  
CSS-переменная `--r` задаётся per-item через inline `style`. Применяется только на десктопе
через scoped `<style>` + `@media`. На мобиле элементы стекают в колонку естественно.

```astro
---
const isMulti = images.length >= 2;
---
<div class="flex flex-col gap-4 sm:flex-row sm:items-stretch" style={`--row-h:${height}px`}>
  {images.map((im) => {
    const ratio = (im.src.width / im.src.height).toFixed(4);
    return isMulti ? (
      <div class="img-item overflow-hidden rounded-[5px]" style={`--r:${ratio}`}>
        <Image src={im.src} alt={im.alt} class="w-full object-cover sm:h-full" />
      </div>
    ) : (
      <Image src={im.src} alt={im.alt}
        class="w-full rounded-[5px] object-cover sm:h-[var(--row-h)] sm:w-auto" />
    );
  })}
</div>

<style>
  @media (min-width: 640px) {
    .img-item {
      flex: var(--r) 1 0%;   /* пропорциональная ширина */
      height: var(--row-h);  /* фиксированная высота ряда */
      min-width: 0;          /* не выходит за границы flex */
    }
  }
</style>
```

**Почему scoped `<style>` вместо Tailwind?**  
Tailwind не поддерживает динамические значения из JS-переменных в utility-классах (JIT генерирует
только статические классы из исходников). Inline `style` работает, но медиа-запросы в inline style
невозможны. Решение: CSS-переменная через inline style + правило в `<style>` на нужном breakpoint.
Astro автоматически скоупит `<style>` к компоненту через `data-astro-cid-*`.

**Почему `toFixed(4)`?**  
`parseFloat` хранит много знаков. `toFixed(4)` обрезает до 4 знаков после запятой — достаточно
для точного позиционирования и сокращает объём HTML.

---

### Этап 6 — UI-полировка (2026-06-01) ✅

- **CLAUDE.md**: автоматическая загрузка контекстных файлов при старте сессии.
- **Hero layout**: `overflow-hidden` + `object-cover` + `self-stretch` — фото flush к 3 краям баннера.
  Bridge-текст перенесён внутрь баннера (`text-ink/50 font-bold`). Шрифты уменьшены (h1 `text-xl`).
- **Publications**: 7 реальных URL подключены к чипам. Hover — мягкое `bg-ink/[0.06]`.
- **SocialLinks**: `rounded-full` → `rounded-[5px]` (квадрат со скруглением, весь проект однородный).
- **Heading-размеры**: Works/Archive/Publications `text-2xl` → `text-xl` (пропорционально меньше).
- **Соц-ссылки кейсов**: реальные URL (GF: IG+TG, Priem: IG+VK).
- **VideoGroup**: `isSingleHorizontal` ×1.3 высоты; 2-item → `flex-1`; `justify-center items-center`.
- **ImageRow**: 2-item → `flex-1`; затем переработан в пропорциональный flex (§13.7).
- **Media-секция**: 1 видео → `h-[390px] w-auto` (совпадает с isSingleHorizontal); flex+justify-center.
- **aside-right/aside-left**: `items-start` → `items-center` (текст вертикально по центру картинки).
- **Навигация**: убран `/#works` из back-link → нет автоскролла.
- **Works**: `pt-16` → `pt-8` (убран лишний зазор между hero и Works).
- **ImageRow пропорциональный flex**: `flex-grow = aspect_ratio` через CSS var `--r` + scoped style (§13.7).
- `npm run check` — зелёный (0/0/0).
