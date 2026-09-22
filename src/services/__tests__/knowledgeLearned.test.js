import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { buildLearnedModel, kindLabel, learnedMeta } from '../knowledgeLearned.js';

const gym = { id: 'commitment:1', kind: 'COMMITMENT', domain: 'Gym', title: 'Ir al gym 3 veces esta semana',
  her_words: 'esta semana quiero ir al gym 3 veces', learned_on: '2026-09-22', valid_until: '2026-09-27', expired: false };
const night = { id: 'preference:2', kind: 'PREFERENCE', domain: 'VistaJet', title: 'Prefiere no volar de noche',
  her_words: 'no me gusta volar de noche', learned_on: '2026-09-22', valid_until: null, expired: false };
const old = { id: 'goal:3', kind: 'GOAL', domain: 'Gym', title: 'Algo pasado', learned_on: '2026-09-01', valid_until: '2026-09-07', expired: true };

describe('Lo que Isabel sabe de ti — la app representa, no decide', () => {
  test('sin conectar, cargando, apagado y error', () => {
    assert.equal(buildLearnedModel(null, { linked: false }).state, 'unlinked');
    assert.equal(buildLearnedModel(null).state, 'loading');
    assert.equal(buildLearnedModel({ ok: false, reason: 'kill_switch_off' }).state, 'off');
    assert.equal(buildLearnedModel({ ok: false, error: 'unavailable' }).state, 'error');
    assert.equal(buildLearnedModel({ ok: true, items: [] }).state, 'empty');
  });

  test('agrupa lo vigente por área y separa lo pasado', () => {
    const m = buildLearnedModel({ ok: true, learning: true, items: [gym, night, old] });
    assert.equal(m.state, 'ok');
    assert.equal(m.count, 2);
    assert.deepEqual(m.groups.map(g => g.domain), ['Gym', 'VistaJet']);
    assert.deepEqual(m.past.map(i => i.id), ['goal:3']);
    assert.equal(m.paused, false);
  });

  test('READ_ONLY se ve como pausa', () => {
    assert.equal(buildLearnedModel({ ok: true, learning: false, items: [night] }).paused, true);
  });

  test('etiquetas en palabras suyas', () => {
    assert.equal(kindLabel('CONSTRAINT'), 'Límite');
    assert.match(learnedMeta(gym), /^Lo dijiste el .*22.* · vale hasta el .*27/);
    assert.match(learnedMeta(old), /valió hasta/);
  });
});
