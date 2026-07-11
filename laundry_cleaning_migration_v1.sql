-- ═══════════════════════════════════════════════════════════════════════════
-- Laundry & Cleaning Form — módulo vivo. Fuente de verdad en Supabase.
-- El PDF oficial ("Laundry & Cleaning Form - All fleet 2023") es solo una
-- exportación bajo demanda (mismo patrón que HOTO e Inventario).
-- Ejecutar en el SQL editor de Supabase. Idempotente.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS vj_laundry_cleaning_records (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tail_number              TEXT,
  icao                     TEXT,
  service_date             TEXT,                       -- texto libre, tal cual va al PDF (campo "Date")
  ch_name                  TEXT,
  ch_contact_number        TEXT,
  ch_email_address         TEXT,
  expected_departure_date  TEXT,
  -- Las ~150 celdas de cantidad del PDF (6 secciones × hasta 20 filas × Given/Received).
  -- Una columna por celda sería absurdo; se modelan como un único blob, igual que
  -- vj_hoto_records.shopping / .cabin_care. Forma por item_id (catálogo fijo, ver
  -- laundryCleaning/fieldMap.js — no son filas añadidas libremente por la usuaria):
  --   ítem normal:  { "given": number|null, "received": number|null }
  --   fila "Other:" (una por sección, 6 en total; el PDF solo tiene UNA celda ancha,
  --                  sin columna Received): { "given": number|null, "note": text|null }
  items                    JSONB DEFAULT '{}'::jsonb,
  additional_comments      TEXT,
  status                   TEXT DEFAULT 'active',       -- active | delivered (igual criterio que vj_hoto_records)
  source_template          TEXT DEFAULT 'Laundry_Cleaning_Form_official_v1.pdf',
  created_at               TIMESTAMPTZ DEFAULT now(),
  updated_at               TIMESTAMPTZ DEFAULT now()
);

-- Consistente con el resto de LIFEOS: RLS off (acceso por service key / anon key)
ALTER TABLE vj_laundry_cleaning_records DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_laundry_cleaning_records_status ON vj_laundry_cleaning_records(status);
