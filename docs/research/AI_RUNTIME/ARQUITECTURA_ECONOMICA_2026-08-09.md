Estado: fases A–F ejecutadas · decisión de proveedor PENDIENTE
Última verificación: 2026-08-09
Verificado en: trayectorias reales del Gateway, `count_tokens` de Anthropic ($0), `openclaw config/status/cron/channels`, simulador con precios oficiales fechados, 497/497 pruebas
Fuente de verdad de datos: ninguna

# Isabel como orquestador de inteligencia — economía y runtime multi-modelo

Objetivo: que Isabel pueda hacer **todo** lo que LIFEOS debería hacer, con un techo de diseño de ~€20/mes. No "recortar Isabel hasta que quepa", sino maximizar capacidad útil por euro.

---

## 1. Qué se verificó antes de tocar nada

Las 14 conclusiones heredadas se volvieron a comprobar. **Once se confirman, tres se corrigen.**

### Confirmadas

| | Conclusión | Evidencia nueva |
|---|---|---|
| 1 | Heartbeat por defecto a 30 m despertando Sonnet | `trigger:"heartbeat"` ×97, `"[OpenClaw heartbeat poll]"` ×98, 74 huecos de exactamente 30 min |
| 2 | `HEARTBEAT.md` no existe | `cat` → *No such file or directory* |
| 3 | `target: none` | 0 entregas vía tool `message` en 98 turnos |
| 4 | ~98 turnos | 98 exactos en la ventana de 70 h |
| 5 | ~$3,07/día de heartbeat | $8,97 / 70 h = $3,07/día; $0,109 por ejecución |
| 6 | LIFEOS solo veía una parte del gasto | `KNOWN_SESSION_KEYS=['lifeos','main']` + barrido sin disparador |
| 7-9 | Tools en contexto | ahora **47** tools (eran 42); ~17.178 tok |
| 10 | System prompt ~5.530 tok | 5.530 → **5.375** tras desactivar el heartbeat |
| 11 | Memoria personal ~168 tok | confirmado: 6 ficheros bootstrap |
| 12 | Contexto vacío ~23.235 tok | confirmado |
| 13 | Cache-write domina | 97,2% de la factura conversacional |
| 14 | El tick proactivo funciona a $0 | `llm_invoked:false`, `NO_REPLY`, `exitCode:0` |

### Corregidas — importan

**C1. El heartbeat NO "no hacía nada".** Mi informe anterior lo dijo con un conteo mal hecho: `messagesSnapshot` es acumulativo y yo estaba sumando el historial entero en cada turno. Medido bien, por ventana temporal:

- **78 de 82 turnos válidos producen literalmente `"HEARTBEAT_OK"`** — un ack vacío.
- 5 produjeron preguntas de sueño reales (*"¿Cuánto dormiste anoche? 😴"*) **que nunca se entregaron**: `target: none`, 0 envíos.
- 12 de 98 invocaron alguna tool, 10 de ellas `lifeos_proactive_check` — exactamente lo que `proactive-tick-15m` ya hace a **$0**.
- **Cero escrituras de datos.** Ni sueño, ni VistaJet, ni gym.

El veredicto no cambia, pero el motivo sí: no es que fuera inútil, es que **duplicaba dos mecanismos más baratos y sus salidas útiles nunca llegaban a Estefanía**.

**C2. Un `config set` no basta.** `openclaw status` decía `Heartbeat │ disabled (main)` y el system prompt ya había perdido su sección — pero **a las 13:17:56 UTC se disparó otro heartbeat**. El scheduler vive en el proceso. Hizo falta reiniciar el Gateway (`railway redeploy`, mismo deployment, sin reconstruir). *Cualquier verificación de "está desactivado" que se base solo en `config get` es falsa.*

**C3. Mi conclusión "la pregunta del proveedor es secundaria" era incorrecta para el objetivo real.** Lo era para el uso de hoy. Para Isabel al 150%, no (§5).

---

## 2. Lo que se cambió en producción

| Cambio | Estado | Rollback |
|---|---|---|
| `agents.defaults.heartbeat.every: "0m"` | aplicado + Gateway reiniciado | `openclaw config unset agents.defaults.heartbeat` + reinicio |
| Mismo ajuste en `openclaw.default.json` | commiteado (no desplegado) | revertir el commit |

**Verificación posterior al reinicio**, toda en verde: heartbeat `0m` · Telegram `enabled, configured, running, connected, polling` · `proactive-tick-15m` ok · `sleep-check-0800-madrid` ok (única copia activa) · adaptador `/healthz {"ok":true}` · MCP `lifeos` presente. **No se envió ningún Telegram de prueba.**

Ahorro esperado: **$3,07/día ≈ $92/mes**, más 155 tok/turno menos de system prompt.

---

## 3. Observabilidad (O4) — implementada, sin desplegar

Dos agujeros cerrados en `isabel-api`:

1. **El barrido no tenía disparador.** Solo corría a mano o tras `/v1/chat`: si nadie chatea, nadie mide, y los turnos caros son justo los que ocurren sin nadie delante. Ahora lo dispara `proactive-tick-15m` — que ya corre cada 15 min y cuesta $0. Va **fuera** de `runWithoutAI()` a propósito: es trabajo determinista, pero un fallo del barrido no debe silenciar el tick.
2. **`KNOWN_SESSION_KEYS` era una constante enterrada.** Ahora `resolveSessionKeys()`, ampliable con `GATEWAY_SESSION_KEYS`.

Cada registro declara **dónde** ocurrió, separado de **qué** se hizo: `surface` (telegram / lifeos_app / cron / heartbeat / isabel_api), `session_key`, `trigger`, además de provider, model, capability, task, tokens, caché, coste reportado vs estimado y timestamp.

`GET /v1/usage/today?hours=24` responde *"¿cuánto costó Isabel hoy?"* separando **INTERACTIVO** (ella estaba delante) de **BACKGROUND** (el sistema solo) — el background es el recortable sin que note nada. Y **declara su propia cobertura**: cuántos registros traen `surface` y cuántos traen coste, para no fingir precisión.

> **Límite honesto:** las sesiones de cron llevan un `runId` nuevo cada ejecución y no se pueden enumerar desde `isabel-api`. Cerrarlo del todo exige una ruta nueva en `gateway-adapter.mjs` (`sessions.list`) y **un despliegue del Gateway**, que no he hecho. Hoy ese hueco vale ~1 turno/día.

---

## 4. Skills y tools — OpenClaw ya lo resuelve

**No hay que construir nada paralelo.** OpenClaw soporta de forma nativa: `tools.profile` (`minimal`/`messaging`/`coding`/`full`), `tools.allow`/`deny` con grupos (`group:fs`, `group:web`, `group:runtime`…) y comodines, `tools.byProvider`, `tools.toolsBySender`, `agents.list[].tools.*` y `tools.subagents.tools.*`.

Hoy **no hay ninguna clave `tools`**: por eso viajan las 47.

### Contexto medido por perfil (`count_tokens`, $0)

| Perfil | Tools | Tokens tools medibles | Total con system prompt |
|---|---|---|---|
| P0 · actual | 47 | 7.902 | 13.277 |
| **P1 · Isabel cotidiana** (MCP + `message` + `session_status`) | 14 | 3.553 | **8.928 (−32,8%)** |
| P2 · P1 + web | 17 | 3.932 | 9.307 |
| P3 · P1 + documentos | 17 | 4.159 | 9.534 |
| P4 · subagente coding/admin | 13 | 2.320 | 7.695 |

> Las cifras son un **suelo**: 15 tools tienen schemas que la API rechaza (draft 2020-12) y no se pueden medir sueltas — y son las más grandes (`cron` 5.524 B, `browser` 4.388 B, `exec`, `gateway`…). P1 las excluye todas, así que el ahorro real es mayor. Por diferencia contra el `totalTokens` de OpenClaw: **~23.235 → ~9.425 tok, −59%**.

### Exposición dinámica: por AGENTE, no por turno

OpenClaw no permite cambiar tools a mitad de sesión, pero sí por agente y por subagente — que encaja mejor con el objetivo:

```
agent `main` (Telegram + LIFEOS)     → P1: MCP lifeos + message + session_status
subagente `research`                 → P1 + group:web + browser
subagente `docs`                     → P1 + pdf + image + read
subagente `coding`                   → group:fs + group:runtime
admin                                → nunca por defecto; sesión explícita
```

Ventaja doble: el subagente hereda **contexto mínimo necesario** además de tools mínimas, que es justo el Agent Budget Contract. Y quita a Isabel `exec` y `gateway` de la conversación de Telegram, donde hoy puede ejecutar comandos y reescribir su propia configuración.

### Skills: 14 `ready`, ninguna de Isabel

| Clasificación | Skills |
|---|---|
| **Necesarias siempre** | *ninguna* — las capacidades de Isabel vienen de las tools MCP, no de las skills de OpenClaw |
| **Ocasionales** (subagente) | `browser-automation` (JETMI), `taskflow` (trabajo autónomo), `weather` |
| **Innecesarias** | `meme-maker`, `python-debugpy`, `node-inspect-debugger`, `skill-creator`, `spike`, `canvas`, `diagram-maker`, `healthcheck`, `node-connect`, `notion`, `taskflow-inbox-triage`, `clawhub` |

Coste del catálogo: `## Skills` 1.536 tok + `## Skill Workshop` 488 = **2.024 tok/turno**.

**No aplicado.** Requiere decisión: recortar tools y skills cambia lo que Isabel *puede* hacer, y el histórico son ~3 días.

---

## 5. ¿Cabe Isabel al 150% en €20/mes?

Simulador: `npm run cost:simulate`. La unidad no es el mensaje sino la **conversación** — el primer turno escribe el prefijo entero en caché y los siguientes solo pagan el incremento; un modelo que no lo refleje miente, porque el 97,2% de la factura es cache-write.

**ISABEL 150%** = 12 conversaciones/día de 8 turnos · 150 llamadas L1/día · 3 crons · 10 research/semana · 10 agentes/semana · documentos diarios · 96 ticks a $0.

| Arquitectura | €/mes | ¿≤ €20? |
|---|---|---|
| ACTUAL (Sonnet 4.6, 47 tools) | **€88,72** | NO |
| SOLO_CONTEXTO (perfil P1) | €48,50 | NO |
| HAIKU_EVERYDAY (L2 → Haiku 4.5) | €29,78 | NO |
| HIPÓTESIS MIXTA (L2 barato + Sonnet para L3) | **€13,53** | **SÍ** |
| HIPÓTESIS GEMINI | €10,62 | SÍ |

Y con el uso de **hoy** (NORMAL): €19,09 actual → €1,70 con la arquitectura mixta.

**La conclusión que cambia el plan: recortar contexto no basta.** Si el objetivo es Isabel al 150% bajo €20, cambiar el modelo de L2 **deja de ser opcional**. Para el uso actual sí sobra con lo hecho hoy.

### Coste unitario

| Tarea | Sonnet 4.6 · hoy | Sonnet 4.6 · P1 | Haiku 4.5 · P1 | Gemini Flash-Lite · P1 |
|---|---|---|---|---|
| Mensaje suelto (caché fría) | $0,0889 | $0,0371 | $0,0124 | $0,0031 |
| Conversación de 8 turnos | $0,1562 | $0,0754 | $0,0251 | $0,0077 |
| → por turno | $0,0195 | $0,0094 | $0,0031 | $0,0010 |
| Research de 12 pasos | $0,1710 | $0,1710 | $0,0570 | $0,0185 |
| Llamada estructurada L1 | $0,0056 | $0,0056 | $0,0019 | $0,0006 |
| Tick proactivo, priority engine, parsers, dedup, delivery | **$0** | $0 | $0 | $0 |

### JETMI

Lo importante no es cuánto cuesta investigar, sino **qué parte no necesita modelo**: descargar páginas, comparar, deduplicar y detectar cambios es determinista. El modelo solo interpreta lo que cambió.

| Escenario | Páginas/semana (a $0) | Sonnet 4.6 | Gemini 3.5 Flash |
|---|---|---|---|
| LOW — vigilancia semanal | 20 | $0,35/mes | $0,15/mes |
| NORMAL — diaria + 1 investigación | 140 | $2,47/mes | $1,10/mes |
| HIGH — diaria + investigación continua | 350 | $10,49/mes | $4,77/mes |

---

## 6. Open source / open weight: respuesta clara

**Self-hosting no tiene ningún sentido económico para este volumen.**

La GPU 24/7 más barata útil (RTX 4090, 24 GB) ronda **$0,39/h ≈ $285/mes**; una A100 80 GB, ~$1.300/mes. El techo objetivo es **€20/mes**. Es **14× el presupuesto entero solo en hardware**, antes de electricidad, disponibilidad, actualizaciones y de que alguien lo mantenga.

Punto de equilibrio: a $285/mes contra Gemini Flash-Lite ($0,30/M input) harían falta **~950 millones de tokens de entrada al mes**. El escenario 150% proyecta del orden de 10-40 M. **Habría que multiplicar el uso por 25-100 para que empatara.**

Lo que sí tiene sentido es **modelos open-weight alojados por terceros**, que dan el precio bajo sin el coste fijo: GLM-4.7-FlashX ($0,07/$0,40), Qwen3.5 Flash ($0,07/$0,26), GPT-OSS-120B en Fireworks ($0,15/$0,60) o Cerebras (1 M tokens/día gratis). Ahí "open weight" es una palanca de precio real; "self-hosted" no.

---

## 7. Arquitectura propuesta

### Niveles: **cuatro**, derivados de las cargas reales

```
L0 · SIN MODELO       presupuesto $0, no negociable
                      priority engine, señales, SQL, parsers, dedup,
                      delivery, timers, fetch/diff de JETMI
L1 · MICRO            clasificación, extracción, JSON, normalización
                      objetivo < $0,001/llamada
L2 · ISABEL COTIDIANA conversación, tools MCP, español natural
                      objetivo < $0,005/turno  (hoy $0,0195)
L3 · RAZONAMIENTO     decisiones complejas, análisis, ambigüedad
                      Y fallback de último recurso: el mismo nivel
L4 · ESPECIALISTA     research web, documentos, visión, coding
                      vive en SUBAGENTES con tools y contexto propios
```

Se fusionan "premium" y "fallback" (serían dos políticas para una cadena). Se separa L4 porque no es un modelo más potente sino **otra forma de trabajo**: subagente, tools distintas, contexto mínimo, presupuesto propio.

### Routing económico, sin usar un LLM para elegir LLM

```
task → ¿determinista? → sí → L0, fin
                      → no → modelo más barato capaz para (capability, sensibilidad)
                             → validación DETERMINISTA del resultado
                                • structured: ¿cumple el schema?      → no ⇒ escalar
                                • tool call:  ¿tool y args válidos?   → no ⇒ escalar
                                • fail-closed: ¿inventó un dato?      → no ⇒ escalar
                             → escalar solo al siguiente escalón, nunca directo a premium
```

Las señales de routing son `capability`, `task`, requisitos de schema, sensibilidad, histórico del benchmark y validación determinista. **Ninguna cuesta dinero.**

### Presupuestos jerárquicos

Ya existe `proactiveBudget` (6 entregas/día, 1/hora, $0,30/día, 3 turnos/día). Se extiende con el mismo patrón — techos, no cuotas, y **fail closed**:

| Ámbito | Tope propuesto | Justificación |
|---|---|---|
| global/día | $0,70 | €20/mes ÷ 30 ≈ $0,72 |
| background/día | $0,25 | crons + specialists; hoy proyecta ~$0,10 |
| conversación/día | $0,30 | 12 conv × 8 turnos a $0,001 = $0,10; ×3 de margen |
| research/run | $0,05 | 12 pasos × Gemini Flash = $0,018; ×2,5 |
| agente/run | $0,05 | igual |
| por tarea | $0,02 | una tarea normal nunca debería acercarse |

Mecanismos: `max_steps`, `max_tokens`, `max_cost`, `timeout`, `fallback ceiling`, detección de duplicados por `reason_signature` (ya existe) y **circuit breaker**: 3 fallos seguidos del mismo tipo ⇒ el nivel se apaga hasta el día siguiente y se registra el motivo. Los topes diarios no admiten excepción, porque un bug también produce `blocking`.

### Agent Budget Contract

Todo run autónomo declara **antes de empezar** y registra **al terminar**:

```
ANTES:  objective · capabilities · allowed_tools · model_tier · max_steps
        max_cost_usd · timeout_s · output_contract · sensitivity
DESPUÉS: actual_cost · steps_used · models_used · result · failure_reason
```

**Un subagente no hereda el contexto personal de Isabel.** Recibe lo mínimo necesario para su objetivo. Esto es a la vez privacidad y coste: los $0,17 de un research de 12 pasos con Sonnet bajan a $0,018 con contexto de subagente y modelo barato.

### Clasificación de sensibilidad

| Nivel | Ejemplos | Proveedores admisibles |
|---|---|---|
| `PUBLIC` | precios de mercado, webs de brokers, datos JETMI públicos | cualquiera |
| `PERSONAL` | agenda, tareas, gym, preferencias | UE/US con no-training contractual |
| `SENSITIVE` | finanzas, VistaJet operativo, pasaportes | Anthropic, Google (términos de pago) |
| `HIGHLY_SENSITIVE` | salud, informes médicos, restricciones clínicas | solo Anthropic; nunca a un benchmark |

**Los benchmarks usan exclusivamente fixtures sintéticos.** El corpus A–W no contiene ni una matrícula, persona, cifra de salud o dato operativo real.

### Frontera de routers, ya blindada por test

| | LIFEOS Model Router | OpenClaw |
|---|---|---|
| Decide | `structured_extraction`, `structured_generation`, `tool_calling` (L0/L1) | `agent_conversation` (L2/L3) y subagentes (L4) |
| Fallback | `routes[capability]` | `model.primary` + `.fallbacks` |
| Rotación de claves, cooldowns, probes | no | sí |
| Prompt caching | no lo expresa | `cacheRetention` |
| Guardarraíl `runWithoutAI()` | sí, por intento | no aplica |

`agent_conversation` está declarada **DELEGADA**: el router devuelve `capability_delegated` en vez de "falta una ruta", y un test impide registrar un adapter conversacional en el router directo. **Un router decide una llamada. Nunca dos.**

---

## 8. Shortlist

Sin conectar nada. La hipótesis la tiene que demostrar el benchmark.

| Papel | Candidato principal | Alternativa | Por qué |
|---|---|---|---|
| **A · L1+L2 barato** | Google Gemini 3.5 Flash-Lite | Gemini 3.1 Flash-Lite (L1) | $0,30/$2,50, cache read $0,03; **términos de pago en el EEE incluso en free tier** → no entrena con los prompts; tool calling maduro; soporte nativo en OpenClaw |
| **B · L3 fuerte** | Anthropic Claude Sonnet 4.6 | Gemini 3.5 Flash | ya integrado, ya medido, cero trabajo nuevo; es el escalón de calidad |
| **C · descubrimiento y fallback** | OpenRouter | — | **sin markup** sobre inferencia (5,5% solo al recargar), una clave para toda la cola larga, cero logging por defecto, fallback automático |

Descartados y por qué: **DeepSeek** (24× más barato pero datos en China, ToS que permiten entrenar con datos de API, subida de precio anunciada — Isabel guarda salud y datos de VistaJet) · **MiniMax** (sin tarifa de input cacheado: con 25 k de contexto repetido la ventaja se evapora) · **Together / Fireworks / DeepInfra / NVIDIA / HuggingFace** (hosts de los mismos modelos abiertos que OpenRouter alcanza con una sola clave) · **Groq / Cerebras como runtime principal** (optimizan latencia, no coste con contexto repetido; Cerebras sí es interesante como fallback gratuito) · **xAI** (sin ventaja de precio ni de español demostrada) · **Mistral** (única jurisdicción UE nativa, pero $2/$6 no compite; reserva si la privacidad UE pasa a ser requisito duro) · **self-hosting** (§6) · **Cohere** (sin encaje).

---

## 9. Riesgos

| | Riesgo | Mitigación |
|---|---|---|
| R1 | **Un `config set` no aplica solo.** Confirmado con el heartbeat: seguía disparándose con `status` diciendo `disabled`. | Verificar siempre contra la trayectoria real, no contra `config get`. |
| R2 | Recortar tools/skills basándose en ~3 días de histórico | No aplicado. Exposición **por agente**, empezando por las inequívocas, y con las capacidades disponibles en subagentes |
| R3 | Las cifras de coste vienen de una ventana de 70 h | O4 la vuelve continua en cuanto se despliegue |
| R4 | La tabla de precios envejece en silencio | Fechada, con `verified: official\|aggregator` por entrada; preferir el coste reportado por el proveedor |
| R5 | Sonnet 5: su precio introductorio engaña (+30% de tokens por el tokenizador nuevo) | Modelado en el simulador y fijado por test |
| R6 | El hueco de las sesiones de cron sigue abierto | Vale ~1 turno/día; cerrarlo exige desplegar el Gateway |
| R7 | **`ANTHROPIC_API_KEY` sigue sin rotar** | Decisión de la usuaria; el runbook existe |
| R8 | Un modelo barato puede romper el JSON de `/v1/now`, Inventario y Gym (G8 abierto) | Cerrar G8 **antes** de migrar L1; el corpus ya mide adherencia a schema |

---

## 10. Lo que hace falta de la usuaria

Ninguna clave se ha creado, pedido ni introducido.

| # | Acción | Dónde | Coste | Para qué |
|---|---|---|---|---|
| 1 | Crear cuenta y clave en **Google AI Studio** | aistudio.google.com | **€0** | Gemini directo, con términos de pago por estar en la UE |
| 2 | Crear cuenta y clave en **OpenRouter** + recargar ~$10 | openrouter.ai/keys | ~$10 + 5,5% | Benchmarkear GLM, Kimi, Qwen, Grok y Llama con **una sola** clave |
| 3 | Decidir si se despliega `isabel-api` con la observabilidad | — | €0 | Sin desplegar, O4 no mide nada |
| 4 | Decidir sobre el recorte de tools/skills | — | €0 | −59% de contexto |
| 5 | Rotar `ANTHROPIC_API_KEY` | console.anthropic.com | €0 | Riesgo abierto desde el 2026-08-06 |

Las claves van como variables de entorno en Railway. **Yo no las pido, no las imprimo y no las roto.**

Coste previsto del benchmark real: **smoke ~$0,10 · completo ~$0,85 · completo ×3 ~$2,55**. Paro y reporto antes de superar $1 acumulado.
