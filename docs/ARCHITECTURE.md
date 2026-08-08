Estado: implementado y verificado
Última verificación: 2026-08-08
Fuente de verdad de datos: `DATA_MODEL.md`

# Arquitectura real de LIFEOS

LIFEOS es un sistema operativo personal con una sola Isabel, una memoria operacional compartida y especialistas de dominio. El modelo es infraestructura reemplazable; no es la identidad ni la fuente de verdad.

```text
Telegram ───────────────┐
                       ├─> OpenClaw / agente main ──MCP──┐
LIFEOS / pestaña Isabel┘                                │
                                                        v
LIFEOS UI ───────> isabel-api / Isabel Core ───────> Supabase
   │                      │
   └── CRUD directo ──────┘
                          │
                          └── Model Router ──> adapter Anthropic (hoy)
```

## Responsabilidades

- `life-os-app`: representa estado y permite acciones. No decide prioridad, proveedor ni modelo.
- `isabel-api`: reglas, Priority Engine global, especialistas, Interventions, delivery, herramientas MCP, exportaciones y llamadas directas a modelos.
- `isabel-gateway`: OpenClaw, sesiones, canal Telegram, cron y conversación de Isabel. Se comunica con `isabel-api` por MCP y con la pestaña Isabel mediante un adaptador privado de superficie mínima.
- Supabase: única memoria operacional compartida.

## Model Router de isabel-api

La interfaz separa cuatro conceptos:

1. el consumidor declara `task`;
2. pide una `capability`;
3. el router elige una ruta ordenada;
4. un adapter traduce el contrato neutral al proveedor.

El contrato normalizado incluye mensajes, instrucciones, tools, salida estructurada y metadatos de sensibilidad; la respuesta incluye contenido, datos estructurados, tool calls, proveedor, modelo, tokens, caché, latencia, coste declarado/estimado, finish reason y metadatos de fallback. Si no hay ruta o fallan todas, lanza un error tipado y no fabrica contenido.

### Consumidores activos

| Consumidor | Capability | Runtime | Modelo actual (sin cambio) |
|---|---|---|---|
| Conversación Isabel | `agent_conversation` | OpenClaw | Claude Sonnet 4.6 |
| `/v1/now` | `structured_generation` | isabel-api | Claude Haiku 4.5 |
| Inventario intent | `structured_extraction` | isabel-api | Claude Haiku 4.5 |
| Gym ambiguity fallback | `structured_extraction` | isabel-api | Claude Haiku 4.5 |

Los consumidores de isabel-api no contienen nombres de proveedor o modelo. La única configuración directa vive en `src/core/models/index.js`; el SDK está encapsulado en `src/core/models/providers/anthropic.js`.

`src/core/intentRouter.js`, `src/core/generalHandler.js`, `life-os-app/api/chat.js` y `lifeos-agent` conservan integraciones históricas no activas. No se migraron porque no están montadas en el runtime productivo.

## Fallback y coste

Cada capability tiene una cadena ordenada de rutas. Hoy contiene una sola ruta real; el contrato ya representa intentos, motivo y uso de fallback. Añadir un proveedor futuro consiste en añadir un adapter y una entrada de configuración, sin tocar especialistas ni frontend.

`aiUsage` registra proveedor, modelo, capability/task, tokens, caché, latencia, éxito/error y fallback. El coste reportado por el proveedor tiene prioridad; una estimación se marca como `estimated_price_table`; sin datos no se inventa coste.

El guardarraíl de coste vive en el router: cada intento pasa por `countLlmCall()`. Por eso `runWithoutAI()` sigue bloqueando cualquier modelo durante un tick silencioso, incluso si en el futuro se registra otro proveedor.

## OpenClaw: segundo plano de ejecución, no segundo cerebro

OpenClaw conserva su propia configuración de modelo porque ejecuta conversación, sesiones y tools. LIFEOS no envuelve al agente dentro del router directo: ambos planos comparten política por capacidades y observabilidad, pero evitan dos routers anidados que puedan contradecirse.

OpenClaw soporta referencias `provider/model` y fallbacks ordenados en `agents.defaults.model.fallbacks`; primero rota perfiles de autenticación y después avanza por la lista de modelos. Está documentado, pero no se ha activado ni cambiado en esta tanda:

- https://docs.openclaw.ai/concepts/model-providers
- https://docs.openclaw.ai/model-failover

## Benchmark

`isabel-api/benchmarks/model-router/` contiene un harness neutral y 15 fixtures anonimizados A–O. La validación por defecto cuesta $0 y no llama a ningún modelo. La comparación real de proveedores requiere inyectar de forma explícita un runner autorizado.
