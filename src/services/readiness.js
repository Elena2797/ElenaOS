// readiness.js — Aircraft Readiness: evaluación de entrega basada SOLO en datos reales.
//
// Contrato:
//   collectSignals(...)  → junta el estado real de cada módulo (Supabase + localStorage).
//   assess(signals)      → función PURA: señales → objeto readiness. Sin UI, sin fetch.
//
// Reglas de honestidad (fijadas por producto):
//   - Nunca inventar información ni asumir que algo está bien sin evidencia.
//   - Si un módulo no tiene datos, decirlo explícitamente (missingEvidence).
//   - Un problema real (estado Bad, discrepancias) pesa más que una tarea menor.
//   - Inventario sin verificar/confirmar reduce la confianza.
//   - Sin HOTO previo no se esperan fechas históricas (no es un fallo de la CH actual).

// ── Colector: lee el estado real de los módulos ──────────────────────────────
export async function collectSignals({ hotoSvc, invSvc, vjTasks, vjState, now = new Date() }) {
  const signals = { now, rotationStatus: vjState?.status || null };

  // HOTO (Supabase)
  try {
    const rec = await hotoSvc.loadActiveHoto();
    if (!rec) signals.hoto = null;
    else {
      const items = await hotoSvc.loadItems(rec.id);
      const care = Array.isArray(rec.cabin_care) ? rec.cabin_care : [];
      const careKnown = care.filter(x => (typeof x === 'string' ? x : x?.d)).length;
      const shop = rec.shopping || {};
      const mags = Array.isArray(shop.magazines_list) ? shop.magazines_list : [];
      const curMonth = now.toISOString().slice(0, 7);
      const SHOP_KEYS = ['lemons','limes','celery','green_olives','oranges','cucumber','milk_full','milk_skimmed','oat_milk','almond_milk','evian','volvic','herbs'];
      signals.hoto = {
        id: rec.id,
        tail: rec.tail_number || null,
        aircraftStatus: rec.aircraft_status || null,
        daysOnAircraft: rec.days_on_aircraft || null,
        receivedDate: rec.received_date || null,
        deliveryDate: rec.delivery_date || null,
        hasPriorHoto: !!rec.has_prior_hoto,
        defects: items.filter(i => i.section === 'defect').length,
        comments: items.filter(i => i.section === 'comment').length,
        offload: items.filter(i => i.section === 'offload').length,
        careKnown, careTotal: 17,
        shoppingFilled: SHOP_KEYS.filter(k => shop[k] != null && shop[k] !== '').length,
        shoppingTotal: SHOP_KEYS.length,
        magazines: {
          total: mags.length,
          upToDate: mags.filter(m => m.status === 'up_to_date').length,
          pending: mags.filter(m => m.status !== 'up_to_date').length,
          stale: mags.filter(m => m.status === 'up_to_date' && m.confirmed && m.confirmed < curMonth).length,
        },
      };
    }
  } catch (e) { signals.hoto = { error: e.message }; }

  // Inventario (Supabase) — solo lectura
  try {
    const sess = await invSvc.loadLastSession();
    if (!sess) signals.inventory = null;
    else {
      const items = await invSvc.loadSessionItems(sess.id);
      const stats = invSvc.getSessionStats(items);
      signals.inventory = {
        status: sess.status,                       // open | closed
        date: sess.session_date || sess.created_at,
        closedAt: sess.closed_at || null,
        aircraft: sess.aircraft_registration || null,
        ...stats,                                   // total, verified, pending, discrepancies
      };
    }
  } catch (e) { signals.inventory = { error: e.message }; }

  // Laundry (localStorage — registro de este dispositivo)
  const lDate = localStorage.getItem('vj_laundry_date');
  const lItems = JSON.parse(localStorage.getItem('vj_laundry_items') || '{}');
  signals.laundry = lDate
    ? { lastDate: lDate, pieces: Object.values(lItems).reduce((a, b) => a + (b || 0), 0) }
    : null;

  // eLearnings / Facturas (tareas del área VJ, Supabase)
  const pend = (vjTasks || []).filter(t => t.status !== 'done');
  const bucket = (re) => {
    const list = pend.filter(t => re.test(t.title || ''));
    const overdue = list.filter(t => t.due_date && new Date(t.due_date) < now).length;
    const next = list.filter(t => t.due_date).sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];
    return { pending: list.length, overdue, nextDue: next?.due_date || null };
  };
  signals.elearnings = bucket(/elearning|e.?learning/i);
  signals.facturas = bucket(/factura/i);

  // Fase de la rotación
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

  const deliveryPhase = s.daysToDelivery != null && s.daysToDelivery <= 2;
  const phase =
    s.daysToDelivery == null ? (s.rotationStatus === 'rotacion' ? 'rotación (sin fecha de entrega)' : 'sin rotación activa')
    : s.daysToDelivery < 0 ? 'entrega vencida'
    : s.daysToDelivery === 0 ? 'entrega HOY'
    : s.daysToDelivery === 1 ? 'entrega mañana'
    : `entrega en ${s.daysToDelivery} días`;

  // ── HOTO ──
  const h = s.hoto;
  {
    const lines = [];
    if (!h) {
      const t = 'No existe HOTO activo';
      if (deliveryPhase) { blockers.push(t + ' y la entrega es inminente'); lines.push(L('block', t)); }
      else { missing.push(t); lines.push(L('missing', t)); }
    } else if (h.error) {
      missing.push('HOTO: no se pudo leer (' + h.error + ')');
      lines.push(L('missing', 'No se pudo leer el módulo'));
    } else {
      if (h.defects > 0) { strengths.push(`${h.defects} defects documentados`); lines.push(L('ok', `${h.defects} defects documentados`)); }
      else { missing.push('Ningún defect registrado — confirma que realmente no hay ninguno a bordo'); lines.push(L('missing', 'Sin defects registrados: ¿seguro que no hay ninguno?')); }

      if (!h.daysOnAircraft) { warnings.push('Falta Days on Aircraft en el HOTO'); lines.push(L('warn', 'Falta Days on Aircraft')); }
      if (!h.receivedDate) { warnings.push('Falta la fecha de recepción del avión'); lines.push(L('warn', 'Falta fecha de recepción')); }

      if (h.careKnown >= 12) { strengths.push(`Cabin Care con ${h.careKnown}/17 fechas`); lines.push(L('ok', `Cabin Care ${h.careKnown}/17`)); }
      else if (h.hasPriorHoto) { warnings.push(`Cabin Care incompleto (${h.careKnown}/17) pese a haber HOTO previo`); lines.push(L('warn', `Cabin Care ${h.careKnown}/17`)); }
      else { lines.push(L('missing', `Cabin Care ${h.careKnown}/17 — sin HOTO previo, las fechas históricas no existen (no es un fallo)`)); }

      if (h.comments > 0) lines.push(L('ok', `${h.comments} comentarios para la siguiente CH`));
      if (h.offload > 0) lines.push(L('ok', `${h.offload} items para offload`));
      if (!h.deliveryDate) { missing.push('Sin fecha de entrega — no puedo calibrar la fase de la rotación'); lines.push(L('missing', 'Sin fecha de entrega definida')); }
    }
    mod('HOTO', lines);
  }

  // ── Estado del avión ──
  {
    const lines = [];
    if (h && !h.error) {
      if (h.aircraftStatus === 'Bad') { blockers.push('El estado del avión está marcado como Bad'); lines.push(L('block', 'Estado: Bad')); }
      else if (h.aircraftStatus === 'Requires Attention') { warnings.push('El avión está marcado como Requires Attention'); lines.push(L('warn', 'Estado: Requires Attention')); }
      else if (h.aircraftStatus) { strengths.push(`Estado del avión: ${h.aircraftStatus}`); lines.push(L('ok', `Estado: ${h.aircraftStatus}`)); }
      else { missing.push('Estado del avión sin declarar en el HOTO'); lines.push(L('missing', 'Estado sin declarar')); }
    }
    mod('Estado del avión', lines);
  }

  // ── Inventario ──
  {
    const i = s.inventory; const lines = [];
    if (!i) { missing.push('Inventario: sin ninguna sesión registrada'); lines.push(L('missing', 'Sin sesiones registradas')); }
    else if (i.error) { missing.push('Inventario: no se pudo leer (' + i.error + ')'); lines.push(L('missing', 'No se pudo leer el módulo')); }
    else if (i.status === 'closed') {
      strengths.push(`Última sesión de inventario completada (${String(i.date).slice(0, 10)})`);
      lines.push(L('ok', `Sesión completada · ${i.verified}/${i.total} verificados`));
      if (i.discrepancies > 0) { warnings.push(`${i.discrepancies} discrepancias en el último inventario`); lines.push(L('warn', `${i.discrepancies} discrepancias registradas`)); }
    } else {
      // sesión abierta = trabajo a medias: evidencia parcial
      lines.push(L('warn', `Sesión abierta · ${i.verified}/${i.total} verificados`));
      if (i.pending > 0) warnings.push(`Inventario abierto con ${i.pending} items sin verificar`);
      else warnings.push('Sesión de inventario abierta sin cerrar');
      if (i.discrepancies > 0) { warnings.push(`${i.discrepancies} discrepancias abiertas en inventario`); lines.push(L('warn', `${i.discrepancies} discrepancias abiertas`)); }
    }
    mod('Inventario', lines);
  }

  // ── Fresh / Shopping + Magazines ──
  {
    const lines = [];
    if (h && !h.error) {
      if (h.shoppingFilled === 0) { (deliveryPhase ? warnings : missing).push('Aircraft Shopping sin repasar (0 items)'); lines.push(L(deliveryPhase ? 'warn' : 'missing', 'Shopping sin repasar')); }
      else if (h.shoppingFilled < h.shoppingTotal) lines.push(L('warn', `Shopping ${h.shoppingFilled}/${h.shoppingTotal} repasado`));
      else { strengths.push('Aircraft Shopping repasado completo'); lines.push(L('ok', `Shopping ${h.shoppingFilled}/${h.shoppingTotal}`)); }

      const m = h.magazines;
      if (m.total === 0) { missing.push('Magazines: sin revistas registradas'); lines.push(L('missing', 'Sin revistas registradas')); }
      else {
        if (m.pending > 0) { warnings.push(`${m.pending} revista${m.pending > 1 ? 's' : ''} pendiente${m.pending > 1 ? 's' : ''} (needs renewal / missing)`); lines.push(L('warn', `${m.pending} revistas pendientes`)); }
        if (m.stale > 0) { warnings.push(`${m.stale} revista${m.stale > 1 ? 's' : ''} confirmada${m.stale > 1 ? 's' : ''} el mes pasado — revisar edición`); lines.push(L('warn', `${m.stale} por reconfirmar (cambió el mes)`)); }
        if (m.pending === 0 && m.stale === 0) { strengths.push(`Magazines al día (${m.upToDate}/${m.total})`); lines.push(L('ok', `${m.upToDate}/${m.total} up to date`)); }
      }
    }
    mod('Fresh / Shopping', lines);
  }

  // ── Laundry ──
  {
    const lines = [];
    if (!s.laundry) { missing.push('Laundry: sin registros en este dispositivo'); lines.push(L('missing', 'Sin registros')); }
    else {
      const days = Math.floor((s.now - new Date(s.laundry.lastDate)) / 864e5);
      if (days <= 1) { strengths.push(`Laundry actualizado (${s.laundry.pieces} piezas)`); lines.push(L('ok', `Actualizado ${days === 0 ? 'hoy' : 'ayer'} · ${s.laundry.pieces} piezas`)); }
      else { lines.push(L(deliveryPhase ? 'warn' : 'missing', `Última actualización hace ${days} días`)); if (deliveryPhase) warnings.push(`Laundry sin actualizar desde hace ${days} días`); }
    }
    mod('Laundry', lines);
  }

  // ── eLearnings / Facturas ──
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

  // ── Veredicto ──────────────────────────────────────────────────────────────
  const coreEvidence = !!(h && !h.error) && !!(s.inventory && !s.inventory.error);
  let readiness = blockers.length ? 'not_ready' : warnings.length ? 'almost_ready' : 'ready';
  if (readiness === 'ready' && !coreEvidence) readiness = 'almost_ready'; // sin evidencia no hay "ready"

  let confidence = 'high';
  const coreMissing = (!h ? 1 : 0) + (!s.inventory ? 1 : 0);
  const invUnverified = s.inventory && !s.inventory.error && s.inventory.status === 'open' && s.inventory.pending > 0;
  if (coreMissing >= 2 || (h && h.error) || (s.inventory && s.inventory.error)) confidence = 'low';
  else if (coreMissing === 1 || invUnverified || missing.length >= 3) confidence = 'medium';
  if (blockers.length && confidence === 'high') confidence = 'medium';

  // ── Recomendación (compuesta solo desde la evidencia de arriba) ────────────
  const phasePrefix = s.daysToDelivery == null ? '' :
    s.daysToDelivery <= 0 ? 'La entrega es hoy. ' :
    s.daysToDelivery === 1 ? 'La entrega es mañana. ' :
    `Quedan ${s.daysToDelivery} días para la entrega. `;
  const list = (arr, n) => arr.slice(0, n).join('; ');
  let recommendation;
  if (readiness === 'not_ready') {
    recommendation = `${phasePrefix}Todavía no entregaría el avión: ${list(blockers, 2)}.` + (warnings.length ? ` Después, ${list(warnings, 1)}.` : '');
  } else if (readiness === 'almost_ready' && warnings.length === 0) {
    // Degradado solo por falta de evidencia: no fingir que está "casi listo".
    recommendation = `No tengo evidencia suficiente para evaluar la entrega: ${list(missing, 3)}. Registra datos en los módulos y vuelve a preguntarme.`;
  } else if (readiness === 'almost_ready') {
    recommendation = `${phasePrefix}El avión está prácticamente listo. Antes de entregar revisaría: ${list(warnings, 3)}.` + (strengths.length ? ` El resto me da confianza (${list(strengths, 2)}).` : '');
  } else {
    recommendation = `${phasePrefix}Entregaría con tranquilidad: ${list(strengths, 3)}.` + (missing.length ? ` Único matiz sin evidencia: ${list(missing, 1)}.` : '');
  }

  return { readiness, confidence, phase, strengths, warnings, blockers, missingEvidence: missing, recommendation, modules };
}
