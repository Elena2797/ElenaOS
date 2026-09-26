import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isProvisional, provisionalFrom, startResult, integrationMessage } from '../inventoryProvisional.js';

test('se reconoce un provisional por su marca en column_map; uno normal no', () => {
  assert.equal(isProvisional({ column_map: { current_qty: 3, provisional: { from_tail: '9H-VCF' } } }), true);
  assert.equal(isProvisional({ column_map: { current_qty: 3 } }), false);
  assert.equal(isProvisional(null), false);
  assert.equal(isProvisional({ column_map: null }), false);
  assert.equal(provisionalFrom({ column_map: { provisional: { from_tail: '9H-VCF' } } }), '9H-VCF');
  assert.equal(provisionalFrom({ column_map: {} }), null);
});

test('crear el provisional: ok (o ya abierto) sigue adelante; los errores dicen qué hacer', () => {
  assert.deepEqual(startResult({ ok: true }), { ok: true, message: '' });
  assert.equal(startResult({ ok: false, error: 'already_open' }).ok, true);
  assert.match(startResult({ ok: false, error: 'no_catalog' }).message, /sube el Excel/);
  assert.match(startResult({ ok: false, error: 'not_linked' }).message, /Conecta la app/);
  assert.match(startResult({ ok: false, error: 'network' }).message, /Prueba otra vez/);
  assert.match(startResult(undefined).message, /Prueba otra vez/);
});

test('integración: cuenta lo integrado, lista lo que no cuadró y avisa si falló', () => {
  assert.equal(integrationMessage({ ok: true, integrated: 1, unmatched: [] }), 'Inventario oficial listo. Integré 1 ítem que ya habías contado.');
  assert.match(integrationMessage({ ok: true, integrated: 12, unmatched: [{ description: 'Cosa rara' }] }), /Integré 12 ítems.*No los encontré en el oficial: Cosa rara\./);
  assert.match(integrationMessage({ ok: false }), /Sigue abierto: díselo a Isabel/);
  const many = Array.from({ length: 10 }, (_, i) => ({ description: 'X' + i }));
  assert.match(integrationMessage({ ok: true, integrated: 0, unmatched: many }), /X7…\./);
});
