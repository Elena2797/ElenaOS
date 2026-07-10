Estado: implementado (documenta hechos, no una propuesta)
Última verificación: 2026-07-10
Verificado en: grep exhaustivo en isabel-api/src e index.js, life-os-app/src/main.js y api/chat.js, lifeos-agent/agent.py
Fuente de verdad de datos: ninguna

# ISABEL_CHANNELS.md — Los 4 canales de Isabel, y cuál está vivo

Documento crítico: sin esto, cualquier lectura de código puede concluir erróneamente que "Isabel Core" está en producción (ocurrió durante la propia auditoría de este proyecto, con un agente de exploración que reportó `/v1/chat` como completo). Este documento existe para que ese error no se repita.

## Resumen

| # | Canal | Dónde vive | ¿Activo hoy? |
|---|---|---|---|
| 1 | Bridge local (OpenClaw) | `life-os-app/src/services/isabel.js` + `isabel-bridge.js` (raíz) | ✅ **Sí — es el que usa `openChat()` en la app** |
| 2 | Isabel Core (`/v1/chat`) | `isabel-api/src/core/` | ❌ Código completo, **no montado en `index.js`** |
| 3 | `api/chat.js` | `life-os-app/api/chat.js` (función serverless Vercel) | ❌ Código completo, 0 referencias desde el frontend |
| 4 | Bot de Telegram | `lifeos-agent/agent.py` (repo Python separado) | ⚠️ Código completo; deploy activo no verificado desde este entorno |

## 1. Bridge local — el que se usa de verdad

`life-os-app/src/main.js`: `openChat()` llama a `isabelSvc.sendMessage()` (definido en `services/isabel.js`), que resuelve una URL desde `localStorage.getItem('agent_url')` o desde la tabla `metrics`. Esa URL apunta a un servidor HTTP local (`isabel-bridge.js`, puerto 3001) que a su vez invoca un proceso `openclaw` vía `child_process.execFile`.

**Requisito operativo:** el proceso local debe arrancarse manualmente en el ordenador de Estefanía (`Arrancar Isabel.bat` en el escritorio). Si no está corriendo, `openChat()` devuelve el mensaje "Isabel no está conectada".

**Implicación arquitectónica:** el chat conversacional de LIFEOS **no es un servicio en la nube**. Depende de un proceso local, en un único dispositivo.

## 2. Isabel Core en isabel-api — construido, nunca conectado

`isabel-api/src/core/router.js` define `POST /chat`, con un pipeline completo: `routeIntent` (core/intentRouter.js) → `delegateToInventory` (core/inventoryDelegate.js) o `handleGeneral` (core/generalHandler.js) → `logEvent` (core/eventLogger.js).

**Verificación de que no está activo:** `isabel-api/src/index.js` importa y monta `sessionRouter`, `messageRouter`, `confirmRouter`, `exportRouter`, `hotoRouter` — no importa `core/router.js` en ningún punto. `grep` confirmó cero referencias cruzadas.

El commit `36cdb76` ("feat: Isabel Core MVP — POST /v1/chat with inventory routing and event logging") introdujo este código, pero el paso de montarlo en `index.js` nunca se hizo (o se revirtió sin dejar rastro en el mensaje de commit).

## 3. `api/chat.js` — un tercer cerebro, tampoco conectado

Función serverless de Vercel en `life-os-app/api/chat.js`. Construye su propio system prompt ("Eres Isabel..."), lee `life_context`, `areas`, `tasks`, `metrics`, `operators`, `waiting_for` directamente de Supabase vía REST, y llama a Anthropic. Es funcionalmente completo y coherente con el "Isabel Core" descrito en `ARQUITECTURA_FUSION.md` como el punto de extensión previsto (Fase 2 del plan de fusión).

**Verificación de que no está conectado:** cero ocurrencias de `/api/chat` en `life-os-app/src/main.js`.

## 4. Bot de Telegram — canal independiente, alcance total

`lifeos-agent/agent.py`: bot de Telegram en Python que responde solo a un ID de Telegram autorizado, con acceso a Anthropic y Supabase, y capacidad de editar archivos en GitHub (`GITHUB_TOKEN`, `GITHUB_REPO`). Es un cuarto punto de entrada completo al sistema, totalmente desacoplado de los otros tres — no comparte código ni lógica con `isabel-api` ni con `life-os-app`.

**Estado del deploy:** tiene `Procfile` (`worker: python agent.py`, formato Heroku/Railway), lo que indica intención de despliegue continuo, pero esta auditoría no pudo confirmar si el worker está corriendo en este momento.

## Qué significa esto para trabajo futuro

Antes de tocar "el chat de Isabel", identifica primero **cuál de los 4** es el objetivo del cambio. Son bases de código independientes: arreglar un bug en `core/router.js` no afecta al bridge local que la usuaria usa hoy. Si el objetivo es que Isabel gane capacidades nuevas de forma que la usuaria las note, casi siempre el canal relevante es el **bridge local** (#1), no los otros tres.

Ninguna decisión de consolidar, activar o eliminar alguno de estos canales se ha tomado — si se toma, debe registrarse en [DECISIONS.md](../DECISIONS.md).
