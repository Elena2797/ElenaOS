import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { O5_HOME_FIXTURES } from '../followUpHomeFixtures.js';

const MAIN_URL = new URL('../../main.js', import.meta.url);
// Checkpoint aprobado durante O4 después de promover SurfaceSync y la lectura
// determinista de sueño. O5 sigue sin poder modificar ni importar el runtime.
const MAIN_CHECKPOINT_SHA256 = '6D101274CCBE474EC95CD0A9258B7F290A763D94341B069AEADB00DE4529B496';

describe('O5 adaptive Home fixtures remain presentational and disconnected', () => {
  test('only-input fixture contains no empty visual categories', () => {
    assert.deepEqual(O5_HOME_FIXTURES.only_input.sections.map(x => x.kind), ['NEEDS_INPUT']);
    assert.equal(O5_HOME_FIXTURES.only_input.now, null);
  });

  test('urgent-action fixture does not fabricate other sections', () => {
    assert.deepEqual(O5_HOME_FIXTURES.urgent_action.sections.map(x => x.kind), ['NOW']);
    assert.equal(O5_HOME_FIXTURES.urgent_action.needs_input.length, 0);
  });

  test('empty fixture has explicit empty state and no sections', () => {
    assert.ok(O5_HOME_FIXTURES.empty.empty_state);
    assert.deepEqual(O5_HOME_FIXTURES.empty.sections, []);
  });

  test('full fixture respects maximum cardinalities', () => {
    const model = O5_HOME_FIXTURES.full;
    assert.ok(model.now);
    assert.ok(model.needs_input.length >= 1 && model.needs_input.length <= 3);
    assert.ok(model.later.length <= 3);
    assert.equal(model.recent_changes[0].category, 'GOAL_CHANGE');
    assert.ok(model.recent_changes[0].source);
    assert.ok(model.goal_progress[0].progress_summary);
  });

  test('fixtures contain no local score/weight/ranking algorithm', () => {
    const source = readFileSync(new URL('../followUpHomeFixtures.js', import.meta.url), 'utf8');
    assert.doesNotMatch(source, /\b(score|weight)\b|\.sort\s*\(|workQueue\s*\(/);
  });

  test('live Home and Avanzar remain at the approved deterministic checkpoint and import no O5 fixture', () => {
    const bytes = readFileSync(MAIN_URL);
    // Git puede materializar el mismo blob con CRLF o LF según el worktree.
    // El guard protege el contenido del runtime, no una convención de EOL.
    const source = bytes.toString('utf8').replaceAll('\r\n', '\n');
    const hash = createHash('sha256').update(source).digest('hex').toUpperCase();
    assert.equal(hash, MAIN_CHECKPOINT_SHA256);
    assert.doesNotMatch(source, /followUpHomeFixtures|followUpReadModel|needs_input/);
  });
});
