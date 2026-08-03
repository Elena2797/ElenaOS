Estado: este documento ES el estado — se reescribe en cada "Cerrar sesión de desarrollo" si algo cambió globalmente
Última verificación: 2026-08-03
Verificado en: commits 2a7b525 (isabel-api) y da840cc (life-os-app) + verificación en vivo contra producción real (Railway y Vercel), ver CHANGELOG.md
Fuente de verdad de datos: ninguna (agrega, no duplica DATA_MODEL)

# CURRENT_STATE.md — Fotografía del proyecto, ahora

Una página. Solo 5 campos. Detalle de un módulo → `modules/*.md`. Handoff de la última sesión (qué se hizo justo antes, qué archivos tocar) → `NEXT_SESSION.md`, que complementa a este documento, no lo duplica.

## Estado general del proyecto
LIFEOS en producción y en uso real diario. VistaJet (Inventario + HOTO + Aircraft Readiness) sigue siendo el dominio maduro. Desde el 2026-08-03, **Isabel Core tiene por primera vez una pieza real en producción**: `GET /v1/now` (backend, solo lectura) agrega señales de todos los dominios, las clasifica de forma determinista y auditable (`urgent`/`reentry`/`maintain`/`clear`, nunca decidido por el LLM a partir de datos crudos), y alimenta la tarjeta "ISABEL · AHORA" en Home (frontend, aditiva, convive con la tarjeta estática existente sin reemplazarla). Ver `core/ISABEL_NOW.md` para el detalle completo y `DECISIONS.md` D9 para la decisión arquitectónica. El chat conversacional de Isabel (`openChat()`, bridge local) no se tocó — sigue siendo el único canal activo, ver `core/ISABEL_CHANNELS.md`. El resto de áreas (JETMI, Finanzas, Salud/Gym, Marca Personal, Vida Personal) siguen sin lógica de dominio propia — ver `modules/`.

## Último deploy relevante
- `isabel-api` → Railway, commit `2a7b525` ("Isabel Core fase 1 — GET /v1/now, solo lectura"). Deploy verificado directamente: `/health` → 200, `/v1/now` → 200 con contrato completo, commit confirmado por mensaje único + comportamiento (la ruta solo existe en ese commit). Región de Railway corregida de `sfo` (inválida, bloqueaba deploys) a `us-west2` en el camino — ver `operations/RAILWAY.md`.
- `life-os-app` → Vercel, commit `da840cc` ("feat(home): añade tarjeta Isabel Ahora con priorización global"). Deploy verificado: bundle con hash nuevo, contenido confirmado (`ISABEL · AHORA`, `attention_mode_reliable`), comportamiento correcto probado en producción real (JETMI como `reentry`, CTA funcional). Variable `VITE_ISABEL_API_URL` de Vercel corregida en el camino (tenía `http://` en vez de `https://`) — ver `operations/VERCEL.md`.

## Último commit importante
`da840cc` en `life-os-app` (frontend) + `2a7b525` en `isabel-api` (backend) — la misma pieza de trabajo, Isabel Core Fase 1+2, en dos repos. Ver `CHANGELOG.md` 2026-08-03 para el detalle completo, incluidos los tres bugs de código encontrados y corregidos durante la validación, y los tres incidentes de infraestructura (región de Railway, webhook GitHub→Railway obsoleto, variable de Vercel) resueltos en el camino.

## Bloqueos actuales
Ninguno técnico. Pendiente no bloqueante: **la usuaria todavía no ha validado manualmente en su iPhone** la tarjeta "ISABEL · AHORA" (checklist entregado el 2026-08-03) — validado exhaustivamente desde este chat contra producción real, pero la confirmación final es suya. No dar la Fase 2 por completamente cerrada hasta esa confirmación.

## Siguiente objetivo
Ninguno iniciado automáticamente. Esperar confirmación de la usuaria sobre la prueba en iPhone. Sin nuevo trabajo decidido más allá de eso — no ampliar dominios, no activar `/v1/chat`, no permitir writes desde Isabel sin una decisión explícita nueva (ver `core/ISABEL_NOW.md` § Fuera de alcance actual). Hilos de sesiones anteriores, sin tocar en esta: "Gym" no aparece en Dominios (`KNOWN_PROBLEMS.md`); investigación de JETMI en pausa, próximo bloque decidido es Fase 1 dominio 1.2 Supply (`research/JETMI/LOG.md` § 6).
