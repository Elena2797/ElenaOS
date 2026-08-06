Estado: este documento ES el estado — se reescribe en cada "Cerrar sesión de desarrollo" si algo cambió globalmente
Última verificación: 2026-08-06
Verificado en: bug real de divergencia Telegram↔LIFEOS diagnosticado y corregido en producción (D14) — vj_state reconciliado a una fila real en Supabase, vistajet_get_status verificado contra Supabase real, verificación manual en navegador incluyendo una escritura de Telegram simulada con la app ya abierta; 187/187 tests isabel-api; commits desplegados en Railway (isabel-api) y Vercel (life-os-app) vía push a main
Fuente de verdad de datos: ninguna (agrega, no duplica DATA_MODEL)

# CURRENT_STATE.md — Fotografía del proyecto, ahora

Una página. Solo 5 campos. Detalle de un módulo → `modules/*.md`. Handoff de la última sesión (qué se hizo justo antes, qué archivos tocar) → `NEXT_SESSION.md`, que complementa a este documento, no lo duplica.

## Estado general del proyecto
**Isabel sigue real y funcionando 24/7 por Telegram** (sin cambios desde la sesión anterior). Horas después de cerrar VistaJet como dominio operativo (D13), la usuaria reportó un bug real de producción: le dijo a Isabel por Telegram que había cambiado de avión (9H-VCQ → D-AFBS), Isabel lo confirmó correctamente, pero LIFEOS seguía mostrando el contexto completo del avión anterior como si fuera el actual. Se investigó la causa real en vez de parchear la pantalla: `vj_state` (documentada siempre como singleton) había acumulado 3 filas en producción por un `INSERT` sin guarda de idempotencia en `setup.sql`, y ninguna de las dos lecturas (frontend/backend) llevaba `ORDER BY` — Isabel y el frontend leían filas distintas de "la misma" tabla. Se reconcilió el dato real en Supabase, se corrigió la causa en código (ambos repos) y se generalizó la correlación por avión (que D13 solo había aplicado a HOTO vía `readiness.js`) a la pantalla viva de HOTO, Laundry & Cleaning e Inventario. Detalle completo en `DECISIONS.md` D14.

## Último deploy relevante
`isabel-api` en Railway: commit `ace560b` (sobre `6da89ef`), pusheado y desplegado el 2026-08-06 — orden explícito en `fetchVjState()` como defensa en profundidad, tests del bug real. `life-os-app` en Vercel: commit `d4e3f86` (sobre `3f2c5b7`), pusheado y desplegado el mismo día — reconciliación de `vj_state`, correlación por avión en HOTO/Laundry/Inventario, refresco automático al entrar al área VistaJet. `isabel-gateway` en Railway sin cambios esta sesión.

## Último commit importante
`isabel-api` `ace560b` — "fix(vistajet): order vj_state reads explicitly to defend the singleton invariant (D14)". `life-os-app` `d4e3f86` — "fix(vistajet): fix Telegram<->LIFEOS divergence — vj_state singleton + aircraft-scoped HOTO/Inventory/Laundry (D14)", incluye `vj_state_singleton_migration_v1.sql` (nuevo, pendiente de ejecución manual).

## Bloqueos actuales
Ninguno operativo — el bug quedó corregido y verificado en producción. Queda **una acción manual pendiente, no bloqueante**: ejecutar `vj_state_singleton_migration_v1.sql` en el SQL editor de Supabase (añade el índice único que hace estructuralmente imposible que `vj_state` vuelva a tener más de una fila — hoy la garantía es solo la reconciliación puntual + el `ORDER BY` defensivo en código). Mismo patrón que `hoto_migration_v4.sql` (D13), también sigue pendiente.

## Siguiente objetivo
Ejecutar `vj_state_singleton_migration_v1.sql` (y, ya que se entra al SQL editor, también `hoto_migration_v4.sql` si sigue sin correr — comprobarlo primero). Verificar la primera ejecución real del cron de sueño de las 08:00 del 2026-08-07 (pendiente desde la sesión anterior, sin cambios). Rotar `ANTHROPIC_API_KEY` (`SECURITY.md` riesgo #9) — sigue sin rotar. Revisar `SECURITY.md` riesgo #10 (secretos en texto plano en el volumen de `isabel-gateway`) y el hallazgo re-confirmado esta sesión de que el remoto `origin` de `life-os-app` sigue teniendo un token de GitHub en texto plano en la URL (ya documentado en `SECURITY.md`, no es nuevo, pero se re-observó al pushear). Hilos sin tocar de sesiones anteriores: "Gym" no aparece en Dominios; investigación de JETMI en pausa (`research/JETMI/LOG.md` § 6).
