Última actualización: 2026-08-08 (tercera tanda) — handoff corto, no histórico acumulativo

# NEXT_SESSION.md

## Qué se terminó en esta sesión
**D34–D41.** La pieza de esta última tanda: **el proactive loop general está vivo en producción**. `proactive-tick-15m` corre cada 15 minutos en Europe/Madrid y su resultado normal es no hacer nada — con evidencia medida, no razonada: el delta de un tick silencioso es **0 en todo** (registros Anthropic, turnos de agente, `cache_write`, tokens de entrada y salida, coste).

La cadena completa funciona sola: `domain data → specialists → signals → global priority → proactive gate → intervention → delivery → Telegram → response → apply → resolve → reevaluation`.

Verificado además: exactly-once **atravesando un reinicio de `isabel-api`** (el dedup vive en Supabase, no en RAM), `push:false` nunca interrumpe (2 Interventions pendientes y visibles → 0 candidatas a Telegram, 0 turnos), y ambos crons sobreviven al reinicio del Gateway sin duplicarse.

## Qué quedó pendiente
1. **`cacheRetention` y modelo del agente.** Medido: ~0,29 $ de 1,49 $ se iban en escribir caché que nunca se lee. Config de OpenClaw con trade-off real (afecta a las ráfagas conversacionales; el TTL largo de Anthropic cuesta ×2 escribir). Datos en `GET /v1/usage/analysis`. **Decisión de la usuaria.**
2. **Investigar de qué se compone el contexto de ~25.800 tokens por turno** (§17): qué carga OpenClaw siempre, si hay skills/docs/tools innecesarias, y si las conversaciones consecutivas sí aprovechan caché. Cualquier recorte debe medirse antes/después.
3. **2 sesiones abiertas de 9H-VCQ.** El sistema lo pregunta en Home con `push:false`. Cerrarlas es irreversible y sigue siendo acción suya desde Inventario.
4. **Sesión de inventario para D-AFBS** — sin ella no se cierra la prueba de escritura de Inventario. **No fabricar conteos.**
5. **Rotar `ANTHROPIC_API_KEY`** (runbook en `operations/ROTAR_ANTHROPIC_KEY.md`).
6. **Barrido de consumo periódico**: `POST /v1/usage/sweep` solo corre a mano y tras cada turno de `/v1/chat`. Los turnos de Telegram solo se registran cuando alguien barre — candidato natural para engancharlo al tick (es determinista y no gasta IA).
7. **`rotation_day`/`rotation_total` sin registrar**: mientras falten, la ventana temporal de VistaJet es `unknown` y ninguna señal escala. Es correcto (sin dato no se afirma urgencia), pero significa que la escalada por proximidad de entrega no se activará.
8. Gateway antiguo y `faithful-light`: detenidos, conservados como rollback.

## Qué debe hacerse inmediatamente después
1. **Observar el loop unos días.** `GET /v1/proactive/budget` da el gasto de autonomía de hoy; los ticks con algo que contar quedan en `eventos` (`proactive:tick`). Antes de tocar umbrales, mirar qué hace.
2. **Migrar los bloques de VistaJet/JETMI que aún viven en `globalContext.js`** al contrato universal, solo cuando exista reemplazo limpio vía specialist → signals. El test que impide que esa deuda crezca debe mantenerse.
3. **Gym será la prueba real de que la arquitectura generaliza**: debería bastar con datos → specialist → señales, sin reconstruir cron, prioridad, delivery, dedup ni cost tracking. **Todavía no empezar.**

## Qué no debe romperse
- **OBSERVAR ≠ USAR IA.** La evaluación proactiva corre dentro de `runWithoutAI()`: cualquier llamada al modelo ahí **lanza**. `llm_invoked:false` es un hecho medido. Si algún día un tick necesita IA, eso es una decisión de producto, no un detalle de implementación.
- **El cron no habla.** Payload `command`, `delivery:{mode:'none'}`, `NO_REPLY`. La única vía de notificación es `Intervention → delivery → tool message`. Nunca stdout, nunca dos sistemas de entrega.
- **Como mucho UNA interrupción por tick**, elegida por el motor de prioridad global. El resto sigue pending.
- **El presupuesto falla cerrado.** Silencio antes que gasto descontrolado; nunca "arreglarse" gastando más.
- **La sesión conversacional NO es la base de datos.** Nada puede depender de que el LLM recuerde haber preguntado: se resuelve por `domain`+`kind` contra Supabase.
- **`chat.send` conversa, `message` entrega.** No unificarlas.
- **Entrega exactamente una vez.** El reclamo es un INSERT directo, nunca `createIntervention()` (esa converge a propósito).
- **Responder no ejecuta.** `applied:false` significa que no se hizo.
- **Nunca operar con datos de otra entidad**, y **omitir la matrícula falla en alto**. Toda señal declara `subject`.
- **`existe` ≠ `merece atención` ≠ `merece interrumpirme`.** `time_sensitive` no es `interrupt-now`.
- **El Core no conoce dominios** (test de invariante). Añadir Gym no debe exigir un `if (gym)` en el Priority Engine.
- **No tocar `sleep-check-0800-madrid`.** Funciona, tiene semántica exacta y convive con el tick general.
- Un solo poller de Telegram. Secretos solo como variables de entorno. No reactivar `lifeos-agent`.

## Qué documentos debe leer el siguiente chat
`README.md` → este documento → `CURRENT_STATE.md` → `DECISIONS.md` **D34–D41** → los cuatro contratos: `core/signals.js`, `core/proactive.js`, `core/delivery.js`, `core/proactiveTick.js` → `KNOWN_PROBLEMS.md` → `PRINCIPLES.md` #11 y #12.

## Trampas aprendidas (ahorran horas)
- **Arrancar no es funcionar.** Un símbolo no importado dentro del cuerpo de un handler no lo detecta ni `node --check` ni el arranque: solo falla al invocarlo. Lo cazó producción.
- **`cron.create` no existe; el método es `cron.add`.** Y el esquema usa `schedule.expr`/`schedule.tz`, no `expression`/`timezone`. Leerlo de un job existente en vez de adivinarlo.
- **La tool `cron` no está expuesta en `/tools/invoke`** (la política de tools la filtra). La vía que queda es el WS del Gateway por loopback como `gateway-client`/`backend`.
- **Un instrumento que devuelve cero no dice "no hay nada".** El barrido reportó `seen:0` sobre 63 turnos reales porque buscaba un campo `id` que no existe (es `responseId`).
- **Convergencia ≠ exclusión mutua.** `createIntervention()` devuelve la fila ganadora ante un duplicado: correcto para una pregunta, catastrófico para un candado.
- **`\b` no funciona con acentos**: `/^s[ií]\b/` no casa con "sí".
- **Ignorar la caché al calcular coste** es la diferencia entre 0,00004 $ y 0,087 $ en el mismo turno.
- Vite **no lee `PORT`**. Railway: `--skip-deploys` + `restart` no inyecta variables nuevas, hace falta `redeploy`.
