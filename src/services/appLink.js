// Conexión de la app con ella (D57). El token de app es la única llave de la
// app ante isabel-api (SECURITY.md #2: el bundle ya no lleva API key). Se
// consigue una vez con un código que isabel-api manda a su Telegram, y se
// guarda en este móvil. Si el servidor lo rechaza (caducado o revocado), se
// olvida y la app vuelve a pedir entrar.

export const TOKEN_KEY = 'lifeos_app_token';

export function createAppLinkClient({ base, storage = globalThis.localStorage, fetchImpl = (...a) => fetch(...a) }) {
  const read = () => { try { return storage?.getItem(TOKEN_KEY) || null; } catch { return null; } };
  const write = (token) => {
    try { if (token) storage.setItem(TOKEN_KEY, token); else storage.removeItem(TOKEN_KEY); } catch { /* sin almacenamiento: no queda conectada */ }
  };

  async function call(path, { method = 'GET', body, auth = true } = {}) {
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (auth) {
      const token = read();
      if (!token) return { ok: false, error: 'not_linked' };
      headers['x-app-token'] = token;
    }
    let res;
    try {
      res = await fetchImpl(base + path, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
    } catch (e) {
      return { ok: false, error: 'network', detail: e.message };
    }
    let data = null;
    try { data = await res.json(); } catch { /* respuesta sin JSON */ }
    if (auth && res.status === 401) { write(null); return { ok: false, error: 'not_linked', unlinked: true }; }
    return data || { ok: false, error: `http_${res.status}` };
  }

  return {
    isLinked: () => Boolean(read()),
    token: read,
    start: () => call('/v1/app/link/start', { method: 'POST', auth: false }),
    async verify(linkId, code) {
      const r = await call('/v1/app/link/verify', { method: 'POST', body: { link_id: linkId, code }, auth: false });
      if (r?.ok && r.token) write(r.token);
      return r;
    },
    unlink: () => write(null),
    get: (path) => call(path),
    post: (path, body) => call(path, { method: 'POST', body }),
  };
}
