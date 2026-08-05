Estado: conocimiento vigente — lista viva, se actualiza con "Actualiza la documentación"
Última verificación: 2026-08-05
Verificado en: auditorías de sesiones anteriores (HOTO, Inventario, arquitectura de Isabel, incidente de Supabase pausado) + incidentes de infraestructura reales del 2026-08-03 (Isabel Core Fase 1/2, Railway, Vercel) + spike de OpenClaw del 2026-08-05

# KNOWN_PROBLEMS.md — Deuda técnica y grietas conocidas

No confundir con bugs ya resueltos (→ [CHANGELOG.md](CHANGELOG.md)). Esto es lo que sigue abierto.

## Disponibilidad de datos

### Supabase (plan gratuito) puede pausar el proyecto por inactividad — se manifiesta como NXDOMAIN, no como un error HTTP normal
Verificado el 2026-08-02: el proyecto `cllubptdwydifomlnxds` estuvo pausado, y el efecto no fue un 503 o un timeout — el hostname dejó de resolver en DNS por completo (NXDOMAIN, confirmado con un resolver DNS público). Cualquier chat futuro que diagnostique "Supabase no responde" debe comprobar DNS primero, no asumir problema de red del dispositivo o de CORS. Método documentado en [operations/SUPABASE.md](operations/SUPABASE.md). Antes del fix del 2026-08-02 (ver `DECISIONS.md` D8), esto era indistinguible en la UI de "no hay dominios" — ahora dispara un banner explícito con botón "Reintentar".

### `loadAll()` solo trata `ctx`/`areas` como críticos — las otras 11 tablas se degradan a vacío en silencio
`reload()` (`src/main.js`) dispara el banner de error solo si fallan `life_context` o `areas` — el resto (`tasks`, `waiting_for`, `decisions`, `metrics`, `operators`, `transactions`, `vj_state`, `vj_tasks`, `projects`, `eventos`, `alertas`) sigue coercionando `data:null` a `[]` sin avisar si fallan individualmente. Decisión consciente de alcance mínimo (esas dos son las que producían el síntoma reportado por la usuaria), no un descuido — pero significa que un fallo parcial en, por ejemplo, `alertas` seguiría siendo invisible.

### "Gym" existe en la tabla `areas` pero nunca aparece en Dominios
`visibleDomains()` (`src/main.js`) filtra por una lista fija de 6 nombres (`VistaJet, JETMI, Finanzas, Salud, Marca Personal, Vida Personal`) que no incluye "Gym", aunque la fila existe en Supabase (7 áreas en total, confirmado por consulta directa a la REST API el 2026-08-02). No se sabe si es intencional (¿Gym vive dentro de "Salud"?) o un olvido — detectado de paso durante el diagnóstico del bug de Dominios vacío, no investigado a fondo.

## Arquitectura

### Cuatro sistemas de "Isabel", solo uno en uso real
Ver [core/ISABEL_CHANNELS.md](core/ISABEL_CHANNELS.md) para el detalle completo. Impacto: cualquier trabajo futuro sobre "el chat de Isabel" debe primero confirmar sobre cuál de los 4 canales se está trabajando — son código independiente, no una sola pieza con variantes.

### `isabel-api/src/core/router.js` (Isabel Core con routing a especialistas) existe pero no está montado
**Actualizado 2026-08-03: ya no aplica a todo `core/`.** `index.js` monta `core/now.js` (`GET /v1/now`, solo lectura, ver `core/ISABEL_NOW.md`), pero sigue sin importar `core/router.js` (`POST /chat`, `intentRouter`, `inventoryDelegate`, `generalHandler`). Es código completo, probablemente funcional si se conectara, pero no forma parte del servidor que corre en producción. Impacto: cualquier chat que lea el código de `core/` sin verificar `index.js` línea por línea asumirá que todo está activo, o que nada lo está — ninguna de las dos es cierta.

### Cron de OpenClaw vía CLI está bloqueado por el scope `operator.admin`, incluso con token compartido
Confirmado el 2026-08-05, perfil `dev` aislado: `agent cron add` (y comandos `cron` equivalentes) fallan con "scope upgrade pending approval" al autenticar por token compartido. La vía de bypass documentada para token compartido ("restaura scope completo") solo aplica a superficies HTTP concretas (`/tools/invoke`, endpoints compatibles con OpenAI), no al protocolo WS que usa la CLI para administrar cron. **Workaround confirmado que sí funciona:** administrar cron desde la Control UI (navegador), que se auto-aprueba vía loopback. Cualquier automatización futura con OpenClaw debe planificarse asumiendo Control UI como vía de administración de cron, no CLI. Ver `core/AUTOMATIONS.md`.

### El turno de agente aislado disparado por un cron de OpenClaw no arranca — "isolated agent setup timed out before runner start"
Encontrado el 2026-08-05, perfil `dev` aislado: un cron creado correctamente vía Control UI se disparó en el horario programado, pero el turno de agente que debía ejecutar nunca llegó a arrancar, con ese mensaje de timeout. No investigado — estaba fuera del objetivo acotado de esa fase de spike. Bloqueante para confiar en cron de OpenClaw en producción hasta que se entienda la causa. Ver `core/AUTOMATIONS.md`.

### `isabel-api/src/mcp.js` no tiene autenticación
Ver [SECURITY.md](SECURITY.md) riesgo #7 — no se duplica el detalle aquí. Cuenta como bloqueante concreto (no solo deuda genérica) para el plan de desplegar OpenClaw como runtime remoto.

## Duplicación de datos

### Shopping/stock se captura por duplicado entre Inventario y HOTO
`vj_inventory_session_items` (Inventario) y `vj_hoto_records.shopping` (HOTO) capturan el mismo tipo de información (qué hay a bordo) de forma independiente. La regla acordada es "HOTO copia con gesto explícito, nunca sincroniza automáticamente" — es una mitigación de UX, no una solución de modelo de datos. Ver DECISIONS.md para la decisión original.

### Defects viven solo en HOTO, no en un módulo propio
No existe un módulo "Defects" independiente. Los defectos documentados en HOTO (`vj_hoto_items`, section=`defect`) son la única fuente — si en el futuro se crea un módulo de Defects real, este dato tendría que migrarse o referenciarse, no duplicarse.

## Checklist Daily Duties del HOTO

### Un item del checklist no tiene checkbox oficial en el PDF
`s9` ("Winter/Summer Ops performed") no tiene fila correspondiente en el formulario oficial de VistaJet. Se muestra en la app marcado explícitamente "(no está en el PDF)" — decisión consciente, no un bug, pero deja al usuario con un tick que nunca se refleja en el documento exportado.

### Columnas 2-6 de la tabla de CH histórico no se exportan
El PDF oficial soporta hasta 6 CH distintos por rotación (histórico). El HOTO vivo en LIFEOS solo modela la columna actual (`ch_column_index`). Las otras 5 se limpian explícitamente en cada export (comportamiento correcto para "sin HOTO previo"), pero si se recibe un HOTO con histórico real de otras CH, ese histórico no tiene dónde vivir hoy.

## Modelo de datos

### `transactions`, `metrics` y `operators` no tienen `CREATE TABLE` en ningún repo
Ver [DATA_MODEL.md](DATA_MODEL.md). Si Supabase se perdiera, estas tres tablas no podrían recrearse solo con el código versionado — habría que reconstruir el esquema a mano a partir de las columnas observadas.

### `.env.example` de `life-os-app` está incompleto
No incluye `VITE_ISABEL_API_URL` ni `VITE_ISABEL_KEY`, que sí se usan en producción. Alguien que siga el `.env.example` al pie de la letra tendrá el chat/HOTO/Inventario roto sin saber por qué.

## Integraciones sin conectar

### Gmail OAuth existe como código, sin UI que lo dispare
`life-os-app/api/gmail-auth.js` y `gmail-callback.js` son funciones serverless completas y funcionales en aislamiento, pero 0 referencias desde el frontend. No se sabe si el objetivo original sigue vigente.

## Infraestructura / deploy

### El service worker de la PWA puede servir un bundle viejo después de un deploy real y correcto
Verificado dos veces el 2026-08-03: tras un deploy exitoso en Vercel (bundle nuevo confirmado por hash y por contenido), la app seguía mostrando comportamiento del bundle anterior hasta hacer `navigator.serviceWorker.getRegistrations()` → `unregister()` + `caches.keys()` → `caches.delete()`. Sin este paso, es indistinguible de "el deploy no llegó" o "el fix no funciona" — antes de diagnosticar un deploy que "no se nota", limpiar el service worker primero. En el iPhone: cerrar la app/pestaña por completo y reabrir, o borrar datos del sitio en Safari si persiste.

### Railway puede tener una región inválida configurada que bloquea todos los deploys nuevos sin ningún error visible
Encontrado el 2026-08-03 en `isabel-api`: la región estaba fijada en `sfo` (inválida), y el mensaje "Invalid region sfo is configured on this service and is blocking deployments" solo aparece en Settings → Scale — no en ningún otro sitio del dashboard, no como notificación, no como fallo de build. El servicio seguía "Online" sirviendo el último build bueno, así que parecía sano. Corregido a `us-west2`. Si un futuro deploy de `isabel-api` "no coge" el commit nuevo pase lo que pase, comprobar esto antes que nada. Ver `operations/RAILWAY.md`.

### El webhook GitHub→Railway puede quedar obsoleto sin aviso, incluso con "Auto deploy" mostrando activado
Encontrado el 2026-08-03: con la región ya corregida, Railway seguía sin recoger el commit más nuevo de `isabel-api` — ni "Redeploy" ni "Latest deploy" ni re-seleccionar la rama en el dropdown lo resolvían (todos reconstruían el mismo commit viejo). Solo un `Disconnect` + `Connect Repo` completo del Source forzó una resincronización real. Ver `operations/RAILWAY.md`.

## Seguridad
Ver [SECURITY.md](SECURITY.md) — no se duplica aquí, pero cuenta como deuda técnica activa (PIN hardcodeado, API key con fallback expuesto en el bundle, RLS desactivado, token de GitHub en texto plano, MCP de `isabel-api` sin autenticación, token de Telegram comprometido presente también en el perfil real de OpenClaw).
