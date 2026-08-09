import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { actionFeedbackPayload, buildKnowledgeHomeModel, renderKnowledgeCockpit } from '../knowledgeView.js';

const now = {
  knowledge_status: { available: true },
  next_best_action: {
    id: 'a1', title: 'Buscar alternativa', domain: 'Personal', reason: 'El recurso no está disponible',
    evidence: { availability: false, source: 'calendar' }, priority_basis: ['Se puede ejecutar ahora'],
  },
  goals: [{ entity_id: 'g1', title: 'Objetivo principal', domain: 'Personal', status: 'BLOCKED',
    status_history: [{ status: 'BLOCKED', reason: 'Falta el recurso' }] }],
  recent_changes: [{ id: 'c1', summary: 'Cambió la disponibilidad', domain: 'Personal', kind: 'STATE', occurred_at: '2026-08-09T15:00:00Z' }],
};

describe('Home representa /v1/now; no decide', () => {
  test('muestra la razón y evidencia exactas del candidato autorizado', () => {
    const model = buildKnowledgeHomeModel(now);
    assert.equal(model.next_action.reason, 'El recurso no está disponible');
    assert.deepEqual(model.next_action.evidence, [
      { label: 'availability', value: 'false' }, { label: 'source', value: 'calendar' },
    ]);
    assert.equal(model.goals[0].status, 'BLOCKED');
    assert.equal(model.recent_changes[0].summary, 'Cambió la disponibilidad');
  });

  test('el HTML escapa contenido y conserva los controles de feedback', () => {
    const unsafe = structuredClone(now);
    unsafe.next_best_action.title = '<img src=x onerror=alert(1)>';
    const html = renderKnowledgeCockpit(buildKnowledgeHomeModel(unsafe));
    assert.ok(!html.includes('<img'));
    assert.match(html, /&lt;img/);
    assert.match(html, /data-feedback="COMPLETED"/);
    assert.match(html, /Falta el recurso/);
  });

  test('el feedback declara la superficie y no inventa resultado', () => {
    assert.deepEqual(actionFeedbackPayload('a1', 'REJECTED'), {
      action_id: 'a1', status: 'REJECTED', outcome: null, source_surface: 'lifeos_home',
    });
  });

  test('sin conocimiento disponible no fabrica tarjetas', () => {
    const model = buildKnowledgeHomeModel({});
    assert.equal(model.next_action, null);
    assert.equal(renderKnowledgeCockpit(model), '');
  });
});
