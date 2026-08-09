Estado: fotografía operativa vigente
Última verificación: 2026-08-08

# Estado actual de LIFEOS

## Estado general

LIFEOS mantiene una sola Isabel, un Priority Engine global, especialistas deterministas y memoria operacional en Supabase. La dependencia estructural de las llamadas directas a Anthropic ya está desacoplada: `isabel-api` tiene un Model Router neutral por capacidades, fallback representable y observabilidad común. No se conectó ningún proveedor nuevo ni se cambió ningún modelo.

## Producción

- `isabel-api` sirve el commit `70785564bec14acbc15b076817e4e1042535d277` con deployment Railway `SUCCESS`/`RUNNING`.
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

- Backend: 455/455 pruebas, 143 suites.
- Frontend: 10/10 pruebas, 2 suites.
- Benchmark: 15 casos A–O validados; $0, sin llamadas a modelo.
- Build Vite: completo; advertencia existente de chunk grande, sin fallo.
- Producción: `/health`, `/v1/now`, `/v1/gym/state`, `/v1/proactive/budget` responden 200.
- No se envió ninguna notificación de prueba.

La inspección visual automatizada de Home/Dominios/Gym/Isabel no pudo completarse porque el controlador de navegador de Codex falla por permisos de Windows antes de abrir la app. La compilación, las pruebas de presentación y el bundle productivo sí están verificados; no declarar QA visual manual completo.

## Coste actual medido

Últimos 30 días registrados: **$2.716060**, 100 llamadas. Conversación: **$2.549703 (93,9%)**; light AI: **$0.166357 (6,1%)**. Mediana de contexto conversacional: **25.833 tokens**. La siguiente optimización debe atacar conversación/contexto, no microoptimizar las llamadas Haiku minoritarias.

## Bloqueos reales

1. QA visual automatizado: bloqueado por el controlador del navegador de Codex. Requiere recuperar esa conexión o validación manual en el dispositivo.
2. ~~El sleep cron productivo está habilitado e intacto, pero su última ejecución registrada falló durante el incidente de saldo bajo.~~ **RESUELTO sin intervención el 2026-08-09**: el cron se disparó solo a las 08:00 Europe/Madrid y `openclaw cron list --json` (solo lectura, Gateway nuevo) devuelve `lastRunStatus: "ok"`, `lastDeliveryStatus: "delivered"`, `lastDelivered: true`, `consecutiveErrors: 0`. No se forzó manualmente ni se envió ninguna notificación de prueba.
3. Rotar `ANTHROPIC_API_KEY` sigue pendiente de la usuaria.
4. `isabel-gateway` continúa sin remoto demostrado.

## Siguiente paso

Ver `NEXT_SESSION.md`. No conectar proveedores hasta revisar esta tanda.
