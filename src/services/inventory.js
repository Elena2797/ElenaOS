// inventory.js — módulo Inventario VistaJet
// Único punto de acceso a las tablas vj_inventory_*
// No modifica ninguna otra tabla de LifeOS.

import * as XLSX from 'xlsx';

let _db = null;

export function setClient(client) {
  _db = client;
}

// ─── Sesiones ─────────────────────────────────────────────────────────────────

export async function createSession({ aircraft_registration, aircraft_type, session_date, source_filename, column_map }) {
  const { data, error } = await _db.from('vj_inventory_sessions').insert({
    aircraft_registration: aircraft_registration.trim().toUpperCase(),
    aircraft_type: aircraft_type.trim().toUpperCase(),
    session_date: session_date || new Date().toISOString().slice(0, 10),
    status: 'open',
    source_filename: source_filename || null,
    column_map: column_map || null,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function uploadTemplate(file, filename) {
  const { error } = await _db.storage
    .from('inventory-templates')
    .upload(filename, file, { upsert: true, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  if (error) throw error;
}

export async function loadActiveSession() {
  const { data, error } = await _db
    .from('vj_inventory_sessions')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) throw error;
  return data?.[0] ?? null;
}

// Última sesión en cualquier estado (open o closed). Solo lectura — la usa
// Aircraft Readiness para evaluar la evidencia de inventario.
export async function loadLastSession() {
  const { data, error } = await _db
    .from('vj_inventory_sessions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function closeSession(id) {
  await _db.from('vj_inventory_sessions').update({
    status: 'closed',
    closed_at: new Date().toISOString(),
  }).eq('id', id);
}

// ─── Ítems ────────────────────────────────────────────────────────────────────

export async function bulkInsertItems(session_id, items) {
  const rows = items.map(item => ({
    session_id,
    code: item.code,
    description: item.description,
    category: item.category || '',
    std_qty: item.std_qty ?? 0,
    received_qty: item.received_qty ?? 0,
    current_qty: item.received_qty ?? 0,
    req_qty: item.req_qty ?? 0,
    verified: false,
    discrepancy: false,
    source: 'excel',
    source_sheet: item.source_sheet || null,
    source_row:   item.source_row   || null,
  }));

  // Supabase acepta hasta ~1000 filas por request; partimos en batches de 200
  const BATCH = 200;
  for (let i = 0; i < rows.length; i += BATCH) {
    const { error } = await _db.from('vj_inventory_session_items').insert(rows.slice(i, i + BATCH));
    if (error) throw error;
  }
}

export async function loadSessionItems(session_id) {
  const { data, error } = await _db
    .from('vj_inventory_session_items')
    .select('*')
    .eq('session_id', session_id)
    .order('category')
    .order('description');
  if (error) throw error;
  return data ?? [];
}

export async function updateItem(id, patch) {
  const { error } = await _db.from('vj_inventory_session_items').update({
    ...patch,
    updated_at: new Date().toISOString(),
  }).eq('id', id);
  if (error) throw error;
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export async function saveChat({ session_id, role, content, intent, resolved_item_id }) {
  const { data, error } = await _db.from('vj_inventory_chat').insert({
    session_id,
    role,
    content,
    intent: intent || null,
    resolved_item_id: resolved_item_id || null,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function getChatHistory(session_id, limit = 20) {
  const { data, error } = await _db
    .from('vj_inventory_chat')
    .select('*')
    .eq('session_id', session_id)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).reverse();
}

// ─── Estadísticas (puro JS, sin SQL) ─────────────────────────────────────────

export function getSessionStats(items) {
  const total = items.length;
  const verified = items.filter(i => i.verified).length;
  const discrepancies = items.filter(i => i.discrepancy).length;
  const pending = total - verified;
  return { total, verified, pending, discrepancies };
}

// ─── Parser de Excel .xlsx ────────────────────────────────────────────────────

export function parseXlsx(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array' });

        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

        // Detectar columnMap desde la fila de header (índice 3 = fila 4 en Excel)
        const columnMap = detectColumnMap(rows[3] || []);

        const items = [];
        let currentCategory = '';

        // Datos empiezan en fila 5 (índice 4), fila 4 es el header
        for (let i = 4; i < rows.length; i++) {
          const code = String(rows[i][0] ?? '').trim();
          const desc = String(rows[i][1] ?? '').trim();
          const stdQ = rows[i][2];
          const actQ = rows[i][3];
          const reqQ = rows[i][4];

          if (!code && !desc) continue;

          if (!code && desc) {
            currentCategory = desc;
            continue;
          }

          if (code && desc) {
            items.push({
              code,
              description: desc,
              category: currentCategory,
              std_qty: parseNum(stdQ),
              received_qty: parseNum(actQ),
              req_qty: parseNum(reqQ),
              source_sheet: sheetName,
              source_row: i + 1,   // Excel es 1-based
            });
          }
        }

        resolve({ items, sheetName, columnMap, total: items.length });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Error leyendo el archivo'));
    reader.readAsArrayBuffer(file);
  });
}

function detectColumnMap(headerRow) {
  const map = {};
  headerRow.forEach((cell, idx) => {
    const h = String(cell).toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
    if (h.includes('code'))                              map.code = idx;
    if (h.includes('desc'))                              map.description = idx;
    if (h.includes('std') || h.includes('standard'))     map.std_qty = idx;
    if (h.includes('receiv') || h === 'actual qty')      map.received_qty = idx;
    if (h.includes('current'))                           map.current_qty = idx;
    if (h.includes('req'))                               map.req_qty = idx;
    if (h.includes('verif'))                             map.verified = idx;
    if (h.includes('discrepan'))                         map.discrepancy = idx;
    if (h.includes('note'))                              map.notes = idx;
  });
  // Si no hay columna "current qty" explícita, usar la columna received como destino de escritura
  if (map.current_qty === undefined && map.received_qty !== undefined) {
    map.current_qty = map.received_qty;
  }
  return map;
}

function parseNum(v) {
  if (v === '' || v === null || v === undefined) return 0;
  const n = parseFloat(String(v).replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

