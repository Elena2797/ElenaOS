Estado: implementado (documenta riesgos reales, no un plan de mitigación)
Última verificación: 2026-08-05
Verificado en: grep directo sobre isabel-api/src y life-os-app/src, lectura de .git/config; riesgo #5 confirmado en la práctica el 2026-08-02; riesgos #7 y #8 confirmados el 2026-08-05 durante la auditoría de OpenClaw
Fuente de verdad de datos: ninguna

# SECURITY.md — Riesgos reales observados

Este documento no es un plan de seguridad aspiracional. Es lo que **hoy** es verificablemente cierto en el código. Ningún valor real de clave se reproduce aquí.

## Riesgos confirmados

### 1. PIN hardcodeado en el bundle del cliente
`life-os-app/src/main.js`: `const PIN = '1965'`. Es visible en el JavaScript compilado que se sirve al navegador — cualquiera que abra las devtools lo lee. Protege solo el acceso local a la sesión del navegador (no hay servidor detrás verificando el PIN).

### 2. API key de isabel-api con fallback hardcodeado, y expuesta en el bundle del cliente
`isabel-api/src/config.js`: `apiKey: process.env.API_KEY || 'isabel-api-2026'`. El mismo valor de fallback está hardcodeado en `life-os-app/src/main.js` (`const ISABEL_KEY = ... || 'isabel-api-2026'`) porque el cliente necesita enviarla en cada petición. Al ser un fallback usado en producción, la clave real que protege isabel-api es literalmente ese string, visible en el JS del navegador. Cualquiera que la lea puede llamar a la API (leer/escribir sesiones de inventario y HOTO).

### 3. RLS desactivado en las 18 tablas de Supabase
Confirmado explícitamente en las migraciones (`ALTER TABLE ... DISABLE ROW LEVEL SECURITY`). Decisión consciente documentada en los propios archivos SQL ("app personal, una sola usuaria"), no un descuido. Implica: quien tenga la `anon key` del frontend puede leer y escribir cualquier fila de cualquier tabla directamente contra la API REST de Supabase, sin pasar por ninguna lógica de negocio.

### 4. Service role key en el backend
`isabel-api/.env` → `SUPABASE_SERVICE_KEY`. Correcto en cuanto a que vive solo en el servidor (Railway), no en el cliente. Pero dado que RLS está desactivado, la distinción entre anon key y service key deja de aportar aislamiento real — ambas llegan a los mismos datos.

### 5. Token de GitHub en texto plano en el remoto de `life-os-app`
`.git/config` de `life-os-app` tiene el remoto configurado como `https://ghp_...@github.com/Elena2797/ElenaOS.git` — el token de acceso personal está en la URL, en texto plano, en un archivo que puede copiarse o compartirse sin darse cuenta (por ejemplo, al hacer backup de la carpeta `.git`).

**Confirmado en la práctica el 2026-08-02:** el token vigente hasta entonces había caducado/sido revocado (bloqueaba el push con 401 Unauthorized). La usuaria generó uno nuevo y lo pegó en texto plano en una conversación de chat para poder desbloquear el push — así que, además del riesgo estructural ya descrito, ese token concreto debe tratarse como potencialmente expuesto por ese canal, independientemente de si sigue siendo válido. No se ha decidido ninguna mitigación (ver "Medidas pendientes" abajo).

### 6. Sin autenticación de usuario
No hay login, no hay sesiones de usuario, no hay JWT propio del sistema. Todo el acceso se basa en "quien tiene la URL y las claves". Es coherente con ser una app estrictamente personal de un solo usuario — pero significa que no hay ninguna capa que impida acceso si las claves se filtran.

### 7. `isabel-api/src/mcp.js` no tiene ninguna autenticación
`GET/POST /mcp` es la única ruta del servidor sin `requireApiKey` (a diferencia de `/v1/message`, `/v1/confirm`, etc.). Cualquiera con la URL puede abrir una sesión MCP y llamar a cualquier tool expuesta (inventario VistaJet, y desde 2026-08-05 también `health_get_sleep_status`/`health_register_sleep`). Confirmado el 2026-08-05 como bloqueante explícito antes de conectar cualquier Gateway remoto (OpenClaw en Railway u otro) a este endpoint — ver `DECISIONS.md` D10 y `core/AUTOMATIONS.md`. No remediado todavía; es trabajo de diseño (qué mecanismo de auth, no solo "añadir una clave más"), pendiente de fase separada.

### 8. El token de Telegram comprometido está también en el perfil real de OpenClaw
El mismo token ya identificado como expuesto en `lifeos-agent` (riesgo relacionado con #5 — expuesto en un archivo de configuración versionado) está configurado igualmente en `~/.openclaw/openclaw.json` (perfil real de OpenClaw en esta máquina). No es un incidente nuevo — es la misma incidencia abierta, confirmada ahora en una segunda superficie el 2026-08-05. Implica que, además de rotar el token, cualquier despliegue futuro de OpenClaw como runtime debe usar un bot de Telegram nuevo y dedicado (un mismo token no puede compartirse entre `lifeos-agent` y OpenClaw sin conflicto de long-polling, 409, independientemente del problema de seguridad). No remediado.

## Lo que NO se encontró (positivo)
- No hay contraseñas ni secretos de terceros hardcodeados más allá de lo anterior.
- Los documentos `.md` de raíz no contienen valores reales de claves.
- No hay inyección SQL evidente — todo el acceso a Supabase pasa por el cliente oficial (`@supabase/supabase-js`) o por PostgREST vía HTTP con parámetros escapados.

## Medidas pendientes (no implementadas, solo constancia)
Ninguna medida de mitigación de lo anterior está implementada a día de hoy. No se lista un "plan" porque no se ha decidido ninguno — si se decide abordar algo de esto, la decisión debe registrarse en [DECISIONS.md](DECISIONS.md). El riesgo #7 (MCP sin auth) es, de toda la lista, el único marcado explícitamente como bloqueante para un trabajo futuro concreto (desplegar OpenClaw como runtime remoto) — no puede quedar pendiente indefinidamente si ese despliegue avanza.
