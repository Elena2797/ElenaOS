import { test } from 'node:test';
import assert from 'node:assert/strict';
import { watchAppUpdates } from '../appUpdate.js';

function fakeTarget(extra = {}) {
  const handlers = {};
  return {
    ...extra,
    addEventListener(type, fn) { (handlers[type] ||= []).push(fn); },
    fire(type) { (handlers[type] || []).forEach((fn) => fn()); },
  };
}

test('una versión nueva recarga la app una sola vez', () => {
  let reloads = 0;
  const sw = fakeTarget({ controller: {} });
  watchAppUpdates({ serviceWorker: sw, doc: fakeTarget(), reload: () => { reloads++; } });
  sw.fire('controllerchange');
  sw.fire('controllerchange');
  assert.equal(reloads, 1);
});

test('la primera instalación no recarga', () => {
  let reloads = 0;
  const sw = fakeTarget({ controller: null });
  watchAppUpdates({ serviceWorker: sw, doc: fakeTarget(), reload: () => { reloads++; } });
  sw.fire('controllerchange');
  assert.equal(reloads, 0);
  sw.fire('controllerchange');
  assert.equal(reloads, 1);
});

test('al volver a la app se busca versión nueva; al irse, no', async () => {
  let checks = 0;
  const sw = fakeTarget({ controller: {}, getRegistration: async () => ({ update: async () => { checks++; } }) });
  const doc = fakeTarget({ visibilityState: 'hidden' });
  watchAppUpdates({ serviceWorker: sw, doc, reload: () => {} });
  doc.fire('visibilitychange');
  doc.visibilityState = 'visible';
  doc.fire('visibilitychange');
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(checks, 1);
});

test('sin service worker no hace nada', () => {
  assert.equal(watchAppUpdates({ serviceWorker: undefined, doc: fakeTarget(), reload: () => {} }), false);
});
