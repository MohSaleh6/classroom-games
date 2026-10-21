// Cloudflare Worker: serves a classroom game on workers.dev by passing every request
// to the game's Vercel site. Some Jordanian internet providers block *.vercel.app,
// but Cloudflare can still reach it, so students only ever see the workers.dev address.
// Change TARGET to use the same Worker for another game.
const TARGET = 'https://midterm-quest-moh-93f1.vercel.app';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const target = new URL(url.pathname + url.search, TARGET);
    const headers = new Headers(request.headers);
    headers.delete('host');
    const init = { method: request.method, headers, redirect: 'follow' };
    if (request.method !== 'GET' && request.method !== 'HEAD') init.body = await request.arrayBuffer();
    try {
      const res = await fetch(target, init);
      return new Response(res.body, { status: res.status, statusText: res.statusText, headers: res.headers });
    } catch (e) {
      return new Response('The game server could not be reached. Please try again in a minute.', { status: 502 });
    }
  },
};
