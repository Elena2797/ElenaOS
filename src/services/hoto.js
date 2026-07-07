// hoto.js — módulo HOTO (Handover / Takeover) en el cliente.
// Único punto de acceso a las tablas vj_hoto_*. La exportación del PDF oficial
// se hace en el servidor (Isabel API); aquí solo el CRUD del modelo vivo.

let _db = null;
export function setClient(client) { _db = client; }

// ── Record activo ──────────────────────────────────────────────────────────
export async function loadActiveHoto() {
  const { data, error } = await _db
    .from('vj_hoto_records')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function createHoto(fields = {}) {
  const { data, error } = await _db
    .from('vj_hoto_records')
    .insert({
      tail_number: fields.tail_number ?? null,
      aircraft_status: fields.aircraft_status ?? 'Good',
      icao: fields.icao ?? null,
      pattern: fields.pattern ?? null,
      ch_code: fields.ch_code ?? null,
      ch_column_index: fields.ch_column_index ?? 0,
      received_date: fields.received_date ?? null,
      days_on_aircraft: fields.days_on_aircraft ?? null,
      has_prior_hoto: fields.has_prior_hoto ?? false,
      status: 'active',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateHoto(id, patch) {
  const { error } = await _db
    .from('vj_hoto_records')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

// ── Items: defects / comments / offload ──────────────────────────────────────
export async function loadItems(hoto_id) {
  const { data, error } = await _db
    .from('vj_hoto_items')
    .select('*')
    .eq('hoto_id', hoto_id)
    .order('section')
    .order('position');
  if (error) throw error;
  return data ?? [];
}

export async function addItem(hoto_id, section, content) {
  const { data, error } = await _db
    .from('vj_hoto_items')
    .insert({ hoto_id, section, content: String(content).trim(), position: Date.now() % 100000, source: 'manual' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteItem(id) {
  const { error } = await _db.from('vj_hoto_items').delete().eq('id', id);
  if (error) throw error;
}

// Borra TODAS las líneas de una sección de UN hoto (reset por sección).
// Acotado por hoto_id + section: nunca puede tocar otro HOTO ni otras tablas.
export async function deleteSectionItems(hoto_id, section) {
  const { error } = await _db
    .from('vj_hoto_items')
    .delete()
    .eq('hoto_id', hoto_id)
    .eq('section', section);
  if (error) throw error;
}
