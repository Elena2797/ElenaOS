Estado: decisión TOMADA el 2026-09-21 — ver DECISIONS.md D47 y el addendum final
Última verificación: 2026-09-21
Verificado en: Git de los 3 repos, tests reales, Railway API (GraphQL), `railway ssh` solo-lectura contra ambos Gateways, endpoints de producción sin coste IA, documentación oficial de precios consultada hoy, docs instaladas de OpenClaw 2026.6.10
Fuente de verdad de datos: ninguna (documento de decisión, no de estado operativo)

# Decisión multi-modelo para el runtime de Isabel

Este documento cubre **A) qué modelos usa LIFEOS cuando Isabel funciona**. NO cubre B) qué herramienta se usa para programar LIFEOS (Claude Code, Codex, etc.). No se conectó ningún proveedor, no se cambió producción y no se ejecutó ningún benchmark de pago.

---

## 1. Estado verificado heredado de Codex

Cada línea lleva su nivel de verificación.

### Git — VERIFIED

| Repo | HEAD real | Rama | Limpio | Remoto |
|---|---|---|---|---|
| `isabel-api` | `70785564bec14acbc15b076817e4e1042535d277` — *feat: add provider-neutral model router* | `main` | sí | `https://github.com/Elena2797/isabel-api.git` (limpio, sin token) |
| `life-os-app` | `2e86538ab7364c088d4aeb565a5296ba26b2e74c` — *docs: distinguish functional frontend revision* | `main` | sí | `https://github.com/Elena2797/ElenaOS.git` (limpio) |
| `isabel-gateway` | `71fa9a30212363bef97ac788ed13e7b701ff0bd2` | `master` | sí | **ninguno** — confirmado sin remoto |

Los hashes que dejó Codex coinciden con el HEAD actual. `f366ff7b` (Gym) y los checkpoints `ebcbb7e1`/`a8faf97b` son ancestros de `2e86538a`.

### Infraestructura — VERIFIED

Proyecto Railway `laudable-consideration` (`1fcded21-…`), environment `production`:

| Servicio | Deployment | Commit | Veredicto |
|---|---|---|---|
| `isabel-api` | `SUCCESS` 2026-08-08T21:15Z | `70785564` | sirve el commit del Model Router |
| `isabel-gateway` (nuevo) | `SUCCESS` 2026-08-08T19:18Z | — | productivo |
| `faithful-light` | **cero deployments** | — | detenido, sin dominio, no puede resucitar |

El deployment `FAILED` de `37b0bb1f` (2026-08-07) es el incidente ya documentado en `KNOWN_PROBLEMS.md`; no bloquea nada.

### Invariantes operativas — VERIFIED (lectura directa, sin escribir nada)

- **Exactamente un sleep cron activo.** Gateway NUEVO: `openclaw cron list` devuelve 2 jobs habilitados (`proactive-tick-15m`, `sleep-check-0800-madrid`). Gateway ANTIGUO: `openclaw cron list` → *"No cron jobs"*; con `--all` aparece la copia `sleep-check-0800-madrid` en estado **`disabled`**, conservada para rollback. Invariante cumplida.
- **Proactive cron intacto.** `proactive-tick-15m`, `*/15 * * * *` Europe/Madrid, `lastRunStatus: ok`, `exitCode: 0`, `lastDiagnosticSummary: "NO_REPLY"`, `lastDeliveryStatus: "not-requested"`. Payload de tipo `command` (curl), no `agentTurn`: **el tick no despierta al modelo**.
- **Telegram solo en el Gateway nuevo.** NUEVO: `enabled, configured, running, connected, mode:polling, token:env`. ANTIGUO: la vista previa de entrega del cron deshabilitado dice literalmente `Unsupported channel: telegram` — el canal no está configurado. Sin riesgo de 409.
- **`faithful-light` no activo.** Cero deployments (arriba).
- **Tests.** `isabel-api`: **455/455, 143 suites, 0 fallos**, ejecutado hoy.
- **Producción sana.** `/health` → `{"ok":true}`. `/v1/proactive/budget` y `/v1/usage/summary` responden 200. No se llamó a `/v1/now` ni a `/v1/chat` para no gastar.
- **No se envió ninguna notificación de prueba ni se disparó ningún cron a mano.**

### Corrección a la documentación heredada — STALE → resuelto

`CURRENT_STATE.md` listaba como bloqueo: *"su última ejecución registrada falló durante el incidente de saldo bajo"*. **Ya no es cierto.** El cron se disparó solo hoy 2026-08-09 a las 08:00 Europe/Madrid:

```
lastRunStatus: "ok"   lastStatus: "ok"   lastDurationMs: 12624
lastDeliveryStatus: "delivered"   lastDelivered: true   consecutiveErrors: 0
```

Corregido en `CURRENT_STATE.md`. No hizo falta forzar nada: bastó con esperar al horario real, que era exactamente lo que pedía `NEXT_SESSION.md`.

### Lo que sigue abierto — VERIFIED como abierto

1. QA visual automatizado de Home/Dominios/Gym/Isabel: sigue sin ejecutarse.
2. `ANTHROPIC_API_KEY` sin rotar — decisión de la usuaria (`operations/ROTAR_ANTHROPIC_KEY.md`).
3. `isabel-gateway` sin remoto Git.
4. `API_KEY` de producción es el fallback hardcodeado `isabel-api-2026` (riesgo #2 de `SECURITY.md`) — **confirmado en vivo hoy**: la clave del `.env` local devuelve 401 y el fallback devuelve 200. Es decir, la API de producción está protegida por un literal que está en el bundle del navegador.

### Coste medido — VERIFIED, cifras exactas de producción hoy

`GET /v1/usage/summary`, últimos 30 días, 100 llamadas:

| | Coste | % | Llamadas |
|---|---|---|---|
| **Total** | **$2.716060** | 100% | 100 |
| conversación (Sonnet 4.6, OpenClaw) | $2.549703 | **93.9%** | 63 |
| light AI (Haiku 4.5, `/v1/now`) | $0.166357 | 6.1% | 37 |

Tokens: input 108.372 · output 13.793 · **cache_write 660.939** · cache_read 127.474.

`GET /v1/usage/analysis`: contexto mediano **25.833** tokens/turno (máx 27.814); 30 turnos escribieron caché, **25 de ellos sin leerla nunca**; 659.411 tokens de escritura desperdiciados; 34 de 63 turnos (54%) sin acción útil.

**Hallazgo que afina el diagnóstico de Codex.** Descomponiendo los $2.5497 de conversación con el precio oficial de Sonnet 4.6 ($3 in / $15 out / $3.75 cache-write 5m / $0.30 cache-read):

| Concepto | Tokens | Coste | % de la conversación |
|---|---|---|---|
| cache **write** | 660.939 | $2.4785 | **97.2%** |
| cache read | 127.474 | $0.0382 | 1.5% |
| output | 2.180 | $0.0327 | 1.3% |
| input | 80 | $0.0002 | 0.0% |

Suma $2.5496 ≈ $2.5497 medido. **El problema no es "el contexto" en abstracto: es que se reescribe la caché en cada turno y casi nunca se lee.** Eso cambia el orden de las palancas (§11).

---

## 2. Auditoría del Model Router de Codex

**Existe de verdad** (`isabel-api/src/core/models/`, 4 ficheros + adapter Anthropic, 220 líneas), está montado y **está sirviendo en producción**: `/v1/usage/summary` muestra 1 llamada con `provider: "anthropic"` y `capability: "structured_generation"` — el primer registro con el esquema nuevo. Las otras 99 son anteriores al despliegue (`desconocido`).

**Veredicto: la abstracción es correcta y NO debe reescribirse.** Tiene ocho huecos, ninguno de diseño.

### Lo que está bien (VERIFIED)

1. **Capability-first real, no cosmético.** Los 3 consumidores (`now.js`, `intentProvider.js`, `gymService.js`) piden `MODEL_CAPABILITIES.*`. Cero referencias a proveedor o modelo fuera de `models/`. `index.js` es el único fichero que nombra Anthropic.
2. **El guardarraíl de coste está en el sitio correcto.** `countLlmCall()` se invoca **dentro del bucle del router**, antes de cada intento. Cualquier proveedor futuro queda cubierto por `runWithoutAI()` automáticamente, sin que nadie tenga que acordarse. Esto es lo que hace que la garantía de "tick silencioso = $0" sobreviva a añadir proveedores.
3. **Fail-closed y tipado.** Sin ruta → `ModelExecutionError('no_route_for_capability')`. Todas las rutas caídas → `ModelExecutionError('all_model_routes_failed', attempts)` con detalle por intento. Nunca devuelve contenido inventado.
4. **La observabilidad no puede tumbar la llamada.** `observeSafely` traga fallos del logger. Correcto.
5. **Coste honesto.** Sin tabla de precios → `null`, nunca un número inventado (`aiUsage.js` lo mantiene).
6. **Contrato validado con dureza** y respuestas congeladas (`Object.freeze`).
7. **Añadir un proveedor = 1 adapter + 1 línea en una cadena.** Cumple lo que promete.

### Huecos (con severidad y qué bloquean)

| # | Hueco | Sev. | Bloquea |
|---|---|---|---|
| **G1** | **Sin timeout ni `AbortSignal` por intento.** Un proveedor colgado cuelga la petición entera y el fallback nunca llega a dispararse. El caso `K-timeout` del corpus no se puede ejercitar contra un proveedor real. | **Alta** | Conectar el 2º proveedor |
| **G2** | **`routes` es una constante de módulo.** No se puede ejecutar "el mismo corpus contra el modelo X" sin editar código. Mitigado: `createModelRouter({routes})` sí acepta tabla alternativa — es un problema del *runner*, no del router. | Media | Benchmark |
| **G3** | **El contrato de mensajes no representa `tool_result`.** `role ∈ {user, assistant}` y `content` debe ser `string`. Se pueden mandar `tools` y recibir `tool_calls`, pero **no devolver el resultado**: un bucle agéntico no es expresable. | Media | Solo si alguna vez se enruta conversación por aquí |
| **G4** | **Sin prompt caching en el contrato ni en el adapter.** No hay `cache_control`. Dado que el 97.2% de la factura real ES cache-write, el router no puede expresar la variable que más cuesta. Irrelevante hoy (L1 usa prompts cortos). | Media | Mover L2 bajo el router |
| **G5** | **El adapter Anthropic devuelve `cost` siempre `null`.** `reported_usd`/`estimated_usd`/`source` fijos a `null`, así que `reportedCostUsd` nunca llega y `aiUsage` cae a su tabla de precios. Funciona, pero el camino de "coste reportado" es código muerto — y OpenRouter **sí** reporta coste real. | Media | Comparación de coste fiable entre proveedores |
| **G6** | **Bug real en `fallback.reason`** (`modelRouter.js:77`): usa `attempts[0]?.error_code` en vez de `attempts[index-1]`. Con cadena de 2 es correcto; con 3+ atribuye el fallo al primer intento, no al anterior. Arreglo de una línea. | Baja | Nada hoy |
| **G7** | **Sin reintento ni backoff ante 429 dentro del mismo proveedor.** Un rate limit transitorio salta directo al siguiente proveedor. Defendible (fail fast), pero es una decisión implícita que conviene hacer explícita. | Baja | — |
| **G8** | **`structured_output` es "parsear el texto y rezar".** `parseStructuredOutput` quita las vallas ```` ```json ```` y hace `JSON.parse`. Sin schema enforcement, sin JSON forzado por tool, sin `response_format`. Con Haiku funciona; **es lo primero que se rompe al bajar a un modelo más barato**, que es justo el objetivo. | **Alta** | Migrar L1 a modelos baratos |

**G1 y G8 son las dos que hay que cerrar antes de conectar nada.** Las demás pueden esperar.

---

## 3. Mapa de proveedores (precios verificados hoy, 2026-08-09)

Precios en USD por millón de tokens. ✅ = documentación oficial del proveedor consultada hoy. ⚠️ = agregador/prensa, pendiente de confirmar contra la fuente oficial antes de gastar.

### Anthropic ✅ (baseline actual)

| Modelo | In | Cache W 5m | Cache W 1h | Cache R | Out |
|---|---|---|---|---|---|
| Haiku 4.5 | 1.00 | 1.25 | 2.00 | 0.10 | 5.00 |
| **Sonnet 4.6** (actual) | **3.00** | **3.75** | 6.00 | **0.30** | **15.00** |
| Sonnet 5 (hasta 31-ago-2026) | 2.00 | 2.50 | 4.00 | 0.20 | 10.00 |
| Sonnet 5 (desde 1-sep-2026) | 3.00 | 3.75 | 6.00 | 0.30 | 15.00 |
| Opus 5 | 5.00 | 6.25 | 10.00 | 0.50 | 25.00 |

> **Trampa documentada por Anthropic:** los modelos 4.7 y posteriores usan un tokenizador nuevo que produce **~30% más tokens para el mismo texto**. Sonnet 4.6 usa el antiguo. Ver §13 riesgo R1.

### Google Gemini ✅

| Modelo | In | Cache R | Out | Free tier |
|---|---|---|---|---|
| Gemini 3.1 Flash-Lite | 0.25 | 0.025 | 1.50 | sí |
| Gemini 3.5 Flash-Lite | 0.30 | 0.03 | 2.50 | sí |
| Gemini 3.6 Flash | 1.50 | 0.15 | 7.50 | sí |
| Gemini 3.5 Flash | 1.50 | 0.15 | 9.00 | sí |
| Gemini 3.1 Pro Preview | 2.00 (≤200k) | 0.20 | 12.00 | no |

Almacenamiento de caché explícita $1.00/M/hora (Flash) — cobra por tiempo, no por lectura.

**Hallazgo relevante para Estefanía** ✅ (términos oficiales de la API): *"If you're in the European Economic Area, Switzerland, or the United Kingdom, the terms under 'How Google uses Your Data' in 'Paid Services' apply to all Services, including Google AI Studio and unpaid quota in the Gemini API, even though they are offered free of charge."* → **estando en Portugal/España, el tier gratuito de Gemini NO entrena con los prompts.** Es el único proveedor con free tier real y sin coste de privacidad para esta usuaria.

### OpenAI ⚠️

GPT-5.5 $5 / $0.50 cacheado / $30, contexto 1M. GPT-5.4-mini ~$0.75 in. GPT-5.4-nano ~$0.20 in / ~$1.25 out. Input cacheado ≈ 10% del input normal.

### DeepSeek ✅

| Modelo | In (miss) | In (hit) | Out | Contexto |
|---|---|---|---|---|
| `deepseek-v4-flash` | 0.14 | **0.0028** | 0.28 | 1M |
| `deepseek-v4-pro` | 0.435 | 0.003625 | 0.87 | 1M |

El cache-hit a $0.0028/M es 50× más barato que el miss — el mejor precio absoluto del mercado para contexto repetido. **Pero** la propia documentación anuncia: *"We plan to raise the overall pricing... with a significant increase expected"*, sin fecha. Y ver §13 R3 (privacidad).

### Moonshot / Kimi ⚠️

K2.5 $0.60 / $0.10 cacheado / $3.00 · K2.6 $0.95 / $0.16 / $4.00 · K2.7 Code $0.16 cacheado · K3 $3 / $0.30 / $15, contexto 1M. K2.6/K2.7 con 256k de contexto (confirmado en docs oficiales; la tabla de precios oficial está paginada por modelo y no se pudo extraer entera).

### Z.AI (GLM) ✅

| Modelo | In | Cache R | Out |
|---|---|---|---|
| GLM-4.7-Flash | **gratis** | gratis | gratis |
| GLM-4.7-FlashX | 0.07 | 0.01 | 0.40 |
| GLM-4.5-Air | 0.20 | 0.03 | 1.10 |
| GLM-4.7 / 4.6 / 4.5 | 0.60 | 0.11 | 2.20 |
| GLM-5 | 1.00 | 0.20 | 3.20 |
| GLM-5.2 | 1.40 | 0.26 | 4.40 |

### Alibaba / Qwen ⚠️

Qwen3.5 Flash ~$0.07 / ~$0.02 cacheado / ~$0.26. Qwen3.7 Max ~$1.25/$3.75. Qwen3.8-Max $2 / $0.25 cacheado / $6. Endpoint Singapur (internacional); el de China continental es 60-70% más barato. 1M tokens gratis por modelo para cuentas nuevas en Singapur.

### xAI ⚠️

Grok 4.5 $2 / $0.30 cacheado / $6, 500k contexto. Grok 4.3 $1.25 / $2.50, 1M contexto.

### Mistral ⚠️

Mistral Large $2 / $6. Medium 3.5 y Small más baratos (tabla exacta no extraíble de la página de pricing). Tool calling y structured output soportados. **Único candidato con jurisdicción UE nativa.** OpenClaw lo trata como OpenAI-compatible con `compat.supportsLongCacheRetention: false`.

### Groq ⚠️ / Cerebras ⚠️

Groq: Llama 3.1 8B $0.05/$0.08 · Llama 3.3 70B $0.59/$0.79 · Kimi K2 $1/$3. 280–1.000 tok/s. Cerebras: gpt-oss-120b ~$0.35/$0.75, GLM-4.7 ~$2.30, **1M tokens/día gratis sin tarjeta**. Ambos son *capa de velocidad* sobre modelos open-weight, sin prompt caching propio.

### MiniMax ⚠️

MiniMax-M2 ~$0.26 in / ~$1.00 out, 197k contexto, **sin tarifa de input cacheado** — cada token de entrada se paga entero. Descalificante para un patrón de 25.8k de contexto repetido.

### Agregadores y hosts de open-weight

- **OpenRouter** ✅ — **sin markup sobre inferencia** ("we pass through the pricing of the underlying providers"). Comisiones: 5.5% al recargar con Stripe (mín. $0.80), 5% con cripto, BYOK gratis hasta 1M req/mes y luego 5%. **Cero logging de prompts/completions por defecto** (opt-in a cambio de 1% de descuento). Fallback automático entre proveedores. Variantes `:nitro` (velocidad) y `:floor` (precio).
- **Together AI / Fireworks AI / DeepInfra / Novita / NVIDIA NIM / Hugging Face Inference Providers** — hosts de modelos open-weight. Compiten en precio y latencia, no en modelo. **No aportan ninguna capacidad que Isabel necesite y que OpenRouter no dé con una sola clave.** Descartados como integración directa (§5).
- **Ollama / LM Studio / vLLM / SGLang** — inferencia local. Soportados nativamente por OpenClaw. Ver §5.

---

## 4. Shortlist: lo que merece probarse

Filtro aplicado, en este orden: (a) soporte nativo en OpenClaw · (b) tarifa de input cacheado (el 97% del gasto es contexto repetido) · (c) tool calling + JSON · (d) español · (e) jurisdicción aceptable para datos de salud.

### Nivel 2 — Isabel conversacional (donde está el 93.9% del dinero)

| # | Modelo | Coste/turno* | vs hoy | Por qué está |
|---|---|---|---|---|
| 1 | **Gemini 3.5 Flash-Lite** | ~$0.0038 | **10.6× más barato** | cache read $0.03, free tier con términos de pago en EEE, tool calling maduro, español fuerte |
| 2 | **Gemini 3.5 Flash** | ~$0.019 | 2.1× | el escalón de calidad de Google sin salir del proveedor |
| 3 | **Claude Haiku 4.5** | ~$0.0127 | 3.2× | **cero integración nueva**: misma clave, mismo SDK, mismo comportamiento de caché ya medido |
| 4 | **GLM-4.7** | ~$0.0060 | 6.7× | cache read $0.11, muy fuerte en agentic/tool use |
| 5 | **Kimi K2.5** | ~$0.0060 | 6.7× | cache read $0.10, 256k contexto, buen tool use |
| 6 | **Claude Sonnet 5** | ~$0.026** | 1.5× | control: ¿el salto de calidad justifica 7× sobre Flash-Lite? |

\* Sobre el perfil real medido: 25.833 tokens de contexto y ~35 tokens de salida por turno, sin asumir aciertos de caché.
\** Incluyendo el +30% de tokenizador; precio introductorio, sube el 1-sep-2026.

### Nivel 1 — micro/estructurado (6.1% del gasto)

`GLM-4.7-Flash` (gratis) · `Qwen3.5 Flash` (~$0.07) · `Gemini 3.1 Flash-Lite` (~$0.25) · `Haiku 4.5` (control actual).

### Nivel 3 — escalada

`Claude Sonnet 5` · `Gemini 3.1 Pro` · `GPT-5.5`. Solo se benchmarkean en los 3-4 casos difíciles.

---

## 5. Descartados, y por qué

| Descartado | Motivo |
|---|---|
| **DeepSeek V4-Flash** (a pesar de ser 24× más barato) | Datos almacenados en China; los ToS **permiten entrenar con datos de API**; sin compromiso público de zero-retention; precedente del Garante italiano por GDPR; y subida de precio "significativa" ya anunciada sin fecha. Isabel guarda salud, restricciones médicas, sueño, finanzas y datos operativos de VistaJet. **Se puede benchmarkear con el corpus sintético (sin datos reales) para fijar la frontera precio/calidad, pero no se propone para runtime.** |
| **MiniMax M2** | Sin tarifa de input cacheado. Con 25.8k de contexto repetido por turno, la ventaja de precio se evapora. |
| **Cohere** | Orientado a RAG/enterprise, sin ventaja de precio ni de tool use conversacional. Sin encaje. |
| **Together / Fireworks / DeepInfra / Novita / NVIDIA / Hugging Face** | Son hosts de los mismos modelos open-weight que OpenRouter ya alcanza con una sola clave. Añadir cuenta, clave y adapter para cada uno multiplica superficie sin añadir capacidad. |
| **Groq / Cerebras como runtime principal** | Optimizan latencia, no coste con contexto repetido: no tienen prompt caching. Isabel no es sensible a latencia (Telegram, cron). Cerebras sí es interesante como **fallback gratuito** (1M tok/día). |
| **Ollama / LM Studio locales** | El runtime vive en Railway (contenedor sin GPU) y el portátil de Estefanía no está encendido 24/7. Un cron de las 08:00 no puede depender de que el portátil esté abierto. **Reconsiderable solo si algún día hay un mini-PC siempre encendido en casa.** |
| **xAI Grok** | Sin ventaja de precio sobre Gemini Flash-Lite ni de calidad demostrada en español; añade un proveedor más sin resolver nada. |
| **Mistral** | No descartado del todo: es el único con jurisdicción UE nativa. Pero su precio ($2/$6 en Large) no compite y no publica tarifa de input cacheado. **Reserva para el caso de que la privacidad UE se convierta en requisito duro.** |
| **Opus / GPT-5.5 / Fable como modelo por defecto** | 5-10× el coste de Sonnet para un caso de uso que es "¿qué miro primero hoy?". Solo escalada explícita. |

---

## 6. Arquitectura de cerebros recomendada: **3 niveles, no 5**

El benchmark aún no ha corrido, pero el **tráfico real ya medido** dice cuántos niveles hay: hoy existen exactamente dos formas de trabajo con IA (37 llamadas estructuradas cortas + 63 turnos conversacionales) y una capa determinista que es la mayoría del sistema. Definir cinco niveles sería escribir cinco políticas de enrutado para dos cargas reales.

```
LEVEL 0 — SIN MODELO  ·  presupuesto $0, NO NEGOCIABLE
  Priority engine, señales, SQL, parser de Gym, gate proactivo,
  dedup, delivery, renderers.  Hoy: ~100% de los ticks.
  → La palanca más barata sigue siendo AMPLIAR este nivel.

LEVEL 1 — MICRO  ·  objetivo <$0.001/llamada
  structured_extraction + structured_generation.
  Siempre detrás de un filtro determinista que ya decidió que hace falta.
  Hoy: Haiku 4.5, $0.0045/llamada, 6.1% del gasto.
  Dueño del enrutado: MODEL ROUTER de LIFEOS.

LEVEL 2 — ISABEL COTIDIANA  ·  objetivo <$0.005/turno (hoy $0.0405)
  Conversación, memoria contextual, coordinación de tools MCP.
  Hoy: Sonnet 4.6 vía OpenClaw, 93.9% del gasto.
  Dueño del enrutado: OPENCLAW (primary + fallbacks).

LEVEL 3 — ESCALADA  ·  excepcional, con motivo registrado
  Razonamiento fuerte Y fallback de último recurso: el mismo nivel.
  Dueño: OpenClaw fallback chain.
```

**Por qué se fusionan los niveles 3 y 4 del planteamiento original.** Un "premium" separado de un "fallback" solo tiene sentido si son modelos distintos elegidos por motivos distintos. Aquí no: cuando L2 falla, lo que quieres es el modelo más capaz disponible; y cuando una tarea justifica más potencia, quieres exactamente lo mismo. Dos nombres para una cadena sería una política de más que mantener, y `DECISIONS.md` D41 ya demostró que el coste de las políticas de más se paga en bugs.

**Regla de asignación, en una frase:** *el modelo más barato que resuelva la tarea de forma fiable* — y "fiable" lo define el benchmark, no la intuición. Un tick silencioso sigue teniendo presupuesto de IA **cero**; `runWithoutAI()` lo arma y el router lo hace cumplir para cualquier proveedor futuro.

---

## 7. Directo vs OpenRouter vs híbrido

| | A) Directo | B) Todo por OpenRouter | C) **Híbrido** |
|---|---|---|---|
| Precio token | referencia | igual (**sin markup**) | igual |
| Sobrecoste | 0 | 5.5% al recargar (Stripe) | 5.5% solo sobre el gasto de exploración |
| Nº de cuentas para benchmarkear 8 modelos | **8** | **1** | 1 + la ganadora |
| Fallback | lo implementas tú | automático entre proveedores | OpenClaw en L2 + OpenRouter en la cola |
| Privacidad | contrato directo con cada proveedor | un intermediario más; cero logging por defecto | datos sensibles por ruta directa |
| Observabilidad | usage de cada proveedor | **coste reportado unificado** (resuelve G5) | ambas |
| Latencia | mínima | +1 salto | mínima donde importa |
| Lock-in | por proveedor | por el agregador | ninguno dominante |
| Complejidad operativa | N claves, N cuentas | 1 clave | 2 claves |

**Recomendación: C, con esta forma concreta.**

- **Fase de benchmark: todo por OpenRouter.** Una sola clave, un solo recargo, coste reportado unificado, y evita abrir 8 cuentas para descartar 7. Esto por sí solo justifica OpenRouter en esta fase.
- **Runtime de L2 (el 94% del gasto): proveedor DIRECTO**, el que gane. Sin salto extra, con la caché nativa del proveedor y sus rate limits de primera parte.
- **OpenRouter permanece como cadena de fallback y banco de pruebas de la cola larga**, nunca como dependencia obligatoria de la ruta caliente.
- **Nunca** se convierte OpenRouter en el único camino: si cae, Isabel sigue hablando por el proveedor directo.

OpenClaw soporta OpenRouter de forma nativa (OAuth y API key) e **inyecta `cache_control` de Anthropic en refs `openrouter/anthropic/*`**, y permite `contextPruning.mode: "cache-ttl"` en `openrouter/deepseek/*`, `openrouter/moonshot*/*` y `openrouter/zai/*` porque OpenRouter gestiona el caché del proveedor. Es decir: la ruta de benchmark no pierde caché.

---

## 8. División LIFEOS Router ↔ OpenClaw

El riesgo que planteas —dos routers con lógica contradictoria— es real, y **Codex ya lo evitó, probablemente sin decirlo del todo**: `AGENT_CONVERSATION` existe en `MODEL_CAPABILITIES` pero **no tiene ruta** en `routes`. Eso no es un hueco: es la frontera. Conviene hacerlo explícito en vez de "arreglarlo".

**Regla única: exactamente un router decide una llamada dada. Nunca dos.**

| | LIFEOS Model Router | OpenClaw |
|---|---|---|
| Decide proveedor/modelo para | `structured_extraction`, `structured_generation` (L0/L1) | `agent_conversation` (L2/L3) |
| Cadena de fallback | `routes[capability]`, ordenada | `agents.defaults.model.primary` + `.fallbacks` |
| Rotación de claves | no | sí (`<PROVIDER>_API_KEYS`, rotación solo ante rate-limit) |
| Reintentos / cooldown / probes | no | sí (probe del primario cada 5 min, override `auto`) |
| Prompt caching | no lo expresa (G4) | `cacheRetention: none\|short\|long`, por defecto/modelo/agente |
| Guardarraíl `runWithoutAI()` | **sí, por intento** | no aplica (fuera del tick) |
| Registro de coste | `logAiUsage` en el observer | `usageSweep` leyendo `chat.history` |

**Lo que LIFEOS conserva sobre la conversación, y que NO es enrutado:** medición (`usageSweep`), presupuesto (`proactiveBudget`: 6 entregas/día, 1/hora, $0.30/día, 3 turnos/día) y la vía de entrega que **no gasta turno de agente** (tool `message`, D38). Eso es *política*, y la política sí es de LIFEOS.

**Cómo se escribe en código, sin ambigüedad:** que `routes[AGENT_CONVERSATION]` no quede simplemente vacío, sino declarado como delegado —p. ej. `{ delegated_to: 'openclaw' }`— para que el error tipado diga *"esta capacidad la enruta OpenClaw"* en vez de *"no hay ruta"*. Un test que falle si alguien añade un adapter de conversación al router directo cierra la puerta de forma permanente, igual que el guardarraíl de D42 que cuenta bloques de dominio.

---

## 9. Benchmark: auditoría del corpus A–O y propuesta

El corpus de Codex (15 casos, `schema_version: 1`, validado sin gastar) es un buen esqueleto y **no es suficiente**. Ocho hallazgos:

### Bloqueantes

- **B1 — 5 de 15 casos no pueden ejecutarse.** Los casos A, B, I, O declaran `capability: agent_conversation`, que **no tiene ruta**. Y el caso **C declara `capability: "tool_calling"`, que no existe en `MODEL_CAPABILITIES`**. `validateCorpus()` no comprueba pertenencia de la capability, así que valida en verde y reventaría en ejecución con `no_route_for_capability`. → añadir esa comprobación al validador.
- **B5 — el scoring producirá rankings falsos.** Es coincidencia de subcadenas. El caso O exige `must_not_include: ["bien"]`: una respuesta perfecta como *"No tengo ese dato. ¿Te viene **bien** que te lo pregunte mañana?"* suspende. El caso A exige la palabra literal `"paso"`: *"lo siguiente más pequeño sería…"* suspende. Con esto, el modelo que gane será el que use el vocabulario del test, no el mejor. → sustituir por comprobaciones semánticas (rúbrica con modelo juez barato + reglas duras solo donde el literal importa, como cifras inventadas).
- **B8 — el corpus no mide la carga que cuesta el dinero.** Ningún caso reproduce la forma real: ~25.8k de contexto **con tools MCP presentes** y varias tools por turno. El caso I es contexto largo pero sin tools. **El 94% del gasto no está representado.**

### Importantes

- **B3 — `context_profile` es una promesa sin implementación.** `{generator: "repeat_anonymized_operational_notes", approx_tokens: 30000}` — ese generador no existe. Los 30k están bien elegidos (la mediana real es 25.833).
- **B4 — `fault_injection` (J, K, L, M) tampoco está implementado.** Necesita proveedores falsos en el runner. Son los casos **más baratos ($0) y más valiosos**: hay que implementarlos primero, y además ejercitan G1 (timeout) y G6 (razón de fallback).
- **B6 — faltan dimensiones que pediste**: adherencia a schema (hoy solo se comprueba *presencia* de claves), **argumentos** de tool (hoy solo el *nombre*), refusal/fail-closed conversacional, tokens cacheados, y calidad de español más allá de subcadenas.
- **B7 — 15 casos × 1 ejecución no sostienen una afirmación de fiabilidad.** Mínimo 3 pasadas.
- **B2 — latencia p50/p95** requiere las 3 pasadas; hoy el harness solo registra el reloj de pared de una.

### Corpus propuesto: A–O + P–W

Se conservan los 15 y se añaden 8, todos con datos sintéticos y **cero datos personales nuevos**:

| Nuevo | Qué mide | Por qué |
|---|---|---|
| **P** | Turno agéntico real: 25k de contexto + 6 definiciones de tool MCP + intención que exige elegir una | Es la forma del 94% del gasto |
| **Q** | Argumentos de tool correctos (matrícula, fecha, cantidad), no solo el nombre | B6 |
| **R** | Adherencia a JSON Schema estricta (tipos, enums, campos obligatorios), no presencia de claves | G8 + B6 |
| **S** | Fail-closed conversacional: dato ausente + presión del usuario para que lo invente | `PRINCIPLES.md` #2 |
| **T** | Español de España natural, con jerga operativa real (HOTO, rotación, ON/OFF) | B6 |
| **U** | Eficiencia de caché: misma petición 3 veces, medir `cached_tokens` reales por proveedor | Es la variable que decide la factura |
| **V** | Rechazo correcto de instrucción fuera de alcance (no ejecutar, solo registrar — patrón D39) | seguridad |
| **W** | Contexto largo con dato ancla **y** distractores contradictorios | I es demasiado fácil |

Métricas por caso: acierto, adherencia a schema, tool + argumentos, alucinación, latencia p50/p95, `input/output/cached_tokens`, coste reportado vs estimado, errores/rate limits/timeouts, comportamiento de fallback. **Nada de rankings sin ejecución real** (regla que ya está en `NEXT_SESSION.md`).

---

## 10. Coste estimado del benchmark

Perfil de tokens por modelo y pasada completa (A–W, 23 casos; J/K/L/M son fixtures de fallo y cuestan $0): **~110.000 tokens de entrada y ~4.500 de salida**, dominados por P, U, W e I (contexto de 25-30k).

| Escenario | Contenido | Coste estimado |
|---|---|---|
| **1. Smoke** | 6 casos cortos × 8 modelos, sin contexto largo | **~$0.10** |
| **2. Completo** | 23 casos × 8 modelos, 1 pasada | **~$0.85** (rango $0.60–1.20) |
| **3. Completo ×3** | estabilidad y p95 | **~$2.55** (rango $1.80–3.60) |

Desglose de la pasada completa por modelo (110k in / 4.5k out): Sonnet 4.6 $0.398 · Sonnet 5 $0.265 · Haiku 4.5 $0.133 · Gemini 3.5 Flash $0.206 · Gemini 3.5 Flash-Lite $0.044 · GLM-4.7 $0.076 · Kimi K2.5 $0.080 · Qwen3.5 Flash $0.009. Suma ≈ $1.21 con los 8; ~$0.85 si se excluye Sonnet 4.6 de las pasadas repetidas usando su baseline ya medida.

**Marco honesto:** el benchmark completo ×3 cuesta aproximadamente **un mes de producción actual** (~$2.72). Con €20 (~$22) de crédito, es el ~12% del saldo para decidir un cambio que puede dividir la factura entre 10.

**No se ejecuta nada de esto sin tu aprobación explícita.**

---

## 11. Ahorro potencial frente al runtime actual

Base: $2.716/30 días. La palanca **más rentable no requiere cambiar de proveedor**.

### Palancas sin proveedor nuevo (hacer primero)

| Palanca | Ahorro/30d | Riesgo | Nota |
|---|---|---|---|
| **`cacheRetention: "none"` SOLO para turnos aislados** (cron, mensajes sueltos) | **~$0.49 (18%)** | bajo | Ver la corrección abajo |
| Reducir el contexto por turno un 30% (`--light-context` en cron, `contextPruning: cache-ttl`, menos skills) | **~$0.76 (28%)** | medio — hay que medir qué ocupa el contexto antes de recortar |
| Heartbeat `every: "55m"` para mantener caché caliente | variable | medio — puede generar turnos que hoy no existen |

> **Corrección a la palanca que reporta `/v1/usage/analysis`.** El endpoint anuncia $0.4946 de ahorro por `cacheRetention: "none"`, calculado sobre los 659.411 tokens de escritura desperdiciados × el recargo de 0.25×. Ese número **solo es correcto si la política se aplica exclusivamente a los turnos aislados**. Aplicado globalmente, los 127.474 tokens que hoy SÍ se leen a $0.30/M pasarían a pagarse a $3.00/M (+$0.344), y el ahorro neto caería a **~$0.15 (6%)**. Y hay una complicación real: `cacheRetention` se configura por defecto global, por modelo o **por agente** — y hoy el cron y Telegram comparten el agente `main`, así que separarlos exige un agente propio para el cron, no un simple cambio de config. Es un cambio de diseño pequeño, pero no es un interruptor.

### Palancas con proveedor nuevo (después del benchmark)

| Escenario | Conversación | Light AI | Total/30d | vs hoy | €20 duran |
|---|---|---|---|---|---|
| **Hoy** (Sonnet 4.6 + Haiku 4.5) | $2.550 | $0.166 | **$2.716** | — | ~8 meses |
| L2 → Haiku 4.5 | $0.800 | $0.166 | $0.966 | −64% | ~23 meses |
| L2 → Gemini 3.5 Flash | $1.200 | $0.166 | $1.366 | −50% | ~16 meses |
| **L2 → Gemini 3.5 Flash-Lite + L1 → Flash-Lite** | $0.240 | $0.050 | **$0.290** | **−89%** | **~75 meses** |
| L2 → GLM-4.7 / Kimi K2.5 + L1 → GLM-Flash | $0.480 | $0.000 | $0.480 | −82% | ~45 meses |
| Todas las palancas $0 aplicadas, sin cambiar proveedor | ~$1.30 | $0.166 | ~$1.47 | −46% | ~15 meses |

**El encuadre que importa, y que ninguna tabla dice sola.** Al ritmo actual (2,1 turnos/día) €20 ya duran ~8 meses: **hoy no hay una emergencia económica.** Lo que no escala es el coste *por turno*: si Isabel pasa a 10 turnos/día —que es lo que un asistente diario usado de verdad significa— la factura sube a ~$13/mes y €20 duran 7 semanas. **La decisión no es "cómo pago menos este mes", es "cuánto puedo usar a Isabel sin pensar en el saldo".** A $0.0038/turno son ~5.800 turnos por €20; a $0.0405/turno son 540.

---

## 12. Claves y cuentas necesarias para la fase siguiente

| # | Cuenta | Para qué | Coste de entrada | Quién la crea |
|---|---|---|---|---|
| 1 | **OpenRouter** | benchmarkear GLM, Kimi, Qwen, Grok, Llama y DeepSeek con **una sola clave**; además reporta coste real (resuelve G5) | recarga de ~$10 + 5.5% Stripe | **tú** — yo no creo cuentas ni introduzco datos de pago |
| 2 | **Google AI Studio** | Gemini directo. Free tier con **términos de servicio de pago por estar en la UE** → sin entrenamiento con tus prompts | **€0** | tú |
| 3 | Anthropic | ya existe — es la baseline | — | — |
| 4 | *(opcional, tras decidir)* clave directa del ganador | sacar L2 del salto por OpenRouter | según proveedor | tú |

Las claves se configuran como variables de entorno en Railway. **No pediré, ni imprimiré, ni rotaré ninguna clave.** La rotación de `ANTHROPIC_API_KEY` sigue siendo tuya y sigue pendiente.

---

## 13. Riesgos

| | Riesgo | Impacto | Mitigación |
|---|---|---|---|
| **R1** | **"Sonnet 5 es más barato" es falso en la práctica.** El precio introductorio es $2/$10 (vs $3/$15 de 4.6), pero los modelos 4.7+ usan un tokenizador que produce **~30% más tokens** — coste efectivo ~$2.60/M hasta el 31-ago y **~$3.90/M desde el 1-sep, un 30% MÁS caro que hoy**. | alto | No migrar a Sonnet 5 por precio. Si se migra, medir tokens reales antes. |
| **R2** | **Elegir con un benchmark roto.** Con el scoring actual (B5) el ganador sería el que use el vocabulario del test. | **alto** | Arreglar B1/B5/B8 **antes** de gastar un dólar. |
| **R3** | **Privacidad en proveedores chinos.** DeepSeek almacena en China y sus ToS permiten entrenar con datos de API; Moonshot, Z.AI, Qwen y MiniMax están en la misma jurisdicción. Isabel guarda salud, restricciones médicas, sueño, finanzas y datos operativos de VistaJet. | **alto** | Benchmark solo con corpus sintético. Ninguno pasa a runtime sin decisión explícita tuya. Gemini (EEE) y Anthropic son las opciones sin este problema. |
| **R4** | **Precios volátiles.** DeepSeek ya anunció subida "significativa" sin fecha; Sonnet 5 sube el 1-sep. La tabla de `aiUsage.js` envejece en silencio. | medio | Preferir el `cost` reportado por el proveedor (G5) sobre la tabla propia. Fechar toda tabla de precios. |
| **R5** | **G8 + modelo barato = JSON roto.** El parseo actual es "quitar vallas y `JSON.parse`". Los modelos baratos fallan más ahí, y `/v1/now` e Inventario dependen de ello. | **alto** | Cerrar G8 (schema enforcement o JSON forzado por tool) antes de migrar L1. |
| **R6** | **G1: sin timeout.** Un proveedor nuevo colgado cuelga la petición y el fallback nunca corre. | alto | Cerrar G1 antes de conectar el 2º proveedor. |
| **R7** | **Routers anidados.** Si mañana alguien añade una ruta de conversación al router directo, habrá dos políticas contradictorias. | medio | Declarar `AGENT_CONVERSATION` como delegado + test que falle si aparece un adapter conversacional (§8). |
| **R8** | **Free tier de Gemini con rate limits.** Un límite alcanzado a las 08:00 silencia el cron de sueño. | medio | Free tier solo para benchmark y L1; L2 sobre tier de pago, con fallback declarado. |
| **R9** | **Más proveedores = más secretos.** Con `ANTHROPIC_API_KEY` aún sin rotar y `API_KEY` de producción siendo un literal público, añadir 2-3 claves amplía una superficie ya comprometida. | medio | Rotar antes de ampliar, o al menos no ampliar sin rotar. Es tuya la decisión. |
| **R10** | **El benchmark mide una foto.** Los modelos cambian bajo el mismo nombre. | bajo | Repetir el smoke trimestralmente; guardar respuestas reales, no solo puntuaciones. |

---

## 14. Recomendación concreta

**Orden propuesto. Nada de esto se ejecuta sin tu aprobación.**

**Paso 1 — Arreglar el instrumento antes de usarlo (coste $0, sin tocar producción).**
Cerrar **G1** (timeout/abort por intento), **G8** (adherencia a schema real) y **G6** (bug de una línea en `fallback.reason`); añadir al validador la comprobación de que la `capability` existe (**B1**); reescribir el scoring (**B5**); implementar los fixtures de fallo J–M y el generador de contexto largo (**B3/B4**); añadir los casos **P–W**, sobre todo **P** y **U**, que son los únicos que miden la carga que cuesta el dinero. Decidir un benchmark con un instrumento roto es el peor resultado posible de esta fase.

**Paso 2 — Cobrar el ahorro que no depende de ningún proveedor (coste $0).**
Medir **qué** ocupa esos 25.833 tokens de contexto por turno. Es la palanca de ~28% y hoy nadie sabe la respuesta — `usage/analysis` mide el tamaño, no la composición. Y separar el agente del cron para poder poner `cacheRetention: "none"` solo donde nunca se lee la caché (~18%). Juntas, ~46% sin conectar nada.

**Paso 3 — Abrir dos cuentas: OpenRouter y Google AI Studio.** Una clave para toda la cola larga, y Gemini directo con términos UE sin coste.

**Paso 4 — Smoke (~$0.10)** sobre 6 casos × 8 modelos. Si el instrumento no distingue modelos que sabemos distintos, volver al paso 1.

**Paso 5 — Completo ×3 (~$2.55)** y decidir L2 con datos.

**Mi apuesta, para que quede escrita antes de medir y se pueda comprobar si acierto:** el ganador de L2 será **Gemini 3.5 Flash-Lite** (10,6× más barato, cache read $0.03, términos UE sin entrenamiento) con **Haiku 4.5 como fallback** (cero integración nueva, comportamiento ya medido). L1 se irá a **Gemini 3.1 Flash-Lite** o se quedará en Haiku, porque el 6.1% no justifica riesgo. **Los niveles útiles serán tres, no cinco.**

**Y la recomendación incómoda:** hoy €20 duran ~8 meses. Si lo que quieres es que duren mucho **al ritmo actual**, el paso 2 solo ya lo lleva a ~15 meses sin conectar nada ni arriesgar calidad. El multi-proveedor merece la pena por lo otro: por poder usar a Isabel 10 veces al día sin mirar el saldo. Si esa no es la intención, el paso 2 puede ser todo lo que hace falta.

---

## Addendum de cierre $0 — 2026-08-09

- G1 y G6 estan corregidos. G8 no se cambio en produccion; el benchmark ya prueba schema estricto.
- A-W esta completo y conserva 23 casos. Se agregaron `JETMI-01..10` y `SENS-01..04`: 37 casos en total, todos sinteticos.
- `node benchmarks/model-router/run.mjs --fixtures`: J-M 4/4 PASS, coste reportado $0; no se conecto proveedor.
- O4 esta desplegada y demostro barrido automatico sin `/v1/chat`.
- El catalogo real actual son 47 tools; P1/O3 estan disenadas y NO aplicadas.
- La tabla de coste inicial cobraba por error 150 lecturas deterministas LIFEOS/dia como L1. Corregida: ISABEL 150% = €81,37 actual; €41,16 P1; €22,43 Haiku; €8,86 Gemini hipotetico; €11,77 mixta.
- No usar la frase "€20 duran X meses" hasta acumular baseline posterior al heartbeat. Desde `13:22Z` hasta el checkpoint no hubo ningun turno de modelo, pero la ventana aun es demasiado corta para proyectar.

---

## Addendum — decisión tomada, 2026-09-21

La decisión dejó de estar pendiente: ver `DECISIONS.md` **D47**. Lo que cambia respecto a este documento:

1. **§5 y R3 quedan anulados por la usuaria.** Estefanía decidió que la jurisdicción no filtra proveedores ("me da completamente igual que los chinos se enteren de mi salud"). Prioridad declarada: precio, eficiencia y versatilidad. No volver a filtrar candidatos por privacidad sin que ella lo pida.
2. **Primer runner real:** `isabel-api/benchmarks/model-router/run-openrouter.mjs` (`92ff51a`). Tope duro por coste reportado; clave desde el entorno de Railway, nunca impresa.
3. **Smoke ejecutado** — 9 casos (A, C, O, P, Q, S, T, V, W) × 8 modelos, precios de `openrouter.ai/api/v1/models` consultados ese día, **0,21 $** en total:

| Modelo | Aprobados | Tools | Coste 9 casos | Latencia mediana | Lectura de las respuestas |
|---|---|---|---:|---:|---|
| anthropic/claude-haiku-4.5 | 8/9 | 3/4 | 0,0731 $ | 2,6 s | referencia |
| **deepseek/deepseek-v4-flash** | 7/9 | 3/4 | **0,0068 $** | 5,3 s | O y S son falsos negativos (se negó a inventar; el corrector casó un "por ejemplo, 70 kg") |
| qwen/qwen3.8-flash | 6/9 | 3/4 | 0,0096 $ | 7,2 s | **respuestas vacías** en S y V |
| google/gemini-3.5-flash-lite | 6/9 | 3/4 | 0,0188 $ | 1,3 s | A es falso negativo; en V **ejecutó `sessions_close_all`** |
| moonshotai/kimi-k2.5 | 6/9 | 3/4 | 0,0424 $ | 7,8 s | — |
| deepseek/deepseek-v4.1-flash | 5/9 | 3/4 | 0,0145 $ | 8,8 s | — |
| openai/gpt-5.6-luna | 4/9 | 0/4 | 0,0074 $ | 1,9 s | 400 en todas las peticiones con tools por esta vía |
| z-ai/glm-4.7 | 3/9 | 3/4 | 0,0279 $ | 13,2 s | — |

4. **El instrumento todavía miente en dos sitios.** El caso **V** lo suspenden los 8 modelos, Claude incluido: exige una tool concreta (`questions_mark_answered`) cuando negarse sin tool es igual de correcto. Y el scoring por `mentions`/`forbid` sigue dando falsos negativos (B5 no está del todo cerrado). **Leer siempre las respuestas con `--show` antes de fiarse de la tabla.**
5. **OpenRouter va directo, no detrás del proxy de presupuesto**, porque OpenClaw desactiva sus ajustes de OpenRouter con un `baseUrl` propio. El freno es el prepago más el límite de la clave. Ver D47.
6. **Coste real medido:** un mensaje de Telegram costó 0,0038 $ (3 llamadas) con DeepSeek, frente a 0,113 $ (2 llamadas) con Sonnet 4.6 esa misma mañana.
