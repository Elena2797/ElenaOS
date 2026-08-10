import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../../main.js', import.meta.url), 'utf8');

test('JETMI inicializa sus métricas antes de derivar estado, siguiente nivel y acciones', () => {
  const start = source.indexOf('const jetmiView=');
  const end = source.indexOf('const vidaView=', start);
  const jetmi = source.slice(start, end);
  const metrics = jetmi.indexOf('const leadsMetric=');
  assert.ok(metrics >= 0, 'falta la métrica leads');
  assert.ok(metrics < jetmi.indexOf('const nivelActual='));
  assert.ok(metrics < jetmi.indexOf('const siguienteNivel='));
  assert.equal((jetmi.match(/const leadsMetric=/g) || []).length, 1);
});

test('las tarjetas no afirman que Finanzas o Salud están bajo control sin evidencia', () => {
  const start = source.indexOf('function domainSignal(');
  const end = source.indexOf('// Cola de trabajo', start);
  const signals = source.slice(start, end);
  const finance = signals.slice(signals.indexOf("if (name === 'Finanzas')"), signals.indexOf("if (name === 'Salud')"));
  const health = signals.slice(signals.indexOf("if (name === 'Salud')"), signals.indexOf("if (name === 'Gym')"));
  assert.doesNotMatch(finance, /bajo control/i);
  assert.match(finance, /S\.transactions/);
  assert.doesNotMatch(health, /Todo bajo control/i);
  assert.match(health, /S\.metrics/);
});
