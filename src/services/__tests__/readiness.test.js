// readiness.test.js — invariante: "operational data is current iff belongs
// to vj_state.aircraft" (D15). Reproduce exactamente el bug real del
// 2026-08-06: vj_state.aircraft ya es D-AFBS, pero HOTO/Inventario/Laundry
// de 9H-VCQ seguían filtrándose al contexto operacional de D-AFBS a través
// de collectSignals() — no por culpa de la correlación por matrícula en sí
// (esa parte ya funcionaba, D13/D14), sino porque algunos de estos fakes
// reproducen aquí el contrato REAL de los servicios (con/sin tailNumber)
// para que un test que pase aquí signifique algo sobre el código real, no
// solo sobre un mock que ya asume la respuesta correcta.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { collectSignals, assess } from '../readiness.js';
import { getSessionStats } from '../inventory.js';

// ── Fakes que imitan el contrato real (D13/D14/D15/D34): SIN tailNumber
// devuelven null (D34 — sin avión actual no hay dato actual); con tailNumber
// correlacionan de verdad por matrícula. Mismo contrato que
// hoto.js/inventory.js/laundryCleaning.js reales: si estos fakes se
// adelantaran al código real, un test verde aquí no significaría nada.
function makeFakeServices({ hotoRows = [], invSessions = [], llcRows = [] }) {
  const byRecency = (a, b) => (a.created_at < b.created_at ? 1 : -1);

  const hotoSvc = {
    loadActiveHoto: async (tail) => {
      const active = hotoRows.filter((r) => r.status === 'active');
      if (!tail) return null;   // D34
      const matches = active.filter((r) => r.tail_number === tail);
      if (matches.length === 0) return null;
      if (matches.length > 1) return { ambiguous: true, matches };
      return matches[0];
    },
    loadItems: async () => [],
  };

  const invSvc = {
    loadLastSession: async (tail) => {
      if (!tail) return null;   // D34
      const rows = invSessions.filter((r) => r.aircraft_registration === tail);
      return [...rows].sort(byRecency)[0] || null;
    },
    loadSessionItems: async (sessionId) => invSessions.find((s) => s.id === sessionId)?.items || [],
    getSessionStats,
  };

  const llcSvc = {
    loadActiveLaundryCleaning: async (tail) => {
      const active = llcRows.filter((r) => r.status === 'active');
      if (!tail) return null;   // D34
      const matches = active.filter((r) => r.tail_number === tail);
      if (matches.length === 0) return null;
      if (matches.length > 1) return { ambiguous: true, matches };
      return matches[0];
    },
  };

  return { hotoSvc, invSvc, llcSvc };
}

// 349 items de inventario: 134 verificados, 61 con discrepancia — mismos
// números exactos que la usuaria vio filtrarse en producción.
function makeVcqInventoryItems() {
  return Array.from({ length: 349 }, (_, i) => ({
    id: `item-${i}`,
    verified: i < 134,
    discrepancy: i < 61,
  }));
}

function daysAgoISO(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString();
}

describe('Bug real D15 — datos históricos de 9H-VCQ no deben alimentar el contexto de D-AFBS', () => {
  const vjState = { aircraft: 'D-AFBS', status: 'rotacion' };

  const hotoRows = [
    // Histórico real: cerrado, 12/47 tareas del checklist marcadas en su día
    // (el checklist en sí vive en daily_duties, pero lo relevante aquí es que
    // el registro NUNCA debe volver como el HOTO "actual" de D-AFBS).
    { id: 'hoto-vcq', tail_number: '9H-VCQ', status: 'delivered', created_at: '2026-07-07', has_prior_hoto: true },
  ];
  const invSessions = [
    { id: 'inv-vcq', aircraft_registration: '9H-VCQ', status: 'open', session_date: '2026-07-07', created_at: '2026-07-06T23:11:33Z', items: makeVcqInventoryItems() },
  ];
  const llcRows = [
    { id: 'llc-vcq', tail_number: '9H-VCQ', status: 'active', created_at: daysAgoISO(35), updated_at: daysAgoISO(30), items: { towels: { given: '4' } } },
  ];

  test('collectSignals: HOTO/Inventario/Laundry de D-AFBS son null — nada de 9H-VCQ se cuela', async () => {
    const services = makeFakeServices({ hotoRows, invSessions, llcRows });
    const signals = await collectSignals({ ...services, vjTasks: [], vjState });

    assert.equal(signals.hoto, null);
    assert.equal(signals.inventory, null);
    assert.equal(signals.laundry, null);
  });

  test('assess: readiness no dice "Casi listo" ni "Bajo control" basándose en el histórico — pide evidencia de D-AFBS', async () => {
    const services = makeFakeServices({ hotoRows, invSessions, llcRows });
    const signals = await collectSignals({ ...services, vjTasks: [], vjState });
    const R = assess(signals);

    // Sin evidencia core (ni HOTO ni inventario) → nunca "ready", confianza baja.
    assert.equal(R.readiness, 'almost_ready');
    assert.equal(R.confidence, 'low');

    const fullText = JSON.stringify(R);
    // Los números exactos del histórico de 9H-VCQ no pueden aparecer en NINGÚN
    // sitio del veredicto de D-AFBS.
    assert.ok(!fullText.includes('215'), 'no debe mencionar los 215 pendientes de 9H-VCQ');
    assert.ok(!fullText.includes('61'), 'no debe mencionar las 61 discrepancias de 9H-VCQ');
    assert.ok(!fullText.includes('349'), 'no debe mencionar el total de 9H-VCQ');
    assert.ok(!fullText.includes('12/47') && !fullText.includes('12 /47'), 'no debe mencionar el checklist HOTO de 9H-VCQ');
    assert.ok(!fullText.includes('9H-VCQ'), 'no debe mencionar la matrícula del avión anterior como si fuera la actual');

    // La recomendación debe expresar falta de evidencia, no inventar un "casi listo".
    assert.match(R.recommendation, /no tengo evidencia suficiente/i);
    assert.ok(R.missingEvidence.some((m) => /HOTO/.test(m)));
    assert.ok(R.missingEvidence.some((m) => /inventario|sesión/i.test(m)));
  });

  test('los registros de 9H-VCQ siguen intactos y consultables como histórico tras evaluar D-AFBS', async () => {
    const services = makeFakeServices({ hotoRows, invSessions, llcRows });
    await collectSignals({ ...services, vjTasks: [], vjState });

    // collectSignals/assess son de solo lectura — nada se mutó ni se borró.
    assert.equal(hotoRows.length, 1);
    assert.equal(hotoRows[0].status, 'delivered');
    assert.equal(invSessions.length, 1);
    assert.equal(invSessions[0].items.length, 349);
    assert.equal(llcRows.length, 1);

    // Y siguen siendo consultables explícitamente por su propia matrícula.
    const status = await services.hotoSvc.loadActiveHoto('9H-VCQ'); // consulta explícita al histórico, por su matrícula
    // 'delivered' no es 'active', así que ni siquiera el histórico "más reciente" lo devuelve — comportamiento correcto, no se inventa un active.
    assert.equal(status, null);
    const invForVcq = await services.invSvc.loadLastSession('9H-VCQ');
    assert.equal(invForVcq.id, 'inv-vcq');
    assert.equal(invForVcq.items.length, 349);
  });

  test('en cuanto existe información real de D-AFBS, empieza a alimentar signals/readiness — y el histórico de 9H-VCQ sigue sin mezclarse', async () => {
    const hotoRowsWithDafbs = [
      ...hotoRows,
      { id: 'hoto-dafbs', tail_number: 'D-AFBS', status: 'active', created_at: '2026-08-07', has_prior_hoto: false },
    ];
    const invSessionsWithDafbs = [
      ...invSessions,
      { id: 'inv-dafbs', aircraft_registration: 'D-AFBS', status: 'open', session_date: '2026-08-07', created_at: '2026-08-07T09:00:00Z', items: [{ id: 'x1', verified: true, discrepancy: false }] },
    ];
    const services = makeFakeServices({ hotoRows: hotoRowsWithDafbs, invSessions: invSessionsWithDafbs, llcRows });
    const signals = await collectSignals({ ...services, vjTasks: [], vjState });

    assert.equal(signals.hoto.tail, 'D-AFBS');
    assert.equal(signals.inventory.aircraft, 'D-AFBS');
    assert.equal(signals.inventory.total, 1); // el propio de D-AFBS, no los 349 de 9H-VCQ
    assert.equal(signals.laundry, null); // sigue sin haber LLC propio de D-AFBS

    // El histórico de 9H-VCQ, intacto y sin mezclarse en las cifras de arriba.
    assert.equal(hotoRowsWithDafbs.find((r) => r.tail_number === '9H-VCQ').status, 'delivered');
    assert.equal(invSessionsWithDafbs.find((s) => s.aircraft_registration === '9H-VCQ').items.length, 349);
  });
});

// ── D34 — la puerta que quedaba abierta: `vj_state.aircraft` vacío ──────────
//
// D14/D15 corrigieron la correlación cuando HAY avión actual. Pero en cuanto
// Estefanía entrega el avión (`status: libre` → `aircraft: null`), los cuatro
// loaders recibían `undefined` y cada uno caía en su fallback histórico ("el
// más reciente de cualquier avión"). Resultado: exactamente el síntoma de D15
// — el HOTO y el inventario del avión ANTERIOR presentados como los de ahora —
// resucitado por la vía más normal del mundo, terminar una rotación.
describe('D34 — sin avión asignado no se evalúa el avión anterior', () => {
  const hotoRows = [
    { id: 'hoto-vcq', tail_number: '9H-VCQ', status: 'active', created_at: '2026-07-10', has_prior_hoto: true, aircraft_status: 'Good' },
  ];
  const invSessions = [
    { id: 'inv-vcq', aircraft_registration: '9H-VCQ', status: 'open', created_at: '2026-07-10', session_date: '2026-07-10', items: makeVcqInventoryItems() },
  ];
  const llcRows = [
    { id: 'llc-vcq', tail_number: '9H-VCQ', status: 'active', created_at: '2026-07-10', updated_at: daysAgoISO(30), items: {} },
  ];
  // El estado real justo después de "ya entregué el avión".
  const vjStateLibre = { status: 'libre', aircraft: null };

  test('collectSignals no trae NADA de 9H-VCQ cuando no hay avión actual', async () => {
    const services = makeFakeServices({ hotoRows, invSessions, llcRows });
    const s = await collectSignals({ ...services, vjTasks: [], vjState: vjStateLibre });

    assert.equal(s.noAircraft, true);
    assert.equal(s.aircraft, null);
    assert.equal(s.hoto, null, 'el HOTO activo de 9H-VCQ no puede aparecer sin avión actual');
    assert.equal(s.inventory, null, 'los 349 items de 9H-VCQ no pueden aparecer sin avión actual');
    assert.equal(s.laundry, null, 'el formulario de 9H-VCQ no puede aparecer sin avión actual');
  });

  test('assess lo dice ("sin avión asignado"), no finge falta de evidencia ni evalúa una entrega', () => {
    const r = assess({ now: new Date(), noAircraft: true, aircraft: null, rotationStatus: 'libre' });
    assert.equal(r.readiness, 'unknown');
    assert.equal(r.phase, 'sin avión asignado');
    assert.deepEqual(r.warnings, []);
    assert.deepEqual(r.blockers, []);
    // Y sobre todo: ni una cifra del avión anterior en el texto visible.
    assert.ok(!/9H-VCQ|349|61|215/.test(r.recommendation), 'la recomendación no puede citar datos del avión anterior');
  });

  test('el histórico de 9H-VCQ sigue intacto y consultable por su matrícula', async () => {
    const services = makeFakeServices({ hotoRows, invSessions, llcRows });
    await collectSignals({ ...services, vjTasks: [], vjState: vjStateLibre });
    const hoto = await services.hotoSvc.loadActiveHoto('9H-VCQ');
    assert.equal(hoto.id, 'hoto-vcq');
    const inv = await services.invSvc.loadLastSession('9H-VCQ');
    assert.equal(inv.items.length, 349);
  });
});
