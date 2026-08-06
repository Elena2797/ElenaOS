Estado: este documento ES el estado — se reescribe en cada "Cerrar sesión de desarrollo" si algo cambió globalmente
Última verificación: 2026-08-06
Verificado en: cadena completa Telegram → Isabel (isabel-gateway/Railway) → MCP → isabel-api → Supabase verificada en producción; cron one-shot de prueba ejecutado y confirmado OK/Entregado en el run history del Gateway; cron diario recurrente creado, persistido en `/data/.openclaw/state/openclaw.sqlite` (volumen Railway), próxima ejecución confirmada; flujo de sueño pregunta→respuesta→registro validado con una respuesta real de la usuaria (no fabricada)
Fuente de verdad de datos: ninguna (agrega, no duplica DATA_MODEL)

# CURRENT_STATE.md — Fotografía del proyecto, ahora

Una página. Solo 5 campos. Detalle de un módulo → `modules/*.md`. Handoff de la última sesión (qué se hizo justo antes, qué archivos tocar) → `NEXT_SESSION.md`, que complementa a este documento, no lo duplica.

## Estado general del proyecto
**Isabel es real y funciona 24/7, independiente del portátil.** Cadena completa verificada en producción: Telegram (`@Isabellifeosbot`) → Isabel (`isabel-gateway` en Railway) → MCP autenticado → `isabel-api` → Supabase. La usuaria puede hablar con Isabel por Telegram y Isabel invoca tools reales de LIFEOS. El flujo de sueño (LIFEOS detecta falta → Isabel pregunta por Telegram → la usuaria responde en lenguaje natural → `health_register_sleep` resuelve la Intervention de forma determinista → CheckIn creado → reevaluación confirma `should_ask: false`) se validó con una respuesta real de la usuaria durante las pruebas de esta sesión (no fue un test sintético — sucedió porque el sueño de hoy genuinamente estaba sin registrar en ese momento). Hay un cron diario recurrente creado (`sleep-check-0800-madrid`, `0 8 * * *` Europe/Madrid) cuya primera ejecución real todavía no ha ocurrido — se verificará el 2026-08-07. Isabel Core (`GET /v1/now`, tarjeta "ISABEL · AHORA") sigue como se dejó el 2026-08-03, sin cambios. El resto de áreas (JETMI, Finanzas, Gym, Marca Personal, Vida Personal) siguen sin lógica de dominio propia.

## Último deploy relevante
`isabel-api` en Railway, commit `7ab806f` (incluye `c02d4cd`), sin cambios esta sesión. `isabel-gateway` en Railway: auth cambiada a API key (D11, sesión anterior), Telegram wireado y verificado (bot nuevo, allowlist con el ID numérico de la usuaria), cron diario creado vía Control UI (administrada a través de un túnel SSH privado, ver `KNOWN_PROBLEMS.md`). `life-os-app` en Vercel sigue en `da840cc`, sin cambios de frontend.

## Último commit importante
`isabel-gateway`: config de Telegram (`enabled`, `dmPolicy: allowlist` con el ID de la usuaria) commiteada en `openclaw.default.json`. El cron diario NO vive en git — vive en el volumen persistente de Railway (`openclaw.sqlite`), creado vía Control UI, sobrevive redeploys porque el volumen sobrevive redeploys (ya verificado en sesiones previas). `life-os-app`: documentación de esta sesión (`CURRENT_STATE.md`, `NEXT_SESSION.md`, `CHANGELOG.md`, `KNOWN_PROBLEMS.md`).

## Bloqueos actuales
Ninguno real. El bloqueo de `operator.admin` para gestionar cron por CLI sigue existiendo como limitación de la CLI de OpenClaw, pero tiene workaround confirmado y usado con éxito (Control UI vía túnel SSH privado — ver `KNOWN_PROBLEMS.md`), así que no bloquea nada operativamente.

## Siguiente objetivo
Verificar la primera ejecución real del cron de las 08:00 del 2026-08-07 (que no pregunte si `should_ask` sigue en `false` por el registro ya hecho hoy, o que pregunte correctamente si aplica un nuevo día). Rotar `ANTHROPIC_API_KEY` (`SECURITY.md` riesgo #9) — ahora es la única vía de auth tanto de `isabel-api` como de `isabel-gateway`, más urgente que antes. Revisar el hallazgo de `SECURITY.md` riesgo #10 (`ISABEL_API_KEY`/`ANTHROPIC_API_KEY` persistidas como valores literales en `openclaw.json`, confirmado también por `openclaw doctor`). Hilos sin tocar de sesiones anteriores: "Gym" no aparece en Dominios; investigación de JETMI en pausa (`research/JETMI/LOG.md` § 6); confirmación pendiente de la usuaria sobre la prueba en iPhone de "ISABEL · AHORA" del 2026-08-03.
