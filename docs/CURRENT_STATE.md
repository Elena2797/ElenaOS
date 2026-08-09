Estado: fotografía operativa vigente
Última verificación: 2026-08-09

# Estado actual de LIFEOS

## Estado general

LIFEOS mantiene una sola Isabel, un Priority Engine global, especialistas deterministas y memoria operacional en Supabase. La dependencia estructural de las llamadas directas a Anthropic ya está desacoplada: `isabel-api` tiene un Model Router neutral por capacidades, fallback representable y observabilidad común. No se conectó ningún proveedor nuevo ni se cambió ningún modelo.

## Producción

- `isabel-api` sirve el commit `5175136033c181e1c44bc030c0a4e4d5948c34d4` con deployment Railway `f146452d-9c02-412e-b90c-08d173bc05ff` `SUCCESS`/`RUNNING`. O4 se introdujo en `9c2e176`; el commit actual solo agrega benchmark/simulador y conserva `/health` y O4 en verde.
- `life-os-app`: el cambio funcional de Gym es `f366ff7b762dcb7659b13346e2c87b7c46c2b1b8`; el último deployment Vercel verificado figura `success`. El alias productivo responde 200 y el bundle contiene `/v1/gym/state`/`target_sessions`, sin `regSesion` ni `sesiones_semana`.
- Gateway nuevo: Telegram configurado/conectado en polling, adaptador `/healthz` OK, MCP `lifeos: ok`, cron proactivo OK y `NO_REPLY`.
- `faithful-light`: source Git desconectado, sin deployments activos y sin dominios; servicio/variables conservados para rollback.
- Gateway antiguo: RUNNING como rollback, Telegram deshabilitado, sin dependencias productivas. Su copia de `sleep-check-0800-madrid` permanece conservada pero está deshabilitada.

## Model Router

Consumidores activos:

- conversación Isabel: `agent_conversation`, OpenClaw, Sonnet 4.6;
- `/v1/now`: `structured_generation`, router directo, Haiku 4.5;
- Inventario: `structured_extraction`, router directo, Haiku 4.5;
- Gym ambiguo: `structured_extraction`, router directo, Haiku 4.5.

Los consumidores ya no conocen proveedor/modelo. Anthropic vive en un adapter. Cada respuesta normaliza contenido, JSON, tool calls, provider/model, usage/caché, latencia, coste y fallback. Ausencia o fallo de provider termina con error tipado y sin respuesta inventada. La llamada productiva de `/v1/now` verificó el registro nuevo con provider, capability, task, tokens, latencia, éxito, fallback y coste marcado como estimación.

OpenClaw permanece como plano separado: soporta multi-provider/fallback nativo, documentado pero no activado. Sonnet, Haiku, `cacheRetention` y presupuestos proactivos siguen sin cambios.

## Gym

Core decide y el frontend representa. Home, Dominios y Gym cargan `GET /v1/gym/state`; la tarjeta usa `week.strength` y `target_sessions`. Eliminados el contador legacy, `/2`, la función `regSesion()` y su referencia global huérfana.

## Verificación

- Backend: 523/523 pruebas, 163 suites.
- Frontend: 10/10 pruebas, 2 suites.
- Benchmark: 23 casos A–W conservados + 10 JETMI + 4 de sensibilidad = 37 casos validados; fixtures J–M 4/4 PASS, coste $0, sin llamadas a modelo.
- Build Vite: completo; advertencia existente de chunk grande, sin fallo.
- Producción: `/health`, `/v1/now`, `/v1/gym/state`, `/v1/proactive/budget` responden 200.
- No se envió ninguna notificación de prueba.

La inspección visual automatizada de Home/Dominios/Gym/Isabel no pudo completarse porque el controlador de navegador de Codex falla por permisos de Windows antes de abrir la app. La compilación, las pruebas de presentación y el bundle productivo sí están verificados; no declarar QA visual manual completo.

## Coste actual medido

La ventana historica medida antes de la correccion fue **$12.535 en 70 horas ≈ $4,30/día ≈ $129/mes**. Era gasto real con heartbeat, no la nueva tasa.

O4 ya corrige los puntos ciegos: barre `main`, `lifeos` y el cron estable desde el tick de 15 minutos, conserva el timestamp del evento y declara cobertura/coste. Se demostro en produccion a las 14:30 UTC sin abrir `/v1/chat`: 27 registros recibieron superficie y el tick termino 200/ok.

Causa historica demostrada: el **heartbeat default de 30 minutos** produjo el 71,6% del gasto. Esta muerto: 99 heartbeats totales, ultimo `2026-08-09T13:17:56.992Z`, **cero posteriores** al reinicio de `13:22Z`.

Composición del contexto, medida con `count_tokens`: de los 23.235 tokens fijos por turno, **17.178 (73,9%) son definiciones de tools** y 5.530 el system prompt; la memoria persistente son 168 tokens. El catalogo actual expone **47 tools** y los metadatos retenidos muestran uso de **9**.

Detalle completo: [`research/AI_RUNTIME/MEDICION_CONTEXTO_2026-08-09.md`](research/AI_RUNTIME/MEDICION_CONTEXTO_2026-08-09.md) y [`research/AI_RUNTIME/AUDITORIA_TOOLS_SKILLS_2026-08-09.md`](research/AI_RUNTIME/AUDITORIA_TOOLS_SKILLS_2026-08-09.md). P1/O3 siguen **sin aplicar**.

## Bloqueos reales

1. QA visual automatizado: bloqueado por el controlador del navegador de Codex. Requiere recuperar esa conexión o validación manual en el dispositivo.
2. ~~El sleep cron productivo está habilitado e intacto, pero su última ejecución registrada falló durante el incidente de saldo bajo.~~ **RESUELTO sin intervención el 2026-08-09**: el cron se disparó solo a las 08:00 Europe/Madrid y `openclaw cron list --json` (solo lectura, Gateway nuevo) devuelve `lastRunStatus: "ok"`, `lastDeliveryStatus: "delivered"`, `lastDelivered: true`, `consecutiveErrors: 0`. No se forzó manualmente ni se envió ninguna notificación de prueba.
3. Rotar `ANTHROPIC_API_KEY` sigue pendiente de la usuaria.
4. `isabel-gateway` continúa sin remoto demostrado.

## Siguiente paso

Revisar este checkpoint. La siguiente decision es una sola: observar el baseline 48 h y despues elegir entre aplicar P1/O3 de forma reversible o autorizar un benchmark real sanitizado. No hay que conectar ningun proveedor hoy.

## Preparacion multi-modelo durante O4

Sin tocar produccion se audito el corpus completo (37 casos), se cerro una shortlist de 8 modelos, se construyeron adapters contractuales desconectados, politica de sensibilidad, Agent Budget Contract, JETMI LIGHT/NORMAL/150, Cost Simulator V2 y un smoke exacto de 48 requests con coste conservador `$0.744826`, kill-cap `$0.90` y cap absoluto `<$1`. P1, O3 y G8 siguen propuestas y **NO aplicadas**. No se conecto ningun proveedor, key ni runner real.

Checkpoint completo: [`research/AI_RUNTIME/PREPARACION_MULTIMODELO_48H_2026-08-09.md`](research/AI_RUNTIME/PREPARACION_MULTIMODELO_48H_2026-08-09.md).

Ultima lectura O4 solo-metadata: `2026-08-09T16:26:16.110Z`, frontera `13:22Z`, 0 registros IA, 0 turnos, `$0` y 0 registros sin coste conocido. Ventana valida parcial de 3 h 4 min 16 s; no confundir con las 48 h requeridas.
