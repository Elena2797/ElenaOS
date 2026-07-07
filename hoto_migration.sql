-- ═══════════════════════════════════════════════════════════════════════════
-- HOTO — módulo vivo (Handover / Takeover). Fuente de verdad en Supabase.
-- El PDF oficial es solo una exportación (igual que Inventario → Excel).
-- Ejecutar en el SQL editor de Supabase. Idempotente.
-- ═══════════════════════════════════════════════════════════════════════════

-- Cabecera + columna del CH actual + estado del handover
CREATE TABLE IF NOT EXISTS vj_hoto_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tail_number       TEXT,
  aircraft_status   TEXT,                       -- Good | Bad | Requires Attention
  icao              TEXT,
  pattern           TEXT,                       -- Summer - P2 | Winter - P1
  ch_code           TEXT,
  ch_column_index   INT  DEFAULT 0,             -- columna 0..5 del CH en el PDF
  received_date     TEXT,                       -- texto libre, tal cual va al PDF
  days_on_aircraft  TEXT,
  has_prior_hoto    BOOLEAN DEFAULT false,       -- ¿existía HOTO al recibir el avión?
  shopping          JSONB DEFAULT '{}'::jsonb,   -- { almond_milk, evian, volvic, herbs, magazines }
  cabin_care        JSONB DEFAULT '[]'::jsonb,   -- fechas en orden visual del PDF
  status            TEXT DEFAULT 'active',       -- active | delivered
  source_template   TEXT DEFAULT 'HOTO_official_v1.pdf',
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  delivered_at      TIMESTAMPTZ
);

-- Líneas de defects / comments / offload — módulo vivo: se añaden y editan sueltas
CREATE TABLE IF NOT EXISTS vj_hoto_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hoto_id    UUID NOT NULL REFERENCES vj_hoto_records(id) ON DELETE CASCADE,
  section    TEXT NOT NULL,                      -- defect | comment | offload
  position   INT  DEFAULT 0,
  content    TEXT NOT NULL,
  source     TEXT DEFAULT 'manual',              -- manual | inventory | defects_module
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Consistente con el resto de LIFEOS: RLS off (acceso por service key / anon key)
ALTER TABLE vj_hoto_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE vj_hoto_items   DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_hoto_records_status ON vj_hoto_records(status);
CREATE INDEX IF NOT EXISTS idx_hoto_items_hoto     ON vj_hoto_items(hoto_id, section, position);
