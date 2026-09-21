import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// Lo que Isabel apunta por Telegram va a `tasks` con su área (también
// VistaJet). Dominios y la vista de VistaJet solo miraban `vj_tasks` y
// proyectos, así que esas tareas no salían en ninguna pantalla.
const source = fs.readFileSync(new URL('../../main.js', import.meta.url), 'utf8');

function functionBody(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} debe existir`);
  const next = source.indexOf('\nfunction ', start + 1);
  return source.slice(start, next === -1 ? source.length : next);
}

test('los pendientes de un dominio suman `tasks` y, en VistaJet, `vj_tasks`', () => {
  const body = functionBody('openDomainTasks');
  assert.match(body, /S\.tasks\.filter/);
  assert.match(body, /S\.vjTasks/);
});

test('la tarjeta de Dominios cuenta pendientes en todos los dominios', () => {
  assert.match(functionBody('domainStats'), /openDomainTasks\(area\)/);
  const label = functionBody('domainActiveLabel');
  assert.match(label, /st\.pendingCount/);
  assert.doesNotMatch(label, /vjTaskCount/);
});

test('VistaJet no dice "Tranquilo por ahora" mirando solo `vj_tasks`', () => {
  const body = functionBody('domainSignal');
  const vj = body.slice(body.indexOf("if (name === 'VistaJet')"), body.indexOf("if (name === 'JETMI')"));
  assert.match(vj, /nextDomainTask\(area\)/);
  assert.doesNotMatch(vj, /S\.vjTasks/);
  assert.match(functionBody('nextDomainTask'), /openDomainTasks\(area\)/);
});

test('la vista de un área lista sus tareas también en VistaJet', () => {
  const body = functionBody('areaView');
  assert.match(body, /section\('✓','Tareas'/);
  assert.doesNotMatch(body, /\$\{isVJ\?'':`\$\{section\('✓','Tareas'/);
});

test('Atención incluye lo urgente, lo de hoy y lo importante aunque no tenga fecha (D50)', () => {
  const body = functionBody('workQueue');
  assert.match(body, /t\.priority === 'critical'/);
  assert.match(body, /t\.horizon === 'today'/);
  assert.match(body, /t\.priority === 'high'/);
});

test('la tarjeta de Isabel nombra las señales nuevas del Core en castellano', () => {
  const body = functionBody('isabelEvidenceLabel');
  for (const signal of ['critical_task', 'planned_today', 'important_tasks']) {
    assert.match(body, new RegExp(`case '${signal}'`));
  }
});

test('una tarea descartada deja de salir en la app', () => {
  const db = fs.readFileSync(new URL('../db.js', import.meta.url), 'utf8');
  assert.match(db, /from\('tasks'\)\.select\('\*,areas\(name,color\)'\)\.not\('status', 'in', '\(done,discarded\)'\)/);
});

test('Home enseña los recordatorios pedidos por Telegram', () => {
  assert.match(functionBody('homeView'), /remindersCard\(\)/);
  assert.match(functionBody('loadReminders'), /\/v1\/reminders/);
});

// D53: standby es estar de rotación sin volar, a menudo sin avión. La app lo
// llamaba "Fuera de rotación" porque solo miraba status === 'rotacion'.
test('standby se enseña como parte de la rotación, no como "Fuera de rotación"', () => {
  const vj = functionBody('domainSignal');
  assert.match(vj.slice(vj.indexOf("if (name === 'VistaJet')")), /status === 'standby'[\s\S]*Standby · Día \$\{day\} de rotación/);
  assert.match(functionBody('vjDutyLine'), /sin avión asignado/);
  assert.match(source, /const acSL=status==='standby'\?'Standby':/);
  assert.match(source, /const ctrlLabel=status==='standby'\?/);
});
