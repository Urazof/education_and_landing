// Схема frontmatter кейса. Вынесена из content.config.ts, чтобы по ней же получить тип «развёрнутого» кейса
// (где все переводимые поля — обычные строки, см. localize.ts).
//
// Переводимое поле в файле кейса пишется как { en, ru } (en — база, ru — перевод) или как обычная строка
// (одинаково на всех языках: пустое поле, название бренда). Фабрика caseShape(text) принимает тип такого поля:
// localized — для файлов, z.string() — для типа после разворачивания.
import { z } from 'astro/zod';

// Любая ссылка в контенте: валидный URL без трекинг-параметров (utm_*, fbclid, igsh, gclid) — правило проекта.
export const cleanUrl = z
  .string()
  .url()
  .refine((u) => !/[?&](utm_[a-z]+|fbclid|igsh|gclid)=/i.test(u), 'URL contains tracking parameters');

// { en, ru }: en обязателен (база), ru необязателен — без него на /ru/ показывается английский + предупреждение при сборке.
export const localized = z.union([
  z.string(),
  z.object({ en: z.string(), ru: z.string().optional() }).strict(),
]);

export function caseShape<T extends z.ZodTypeAny>(text: T) {
  return z.object({
    title: text, // заголовок кейса, напр. "Brand transformation"
    client: z.string(), // "Grow Food" / "Priem" — название бренда, не переводится
    order: z.number(), // порядок в списке Works
    external: cleanUrl.optional(), // ссылка на продукт
    social: z.array(z.object({ label: z.string(), url: cleanUrl })).default([]),
    // Секции кейса: Context → Challenge → Strategy → Execution → Results → ...
    sections: z.array(
      z.object({
        heading: text,
        body: text,
        // Имена файлов картинок из src/assets (без пути). Резолвятся в CaseArticle
        // через import.meta.glob. Пусто = у секции нет иллюстраций.
        images: z.array(z.string()).default([]),
        // Видео для встраивания (YouTube). Каждое: url + ориентация.
        // vertical:true → вертикальный формат 9:16 (Shorts/сторис), иначе 16:9.
        // Принимаем и просто строку (= горизонтальное) для краткости.
        videos: z
          .array(
            z.union([
              cleanUrl,
              z.object({ url: cleanUrl, vertical: z.boolean().default(false) }),
            ]),
          )
          .default([])
          .transform((arr) =>
            arr.map((v) => (typeof v === 'string' ? { url: v, vertical: false } : v)),
          ),
        // Раскладка: default — картинки снизу, aside-right — текст слева/картинка справа,
        // aside-left — картинка слева/текст справа. Соответствует макету Miro.
        // default: текст→видео→картинки; aside-right: текст|картинка; aside-left: картинка|текст;
        // video-image: видео(шире)|картинка (для пар медиа без текста, напр. boxing+packaging GF)
        // spotlight: выделенный callout-блок (тонированная подложка) с опц. бейджем награды
        // (см. award) и опц. кнопкой-ссылкой (см. link). Впервые: Cofix «Campaign spotlight».
        // media-row: видео + картинки в ОДНОМ ряду общей высоты (сначала videos, потом images),
        // с cap высоты как у ImageRow. Для секции без heading/body. Впервые: Cofix (видео + 3 фото).
        layout: z
          .enum(['default', 'aside-right', 'aside-left', 'video-image', 'spotlight', 'media-row'])
          .default('default'),
        // Ссылка-кнопка под текстом секции (напр. themeal.menu в «What came next»).
        link: z.object({ label: text, url: cleanUrl }).optional(),
        // Список ссылок-референсов (напр. Credentials в WRC). label опционален — дефолт URL.
        links: z.array(z.object({ label: text.optional(), url: cleanUrl })).default([]),
        // Метрик-чипы (напр. Results в Eucerin): крупное значение + подпись.
        metrics: z.array(z.object({ value: z.string(), label: text })).default([]),
        // Текст ПОД чипсами (на макете: интро → чипсы → ещё текст → Context). Рендерится
        // после metrics в обычной раскладке. `body` при этом — текст ДО чипсов.
        after: text.optional(),
        // Маркированный список (буллеты) под текстом секции. Напр. Grow Food Execution:
        // подзаголовок (heading) + буллеты. Рендерится в обычной раскладке после body/after.
        bullets: z.array(text).default([]),
        // Смысловой ПОДзаголовок (менее жирный, чем heading). Напр. Grow Food: под «Execution»
        // идут подзаголовки «Brand platform and identity» / «Product and digital». Рендерится
        // отдельной строкой перед bullets/после heading в обычной раскладке.
        subheading: text.optional(),
        // Бейдж награды для layout:spotlight (напр. "2× Bronze — Tagline Awards").
        award: text.optional(),
        // Доп. текст-блоки в ТОЙ ЖЕ колонке текста (для aside-right/aside-left): например
        // Challenge стоит сразу под Context слева от общей вертикальной картинки (Cofix).
        extra: z.array(z.object({ heading: text, body: text })).default([]),
      }),
    ),
    // Маркированные результаты (метрики).
    results: z.array(z.string()).default([]),
    // archive: true — кейс не отображается в Works, доступен только по прямой ссылке (напр. через Archive-чип).
    archive: z.boolean().default(false),
    // Медиа-слоты: label = название, video = YouTube URL (пусто = плейсхолдер).
    media: z
      .array(
        z.object({
          label: text,
          video: z.string().optional(),
        }),
      )
      .default([]),
  });
}

// Кейс после разворачивания в один язык: все переводимые поля — строки.
export type CaseData = z.infer<ReturnType<typeof caseShape<z.ZodString>>>;
