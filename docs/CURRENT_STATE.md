Estado: este documento ES el estado — se reescribe en cada "Cerrar sesión de desarrollo" si algo cambió globalmente
Última verificación: 2026-08-06
Verificado en: turno de agente real verificado en producción vía `railway ssh` contra `isabel-gateway` (`stopReason=stop`, sin error) tras aplicar `DECISIONS.md` D11, commits c02d4cd y 7ab806f (isabel-api, pusheados), ver CHANGELOG.md
Fuente de verdad de datos: ninguna (agrega, no duplica DATA_MODEL)

# CURRENT_STATE.md — Fotografía del proyecto, ahora

Una página. Solo 5 campos. Detalle de un módulo → `modules/*.md`. Handoff de la última sesión (qué se hizo justo antes, qué archivos tocar) → `NEXT_SESSION.md`, que complementa a este documento, no lo duplica.

## Estado general del proyecto
LIFEOS en producción y en uso real diario, sin cambios en `life-os-app`/frontend desde el 2026-08-03. Todo lo nuevo vive en `isabel-api` (pusheado y desplegado) y en `isabel-gateway` (Railway). El bloqueo de auth que impedía que `isabel-gateway` completara turnos de agente reales quedó resuelto el 2026-08-06 — no arreglando el login OAuth de `claude-cli` dentro del contenedor (esa vía resultó ser arquitectónicamente incompatible con un contenedor efímero, confirmado leyendo el código fuente y la documentación oficial de OpenClaw), sino abandonando ese backend y cambiando a auth de API key (`ANTHROPIC_API_KEY`, ya configurada). Un turno de agente real completa correctamente ahora mismo, verificado en producción. Isabel Core (`GET /v1/now`, tarjeta "ISABEL · AHORA") sigue como se dejó el 2026-08-03, sin cambios. El resto de áreas (JETMI, Finanzas, Gym, Marca Personal, Vida Personal) siguen sin lógica de dominio propia.

## Último deploy relevante
`isabel-api` en Railway, commit `7ab806f` (incluye también `c02d4cd`) — MCP autenticado + correlación determinista de Interventions, ambos verificados en producción. `isabel-gateway` en Railway: config en vivo actualizada el 2026-08-06 (`agentRuntime: claude-cli` quitado de `agents.defaults.models["anthropic/claude-sonnet-4-6"]`) + `railway restart`, aplicado y verificado — turno de agente real completa. `life-os-app` en Vercel sigue en el commit del 2026-08-03 (`da840cc`), sin cambios de frontend esta sesión.

## Último commit importante
`isabel-api` `7ab806f` — resolución determinista de Interventions + migración `kind` en Supabase real. `isabel-gateway`: `de2ab5a` es el último commit en git (Dockerfile/entrypoint con fix de permisos de volumen); el cambio de auth de esta sesión (quitar `agentRuntime: claude-cli` de `openclaw.default.json` y `README.md`) está aplicado en el volumen de producción y en el working tree local, **pendiente de commit** — repo local, sin remoto en GitHub todavía. `life-os-app`: cambios de documentación esta sesión (`DECISIONS.md` D11, `CURRENT_STATE.md`, `NEXT_SESSION.md`, `KNOWN_PROBLEMS.md`, `core/AUTOMATIONS.md`), pendientes de commit.

## Bloqueos actuales
Ninguno técnico para tener un turno de agente real — resuelto esta sesión (ver `DECISIONS.md` D11, `core/AUTOMATIONS.md`). Lo que queda antes de cron diario y Telegram es trabajo de las Fases 5D/5E, no un bloqueo: configurar un bot de Telegram nuevo (nunca reutilizar el token comprometido) y verificar el ciclo completo, con instrucción explícita de la usuaria de no activar todavía ni el cron de las 08:00 ni Telegram.

## Siguiente objetivo
Fase 5D (Telegram, bot nuevo dedicado) y Fase 5E (verificación del ciclo completo) del plan ya aprobado (`DECISIONS.md` D10) — sin activar el cron diario todavía, según instrucción explícita de la usuaria. Antes de eso: commitear los cambios de esta sesión en `isabel-gateway` y `life-os-app/docs` (documentación + código, sin mezclar). Hilos sin tocar, de sesiones anteriores: "Gym" no aparece en Dominios (`KNOWN_PROBLEMS.md`); investigación de JETMI en pausa, próximo bloque decidido es Fase 1 dominio 1.2 Supply (`research/JETMI/LOG.md` § 6); confirmación pendiente de la usuaria sobre la prueba en iPhone de "ISABEL · AHORA" del 2026-08-03; rotación de `ANTHROPIC_API_KEY` tras su exposición accidental en texto plano en un chat anterior (`SECURITY.md` riesgo #9) — sigue sin rotar, y ahora esa misma key es la única vía de auth de `isabel-gateway`, lo que la hace más crítica de rotar, no menos.
