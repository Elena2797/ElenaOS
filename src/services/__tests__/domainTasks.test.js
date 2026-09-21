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
  // Desde D59 van en la tarjeta "Hoy", en "Tu día", junto a la agenda.
  assert.match(functionBody('homeView'), /todayBlock\(\)/);
  assert.match(functionBody('todayBlock'), /S\.reminders/);
  assert.match(functionBody('loadReminders'), /\/v1\/reminders/);
});

// D59: Inicio es solo lo suyo y sin repetir: una tarjeta "Hoy" (ahora, lo
// siguiente y su día) y el progreso con las rachas. Nada de lo que Isabel
// dijo, hizo o preguntó (vive en Telegram) ni los dominios (tienen pestaña).
test('Inicio no repite Telegram ni Dominios, y hay una sola lista de qué hacer', () => {
  const home = functionBody('homeView');
  assert.match(home, /todayBlock\(\)/);
  assert.match(home, /progressCard\(\)/);
  assert.doesNotMatch(home, /isabelSaidCard|isabelDoneCard|pendingQuestionsCard|visibleDomains|focusCard|atItems|isabelHomeCard/);
  assert.match(functionBody('homeFocusItems'), /workQueue\(\)/);
  assert.doesNotMatch(source, /isabelRolLabel|Criterio de Isabel -->/);
});

// D57: lo privado solo con la app conectada; la medicación ya no va en el JS.
test('lo privado sale del servidor con token de app, no del bundle', () => {
  assert.match(functionBody('loadAppToday'), /\/v1\/app\/today/);
  assert.match(functionBody('loadHealthProfile'), /\/v1\/app\/health-profile/);
  assert.doesNotMatch(source, /Hiprex|Vejiga dolorosa/);
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

// D60: las tarjetas de VistaJet (eLearnings, Visas y documentos, tareas del
// avión) leían solo `vj_tasks`, vacía; los eLearnings salían "Al día" con uno
// vencido. Y el día de rotación no avanzaba.
test('VistaJet cuenta las tareas reales y los documentos, y el día de rotación avanza', () => {
  assert.match(functionBody('vjOpenTasks'), /S\.tasks\.filter/);
  assert.match(source, /const pendTasks=vjOpenTasks\(\);/);
  assert.match(source, /collectSignals\(\{hotoSvc,invSvc,llcSvc,vjTasks:vjOpenTasks\(\)/);
  assert.match(source, /const docItems=\[\.\.\.pendTasks\.filter\(t=>VJ_DOCS_RE\.test/);
  assert.match(source, /S\.reminders\|\|\[\]\)\.filter\(r=>VJ_DOCS_RE\.test/);
  assert.match(functionBody('withRotationDay'), /rotation_start/);
  assert.match(source, /S\.vjState=withRotationDay\(/);
  assert.doesNotMatch(source, /días sin cannabis/);
});

// D61: dos dominios nuevos. El libro es íntimo: su índice viene del servidor
// con el token de app, nunca de las tablas públicas ni del JS.
test('Libro y Marca Propia son dominios; el libro se pide con token de app', () => {
  assert.match(functionBody('visibleDomains'), /'Marca Propia','Libro'/);
  assert.match(functionBody('loadAppBook'), /\/v1\/app\/book/);
  assert.match(source, /const libroView=isLibro\?/);
  assert.match(source, /const marcaPropiaView=isMarcaPropia\?/);
  assert.doesNotMatch(source, /Chaclacayo|cistitis intersticial|Vejigas Felices"|'Vejigas Felices/);
});
