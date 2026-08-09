Última actualización: 2026-08-09 — investigación multi-modelo cerrada, decisión pendiente

# Próxima sesión

## Estado de la tanda anterior

1. QA visual de Home, Dominios, Gym e Isabel: **sigue pendiente**. Repetir cuando el controlador de navegador funcione, o validarlo manualmente en el dispositivo. Limpiar service worker si se sirve un bundle anterior.
2. Sleep cron: **cerrado el 2026-08-09**. Se disparó solo a las 08:00 Europe/Madrid con `lastRunStatus: ok`, `lastDeliveryStatus: delivered`, `consecutiveErrors: 0`. No se forzó ni se envió notificación de prueba.

## La investigación de proveedores YA está hecha

Vive en **[`research/AI_RUNTIME/DECISION_MULTIMODELO_2026-08-09.md`](research/AI_RUNTIME/DECISION_MULTIMODELO_2026-08-09.md)**: estado verificado heredado, auditoría del Model Router (8 huecos, G1/G8 bloqueantes), mapa de proveedores con precios oficiales de esa fecha, shortlist y descartes con motivo, arquitectura de 3 niveles de cerebro, comparación directo/OpenRouter/híbrido, división LIFEOS Router ↔ OpenClaw, auditoría del corpus A–O (8 hallazgos, 5 casos inejecutables), corpus propuesto A–W, coste estimado del benchmark, ahorro potencial, cuentas necesarias, riesgos y recomendación.

**Sigue sin conectarse ningún proveedor y sin ejecutarse ningún benchmark de pago.** No hacerlo sin decisión explícita de la usuaria.

## Hecho el 2026-08-09: instrumento arreglado y coste real medido

**Benchmark corregido** (`isabel-api` @ `97e92b7`, 470/470 pruebas): capability inexistente, 5 casos inejecutables, scoring que producía falsos negativos, schema y argumentos de tool sin comprobar, fixtures de fallo y generador de contexto sin implementar, y sin medida de estabilidad. Corpus ampliado a **A–W** (23 casos). `--validate` y `--fixtures` cuestan $0. Detalle en `isabel-api/benchmarks/model-router/README.md`.

**Router:** G1 (timeout **opt-in**, producción intacta) y G6 (`fallback.reason`) arreglados. `agent_conversation` declarada DELEGADA a OpenClaw con test que impide routers anidados. **G8 sigue abierto a propósito**: tocarlo cambiaría el parseo de `/v1/now`, Inventario y Gym en producción.

**Medición del coste — ver [`research/AI_RUNTIME/MEDICION_CONTEXTO_2026-08-09.md`](research/AI_RUNTIME/MEDICION_CONTEXTO_2026-08-09.md).**

## Lo siguiente: decisión sobre las optimizaciones $0

Ninguna aplicada. Orden propuesto, una a una para poder atribuir el efecto:

1. **O1 — desactivar el `heartbeat`** (`agents.defaults.heartbeat.every: false`). Es el **71,6% del gasto** ($3,07/día). No entrega nada (`target: none`) y su checklist no existe. **Observar 48 h antes de seguir.**
2. **O4 — arreglar la instrumentación**: añadir las sesiones de cron a `KNOWN_SESSION_KEYS` y disparar el barrido desde `proactive-tick-15m`. No ahorra; hace verificable todo lo demás.
3. **O3 — desactivar las 14 skills ajenas** (~2.024 tok/turno, riesgo casi nulo).
4. **O2 — allowlist de tools**: dejar las 9 `lifeos__*` + `message`. ~14.600 tok/turno y cero invocaciones en todo el histórico. Por tandas.

Efecto acumulado estimado: **$4,30/día → ~$0,34/día**; con el uso real de Estefanía, **~$4/mes**. €20 pasarían de durar ~5 días a ~5 meses.

**No tocar `cacheRetention` ni `contextPruning` todavía**: tocan el contexto conversacional y primero hay que ver el efecto de O1–O4.

## Después: proveedores

La investigación sigue vigente en `research/AI_RUNTIME/DECISION_MULTIMODELO_2026-08-09.md`, **pero su prioridad ha bajado**: el sistema no gastaba de más porque Sonnet sea caro, sino porque lo despertaba 48 veces al día con un catálogo de 42 tools de las que usa 10. Cambiar de modelo antes habría dividido la factura por 10 y dejado intacto el factor 13.

Cuando toque: abrir OpenRouter + Google AI Studio → smoke (~$0.10) → completo ×3 (~$2.55) → decidir L2.

**Aviso que ahorra un error caro:** migrar a Sonnet 5 por precio es una trampa. Su precio introductorio ($2/$10 hasta el 31-ago-2026) parece más barato que Sonnet 4.6, pero los modelos 4.7+ usan un tokenizador que produce ~30% más tokens; desde el 1-sep-2026 sale ~30% MÁS caro que hoy.

**Aviso que ahorra un error caro:** migrar a Sonnet 5 por precio es una trampa. Su precio introductorio ($2/$10 hasta el 31-ago-2026) parece más barato que Sonnet 4.6, pero los modelos 4.7+ usan un tokenizador que produce ~30% más tokens; desde el 1-sep-2026 sale ~30% MÁS caro que hoy.

## Invariantes

- Una sola Isabel; proveedores no son agentes ni dominios.
- Specialists piden capabilities, nunca nombres de modelos.
- Frontend no decide modelo.
- `runWithoutAI()` bloquea todo provider dentro del tick.
- Sin provider o con fallo total: error explícito, nunca contenido inventado.
- Coste reportado > estimación explícita > null; nunca inventar.
- OpenClaw y el router directo son dos planos coordinados, no routers anidados.
- `faithful-light` no se reconecta ni despliega sin una decisión explícita.
- Gateway antiguo se conserva como rollback; no borrarlo.
- La copia de `sleep-check-0800-madrid` del Gateway antiguo debe permanecer deshabilitada; exactamente una copia activa vive en el Gateway nuevo.
- No reactivar `lifeos-agent`.
