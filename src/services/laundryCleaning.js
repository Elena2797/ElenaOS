// laundryCleaning.js — módulo Laundry & Cleaning Form en el cliente.
// Único punto de acceso a vj_laundry_cleaning_records. La exportación del PDF
// oficial se hace en el servidor (Isabel API); aquí solo el CRUD del modelo vivo.

let _db = null;
export function setClient(client) { _db = client; }

// Mismo patrón que hoto.js (D13): sin tailNumber, comportamiento histórico
// (el active más reciente). Con tailNumber, el formulario "actual" es el que
// corresponde al avión operativo actual (vj_state.aircraft) — nunca el de
// otro avión, aunque sea el más reciente. Ambiguo (>1 active para la misma
// matrícula) se reporta en vez de adivinar, igual que HOTO.
export async function loadActiveLaundryCleaning(tailNumber) {
  if (!tailNumber) {
    const { data, error } = await _db
      .from('vj_laundry_cleaning_records')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);
    if (error) throw error;
    return data?.[0] ?? null;
  }

  const { data, error } = await _db
    .from('vj_laundry_cleaning_records')
    .select('*')
    .eq('status', 'active')
    .eq('tail_number', tailNumber)
    .order('created_at', { ascending: false });
  if (error) throw error;

  if (!data || data.length === 0) return null;
  if (data.length > 1) return { ambiguous: true, matches: data };
  return data[0];
}

export async function createLaundryCleaning(fields = {}) {
  const { data, error } = await _db
    .from('vj_laundry_cleaning_records')
    .insert({
      tail_number: fields.tail_number ?? null,
      icao: fields.icao ?? null,
      service_date: fields.service_date ?? null,
      status: 'active',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateLaundryCleaning(id, patch) {
  const { error } = await _db
    .from('vj_laundry_cleaning_records')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}
