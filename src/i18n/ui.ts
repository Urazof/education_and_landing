// Словарь интерфейсных строк. Контент кейсов живёт в content-коллекциях,
// здесь — текст самой главной страницы и подписи UI, для каждого языка.

export const defaultLang = 'en';

export const ui = {
  en: {
    'nav.about': 'About',
    'nav.works': 'Work',
    'nav.publications': 'Publications',
    'nav.contact': 'Contact',
    'nav.switch': 'Русская версия',
    'a11y.skip': 'Skip to content',
    'notfound.title': 'Page not found',
    'notfound.text': 'The page you are looking for does not exist or has moved.',
    'footer.sitemap': 'Sitemap',
    'meta.title': 'Maria Tkachenko — Brand strategist & marketing leader',
    'meta.description':
      'Marketing leader and brand strategist. I turn customer insight into clear positioning and marketing strategy for complex products people connect with.',
    'hero.eyebrow': 'Maria Tkachenko',
    // H1 собирается из трёх частей: курсивное слово + точка акцентным цветом ставятся в Hero.astro.
    'hero.h1.a': 'I build brands that ',
    'hero.h1.em': 'drive',
    'hero.h1.b': ' growth',
    'hero.roles': 'Marketing leader / Brand strategist / E+ Awards jury, 2024',
    'hero.intro':
      'Turning customer insight into clear positioning and marketing strategy, I help complex products become brands people instantly understand and genuinely connect with.',
    'hero.ctaWork': 'See selected work →',
    'hero.ctaContact': 'Get in touch',
    'hero.photoAlt': 'Portrait of Maria Tkachenko',
    'hero.caption': 'Click the network',
    'hero.counter': 'Insights linked',
    'about.eyebrow': 'About',
    'about.h2.a': 'Insight first. ',
    'about.h2.em': 'Then',
    'about.h2.b': ' the brand.',
    'works.h2': 'Brands, systems and campaigns',
    'publications.eyebrow': 'Publications & podcasts',
    'publications.h2': 'On the record',
    'press.article': 'Article',
    'press.case': 'Case study',
    'press.commentary': 'Commentary',
    'press.insight': 'Industry insight',
    'press.podcast': 'Podcast',
    'recognition.eyebrow': 'Recognition',
    'recognition.a': 'Jury member, ',
    'recognition.em': 'E+ Awards',
    'recognition.b': ' (formerly Effie), 2024',
    'contact.eyebrow': 'Contact',
    'contact.h2.a': "Let's keep ",
    'contact.h2.em': 'in touch',
    'contact.line': 'Brand strategy, positioning, launches — or just a conversation about marketing.',
    'about.p1':
      "Since 2011, I've been building and scaling brands across consumer, tech, subscription, and digital products. I know how to turn complex products into brands people instantly understand and genuinely connect with.",
    'bridge':
      "So here are some examples of the brands, systems, and campaigns I've built over the years.",
    'works.title': 'Selected works',
    'archive.title': 'Archive',
    'case.back': 'Back to home',
    'case.next': 'Next case',
    'case.visit': 'Visit website',
    'footer.rights': 'All rights reserved',
  },
  ru: {
    'nav.about': 'Обо мне',
    'nav.works': 'Работы',
    'nav.publications': 'Публикации',
    'nav.contact': 'Контакты',
    'nav.switch': 'English version',
    'a11y.skip': 'К содержимому',
    'notfound.title': 'Страница не найдена',
    'notfound.text': 'Такой страницы нет или она переехала.',
    'footer.sitemap': 'Карта сайта',
    'meta.title': 'Мария Ткаченко — бренд-стратег и маркетинг-лидер',
    'meta.description':
      'Маркетинг-лидер и бренд-стратег. Превращаю клиентские инсайты в чёткое позиционирование и маркетинговую стратегию для сложных продуктов и брендов.',
    'hero.eyebrow': 'Мария Ткаченко',
    'hero.h1.a': 'Я строю бренды, которые ',
    'hero.h1.em': 'двигают',
    'hero.h1.b': ' рост',
    'hero.roles': 'Маркетинг-лидер / Бренд-стратег / Жюри E+ Awards, 2024',
    'hero.intro':
      'Превращая клиентские инсайты в чёткое позиционирование и маркетинговую стратегию, я помогаю сложным продуктам становиться брендами, которые люди мгновенно понимают и к которым по-настоящему привязываются.',
    'hero.ctaWork': 'Смотреть работы →',
    'hero.ctaContact': 'Связаться',
    'hero.photoAlt': 'Портрет Марии Ткаченко',
    'hero.caption': 'Нажмите на сеть',
    'hero.counter': 'Связано инсайтов',
    'about.eyebrow': 'Обо мне',
    'about.h2.a': 'Сначала инсайт. ',
    'about.h2.em': 'Потом',
    'about.h2.b': ' бренд.',
    'works.h2': 'Бренды, системы и кампании',
    'publications.eyebrow': 'Публикации и подкасты',
    'publications.h2': 'В прессе и эфире',
    'press.article': 'Статья',
    'press.case': 'Кейс',
    'press.commentary': 'Комментарий',
    'press.insight': 'Отраслевой разбор',
    'press.podcast': 'Подкаст',
    'recognition.eyebrow': 'Признание',
    'recognition.a': 'Член жюри ',
    'recognition.em': 'E+ Awards',
    'recognition.b': ' (ранее Effie), 2024',
    'contact.eyebrow': 'Контакты',
    'contact.h2.a': 'Давайте ',
    'contact.h2.em': 'общаться',
    'contact.line': 'Бренд-стратегия, позиционирование, запуски — или просто разговор о маркетинге.',
    'about.p1':
      'С 2011 года я строю и масштабирую бренды в потребительском, технологичном, подписочном и цифровом сегментах. Я умею превращать сложные продукты в бренды, которые люди мгновенно понимают и к которым по-настоящему привязываются.',
    'bridge':
      'Вот несколько примеров брендов, систем и кампаний, которые я создала за эти годы.',
    'works.title': 'Избранные работы',
    'archive.title': 'Архив',
    'case.back': 'На главную',
    'case.next': 'Следующий кейс',
    'case.visit': 'Перейти на сайт',
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
