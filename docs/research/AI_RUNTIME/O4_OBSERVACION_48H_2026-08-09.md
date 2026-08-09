Estado: EN CURSO — no cerrar antes de `2026-08-11T13:22:00Z`
Inicio: `2026-08-09T13:22:00Z`
Última lectura: `2026-08-09T17:02:41Z` (3,68 horas)

# O4 — observación de 48 horas tras desactivar heartbeat

## Regla de medición

La ventana exacta empieza en `HEARTBEAT_DISABLED_AT=2026-08-09T13:22:00Z`. No se usa “últimas 24 horas” para atribuir el baseline porque mezcla actividad anterior al corte. No se ejecutan conversaciones, sweeps, ticks ni envíos artificiales para fabricar evidencia.

## Lectura actual de producción

- `/health`: 200, `ok:true`.
- Registros `ai_usage` con `created_at >= inicio`: **0 llamadas**, **$0**, 0 input, 0 output, 0 cache read, 0 cache write.
- Presupuesto proactivo del día: 1 tick, **0 deliveries, 0 llamadas LLM, 0 agent turns, $0**.
- En el agregado móvil de 24 horas existen 49 llamadas y $2,570375, pero pertenecen a la ventana mezclada anterior y no se atribuyen al tramo posterior al apagado.
- No aparece superficie `heartbeat` en la lectura de 24 horas; aun así, la conclusión final se reserva hasta completar 48 horas.

## Criterio de cierre

Al llegar a `2026-08-11T13:22:00Z`, repetir la consulta exacta desde el inicio y comprobar:

1. cero llamadas con `surface=heartbeat` o `trigger=heartbeat`;
2. ninguna llamada de background inesperada;
3. ticks proactivos deterministas con `llm_calls=0`, `agent_turns=0` y coste 0;
4. salud del API y funcionamiento de conversaciones reales iniciadas por la usuaria, si las hubo, clasificadas como interactivas;
5. cobertura: cualquier fila sin `surface` se mantiene separada y no se atribuye por intuición.

Hasta entonces O4 no está cerrada y no se activa el ledger universal, sus rutas, `/v1/now`, Home ni una nueva tool conversacional.
