-- HOTO v2: fecha de entrega planificada.
-- La usa Aircraft Readiness para calibrar la fase de la rotación
-- (sin ella, Isabel lo dice explícitamente y no asume ninguna fase).
ALTER TABLE vj_hoto_records ADD COLUMN IF NOT EXISTS delivery_date DATE;
