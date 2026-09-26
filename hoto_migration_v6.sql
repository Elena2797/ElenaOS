-- ═══════════════════════════════════════════════════════════════════════════
-- HOTO v6 — información PROVISIONAL de un avión antes de tener su HOTO
-- (issue 4 de 2026-09-26). Ella empieza rotación sin HOTO ni inventario oficial
-- pero ya revisa cosas (revistas, defectos…). Esa información vive aquí, por
-- matrícula, y al importar el HOTO oficial se CONTRASTA (nunca se sobrescribe).
--
-- ADITIVA: tabla nueva, no toca vj_hoto_records ni sus estados, así que
-- getActiveHoto y todo lo existente siguen igual.
-- status: pending → confirmed | not_in_hoto | review → migrated | dismissed
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS vj_pre_hoto_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tail_number text NOT NULL,
  category text NOT NULL CHECK (category IN ('defect','offload','comment','magazine','other')),
  content text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','not_in_hoto','review','migrated','dismissed')),
  hoto_id uuid REFERENCES vj_hoto_records(id),
  reconcile_detail text,
  created_at timestamptz NOT NULL DEFAULT now(),
  reconciled_at timestamptz
);
CREATE INDEX IF NOT EXISTS vj_pre_hoto_notes_tail_idx ON vj_pre_hoto_notes (tail_number, status);
ALTER TABLE vj_pre_hoto_notes ENABLE ROW LEVEL SECURITY;
-- Sin políticas: solo la clave de servicio (isabel-api) accede, como el resto (D62).
