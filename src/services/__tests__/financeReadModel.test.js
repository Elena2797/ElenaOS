import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { financeStateSummary } from '../financeReadModel.js';

describe('finance presentation reads Core and never invents status', () => {
  test('represents an explainable budget signal', () => {
    const result = financeStateSummary({
      month: '2026-08',
      signals: [{ type: 'budget_exceeded', evidence: { category: 'Comida' }, reason: 'Evidencia exacta.' }],
      coverage: {},
    }, '2026-08');
    assert.deepEqual(result, { state: 'attention', headline: 'Presupuesto superado: Comida', detail: 'Evidencia exacta.' });
  });

  test('distinguishes an empty current month from stale source coverage', () => {
    const result = financeStateSummary({
      month: '2026-08', signals: [],
      coverage: { transaction_count: 0, latest_available_date: '2026-06-26' },
    }, '2026-08');
    assert.equal(result.state, 'stale');
    assert.match(result.detail, /26\/06\/2026/);
  });

  test('a read failure is not presented as zero activity', () => {
    const result = financeStateSummary({ month: '2026-08', error: 'offline' }, '2026-08');
    assert.equal(result.state, 'unavailable');
    assert.doesNotMatch(result.headline, /sin movimientos/i);
  });

  test('month mismatch never leaks stale status into another month', () => {
    assert.equal(financeStateSummary({ month: '2026-07', coverage: {} }, '2026-08').state, 'loading');
  });
});
