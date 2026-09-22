// "Lo que Isabel sabe de ti" (O5 canary, 2026-09-22).
//
// Lo que ella cuenta por Telegram de sí misma —preferencias, objetivos,
// compromisos con fecha, restricciones— y que Isabel guarda con
// `knowledge_remember`. La app solo lo enseña y deja olvidarlo: no es un chat
// (D55) ni sale en Inicio (D59). El servidor decide qué vale y qué caducó;
// aquí solo se agrupa y se pone en palabras.

const KIND_LABEL = {
  PREFERENCE: 'Preferencia',
  GOAL: 'Objetivo',
  COMMITMENT: 'Compromiso',
  CONSTRAINT: 'Límite',
  FACT: 'Dato',
  STATE: 'Ahora mismo',
};

const DOMAIN_ORDER = ['Vida Personal', 'Salud', 'Gym', 'VistaJet', 'JETMI', 'Finanzas', 'Marca Personal', 'Marca Propia', 'Libro'];

export function kindLabel(kind) {
  return KIND_LABEL[kind] || 'Dato';
}

function shortDate(iso) {
  if (!iso) return '';
  const d = new Date(`${String(iso).slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/Madrid' });
}

/** "Lo dijiste el mar, 22 sept · vale hasta dom, 27 sept". */
export function learnedMeta(item) {
  const parts = [];
  if (item.learned_on) parts.push(`Lo dijiste el ${shortDate(item.learned_on)}`);
  if (item.valid_until) parts.push(`${item.expired ? 'valió' : 'vale'} hasta el ${shortDate(item.valid_until)}`);
  return parts.join(' · ');
}

/**
 * Estado de la pantalla a partir de GET /v1/app/knowledge.
 * state: unlinked | loading | off | error | empty | ok
 */
export function buildLearnedModel(response, { linked = true } = {}) {
  if (!linked) return { state: 'unlinked' };
  if (!response) return { state: 'loading' };
  if (response.ok === false) {
    if (['kill_switch_off', 'read_disabled', 'invalid_stage_fails_closed'].includes(response.reason)) return { state: 'off' };
    return { state: 'error', error: response.error || response.reason || 'unavailable' };
  }
  const items = Array.isArray(response.items) ? response.items : [];
  const current = items.filter(i => !i.expired);
  const past = items.filter(i => i.expired);
  const byDomain = new Map();
  for (const item of current) {
    if (!byDomain.has(item.domain)) byDomain.set(item.domain, []);
    byDomain.get(item.domain).push(item);
  }
  const rank = d => (DOMAIN_ORDER.indexOf(d) + 1) || DOMAIN_ORDER.length + 1;
  const groups = [...byDomain.entries()]
    .sort(([a], [b]) => rank(a) - rank(b))
    .map(([domain, list]) => ({ domain, items: list }));
  return {
    state: items.length ? 'ok' : 'empty',
    paused: response.learning === false,
    count: current.length,
    groups,
    past,
  };
}
