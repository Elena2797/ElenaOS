// agendaModel.js — la lógica pura de la agenda de vuelos en la app (sin DOM, sin fetch), para poder probarla.
// Los datos vienen de GET /v1/app/agenda (isabel-api/src/core/agenda.js): días con entradas
// { kind:'flight'|'rot', day, dep_icao, arr_icao, dep_local, arr_local, dep_utc, arr_utc, pax, tags, status, tail_number }.
// La hora que se ENSEÑA es siempre la local; para ordenar/comparar con el resto del día se usa la de Madrid.

const madridHM = (iso) =>
  new Date(iso).toLocaleTimeString('es-ES', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit' });

/** "Sáb, 26 sept · hoy". `today`/`tomorrow` son YYYY-MM-DD de Madrid. */
export function dayLabel(iso, today, tomorrow) {
  const d = new Date(iso + 'T12:00:00Z');
  const t = d.toLocaleDateString('es-ES', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' }).replace(/\./g, '');
  const tag = iso === today ? ' · hoy' : iso === tomorrow ? ' · mañana' : '';
  return t.charAt(0).toUpperCase() + t.slice(1) + tag;
}

/** El siguiente vuelo (hoy o después) que no haya aterrizado, o null. */
export function nextFlight(days, today) {
  return (days || [])
    .filter((d) => d.day >= today)
    .flatMap((d) => d.entries)
    .find((e) => e.kind === 'flight' && e.status !== 'landed') || null;
}

/** Último vuelo de ese avión (donde acaba): { arr_icao, ... } o null. */
export function lastLegOf(days, tail) {
  const legs = (days || []).flatMap((d) => d.entries)
    .filter((e) => e.kind === 'flight' && e.tail_number === tail && e.arr_icao)
    .sort((a, b) => String(a.dep_utc).localeCompare(String(b.dep_utc)));
  return legs.length ? legs[legs.length - 1] : null;
}

/** Texto de la tarjeta de VistaJet. `loaded` = ya se leyó la agenda. */
export function cardSummary({ days, today, linked }) {
  const idle = 'Tus vuelos y días de rotación, en hora local';
  if (!linked || !days) return idle;
  const next = nextFlight(days, today);
  if (next) return { next };
  return days.some((d) => d.day >= today) ? 'Días de rotación, sin vuelos definidos' : 'Sin vuelos guardados: mándale la foto a Isabel';
}

/**
 * ¿Este evento de Google Calendar es un vuelo que YA está en la agenda? Isabel llegó a crear vuelos en el calendario
 * (26/09, "no los quiero ahí"): si siguen ahí, "Tu día" los enseñaría dos veces. Solo cuenta como duplicado si HOY hay
 * vuelos en la agenda y el título trae una ruta "XXXX → YYYY" o un ICAO de uno de esos vuelos junto a una palabra de vuelo.
 */
export function looksLikeAgendaFlight(title, todayFlights) {
  if (!todayFlights || !todayFlights.length) return false;
  const t = String(title || '');
  if (/\b[A-Z]{4}\b\s*(?:→|->|–|-|>)\s*\b[A-Z]{4}\b/.test(t)) return true;
  const icaos = new Set(todayFlights.flatMap((f) => [f.dep_icao, f.arr_icao]).filter(Boolean));
  const hasIcao = [...icaos].some((c) => new RegExp('\\b' + c + '\\b').test(t));
  return hasIcao && /vuelo|flight|ferry|✈|9H-/i.test(t);
}

/**
 * Filas de "Tu día" de Inicio para hoy: los vuelos (hora local visible, ordenados por la hora real de Madrid) y el
 * día ROT. `at` es lo que se enseña; `sortAt` lo que ordena y marca "ahora".
 */
export function todayRows(days, today) {
  const day = (days || []).find((d) => d.day === today);
  return (day ? day.entries : []).map((e) => {
    if (e.kind === 'rot') return { at: '', sortAt: '', label: 'ROT', text: 'ROT · día de rotación, aún sin vuelos definidos', icon: 'ti-plane-inflight' };
    const pax = e.pax == null ? '' : ' · ' + e.pax + ' pax';
    return {
      at: e.dep_local, sortAt: madridHM(e.dep_utc), label: e.dep_local, icon: 'ti-plane-departure',
      text: e.dep_icao + ' → ' + e.arr_icao + ' · ' + e.dep_local + (e.arr_local ? '–' + e.arr_local : '') + pax + ' (hora local)',
    };
  });
}
