Estado: este documento ES el estado — se reescribe en cada "Cerrar sesión de desarrollo" si algo cambió globalmente
Última verificación: 2026-08-05
Verificado en: commits 96b0d5f (isabel-api, sin push) — sin cambios en life-os-app desde af9c899; auditoría read-only de OpenClaw v2026.6.10 + dos experimentos locales en perfil dev aislado, ver CHANGELOG.md
Fuente de verdad de datos: ninguna (agrega, no duplica DATA_MODEL)

# CURRENT_STATE.md — Fotografía del proyecto, ahora

Una página. Solo 5 campos. Detalle de un módulo → `modules/*.md`. Handoff de la última sesión (qué se hizo justo antes, qué archivos tocar) → `NEXT_SESSION.md`, que complementa a este documento, no lo duplica.

## Estado general del proyecto
LIFEOS en producción y en uso real diario, sin cambios en `life-os-app`/frontend desde el 2026-08-03. Lo nuevo esta sesión vive todo en `isabel-api` y en decisiones de arquitectura, **sin desplegar todavía**. Dos piezas distintas: (1) **Salud gana su primer especialista real**, sueño — dos tablas nuevas (`checkins`, `interventions`), parser determinista de duración en lenguaje natural, y dos tools MCP (`health_get_sleep_status`/`health_register_sleep`), construidas, testeadas y validadas manualmente contra Supabase real, commiteadas en `isabel-api` `96b0d5f` — **pero ese commit no está pusheado**. (2) **Se aprobó y se validó parcialmente una arquitectura de runtime autónomo**: OpenClaw pasa a ser el motor que ejecutará el ciclo cron→agente→tools MCP→canal de entrega, mientras LIFEOS/`isabel-api` sigue siendo la única fuente de verdad. Ver `DECISIONS.md` D10 y `core/AUTOMATIONS.md` para el detalle completo, incluidos dos hallazgos de un spike local (Control UI de cron funciona; el turno de agente aislado disparado por ese cron no arranca, causa sin investigar todavía). Isabel Core (`GET /v1/now`, tarjeta "ISABEL · AHORA") sigue como se dejó el 2026-08-03, sin cambios. El resto de áreas (JETMI, Finanzas, Gym, Marca Personal, Vida Personal) siguen sin lógica de dominio propia.

## Último deploy relevante
Ninguno esta sesión. El último deploy real sigue siendo el del 2026-08-03: `isabel-api` en Railway (`2a7b525`) y `life-os-app` en Vercel (`da840cc`) — ver `CHANGELOG.md` 2026-08-03. El trabajo nuevo de sueño (`96b0d5f`) existe solo en local, no en Railway.

## Último commit importante
`96b0d5f` en `isabel-api` — vertical slice de Salud/sueño (tablas, parser, especialista, tools MCP, tests). **No pusheado** — el remoto sigue en el commit anterior. `life-os-app` sin commits nuevos esta sesión, sigue en `af9c899`. El único cambio en `life-os-app` de esta sesión es documentación (`DECISIONS.md` D10 + el resto de `/docs` actualizado al cerrar esta sesión), pendiente de commit separado.

## Bloqueos actuales
Dos, ninguno urgente, ambos deliberadamente sin resolver todavía:
1. `isabel-api/src/mcp.js` no tiene autenticación — bloqueante explícito antes de conectar cualquier Gateway remoto de OpenClaw a él (ver `SECURITY.md` riesgo #7).
2. El turno de agente aislado disparado por un cron de OpenClaw no arranca ("isolated agent setup timed out before runner start") — causa sin investigar, bloqueante para confiar en cron de OpenClaw en producción (ver `KNOWN_PROBLEMS.md`).

Ninguno de los dos bloquea trabajo pendiente de otras áreas — solo bloquean avanzar la Fase 3+ del plan de convergencia de OpenClaw.

## Siguiente objetivo
Ninguno iniciado automáticamente. Nada de lo construido esta sesión se despliega ni se pushea sin autorización explícita nueva de la usuaria — ni el commit `96b0d5f` de `isabel-api`, ni ningún paso adicional del plan de convergencia de OpenClaw (Fase 3 en adelante). Hilos sin tocar en esta sesión, de sesiones anteriores: "Gym" no aparece en Dominios (`KNOWN_PROBLEMS.md`); investigación de JETMI en pausa, próximo bloque decidido es Fase 1 dominio 1.2 Supply (`research/JETMI/LOG.md` § 6); confirmación pendiente de la usuaria sobre la prueba en iPhone de "ISABEL · AHORA" del 2026-08-03.
