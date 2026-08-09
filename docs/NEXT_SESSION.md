Última actualización: 2026-08-09 — investigación multi-modelo cerrada, decisión pendiente

# Próxima sesión

## Estado de la tanda anterior

1. QA visual de Home, Dominios, Gym e Isabel: **sigue pendiente**. Repetir cuando el controlador de navegador funcione, o validarlo manualmente en el dispositivo. Limpiar service worker si se sirve un bundle anterior.
2. Sleep cron: **cerrado el 2026-08-09**. Se disparó solo a las 08:00 Europe/Madrid con `lastRunStatus: ok`, `lastDeliveryStatus: delivered`, `consecutiveErrors: 0`. No se forzó ni se envió notificación de prueba.

## La investigación de proveedores YA está hecha

Vive en **[`research/AI_RUNTIME/DECISION_MULTIMODELO_2026-08-09.md`](research/AI_RUNTIME/DECISION_MULTIMODELO_2026-08-09.md)**: estado verificado heredado, auditoría del Model Router (8 huecos, G1/G8 bloqueantes), mapa de proveedores con precios oficiales de esa fecha, shortlist y descartes con motivo, arquitectura de 3 niveles de cerebro, comparación directo/OpenRouter/híbrido, división LIFEOS Router ↔ OpenClaw, auditoría del corpus A–O (8 hallazgos, 5 casos inejecutables), corpus propuesto A–W, coste estimado del benchmark, ahorro potencial, cuentas necesarias, riesgos y recomendación.

**Sigue sin conectarse ningún proveedor y sin ejecutarse ningún benchmark de pago.** No hacerlo sin decisión explícita de la usuaria.

## Orden recomendado cuando haya decisión

1. Arreglar el instrumento antes de usarlo ($0): G1 (timeout por intento), G8 (adherencia a schema), G6 (bug de `fallback.reason`), B1 (el validador no comprueba que la capability exista), B5 (el scoring por subcadenas produce rankings falsos), B3/B4 (contexto largo y fixtures de fallo sin implementar), casos P–W.
2. Cobrar el ahorro que no depende de proveedores ($0, ~46%): medir **la composición** de los 25.833 tokens de contexto por turno, y separar el agente del cron para poder aplicar `cacheRetention: "none"` solo donde nunca se lee caché.
3. Abrir OpenRouter (una clave para toda la cola larga) y Google AI Studio (free tier con términos UE, sin entrenamiento).
4. Smoke (~$0.10) → completo ×3 (~$2.55) → decidir L2.

## Prioridad económica

El 93,9% del coste de 30 días es conversación OpenClaw. Descompuesto contra el precio oficial: **el 97,2% de esa factura son tokens de escritura de caché** (660.939 tokens, $2.4785), no el mensaje ni la salida. El contexto mediano es 25.833 tokens. Las llamadas Haiku directas son el 6,1%: no empezar por ahí.

No cambiar aún Sonnet, Haiku, `cacheRetention` ni límites del proactive loop. Primero benchmark y decisión de la usuaria.

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
