Estado: parcial (una pieza real de Core está en producción desde 2026-08-03; el resto sigue siendo diseño)
Última verificación: 2026-08-03
Verificado en: contraste entre ISABEL_CORE.md (raíz) y el código real de isabel-api/src/core/, más verificación empírica de GET /v1/now en producción
Fuente de verdad de datos: ninguna

# core/ISABEL_CORE.md — Qué es Isabel Core, y qué de ello es real

## 1. La visión (resumen — el documento completo vive en la raíz)

`ISABEL_CORE.md` en la raíz del proyecto ("la constitución del sistema", v1.1, 2026-07-07) define Isabel Core como **director de orquesta, no cerebro único**: coordina memoria y contexto transversal, pero la inteligencia de dominio pertenece a los especialistas (Inventario, HOTO, futuros). La metáfora organizacional que usa: Estefanía (CEO) → Isabel (Chief of Staff) → Especialistas (directores de dominio) → Herramientas → Supabase → LIFEOS.

Léelo entero para el razonamiento — este documento no lo reproduce, solo contrasta la visión con la realidad verificada.

## 2. Qué de esa visión existe en código, hoy

| Pieza de la visión | ¿Existe código? | ¿Está activa? |
|---|---|---|
| Isabel Core como router de intención | Sí — `isabel-api/src/core/intentRouter.js` | No — ver [ISABEL_CHANNELS.md](ISABEL_CHANNELS.md) |
| Delegación a especialista de Inventario | Sí — `core/inventoryDelegate.js` | No, mismo motivo |
| Logging de eventos transversal | Sí — `core/eventLogger.js`, escribe a `eventos` | No conectado a `/chat` (pero la tabla `eventos` sí se usa desde otros flujos) |
| Memoria persistente de contexto | No verificado — ver [MEMORY.md](MEMORY.md) | — |
| Especialista de HOTO con contrato formal | Parcial — HOTO funciona pero no como "herramienta invocable" por un Core, sino como módulo directo del frontend | — |
| Especialista de Inventario con contrato formal | Sí, documentado en `ISABEL_INVENTORY_SPECIALIST_CONTRACT.md` (raíz) | El contrato JSON existe; quién lo invoca hoy es el bridge local, no un "Core", ver ISABEL_CHANNELS.md |
| Estado global agregado, solo lectura | Sí — `core/globalContext.js` (2026-08-03) | **Sí — `GET /v1/now`, en producción**, ver [ISABEL_NOW.md](ISABEL_NOW.md) |
| Priorización cross-dominio con evidence auditable | Sí — `core/now.js` (2026-08-03) | **Sí — en producción, alimenta la tarjeta "ISABEL · AHORA" en Home** |

## 3. Conclusión honesta

"Isabel Core" como concepto arquitectónico está bien pensado y parcialmente construido. Desde 2026-08-03, **una pieza real está en producción**: la agregación de estado global y priorización determinista (`GET /v1/now`, ver `ISABEL_NOW.md`), que alimenta la tarjeta "ISABEL · AHORA" en Home — solo lectura, sin escrituras, sin delegación a especialistas. Pero el routing de intención y la delegación conversacional (`POST /chat`, `intentRouter`, `inventoryDelegate`) **siguen sin montar**. El chat que la usuaria experimenta como "Isabel" sigue siendo el bridge local descrito en `ISABEL_CHANNELS.md` — un sistema mucho más simple, sin ninguna relación con `globalContext.js`.

Cualquier trabajo futuro que pretenda acercar el chat conversacional a esta visión debe empezar por decidir explícitamente **cuál** de los 4 canales se convierte en el Core conversacional real, y montarlo — no añadir una quinta pieza (ver `DECISIONS.md` D9, que ya fijó este principio para la pieza de solo lectura).

## Ver también
- [ISABEL_NOW.md](ISABEL_NOW.md) — la pieza de Core que sí está en producción (`GET /v1/now`, solo lectura).
- [ISABEL_CHANNELS.md](ISABEL_CHANNELS.md) — detalle de los 4 canales conversacionales, ninguno de ellos afectado por `ISABEL_NOW.md`.
- [SPECIALISTS_PROTOCOL.md](SPECIALISTS_PROTOCOL.md) — el contrato JSON entre Core y especialistas.
- `ISABEL_CORE.md` y `ARQUITECTURA_FUSION.md` en la raíz del proyecto — la visión completa y el plan de fusión.
