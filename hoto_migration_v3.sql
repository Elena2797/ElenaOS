-- HOTO v3: Focus of the Month (texto + confirmación de completado).
-- Corresponde a los campos oficiales del PDF "Input Monthly Focus" y
-- "Tick to confirm focus completed" (página 3 del template).
-- ADITIVA e idempotente: las filas existentes reciben NULL/false automáticamente,
-- no se modifica ni se recrea ningún dato del HOTO.
ALTER TABLE vj_hoto_records
  ADD COLUMN IF NOT EXISTS monthly_focus TEXT,
  ADD COLUMN IF NOT EXISTS monthly_focus_completed BOOLEAN NOT NULL DEFAULT false;
