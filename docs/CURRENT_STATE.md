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

**La cifra que reporta LIFEOS está mal y ahora se sabe por qué.** `GET /v1/usage/summary` dice $2.716060 en 30 días (conversación 93,9%, light AI 6,1%). Medido contra las trayectorias reales del Gateway, el gasto real es **$12.535 en 70 horas ≈ $4,30/día ≈ $129/mes** — la instrumentación ve ~el 2%.

Dos causas verificadas: `KNOWN_SESSION_KEYS = ['lifeos','main']` no incluye las sesiones de cron, y el barrido solo corre a mano o tras `/v1/chat`, así que **los turnos que más gastan —los que ocurren sin nadie delante— no se miden**.

Causa del gasto, demostrada: un **`heartbeat` de OpenClaw que nadie configuró** (default `30m`) despierta a Sonnet 4.6 cada 30 minutos, 24 h al día, con ~28.000 tokens de contexto. Son **98 de 161 turnos y el 71,6% del gasto**. Su `target` es `none` (no entrega nada) y su checklist `HEARTBEAT.md` no existe. Explica el incidente de saldo del 2026-08-07.

Composición del contexto, medida con `count_tokens`: de los 23.235 tokens fijos por turno, **17.178 (73,9%) son definiciones de tools** y 5.530 el system prompt; el transcript real son ~4.400 (16%) y la memoria persistente **168 tokens (0,7%)**. De las 42 tools expuestas, Isabel ha usado **10** en todo su histórico.

Detalle completo y optimizaciones propuestas: [`research/AI_RUNTIME/MEDICION_CONTEXTO_2026-08-09.md`](research/AI_RUNTIME/MEDICION_CONTEXTO_2026-08-09.md). **Ninguna aplicada.**

## Bloqueos reales

1. QA visual automatizado: bloqueado por el controlador del navegador de Codex. Requiere recuperar esa conexión o validación manual en el dispositivo.
2. ~~El sleep cron productivo está habilitado e intacto, pero su última ejecución registrada falló durante el incidente de saldo bajo.~~ **RESUELTO sin intervención el 2026-08-09**: el cron se disparó solo a las 08:00 Europe/Madrid y `openclaw cron list --json` (solo lectura, Gateway nuevo) devuelve `lastRunStatus: "ok"`, `lastDeliveryStatus: "delivered"`, `lastDelivered: true`, `consecutiveErrors: 0`. No se forzó manualmente ni se envió ninguna notificación de prueba.
3. Rotar `ANTHROPIC_API_KEY` sigue pendiente de la usuaria.
4. `isabel-gateway` continúa sin remoto demostrado.

## Siguiente paso

Ver `NEXT_SESSION.md`. No conectar proveedores hasta revisar esta tanda.
