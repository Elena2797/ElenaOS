// Rediseño del "Copiloto de entrega" (2026-09-25): confianza para entregar según lo que depende de ELLA.
// Sus 4 pilares: inventario actualizado, Laundry Form, limpieza (tareas diarias del HOTO), documentos/feedbacks.
// Los defectos del avión no puntúan.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { assess } from '../readiness.js';

const NOW = new Date('2026-09-25T20:00:00Z');
const hoto = (o = {}) => ({
  id: 'h1', tail: '9H-VCF', aircraftStatus: 'Good', daysOnAircraft: '4', receivedDate: '22/09/2026', chCode: 'OLE', icao: 'EGKB',
  deliveryDate: null, hasPriorHoto: true, defects: 0, comments: 4, offload: 1, careKnown: 12, careTotal: 17,
  dutiesDone: 40, dutiesTotal: 47, shoppingFilled: 13, shoppingTotal: 13, shoppingZero: [],
  magazines: { total: 0, upToDate: 0, pending: 0, stale: 0 }, ...o,
});
const inv = (o = {}) => ({ status: 'open', date: '2026-09-23', aircraft: '9H-VCF', total: 345, verified: 30, pending: 315, discrepancies: 19, estimated: 0, touched: 40, restock: 19, ...o });
const llc = (o = {}) => ({ lastDate: '2026-09-25T18:00:00Z', pieces: 11, ...o });
const sig = (o = {}) => ({
  now: NOW, rotationStatus: 'rotacion', aircraft: '9H-VCF', noAircraft: false, daysToDelivery: null,
  hoto: hoto(), inventory: inv(), laundry: llc(),
  elearnings: { pending: 0, overdue: 0 }, facturas: { pending: 0, overdue: 0 }, feedbackFlight: 0, feedbackAircraft: 0, ...o,
});
const all = (R) => JSON.stringify(R);

describe('los defectos del AVIÓN no puntúan (no son suyos)', () => {
  test('jump seat inoperativo / estado Bad / muchos defects: no suman ni restan', () => {
    const base = assess(sig());
    const conDefectos = assess(sig({ hoto: hoto({ defects: 6, aircraftStatus: 'Bad' }) }));
    assert.equal(conDefectos.readiness, base.readiness);
    assert.deepEqual(conDefectos.blockers, base.blockers);
    assert.ok(!/defect/i.test(all(conDefectos)), 'ninguna línea habla de defects');
    assert.ok(!/Estado: Bad|Requires Attention/.test(all(conDefectos)));
    assert.ok(!conDefectos.modules.some(m => m.name === 'Estado del avión'));
  });
});

describe('pilar 1 · inventario actualizado', () => {
  test('sesión abierta sin ningún ítem tocado → no entregaría', () => {
    const R = assess(sig({ inventory: inv({ touched: 0 }) }));
    assert.equal(R.readiness, 'not_ready');
    assert.ok(R.blockers.some(b => /inventario está sin actualizar/i.test(b)));
  });
  test('ítems actualizados → fortaleza; las "discrepancias" ya no son un aviso', () => {
    const R = assess(sig({ inventory: inv({ touched: 60, discrepancies: 40 }) }));
    assert.ok(R.strengths.some(x => /Inventario actualizado \(60/.test(x)));
    assert.ok(!all(R).includes('discrepancias'));
  });
  test('estimados (no contados de verdad) → aviso', () => {
    const R = assess(sig({ inventory: inv({ estimated: 5 }) }));
    assert.ok(R.warnings.some(w => /5 ítems estimados/.test(w)));
    assert.equal(R.readiness, 'almost_ready');
  });
  test('"30/345 verificados" ya no se muestra como problema', () => {
    const R = assess(sig());
    assert.ok(!/30\/345|315/.test(all(R)));
  });
});

describe('pilar 2 · Laundry & Cleaning Form', () => {
  test('sin formulario abierto (con datos reales del avión) → no entregaría', () => {
    const R = assess(sig({ laundry: null }));
    assert.equal(R.readiness, 'not_ready');
    assert.ok(R.blockers.some(b => /Laundry/.test(b)));
  });
  test('formulario vacío → no entregaría', () => {
    assert.equal(assess(sig({ laundry: llc({ pieces: 0 }) })).readiness, 'not_ready');
  });
  test('rellenado hoy → fortaleza y recordatorio de exportar/firmar (no sabe si lo hizo)', () => {
    const R = assess(sig());
    assert.ok(R.strengths.some(x => /Laundry Form rellenado \(11/.test(x)));
    assert.ok(R.missingEvidence.some(x => /exportaste y firmaste/.test(x)));
  });
  test('sin datos core del avión NO inventa un bloqueo: dice que falta evidencia', () => {
    const R = assess(sig({ hoto: null, inventory: null, laundry: null }));
    assert.equal(R.blockers.length, 0);
    assert.match(R.recommendation, /no tengo evidencia suficiente/i);
  });
});

describe('pilar 3 · limpieza (tareas diarias del HOTO)', () => {
  test('ninguna marcada → no entregaría (lo del microondas)', () => {
    const R = assess(sig({ hoto: hoto({ dutiesDone: 0 }) }));
    assert.equal(R.readiness, 'not_ready');
    assert.ok(R.blockers.some(b => /Ninguna de las 47 tareas diarias de limpieza/.test(b)));
  });
  test('37 de 47 (su caso real: algunas no aplican al CL350) NO baja la confianza', () => {
    const R = assess(sig({ hoto: hoto({ dutiesDone: 37 }) }));
    assert.equal(R.readiness, 'ready');
    assert.ok(R.strengths.some(x => /Limpieza marcada en el HOTO \(37\/47\)/.test(x)));
  });
  test('muy pocas marcadas → aviso', () => {
    const R = assess(sig({ hoto: hoto({ dutiesDone: 15 }) }));
    assert.ok(R.warnings.some(w => /Te faltan 32 de 47/.test(w)));
  });
  test('cabecera incompleta → aviso con qué falta', () => {
    const R = assess(sig({ hoto: hoto({ chCode: null, icao: null }) }));
    assert.ok(R.warnings.some(w => /código CH, aeropuerto \(ICAO\)/.test(w)));
  });
  test('Cabin Care sin fechas NO baja la confianza (a veces no las sabe)', () => {
    const R = assess(sig({ hoto: hoto({ careKnown: 5 }) }));
    assert.equal(R.readiness, 'ready');
  });
});

describe('pilar 4 · documentos y feedbacks', () => {
  test('feedback del vuelo pendiente → aviso con la regla de 24 h', () => {
    const R = assess(sig({ feedbackFlight: 1 }));
    assert.ok(R.warnings.some(w => /feedback del vuelo.*24 h/.test(w)));
    assert.equal(R.readiness, 'almost_ready');
  });
  test('feedback del avión pendiente → aviso con la regla de 1-2 días', () => {
    assert.ok(assess(sig({ feedbackAircraft: 1 })).warnings.some(w => /feedback del avión.*1-2 días/.test(w)));
  });
  test('el correo del handover se recuerda siempre, sin fingir que lo sabe', () => {
    const R = assess(sig());
    assert.ok(R.missingEvidence.some(x => /Correo del handover/.test(x)));
    assert.ok(R.modules.find(m => m.name === 'Documentos y feedback').lines.some(l => /Excel \+ PDF del HOTO \+ Laundry Form/.test(l.text)));
  });
});

describe('por comprar: informativo, NO baja la confianza', () => {
  test('leche/hierbas/revistas por comprar salen aparte y no cambian el veredicto', () => {
    const base = assess(sig());
    const R = assess(sig({ hoto: hoto({ shoppingZero: ['leche entera', 'hierbas'], magazines: { total: 6, upToDate: 0, pending: 6, stale: 0 } }) }));
    assert.equal(R.readiness, base.readiness);
    const m = R.modules.find(x => x.name === 'Por comprar');
    assert.ok(m.lines.some(l => /Por comprar: leche entera, hierbas/.test(l.text)));
    assert.ok(m.lines.some(l => /6 revistas por renovar o comprar/.test(l.text)));
    assert.ok(!R.warnings.some(w => /leche|revista/i.test(w)));
  });
});

describe('caso real: 9H-VCF la noche del 25/09, ya trabajado', () => {
  test('con todo hecho el veredicto es "listo" con un solo recordatorio', () => {
    const R = assess(sig({
      hoto: hoto({ dutiesDone: 37, shoppingZero: ['leche entera'], magazines: { total: 6, upToDate: 0, pending: 6, stale: 0 } }),
      inventory: inv({ estimated: 0, touched: 120 }), laundry: llc({ pieces: 11 }),
    }));
    assert.equal(R.readiness, 'ready');
    assert.match(R.recommendation, /Entregaría con tranquilidad/);
  });
});

import { collectSignals } from '../readiness.js';

describe('collectSignals: feedbacks (sin falsos positivos)', () => {
  const fakes = {
    hotoSvc: { loadActiveHoto: async () => null, loadItems: async () => [] },
    invSvc: { loadLastSession: async () => null },
    llcSvc: { loadActiveLaundryCleaning: async () => null },
  };
  const vjState = { aircraft: '9H-VCF', status: 'rotacion' };
  const task = (title) => ({ title, status: 'pending' });

  test('"Enviar feedback de vuelos del día + feedback HOTO" cuenta como feedback de VUELO, no del avión', async () => {
    const s = await collectSignals({ ...fakes, vjState, vjTasks: [task('Enviar feedback de vuelos del día + feedback HOTO')] });
    assert.equal(s.feedbackFlight, 1);
    assert.equal(s.feedbackAircraft, 0);
  });
  test('"Enviar feedback HOTO del avión 9H-VCF" cuenta como feedback del AVIÓN', async () => {
    const s = await collectSignals({ ...fakes, vjState, vjTasks: [task('Enviar feedback HOTO del avión 9H-VCF (única vez al recibir el avión)')] });
    assert.equal(s.feedbackAircraft, 1);
    assert.equal(s.feedbackFlight, 0);
  });
  test('tareas hechas no cuentan', async () => {
    const s = await collectSignals({ ...fakes, vjState, vjTasks: [{ title: 'Enviar feedback de vuelos', status: 'done' }] });
    assert.equal(s.feedbackFlight, 0);
  });
});
