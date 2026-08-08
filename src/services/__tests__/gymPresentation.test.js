import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../../main.js', import.meta.url), 'utf8');

function functionBody(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} debe existir`);
  const next = source.indexOf('\nfunction ', start + 1);
  return source.slice(start, next === -1 ? source.length : next);
}

test('Gym en Home/Dominios representa el mismo estado del Core', () => {
  const body = functionBody('domainSignal');
  const gym = body.slice(body.indexOf("if (name === 'Gym')"));
  assert.match(gym, /S\.gym/);
  assert.match(gym, /gym\.week\.strength/);
  assert.match(gym, /gym\.target_sessions/);
  assert.doesNotMatch(gym, /sesiones_semana/);
  assert.doesNotMatch(gym, /\/2 sesiones/);
});

test('el estado Gym se carga al iniciar, no solo al abrir su pantalla', () => {
  const init = source.slice(source.indexOf('async function initApp'), source.indexOf('// ────── Gym'));
  assert.match(init, /loadGymState\(\)/);
});

test('el escritor legacy regSesion ya no existe ni tiene consumidores', () => {
  assert.doesNotMatch(source, /\bregSesion\b/);
});
