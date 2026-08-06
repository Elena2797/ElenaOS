Estado: implementado (documenta riesgos reales, no un plan de mitigación)
Última verificación: 2026-08-06
Verificado en: grep directo sobre isabel-api/src y life-os-app/src, lectura de .git/config; riesgo #5 confirmado en la práctica el 2026-08-02; riesgos #7 y #8 confirmados el 2026-08-05 durante la auditoría de OpenClaw; riesgo #7 resuelto y verificado en producción el 2026-08-06; riesgo #9 encontrado el 2026-08-06 durante el despliegue de isabel-gateway
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

### 7. `isabel-api/src/mcp.js` no tenía ninguna autenticación — RESUELTO
`GET/POST /mcp` era la única ruta del servidor sin `requireApiKey`. Corregido el 2026-08-06, commit `c02d4cd`: `requireApiKey` aplicado a `/mcp` igual que al resto de rutas. Verificado en producción: `GET /mcp` sin token → 401. Necesario porque `isabel-gateway` (Railway) ya se conecta a este endpoint — ver `core/AUTOMATIONS.md`.

### 8. El token de Telegram comprometido está también en el perfil real de OpenClaw
El mismo token ya identificado como expuesto en `lifeos-agent` (riesgo relacionado con #5 — expuesto en un archivo de configuración versionado) está configurado igualmente en `~/.openclaw/openclaw.json` (perfil real de OpenClaw en esta máquina). No es un incidente nuevo — es la misma incidencia abierta, confirmada ahora en una segunda superficie el 2026-08-05. Implica que, además de rotar el token, cualquier despliegue futuro de OpenClaw como runtime debe usar un bot de Telegram nuevo y dedicado (un mismo token no puede compartirse entre `lifeos-agent` y OpenClaw sin conflicto de long-polling, 409, independientemente del problema de seguridad). No remediado.

### 9. `ANTHROPIC_API_KEY` real expuesta en texto plano en la salida de esta sesión de chat
Encontrado el 2026-08-06, autoidentificado (no reportado por la usuaria): durante el debugging del despliegue de `isabel-gateway`, el valor real de `ANTHROPIC_API_KEY` apareció en texto plano dos veces en la salida de comandos de este chat — una vez vía un `env | grep ANTHROPIC` de diagnóstico, y otra vez en el eco de un comando fallido ("command not found") que incluía la clave sin querer. La clave sigue siendo la misma usada en producción por `isabel-api` y ahora también por `isabel-gateway` — no se ha rotado. Candidata a rotación; no se ha hecho porque requiere generar una clave nueva desde el dashboard de Anthropic y decidir con la usuaria, no es una acción unilateral de un chat. Ver `NEXT_SESSION.md`.

## Lo que NO se encontró (positivo)
- No hay contraseñas ni secretos de terceros hardcodeados más allá de lo anterior.
- Los documentos `.md` de raíz no contienen valores reales de claves.
- No hay inyección SQL evidente — todo el acceso a Supabase pasa por el cliente oficial (`@supabase/supabase-js`) o por PostgREST vía HTTP con parámetros escapados.

## Medidas pendientes (no implementadas, solo constancia)
Ninguna medida de mitigación del resto de riesgos está implementada a día de hoy (el #7 ya se resolvió, ver arriba). No se lista un "plan" porque no se ha decidido ninguno — si se decide abordar algo de esto, la decisión debe registrarse en [DECISIONS.md](DECISIONS.md). El riesgo #9 (`ANTHROPIC_API_KEY` expuesta en texto plano en este chat) es el único con una acción concreta recomendada y todavía no tomada: rotarla desde el dashboard de Anthropic.
