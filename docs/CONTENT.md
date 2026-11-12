# Content inventory

Source of truth: the CURRENT project (`src/i18n/ui.ts`, `src/components/*`, `src/content/cases/*.md`), which is also what
https://mariatkachenko.savor.ing/ serves. Updated in redesign Phase 0 (the kit's TODOs were filled from the project).
Anything still marked TODO must be supplied by Maria. Do not invent it.

## Site meta
- Title: `Maria Tkachenko — Brand strategist & marketing leader`
- Description (на сайте сейчас, 150 символов, ждёт подтверждения Марии): `Marketing leader and brand strategist. I turn customer insight into clear positioning and marketing strategy for complex products people connect with.`
  RU (146): «Маркетинг-лидер и бренд-стратег. Превращаю клиентские инсайты в чёткое позиционирование и маркетинговую стратегию для сложных продуктов и брендов.»
  Альтернативы (EN, из той же лексики hero/About):
  B (151): `Maria Tkachenko: marketing leader and brand strategist. Brands, systems and campaigns built on customer insight, from positioning to launch and growth.`
  C: `Marketing leader and brand strategist since 2011. I turn customer insight into clear positioning and strategy for consumer, tech and digital brands.`
- OG image: `public/og.png` (1200×630): имя, заголовок и роли из hero, домен, на фоне сеть как в hero. Собран из HTML-шаблона и отрисован Chrome с шрифтами сайта (см. `ASTRO-EDUCATION.md` §24). Ждёт одобрения Марии.
- Domain / canonical: `https://mariatkachenko.savor.ing` (set as `site` in `astro.config.mjs`)

## Hero (keys in `src/i18n/ui.ts`)
- Eyebrow / name: Maria Tkachenko (`hero.greeting` = "Hi! My name is Maria Tkachenko." — decide whether the eyebrow keeps the greeting)
- Roles (`hero.role`): Marketing leader & brand strategist. The kit also lists "E+ Awards jury, 2024" (true: see Recognition).
- H1 (EN): I build brands that drive growth. (first sentence of `hero.intro`)
- Intro (`hero.intro`, EN): "I build brands that drive growth. Turning customer insight into clear positioning and marketing strategy, I help complex products become brands people instantly understand and genuinely connect with."
- Intro (`hero.intro`, RU): see `ui.ts` (RU is kept; the H1 needs an RU counterpart — taken from the first sentence of RU `hero.intro`: «Я строю бренды, которые двигают рост.»)
- Portrait: `src/assets/maria-photo.jpg` (with background) / `maria-photo.png` (cut-out). `[TODO: original high-res file if available]`

## About (`about.p1`, `bridge`)
- H2 (kit): Insight first. Then the brand. (RU: `[TODO: translation — ask Maria]`)
- Body (EN): "Since 2011, I've been building and scaling brands across consumer, tech, subscription, and digital products. I know how to turn complex products into brands people instantly understand and genuinely connect with."
- Closing line (`bridge`, EN): "So here are some examples of the brands, systems, and campaigns I've built over the years."
- RU versions of both: see `ui.ts`.

## Cases (content collection `cases`, URL `/cases/[slug]`, RU `/ru/cases/[slug]`)
| slug | client | title (field `title`) | notes |
|---|---|---|---|
| grow-food | Grow Food | Brand transformation | order 1 |
| priem | Priem.menu | Building brand from zero | order 2 |
| eucerin | Eucerin | Brand launch | order 3 |
| philips | Philips | Philthemusic | order 4 |
| cofix | Cofix | Communication refresh | order 5 |
| wrc | WRC Academy | Faster than ever | `archive: true`, hidden from Works, linked from the Archive chip |

Case bodies, images, videos and socials live in `src/content/cases/*.md` and `src/assets/`. Do not rewrite them.
Case URLs do NOT change in the redesign → no redirects needed (kit's `/work/` path is not used).
Case card images in Works: `*-card-bg.*` files; the kit mockup's flat pastel tiles are only placeholders for them.

## Publications (collection `press`, currently chips in `Publications.astro`)
Real URLs; **utm_* / fbclid must be stripped** when moved to the collection (3 of them currently carry tracking params).
| label (current) | outlet | url |
|---|---|---|
| Budget Brand Positioning | RBC Pro | https://pro.rbc.ru/demo/68c2a7fc9a79471e2ffb35a2 |
| Brand transformation | Sostav | https://www.sostav.ru/publication/grow-food-54891.html |
| Expert Commentary | INC Russia | https://incrussia.ru/understand/vzglyad-iznutri/ |
| Industry Insight | Pravila | https://www.pravilamag.ru/articles/717169-s-pristavkoi-e-kak-razvivayutsya-onlain-servisy-taksi-dostavki-i-bronirovaniya-v-rossii/ |
| Marketing Conspiracies (Podcast) | Yandex Music | https://music.yandex.ru/album/10812233/track/109049947 |
| The Anatomy of Advertising (Podcast) | Yandex Music | https://music.yandex.ru/album/11092212/track/109138048 |

Titles in the kit mockup ("Brand positioning on a budget", "Online services in Russia: taxi, delivery, booking", …) are
descriptive and not confirmed by Maria. Use the current labels unless she approves the longer titles.

## Recognition
- Jury Member, E+ Awards (formerly Effie), 2024 — https://eplus.marketing/award/jury/jury-old/2024

## Contact (`contact.title`: "Let's keep in touch" / «Давайте общаться»)
- Line (kit): Brand strategy, positioning, launches — or just a conversation about marketing. (RU: `[TODO]`)
- LinkedIn: https://www.linkedin.com/in/maria-tkachenko-k/
- Telegram: https://t.me/marymishel
- WhatsApp: https://wa.me/message/DLSCXFQCCOVPA1

## Footer
- © {current year} Maria Tkachenko. (`footer.rights`: All rights reserved / Все права защищены)

## Новые строки редизайна — ждут подтверждения Марии (Phase 2)
Копирайт ниже взят из макета набора или переведён на RU черновым образом; в старом сайте его не было.
- `works.h2` «Brands, systems and campaigns» / «Бренды, системы и кампании» (парафраз строки `bridge`).
- `publications.h2` «On the record» / «В прессе и эфире».
- Типы публикаций: Article, Case study, Commentary, Industry insight, Podcast (RU: Статья, Кейс, Комментарий, Отраслевой разбор, Подкаст).
- RU: роли в hero, CTA «Смотреть работы →» / «Связаться», About H2 «Сначала инсайт. Потом бренд.», строка Contact.
- Названия изданий и заголовки публикаций на `/ru/` остаются английскими (текущие подписи чипов).
- Подпись под портретом (hero.caption): «Click the network — every node is a customer insight.» (из макета) / RU «Нажмите на сеть — каждый узел — это клиентский инсайт.»; счётчик «Insights linked» / «Связано инсайтов».
- Ссылка «Archive →» ведёт прямо на кейс WRC (`/cases/wrc`): отдельной страницы архива нет. Решить: оставить, переименовать или сделать страницу архива.
