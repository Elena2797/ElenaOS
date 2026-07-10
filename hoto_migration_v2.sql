-- HOTO v2: checklist de Daily Duties persistente.
-- Guarda los ticks del checklist (Galley/Cabin/Washroom/Stock) de la CH actual.
-- Formato: { "g1": true, "c3": true, ... } (item_id → bool).
-- ADITIVA e idempotente: las filas existentes reciben '{}' automáticamente,
-- no se modifica ni se recrea ningún dato del HOTO.
ALTER TABLE vj_hoto_records
  ADD COLUMN IF NOT EXISTS daily_duties JSONB NOT NULL DEFAULT '{}';
