// laundryCleaning.js — módulo Laundry & Cleaning Form en el cliente.
// Único punto de acceso a vj_laundry_cleaning_records. La exportación del PDF
// oficial se hace en el servidor (Isabel API); aquí solo el CRUD del modelo vivo.

let _db = null;
export function setClient(client) { _db = client; }

export async function loadActiveLaundryCleaning() {
  const { data, error } = await _db
    .from('vj_laundry_cleaning_records')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) throw error;
  return data?.[0] ?? null;
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
