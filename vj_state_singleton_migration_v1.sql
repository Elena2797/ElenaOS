-- ═══════════════════════════════════════════════════════════════════════════
-- vj_state singleton — invariante real a nivel de base de datos (DECISIONS.md D14).
-- Ejecutar en el SQL editor de Supabase.
--
-- Contexto: vj_state siempre se documentó y se leyó como singleton (una sola
-- fila, "el estado operacional actual"), pero nada en el esquema lo impedía.
-- setup.sql tenía un INSERT incondicional que, al re-ejecutarse más de una
-- vez contra el mismo proyecto, acumuló 3 filas en producción sin que nadie
-- lo notara. Como ninguna de las dos lecturas (frontend en
-- life-os-app/src/services/db.js, backend en
-- isabel-api/src/core/specialists/vistajet.js) llevaba ORDER BY, Postgres no
-- garantizaba qué fila devolvía "primero" — Isabel (por Telegram) actualizó
-- una fila y el frontend, en la siguiente carga, leyó otra. Resultado real
-- observado el 2026-08-06: Isabel confirmó "avión actualizado a D-AFBS" pero
-- LIFEOS seguía mostrando el contexto completo de 9H-VCQ (rotación, HOTO,
-- inventario) como si fuera el actual.
--
-- Ya reconciliado a mano antes de esta migración (2026-08-06): las 2 filas
-- sobrantes de vj_state se borraron (no tenían ningún dato que la fila
-- superviviente no tuviera ya), dejando exactamente 1 fila. Este índice
-- convierte esa reconciliación puntual en una garantía permanente: con él,
-- una segunda fila en vj_state no puede llegar a existir aunque algún script
-- futuro (p.ej. una reejecución de setup.sql) lo intente — fallará con un
-- error de restricción única en vez de acumularse en silencio otra vez.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE UNIQUE INDEX IF NOT EXISTS idx_vj_state_singleton
  ON vj_state ((true));

-- Reversible: DROP INDEX IF EXISTS idx_vj_state_singleton;
