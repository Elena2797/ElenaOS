import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { O5_HOME_FIXTURES } from '../followUpHomeFixtures.js';

const MAIN_URL = new URL('../../main.js', import.meta.url);
// Checkpoint aprobado durante O4 después de promover SurfaceSync y las lecturas
// deterministas de sueño y Finanzas. O5 sigue sin poder modificar ni importar
// el runtime. Actualizado el 2026-09-21: Dominios y VistaJet muestran las tareas
// de `tasks` que apunta Isabel, y Home refleja la prioridad declarada, los
// recordatorios y se recalcula al volver de Telegram (D50). Standby se enseña
// como parte de la rotación (D53). La tarjeta Hábitos de Vida Personal enseña
// las rachas de leer, escribir y gym que da GET /v1/habits (D52). Sin O5, sin
// fixtures. Y otra vez (D55): sin chat propio; "Hablar con Isabel" abre
// Telegram. Solo se quita código; sin O5. Y otra (D56): el saludo y JETMI
// cuentan solo lo que Isabel hizo desde la visita anterior, y la app instalada
// busca versión nueva al volver (services/appUpdate.js). Sin O5. Y otra (D57):
// Home "Hoy con Isabel" (lo que dijo en Telegram, foco con botones, agenda,
// rachas, lo que hizo), conexión por código de Telegram, Marca con Instagram,
// Salud sin medicación en el bundle, JETMI sin voz inventada. Sin O5. Y otra
// (D58): JETMI enseña "Dónde está JETMI" (areas.ia_context). Sin O5. Y otra
// (D59): Inicio = saludo, "Hoy" (ahora + siguiente + su día) y progreso con
// rachas; sin lo que Isabel dijo/hizo/preguntó ni los dominios. Sin O5.
const MAIN_CHECKPOINT_SHA256 = 'BD9BEDA628A06A6A6F0C8480694B1468871701868B28A541708912048644E757';

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
