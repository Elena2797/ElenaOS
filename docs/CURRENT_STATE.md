Estado: este documento ES el estado — se reescribe en cada "Cerrar sesión de desarrollo" si algo cambió globalmente
Última verificación: 2026-08-06
Verificado en: commits c02d4cd y 7ab806f (isabel-api, pusheados), 34b430a/de2ab5a (isabel-gateway, local, sin remoto), despliegue real de isabel-gateway en Railway, repro Windows-vs-Linux del timeout de cron, ver CHANGELOG.md
Fuente de verdad de datos: ninguna (agrega, no duplica DATA_MODEL)

# CURRENT_STATE.md — Fotografía del proyecto, ahora

Una página. Solo 5 campos. Detalle de un módulo → `modules/*.md`. Handoff de la última sesión (qué se hizo justo antes, qué archivos tocar) → `NEXT_SESSION.md`, que complementa a este documento, no lo duplica.

## Estado general del proyecto
LIFEOS en producción y en uso real diario, sin cambios en `life-os-app`/frontend desde el 2026-08-03. Todo lo nuevo vive en `isabel-api` (pusheado y desplegado) y en un repo/servicio nuevo, `isabel-gateway`. Cuatro piezas: (1) el misterio del timeout de cron en Windows quedó cerrado — es específico del runtime Windows, no de OpenClaw, confirmado con un repro completo en WSL2/Linux; (2) `isabel-api/src/mcp.js` ya tiene autenticación (antes era la única ruta sin protección); (3) `health_register_sleep` ya no depende de que el LLM recuerde un `intervention_id` — LIFEOS resuelve la Intervention pendiente de forma determinista, fail-closed; (4) primer Gateway de OpenClaw real y persistente desplegado en Railway (`isabel-gateway`), separado de `isabel-api`, con volumen persistente y MCP autenticado contra `isabel-api` producción — pero **ningún turno de agente real completa todavía un turno**: falta un auth profile interno de `claude-cli` que requiere un login OAuth interactivo, sin completar. Sin eso no hay cron diario, no hay Telegram, no hay nada disparándose solo. Isabel Core (`GET /v1/now`, tarjeta "ISABEL · AHORA") sigue como se dejó el 2026-08-03, sin cambios. El resto de áreas (JETMI, Finanzas, Gym, Marca Personal, Vida Personal) siguen sin lógica de dominio propia.

## Último deploy relevante
`isabel-api` en Railway, commit `7ab806f` (incluye también `c02d4cd`) — MCP autenticado + correlación determinista de Interventions, ambos verificados en producción. `isabel-gateway` desplegado en Railway (proyecto y servicio dedicados, `isabel-gateway`) pero sin ningún turno de agente real funcionando todavía — ver `core/AUTOMATIONS.md`. `life-os-app` en Vercel sigue en el commit del 2026-08-03 (`da840cc`), sin cambios de frontend esta sesión.

## Último commit importante
`isabel-api` `7ab806f` — resolución determinista de Interventions + migración `kind` en Supabase real. `isabel-gateway` `de2ab5a` — Dockerfile/entrypoint con fix de permisos de volumen, config de administración por SSH documentada, **repo local, sin remoto en GitHub todavía**. `life-os-app` sin commit de código esta sesión; el único cambio es documentación (`CHANGELOG.md`, `CURRENT_STATE.md`, `NEXT_SESSION.md`, `KNOWN_PROBLEMS.md`, `SECURITY.md`, `core/AUTOMATIONS.md`), commiteada al cerrar esta sesión.

## Bloqueos actuales
Uno solo, real y concreto: **el auth profile interno `anthropic:claude-cli` no está registrado en `isabel-gateway`**, así que todo turno de agente real falla con `FailoverError: Not logged in`. Requiere completar `claude auth login` (OAuth interactivo) + `openclaw models auth login --provider anthropic --method cli --set-default` desde una terminal verdaderamente interactiva — todos los intentos vía `railway ssh` anidado con `su` fallaron. Detalle completo, incluido todo lo ya descartado como causa, en `core/AUTOMATIONS.md` y `KNOWN_PROBLEMS.md`. Es el único bloqueante entre el estado actual y tener un cron diario / Telegram / cualquier automatización real.

## Siguiente objetivo
Resolver el bloqueo de auth de `claude-cli` en `isabel-gateway` — es el único paso que falta antes de continuar con Fase 5D (Telegram, bot nuevo) y Fase 5E (verificación del ciclo completo) del plan ya aprobado. Ver `NEXT_SESSION.md` para el prompt exacto de continuación. Nada de lo pendiente de esa fase se activa sin verificar primero que un turno de agente real completa correctamente. Hilos sin tocar, de sesiones anteriores: "Gym" no aparece en Dominios (`KNOWN_PROBLEMS.md`); investigación de JETMI en pausa, próximo bloque decidido es Fase 1 dominio 1.2 Supply (`research/JETMI/LOG.md` § 6); confirmación pendiente de la usuaria sobre la prueba en iPhone de "ISABEL · AHORA" del 2026-08-03; rotación de `ANTHROPIC_API_KEY` tras su exposición accidental en texto plano en este chat (`SECURITY.md` riesgo #9).
