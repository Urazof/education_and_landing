// Точка входа Cloudflare Worker (wrangler.jsonc → "main"). Статический сайт отдаёт Static Assets;
// Worker вызывается только для /api/* (assets.run_worker_first), всё остальное идёт мимо него.
import { EmailMessage } from 'cloudflare:email';
import { handleContact, type MailEnv } from './handler.ts';

interface Env extends MailEnv {
  /** Привязка к статическим файлам (assets.binding в wrangler.jsonc). */
  ASSETS: { fetch(request: Request): Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/contact') {
      return handleContact(request, env, (from, to, raw) => new EmailMessage(from, to, raw));
    }
    if (pathname.startsWith('/api/')) return new Response('Not Found', { status: 404 });
    return env.ASSETS.fetch(request);
  },
};
