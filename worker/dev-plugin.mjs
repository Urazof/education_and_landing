// Локальная имитация /api/contact для `npm run dev` (только режим разработки; в сборку и в прод не попадает).
//
// Зачем: `astro dev` — это только статика, Worker в нём не запускается, поэтому отправка формы заканчивалась бы 404.
// Плагин подключается к dev-серверу Vite и прогоняет запрос через НАСТОЯЩИЙ обработчик worker/handler.ts (те же проверки, валидация,
// сборка письма и редирект), а вместо отправки по почте печатает письмо в терминал.
//
// Проверка ошибки: запустить `CONTACT_DEV_FAIL=1 npm run dev` (PowerShell: `$env:CONTACT_DEV_FAIL=1; npm run dev`) —
// «отправка» будет падать, и форма покажет сообщение об ошибке.

/** @type {Map<string, number[]>} */
const rateHits = new Map();

/** @returns {import('vite').Plugin} */
export function contactDevApi() {
  return {
    name: 'contact-dev-api',
    apply: 'serve',
    configureServer(server) {
      // Свой обработчик обязан стоять ПЕРВЫМ: при trailingSlash: 'always' Astro отвечает 404 на адрес без завершающего слэша,
      // а форма (как и боевой Worker) шлёт POST именно на /api/contact.
      server.middlewares.use('/api/contact', async (req, res) => {
        try {
          const { handleContact } = await server.ssrLoadModule('/worker/handler.ts');

          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const body = Buffer.concat(chunks);

          const headers = new Headers();
          for (const [name, value] of Object.entries(req.headers)) {
            if (value !== undefined) headers.set(name, Array.isArray(value) ? value.join(', ') : value);
          }
          const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
          const request = new Request(`http://${req.headers.host}/api/contact`, {
            method: req.method,
            headers,
            body: hasBody ? body : undefined,
          });

          const env = {
            // Локальный аналог привязки ratelimits: 5 запросов в минуту на ключ (в памяти процесса).
            RATE_LIMITER: {
              async limit(/** @type {{key: string}} */ { key }) {
                const now = Date.now();
                const hits = (rateHits.get(key) ?? []).filter((t) => now - t < 60_000);
                hits.push(now);
                rateHits.set(key, hits);
                return { success: hits.length <= 5 };
              },
            },
            CONTACT_FROM: 'site@mariatkachenko.savor.ing',
            CONTACT_TO: 'dev@localhost',
            SEND_EMAIL: {
              async send(/** @type {{from: string, to: string, raw: string}} */ message) {
                if (process.env.CONTACT_DEV_FAIL) throw new Error('simulated failure (CONTACT_DEV_FAIL)');
                const [head, encoded = ''] = message.raw.split('\r\n\r\n');
                const text = Buffer.from(encoded.replace(/\r\n/g, ''), 'base64').toString('utf8');
                console.log(`\n[contact-dev] письмо НЕ отправлено, только печать (${message.from} → ${message.to}):\n${head}\n\n${text}`);
              },
            },
          };

          const response = await handleContact(request, env, (from, to, raw) => ({ from, to, raw }));
          res.statusCode = response.status;
          response.headers.forEach((value, name) => res.setHeader(name, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (err) {
          console.error('[contact-dev]', err);
          res.statusCode = 500;
          res.end('dev handler error');
        }
      });
      // Свой слой должен оказаться первым в стеке: Astro сам ставит впереди devTrailingSlash (при trailingSlash: 'always' он отвечает 404
      // на /api/contact без слэша). Astro добавляет свои слои уже после нашего хука, поэтому переставляем слой в «пост»-хуке.
      const stack = /** @type {any} */ (server.middlewares).stack;
      const layer = stack[stack.length - 1];
      return () => {
        stack.splice(stack.indexOf(layer), 1);
        stack.unshift(layer);
      };
    },
  };
}
