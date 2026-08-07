Estado: implementado (documenta hechos, no una propuesta)
Última verificación: 2026-08-07
Verificado en: auditoría completa de esta sesión — isabel-gateway/openclaw.default.json (channels.telegram, mcp.servers.lifeos), commits `4fcebf5`/`4e43414`/`a4364ea` (2026-08-06), git log de lifeos-agent (último commit `54397a8`, 2026-06-25), isabel-api/src/index.js, isabel-api/src/mcp.js, life-os-app/src/main.js
Fuente de verdad de datos: ninguna

# ISABEL_CHANNELS.md — Los canales de Isabel, y cuál está vivo

Documento crítico: sin esto, cualquier lectura de código puede concluir erróneamente que "Isabel Core" está en producción (ocurrió durante la propia auditoría de este proyecto, con un agente de exploración que reportó `/v1/chat` como completo). Este documento existe para que ese error no se repita.

**Cambio real desde la última verificación (2026-07-10 → 2026-08-07):** en ese intervalo se desplegó `isabel-gateway` (D10, D11) y se activó Telegram sobre él (commits del 2026-08-06 16:27-16:55) — un canal que no existía cuando se escribió la versión anterior de este documento. Es ahora **el canal conversacional real y único que la usuaria usa a diario** (confirmado en `CURRENT_STATE.md`: "Isabel sigue real y funcionando 24/7 por Telegram", y en el bug real de D14 donde Isabel confirmó por Telegram "¡Listo! Avión actualizado a D-AFBS" invocando `vistajet_update_status`, una tool que solo existe en `isabel-api/src/mcp.js`). Los otros tres canales de la tabla original de 2026-07-10 no cambiaron de estado — dos siguen muertos, uno se confirma formalmente abandonado.

## Resumen

| # | Canal | Dónde vive | ¿Activo hoy? |
|---|---|---|---|
| 1 | **isabel-gateway (OpenClaw) + Telegram + MCP** | `isabel-gateway/` (Railway) → MCP `lifeos` → `isabel-api/src/mcp.js` → specialists | ✅ **Sí — es la Isabel real. Telegram es su interfaz conversacional principal.** |
| 2 | Bridge local (OpenClaw local) | `life-os-app/src/services/isabel.js` + `isabel-bridge.js` (raíz) | ⚠️ **Sí, pero separado del #1** — sigue siendo lo que usa `openChat()` (botón "Hablar con Isabel" dentro de LIFEOS). Es un proceso `openclaw` local en el portátil de la usuaria (requiere `Arrancar Isabel.bat`), no el Gateway de Railway. Ver nota abajo. |
| 3 | Isabel Core (`/v1/chat`, `core/router.js`) | `isabel-api/src/core/` | ❌ Código completo, **sigue sin montarse en `index.js`** |
| 4 | `api/chat.js` | `life-os-app/api/chat.js` (función serverless Vercel) | ❌ Código completo, 0 referencias desde el frontend |
| 5 | Bot de Telegram legacy (`lifeos-agent`) | `lifeos-agent/agent.py` (repo Python separado) | ❌ **Muerto/abandonado** — último commit `54397a8` del 2026-06-25, sin cambios desde entonces mientras isabel-gateway se desplegaba activamente. Tiene lógica Supabase/Anthropic propia y duplicada (`query_db`/`update_db`/`insert_db` directos, sin pasar por isabel-api) — si se redesplegara por error, escribiría datos sin respetar las reglas nuevas de D13-D17 (singleton de `vj_state`, correlación HOTO↔avión, etc.). Además su `.env.example` filtra un `TELEGRAM_TOKEN`/`GITHUB_TOKEN` reales (ver `SECURITY.md` #5, #8) — **no reactivar sin rotar esos tokens primero.** |

**Nota sobre "chat de Inventario" (`/v1/message`/`/v1/confirm`):** no es un canal Isabel adicional en el sentido de esta tabla — es una función de `isabel-api` (parseo de lenguaje natural de inventario), consumida hoy desde una UI de chat propia dentro de LIFEOS (`invSendMessage`/`invConfirm`, `main.js`). Tiene su propio historial y su propio modelo (Haiku vía `intentProvider.js`), completamente desacoplado del canal #1 y del #2 — ver `core/DOMAIN_SPECIALISTS.md` y la auditoría de frontend de 2026-08-07 (`DECISIONS.md` D18) para el detalle de por qué esto también cuenta como fragmentación de "Isabel", solo que a nivel de UI de LIFEOS en vez de a nivel de canal externo.

## 1. isabel-gateway + Telegram + MCP — la Isabel real

`isabel-gateway/openclaw.default.json`: `channels.telegram.enabled:true` con `allowFrom` restringido al ID de Telegram de la usuaria; `mcp.servers.lifeos` apunta a `https://isabel-api-production.up.railway.app/mcp` (autenticado, `ISABEL_API_KEY`). El agente (Claude Sonnet, `agents.defaults`) recibe el mensaje de Telegram, decide qué tool MCP llamar (`vistajet_get_status`, `vistajet_update_status`, `health_register_sleep`, etc. — ver `isabel-api/src/mcp.js`), y esas tools llaman a los specialists deterministas de `isabel-api/src/core/specialists/`. Este es el flujo real verificado en el bug de D14: "avión actualizado a D-AFBS" por Telegram invocó `vistajet_update_status`.

**Requisito operativo:** ninguno del lado de la usuaria — corre 24/7 en Railway, sin depender de que ningún dispositivo local esté encendido.

**Implicación arquitectónica:** esta es la única instancia de Isabel que combina lenguaje natural + memoria conversacional + escritura real a través de specialists. Es la que hay que tratar como "Isabel" cuando la usuaria dice "Isabel" sin más contexto.

## 2. Bridge local — sigue vivo, pero es una Isabel distinta de la de Telegram

`life-os-app/src/main.js`: `openChat()` (botón "Hablar con Isabel" dentro de LIFEOS) llama a `isabelSvc.sendMessage()` (`services/isabel.js`), que resuelve una URL desde `localStorage.getItem('agent_url')` o desde la tabla `metrics`. Esa URL apunta a un servidor HTTP local (`isabel-bridge.js`, puerto 3001) que invoca un proceso `openclaw` **local** vía `child_process.execFile` — no el Gateway de Railway del canal #1.

**Requisito operativo:** el proceso local debe arrancarse manualmente en el ordenador de Estefanía (`Arrancar Isabel.bat`). Si no está corriendo, `openChat()` devuelve "Isabel no está conectada".

**Por qué sigue así:** `DECISIONS.md` D10 fijó explícitamente el criterio de retirada — "se retira solo cuando el Gateway remoto esté validado, no antes". El Gateway remoto está validado *para Telegram*, pero `isabel-gateway` corre con `gateway.bind:"loopback"`, sin dominio público ni endpoint HTTP expuesto — no hay hoy ninguna URL a la que LIFEOS (Vercel) pueda apuntar `openChat()` para hablar con la misma Isabel que usa Telegram, sin antes exponer el Gateway (una decisión de seguridad/infraestructura real, no un simple cambio de configuración). Ver "Flag" en `DECISIONS.md` D18 y `KNOWN_PROBLEMS.md`.

## 3. Isabel Core en isabel-api — construido, nunca conectado

`isabel-api/src/core/router.js` define `POST /chat`, con un pipeline completo: `routeIntent` (core/intentRouter.js) → `delegateToInventory` (core/inventoryDelegate.js) o `handleGeneral` (core/generalHandler.js) → `logEvent` (core/eventLogger.js).

**Verificación de que no está activo:** `isabel-api/src/index.js` monta `sessionRouter`, `messageRouter`, `confirmRouter`, `exportRouter`, `hotoRouter`, `laundryCleaningRouter`, `isabelNowRouter` — no importa `core/router.js` en ningún punto.

El commit `36cdb76` ("feat: Isabel Core MVP — POST /v1/chat with inventory routing and event logging") introdujo este código, pero el paso de montarlo en `index.js` nunca se hizo.

## 4. `api/chat.js` — un tercer cerebro, tampoco conectado

Función serverless de Vercel en `life-os-app/api/chat.js`. Construye su propio system prompt ("Eres Isabel..."), lee `life_context`, `areas`, `tasks`, `metrics`, `operators`, `waiting_for` directamente de Supabase vía REST, y llama a Anthropic. Es funcionalmente completo pero **cero ocurrencias de `/api/chat` en `life-os-app/src/main.js`** — no conectado.

## 5. Bot de Telegram legacy (`lifeos-agent`) — confirmado muerto/abandonado

`lifeos-agent/agent.py`: bot de Telegram en Python, con `query_db`/`update_db`/`insert_db` propios contra Supabase (sin pasar por `isabel-api`, sin respetar el singleton de `vj_state` ni ninguna de las reglas de D13-D17), y capacidad de editar archivos en GitHub. Último commit `54397a8` (2026-06-25) — sin actividad en las 6 semanas en las que `isabel-gateway` se construyó y desplegó activamente para reemplazarlo. Su `.env.example` filtra un `TELEGRAM_TOKEN`/`GITHUB_TOKEN` reales (`SECURITY.md` #5, #8). **No reactivar** — si alguna vez se reconecta el `Procfile`, escribiría a Supabase con reglas obsoletas y con un token de Telegram ya comprometido.

## Qué significa esto para trabajo futuro

Isabel, sin más calificación, significa el canal #1 (isabel-gateway + Telegram + MCP). Si el objetivo es que Isabel gane capacidades nuevas de forma que la usuaria las note por Telegram, el trabajo va en `isabel-api/src/core/specialists/` + `isabel-api/src/mcp.js`, nunca en el bridge local ni en los canales muertos. El bridge local (#2) solo importa si el trabajo es específicamente sobre el botón de chat dentro de LIFEOS — y aun así, cualquier cambio de fondo ahí debe considerar que es una segunda Isabel, no la misma, hasta que se resuelva la exposición del Gateway (ver `KNOWN_PROBLEMS.md`).

Ninguna decisión de exponer el Gateway, retirar el bridge local, o fusionar el chat de Inventario con el canal #1 se ha tomado — ver `DECISIONS.md` D18.

## Nota (2026-08-03): `GET /v1/now`

Existe `GET /v1/now` (ver [ISABEL_NOW.md](ISABEL_NOW.md)), montado dentro de `isabel-api` — pero **no es un canal conversacional**. Es un endpoint de solo lectura que alimenta la tarjeta "Isabel" de Home, sin chat, sin `POST /chat`. Desde 2026-08-07 es también la fuente que resuelve `resolveHomePriority()` en `main.js` — ver `modules/` (Home) y `DECISIONS.md` D19.
