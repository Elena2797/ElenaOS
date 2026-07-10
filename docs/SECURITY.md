Estado: implementado (documenta riesgos reales, no un plan de mitigación)
Última verificación: 2026-07-10
Verificado en: grep directo sobre isabel-api/src y life-os-app/src, lectura de .git/config
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

### 6. Sin autenticación de usuario
No hay login, no hay sesiones de usuario, no hay JWT propio del sistema. Todo el acceso se basa en "quien tiene la URL y las claves". Es coherente con ser una app estrictamente personal de un solo usuario — pero significa que no hay ninguna capa que impida acceso si las claves se filtran.

## Lo que NO se encontró (positivo)
- No hay contraseñas ni secretos de terceros hardcodeados más allá de lo anterior.
- Los documentos `.md` de raíz no contienen valores reales de claves.
- No hay inyección SQL evidente — todo el acceso a Supabase pasa por el cliente oficial (`@supabase/supabase-js`) o por PostgREST vía HTTP con parámetros escapados.

## Medidas pendientes (no implementadas, solo constancia)
Ninguna medida de mitigación de lo anterior está implementada a día de hoy. No se lista un "plan" porque no se ha decidido ninguno — si se decide abordar algo de esto, la decisión debe registrarse en [DECISIONS.md](DECISIONS.md).
