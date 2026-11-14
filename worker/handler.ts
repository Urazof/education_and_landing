// Обработчик формы обратной связи: POST /api/contact (docs/FORM-PLAN.md, фаза 2).
//
// Логика отделена от точки входа Worker (index.ts): здесь нет импортов `cloudflare:*`, поэтому её можно запускать и проверять
// обычным Node (`npm run test:worker`). Создание письма и отправку подставляет вызывающий код (`makeMessage`, `env.SEND_EMAIL`).
//
// Поток: проверка метода/источника/размера → разбор формы → honeypot → валидация → письмо на CONTACT_TO → 303 на страницу
// на главную с якорем #contact-sent (или #contact-error): форма заменяется сообщением. Содержимое сообщений нигде не сохраняется и не логируется.

export interface MailEnv {
  /** Привязка `send_email` (Cloudflare Email Routing). */
  SEND_EMAIL: { send(message: unknown): Promise<void> };
  /** Адрес Марии. Секрет (`wrangler secret put CONTACT_TO`), в репозитории его нет. Должен быть подтверждён в Email Routing. */
  CONTACT_TO: string;
  /**
   * Ограничитель частоты (привязка `ratelimits` в wrangler.jsonc). Необязательный: если привязки нет (локально, тесты), ограничения просто нет.
   * Счётчик приблизительный и ведётся отдельно в каждом дата-центре Cloudflare.
   */
  RATE_LIMITER?: { limit(options: { key: string }): Promise<{ success: boolean }> };
  /** Адрес отправителя на домене сайта, например site@mariatkachenko.savor.ing. Обычная переменная из wrangler.jsonc. */
  CONTACT_FROM: string;
}

/** Собирает объект письма для `env.SEND_EMAIL.send` (в Worker это `new EmailMessage(from, to, raw)`). */
export type MakeMessage = (from: string, to: string, raw: string) => unknown;

// Значения <option value> из ContactForm.astro → подпись в теме письма (всегда английская, Мария читает почту единообразно).
export const TOPICS = {
  hiring: 'Full-time role',
  product: 'Product to ship',
  talk: 'Talk or workshop',
  other: 'Something else',
} as const;
type Topic = keyof typeof TOPICS;

const LIMITS = { name: 100, email: 254, organization: 150, message: 4000 } as const;
const MAX_BODY_BYTES = 20_000; // 4000 символов кириллицы ≈ 8 КБ + поля; с запасом
const LANGS = ['en', 'ru'] as const;
type Lang = (typeof LANGS)[number];

export interface Submission {
  topic: Topic;
  name: string;
  email: string;
  organization: string;
  message: string;
  lang: Lang;
}

type Parsed = { kind: 'ok'; data: Submission } | { kind: 'bot'; lang: Lang } | { kind: 'invalid'; lang: Lang };

const EMAIL_RE = /^[^\s@<>"',;:()[\]\\]+@[^\s@<>"',;:()[\]\\]+\.[^\s@<>"',;:()[\]\\]{2,}$/;
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u001f\u007f]/g;

// Результат показывает сама главная страница: якорь #contact-sent / #contact-error включает CSS :target в ContactForm.astro (без JS и без отдельных страниц).
const pathFor = (lang: Lang, page: 'sent' | 'error') => `${lang === 'ru' ? '/ru' : ''}/#contact-${page}`;

function redirect(lang: Lang, page: 'sent' | 'error'): Response {
  // 303: после POST браузер делает GET на главную с якорем результата; повторная отправка по «Обновить» не происходит.
  return new Response(null, { status: 303, headers: { Location: pathFor(lang, page), 'Cache-Control': 'no-store' } });
}

/** Однострочное поле: управляющие символы (в том числе CR/LF) заменяем пробелом — защита от инъекции заголовков письма. */
function oneLine(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.replace(CONTROL, ' ').replace(/\s+/g, ' ').trim() : '';
}

/** Многострочное поле: оставляем переводы строк и табы, убираем остальные управляющие символы. */
function multiLine(value: FormDataEntryValue | null): string {
  if (typeof value !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return value.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim();
}

export function parseSubmission(form: FormData): Parsed {
  const langRaw = oneLine(form.get('lang'));
  const lang: Lang = (LANGS as readonly string[]).includes(langRaw) ? (langRaw as Lang) : 'en';

  // Honeypot: человек поле не видит. Бот, заполнивший его, получает «успех», чтобы не подбирать обход.
  if (oneLine(form.get('website')) !== '') return { kind: 'bot', lang };

  const topicRaw = oneLine(form.get('topic'));
  const name = oneLine(form.get('name'));
  const email = oneLine(form.get('email'));
  const organization = oneLine(form.get('organization'));
  const message = multiLine(form.get('message'));

  const valid =
    Object.hasOwn(TOPICS, topicRaw) &&
    name.length > 0 &&
    name.length <= LIMITS.name &&
    email.length <= LIMITS.email &&
    EMAIL_RE.test(email) &&
    organization.length <= LIMITS.organization &&
    message.length > 0 &&
    message.length <= LIMITS.message;
  if (!valid) return { kind: 'invalid', lang };

  return { kind: 'ok', data: { topic: topicRaw as Topic, name, email, organization, message, lang } };
}

/** Заголовок с не-ASCII: RFC 2047, несколько «encoded-word» по ≤ 36 байт (строка заголовка не длиннее 75 символов). */
export function encodeHeader(text: string): string {
  if (/^[\x20-\x7e]*$/.test(text)) return text;
  const enc = new TextEncoder();
  const words: string[] = [];
  let chunk = '';
  const flush = () => {
    if (chunk) words.push(`=?UTF-8?B?${toBase64(enc.encode(chunk))}?=`);
    chunk = '';
  };
  for (const ch of text) {
    if (enc.encode(chunk + ch).length > 36) flush();
    chunk += ch;
  }
  flush();
  return words.join('\r\n ');
}

function toBase64(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

/** Тело base64, строки по 76 символов (RFC 2045). */
function base64Body(text: string): string {
  return (toBase64(new TextEncoder().encode(text)).match(/.{1,76}/g) ?? []).join('\r\n');
}

/** Собирает письмо целиком (заголовки + тело) как text/plain UTF-8. Все значения в заголовках уже очищены от CR/LF. */
export function buildEmail(data: Submission, from: string, to: string, now = new Date(), id: string = crypto.randomUUID()): string {
  const domain = from.split('@')[1] ?? 'localhost';
  const subject = `[Site] ${TOPICS[data.topic]} — ${data.name}`.slice(0, 120);
  const body = [
    `Topic: ${TOPICS[data.topic]}`,
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Organization: ${data.organization || '—'}`,
    `Language: ${data.lang}`,
    '',
    'Message:',
    data.message,
    '',
  ]
    .join('\n')
    .replace(/\n/g, '\r\n');

  return [
    `From: "Site contact form" <${from}>`,
    `To: ${to}`,
    `Reply-To: ${data.email}`,
    `Subject: ${encodeHeader(subject)}`,
    `Date: ${now.toUTCString()}`,
    `Message-ID: <${id}@${domain}>`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    base64Body(body),
    '',
  ].join('\r\n');
}

/** Форма должна быть отправлена с нашего же сайта (защита от кросс-сайтовых POST). */
export function isSameOrigin(request: Request): boolean {
  const here = new URL(request.url).host;
  const source = request.headers.get('Origin') ?? request.headers.get('Referer');
  if (!source) return false;
  try {
    return new URL(source).host === here;
  } catch {
    return false;
  }
}

/** Читает тело запроса не больше `max` байт; при превышении возвращает null и не дочитывает поток. */
async function readLimited(request: Request, max: number): Promise<Uint8Array<ArrayBuffer> | null> {
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > max) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

export async function handleContact(request: Request, env: MailEnv, makeMessage: MakeMessage): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
  }
  if (!isSameOrigin(request)) return new Response('Forbidden', { status: 403 });

  const type = request.headers.get('Content-Type') ?? '';
  if (!/^(application\/x-www-form-urlencoded|multipart\/form-data)/i.test(type)) {
    return new Response('Unsupported Media Type', { status: 415 });
  }
  // Размер: заявленный заранее отсекаем сразу, а фактический читаем потоком с ограничением (заголовок может отсутствовать или врать).
  if (Number(request.headers.get('Content-Length')) > MAX_BODY_BYTES) return new Response('Payload Too Large', { status: 413 });
  const bytes = await readLimited(request, MAX_BODY_BYTES);
  if (!bytes) return new Response('Payload Too Large', { status: 413 });

  let form: FormData;
  try {
    form = await new Response(bytes, { headers: { 'Content-Type': type } }).formData();
  } catch {
    return redirect('en', 'error');
  }

  const parsed = parseSubmission(form);
  if (parsed.kind === 'bot') return redirect(parsed.lang, 'sent');
  if (parsed.kind === 'invalid') return redirect(parsed.lang, 'error');

  // Ограничение частоты стоит ПОСЛЕ валидации и ПЕРЕД отправкой: защищаем почтовый ящик от потока писем с одного адреса.
  // Если лимит исчерпан — тот же экран ошибки, что и при сбое. Если сам лимитер недоступен — пропускаем (форма важнее счётчика).
  if (env.RATE_LIMITER) {
    try {
      const { success } = await env.RATE_LIMITER.limit({ key: request.headers.get('CF-Connecting-IP') ?? 'unknown' });
      if (!success) return redirect(parsed.data.lang, 'error');
    } catch {
      // лимитер не ответил — не блокируем посетителя
    }
  }

  try {
    const raw = buildEmail(parsed.data, env.CONTACT_FROM, env.CONTACT_TO);
    await env.SEND_EMAIL.send(makeMessage(env.CONTACT_FROM, env.CONTACT_TO, raw));
  } catch (err) {
    // Логируем только тип ошибки: ни текст сообщения, ни адрес посетителя в логи не попадают.
    console.error('contact: send failed', err instanceof Error ? err.name : typeof err);
    return redirect(parsed.data.lang, 'error');
  }
  return redirect(parsed.data.lang, 'sent');
}
