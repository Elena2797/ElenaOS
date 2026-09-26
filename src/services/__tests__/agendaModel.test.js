import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { dayLabel, nextFlight, lastLegOf, cardSummary, todayRows } from '../agendaModel.js';

const T = '2026-09-26';
const days = [
  { day: T, entries: [
    { kind: 'flight', tail_number: '9H-VCC', dep_icao: 'EGLF', arr_icao: 'ESSB', dep_local: '12:30', arr_local: '15:40', dep_utc: '2026-09-26T11:30:00Z', arr_utc: '2026-09-26T13:40:00Z', pax: 0, status: 'landed' },
    { kind: 'flight', tail_number: '9H-VCC', dep_icao: 'ESSB', arr_icao: 'LIMJ', dep_local: '17:00', arr_local: '19:50', dep_utc: '2026-09-26T15:00:00Z', arr_utc: '2026-09-26T17:50:00Z', pax: 2, status: 'scheduled' },
  ] },
  { day: '2026-09-28', entries: [{ kind: 'flight', tail_number: '9H-VCC', dep_icao: 'LIPX', arr_icao: 'EDSB', dep_local: '14:00', dep_utc: '2026-09-28T12:00:00Z', arr_utc: '2026-09-28T13:10:00Z', status: 'scheduled' }] },
  { day: '2026-09-29', entries: [{ kind: 'rot' }] },
];

describe('dayLabel', () => {
  test('capitaliza, sin puntos, con hoy/mañana', () => {
    assert.equal(dayLabel('2026-09-26', '2026-09-26', '2026-09-27'), 'Sáb, 26 sept · hoy');
    assert.equal(dayLabel('2026-09-27', '2026-09-26', '2026-09-27'), 'Dom, 27 sept · mañana');
    assert.equal(dayLabel('2026-09-29', '2026-09-26', '2026-09-27'), 'Mar, 29 sept');
  });
});

describe('nextFlight / lastLegOf', () => {
  test('el siguiente vuelo salta los ya aterrizados', () => {
    assert.equal(nextFlight(days, T).dep_icao, 'ESSB');
  });
  test('sin vuelos por delante → null (solo ROT o días pasados)', () => {
    assert.equal(nextFlight([{ day: '2026-09-29', entries: [{ kind: 'rot' }] }], T), null);
    assert.equal(nextFlight(days, '2026-10-01'), null);
    assert.equal(nextFlight(null, T), null);
  });
  test('el último vuelo de un avión es donde acaba', () => {
    assert.equal(lastLegOf(days, '9H-VCC').arr_icao, 'EDSB');
    assert.equal(lastLegOf(days, '9H-VCF'), null);
  });
});

describe('cardSummary', () => {
  test('sin conexión o sin cargar → texto neutro', () => {
    assert.match(cardSummary({ days: null, today: T, linked: true }), /Tus vuelos/);
    assert.match(cardSummary({ days: days, today: T, linked: false }), /Tus vuelos/);
  });
  test('con vuelo por delante devuelve el vuelo', () => {
    assert.equal(cardSummary({ days, today: T, linked: true }).next.dep_icao, 'ESSB');
  });
  test('solo ROT → días de rotación; nada → pide la foto', () => {
    assert.match(cardSummary({ days: [{ day: '2026-09-29', entries: [{ kind: 'rot' }] }], today: T, linked: true }), /rotación, sin vuelos/);
    assert.match(cardSummary({ days: [], today: T, linked: true }), /mándale la foto/);
  });
});

describe('todayRows (Tu día)', () => {
  test('vuelos de hoy: se enseña la hora local y se ordena por la de Madrid', () => {
    const rows = todayRows(days, T);
    assert.equal(rows.length, 2);
    assert.equal(rows[0].at, '12:30');            // Londres: local
    assert.equal(rows[0].sortAt, '13:30');        // Madrid = +1 h
    assert.equal(rows[1].sortAt, '17:00');
    assert.equal(rows[1].text, 'ESSB → LIMJ · 17:00–19:50 · 2 pax (hora local)');
  });
  test('día ROT: una fila al principio; sin nada → vacío; sin pax no inventa', () => {
    assert.equal(todayRows(days, '2026-09-29')[0].text, 'ROT · día de rotación, aún sin vuelos definidos');
    assert.deepEqual(todayRows(days, '2026-10-05'), []);
    assert.ok(!todayRows(days, '2026-09-28')[0].text.includes('pax'));
  });
});

import { looksLikeAgendaFlight } from '../agendaModel.js';
describe('looksLikeAgendaFlight (no duplicar vuelos del Calendar en Tu día)', () => {
  const flights = [{ dep_icao: 'ESSB', arr_icao: 'LIMJ' }];
  test('ruta ICAO en el título → duplicado', () => {
    assert.equal(looksLikeAgendaFlight('ESSB → LIMJ', flights), true);
    assert.equal(looksLikeAgendaFlight('9H-VCC LIMJ-LDZD 15:50', flights), true);
  });
  test('ICAO de uno de hoy + palabra de vuelo → duplicado', () => {
    assert.equal(looksLikeAgendaFlight('Vuelo a LIMJ', flights), true);
    assert.equal(looksLikeAgendaFlight('Ferry desde ESSB', flights), true);
  });
  test('eventos normales no se tocan', () => {
    assert.equal(looksLikeAgendaFlight('Dentista', flights), false);
    assert.equal(looksLikeAgendaFlight('Comida con Marta', flights), false);
    assert.equal(looksLikeAgendaFlight('Revisión LIMJ del contrato', flights), false);   // ICAO suelto sin palabra de vuelo
  });
  test('sin vuelos en la agenda nunca se oculta nada', () => {
    assert.equal(looksLikeAgendaFlight('ESSB → LIMJ', []), false);
    assert.equal(looksLikeAgendaFlight('Vuelo', null), false);
  });
});
