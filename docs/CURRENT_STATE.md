Estado: este documento ES el estado — se reescribe en cada "Cerrar sesión de desarrollo" si algo cambió globalmente
Última verificación: 2026-08-07
Verificado en: auditoría arquitectónica completa (tres agentes en paralelo: canales de Isabel, frontend completo, backend/model routing/priority engine) + tres cambios implementados y verificados en navegador contra Supabase de producción real (D18/D19/D20) — sin tests automatizados nuevos porque los cambios son de frontend puro (JS/HTML/CSS), verificados por inspección directa del DOM y ausencia de errores de consola
Fuente de verdad de datos: ninguna (agrega, no duplica DATA_MODEL)

# CURRENT_STATE.md — Fotografía del proyecto, ahora

Una página. Solo 5 campos. Detalle de un módulo → `modules/*.md`. Handoff de la última sesión (qué se hizo justo antes, qué archivos tocar) → `NEXT_SESSION.md`, que complementa a este documento, no lo duplica.

## Estado general del proyecto
**Isabel sigue real y funcionando 24/7 por Telegram, y LIFEOS ya tiene una sola prioridad, una sola cola de trabajo y una sola voz de Isabel.** Esta sesión fue una auditoría arquitectónica completa pedida por la usuaria ("consolidar LIFEOS como sistema operativo personal, Isabel como su única capa conversacional"), en dos tandas y siete decisiones (D18-D24), distinta del trabajo de VistaJet de D13-D17. Lo que cambió de fondo: **(1) queda establecido cuál es la Isabel real** — `isabel-gateway`+Telegram+MCP, con `lifeos-agent` confirmado abandonado y el bridge local declarado LEGACY/FROZEN; **(2) el frontend dejó de decidir** — antes había cuatro cálculos independientes de "qué merece atención" en Home (que podían señalar dominios distintos a la vez) y dos colas de trabajo distintas entre Home y Avanzar; ahora el Core decide y el frontend solo representa (o declara honestamente que no hay decisión disponible), incluyendo el estado por dominio; **(3) ON/OFF significa algo** — es el ciclo laboral de la usuaria, nunca el estado del avión, y entra al priority engine como contexto de desempate sin poder saltarse nunca el rango de la evidencia real; **(4) desapareció el ruido** — metadatos técnicos visibles que además estaban desincronizados del proyecto real, una "voz de Isabel" falsa en Avanzar, un FAB duplicado, un botón que devolvía a Inicio, y un dominio entero (Gym) invisible por un bug. VistaJet (D13-D17, HOTO de D-AFBS en Generación 2) sin cambios funcionales. El resto de dominios siguen sin specialist propio salvo Salud (sueño) — Gym sigue siendo pantalla visible, no dominio vivo.

## Último deploy relevante
**Todo desplegado y verificado en producción.** `isabel-api` en Railway: commit `a3ffae1` (D21 + fix de jerga) — verificado con `curl` real contra `isabel-api-production`: devuelve `life_mode:'ON'`, `jargon_check:{ok:true}` y la prioridad correcta. `life-os-app` en Vercel: commit `1ebf6f7` (D18-D20, D22, D24) — verificado inspeccionando el bundle realmente servido (código nuevo presente, heurístico de cliente ausente) y funcionalmente en el navegador con viewport móvil, tras limpiar service worker y cachés. `isabel-gateway` en Railway sin cambios.

## Último commit importante
`isabel-api` `a3ffae1`, `life-os-app` `1ebf6f7`. Historial completo de D18-D24 visible en `git log` de ambos repos.

## Bloqueos actuales
Ninguno técnico en LIFEOS. **Una decisión de infraestructura pendiente de la usuaria (D23)**, que bloquea el trabajo de mayor valor restante: para que la pestaña Isabel de LIFEOS hable con el mismo agente que Telegram, `isabel-api` tiene que poder alcanzar a `isabel-gateway` — hoy imposible porque están en proyectos Railway distintos y el Gateway corre con `bind:"loopback"`. Recomendación registrada: mover `isabel-gateway` al proyecto de `isabel-api` y usar private networking, que no expone nada nuevo a internet. Ninguna migración SQL pendiente (sin cambios de esquema en toda la sesión).

## Siguiente objetivo
Continuar el refactor donde se quedó: presentación de VistaJet y JETMI dentro de su vista de área (D24 solo tocó Home, Dominios y Avanzar), el botón `+`, y dos restos ya detectados — `dashboardView()` es una vista huérfana sin punto de entrada, y las tarjetas "eLearnings" y "Facturas" ejecutan ambas la misma acción genérica. Si la usuaria resuelve la decisión de D23, eso desbloquea la unificación real del chat. Pendientes de fondo sin cambios: cron de sueño de las 08:00, rotación de `ANTHROPIC_API_KEY` (`SECURITY.md` riesgo #9), `SECURITY.md` riesgo #10, token de GitHub en texto plano en el remoto de `life-os-app`.
