Ultima actualizacion: 2026-08-09 — fase economica $0 cerrada

# Proxima sesion

## Estado exacto

- Heartbeat: **PASS**. 99 historicos; ultimo `2026-08-09T13:17:56.992Z`; cero despues del reinicio de `13:22Z`.
- O4: desplegada en `isabel-api` `9c2e1760df359e91476014f6928f330e6ae5be0d`, Railway `0c64da45-b24b-489c-9124-9f76dd1c5d52` `SUCCESS`.
- Prueba O4 automatica: tick `2026-08-09T14:30:00Z`, HTTP 200, 27 registros con superficie despues del barrido, cero requests a `/v1/chat`, presupuesto proactivo 0 calls/0 turns/$0.
- Baseline desde `2026-08-09T13:22Z`: cero `session.started`, cero turnos de modelo, cero heartbeat. En esta ventana la autonomia del sistema costo $0; aun no es una proyeccion mensual.
- Tools/skills: auditoria completa persistida. P1 y O3 estan propuestas, **NO aplicadas**.
- Benchmark: A-W intacto (23) + JETMI (10) + sensibilidad (4), 37 total. `--fixtures`: J-M 4/4 PASS, coste $0.
- Simulador: corregido para no cobrar `/v1/now`, inventario ni Gym como IA. 503/503 tests, 158 suites.
- SSH: backup `C:\Users\USER\.ssh\config.pre-lifeos-20260809.bak`; aliases inequivocos `railway-isabel-gateway-old` y `railway-isabel-gateway-new`.

## Antes de decidir otra optimizacion

Dejar que O4 acumule al menos 48 horas. Consultar `GET /v1/usage/today?hours=48` y contrastar con trayectorias reales. Separar siempre:

- `SYSTEM_AUTONOMY`: heartbeat (debe seguir 0), tick determinista, sleep cron y background;
- `USER_CONVERSATION`: Telegram y LIFEOS;
- `MEASURED` frente a `SIMULATED`.

## Decisiones pendientes — no asumir

1. **P1**: allowlist de 12 `lifeos__*` + `message` + `session_status`. Ahorro de bytes de schemas ~69%; no aplicar sin decision de la usuaria y snapshot.
2. **O3**: `agents.entries.main.skills: []`; no aplicar sin decision.
3. **Benchmark real**: requiere cuentas/keys y presupuesto explicito. Empezar solo con corpus sanitizado y limite de gasto.
4. **G8**: structured output productivo depende de parseo/limpieza. Hay fixtures, pero no cambiar comportamiento productivo sin decision.

## Simulacion revisada — no es factura

| Escenario | ACTUAL | P1 contexto | Haiku everyday | Gemini hipotetico | Mixta hipotetica |
|---|---:|---:|---:|---:|---:|
| LIGHT | €8,42 | €3,68 | €1,23 | €0,33 | €0,33 |
| NORMAL | €17,07 | €7,80 | €3,19 | €1,04 | €1,22 |
| HEAVY | €41,77 | €20,00 | €9,16 | €3,28 | €4,22 |
| ISABEL 150% | €81,37 | €41,16 | €22,43 | €8,86 | €11,77 |

El cambio frente a la tabla anterior se debe a una correccion: 150 lecturas LIFEOS/dia son L0=$0; solo se simulan 8 microtareas/dia que realmente requieren IA.

## Invariantes

No cambiar Sonnet/Haiku, providers, `cacheRetention`, presupuestos, sleep cron, proactive cron, Telegram, P1/O3 ni claves sin decision explicita. No enviar Telegrams de prueba. No borrar el Gateway antiguo. No gastar benchmark real. No usar datos personales/medicos/operativos reales en benchmarks.

## Documentos de entrada

1. `docs/CURRENT_STATE.md`
2. `docs/research/AI_RUNTIME/ARQUITECTURA_ECONOMICA_2026-08-09.md`
3. `docs/research/AI_RUNTIME/AUDITORIA_TOOLS_SKILLS_2026-08-09.md`
4. `docs/research/AI_RUNTIME/DECISION_MULTIMODELO_2026-08-09.md`
5. `docs/KNOWN_PROBLEMS.md`
