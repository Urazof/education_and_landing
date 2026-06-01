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
