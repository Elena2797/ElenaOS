// Turno de noche (D65, 2026-09-22).
//
// Mientras ella duerme, Isabel trabaja sola en JETMI, Marca Personal, Marca
// Propia y Vida Personal: ordena lo que hay y deja cosas listas para usar
// (borradores, planes, comparaciones, checklists) y, como mucho, una pregunta
// por dominio. VistaJet nunca. Aquí solo se decide qué enseña cada dominio de
// lo que devuelve GET /v1/app/night; el servidor decide qué se hizo.

export const NIGHT_AREAS = Object.freeze(['JETMI', 'Marca Personal', 'Marca Propia', 'Vida Personal']);

/** "Esta noche", "Ayer" o la fecha, contando en Madrid. */
export function nightDayLabel(date, today) {
  if (!date) return '';
  if (date === today) return 'Esta noche';
  const diff = Math.round((Date.parse(`${today}T12:00:00Z`) - Date.parse(`${date}T12:00:00Z`)) / 864e5);
  if (diff === 1) return 'Ayer';
  const d = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'Europe/Madrid' });
}

/**
 * Lo que enseña un dominio: el trabajo de la última noche en que Isabel dejó
 * algo para él, y su pregunta si la hay. Estados: 'hidden' (dominio en el que
 * no trabaja sola), 'unlinked', 'loading', 'error', 'empty' y 'ok'.
 */
export function buildNightWorkModel(report, areaName, { linked, today }) {
  if (!NIGHT_AREAS.includes(areaName)) return { state: 'hidden' };
  if (!linked) return { state: 'unlinked' };
  if (!report) return { state: 'loading' };
  if (report.ok === false) return { state: 'error' };

  const mine = (list) => (Array.isArray(list) ? list : []).filter((w) => w.area === areaName);
  const work = mine(report.work);
  const questions = mine(report.questions);
  const dates = [...work, ...questions].map((w) => w.date).filter(Boolean).sort();
  const last = dates.at(-1) || null;
  if (!last) return { state: 'empty', lastRun: report.last_run?.date || null };

  const items = work.filter((w) => w.date === last).map((w) => ({
    id: w.id, label: w.label || 'Trabajo', title: w.title, body: w.body || '',
  }));
  const q = questions.filter((w) => w.date === last).at(-1) || null;
  return {
    state: 'ok',
    date: last,
    dayLabel: nightDayLabel(last, today),
    items,
    question: q ? { id: q.id, text: q.title, body: q.body || q.title } : null,
  };
}
