import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createSurfaceRevalidator, shouldRevalidateVisibility } from '../surfaceSync.js';

describe('Telegram ↔ LIFEOS: revalidación de una app abierta', () => {
  test('un cambio persistido por otra superficie aparece sin repetir el mensaje', async () => {
    const canonical = { state: { mode: 'before' } };
    const openApp = { state: structuredClone(canonical.state) };
    const sync = createSurfaceRevalidator({
      reloadPrimaryState: async () => { openApp.state = structuredClone(canonical.state); },
    });

    // Surface A persiste; Surface B todavía conserva su snapshot anterior.
    canonical.state.mode = 'after';
    assert.equal(openApp.state.mode, 'before');
    await sync.revalidate({ reason: 'return_from_telegram' });
    assert.equal(openApp.state.mode, 'after');

    // Cerrar/reabrir crea memoria de UI nueva, pero lee la misma verdad.
    const reopenedApp = { state: null };
    const reopenedSync = createSurfaceRevalidator({
      reloadPrimaryState: async () => { reopenedApp.state = structuredClone(canonical.state); },
    });
    await reopenedSync.revalidate({ force: true, reason: 'app_open' });
    assert.equal(reopenedApp.state.mode, 'after');
  });

  test('refresca estado, preguntas, Gym, sueño, Finanzas, recordatorios y prioridad, sin polling ni modelo directo', async () => {
    const calls = [];
    const sync = createSurfaceRevalidator({
      refreshActiveDomain: async () => { calls.push('domain'); },
      reloadPrimaryState: async () => { calls.push('primary'); },
      refreshPendingQuestions: async () => { calls.push('pending'); },
      refreshGymState: async () => { calls.push('gym'); },
      refreshSleepState: async () => { calls.push('sleep'); },
      refreshFinanceState: async () => { calls.push('finance'); },
      refreshReminders: async () => { calls.push('reminders'); },
      refreshPriority: async () => { calls.push('priority'); },
      refreshHabits: async () => { calls.push('habits'); },
      refreshPrivate: async () => { calls.push('private'); },
      render: () => { calls.push('render'); },
    });
    const result = await sync.revalidate({ reason: 'visible' });
    assert.equal(result.status, 'revalidated');
    assert.equal(calls[0], 'domain');
    assert.deepEqual(new Set(calls.slice(1, 10)), new Set(['primary', 'pending', 'gym', 'sleep', 'finance', 'reminders', 'priority', 'habits', 'private']));
    assert.equal(calls.at(-1), 'render');
    assert.equal(result.sources.priority, 'fulfilled');

    const source = fs.readFileSync(new URL('../surfaceSync.js', import.meta.url), 'utf8');
    const executableSource = source.replace(/\/\/.*$/gm, '');
    assert.doesNotMatch(executableSource, /modelRouter|setInterval/);
  });

  test('D50: lo apuntado por Telegram cambia también la prioridad de Home al volver', () => {
    const main = fs.readFileSync(new URL('../../main.js', import.meta.url), 'utf8');
    const wiring = main.slice(main.indexOf('createSurfaceRevalidator({'));
    assert.match(wiring, /refreshPriority: \(\) => loadIsabelNow\(\{ silent: true \}\)/);
    assert.match(wiring, /refreshReminders: loadReminders/);
    assert.match(wiring, /refreshHabits: loadHabits/);
  });

  test('coalesce eventos simultáneos y limita rebotes de visibilidad', async () => {
    let reads = 0;
    let release;
    let clock = 10000;
    const gate = new Promise(resolve => { release = resolve; });
    const sync = createSurfaceRevalidator({
      reloadPrimaryState: async () => { reads += 1; await gate; },
      now: () => clock,
      minIntervalMs: 2000,
    });
    const first = sync.revalidate();
    const sameFlight = sync.revalidate();
    release();
    assert.deepEqual(await sameFlight, await first);
    assert.equal(reads, 1);

    clock += 100;
    assert.equal((await sync.revalidate()).status, 'throttled');
    assert.equal(reads, 1);
    clock += 2000;
    assert.equal((await sync.revalidate()).status, 'revalidated');
    assert.equal(reads, 2);
  });

  test('un fallo parcial se declara y no impide refrescar las otras fuentes', async () => {
    let primary = 0;
    let gym = 0;
    let sleep = 0;
    let finance = 0;
    let rendered = 0;
    const sync = createSurfaceRevalidator({
      reloadPrimaryState: async () => { primary += 1; },
      refreshPendingQuestions: async () => { throw new Error('offline'); },
      refreshGymState: async () => { gym += 1; },
      refreshSleepState: async () => { sleep += 1; },
      refreshFinanceState: async () => { finance += 1; },
      render: () => { rendered += 1; },
    });
    const result = await sync.revalidate();
    assert.equal(result.sources.pending_questions, 'rejected');
    assert.equal(result.sources.primary_state, 'fulfilled');
    assert.equal(primary, 1);
    assert.equal(gym, 1);
    assert.equal(sleep, 1);
    assert.equal(finance, 1);
    assert.equal(rendered, 1);
  });

  test('no lee antes de desbloquear/inicializar y solo reacciona al volver visible', async () => {
    let reads = 0;
    const sync = createSurfaceRevalidator({
      isReady: () => false,
      reloadPrimaryState: async () => { reads += 1; },
    });
    assert.equal((await sync.revalidate()).status, 'not_ready');
    assert.equal(reads, 0);
    assert.equal(shouldRevalidateVisibility('hidden'), false);
    assert.equal(shouldRevalidateVisibility('visible'), true);
  });
});
