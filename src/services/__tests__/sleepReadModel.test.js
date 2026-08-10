import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { currentSleepEntry, formatSleepMinutes } from '../sleepReadModel.js';

describe('sleep read model', () => {
  test('formats persisted minutes without estimating', () => {
    assert.equal(formatSleepMinutes(420), '7 h');
    assert.equal(formatSleepMinutes(375), '6 h 15 min');
    assert.equal(formatSleepMinutes(null), null);
    assert.equal(formatSleepMinutes(-1), null);
  });

  test('only treats the canonical date for today as current', () => {
    assert.deepEqual(currentSleepEntry({
      today: '2026-08-10', latest: { date: '2026-08-10', minutes: 390 },
    }), { date: '2026-08-10', minutes: 390 });
    assert.equal(currentSleepEntry({
      today: '2026-08-10', latest: { date: '2026-08-09', minutes: 390 },
    }), null);
  });
});
