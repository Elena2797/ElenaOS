import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cellText } from '../inventory.js';

test('texto y números normales', () => {
  assert.equal(cellText('  Lemon '), 'Lemon');
  assert.equal(cellText(3), '3');
  assert.equal(cellText(null), '');
});
test('texto enriquecido, fórmula e hipervínculo dan su texto, nunca [object Object]', () => {
  assert.equal(cellText({ richText: [{ text: 'Lee Kum Kee ' }, { text: 'XO' }] }), 'Lee Kum Kee XO');
  assert.equal(cellText({ formula: 'A1', result: 'Soy Sauce' }), 'Soy Sauce');
  assert.equal(cellText({ text: 'Chilli Sauce', hyperlink: 'http://x' }), 'Chilli Sauce');
  assert.equal(cellText({ w: 'Dom Perignon', v: 1 }), 'Dom Perignon');
});
test('objeto sin texto → vacío', () => {
  assert.equal(cellText({}), '');
  assert.ok(!cellText({ a: 1 }).includes('object'));
});
