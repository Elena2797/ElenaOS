// db.js — único punto de acceso a Supabase
// Ningún otro módulo llama a db.from() directamente.

let _db = null;

export function setClient(client) {
  _db = client;
}

// ─── Carga inicial ────────────────────────────────────────────────────────────

export async function loadAll() {
  const [ctx, areas, tasks, waiting, decisions, metrics, operators, transactions, vjState, vjTasks, projects, eventos, alertas] =
    await Promise.all([
      _db.from('life_context').select('*').order('created_at', { ascending: false }).limit(1),
      _db.from('areas').select('*').order('sort_order'),
      _db.from('tasks').select('*,areas(name,color)').neq('status', 'done'),
      _db.from('waiting_for').select('*,areas(name,color)').eq('status', 'active'),
      _db.from('decisions').select('*,areas(name,color)').eq('status', 'open'),
      _db.from('metrics').select('*'),
      _db.from('operators').select('*').order('created_at'),
      _db.from('transactions').select('*').gte('date', new Date().getFullYear() + '-01-01').order('date', { ascending: false }),
      _db.from('vj_state').select('*').limit(1),
      _db.from('vj_tasks').select('*').order('created_at'),
      _db.from('projects').select('*').in('status', ['active', 'paused']).order('last_activity_at', { ascending: false }),
      _db.from('eventos').select('*').order('created_at', { ascending: false }).limit(50),
      _db.from('alertas').select('*').eq('status', 'active').order('created_at', { ascending: false }),
    ]);
  return { ctx, areas, tasks, waiting, decisions, metrics, operators, transactions, vjState, vjTasks, projects, eventos, alertas };
}

// ─── Modo ─────────────────────────────────────────────────────────────────────

export async function getMode() {
  const { data } = await _db.from('life_context').select('*').order('created_at', { ascending: false }).limit(1);
  return data?.[0] ?? null;
}

export async function setMode(mode) {
  const { data } = await _db.from('life_context').select('id').order('created_at', { ascending: false }).limit(1);
  if (data?.[0]) {
    await _db.from('life_context').update({ mode }).eq('id', data[0].id);
  } else {
    await _db.from('life_context').insert({ mode });
  }
}

// ─── Tareas ───────────────────────────────────────────────────────────────────

export async function completeTask(id) {
  await _db.from('tasks').update({ status: 'done', completed_at: new Date().toISOString() }).eq('id', id);
}

export async function createTask({ title, area_id, priority, horizon, due_date, suitable_modes, notes }) {
  const { data } = await _db.from('tasks').insert({
    title, area_id, priority, horizon, due_date, suitable_modes, notes,
    status: 'pending',
  }).select().single();
  return data;
}

// ─── Métricas ─────────────────────────────────────────────────────────────────

export async function updateMetric(id, value) {
  await _db.from('metrics').update({ value: String(value), updated_at: new Date().toISOString() }).eq('id', id);
}

export async function createMetric({ area_id, key, value, label, unit }) {
  const { data } = await _db.from('metrics').insert({ area_id, key, value: String(value), label, unit }).select().single();
  return data;
}

export async function deleteMetric(id) {
  await _db.from('metrics').delete().eq('id', id);
}

export async function upsertBudget(cat, val, existingId) {
  const key = 'budget_' + cat;
  if (existingId) {
    await _db.from('metrics').update({ value: String(val), updated_at: new Date().toISOString() }).eq('id', existingId);
  } else {
    const { data } = await _db.from('metrics').insert({ key, value: String(val), label: 'Presupuesto ' + cat, unit: '€', area_id: null }).select().single();
    return data;
  }
}

// ─── VistaJet — estado ────────────────────────────────────────────────────────

export async function updateVjState(id, patch) {
  await _db.from('vj_state').update(patch).eq('id', id);
}

// ─── VistaJet — tareas ────────────────────────────────────────────────────────

export async function createVjTask({ title, due_date, priority }) {
  const { data } = await _db.from('vj_tasks').insert({ title, due_date, priority, status: 'pending' }).select().single();
  return data;
}

export async function updateVjTaskStatus(id, status) {
  await _db.from('vj_tasks').update({ status }).eq('id', id);
}

export async function deleteVjTask(id) {
  await _db.from('vj_tasks').delete().eq('id', id);
}

export async function deleteVjTasksByIds(ids) {
  await _db.from('vj_tasks').delete().in('id', ids);
}

// ─── Transacciones ────────────────────────────────────────────────────────────

export async function getTransactionsYTD() {
  const { data } = await _db.from('transactions').select('*').gte('date', new Date().getFullYear() + '-01-01').order('date', { ascending: false });
  return data ?? [];
}

export async function updateTransactionCategory(id, category) {
  await _db.from('transactions').update({ category }).eq('id', id);
}

export async function createTransaction({ date, description, amount, type, category, source }) {
  const { data, error } = await _db.from('transactions').insert({ date, description, amount, type, category, source }).select();
  return { data, error };
}

export async function updateTransaction(id, { date, description, amount, type, category }) {
  await _db.from('transactions').update({ date, description, amount, type, category }).eq('id', id);
}

export async function deleteTransaction(id) {
  await _db.from('transactions').delete().eq('id', id);
}

// ─── Proyectos ────────────────────────────────────────────────────────────────

export async function createProject({ title, area_id, next_action, ia_context }) {
  const { data } = await _db.from('projects').insert({
    title, area_id: area_id || null, next_action: next_action || null,
    ia_context: ia_context || null, status: 'active',
  }).select().single();
  return data;
}

export async function updateProject(id, patch) {
  await _db.from('projects').update(patch).eq('id', id);
}

// ─── Eventos ──────────────────────────────────────────────────────────────────

export async function createEvento({ project_id, area_id, origen, texto, herramienta, resumen, resultado_ubicacion }) {
  const { data } = await _db.from('eventos').insert({
    project_id: project_id || null, area_id: area_id || null,
    origen: origen || 'manual', texto, herramienta: herramienta || null,
    resumen: resumen || null, resultado_ubicacion: resultado_ubicacion || null,
  }).select().single();
  return data;
}

// ─── Alertas ──────────────────────────────────────────────────────────────────

export async function dismissAlerta(id) {
  await _db.from('alertas').update({ status: 'dismissed' }).eq('id', id);
}
