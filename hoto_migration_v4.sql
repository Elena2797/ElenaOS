-- ═══════════════════════════════════════════════════════════════════════════
-- HOTO v4 — correlación con el avión operativo actual (DECISIONS.md D13).
-- Aditiva e idempotente: no toca ninguna fila existente. Ejecutar en el SQL
-- editor de Supabase.
--
-- Contexto: hasta ahora nada impedía que existiera más de un HOTO
-- status='active' para la misma matrícula a la vez (no había índice que lo
-- evitara). El código de aplicación (isabel-api/src/hoto/data.js,
-- getActiveHoto) ya maneja ese caso de forma fail-closed (lo detecta y lo
-- reporta como ambiguo, nunca elige uno al azar) — este índice añade la
-- misma garantía a nivel de base de datos, para que ni siquiera dependa de
-- que el código de aplicación se comporte bien. Mismo patrón que el índice
-- parcial de `interventions` (interventions_migration_v1.sql).
--
-- Snapshot verificado antes de escribir esta migración (2026-08-06): un solo
-- HOTO real en producción, 9H-VCQ, status='active' — sin ningún conflicto
-- posible con este índice.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE UNIQUE INDEX IF NOT EXISTS idx_hoto_active_unique_tail
  ON vj_hoto_records (tail_number)
  WHERE status = 'active';

-- Reversible: DROP INDEX IF EXISTS idx_hoto_active_unique_tail;
