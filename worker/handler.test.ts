// Тесты обработчика формы (запуск: `npm run test:worker`, встроенный раннер Node, без зависимостей).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildEmail, encodeHeader, handleContact, type MailEnv } from './handler.ts';

const ORIGIN = 'https://site.test';
const URL_ = `${ORIGIN}/api/contact`;

function setup(fail = false) {
  const sent: { from: string; to: string; raw: string }[] = [];
  const env: MailEnv = {
    CONTACT_FROM: 'site@mariatkachenko.savor.ing',
    CONTACT_TO: 'owner@example.com',
    SEND_EMAIL: {
      async send(message) {
        if (fail) throw new Error('boom: secret text must not be logged');
        sent.push(message as { from: string; to: string; raw: string });
      },
    },
  };
  const make = (from: string, to: string, raw: string) => ({ from, to, raw });
  return { sent, env, make };
}

const good = {
  topic: 'hiring',
  name: 'Anna Ivanova',
  email: 'anna@example.com',
  organization: 'Acme',
  message: 'Hello!\nLet us talk.',
  lang: 'en',
  website: '',
};

function post(fields: Record<string, string>, headers: Record<string, string> = {}) {
  const body = new URLSearchParams(fields).toString();
  return new Request(URL_, {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: ORIGIN, ...headers },
  });
}

/** Достаёт заголовки и расшифрованное тело из собранного письма. */
function parseRaw(raw: string) {
  const [head, body] = raw.split('\r\n\r\n');
  const text = Buffer.from(body.replace(/\r\n/g, ''), 'base64').toString('utf8');
  return { head, text };
}

test('успех: 303 на /#contact-sent, письмо на CONTACT_TO, Reply-To = email посетителя', async () => {
  const { sent, env, make } = setup();
  const res = await handleContact(post(good), env, make);
  assert.equal(res.status, 303);
  assert.equal(res.headers.get('Location'), '/#contact-sent');
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, 'owner@example.com');
  assert.equal(sent[0].from, 'site@mariatkachenko.savor.ing');
  const { head, text } = parseRaw(sent[0].raw);
  assert.match(head, /^Reply-To: anna@example\.com$/m);
  assert.match(head, /^Subject: =\?UTF-8\?B\?/m); // в теме есть «—» → кодируется RFC 2047
  assert.match(text, /Name: Anna Ivanova/);
  assert.match(text, /Hello!\r\nLet us talk\./);
});

test('русская страница: редирект на /ru/#contact-sent', async () => {
  const { env, make } = setup();
  const res = await handleContact(post({ ...good, lang: 'ru' }), env, make);
  assert.equal(res.headers.get('Location'), '/ru/#contact-sent');
});

test('кириллица в имени: тема кодируется RFC 2047, строки ≤ 75, декодируется обратно', async () => {
  const { sent, env, make } = setup();
  await handleContact(post({ ...good, name: 'Мария Ткаченко-Иванова', lang: 'ru' }), env, make);
  const { head, text } = parseRaw(sent[0].raw);
  const subject = head.match(/^Subject: ((?:.|\r\n )+)$/m)![1];
  for (const line of subject.split('\r\n')) assert.ok(line.length <= 75, `слишком длинная строка: ${line.length}`);
  const decoded = [...subject.matchAll(/=\?UTF-8\?B\?([^?]+)\?=/g)].map((m) => Buffer.from(m[1], 'base64').toString('utf8')).join('');
  assert.match(decoded, /^\[Site\] Full-time role — Мария Ткаченко-Иванова$/);
  assert.match(text, /Name: Мария Ткаченко-Иванова/);
});

test('encodeHeader: чистый ASCII не трогаем', () => {
  assert.equal(encodeHeader('[Site] Hello'), '[Site] Hello');
});

test('инъекция заголовков: CR/LF в имени не создают новых заголовков', async () => {
  const { sent, env, make } = setup();
  await handleContact(post({ ...good, name: 'Bob\r\nBcc: evil@example.com', organization: 'X\nCc: evil@example.com' }), env, make);
  const { head } = parseRaw(sent[0].raw);
  assert.doesNotMatch(head, /^Bcc:/im);
  assert.doesNotMatch(head, /^Cc:/im);
});

test('email с переводом строки отклоняется', async () => {
  const { sent, env, make } = setup();
  const res = await handleContact(post({ ...good, email: 'a@example.com\r\nBcc: evil@example.com' }), env, make);
  assert.equal(res.headers.get('Location'), '/#contact-error');
  assert.equal(sent.length, 0);
});

test('honeypot: «успех» без отправки', async () => {
  const { sent, env, make } = setup();
  const res = await handleContact(post({ ...good, website: 'http://spam.example' }), env, make);
  assert.equal(res.headers.get('Location'), '/#contact-sent');
  assert.equal(sent.length, 0);
});

for (const [name, patch] of Object.entries({
  'пустое имя': { name: '  ' },
  'битый email': { email: 'not-an-email' },
  'пустое сообщение': { message: '   ' },
  'неизвестная тема': { topic: 'spam' },
  'слишком длинное сообщение': { message: 'x'.repeat(4001) },
  'слишком длинное имя': { name: 'x'.repeat(101) },
})) {
  test(`валидация: ${name} → /#contact-error, письмо не уходит`, async () => {
    const { sent, env, make } = setup();
    const res = await handleContact(post({ ...good, ...patch }), env, make);
    assert.equal(res.status, 303);
    assert.equal(res.headers.get('Location'), '/#contact-error');
    assert.equal(sent.length, 0);
  });
}

test('ошибка отправки: редирект на ошибку, в лог не попадает текст ошибки и сообщения', async () => {
  const { env, make } = setup(true);
  const logged: unknown[][] = [];
  const original = console.error;
  console.error = (...a: unknown[]) => void logged.push(a);
  try {
    const res = await handleContact(post(good), env, make);
    assert.equal(res.headers.get('Location'), '/#contact-error');
  } finally {
    console.error = original;
  }
  const out = JSON.stringify(logged);
  assert.doesNotMatch(out, /secret text|anna@example\.com|Hello/);
});

test('чужой Origin → 403, без Origin и Referer → 403', async () => {
  const { sent, env, make } = setup();
  assert.equal((await handleContact(post(good, { Origin: 'https://evil.example' }), env, make)).status, 403);
  const noOrigin = new Request(URL_, { method: 'POST', body: new URLSearchParams(good), headers: {} });
  assert.equal((await handleContact(noOrigin, env, make)).status, 403);
  assert.equal(sent.length, 0);
});

test('Referer с нашего сайта допустим, если нет Origin', async () => {
  const { sent, env, make } = setup();
  const req = new Request(URL_, {
    method: 'POST',
    body: new URLSearchParams(good),
    headers: { Referer: `${ORIGIN}/#contact` },
  });
  assert.equal((await handleContact(req, env, make)).status, 303);
  assert.equal(sent.length, 1);
});

test('GET → 405 с Allow: POST', async () => {
  const { env, make } = setup();
  const res = await handleContact(new Request(URL_), env, make);
  assert.equal(res.status, 405);
  assert.equal(res.headers.get('Allow'), 'POST');
});

test('JSON вместо формы → 415', async () => {
  const { env, make } = setup();
  const req = new Request(URL_, {
    method: 'POST',
    body: JSON.stringify(good),
    headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
  });
  assert.equal((await handleContact(req, env, make)).status, 415);
});

test('слишком большое тело → 413 (и по заголовку, и по факту)', async () => {
  const { sent, env, make } = setup();
  assert.equal((await handleContact(post(good, { 'Content-Length': '999999' }), env, make)).status, 413);
  assert.equal((await handleContact(post({ ...good, message: 'x'.repeat(30_000) }), env, make)).status, 413);
  assert.equal(sent.length, 0);
});

test('buildEmail: фиксированные дата и id, заголовки в порядке', () => {
  const raw = buildEmail(
    { topic: 'talk', name: 'Ann', email: 'a@b.co', organization: '', message: 'Hi', lang: 'en' },
    'site@mariatkachenko.savor.ing',
    'owner@example.com',
    new Date('2026-11-14T10:00:00Z'),
    'fixed-id',
  );
  assert.match(raw, /^From: "Site contact form" <site@mariatkachenko\.savor\.ing>\r\n/);
  assert.match(raw, /Message-ID: <fixed-id@mariatkachenko\.savor\.ing>/);
  assert.match(raw, /Date: Sat, 14 Nov 2026 10:00:00 GMT/);
  assert.match(raw, /Content-Transfer-Encoding: base64/);
});

// --- Ограничитель частоты ---
function limiter(allow: boolean | 'throw') {
  const keys: string[] = [];
  return {
    keys,
    RATE_LIMITER: {
      async limit({ key }: { key: string }) {
        keys.push(key);
        if (allow === 'throw') throw new Error('limiter down');
        return { success: allow };
      },
    },
  };
}

test('лимит исчерпан → экран ошибки, письмо не уходит; ключ — IP клиента', async () => {
  const { sent, env, make } = setup();
  const rl = limiter(false);
  const res = await handleContact(post(good, { 'CF-Connecting-IP': '203.0.113.7' }), { ...env, RATE_LIMITER: rl.RATE_LIMITER }, make);
  assert.equal(res.status, 303);
  assert.equal(res.headers.get('Location'), '/#contact-error');
  assert.equal(sent.length, 0);
  assert.deepEqual(rl.keys, ['203.0.113.7']);
});

test('лимит исчерпан на русской странице → /ru/#contact-error', async () => {
  const { env, make } = setup();
  const res = await handleContact(post({ ...good, lang: 'ru' }), { ...env, RATE_LIMITER: limiter(false).RATE_LIMITER }, make);
  assert.equal(res.headers.get('Location'), '/ru/#contact-error');
});

test('лимит не исчерпан → письмо уходит', async () => {
  const { sent, env, make } = setup();
  const res = await handleContact(post(good), { ...env, RATE_LIMITER: limiter(true).RATE_LIMITER }, make);
  assert.equal(res.headers.get('Location'), '/#contact-sent');
  assert.equal(sent.length, 1);
});

test('лимитер сломан → не блокируем посетителя (fail-open)', async () => {
  const { sent, env, make } = setup();
  const res = await handleContact(post(good), { ...env, RATE_LIMITER: limiter('throw').RATE_LIMITER }, make);
  assert.equal(res.headers.get('Location'), '/#contact-sent');
  assert.equal(sent.length, 1);
});

test('невалидные данные и honeypot лимитер не расходуют', async () => {
  const { env, make } = setup();
  const rl = limiter(true);
  await handleContact(post({ ...good, email: 'bad' }), { ...env, RATE_LIMITER: rl.RATE_LIMITER }, make);
  await handleContact(post({ ...good, website: 'spam' }), { ...env, RATE_LIMITER: rl.RATE_LIMITER }, make);
  assert.equal(rl.keys.length, 0);
});
