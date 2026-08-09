Estado: preparación cerrada y totalmente desconectada; benchmark real NO ejecutado
Última verificación: 2026-08-09
Invariantes: producción sin cambios; P1/O3/G8 sin aplicar; cero proveedores nuevos conectados; cero claves añadidas; cero tráfico artificial

# Preparación multi-modelo durante la observación de 48 h

Este checkpoint deja listo el instrumento para decidir con datos, pero no toma la decisión ni toca el runtime. Los precios y políticas se verificaron el 9 de agosto de 2026; deben comprobarse otra vez justo antes de comprar saldo o ejecutar el smoke.

## 1. Baseline acumulado, solo lectura

- Frontera válida posterior al reinicio del Gateway: `2026-08-09T13:22:00.000Z`.
- Trayectoria heredada: 99 heartbeats históricos, último `2026-08-09T13:17:56.992Z`, cero posteriores a la frontera.
- Primera lectura exacta de metadata, a `2026-08-09T15:43:16.696Z`: 0 registros de uso IA, 0 turnos, $0 desde la frontera.
- El agregado HTTP de 48 h (`127` llamadas, `$4.174280`) incluye historia anterior a la frontera y backfill; no es el nuevo baseline y no debe proyectarse.
- Lectura final de esta sesión, a `2026-08-09T16:26:16.110Z`: 0 registros de uso IA, 0 turnos, `$0`, 0 registros sin coste conocido, sin primer/último evento porque el conjunto está vacío. Son 3 h 4 min 16 s de observación válida. Solo se consultó metadata; no se abrió `/v1/chat`, no se envió Telegram y no se disparó cron.

El baseline válido continúa siendo observacional. Una ventana parcial con cero actividad demuestra que el sistema no se está despertando solo; todavía no predice el coste de conversaciones reales ni sustituye las 48 horas completas.

## 2. Workload taxonomy

| Carga / nivel | Frecuencia estimada | Contexto típico | Tools | Sensibilidad | Latencia máx. | Modelo mínimo | Coste objetivo |
|---|---|---:|---|---|---:|---|---:|
| estado determinista / L0 | continua; hasta 96 ticks/día + UI | 0 tokens modelo | código, SQL, delivery | PERSONAL..SENSITIVE | 2 s | ninguno | $0 |
| structured extraction / L1 | 0–20/día, hipótesis | 1k–4k | ninguna | PERSONAL | 10 s | cheap + JSON Schema | $0.001 |
| concise generation / L1 | 0–10/día, hipótesis | 2k–6k | ninguna | PERSONAL | 15 s | cheap + structured output | $0.002 |
| conversación cotidiana / L2 | ~5.5 mensajes/día medidos; escenarios 6/16/48 | 23,235 actual; 9,425 P1 simulado | CORE + DELIVERY + SESSION | SENSITIVE | 30 s | standard español | $0.005/turno |
| conversación con tools / L2 | subconjunto; 9 tools observadas en 14 trayectorias | 9k–30k | CORE + DELIVERY + SESSION | SENSITIVE | 45 s | standard + tool calling fiable | $0.01/turno |
| long-context reasoning / L3 | 0–1/día, hipótesis y solo escalada | 25k–100k | mínimas de la tarea | SENSITIVE | 60 s | reasoning + long context | $0.03/tarea |
| research / L4 | 0 actual; 0–10/semana simulados | 30k–100k/run | search, fetch, browser | PUBLIC por defecto | 300 s | standard + Budget Contract | $0.05/run |
| specialist agent / L4 | 0 actual; 0–10/semana simulados | 10k–50k/paso | allowlist de tarea | declarada por tarea, fail-closed | 300 s | tier específico + Budget Contract | $0.05/run inicial |

La frecuencia cotidiana procede de 16 mensajes Telegram en 70 h; las bandas no observadas se etiquetan como hipótesis. L0 reúne Priority Engine, señales, SQL, parseo, diff, deduplicación, delivery y fetch/diff JETMI. La taxonomía y un validador que exige todos los campos están en `isabel-api/benchmarks/model-router/workload-taxonomy.js`. No introduce routing productivo.

## 3. Shortlist final

Exactamente ocho candidatos, todos con tool calling y structured output comprobables. La selección maximiza información nueva y conserva dos controles Anthropic.

| Modelo exacto | Transporte | Papel | In / cache / out por 1M USD | Restricción principal |
|---|---|---|---:|---|
| `anthropic/claude-haiku-4-5-20251001` | Anthropic | control barato actual | 1 / 0.10 / 5 | endpoint estándar, máximo SENSITIVE en política provisional |
| `anthropic/claude-sonnet-4-6` | Anthropic | control premium actual | 3 / 0.30 / 15 | no candidato de ahorro L1 |
| `google/gemini-3.5-flash-lite` | Google paid terms | L1/L2 barato | 0.30 / 0.03 / 2.50 | PERSONAL; confirmar paid terms |
| `google/gemini-3.6-flash` | Google paid terms | L2/L3 | 1.50 / 0.15 / 7.50 | PERSONAL; confirmar paid terms |
| `openai/gpt-5.6-luna` | OpenAI | L1/L2 barato | 0.20 / 0.02 / 1.20 | PERSONAL; abuse logs estándar hasta 30 días |
| `moonshot/kimi-k3` | Kimi OpenPlatform | frontera de calidad/contexto | 3 / 0.30 / 15 | **PUBLIC únicamente** |
| `mistralai/mistral-small-2603` | OpenRouter, provider `mistral` fijado | open-weight UE barato | 0.15 / 0.015 / 0.60 | smoke PUBLIC vía agregador; abrir cuenta directa solo si gana |
| `qwen/qwen3.6-flash` | OpenRouter, provider `qwen` fijado | open-weight 1M barato | 0.1875 / 0.01875 / 1.125 | **PUBLIC únicamente**, endpoint con logging de duración no declarada |

IDs, capacidades, rutas y precios están congelados en `isabel-api/benchmarks/model-router/candidates.js`. Para OpenRouter se prohíben aliases automáticos y fallback silencioso.

Compatibilidad que justifica gastar benchmark:

| Modelo | Tools / structured output | Español esperado | API / OpenClaw | Workload y motivo |
|---|---|---|---|---|
| Haiku 4.5 | sí / sí | fuerte, control real | estable; Anthropic nativo | control L1/L2 sin integración nueva |
| Sonnet 4.6 | sí / sí | fuerte, control real | estable; actual en OpenClaw | frontera de calidad L2/L3 |
| Gemini 3.5 Flash-Lite | sí / sí | fuerte por familia, a medir | estable; Google soportado | posible ganador L1/L2 por coste |
| Gemini 3.6 Flash | sí / sí | fuerte por familia, a medir | estable; Google soportado | celda standard L2/L3/long context |
| GPT-5.6 Luna | sí / sí | fuerte por familia, a medir | modelo actual; OpenAI soportado | precio mínimo L1/L2 con integración directa |
| Kimi K3 | sí / schema estricto | competente, debe medirse | K3 actual; Kimi/Moonshot soportado | agente/long context público; comprobar razonamiento permanente |
| Mistral Small 2603 | sí / sí | europeo/multilingüe, a medir | GA; OpenRouter/OpenClaw | open-weight barato y jurisdicción UE del proveedor directo |
| Qwen 3.6 Flash | sí / sí | multilingüe, a medir | endpoint actual; OpenRouter/OpenClaw | open-weight 1M barato; medir fiabilidad de tools |

## 4. Do-not-benchmark list

| No probar ahora | Motivo |
|---|---|
| Claude Sonnet 5 | control caro redundante; precio introductorio termina el 31-08-2026; ya existe control Sonnet 4.6 |
| Gemini 3.1 Flash-Lite | 3.5 Flash-Lite lo sustituye como señal más actual; duplicaría la misma celda |
| GPT-5.6 Terra/Sol | coste premium innecesario para L1/L2; Sonnet ya cubre control premium |
| Kimi K2.5/K2.6 | familia anterior/deprecada frente a K3 |
| Mistral Medium/Large | Small 4 es la celda relevante en precio y capacidad |
| GLM 4.7/5 | no añade una celda que justifique ampliar este smoke; reevaluable en una segunda ronda pública |
| DeepSeek | privacidad, entrenamiento/jurisdicción y estabilidad de precio incompatibles con el runtime propuesto |
| Groq/Cerebras/Together/Fireworks/DeepInfra | son hosts/capas de velocidad; no un cerebro distinto necesario en esta primera comparación |
| OpenRouter Auto, aliases `:free`, routers gratuitos | ruta/modelo variables: resultado no reproducible |
| Ollama/LM Studio/self-hosting | Railway no tiene GPU y el portátil no es un servicio 24/7; supera el objetivo de €20 |
| xAI, Cohere, MiniMax y otros | no aportan una combinación única de coste, privacidad o carga frente a las ocho celdas elegidas |

No es un rechazo permanente. Es control del tamaño experimental: una segunda ronda solo se abre para cubrir una carencia observada en la primera.

## 5. Provider adapter compatibility

Se creó un contrato neutral desconectado con mensajes `system/user/assistant/tool`, texto/imagen, tool calls/results, tools estrictas, salida estructurada, streaming, usage/cache/reasoning, finish/refusal, errores HTTP tipados, `Retry-After` y timeout.

| Transporte | Tools y resultados | JSON Schema estricto | Streaming | Uso/caché/coste | Protección específica |
|---|---|---|---|---|---|
| Anthropic | bloques `tool_use`/`tool_result` | `output_config.format` y tools `strict` | eventos Anthropic normalizados | input/output/cache; coste calculable | rechazo/max tokens se distinguen de JSON inválido |
| OpenAI | tools OpenAI | `response_format: json_schema`, `strict` | deltas normalizados | input/output/cached/reasoning | error HTTP y `Retry-After` tipados |
| Kimi | OpenAI-compatible | JSON Schema estricto soportado por K3 | deltas OpenAI | cache/usage cuando el endpoint lo reporta | endpoint y modelo exactos; PUBLIC únicamente |
| Gemini | function declarations/responses | `responseJsonSchema` + MIME JSON | chunks Gemini normalizados | prompt/candidates/cache | adapter explícito, no fingir compatibilidad OpenAI |
| OpenRouter | contrato OpenAI | `response_format` + `require_parameters:true` | deltas OpenAI | `usage.cost`, tokens, caché y reasoning | `order` + `only`, fallback false, provider/model verificados, metadata habilitada |

Archivos: `provider-contract.js`, `adapters/*.js`, y 29 tests contractuales/sensibilidad/presupuesto. Ninguno está importado por `src/` productivo.

## 6. G8 solution proposal

G8 deja de ser “parsear texto y esperar” mediante una ruta de cinco pasos, aún no aplicada:

1. Cada capability estructurada declara un JSON Schema versionado, `additionalProperties:false` y límites de tamaño.
2. El adapter traduce ese schema al mecanismo nativo: Anthropic `output_config.format`, OpenAI/Kimi/OpenRouter `response_format:json_schema`, Gemini `responseJsonSchema`.
3. El router valida de nuevo localmente el objeto normalizado; salida inválida, refusal, truncamiento o ausencia de coste producen error tipado, nunca reparación semántica silenciosa.
4. Solo se permite un reintento correctivo si el contrato de presupuesto lo autoriza; después, fallback a una ruta capaz de cumplir el mismo schema y la misma sensibilidad.
5. Métricas separadas: `provider_schema_valid`, `local_schema_valid`, `refusal`, `truncated`, `fallback_reason`, coste y latencia.

Canary: primero fixtures $0; después casos públicos D/R con un agente sin canal y techo $0.10; finalmente una capability L1 concreta. Rollback: restaurar snapshot del router/config, reiniciar Gateway si procede y confirmar por trayectoria real, no solo por configuración. No se modifica el parser productivo en esta fase.

## 7. Sensitivity policy

La unidad de confianza es el **endpoint**, no la marca. Todo lo no listado se deniega.

| Clase | Ejemplos | Rutas provisionales permitidas | Condición |
|---|---|---|---|
| `PUBLIC` | corpus sintético, web pública | todos los endpoints shortlist fijados | sin PII; OpenRouter pinned; sin logging opt-in |
| `PERSONAL` | preferencias e historial no clínico | Anthropic estándar, OpenAI estándar, Google bajo paid terms, Mistral directo/Scale | contrato/términos verificados; mínimo contexto |
| `SENSITIVE` | salud, sueño, finanzas, operación privada | Anthropic estándar provisional; OpenAI/Google/Mistral solo con ZDR verificado según endpoint | aprobación explícita; sin routers agregados ni Kimi/Qwen |
| `HIGHLY_SENSITIVE` | secretos, claves, pasaporte completo, credenciales | ningún endpoint externo estándar | local aislado o ZDR contractual aprobado + autorización humana |

Kimi queda en PUBLIC porque su política permite usar contenido para mejorar/entrenar y conservar inputs durante la vida de la cuenta o necesidad empresarial. Qwen por OpenRouter queda en PUBLIC porque el endpoint declara prompt logging sin plazo publicado. El evaluador fail-closed está en `sensitivity-policy.js`; los cuatro fixtures SENS verifican la frontera sin datos reales.

## 8. Agent Budget Contract

Toda ejecución L4 debe nacer con este sobre inmutable:

```json
{
  "objective": "resultado concreto",
  "capability": "research",
  "allowed_tools": ["web_search", "web_fetch"],
  "model_tier": "standard",
  "max_steps": 12,
  "max_tokens": 100000,
  "max_cost_usd": 0.05,
  "timeout_s": 300,
  "output_contract": "JSON Schema o artefacto exacto",
  "sensitivity": "PUBLIC",
  "context_policy": {
    "inherit_personal_context": false,
    "allowed_context_refs": []
  }
}
```

Antes de cada paso se comprueban estado, tool, tier, tokens/coste proyectados, pasos y timeout. Tras cada paso se registran tokens, coste real y modelo. El cierre devuelve exactamente `actual_steps`, `models_used`, `tokens`, `cost`, `result` y `failure_reason`. Cualquier desviación bloquea el agente. No hay aumento automático de tier/presupuesto, no hereda memoria personal y no puede darse nuevas tools. OpenClaw debe recibir además `runTimeoutSeconds` explícito, porque el timeout por defecto de subagente no sirve como límite económico.

## 9. JETMI 150 cost model

El pipeline separa lo que debe seguir en código de lo que merece modelo:

| Etapa | Clase | LIGHT/mes | NORMAL/mes | JETMI 150/mes |
|---|---|---:|---:|---:|
| fetch de páginas | DETERMINISTIC | $0 | $0 | $0 |
| parse + diff + dedup | DETERMINISTIC | $0 | $0 | $0 |
| clasificación de cambios | CHEAP_MODEL | $0.0096 | $0.0478 | $0.1594 |
| síntesis | STANDARD_MODEL | $0.0466 | $0.1398 | $0.3262 |
| deep research | RESEARCH_AGENT | $0 | $0.3312 | $2.1422 |
| **total** |  | **$0.06** | **$0.52** | **$2.63** |

Supuestos JETMI 150: 350 páginas/semana, 50 cambiadas, 7 síntesis y 5 investigaciones/semana, máximo 15 pasos por research. Mix simulado: GPT-5.6 Luna barato, Gemini 3.6 Flash estándar, Sonnet 4.6 premium. El resultado no autoriza scraping, crons ni llamadas.

## 10. Cost Simulator V2

V2 separa explícitamente medición, supuesto y simulación. No cobra como IA las lecturas LIFEOS deterministas y modela mensajes/día, turnos, proporción cacheada, perfil de tools, reparto cheap/standard/premium, research y agentes.

| Escenario | Arquitectura actual con perfil P1 simulado | Mix shortlist simulado |
|---|---:|---:|
| LIGHT | $1.52/mes | $0.52/mes |
| NORMAL | $4.82/mes | $2.25/mes |
| HEAVY | $14.95/mes | $8.12/mes |
| ISABEL 150 | $32.24/mes | $17.21/mes |
| 10 mensajes/día | $2.27/mes | $0.97/mes |
| 30 mensajes/día | $6.82/mes | $2.91/mes |
| 100 mensajes/día | $22.74/mes | $9.71/mes |

“Arquitectura actual con P1” no describe producción actual: es una simulación contrafactual que mantiene los modelos actuales pero asume el contexto reducido de P1. `SHORTLIST_MIX` tampoco es recomendación final. Se ejecuta con `npm.cmd run cost:simulate:v2`.

## 11. P1 capability-profile design

P1 no se aplica hasta completar el baseline y aprobar un canary reversible.

- `CORE_LIFEOS` (12): `lifeos__gym_get_status`, `lifeos__gym_log_session`, `lifeos__health_get_sleep_status`, `lifeos__health_register_sleep`, `lifeos__isabel_confirm`, `lifeos__isabel_message`, `lifeos__lifeos_answer_question`, `lifeos__lifeos_pending_questions`, `lifeos__lifeos_proactive_check`, `lifeos__vistajet_get_status`, `lifeos__vistajet_update_passport`, `lifeos__vistajet_update_status`.
- `DELIVERY` (1): `message`.
- `SESSION` (1): `session_status`.
- `ISABEL_NORMAL`: los tres perfiles anteriores, 14 tools exactas.
- `RESEARCH_AGENT`: web search/fetch/browser y lectura mínima; sin CORE, delivery, exec ni writes.
- `DOCUMENT_AGENT`: lectura/fetch de fichero/PDF/imagen; sin escritura por defecto.
- `ADMIN_DEV`: exec, mutaciones de filesystem, gateway, cron, sessions, nodes, goals y workshop; fuera de Telegram y del agente main.

Canary propuesto: (0) terminar 48 h y snapshot/checksum; (1) validar lista efectiva $0; (2) agente `isabel-canary` sin channel/cron, corpus público y techo $0.10; (3) un sender/surface explícito durante 24 h si se autoriza; (4) main solo tras pasar tools, writes, delivery, latencia y coste. Rollback: snapshot + reinicio controlado + prueba de trayectoria. Deny prevalece sobre allow y un subagente no puede recuperar una tool negada.

## 12. O3 design

Para `main`: `skills: []`. Ninguna skill always-on.

- `ON_DEMAND`: `browser-automation` para research aprobado; `taskflow` para futuras ejecuciones durables; `weather` solo ante petición meteorológica explícita.
- `REMOVE_FROM_ISABEL` (no desinstalar): `canvas`, `diagram-maker`, `healthcheck`, `meme-maker`, `node-connect`, `node-inspect-debugger`, `notion`, `python-debugpy`, `skill-creator`, `spike`, `taskflow-inbox-triage`.
- Una tarea dedicada recibe una allowlist no vacía y sustituye el default; no carga skills dinámicamente en main.
- La visibilidad de skills no es frontera de seguridad: O3 siempre debe acompañarse de P1 y deny de `exec`.

Canary/rollback siguen el mismo procedimiento de P1 y no se mezclan en el mismo cambio para conservar atribución causal.

## 13. Smoke benchmark exacto

Fase 0, $0: validar los 37 casos; ejecutar J/K/L/M contra providers falsos. Fase real: casos `A`, `C`, `D`, `O`, `P` y `W`, una repetición por cada uno de los ocho modelos = **48 requests**.

| Caso | Señal | Input conservador |
|---|---|---:|
| A | español conversacional | 3,000 tokens |
| C | tool calling | 3,000 |
| D | JSON estructurado | 3,000 |
| O | no alucinar | 3,000 |
| P | carga agentic real | 25,000 |
| W | long-context con distractores | 27,000 |

Por candidato: 64,000 input + máximo 3,072 output (512 por request). Secuencial, concurrency 1, cero reintentos, solo PUBLIC. Antes de cada request se calcula el peor coste y se aborta si proyecta superar $0.90. También se detiene ante coste desconocido, provider/model drift, ruta no pública o fallo C/D/O. P/W pueden descalificar por tools/contexto. El plan está codificado y probado en `smoke-plan.js`; no existe runner real conectado.

## 14. Coste máximo

| Modelo | Máximo conservador del smoke |
|---|---:|
| Haiku 4.5 | $0.079360 |
| Sonnet 4.6 | $0.238080 |
| Gemini 3.5 Flash-Lite | $0.026880 |
| Gemini 3.6 Flash | $0.119040 |
| GPT-5.6 Luna | $0.016486 |
| Kimi K3 | $0.238080 |
| Mistral Small 4 | $0.011443 |
| Qwen 3.6 Flash | $0.015456 |
| **total calculado** | **$0.744826** |

Kill-cap operativo: **$0.90**. Cap absoluto prometido: **< $1.00**. Estos son costes de inferencia; depósitos/saldo no consumido y comisiones de recarga se separan.

## 15. Cuentas/keys necesarias

| Cuenta | Para | Depósito mínimo | Free tier | Key y dónde vivirá | Caveat de privacidad / test habilitado |
|---|---|---:|---|---|---|
| Anthropic existente | 2 controles | $0 nuevo | no se presupone | key existente, no copiar | política actual; habilita controles Haiku/Sonnet |
| Google AI Studio / Gemini | 2 Gemini | $0 para fixture sintético | sí, sujeto a cuota/términos vigentes | `GEMINI_API_KEY`, entorno local seguro fuera del repo | verificar paid terms/proyecto antes de PERSONAL; habilita dos Gemini |
| OpenAI API | GPT-5.6 Luna | prepago mínimo $5 salvo créditos elegibles | no garantizado | `OPENAI_API_KEY`, entorno local seguro fuera del repo | no training por defecto; logs de abuso estándar hasta 30 días; habilita Luna |
| Kimi OpenPlatform | Kimi K3 | recarga mínima $1 | no; voucher tras umbral no equivale a free tier | `MOONSHOT_API_KEY`, entorno local de benchmark | PUBLIC únicamente; habilita K3 |
| OpenRouter | Mistral + Qwen | compra mínima $5 + fee 5.5% con mínimo $0.80 | pequeña cuota/modelos free, no aplicable a endpoints shortlist | `OPENROUTER_API_KEY`, entorno local de benchmark | providers fijados, `data_collection:deny`; PUBLIC en smoke; habilita Mistral/Qwen |

Saldo inicial total aproximado: $11 más comisión OpenRouter, aunque el gasto real autorizado del smoke sea < $0.90 y el resto quede como saldo. No hace falta cuenta Mistral/Qwen directa ni Groq/GLM/DeepSeek. Las keys se crean solo cuando la usuaria autorice el smoke, se guardan fuera del repo y nunca en cliente/frontend. Railway solo recibiría secrets en una fase posterior y con autorización separada.

## 16. Recomendación de qué probar primero

Primero no se prueba un proveedor: se completa la ventana O4 de 48 h. Después, si la usuaria autoriza cuentas y presupuesto, se ejecuta la fase $0 y el smoke exacto.

Orden de compra/ejecución recomendado para maximizar señal antes de inmovilizar saldo:

1. **Gemini 3.5 Flash-Lite y Gemini 3.6 Flash**: una cuenta, coste sintético potencialmente $0, cubre cheap + standard.
2. **GPT-5.6 Luna**: el candidato más barato de integración directa y coste de smoke ~$0.0165; requiere saldo OpenAI.
3. **Haiku 4.5 y Sonnet 4.6**: controles con cuenta existente; correr después de validar el harness para no gastar el tramo caro por un error del instrumento.
4. **OpenRouter Mistral + Qwen**: una cuenta para dos open-weight, provider fijado y verificación de ruta.
5. **Kimi K3**: último por coste empatado con Sonnet y restricción PUBLIC; solo si las cuatro celdas anteriores no cierran la decisión.

Criterio de promoción: primero seguridad/contrato (sensibilidad, modelo/provider exactos, C/D/O), luego calidad P/W, después coste y latencia. Ningún ganador entra en producción automáticamente: requerirá una decisión, un cambio mínimo independiente, canary y rollback.

## Fuentes primarias verificadas

- OpenAI: [GPT-5.6 Luna](https://developers.openai.com/api/docs/models/gpt-5.6-luna), [controles de datos](https://platform.openai.com/docs/models/default-usage-policies-by-endpoint), [prepago](https://help.openai.com/en/articles/8264778).
- Anthropic: [structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs), [retención](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention), [pricing](https://platform.claude.com/docs/en/about-claude/pricing).
- Google: [modelos](https://ai.google.dev/gemini-api/docs/models), [pricing](https://ai.google.dev/gemini-api/docs/pricing), [ZDR](https://ai.google.dev/gemini-api/docs/zdr), [structured output](https://ai.google.dev/gemini-api/docs/structured-output).
- Kimi: [overview](https://platform.kimi.ai/docs/overview), [límites](https://platform.kimi.ai/docs/pricing/limits), [privacidad](https://platform.kimi.ai/docs/agreement/userprivacy), [chat API](https://platform.kimi.ai/docs/api/chat).
- Mistral: [pricing](https://mistral.ai/pricing/api/), [modelos](https://docs.mistral.ai/getting-started/models/models_overview), [ZDR](https://help.mistral.ai/en/articles/347612-can-i-activate-zero-data-retention-zdr).
- OpenRouter: [provider routing](https://openrouter.ai/docs/guides/routing/provider-selection), [data collection](https://openrouter.ai/docs/guides/privacy/data-collection), [ZDR](https://openrouter.ai/docs/guides/privacy/zero-data-retention), [chat response/usage](https://openrouter.ai/docs/api/api-reference/chat/create-a-chat-completion), [FAQ/fees](https://openrouter.ai/docs/faq).
- OpenClaw: [multi-agent tool policy](https://docs.openclaw.ai/tools/multi-agent-sandbox-tools), [subagents](https://docs.openclaw.ai/subagents), [skills](https://docs.openclaw.ai/skills), [OpenRouter](https://docs.openclaw.ai/openrouter).
