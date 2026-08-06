-- ═══════════════════════════════════════════════════════════════════════════
-- HOTO v5 — el HOTO deja de representar UNA columna y pasa a representar las
-- 6 columnas de handover reales del PDF oficial (DECISIONS.md D16).
--
-- Contexto: el PDF oficial admite hasta 6 CH (columnas de handover) por
-- documento, pero el modelo solo tenía campos ESCALARES para una sola
-- (`ch_code`, `received_date`, `days_on_aircraft`, `daily_duties`), y
-- `pdfExport.js` limpiaba explícitamente las otras 5 en cada export. Eso hacía
-- literalmente imposible el caso real "recibo un HOTO con las columnas 1-4 ya
-- usadas, las conservo, y yo empiezo en la 5" — el dato no tenía dónde vivir.
--
-- Cambio: `columns` jsonb pasa a ser la fuente de verdad de las columnas —
-- un array de hasta 6 objetos
--   { ch_code, received_date, days_on_aircraft, duties: { item_id: true } }
-- posicionales (índice = columna del PDF). `ch_column_index` (ya existía)
-- sigue indicando cuál de ellas es la de la CH actual.
--
-- ADITIVA Y NO DESTRUCTIVA: no borra ni modifica ninguna columna existente.
-- Los campos escalares antiguos se CONSERVAN tal cual (no se hace DROP) — el
-- backfill de abajo copia su contenido a `columns` sin tocarlos, así que si
-- algo saliera mal el dato original sigue intacto y la migración se puede
-- revertir borrando solo las columnas nuevas.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE vj_hoto_records ADD COLUMN IF NOT EXISTS columns jsonb DEFAULT '[]'::jsonb;

-- Generación lógica: "nuevo HOTO desde este" crea una generación nueva que
-- hereda los datos persistentes del anterior. `generation` las ordena;
-- `superseded_by` enlaza el histórico con quien lo reemplazó (nunca se borra
-- el anterior, solo deja de ser el activo).
ALTER TABLE vj_hoto_records ADD COLUMN IF NOT EXISTS generation int DEFAULT 1;
ALTER TABLE vj_hoto_records ADD COLUMN IF NOT EXISTS superseded_by uuid REFERENCES vj_hoto_records(id);
ALTER TABLE vj_hoto_records ADD COLUMN IF NOT EXISTS imported_at timestamptz;
ALTER TABLE vj_hoto_records ADD COLUMN IF NOT EXISTS source_filename text;

-- Backfill: copia los campos escalares actuales a la columna que indica
-- ch_column_index, dejando el resto de posiciones vacías. Idempotente —
-- solo actúa sobre filas cuyo `columns` sigue vacío, así que reejecutarla no
-- duplica ni sobrescribe nada.
UPDATE vj_hoto_records
SET columns = (
  SELECT jsonb_agg(
    CASE WHEN i = COALESCE(ch_column_index, 0)
      THEN jsonb_build_object(
        'ch_code', COALESCE(ch_code, ''),
        'received_date', COALESCE(received_date, ''),
        'days_on_aircraft', COALESCE(days_on_aircraft, ''),
        'duties', COALESCE(daily_duties, '{}'::jsonb)
      )
      ELSE jsonb_build_object('ch_code', '', 'received_date', '', 'days_on_aircraft', '', 'duties', '{}'::jsonb)
    END
    ORDER BY i
  )
  FROM generate_series(0, 5) AS i
)
WHERE columns IS NULL OR columns = '[]'::jsonb;

-- Reversible:
--   ALTER TABLE vj_hoto_records DROP COLUMN IF EXISTS columns;
--   ALTER TABLE vj_hoto_records DROP COLUMN IF EXISTS generation;
--   ALTER TABLE vj_hoto_records DROP COLUMN IF EXISTS superseded_by;
--   ALTER TABLE vj_hoto_records DROP COLUMN IF EXISTS imported_at;
--   ALTER TABLE vj_hoto_records DROP COLUMN IF EXISTS source_filename;
-- (los campos escalares originales nunca se tocaron, así que revertir es completo)
