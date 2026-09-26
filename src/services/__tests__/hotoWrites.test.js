import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as hotoSvc from '../hoto.js';

// Cliente falso mínimo: cada consulta encadenada acaba resolviendo sin error.
function fakeClient() {
  const chain = () => {
    const c = { insert: () => c, update: () => c, delete: () => c, select: () => c, eq: () => c, single: async () => ({ data: { id: 'x' }, error: null }), then: (res) => res({ data: null, error: null }) };
    return c;
  };
  return { from: () => chain() };
}

test('las ediciones que importan al análisis avisan; las de tareas diarias no', async () => {
  hotoSvc.setClient(fakeClient());
  const events = [];
  hotoSvc.setOnWrite((e) => events.push(e.kind));
  await hotoSvc.createHoto({ tail_number: '9H-VCC' });
  await hotoSvc.updateHoto('h1', { shopping: { limes: '2' } });
  await hotoSvc.updateHoto('h1', { cabin_care: ['26/09/2026'] });
  await hotoSvc.updateHoto('h1', { daily_duties: { g1: true } });   // checkbox: no cambia lo que ve el análisis
  await hotoSvc.addItem('h1', 'defect', 'armrest');
  await hotoSvc.deleteItem('i1');
  assert.deepEqual(events, ['create', 'update', 'update', 'add_item', 'delete_item']);
});

test('writeMatters: solo daily_duties no cuenta; un patch vacío o mixto sí', () => {
  assert.equal(hotoSvc.writeMatters({ daily_duties: {} }), false);
  assert.equal(hotoSvc.writeMatters({ daily_duties: {}, updated_at: 'x' }), false);
  assert.equal(hotoSvc.writeMatters({ daily_duties: {}, icao: 'LIPX' }), true);
  assert.equal(hotoSvc.writeMatters({}), true);
  assert.equal(hotoSvc.writeMatters(undefined), true);
});

test('un aviso que falla nunca rompe la escritura', async () => {
  hotoSvc.setClient(fakeClient());
  hotoSvc.setOnWrite(() => { throw new Error('boom'); });
  await hotoSvc.updateHoto('h1', { icao: 'LIPX' });   // no lanza
  hotoSvc.setOnWrite(null);
});
