import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { buildNightWorkModel, nightDayLabel, NIGHT_AREAS } from '../nightWork.js';

const report = {
  ok: true,
  last_run: { date: '2026-09-23' },
  work: [
    { id: 'e1', date: '2026-09-22', area: 'JETMI', label: 'Plan', title: 'Plan viejo', body: 'viejo' },
    { id: 'e2', date: '2026-09-23', area: 'JETMI', label: 'Borrador', title: 'Mensaje a GlobeAir', body: 'Hola...' },
    { id: 'e3', date: '2026-09-23', area: 'Vida Personal', label: 'Checklist', title: 'Residencia fiscal', body: '1. NIF' },
  ],
  questions: [
    { id: 'q1', date: '2026-09-23', area: 'JETMI', title: '¿Qué dominio?', body: '¿Qué dominio?\n\n• flyjetmi.com' },
  ],
};

describe('Turno de noche — la app representa, no decide', () => {
  test('VistaJet y los dominios en los que no trabaja sola no enseñan nada', () => {
    for (const name of ['VistaJet', 'Libro', 'Salud', 'Finanzas', 'Gym']) {
      assert.equal(buildNightWorkModel(report, name, { linked: true, today: '2026-09-23' }).state, 'hidden', name);
    }
    assert.equal(NIGHT_AREAS.includes('VistaJet'), false);
  });

  test('sin conectar, cargando, error y vacío', () => {
    assert.equal(buildNightWorkModel(report, 'JETMI', { linked: false, today: '2026-09-23' }).state, 'unlinked');
    assert.equal(buildNightWorkModel(null, 'JETMI', { linked: true, today: '2026-09-23' }).state, 'loading');
    assert.equal(buildNightWorkModel({ ok: false }, 'JETMI', { linked: true, today: '2026-09-23' }).state, 'error');
    assert.equal(buildNightWorkModel(report, 'Marca Propia', { linked: true, today: '2026-09-23' }).state, 'empty');
  });

  test('cada dominio ve solo lo suyo, de la última noche, con su pregunta', () => {
    const m = buildNightWorkModel(report, 'JETMI', { linked: true, today: '2026-09-23' });
    assert.equal(m.state, 'ok');
    assert.equal(m.dayLabel, 'Esta noche');
    assert.deepEqual(m.items.map((i) => i.title), ['Mensaje a GlobeAir']);
    assert.match(m.question.body, /flyjetmi\.com/);
    const v = buildNightWorkModel(report, 'Vida Personal', { linked: true, today: '2026-09-23' });
    assert.deepEqual(v.items.map((i) => i.title), ['Residencia fiscal']);
    assert.equal(v.question, null);
  });

  test('la fecha en palabras', () => {
    assert.equal(nightDayLabel('2026-09-23', '2026-09-23'), 'Esta noche');
    assert.equal(nightDayLabel('2026-09-22', '2026-09-23'), 'Ayer');
    assert.match(nightDayLabel('2026-09-20', '2026-09-23'), /domingo/);
  });
});
