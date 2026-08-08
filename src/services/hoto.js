// hoto.js — módulo HOTO (Handover / Takeover) en el cliente.
// Único punto de acceso a las tablas vj_hoto_*. La exportación del PDF oficial
// se hace en el servidor (Isabel API); aquí solo el CRUD del modelo vivo.

let _db = null;
export function setClient(client) { _db = client; }

// ── Record activo ──────────────────────────────────────────────────────────
//
// El HOTO "actual" es el que corresponde al avión operativo actual
// (vj_state.aircraft), no simplemente el active más reciente — mismo principio
// aplicado en isabel-api/src/hoto/data.js (DECISIONS.md D13). Si hay más de un
// active para esa matrícula, no se adivina cuál usar: se devuelve
// { ambiguous: true, matches } igual que el backend.
//
// SIN matrícula devuelve null, NO "el más reciente de cualquier avión" (D34).
// Ese fallback era la última puerta abierta de la familia D14/D15/D28: en el
// momento en que Estefanía entrega el avión (`status: libre` → `aircraft:
// null`), TODOS los llamadores pasaban `undefined` y Readiness volvía a
// mostrar el HOTO, el inventario y la lavandería del avión anterior como si
// fueran los de ahora — exactamente el síntoma que D15 corrigió por otras
// rutas. Sin avión actual no hay dato actual: eso es la respuesta correcta,
// no un vacío que haya que rellenar.
export async function loadActiveHoto(tailNumber) {
  if (!tailNumber) return null;

  const { data, error } = await _db
    .from('vj_hoto_records')
    .select('*')
    .eq('status', 'active')
    .eq('tail_number', tailNumber)
    .order('created_at', { ascending: false });
  if (error) throw error;

  if (!data || data.length === 0) return null;
  if (data.length > 1) return { ambiguous: true, matches: data };
  return data[0];
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
