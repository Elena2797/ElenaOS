Estado: conocimiento vigente — lista viva, se actualiza con "Actualiza la documentación"
Última verificación: 2026-08-06
Verificado en: auditorías de sesiones anteriores (HOTO, Inventario, arquitectura de Isabel, incidente de Supabase pausado) + incidentes de infraestructura reales del 2026-08-03 (Isabel Core Fase 1/2, Railway, Vercel) + spike de OpenClaw del 2026-08-05 + repro Windows-vs-Linux y despliegue real de `isabel-gateway` en Railway del 2026-08-06

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

### Cron de OpenClaw vía CLI está bloqueado por el scope `operator.admin`, incluso con token compartido — RESUELTO vía Control UI + túnel SSH privado
Confirmado el 2026-08-05, perfil `dev` aislado, y reconfirmado el 2026-08-06 contra `isabel-gateway` en Railway: `openclaw cron add` (comandos de escritura de cron en general) fallan con `scope upgrade pending approval`. Cada intento de aprobar ese scope (`openclaw devices approve <requestId>`) genera automáticamente una *nueva* solicitud pendiente para sí mismo antes de poder aplicar la aprobación — un bucle estructural, no un fallo puntual; reintentar más rápido no lo arregla. Comandos de solo lectura como `openclaw cron list`, `openclaw pairing approve <channel> <code>` y `openclaw devices list` sí funcionan por CLI sin este bloqueo.

**Workaround confirmado el 2026-08-06, de punta a punta, contra producción:** la Control UI (navegador) sí puede crear/gestionar cron sin el bloqueo de scope, pero `isabel-gateway` la tiene deliberadamente sin exponer (`gateway.bind: loopback`, sin dominio público). La vía que funciona sin exponer nada públicamente: `railway ssh config` escribe un alias real de OpenSSH (`railway-ssh-config --dry-run` no hace falta; simplemente `railway ssh config` sin subcomando), y con ese alias un `ssh -L 18080:127.0.0.1:8080 <alias> -N` normal (el binario `ssh` del sistema, no `railway.exe`) abre un túnel privado — solo accesible desde la máquina que lo abrió — hacia el puerto interno del Gateway. La Control UI, servida en `http://127.0.0.1:<puerto-local>/`, pide `OPENCLAW_GATEWAY_TOKEN` (variable ya existente en Railway) para autenticarse; una vez dentro, crear/editar/eliminar cron funciona con normalidad y sin scope de operador de por medio. Cerrar el túnel (matar el proceso `ssh`) cuando no se necesite — no debe quedar abierto de forma permanente. Ver `core/AUTOMATIONS.md` y `DECISIONS.md` D11 para el contexto del despliegue.

### El turno de agente aislado disparado por un cron de OpenClaw no arrancaba en Windows — RESUELTO (específico del runtime Windows, no bloquea Railway)
Encontrado el 2026-08-05 en Windows: un cron creado vía Control UI se disparaba en el horario programado, pero el turno de agente nunca llegaba a arrancar ("isolated agent setup timed out before runner start"). El 2026-08-05/06 se reprodujo el mismo escenario exacto (mismo OpenClaw 2026.6.10, mismo modelo, mismo MCP) en WSL2/Linux nativo y **completó el ciclo entero sin fallo**: cron → runner_entered → claude-cli → MCP autenticado → tool → respuesta → run OK. Conclusión: el bug es específico del runtime Windows (relacionado con un reinicio en cascada que en Windows cae en modo degradado "in-process restart" por falta de integración con Scheduled Tasks), no de OpenClaw en general. No bloquea el despliegue en Railway (Linux). La causa exacta del cuelgue previo al watchdog de 60s en Windows sigue sin acotarse a nivel de código, pero deja de ser relevante para producción.

### `claude-cli` no completaba su registro de auth profile dentro del contenedor de `isabel-gateway` (Railway) — RESUELTO (se abandonó `claude-cli`, no se arregló el login)
Encontrado el 2026-08-06: todo turno de agente real en `isabel-gateway` fallaba con `FailoverError: Not logged in · Please run /login`. Varios intentos de completar `claude auth login` (OAuth interactivo) vía `railway ssh` (directo, `su node -c`, `su - node`, tmux, named pipe) fallaron — o el proceso volvía al shell antes de poder pegar el código, o "tenía éxito" pero no persistía `~/.claude/.credentials.json`. La causa raíz resultó ser arquitectónica, no de ejecución: el backend `claude-cli` de OpenClaw lee credenciales directamente de ese fichero en el host (confirmado leyendo `cli-auth-seam-CzFhiHUR.js`/`store-DcJR3uqo.js` del paquete `openclaw`), y la documentación oficial de OpenClaw dice explícitamente que este backend espera reutilizar un login de Claude Code ya existente en el mismo host físico, no en un contenedor efímero. Se abandonó `claude-cli` y se cambió a auth de API key (`ANTHROPIC_API_KEY`, ya configurada) — ver `DECISIONS.md` D11. Un turno de agente real completa correctamente desde entonces (verificado en producción, log `stopReason=stop`, sin error).

### `railway.exe ssh` no re-escapa argumentos con espacios al reenviarlos por el canal exec de SSH
Encontrado el 2026-08-06 mientras se depuraba el problema anterior: `railway ssh -- su node -c "comando con espacios"` llega al contenedor partido en tokens sueltos — `su` interpreta la parte final como si fueran sus propias flags (p. ej. `su node -c "openclaw --version"` hace que `su` imprima su propio `--version`, no el de `openclaw`). Es un bug de cliente en `railway.exe` al construir el string del canal exec de SSH (no re-cita tokens que contienen espacios), no algo de OpenClaw ni de `su`. **Workaround confirmado:** pasar comillas literales escapadas como parte de un único argumento local, para que sobrevivan al aplanado — p. ej. `railway ssh -- su node -c \'comando\ con\ espacios\'` (los `\'` y `\ ` producen caracteres literales `'` y espacio dentro de un solo token de shell local, que `railway.exe` reenvía intactos y el shell remoto sí interpreta como comillas reales). Relevante para cualquier administración futura de `isabel-gateway` vía `railway ssh`.

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
Ver [SECURITY.md](SECURITY.md) — no se duplica aquí, pero cuenta como deuda técnica activa (PIN hardcodeado, API key con fallback expuesto en el bundle, RLS desactivado, token de GitHub en texto plano, token de Telegram comprometido presente también en el perfil real de OpenClaw, `ANTHROPIC_API_KEY` expuesta en texto plano en chat el 2026-08-06). El riesgo de MCP sin autenticación ya se resolvió (2026-08-06).
