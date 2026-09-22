Estado: implementado (documenta riesgos reales, no un plan de mitigación)
Última verificación: 2026-09-22
Verificado en: grep directo sobre isabel-api/src y life-os-app/src, lectura de .git/config; riesgo #5 confirmado en la práctica el 2026-08-02; riesgos #7 y #8 confirmados el 2026-08-05 durante la auditoría de OpenClaw; riesgo #7 resuelto y verificado en producción el 2026-08-06; riesgo #9 encontrado el 2026-08-06 durante el despliegue de isabel-gateway
Fuente de verdad de datos: ninguna

# SECURITY.md — Riesgos reales observados

Este documento no es un plan de seguridad aspiracional. Es lo que **hoy** es verificablemente cierto en el código. Ningún valor real de clave se reproduce aquí.

## Riesgos confirmados

### 1. PIN hardcodeado en el bundle del cliente
`life-os-app/src/main.js`: `const PIN = '1965'`. Es visible en el JavaScript compilado que se sirve al navegador — cualquiera que abra las devtools lo lee. Protege solo el acceso local a la sesión del navegador (no hay servidor detrás verificando el PIN).

### 2. API key de isabel-api con fallback hardcodeado, y expuesta en el bundle del cliente
`isabel-api/src/config.js`: `apiKey: process.env.API_KEY || 'isabel-api-2026'`. El mismo valor de fallback está hardcodeado en `life-os-app/src/main.js` (`const ISABEL_KEY = ... || 'isabel-api-2026'`) porque el cliente necesita enviarla en cada petición. Al ser un fallback usado en producción, la clave real que protege isabel-api es literalmente ese string, visible en el JS del navegador. Cualquiera que la lea puede llamar a la API (leer/escribir sesiones de inventario y HOTO).

### 3. RLS desactivado en las 18 tablas de Supabase — RESUELTO 2026-09-22
**Arreglo** (D62): RLS `lifeos_owner_only` en todas las tablas de `public` (`isabel-api/migrations/rls_owner_only.sql`, aplicada por ella en el SQL Editor). Solo su sesión (`owner@lifeos.internal`) lee y escribe; verificado que la clave anónima ve 0 filas. La service key del servidor se salta RLS a propósito. Al crear una tabla nueva hay que volver a ejecutar la migración.
**Lo que había:** confirmado explícitamente en las migraciones (`ALTER TABLE ... DISABLE ROW LEVEL SECURITY`). Decisión consciente documentada en los propios archivos SQL ("app personal, una sola usuaria"), no un descuido. Implica: quien tenga la `anon key` del frontend puede leer y escribir cualquier fila de cualquier tabla directamente contra la API REST de Supabase, sin pasar por ninguna lógica de negocio.

### 4. Service role key en el backend
`isabel-api/.env` → `SUPABASE_SERVICE_KEY`. Correcto en cuanto a que vive solo en el servidor (Railway), no en el cliente. Hasta D62, con RLS desactivado, la distinción entre anon key y service key no aportaba aislamiento; desde el 2026-09-22 sí: la anónima no ve nada y la service key es la única que se salta RLS.

### 5. Token de GitHub en URLs locales de remotos — MITIGADO 2026-08-08
`.git/config` de `life-os-app` tiene el remoto configurado como `https://ghp_...@github.com/Elena2797/ElenaOS.git` — el token de acceso personal está en la URL, en texto plano, en un archivo que puede copiarse o compartirse sin darse cuenta (por ejemplo, al hacer backup de la carpeta `.git`).

**Confirmado en la práctica el 2026-08-02:** el token vigente hasta entonces había caducado/sido revocado (bloqueaba el push con 401 Unauthorized). La usuaria generó uno nuevo y lo pegó en texto plano en una conversación de chat para poder desbloquear el push — así que, además del riesgo estructural ya descrito, ese token concreto debe tratarse como potencialmente expuesto por ese canal, independientemente de si sigue siendo válido. No se ha decidido ninguna mitigación (ver "Medidas pendientes" abajo).

**Mitigación aplicada el 2026-08-08:** `isabel-api`, `life-os-app` y `lifeos-agent` usan ahora URLs HTTPS limpias, sin credenciales. Se guardó una copia local `.git/config.pre-clean-20260808` antes del cambio; Git Credential Manager autentica correctamente y se verificó acceso remoto. La exposición histórica del token no desaparece y su revocación/rotación sigue siendo decisión de la usuaria, pero ya no se propaga en cada lectura o copia de `.git/config`.

### 6. Sin autenticación de usuario — RESUELTO 2026-09-22
**Arreglo** (D62): login real. El código que llega a su Telegram (D57) abre una sesión de Supabase de su usuario; sin ella la app no carga datos. Sigue abierto lo de #2: `/v1` de `isabel-api` todavía acepta la API key pública.
**Lo que había:** no hay login, no hay sesiones de usuario, no hay JWT propio del sistema. Todo el acceso se basa en "quien tiene la URL y las claves". Es coherente con ser una app estrictamente personal de un solo usuario — pero significa que no hay ninguna capa que impida acceso si las claves se filtran.

### 7. `isabel-api/src/mcp.js` no tenía ninguna autenticación — RESUELTO
`GET/POST /mcp` era la única ruta del servidor sin `requireApiKey`. Corregido el 2026-08-06, commit `c02d4cd`: `requireApiKey` aplicado a `/mcp` igual que al resto de rutas. Verificado en producción: `GET /mcp` sin token → 401. Necesario porque `isabel-gateway` (Railway) ya se conecta a este endpoint — ver `core/AUTOMATIONS.md`.

### 8. El token de Telegram comprometido está también en el perfil real de OpenClaw
El mismo token ya identificado como expuesto en `lifeos-agent` (riesgo relacionado con #5 — expuesto en un archivo de configuración versionado) está configurado igualmente en `~/.openclaw/openclaw.json` (perfil real de OpenClaw en esta máquina). No es un incidente nuevo — es la misma incidencia abierta, confirmada ahora en una segunda superficie el 2026-08-05. Implica que, además de rotar el token, cualquier despliegue futuro de OpenClaw como runtime debe usar un bot de Telegram nuevo y dedicado (un mismo token no puede compartirse entre `lifeos-agent` y OpenClaw sin conflicto de long-polling, 409, independientemente del problema de seguridad). No remediado.

### 10. `ISABEL_API_KEY` persistida como valor literal en `openclaw.json`, no como referencia `${ENV}`
Encontrado el 2026-08-06 vía `openclaw mcp doctor --probe`, que avisa explícitamente: `headers.Authorization contains a literal sensitive value; prefer an environment-backed value outside committed config`. Confirmado sin imprimir el valor (comprobación indirecta: el fichero en el volumen de producción `/data/.openclaw/openclaw.json` ya no contiene la referencia `${ISABEL_API_KEY}` que sí tiene la versión versionada en `openclaw.default.json` — en algún punto OpenClaw resolvió el SecretRef y escribió el valor resuelto de vuelta al fichero persistido, en vez de mantener la referencia sin resolver). Exposición limitada: el fichero vive solo en el volumen privado de Railway (no en git, no público), pero contradice lo documentado en `isabel-gateway/README.md` ("nunca escrito en config") y significa que una futura fuga de ese volumen expondría la clave directamente. No investigada la causa exacta (posible efecto secundario de `openclaw config unset` u otra escritura de config durante esta sesión, o preexistente desde el despliegue inicial — no se pudo determinar cuál). No remediado; candidato a revisar junto con el resto de secretos del Gateway.

### 9. `ANTHROPIC_API_KEY` real expuesta en texto plano en la salida de esta sesión de chat
Encontrado el 2026-08-06, autoidentificado (no reportado por la usuaria): durante el debugging del despliegue de `isabel-gateway`, el valor real de `ANTHROPIC_API_KEY` apareció en texto plano dos veces en la salida de comandos de este chat — una vez vía un `env | grep ANTHROPIC` de diagnóstico, y otra vez en el eco de un comando fallido ("command not found") que incluía la clave sin querer. La clave sigue siendo la misma usada en producción por `isabel-api` y ahora también por `isabel-gateway` — no se ha rotado. Candidata a rotación; no se ha hecho porque requiere generar una clave nueva desde el dashboard de Anthropic y decidir con la usuaria, no es una acción unilateral de un chat. **Urgencia aumentada el 2026-08-06:** tras `DECISIONS.md` D11, esta misma clave dejó de ser solo la auth de `isabel-api` — es ahora también la única vía de auth de `isabel-gateway` (se abandonó el backend `claude-cli`), así que una exposición futura comprometería ambos servicios, no solo uno. Ver `NEXT_SESSION.md`.

Reconfirmado el 2026-08-08: una consulta de variables de infraestructura imprimió valores sensibles en la salida de herramienta pese a que la intención era revisar únicamente nombres/configuración. No se copiaron a archivos ni documentación y no se reproducen aquí. Esto refuerza, no sustituye, la acción pendiente de rotar la clave.

### 11. `faithful-light`: servicio huérfano — MITIGADO REVERSIBLEMENTE 2026-08-08
Encontrado el 2026-08-07 auditando la topología de Railway para la migración del Gateway. En el proyecto `laudable-consideration` (el de `isabel-api`) hay un segundo servicio **Online**, `faithful-light`, que ejecuta `isabel-api/src/core/index.js` — **Isabel Core como servicio independiente**, precisamente la arquitectura que `DECISIONS.md` D9 descartó. Riesgos concretos:
- Tiene **dominio público** (`faithful-light-production-3384.up.railway.app`) con `/v1/chat` y `/v1/now` respondiendo `401` — superficie autenticada expuesta a internet, sin propósito.
- Tiene variables con **secretos reales de producción**: `ANTHROPIC_API_KEY`, `SUPABASE_SERVICE_KEY`, `ISABEL_CORE_API_KEY`, `INVENTORY_API_KEY`.
- Se despliega desde el **mismo repo y rama** que `isabel-api` (`Elena2797/isabel-api`, `main`), así que **cada push a isabel-api lo redespliega** — su último deploy es un commit de esta misma sesión. Nadie lo estaba mirando.
- Su `ISABEL_CORE_API_KEY` tiene el mismo patrón de fallback hardcodeado que el riesgo #2 (`core/config.js`: `process.env.ISABEL_CORE_API_KEY || 'isabel-core-2026'`).

**Nada lo referencia** (cero ocurrencias en `life-os-app`, `isabel-api`, la config del Gateway y `/docs`, salvo la propia documentación de este hallazgo) y sus logs solo contienen líneas de arranque, ninguna petición servida — veredicto **ORPHANED**, ver `operations/GATEWAY_MIGRATION.md` para la auditoría completa. Además era relevante para la frontera de confianza del adaptador IPv6 mientras permanecía vivo. El estado anterior a la mitigación se preservó en un snapshot antes de detenerlo.

**Mitigación aplicada:** se confirmó otra vez que no tuvo tráfico HTTP en los 7 días anteriores, que no tenía dominio público y que nadie lo referenciaba. Se desconectó su source GitHub —causa de que reviviera en cada push— y se detuvo el deployment con `railway down`. No se borraron servicio, variables ni configuración. Estado verificado: cero deployments activos, cero dominios y source `repo:null`. El rollback está documentado en el snapshot privado de esta tanda.

### 12. Con la API key pública se podía leer su Gmail y enviar correos en su nombre — RESUELTO 2026-09-21
Encontrado el 2026-09-21, una hora después de conectar Google (D51). Las tools de correo y agenda (`gmail_*`, `calendar_*`, `google_status` y `outlook_recent`, esta última de otra sesión) vivían en `/mcp`, protegido solo por la API key del riesgo #2, que está en el bundle público de la app: comprobado ese día en el JS de `elena-os-wheat.vercel.app`, y su valor en Railway es el mismo que el fallback. Cualquiera que lo leyera podía leer su correo y su agenda, y enviar correos en su nombre: `gmail_propose_send` + `gmail_confirm_send` los puede llamar el mismo atacante. El OAuth solo impedía conectar **otra** cuenta, no usar la suya. No hay indicios de que nadie lo usara.
**Arreglo** (`isabel-api` `8c38b4a`, `isabel-gateway` `a09f555`): `/mcp` acepta dos llaves. Con `MCP_PRIVATE_KEY` están todas las tools. Esa llave solo vive en Railway: en isabel-api y, en el Gateway, como `ISABEL_MCP_KEY`, referenciada como `${ISABEL_MCP_KEY}` en `openclaw.json`. Con la llave pública están todas menos las de correo y agenda, que se filtran por nombre (`PRIVATE_TOOL`) para que una tool de correo nueva quede protegida sin acordarse. Una sesión privada no acepta llamadas con la llave pública, y sin `MCP_PRIVATE_KEY` configurada no hay acceso privado.
**Sigue abierto:** el resto de `/v1` y de las tools MCP (tareas, salud, recordatorios, inventario) sigue con la llave pública del riesgo #2.

### 13. El chat de la app llevaba al correo por otro camino — RESUELTO 2026-09-21
Encontrado en la revisión de la noche del 2026-09-21, después de cerrar el #12. `POST /v1/chat` aceptaba la API key pública del riesgo #2 y le pasaba el mensaje al agente `main` del Gateway. Ese agente llama a las tools con `ISABEL_MCP_KEY`, así que tiene correo, agenda e Instagram. Cualquiera con la llave del bundle podía pedirle "léeme mis correos" y recibir la respuesta. El #12 solo había cerrado la entrada directa a `/mcp`. Visto en el código; no se probó en producción para no tocar su correo. No hay indicios de que nadie lo usara.
**Arreglo** (D55): se retira la ruta (`isabel-api` `96b0b67`) y el chat de la app (`life-os-app` `2d4e048`). Con Isabel se habla solo por Telegram, que está cerrado a su ID (`dmPolicy: allowlist`). Ninguna ruta de `/v1` llega ya al agente.

### 14. Datos de salud dentro del JS público de la app — RESUELTO 2026-09-22
La pantalla Salud llevaba escritos en `main.js` su medicación y sus condiciones, y Vida Personal, nombres y la salud de su familia. El bundle se sirve a cualquiera que abra la URL (el PIN solo tapa la pantalla). **Arreglo** (D57): protocolo y condiciones viven en `isabel-api/src/core/healthProfile.js` (repo privado) y la app los pide a `/v1/app/health-profile` con token de app; las listas de relaciones y planes se quitaron. Las versiones antiguas del bundle pueden seguir en la caché de Vercel o de su móvil hasta que se sustituyan.

## Lo que NO se encontró (positivo)
- No hay contraseñas ni secretos de terceros hardcodeados más allá de lo anterior.
- Los documentos `.md` de raíz no contienen valores reales de claves.
- No hay inyección SQL evidente — todo el acceso a Supabase pasa por el cliente oficial (`@supabase/supabase-js`) o por PostgREST vía HTTP con parámetros escapados.

## Medidas pendientes

Los riesgos #5 y #11 tienen mitigaciones locales/reversibles aplicadas; #7 está resuelto. La exposición histórica de credenciales no se revoca limpiando una URL: la usuaria debe decidir rotación de los tokens afectados. La acción prioritaria sigue siendo rotar `ANTHROPIC_API_KEY` con el runbook `operations/ROTAR_ANTHROPIC_KEY.md`.
