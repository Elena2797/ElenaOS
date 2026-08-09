Estado: medición cerrada — optimizaciones PROPUESTAS, ninguna aplicada
Última verificación: 2026-08-09
Verificado en: trayectorias reales del volumen de `isabel-gateway` (lectura), `count_tokens` de Anthropic (endpoint gratuito, $0), `openclaw config get`, tabla de precios oficial de Anthropic
Fuente de verdad de datos: ninguna (documento de análisis)

# Composición del contexto y causa real del gasto

Todo lo que sigue está **medido**, no estimado. Donde hay una estimación se dice.

Método: las trayectorias de OpenClaw (`/data/.openclaw/agents/main/sessions/*.trajectory.jsonl`) registran un evento `context.compiled` con el `systemPrompt` y las `tools` exactas que se enviaron, y un `model.completed` con el `usage` real. Se contaron los tokens con `POST /v1/messages/count_tokens` de Anthropic, que **no cuesta nada**, ejecutado dentro del contenedor para que la clave nunca salga. No se modificó producción.

---

## 1. El hallazgo que cambia el diagnóstico

**El coste real es ~$4,30/día. La instrumentación de LIFEOS reporta $2,72 en 30 días.**

Ventana medida: 2026-08-06T14:17Z → 2026-08-09T12:18Z (**70,0 h**, 161 turnos de modelo, 19 con error).

| | input | output | cache write | cache read | coste |
|---|---|---|---|---|---|
| Total real | 494 | 9.728 | **3.092.848** | 2.632.213 | **$12,535** |

A precio oficial de Sonnet 4.6 ($3 / $15 / $3,75 escritura 5 m / $0,30 lectura). Proyección: **$4,30/día ≈ $129/mes**. Con ~$22 de saldo, **cinco días**.

Esto explica por sí solo el incidente de saldo agotado del 2026-08-07 — que aparece literalmente en las trayectorias: `"Your credit balance is too low to access the Anthropic API"` en 16 turnos consecutivos del 2026-08-08 entre las 06:17 y las 13:47.

### Por qué la instrumentación no lo veía

Dos causas, ambas verificadas en el código:

1. `gatewayChat.js:166` → `KNOWN_SESSION_KEYS = ['lifeos', 'main']`. Las sesiones de cron (`agent:main:cron:<id>:run:<id>`) **no se barren nunca**.
2. El barrido (`POST /v1/usage/sweep`) solo corre a mano o tras un turno de `/v1/chat`. **Si nadie chatea, nadie mide** — y los turnos que más gastan son precisamente los que ocurren sin que nadie esté delante.

---

## 2. Causa demostrada del cache-write: el heartbeat de OpenClaw

No es el TTL. No es inestabilidad del prefijo. No es MCP. No son tool definitions dinámicas.

**Es un `heartbeat` que nadie configuró y que corre cada 30 minutos, 24 h al día.**

Evidencia directa, de las trayectorias:

```
prompt.submitted  ->  "[OpenClaw heartbeat poll]"   × 98
session.started   ->  {"trigger":"heartbeat"}       × 97
huecos entre turnos de agent:main:main  ->  {"30": 74, ...}   (74 huecos de exactamente 30 min)
```

Y la configuración:

```
$ openclaw config get agents.defaults
{ "model": {...}, "skipBootstrap": true, "maxConcurrent": 4, "subagents": {...} }
```

**No hay clave `heartbeat`.** La documentación de OpenClaw 2026.6.10 dice: *"Leave heartbeats enabled (default is `30m`…)"*. Es decir: **está activo por omisión y nunca se tomó la decisión de activarlo.**

### Coste por disparador (70 h)

| Disparador | Turnos (con error) | cache write | cache read | Coste | % | Proyección |
|---|---|---|---|---|---|---|
| **heartbeat** | 98 (16) | 2.302.035 | 1.114.662 | **$8,97** | **71,6 %** | **$3,07/día** |
| usuario | 58 (2) | 692.646 | 1.373.412 | $3,01 | 24,0 % | $1,03/día |
| cron | 4 (1) | 72.803 | 144.139 | $0,32 | 2,5 % | $0,11/día |
| sin clasificar | 1 | 25.364 | 0 | $0,10 | 0,8 % | — |

Coste medio por heartbeat: **$0,109**. Escritura de caché media por heartbeat: **28.074 tokens**.

> Los 58 turnos de "usuario" incluyen ~16 sondas de diagnóstico de sesiones de desarrollo anteriores (*"List every MCP tool you have available…"*, *"Call vistajet_get_status and reply with ONLY the raw JSON"*). El uso conversacional real de Estefanía en la ventana son ~16 mensajes de Telegram.

### Por qué escribe caché y casi nunca la lee entre turnos

`promptCache.retention` medido: **`short`** = TTL de 5 minutos. La cadencia es de 30 minutos. **Cada heartbeat encuentra la caché ya expirada por construcción**: paga el recargo de escritura (×1,25) y nunca cobra el descuento de lectura.

Los `cacheRead` grandes que sí aparecen (1,6 M) son **intra-turno**: un turno de agente hace varias llamadas al modelo y las posteriores reutilizan la caché escrita al principio de ese mismo turno. No son reutilización entre turnos.

### Y lo que lo vuelve indefendible

- El `target` por defecto del heartbeat es `"none"`: **no entrega nada**. No notifica.
- **`/data/workspace/HEARTBEAT.md` no existe.** El heartbeat despierta a Sonnet 4.6 con 28.000 tokens para ejecutar una lista de comprobación que no está escrita.
- LIFEOS **ya tiene** su bucle proactivo: `proactive-tick-15m`, determinista, con `runWithoutAI()`, coste **$0**, diseñado en D41 exactamente para no cometer este error. D41 razonó: *"96 ticks/día × 0,098 $ = 9,4 $/día — el saldo entero en dos días"*. El coste medido por heartbeat es **$0,109**, casi exactamente el número que D41 predijo. **El fallo arquitectónico que D41 evitó ya estaba ocurriendo por un default que nadie había mirado.**

---

## 3. Composición medida de los ~25.800 tokens

Sesión `agent:main:probe-lifeos`: transcript **vacío**, `totalTokens` que reporta OpenClaw = **23.235**. Es decir, **el suelo fijo de cada turno**, antes de una sola palabra de conversación.

| Categoría | Tokens | % | Cómo se obtuvo |
|---|---|---|---|
| **Definiciones de tools** | **~17.178** | **73,9 %** | por diferencia (23.235 − resto) |
| System prompt de OpenClaw | **5.530** | 23,8 % | `count_tokens`, exacto |
| System prompt de tool-use | 497 | 2,1 % | tabla oficial de Anthropic (Sonnet 4.6, `tool_choice: auto`) |
| Prompt del turno | ~30 | 0,1 % | 123 caracteres |
| Transcript / historial | **0** | — | esta sesión no tiene |
| Datos recuperados (tool results) | 0 | — | entran como transcript, no en el prefijo |

En la sesión real `agent:main:main` (`totalTokens` = 27.591), el **transcript son ~4.356 tokens (16 %)**. Es decir: **la conversación de Isabel es la sexta parte de lo que se paga; el resto es catálogo.**

### Desglose del system prompt (5.530 tok, medidos uno a uno)

| Sección | Tokens | | Sección | Tokens |
|---|---|---|---|---|
| **`## Skills`** | **1.536** | | `## Silent Replies` | 124 |
| `## Tooling` | 747 | | `## Memory Recall` | 87 |
| `## Skill Workshop` | 488 | | `## OpenClaw Self-Update` | 81 |
| `## Messaging` | 419 | | `## Model Aliases` | 81 |
| `## Control UI Embed` | 294 | | `## OpenClaw Control` | 70 |
| `## Tool Call Style` | 222 | | `## Workspace` | 33 |
| `## Documentation` | 203 | | `# Project Context` | 33 |
| `## Assistant Output Directives` | 203 | | `# Dynamic Project Context` | 23 |
| `## Inbound Context` | 175 | | `## Current Date & Time` | 11 |
| `## Execution Bias` | 166 | | `## Group Chat Context` | 5 |
| `## Runtime` | 165 | | preámbulo | 12 |
| `## Safety` | 155 | | **6 ficheros bootstrap del workspace** | **168** |

**La memoria persistente pesa 168 tokens.** Los seis ficheros del workspace (`USER.md`, `SOUL.md`, `IDENTITY.md`, `AGENTS.md`, `TOOLS.md`, `HEARTBEAT.md`) suman el 0,7 % del contexto — y `HEARTBEAT.md` ni existe. **Lo que Isabel sabe de Estefanía no es lo que cuesta.**

### Desglose de las tools (42 definiciones, 47.330 bytes)

Medición directa de 27 de las 42 (las otras 15 tienen schemas que la API rechaza por no cumplir draft 2020-12 — un dato en sí mismo):

| Grupo | Nº | Tokens netos medidos |
|---|---|---|
| MCP `lifeos__*` | 6 de 7 | **1.526** |
| Nativas de OpenClaw | 21 de 35 | **4.473** |
| No medibles (schema inválido) | 15 | ~11.200 por diferencia — y son **las más grandes**: 26.899 de los 47.330 bytes (57 %) |

Las 15 no medibles son: `cron` (5.524 B), `browser` (4.388), `skill_workshop` (2.278), `lifeos__vistajet_update_status` (2.102), `sessions_spawn`, `exec`, `nodes`, `message`, `gateway`, `memory_search`, `canvas`, `memory_get`, `update_goal`, `web_fetch`, `subagents`.

---

## 4. Qué usa Isabel de verdad

Extraído de **todo** el histórico de trayectorias (roles `toolResult` + bloques `toolCall`):

| Invocaciones | Herramienta |
|---|---|
| 257 | `lifeos__vistajet_get_status` |
| 159 | `lifeos__health_get_sleep_status` |
| 82 | `lifeos__health_register_sleep` |
| 41 | `lifeos__vistajet_update_status` |
| 35 | `lifeos__isabel_message` |
| 9 | `lifeos__lifeos_proactive_check` |
| 3 | `message` |
| 2 | `lifeos__lifeos_pending_questions` |
| 1 | `lifeos__gym_log_session` |

**Nueve tools de LIFEOS y `message`. Nada más.**

Cero invocaciones, en todo el histórico, de: `browser`, `canvas`, `cron`, `exec`, `process`, `file_write`, `file_fetch`, `dir_list`, `dir_fetch`, `read`, `write`, `edit`, `apply_patch`, `pdf`, `image`, `tts`, `web_search`, `web_fetch`, `skill_workshop`, `subagents`, `sessions_spawn`, `sessions_list`, `sessions_send`, `sessions_history`, `sessions_yield`, `nodes`, `gateway`, `memory_search`, `memory_get`, `create_goal`, `update_goal`, `get_goal`, `agents_list`, `session_status`.

Son **~33 herramientas, ~14.600 tokens en cada turno, que no se han usado ni una vez.**

Lo mismo con las skills: 14 en estado `ready`, y son `meme-maker`, `python-debugpy`, `node-inspect-debugger`, `skill-creator`, `spike`, `canvas`, `diagram-maker`, `healthcheck`, `node-connect`, `taskflow`, `taskflow-inbox-triage`, `notion`, `browser-automation`, `weather`. **Ninguna tiene que ver con VistaJet, salud, finanzas, JETMI ni gimnasio.**

---

## 5. Optimizaciones $0 propuestas

Ninguna reduce capacidades, memoria operacional, seguridad ni calidad. Ninguna toca `cacheRetention`. **Ninguna está aplicada.**

### O1 — Configurar el heartbeat (que hoy no está configurado)

**Qué:** `agents.defaults.heartbeat.every: false`. Alternativa conservadora: `every: "2h"` + `activeHours: { start: "08:00", end: "23:00" }` (48 → 8 ejecuciones/día).

**Ahorro esperado: $3,07/día (71,6 %).**

**Por qué no pierde nada:** su `target` es `"none"` (no entrega), su checklist (`HEARTBEAT.md`) no existe, y la proactividad real de LIFEOS ya la cubre `proactive-tick-15m` de forma determinista y a coste $0.

**Riesgo:** bajo. Es la única de las cinco que cambia *comportamiento* y no solo *contexto*, así que conviene desactivarla y observar 48 h antes de lo demás.

### O2 — Allowlist de tools: exponer solo las que se usan

**Qué:** `agents.defaults.tools` restringido a las 9 tools `lifeos__*` + `message`.

**Ahorro esperado: ~14.600 tokens/turno (−63 % del contexto fijo)** → sobre el gasto restante tras O1, **~$0,77/día**.

**Por qué no pierde nada:** cero invocaciones en todo el histórico (§4). Además retirar `exec`, `gateway` y `sessions_spawn` **reduce superficie de seguridad**: hoy Isabel puede ejecutar comandos y reescribir su propia configuración desde una conversación de Telegram.

**Riesgo:** medio-bajo. `message` **debe** conservarse (es la vía de entrega de D38). Reversible en un `config set`.

### O3 — Desactivar las skills que no son de Isabel

**Qué:** dejar el catálogo de skills vacío o restringido.

**Ahorro esperado: ~2.024 tokens/turno** (`## Skills` 1.536 + `## Skill Workshop` 488) → **~$0,06/día** tras O1+O2.

**Riesgo:** prácticamente nulo. Cero referencias desde LIFEOS.

### O4 — Arreglar la instrumentación (no ahorra: hace verificable todo lo demás)

**Qué:** (a) añadir las sesiones de cron y heartbeat a `KNOWN_SESSION_KEYS`; (b) disparar el barrido desde `proactive-tick-15m`, que ya corre cada 15 min, es determinista y cuesta $0.

**Ahorro: $0. Sin esto, ninguna de las cifras anteriores se puede confirmar** — y el sistema seguiría reportando $2,72/mes mientras gasta $129.

**Riesgo:** bajo. Es trabajo de base de datos dentro de un tick que ya existe; `runWithoutAI()` sigue garantizando que no despierte al modelo.

### O5 — NO propuesta todavía

`contextPruning.mode: "cache-ttl"` y `cacheRetention` se dejan fuera a propósito: tocan el contexto conversacional y el trade-off de caché, y **primero hay que ver el efecto de O1–O4**. Recortar contexto conversacional sería justo lo que pediste no hacer.

---

## 6. Impacto acumulado y nuevo coste estimado

| Escenario | Contexto fijo/turno | $/día | $/mes | €20 duran |
|---|---|---|---|---|
| **Hoy (medido)** | 23.235 | **$4,30** | ~$129 | **~5 días** |
| + O1 (heartbeat) | 23.235 | $1,23 | ~$37 | ~18 días |
| + O2 (tools) | ~8.600 | $0,40 | ~$12 | ~55 días |
| + O3 (skills) | **~6.600** | **~$0,34** | **~$10** | **~65 días** |

Aritmética por turno, que es lo que de verdad escala:

- **hoy:** 28.000 tok de escritura de caché × $3,75/M = **$0,105/turno**
- **tras O1–O3:** ~6.600 × $3,75/M = **$0,025/turno** → **−76 %**

Y con el uso conversacional **real** de Estefanía (~16 mensajes de Telegram en 70 h ≈ 5,5/día), sin las sondas de desarrollo: 5,5 × $0,025 ≈ **$0,14/día ≈ $4/mes**. **€20 pasarían a durar ~5 meses.**

**Este es el nuevo coste estimado antes de introducir ningún proveedor nuevo: entre $4 y $10/mes, frente a los ~$129/mes actuales.**

Consecuencia para la fase siguiente: **la pregunta del proveedor pasa a ser secundaria.** El sistema no está gastando de más porque Sonnet sea caro; está gastando de más porque despierta a Sonnet 48 veces al día sin motivo y le manda un catálogo de 42 herramientas de las que usa 10. Cambiar de modelo antes de arreglar esto habría dividido la factura por 10 y dejado intacto el factor 13.

---

## 7. Riesgos

| | Riesgo | Impacto | Mitigación |
|---|---|---|---|
| R1 | **El heartbeat hacía algo útil que no hemos visto.** Sus `assistantTexts` están vacíos en la muestra, pero no se revisó turno a turno. | medio | Desactivar y observar 48 h. Es reversible en un `config set`. No aplicar O2/O3 a la vez, para poder atribuir el efecto. |
| R2 | **Retirar una tool que Isabel sí necesita en un caso raro.** El histórico cubre ~3 días de trayectorias vivas, no toda su vida. | medio | Empezar por las inequívocas (`browser`, `canvas`, `pdf`, `image`, `tts`, `python`/`node` debug, `skill_workshop`, `subagents`). Dejar `message` siempre. Revisar 1 semana antes de podar el resto. |
| R3 | **Las cifras de §1 y §2 vienen de una ventana de 70 h**, no de 30 días: las trayectorias antiguas se rotan. | bajo | Es la tasa de quemado ACTUAL, que es lo relevante. O4 la vuelve continua. |
| R4 | **El precio usado es la tabla oficial, no la factura de Anthropic.** El `cost` que OpenClaw guarda venía a cero en estos registros. | bajo | Contrastar con el panel de facturación de Anthropic — eso solo lo puedes hacer tú. |
| R5 | **O4 aumenta las escrituras en `eventos`** al registrar turnos que antes no se registraban. | bajo | Es idempotente por `message_id` (D36). Volumen: decenas de filas/día. |
| R6 | **Desactivar el heartbeat elimina el "keep-warm" de caché** que la documentación de OpenClaw sugiere. | nulo en la práctica | Con TTL de 5 min y cadencia de 30 min nunca estuvo caliente: es un coste sin contrapartida. |
| R7 | **Sigue pendiente rotar `ANTHROPIC_API_KEY`**, y ahora sabemos que la clave alimenta un bucle que gasta $4/día. | alto si se filtra | Es decisión tuya. La urgencia sube con este hallazgo. |

---

## 8. Qué cambiaría primero

**O1, sola, y observando 48 horas.**

Es el 71,6 % del gasto, es un solo `config set`, es reversible, y es la única cuyo efecto se puede aislar limpiamente. Aplicar O1 y O2 a la vez haría imposible saber cuál funcionó si algo se rompe.

Orden: **O1** → observar 48 h → **O4** (para que lo demás sea verificable) → **O3** (riesgo casi nulo) → **O2** por tandas, empezando por las tools inequívocamente ajenas.

Y solo después, con el gasto ya en ~$4-10/mes y el instrumento arreglado, tiene sentido volver a la pregunta del proveedor — que a esas alturas será una decisión sobre calidad y resiliencia, no sobre supervivencia del saldo.
