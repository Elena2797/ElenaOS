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
// rachas; sin lo que Isabel dijo/hizo/preguntó ni los dominios. Sin O5. Y otra
// (D60): VistaJet cuenta tareas reales y documentos; el día de rotación avanza
// solo; sin contador de cannabis. Sin O5. Y otra (D61): dominios Libro (índice
// y progreso con token de app) y Marca Propia. Sin O5. Y otra (2026-09-22, O5
// canary): "Lo que Isabel sabe de ti" en Dominios, que solo lee
// GET /v1/app/knowledge y deja olvidar; Home no cambia y no importa ningún
// fixture ni read model de O5 preparado (segunda aserción). Y otra (D65, turno
// de noche): tarjeta "Isabel trabajó por ti" en JETMI, Marca Personal, Marca
// Propia y Vida Personal, que solo lee GET /v1/app/night. Home no cambia. Sin O5.
// Y otra (2026-09-22, SECURITY.md #2): la app deja la API key del bundle y
// llama a isabel-api con su token de app (isabelFetch), y los PDF se abren con
// un ticket corto. Solo cómo se autentica; Home no cambia. Sin O5.
// Y otra el mismo día: botón "Exportar UPLIFT" en VistaJet (antes solo en la
// página vieja de isabel-api). Home no cambia. Sin O5.
// Re-aprobado el 2026-09-26 (noche), a conciencia: el checkpoint llevaba rojo desde antes de D71. Desde entonces main.js
// ganó la pantalla Agenda de vuelos, la pantalla Fresh Items (ya no el "próximamente"), la tarjeta Urgente con
// varios dominios y "más hoy" sin contar lo que no tiene fecha; luego vuelos en "Tu día", preguntas de Isabel en su dominio y enlaces
// entre agenda, HOTO y Fresh Items; luego la lógica de la agenda pasó a services/agendaModel.js (con tests) y el Copiloto ganó avisos "para repasar" (services/deliveryNotices.js); al volver a la app se relee la agenda/Fresh Items/pre-HOTO y Tu día no duplica vuelos del Calendar; inventario y HOTO provisionales (services/inventoryProvisional.js). Comprobado: main.js no importa ningún fixture O5.
const MAIN_CHECKPOINT_SHA256 = '064AFE9054C569494BFFD01076B2D4FCBD28116869C382ADA9664D564DCE86B1';

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
