// SEO-помощники для главной страницы (кейсы — в ./cases.ts).

// JSON-LD Person для главной (EN и RU). Структурированные данные пишем по-английски независимо от языка
// интерфейса: поисковики понимают их одинаково, а все факты ниже уже есть на сайте (hero, Recognition, Contact).
export function personJsonLd(site: URL, imageUrl?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Maria Tkachenko',
    jobTitle: 'Marketing leader & brand strategist',
    url: site.href,
    ...(imageUrl ? { image: imageUrl } : {}),
    // Профили (те же ссылки, что в блоке Contact). WhatsApp-ссылку не включаем: это не публичный профиль.
    sameAs: ['https://www.linkedin.com/in/maria-tkachenko-k/', 'https://t.me/marymishel'],
    award: 'Jury Member, E+ Awards (formerly Effie), 2024',
  };
}
