import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reviewNotices } from '../deliveryNotices.js';

test('sin nada que repasar → null', () => {
  assert.equal(reviewNotices({}), null);
  assert.equal(reviewNotices({ preHotoNotes: [], fresh: { ok: true, items: [{ label: 'Limes', in_inventory: true, counted: true }] } }), null);
});
test('notas pre-HOTO en singular y plural', () => {
  assert.match(reviewNotices({ preHotoNotes: [{}] }).lines[0].text, /^1 nota provisional sin resolver/);
  assert.match(reviewNotices({ preHotoNotes: [{}, {}] }).lines[0].text, /^2 notas provisionales/);
});
test('Fresh Items estimados sin contar; los que no están en el inventario no cuentan', () => {
  const m = reviewNotices({ fresh: { ok: true, items: [
    { label: 'Lemons', in_inventory: true, counted: false },
    { label: 'Limes', in_inventory: true, counted: true },
    { label: 'Oat Milk', in_inventory: false, counted: null },
  ] } });
  assert.equal(m.lines.length, 1);
  assert.match(m.lines[0].text, /Lemons$/);
});
test('datos sin cargar o con error no inventan avisos', () => {
  assert.equal(reviewNotices({ fresh: null, preHotoNotes: undefined }), null);
  assert.equal(reviewNotices({ fresh: { ok: false } }), null);
});
