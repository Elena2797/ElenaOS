Estado: este documento ES el estado — se reescribe en cada "Cerrar sesión de desarrollo" si algo cambió globalmente
Última verificación: 2026-08-07
Verificado en: sesión larga de auditoría e implementación arquitectónica (D18–D33) — migración blue/green real del Gateway entre proyectos Railway, cutover de Telegram, unificación del chat, contrato universal de señales; todo verificado contra producción real (curl, navegador móvil, `railway ssh`), no solo en local

# CURRENT_STATE.md — Fotografía del proyecto, ahora

Una página. Solo 5 campos. Detalle de un módulo → `modules/*.md`. Handoff de la última sesión → `NEXT_SESSION.md`.

## Estado general del proyecto
**Hay UNA sola Isabel, y LIFEOS habla con ella.** Es el cambio de fondo de esta sesión. `openChat()` dejó de usar el bridge local del portátil: la pestaña Isabel pasa por `POST /v1/chat` de `isabel-api` → red privada IPv6 de Railway → `gateway-adapter` → **el mismo agente `main` que atiende Telegram**, con sus mismas tools MCP y su mismo estado en Supabase. Para lograrlo hubo que migrar `isabel-gateway` entero al proyecto Railway de `isabel-api` (blue/green, con backup y restore del volumen: **el cron `sleep-check-0800-madrid` sobrevivió con su id original**), hacer el cutover de Telegram con una ventana verificable de cero pollers, y construir un adaptador autenticado de superficie mínima porque la red privada de Railway es IPv6-only y OpenClaw no sabe escuchar en IPv6 fuera de loopback.

**El Core decide, el frontend representa.** Home tenía cuatro cálculos de prioridad que podían contradecirse; ahora hay uno. Cuando `/v1/now` no responde, el frontend reutiliza su último resultado o declara que no hay decisión — nunca inventa una alternativa.

**VistaJet ya es el segundo cerebro, y el patrón es reutilizable.** Los specialists producen señales deterministas con un contrato universal (`core/signals.js`: `type`, `domain`, `subject`, `evidence`, `action`, `severity`, `temporal`, `source`); el Core las prioriza cross-domain **sin conocer ningún dominio** (hay un test de invariante que lo garantiza). La distinción clave quedó resuelta: *existe* ≠ *merece atención ahora* — una señal declara cuándo escala y cuándo caduca, y el Core lo aplica sin casos especiales.

Se corrigieron **cinco bugs reales** encontrados durante la verificación, no en revisión de código: el scope de inventario por avión (D28, un conteo dicho por Telegram habría escrito en el avión anterior), una condición de carrera en la correlación de respuestas del chat, la degradación silenciosa de señales migradas, la fuga de jerga interna al texto de Isabel, y `time_sensitive` traducido a urgencia permanente.

## Último deploy relevante
Todo desplegado y verificado en producción. `isabel-api`: `b85c23d`. `life-os-app` (Vercel): `a2fd590`. `isabel-gateway`: `832443a`, corriendo en el proyecto `laudable-consideration` con `bind: loopback` + adaptador en `[::]:8081`, Telegram activo y cron intacto. El Gateway antiguo (proyecto `isabel-gateway`) sigue **Online pero sin Telegram**, conservado como rollback. `faithful-light` **detenido** (reversible).

## Último commit importante
`isabel-api` `b85c23d` — fix de la degradación de severidad, encontrado verificando D33 en producción. `life-os-app` `a2fd590` — documentación de cierre. `isabel-gateway` `832443a` — el adaptador autenticado.

## Bloqueos actuales
**BLOQUEANTE ACTIVO: la cuenta de Anthropic se quedó sin crédito.** Los logs del Gateway son explícitos (*"Your credit balance is too low…"*). Isabel no puede responder — ni por Telegram, ni por LIFEOS, ni el cron de las 08:00. **No es un fallo del sistema**: toda la capa determinista sigue sana (`/v1/now` devuelve `llm_error` pero conserva prioridad, evidence y las 4 señales de VistaJet). Recargar crédito en `console.anthropic.com` → Plans & Billing.

Pendientes de acción de la usuaria, **no bloqueantes para seguir trabajando**: rotar `ANTHROPIC_API_KEY` (runbook en `operations/ROTAR_ANTHROPIC_KEY.md`; conviene hacerlo a la vez que la recarga) y abrir una sesión de inventario real para D-AFBS (sin ella no se puede cerrar la prueba de escritura de Inventario, y fabricar conteos corrompería datos).

## Siguiente objetivo
Ver `NEXT_SESSION.md`. En corto: auditoría sistemática de correlación de entidad en **todos** los caminos de VistaJet (no solo los tres que ya fallaron), diseño del bucle de evaluación proactiva general (sin multiplicar crons por dominio y sin tocar el de sueño), y cerrar los puntos ciegos de instrumentación de consumo — hoy se mide `isabel-api` pero **no** los turnos del agente en OpenClaw, que son probablemente el grueso del gasto.
