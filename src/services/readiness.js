// readiness.js — "Copiloto de entrega": cuánta confianza da entregar el avión tal como está.
//
// Contrato:
//   collectSignals(...)  → junta el estado real de cada módulo (Supabase).
//   assess(signals)      → función PURA: señales → objeto readiness. Sin UI, sin fetch.
//
// Qué mide (rediseño acordado con ella, 2026-09-25 — ver docs/modules/AIRCRAFT_READINESS.md):
//   La tarjeta contesta "¿qué confianza me da entregar el avión en estas condiciones?", evaluando SIEMPRE
//   como si entregara ahora, y SOLO con lo que depende de ELLA. Los defectos del avión (un jump seat
//   inoperativo, un AOG) son problema del avión, no suyo: no suman ni restan.
//   Sus pilares:
//     1. Inventario actualizado (contado de verdad, no estimado).
//     2. Laundry & Cleaning Form rellenado el día de la entrega.
//     3. Limpieza: las tareas diarias del HOTO marcadas (lo del microondas).
//     4. Documentos y feedbacks enviados.
//   Lo que hay que comprar (leche, revistas…) se muestra aparte, como aviso, sin bajar la confianza.
//
// Reglas de honestidad (fijadas por producto, siguen vigentes):
//   - Nunca inventar información ni asumir que algo está bien sin evidencia.
//   - Si no hay datos del avión ACTUAL (HOTO e inventario), no hay veredicto: se dice que falta evidencia.
//   - Sin HOTO previo no se esperan fechas históricas (no es un fallo de la CH actual).
//   - Nunca se evalúa el HOTO/inventario de otro avión (D14/D15/D34).

import { HOTO_SECTIONS } from '../hoto/model.js';

const DUTIES_TOTAL = HOTO_SECTIONS.flatMap((s) => s.items).length;

// Etiquetas de lo que hay que COMPRAR cuando el Shopping del HOTO está a 0.
const SHOPPING_LABELS = {
  lemons: 'limones', limes: 'limas', celery: 'apio', green_olives: 'aceitunas', oranges: 'naranjas',
  cucumber: 'pepino', milk_full: 'leche entera', milk_skimmed: 'leche desnatada', almond_milk: 'leche de almendra',
  evian: 'Evian', volvic: 'Volvic', herbs: 'hierbas',
};
const SHOP_KEYS = ['lemons', 'limes', 'celery', 'green_olives', 'oranges', 'cucumber', 'milk_full', 'milk_skimmed', 'oat_milk', 'almond_milk', 'evian', 'volvic', 'herbs'];

// ── Colector: lee el estado real de los módulos ──────────────────────────────
export async function collectSignals({ hotoSvc, invSvc, llcSvc, vjTasks, vjState, now = new Date() }) {
  const signals = { now, rotationStatus: vjState?.status || null };

  // Sin avión operativo actual no hay NADA que evaluar (D34). Los loaders reciben `undefined` y caerían en
  // "el más reciente de cualquier avión": evaluar el HOTO/inventario del avión ANTERIOR presentándolos como
  // los de ahora. Se declara con nombre para que el veredicto sea "no hay avión" y no "faltan datos".
  signals.aircraft = vjState?.aircraft || null;
  signals.noAircraft = !signals.aircraft;

  // HOTO (Supabase) — correlacionado con el avión operativo actual (D13).
  try {
    const rec = await hotoSvc.loadActiveHoto(vjState?.aircraft);
    if (!rec) signals.hoto = null;
    else if (rec.ambiguous) {
      // Fail-closed: más de un HOTO activo para el mismo avión es una inconsistencia real de datos.
      signals.hoto = { error: `${rec.matches.length} HOTO activos para ${vjState?.aircraft} — revisar en Supabase` };
    } else {
      const items = await hotoSvc.loadItems(rec.id);
      const care = Array.isArray(rec.cabin_care) ? rec.cabin_care : [];
      const careKnown = care.filter((x) => (typeof x === 'string' ? x : x?.d)).length;
      const shop = rec.shopping || {};
      const mags = Array.isArray(shop.magazines_list) ? shop.magazines_list : [];
      const curMonth = now.toISOString().slice(0, 7);
      const duties = rec.daily_duties && typeof rec.daily_duties === 'object' ? rec.daily_duties : {};
      signals.hoto = {
        id: rec.id,
        tail: rec.tail_number || null,
        aircraftStatus: rec.aircraft_status || null,   // se conserva como dato, pero NO puntúa (es del avión)
        daysOnAircraft: rec.days_on_aircraft || null,
        receivedDate: rec.received_date || null,
        chCode: rec.ch_code || null,
        icao: rec.icao || null,
        deliveryDate: rec.delivery_date || null,
        hasPriorHoto: !!rec.has_prior_hoto,
        defects: items.filter((i) => i.section === 'defect').length,
        comments: items.filter((i) => i.section === 'comment').length,
        offload: items.filter((i) => i.section === 'offload').length,
        careKnown, careTotal: 17,
        dutiesDone: Object.values(duties).filter(Boolean).length,
        dutiesTotal: DUTIES_TOTAL,
        shoppingFilled: SHOP_KEYS.filter((k) => shop[k] != null && shop[k] !== '').length,
        shoppingTotal: SHOP_KEYS.length,
        shoppingZero: SHOP_KEYS.filter((k) => SHOPPING_LABELS[k] && String(shop[k] ?? '').trim() === '0').map((k) => SHOPPING_LABELS[k]),
        magazines: {
          total: mags.length,
          upToDate: mags.filter((m) => m.status === 'up_to_date').length,
          pending: mags.filter((m) => m.status !== 'up_to_date').length,
          stale: mags.filter((m) => m.status === 'up_to_date' && m.confirmed && m.confirmed < curMonth).length,
        },
      };
    }
  } catch (e) { signals.hoto = { error: e.message }; }

  // Inventario (Supabase) — solo lectura, correlacionado con el avión actual (D13).
  try {
    const sess = await invSvc.loadLastSession(vjState?.aircraft);
    if (!sess) signals.inventory = null;
    else {
      const items = await invSvc.loadSessionItems(sess.id);
      const stats = invSvc.getSessionStats(items);
      const opened = sess.created_at ? new Date(sess.created_at).getTime() : null;
      const isEst = (i) => String(i.notes || '').startsWith('estimado');
      signals.inventory = {
        status: sess.status,                       // open | closed
        date: sess.session_date || sess.created_at,
        closedAt: sess.closed_at || null,
        aircraft: sess.aircraft_registration || null,
        ...stats,                                   // total, verified, pending, discrepancies
        // Contado de verdad vs estimado (D70): "estimado" = puesto al estándar sin contar o dicho "aprox".
        estimated: items.filter(isEst).length,
        // Ítems que ella realmente actualizó desde que abrió la sesión (no el Excel tal cual).
        touched: opened == null ? 0 : items.filter((i) => i.updated_at && new Date(i.updated_at).getTime() - opened > 60 * 1000).length,
        // Por debajo del estándar = lo que hay que reponer (uplift). Informativo: no es un fallo suyo.
        restock: items.filter((i) => i.std_qty != null && (i.current_qty ?? 0) < i.std_qty).length,
      };
    }
  } catch (e) { signals.inventory = { error: e.message }; }

  // Laundry & Cleaning Form (Supabase) — correlacionado con el avión actual (D15).
  try {
    const rec = llcSvc ? await llcSvc.loadActiveLaundryCleaning(vjState?.aircraft) : null;
    if (!rec) signals.laundry = null;
    else if (rec.ambiguous) {
      signals.laundry = { error: `${rec.matches.length} formularios activos para ${vjState?.aircraft} — revisar en Supabase` };
    } else {
      const filled = Object.values(rec.items || {}).filter((e) =>
        e && ((e.given != null && e.given !== '') || (e.received != null && e.received !== '') || e.note),
      ).length;
      signals.laundry = { id: rec.id, lastDate: rec.updated_at || rec.created_at, pieces: filled };
    }
  } catch (e) { signals.laundry = { error: e.message }; }

  // Tareas del área VJ: eLearnings, facturas y los feedbacks pendientes (avión: 1-2 días; vuelo: 24 h).
  const pend = (vjTasks || []).filter((t) => t.status !== 'done');
  const bucket = (re) => {
    const list = pend.filter((t) => re.test(t.title || ''));
    const overdue = list.filter((t) => t.due_date && new Date(t.due_date) < now).length;
    const next = list.filter((t) => t.due_date).sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];
    return { pending: list.length, overdue, nextDue: next?.due_date || null };
  };
  signals.elearnings = bucket(/elearning|e.?learning/i);
  signals.facturas = bucket(/factura/i);
  signals.feedbackFlight = bucket(/feedback.*vuelo/i).pending;
  // La tarea combinada "feedback de vuelos + feedback HOTO" cuenta como feedback de VUELO, no del avión.
  signals.feedbackAircraft = pend.filter((t) => /feedback.*(hoto|avi[oó]n)/i.test(t.title || '') && !/vuelo/i.test(t.title || '')).length;

  // Fase de la rotación (solo informativa: la evaluación es siempre "como si entregaras ahora").
  const dd = signals.hoto?.deliveryDate;
  signals.daysToDelivery = dd ? Math.ceil((new Date(dd) - now) / 864e5) : null;

  return signals;
}

// ── Evaluador puro ────────────────────────────────────────────────────────────
export function assess(s) {
  const strengths = [], warnings = [], blockers = [], missing = [];
  const modules = [];
  const mod = (name, lines) => { if (lines.length) modules.push({ name, lines }); };
  const L = (level, text) => ({ level, text }); // ok | warn | block | missing

  // Sin avión asignado no se evalúa una entrega: se dice. Evaluar "el último HOTO que haya" sería justo la
  // fuga de D14/D15.
  if (s.noAircraft) {
    return {
      readiness: 'unknown',
      confidence: 'low',
      phase: 'sin avión asignado',
      strengths: [], warnings: [], blockers: [],
      missingEvidence: ['No hay avión operativo asignado ahora mismo'],
      recommendation: 'No hay ningún avión asignado, así que no hay entrega que evaluar. Cuando empieces rotación, dímelo y evalúo el avión nuevo — nunca el anterior.',
      modules: [],
    };
  }

  // Se evalúa siempre como si entregara ahora: la pregunta es "¿qué confianza me da entregarlo así?".
  const phase = s.daysToDelivery == null
    ? 'evaluado como si entregaras ahora'
    : s.daysToDelivery < 0 ? 'entrega vencida'
    : s.daysToDelivery === 0 ? 'entrega HOY'
    : s.daysToDelivery === 1 ? 'entrega mañana'
    : `entrega en ${s.daysToDelivery} días`;

  const h = s.hoto, i = s.inventory, l = s.laundry;
  const hOk = !!(h && !h.error), iOk = !!(i && !i.error);
  // Con HOTO e inventario reales hay evidencia para juzgar; sin ellos solo se puede decir qué falta.
  const hasCore = hOk && iOk;
  const plural = (n, one, many) => (n === 1 ? one : many);

  // ── 1. Inventario ──
  {
    const lines = [];
    if (!i) { missing.push('Inventario: sin ninguna sesión registrada'); lines.push(L('missing', 'Sin sesiones registradas')); }
    else if (i.error) { missing.push('Inventario: no se pudo leer (' + i.error + ')'); lines.push(L('missing', 'No se pudo leer el módulo')); }
    else if (i.status === 'closed') {
      strengths.push(`Inventario cerrado (${String(i.date).slice(0, 10)})`);
      lines.push(L('ok', 'Sesión cerrada'));
      if (i.estimated > 0) { warnings.push(`${i.estimated} ítems del inventario son estimados, no contados de verdad`); lines.push(L('warn', `${i.estimated} estimados (no contados)`)); }
    } else {
      if (i.touched === 0) {
        blockers.push('El inventario está sin actualizar: no has tocado ningún ítem desde que abriste la sesión');
        lines.push(L('block', 'Sin actualizar: ningún ítem tocado'));
      } else {
        strengths.push(`Inventario actualizado (${i.touched} ítems tocados)`);
        lines.push(L('ok', `${i.touched} ítems actualizados desde que abriste la sesión`));
      }
      if (i.estimated > 0) {
        warnings.push(`${i.estimated} ${plural(i.estimated, 'ítem estimado', 'ítems estimados')} sin contar de verdad`);
        lines.push(L('warn', `${i.estimated} ${plural(i.estimated, 'estimado', 'estimados')}, sin contar de verdad`));
      }
      lines.push(L('warn', 'Sesión abierta: ciérrala al entregar el avión'));
    }
    // Informativo, no puntúa: lo que hay que reponer sale en el uplift.
    if (iOk && i.restock > 0) lines.push(L('ok', `${i.restock} ítems por debajo del estándar (saldrán en el UPLIFT)`));
    mod('Inventario', lines);
  }

  // ── 2. Laundry & Cleaning Form ──
  {
    const lines = [];
    if (!l) {
      const t = 'Laundry & Cleaning Form: no hay ninguno abierto para este avión';
      if (hasCore) { blockers.push(t); lines.push(L('block', 'Sin formulario abierto el día de la entrega')); }
      else { missing.push(t); lines.push(L('missing', 'Sin formulario activo')); }
    } else if (l.error) { missing.push('Laundry: no se pudo leer (' + l.error + ')'); lines.push(L('missing', 'No se pudo leer el módulo')); }
    else if (l.pieces === 0) {
      blockers.push('El Laundry & Cleaning Form está vacío');
      lines.push(L('block', 'Formulario vacío'));
    } else {
      const days = Math.floor((s.now - new Date(l.lastDate)) / 864e5);
      if (days <= 1) { strengths.push(`Laundry Form rellenado (${l.pieces} filas)`); lines.push(L('ok', `${l.pieces} filas · ${days === 0 ? 'actualizado hoy' : 'actualizado ayer'}`)); }
      else { warnings.push(`El Laundry Form no se actualiza desde hace ${days} días`); lines.push(L('warn', `Última actualización hace ${days} días`)); }
      missing.push('Laundry Form: no sé si ya lo exportaste y firmaste');
      lines.push(L('missing', 'Recuerda exportarlo y firmarlo (no puedo verlo desde aquí)'));
    }
    mod('Laundry Form', lines);
  }

  // ── 3. Limpieza (tareas diarias del HOTO) y cabecera del HOTO ──
  {
    const lines = [];
    if (!h) {
      missing.push('No existe HOTO activo'); lines.push(L('missing', 'No existe HOTO activo'));
    } else if (h.error) {
      missing.push('HOTO: no se pudo leer (' + h.error + ')'); lines.push(L('missing', 'No se pudo leer el módulo'));
    } else {
      const total = h.dutiesTotal || 0, done = h.dutiesDone || 0;
      if (total > 0) {
        if (done === 0) {
          blockers.push(`Ninguna de las ${total} tareas diarias de limpieza está marcada en el HOTO`);
          lines.push(L('block', `Limpieza: 0/${total} tareas marcadas`));
        } else if (done / total < 0.7) {
          // Umbral a propósito por debajo del 100 %: algunas de las 47 no aplican a todos los aviones
          // (p. ej. las Jet Bed Pumps son del Global 7500) y ella las deja sin marcar.
          warnings.push(`Te faltan ${total - done} de ${total} tareas diarias de limpieza por marcar en el HOTO`);
          lines.push(L('warn', `Limpieza: ${done}/${total} marcadas`));
        } else {
          strengths.push(`Limpieza marcada en el HOTO (${done}/${total})`);
          lines.push(L('ok', `Limpieza: ${done}/${total} marcadas`));
        }
      }
      const falta = [];
      if (!h.chCode) falta.push('código CH');
      if (!h.receivedDate) falta.push('fecha de recepción');
      if (!h.daysOnAircraft) falta.push('días a bordo');
      if (!h.icao) falta.push('aeropuerto (ICAO)');
      if (falta.length) { warnings.push(`Falta en la cabecera del HOTO: ${falta.join(', ')}`); lines.push(L('warn', `Cabecera incompleta: ${falta.join(', ')}`)); }
      else lines.push(L('ok', 'Cabecera del HOTO completa'));
      // Las fechas de Cabin Care a veces no se saben: se dice, pero no baja la confianza.
      if (h.careKnown < 12) lines.push(L('missing', `Cabin Care ${h.careKnown}/17 fechas (las que no sepas puedes dejarlas vacías)`));
      else lines.push(L('ok', `Cabin Care ${h.careKnown}/17 fechas`));
    }
    mod('Limpieza y HOTO', lines);
  }

  // ── 4. Documentos y feedbacks ──
  {
    const lines = [];
    if (s.feedbackFlight > 0) { warnings.push('Tienes pendiente el feedback del vuelo (máximo 24 h después del vuelo)'); lines.push(L('warn', 'Feedback del vuelo pendiente (máx. 24 h)')); }
    if (s.feedbackAircraft > 0) { warnings.push('Tienes pendiente el feedback del avión (1-2 días desde que lo recibes)'); lines.push(L('warn', 'Feedback del avión pendiente (1-2 días)')); }
    if (!s.feedbackFlight && !s.feedbackAircraft) lines.push(L('ok', 'Sin feedbacks pendientes'));
    // No hay forma de saber si el correo salió: se recuerda y se dice que no se sabe.
    missing.push('Correo del handover: no sé si ya lo enviaste');
    lines.push(L('missing', 'Correo del handover: envía Excel + PDF del HOTO + Laundry Form (no puedo comprobar si salió)'));
    mod('Documentos y feedback', lines);
  }

  // ── Por comprar (informativo: NO baja la confianza) ──
  {
    const lines = [];
    if (hOk) {
      if (h.shoppingZero.length) lines.push(L('warn', `Por comprar: ${h.shoppingZero.join(', ')}`));
      const m = h.magazines;
      if (m.total > 0 && m.pending > 0) lines.push(L('warn', `${m.pending} ${plural(m.pending, 'revista', 'revistas')} por renovar o comprar`));
      if (m.total === 0) lines.push(L('missing', 'Sin revistas registradas en el HOTO'));
      if (!lines.length) lines.push(L('ok', 'Nada por comprar'));
    }
    mod('Por comprar', lines);
  }

  // ── Administrativo ──
  {
    const lines = [];
    const admin = (label, b) => {
      if (b.overdue > 0) { warnings.push(`${label}: ${b.overdue} vencida${b.overdue > 1 ? 's' : ''}`); lines.push(L('warn', `${label}: ${b.overdue} vencidas`)); }
      else if (b.pending > 0) lines.push(L('warn', `${label}: ${b.pending} pendientes`));
      else lines.push(L('ok', `${label}: al día`));
    };
    admin('eLearnings', s.elearnings); admin('Facturas', s.facturas);
    if (s.elearnings.pending === 0 && s.facturas.pending === 0) strengths.push('eLearnings y facturas al día');
    mod('Administrativo', lines);
  }

  // ── Veredicto ───────────────────────────────────────────────────────────
  let readiness = blockers.length ? 'not_ready' : warnings.length ? 'almost_ready' : 'ready';
  if (readiness === 'ready' && !hasCore) readiness = 'almost_ready'; // sin evidencia no hay "ready"

  // Confianza en la EVALUACIÓN (cuánta evidencia real hay), no en el avión.
  let confidence = 'high';
  const coreMissing = (!h ? 1 : 0) + (!i ? 1 : 0);
  const invUnverified = iOk && i.status === 'open' && i.touched === 0;
  if (coreMissing >= 2 || (h && h.error) || (i && i.error)) confidence = 'low';
  else if (coreMissing === 1 || invUnverified || missing.length >= 4) confidence = 'medium';
  if (blockers.length && confidence === 'high') confidence = 'medium';

  // ── Recomendación (compuesta solo desde la evidencia de arriba; cada punto es algo que ella puede HACER) ──
  const list = (arr, n) => arr.slice(0, n).join('; ');
  let recommendation;
  if (readiness === 'not_ready') {
    recommendation = `Todavía no entregaría el avión: ${list(blockers, 2)}.` + (warnings.length ? ` Después, ${list(warnings, 1)}.` : '');
  } else if (readiness === 'almost_ready' && warnings.length === 0) {
    // Degradado solo por falta de evidencia: no fingir que está "casi listo".
    recommendation = `No tengo evidencia suficiente para evaluar la entrega: ${list(missing, 3)}. Registra datos en los módulos y vuelve a preguntarme.`;
  } else if (readiness === 'almost_ready') {
    recommendation = `El avión está prácticamente listo. Antes de entregar te falta: ${list(warnings, 3)}.` + (strengths.length ? ` Lo demás me da confianza (${list(strengths, 2)}).` : '');
  } else {
    recommendation = `Entregaría con tranquilidad: ${list(strengths, 3)}.` + (missing.length ? ` Solo un recordatorio: ${list(missing, 1)}.` : '');
  }

  return { readiness, confidence, phase, strengths, warnings, blockers, missingEvidence: missing, recommendation, modules };
}
