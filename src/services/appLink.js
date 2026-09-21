// Conexión de la app con ella, para lo privado (D57).
//
// La API key de la app es pública (va en el bundle), así que lo que le dice
// Isabel, su agenda o su Instagram solo salen con un token de app. El token se
// consigue una vez con un código que isabel-api manda a su Telegram, y se
// guarda en este móvil. Si el servidor lo rechaza (caducado o revocado), se
// olvida y la app vuelve a ofrecer "Conectar".

export const TOKEN_KEY = 'lifeos_app_token';

export function createAppLinkClient({ base, apiKey, storage = globalThis.localStorage, fetchImpl = (...a) => fetch(...a) }) {
  const read = () => { try { return storage?.getItem(TOKEN_KEY) || null; } catch { return null; } };
  const write = (token) => {
    try { if (token) storage.setItem(TOKEN_KEY, token); else storage.removeItem(TOKEN_KEY); } catch { /* sin almacenamiento: no queda conectada */ }
  };

  async function call(path, { method = 'GET', body, auth = true } = {}) {
    const headers = { 'x-api-key': apiKey };
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
