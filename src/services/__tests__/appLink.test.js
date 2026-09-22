import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAppLinkClient, TOKEN_KEY } from '../appLink.js';

function memoryStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
}

const reply = (status, body) => ({ status, json: async () => body });

test('sin conectar no pide nada privado al servidor', async () => {
  let calls = 0;
  const c = createAppLinkClient({ base: 'x', storage: memoryStorage(), fetchImpl: async () => { calls++; return reply(200, {}); } });
  assert.equal(c.isLinked(), false);
  assert.equal((await c.get('/v1/app/today')).error, 'not_linked');
  assert.equal(calls, 0);
});

test('el código correcto deja la app conectada y manda el token', async () => {
  const storage = memoryStorage();
  const seen = [];
  const c = createAppLinkClient({
    base: 'https://api', storage,
    fetchImpl: async (url, opts) => {
      seen.push({ url, headers: opts.headers });
      if (url.endsWith('/link/verify')) return reply(200, { ok: true, token: 'v1.a.b' });
      return reply(200, { ok: true });
    },
  });
  await c.verify('id', '123456');
  assert.equal(c.isLinked(), true);
  assert.equal(seen[0].headers['x-app-token'], undefined);
  await c.get('/v1/app/today');
  assert.equal(seen[1].headers['x-app-token'], 'v1.a.b');
  assert.equal(seen[1].headers['x-api-key'], undefined, 'el bundle ya no lleva API key (SECURITY #2)');
  assert.equal(c.token(), 'v1.a.b');
});

test('si el servidor rechaza el token, la app lo olvida', async () => {
  const storage = memoryStorage();
  storage.setItem(TOKEN_KEY, 'viejo');
  const c = createAppLinkClient({ base: 'x', storage, fetchImpl: async () => reply(401, { ok: false }) });
  const r = await c.get('/v1/app/today');
  assert.equal(r.unlinked, true);
  assert.equal(c.isLinked(), false);
});

test('un fallo de red no rompe la app ni la desconecta', async () => {
  const storage = memoryStorage();
  storage.setItem(TOKEN_KEY, 't');
  const c = createAppLinkClient({ base: 'x', storage, fetchImpl: async () => { throw new Error('offline'); } });
  assert.equal((await c.get('/v1/app/today')).error, 'network');
  assert.equal(c.isLinked(), true);
});
