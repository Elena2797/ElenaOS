Última actualización: 2026-08-09 — sesión pausada a mitad de la FASE C

# Próxima sesión

## LO PRIMERO, EN CUANTO ABRAS: confirmar que el heartbeat murió

La sesión se cerró **sin poder confirmarlo**. Estaba desactivado y el Gateway reiniciado a las ~13:22 UTC, pero el siguiente heartbeat tocaba a las **13:47:57 UTC** y la sesión terminó a las 13:28.

```bash
ssh 360bc08a-11be-4019-b5fd-9e98ce45aee4@ssh.railway.com "node -" < scripts/hb_check.js
```

Lo que hay que ver: `total_heartbeats` **sigue en 99** y `ultimo` **sigue siendo `2026-08-09T13:17:56Z`**. Si aparece uno posterior a las 13:22, el reinicio no bastó y hay que investigar por qué (el scheduler vive en el proceso — ver `KNOWN_PROBLEMS.md`).

El script está en el scratchpad de esa sesión; se reconstruye en 10 líneas: recorrer `/data/.openclaw/agents/main/sessions/*.trajectory.jsonl`, filtrar `type === 'session.started'` con `data.trigger === 'heartbeat'`, contar y quedarse con el `ts` mayor.

**No verifiques con `openclaw config get` ni con `openclaw status`.** Los dos decían "disabled" mientras el heartbeat seguía disparándose. Solo vale la trayectoria real.

## Estado: qué está hecho y desplegado

| | Estado |
|---|---|
| Heartbeat desactivado (`every: "0m"`) | **aplicado en producción** + Gateway reiniciado + fijado en `openclaw.default.json` |
| Benchmark corregido, corpus A–W (23 casos) | commiteado, **sin desplegar** (no hace falta: no corre en producción) |
| Router: G1 timeout opt-in, G6 fallback.reason, `agent_conversation` delegada | commiteado, **sin desplegar** |
| Observabilidad O4 (`surface`/`session_key`/`trigger`, `/v1/usage/today`, barrido en el tick) | commiteado, **SIN DESPLEGAR — decisión pendiente** |
| Simulador de coste + escenarios | commiteado |
| Recorte de tools/skills | **diseñado y medido, NO aplicado** |

497/497 pruebas. Repos limpios. Nada pusheado a GitHub todavía.

Commits: `isabel-api` `5d20a04 → 97e92b7 → 785d765 → <cost-model>` · `isabel-gateway` `a9785b0` · `life-os-app` `7dcdde5 → <docs>`.

## Decisiones que bloquean el avance

1. **¿Desplegar `isabel-api`?** Sin desplegar, la observabilidad no mide nada y no se puede comprobar el ahorro del heartbeat. `git push` → Railway auto-despliega.
2. **¿Aplicar el perfil de tools P1?** −59% de contexto (23.235 → ~9.425 tok/turno). Riesgo: el histórico son ~3 días. Diseño en `ARQUITECTURA_ECONOMICA_2026-08-09.md` §4.
3. **¿Crear las cuentas?** Google AI Studio (€0) y OpenRouter (~$10). Sin ellas no hay benchmark real.

## Dónde se quedó exactamente

**FASE C a medias.** Skills clasificadas y perfiles de tools medidos con `count_tokens`; falta decidir y aplicar. **FASES D y E hechas** (investigación de proveedores y simulador). **FASE F pendiente**: falta ampliar el corpus con casos de research JETMI y de sensibilidad, y ejecutar `--fixtures` ($0). **FASE G pendiente**: presentar el coste previsto antes de gastar.

## El hallazgo que manda sobre el plan

El simulador dice que **recortar contexto no basta**: Isabel al 150% cuesta €88,72/mes hoy, €48,50 con el perfil P1 y **€29,78 incluso bajando toda la conversación a Haiku**. Solo baja de €20 con un L2 barato (€13,53 mixta / €10,62 Gemini).

Es decir: **cambiar el modelo de L2 dejó de ser opcional** para el objetivo del 150%. Para el uso de HOY sí sobra con lo ya hecho.

## Invariantes que no se tocan

Telegram solo en el Gateway nuevo · un único sleep cron activo · `proactive-tick-15m` intacto · MCP `lifeos` · Gateway antiguo como rollback, sin borrar · sin mensajes de prueba a Telegram · sin claves en código, chat, logs ni commits · benchmarks solo con fixtures sintéticos.

**Aviso que ahorra un error caro:** migrar a Sonnet 5 por precio es una trampa. Su precio introductorio ($2/$10 hasta el 31-ago-2026) parece más barato que Sonnet 4.6, pero los modelos 4.7+ usan un tokenizador que produce ~30% más tokens; desde el 1-sep sale ~30% MÁS caro. Está modelado y fijado por test en el simulador.
