// Словарь интерфейсных строк. Контент кейсов живёт в content-коллекциях,
// здесь — текст самой главной страницы и подписи UI, для каждого языка.

export const languages = {
  en: 'English',
  ru: 'Русский',
} as const;

export const defaultLang = 'en';

export const ui = {
  en: {
    'nav.about': 'About',
    'nav.works': 'Works',
    'hero.role': 'Marketing leader & brand strategist',
    'hero.greeting': 'Hi! My name is Maria Tkachenko.',
    'hero.intro':
      "I'm a marketing leader and brand strategist with 10+ years of experience building consumer and tech-driven brands across subscriptions, digital products, and international markets.",
    'hero.photoAlt': 'Portrait of Maria Tkachenko',
    'about.p1':
      "Since 2011, I've been building and scaling brands across consumer, tech, subscription, and digital products. I know how to turn complex products into brands people instantly understand and genuinely connect with.",
    'about.p2':
      'Over the last 5 years at Grow Food, I helped turn the company into one of the leading ready-to-eat meal delivery brands. I led a full-scale rebrand that gave the company a stronger and more recognizable identity, doubled the efficiency of the brand ecosystem, and increased brand awareness by 200%. I also launched and scaled Priem.menu from the ground up, growing it to a $20M+ revenue run rate within 1.5 years and expanding into 15+ cities and regions.',
    'bridge':
      "So here are some examples of the brands, systems, and campaigns I've built over the years.",
    'works.title': 'Selected works',
    'archive.title': 'Archive',
    'archive.note': 'More projects — coming soon.',
    'publications.title': 'Publications',
    'publications.note': 'Press & features — coming soon.',
    'case.back': 'Back to home',
    'case.visit': 'Visit website',
    'case.results': 'Results',
    'footer.rights': 'All rights reserved',
  },
  ru: {
    'nav.about': 'Обо мне',
    'nav.works': 'Работы',
    'hero.role': 'Маркетинг-лидер и бренд-стратег',
    'hero.greeting': 'Привет! Меня зовут Мария Ткаченко.',
    'hero.intro':
      'Я маркетинг-лидер и бренд-стратег с опытом 10+ лет: строю потребительские и технологичные бренды в подписках, цифровых продуктах и на международных рынках.',
    'hero.photoAlt': 'Портрет Марии Ткаченко',
    'about.p1':
      'С 2011 года я строю и масштабирую бренды в потребительском, технологичном, подписочном и цифровом сегментах. Я умею превращать сложные продукты в бренды, которые люди мгновенно понимают и к которым по-настоящему привязываются.',
    'about.p2':
      'За последние 5 лет в Grow Food я помогла превратить компанию в один из ведущих брендов доставки готовой еды. Провела полный ребрендинг, который дал компании более сильную и узнаваемую айдентику, вдвое повысил эффективность бренд-экосистемы и поднял узнаваемость бренда на 200%. Также с нуля запустила и масштабировала Priem.menu — до выручки $20M+ в run rate за 1,5 года и охвата 15+ городов и регионов.',
    'bridge':
      'Вот несколько примеров брендов, систем и кампаний, которые я создала за эти годы.',
    'works.title': 'Избранные работы',
    'archive.title': 'Архив',
    'archive.note': 'Больше проектов — скоро.',
    'publications.title': 'Публикации',
    'publications.note': 'Пресса и упоминания — скоро.',
    'case.back': 'На главную',
    'case.visit': 'Перейти на сайт',
    'case.results': 'Результаты',
    'footer.rights': 'Все права защищены',
  },
} as const;

// Тип ключа перевода — выводится из английского словаря (он эталонный/полный).
export type UiKey = keyof (typeof ui)['en'];
export type Lang = keyof typeof ui;

// Фабрика переводчика: useTranslations('ru') возвращает функцию t('nav.about').
// Если строки нет в текущем языке — откатывается на defaultLang.
export function useTranslations(lang: Lang) {
  return function t(key: UiKey): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

// Хелпер префикса пути для языка: en → "", ru → "/ru".
export function localePrefix(lang: Lang): string {
  return lang === defaultLang ? '' : `/${lang}`;
}

// BCP-47 теги для hreflang/og:locale (en → en_US и т.п.). Зеркалит конфиг sitemap.
export const localeTag: Record<Lang, string> = {
  en: 'en_US',
  ru: 'ru_RU',
};

// По текущему пути возвращает пути ВСЕХ языковых версий страницы — для тегов hreflang.
// Логика — зеркало маршрутизации: en без префикса, ru с префиксом /ru.
export function alternateLinks(pathname: string): { lang: Lang; path: string }[] {
  let enPath = pathname.replace(/^\/ru(?=\/|$)/, ''); // снимаем префикс /ru → базовый (en) путь
  if (enPath === '') enPath = '/';
  const ruPath = enPath === '/' ? '/ru/' : `/ru${enPath}`;
  return [
    { lang: 'en', path: enPath },
    { lang: 'ru', path: ruPath },
  ];
}
