Estado: fotografía operativa vigente
Última verificación: 2026-09-23

# Estado actual de LIFEOS

## Actualización — 2026-09-23, mediodía (manda sobre las de abajo)

- **Inicio respeta la prioridad real (D71):** las listas de tareas van ordenadas (prioridad → fecha → antigüedad); "Ahora" enseña hasta 3 tareas, una por dominio, con "+N más de <familia>"; la tarjeta roja "Urgente" dice cosas concretas ("7 ítems con stock bajo") en vez de "necesita atención". `life-os-app` `6f39085` (desplegado, bundle de Vercel verificado). Comprobado con sus datos reales: VistaJet + Vida Personal + Marca Personal.
- **D69 enmendado:** Cabin Care sin fecha crea `high`, no `critical`. `isabel-api` `4a17738`, 876/876, `/health` 200.
- **Frontend 84/85 (2026-09-26):** el único rojo es el guard O5 por el hash de `main.js` (`KNOWN_PROBLEMS.md`), anterior a esta sesión.
- **Alcance de esta fotografía:** recoge la sesión del 23/09. El trabajo del 25–26/09 (chat de inventario D70, entrega del 9H-VCF, feedbacks, Outlook) está en `CHANGELOG.md` y `NEXT_SESSION.md`, no aquí.

## Actualización — 2026-09-23, mañana

- **Análisis automático del HOTO crea tareas reales (D69):** cada vez que se crea, edita, se añade un defect/offload o se importa el HOTO activo, un specialist determinista (sin modelo) revisa Cabin Care/Shopping/Defects/Offload/Monthly Focus/cabecera y apunta lo que haga falta en VistaJet, sin que Estefanía lo pida. `isabel-api` `cca4433` (876/876), desplegado, `/health` 200 verificado tras el push. **Sin probar todavía contra un HOTO real de producción** — falta que ella edite o importe el activo y confirme que aparecen tareas nuevas. Detalle: `modules/VISTAJET_HOTO.md`, `DECISIONS.md` D69.
- **Nota honesta, gap detectado al cerrar esta sesión:** entre la actualización de las 17:30 de ayer y esta, se subió a `main` de `isabel-api` el commit `df1da17` ("tool temporal para abrir sesion de inventario (bug RLS)", 04:47Z) desde fuera de esta conversación — toca `inventorySessions.js`, `mcp.js` y el checkpoint de `o5DisconnectedGuard.test.js`. No se documentó en su momento (ni aquí ni en `CHANGELOG.md`) y esta sesión no tiene el contexto de qué bug de RLS resolvía ni si es temporal de verdad. Pendiente de que quien lo hizo (o Estefanía) lo explique para documentarlo — ver `NEXT_SESSION.md`.

## Actualización — 2026-09-22, 17:30 Madrid

- **La app ya no lleva llave (D68, SECURITY #2):** `/v1` acepta el token de app, la llave privada del Gateway, `API_KEY` (solo Railway, sin valor por defecto) o un ticket de PDF de 30 minutos. `isabel-api` `2fcdb0b` (866/867) y `life-os-app` `6c726b3` (63/63) desplegados y verificados en producción. `API_KEY` rotada por ella a las ~15:35Z: `isabel-api-2026` da 401 en `/v1`, MCP y OAuth; los ticks usan la llave privada. SECURITY #2 resuelto. La app carga en su móvil con el token.
- **Turno de noche activo:** el cron `turno-noche-0400` existe desde las 14:48Z; Isabel ve `night_shift_report` y `web_research` (48 tools). Primer `dry_run` bueno (sin escribir). La primera noche real es la del 23.
- **Coach 17:00:** primer disparo bueno hoy (`ok/delivered`).

## Actualización — 2026-09-22, noche

- **Buscador (D67):** Isabel puede buscar en internet (`web_research`, Perplexity Sonar por OpenRouter, con fuentes y sin datos suyos en la consulta) y el turno de noche hace una búsqueda por dominio. `isabel-api` `a1ad7bc`, desplegado. Isabel lo ve tras `openclaw mcp reload` (script de activación, `operations/TURNO_NOCHE.md` §2).

- **Fallos sinceros (D66):** Isabel no promete "no volverá a pasar"; dice si falló ella o el sistema y lo apunta para Claude (`system_report_failure` → `eventos` `lifeos:fallo`). Al empezar cada sesión de desarrollo: `npm run fallos` en `isabel-api`. `isabel-api` `f1db257`. Sin fallos abiertos al cerrar el 2026-09-22.

- **Turno de noche (D65):** a las 04:00 Isabel trabaja sola en JETMI, Marca Personal, Marca Propia y Vida Personal (nunca VistaJet): ordena, deja borradores/planes/checklists y como mucho una pregunta por dominio; lo cuenta el parte de las 08:30 y se ve en cada dominio de la app. Servidor (`isabel-api` `3ea4b44`, 841/842) y app (`life-os-app` `7ba1c76`, 63/63) desplegados y verificados. **Falta aplicar el cron `turno-noche-0400` y el parte nuevo en el Gateway** (`operations/TURNO_NOCHE.md` §2): hasta entonces no corre.

## Actualización — 2026-09-22, tarde

- **"Ya lo hice" (D64):** cuando ella dice que ya hizo algo, `tasks_complete` cierra la tarea y sus recordatorios, o solo el recordatorio si no había tarea; `tasks_list` incluye los recordatorios pendientes. `isabel-api` `b0983f7`, backend 822/823. Probado en producción.

## Actualización — 2026-09-22, mediodía

- **Login real (D62):** la app entra con el código de Telegram y una sesión real de Supabase; RLS `lifeos_owner_only` en todas las tablas. La clave anónima ve 0 filas. SECURITY #3 y #6 resueltos; sigue abierto #2 (la API key pública de `/v1`).
- **O5 canary (D63) encendido en `CANARY`:** lo que ella cuenta de sí misma por Telegram (preferencias, objetivos, compromisos con fecha, límites, hechos) se guarda como conocimiento con sus palabras y el día, e Isabel lo usa después: además de `knowledge_recall`, lo vigente viaja dentro de `vistajet_get_status`, `gym_get_status`, `habits_status`, `tasks_list` y `calendar_list_events` (solo con la llave privada), así que también llega a los mensajes de coach. Ella lo ve y lo olvida en Dominios → "Lo que Isabel sabe de ti". `isabel-api` `76f70bd`, `life-os-app` `b6376a2`. Probado en producción con turnos reales en sesiones aisladas; las frases de prueba se olvidaron y el estado quedó vacío. Apagar o pausar: `operations/O5_CANARY.md`.
- **El Gateway ve tools nuevas sin reiniciar:** `openclaw mcp reload`.
- **Guard O5 verde** en `origin/main` (el rojo era del checkout local atrasado). Backend 814/815 (falla solo la prueba que lee `../life-os-app` fuera de la carpeta), frontend 59/59.

## Actualización — 2026-09-22, mañana

- **Documentación unida a `main`:** la rama `docs/incidente-saldo` (D46–D61) se fusionó en `main`. Ya no hay que buscar el estado en otra rama.
- **Crons verificados hoy** (`openclaw cron list --json`, 09:18Z): sueño 08:00 `ok/delivered` (el primero con DeepSeek), coach 08:30 `ok/delivered` (el primero con agenda y correo), cierre 21:30 del 21 `ok/delivered`, `reminders-tick-1m` y `proactive-tick-15m` `ok`. El coach de las 17:00 aún no tiene ningún disparo bueno (el del 21 lo cortó un reinicio): verificar hoy después de las 15:00Z.
- **Código de app en `main`:** D57–D61 (`life-os-app` hasta `7fdb959`): Inicio solo con lo suyo, VistaJet con tareas reales y rotación que avanza, JETMI desde Cowork, dominios Libro y Marca Propia.
- **`/v1/now`, Inventario y Gym usan DeepSeek V4 Flash vía OpenRouter, con Haiku de repuesto** (`isabel-api` `3412e63`, `OPENROUTER_API_KEY` en el servicio isabel-api, misma clave que el Gateway). Tras el mismo control de gasto; verificado en producción 09:40Z (~0,0003 $ por tarjeta frente a ~0,005 $ con Haiku). Si falta la clave, la cadena vuelve a solo Haiku. La clave de Anthropic caduca el 2026-10-20: desde entonces el repuesto deja de existir, no la función.

## Actualización — 2026-09-21, noche

- **Inicio solo con lo suyo (D59):** saludo, "Urgente" (si no es tarea), "Hoy" (ahora + siguiente + su día) y progreso con rachas. Sin lo que Isabel dijo/hizo/preguntó ni dominios. `life-os-app` `f420055`. Ella ya conectó el móvil.
- **Home es "Hoy con Isabel" y la app se conecta con un código de Telegram (D57).** Lo privado (lo que dijo Isabel, agenda, Instagram, salud) solo con token de app. Sin pestaña Avanzar ni voz de Isabel inventada. `isabel-api` `fbec0f8`, `life-os-app` `a8d808f`. Falta que ella conecte el móvil.
- **JETMI actualizado desde su proyecto de Cowork (D58):** contexto del área, próximos pasos de los 7 proyectos y operadores. `life-os-app` `297a27b`.
- **La app enseña lo que Isabel hizo, sin el registro de coste, y se actualiza sola al volver (D56).** El registro de coste sigue igual en `eventos`. `life-os-app` `6783ec9`.
- **La app ya no tiene chat (D55).** Con Isabel se habla solo por Telegram; "Hablar con Isabel" y la pestaña Isabel abren `t.me/Isabellifeosbot`. `POST /v1/chat` retirado: con la API key pública llevaba al correo (SECURITY.md #13). `isabel-api` `96b0b67`, `life-os-app` `2d4e048`.
- **Isabel ve su Gmail y su Google Calendar** (D51): 34 tools en el Gateway. Las de correo y agenda solo con la llave privada `ISABEL_MCP_KEY` (SECURITY.md #12).
- **Isabel empuja** tres veces al día (D49); desde hoy el parte de las 08:30 trae agenda y correos importantes, y el cierre de las 21:30 lo no contestado.
- **Backend:** `isabel-api` `8c38b4a` en `main`, desplegado desde GitHub. `npm test` 729/731: fallan el guard O5 por `src/index.js` (cambio de Outlook de otra sesión, `1e19184`) y, solo fuera de la carpeta del repo, la prueba que lee `../life-os-app`.
- **Gateway:** `isabel-gateway` `a09f555` (sin remoto; se despliega con `railway up`). Cerebro DeepSeek V4 Flash (D47).

## Actualización — 2026-09-21

- **Isabel (Telegram) vuelve a funcionar.** Cerebro principal: `openrouter/deepseek/deepseek-v4-flash` (OpenRouter directo, 10 $ de prepago). Repuesto: `anthropic/claude-sonnet-4-6` por el proxy de presupuesto `/ai/v1/messages`. Ver `DECISIONS.md` D46 y D47.
- **Coste medido:** un mensaje de Telegram cuesta 0,0038 $ con DeepSeek, frente a 0,113 $ con Sonnet.
- **Backend:** `isabel-api` `92ff51a` en `main` (código del proxy `b360282`), 630/630 tests. GitHub y producción coinciden.
- **Pendiente:**
  - la clave nueva de Anthropic **caduca el 2026-10-20**: renovarla antes, o Claude deja de servir de repuesto (la expuesta `97e63348…` ya está revocada, 401 verificado);
  - verificar el cron de sueño del 2026-09-22 a las 08:00;
  - llevar el gasto de OpenRouter a `budget-status`;
  - decidir el nivel de thinking de DeepSeek (hoy `high`).
- **Desde la tarde del 2026-09-21:** Isabel apunta, lista y completa tareas de LIFEOS por Telegram; cierra inventarios abiertos con confirmación (D48); y escribe por su cuenta a las 08:30, 17:00 y 21:30 (D49). Recordatorios a una hora concreta desde el mismo día (cron `reminders-tick-1m`). Sin calendario todavía.
- **Desde la noche del 2026-09-21 (D53):** Isabel pone el ON/OFF desde el chat, standby se ve como parte de la rotación, y el Gateway usa MCP sin estado (`/mcp/http`), así que un deploy de `isabel-api` ya no la deja sin tools. `isabel-api` `f3cf0e2`, `life-os-app` `df9c90b`.
- **Desde última hora del 2026-09-21 (D50):** lo que ella le dice a Isabel se ve en Dominios, en VistaJet y en Home. La prioridad cuenta lo urgente, lo de hoy y lo importante, y se recalcula al volver de Telegram. Isabel corrige y descarta tareas, y Home enseña los recordatorios. `isabel-api` `dcff14e`, `life-os-app` `7f5c410`.
- Detalle operativo y trampas: `operations/INCIDENTE_SALDO_2026-08-11.md` §12.

## ⚠ Corrección — 2026-09-20

**Todo lo que este documento dice sobre el heartbeat y sobre el coste es incorrecto desde el
2026-08-09.** El heartbeat se apagó solo en el Gateway nuevo; el Gateway antiguo del proyecto
Railway `isabel-gateway` siguió despertando al agente 48 veces al día con la misma clave hasta que
se detuvo el 2026-09-20. Agotó el saldo el 2026-08-11 a las 02:18 UTC.

Las frases "Heartbeat: **PASS** … cero después del reinicio" y "Coste O4 sin contaminación" eran
ciertas **solo para el Gateway nuevo**, que es lo único que O4 observa. No las uses como evidencia
de nada.

LIFEOS lleva parado desde entonces. Estado real, causa demostrada, mapa de rutas de pago y
secuencia de reactivación: [`operations/INCIDENTE_SALDO_2026-08-11.md`](operations/INCIDENTE_SALDO_2026-08-11.md).
Antes de tocar nada relacionado con gasto, leer ese documento primero.

## Checkpoint funcional — 2026-08-10 13:18 Europe/Madrid

Este bloque reemplaza como estado vigente las cifras históricas que aparecen más abajo.
Superado por la corrección de arriba en todo lo relativo a heartbeat y coste.

### Producción verificada

- Backend productivo: `60ee37215bff88d63a27df35911edae73f6eee84`, Railway `SUCCESS`/`RUNNING`.
- Frontend funcional productivo: `a5c03f4`; Vercel responde 200 con bundle `/assets/index-D0Xxn-dR.js`, que contiene `/v1/finance/summary`, `/v1/health/sleep/recent` y `/v1/gym/state`.
- `/health` responde OK.
- `GET /v1/finance/summary?month=2026-06` responde el contrato autenticado: 125 movimientos, 0 filas inválidas, 0 gastos sin categoría, fuentes normalizadas `revolut/sabadell/unknown`, 0 presupuestos y por tanto 0 señales/0 candidatos.
- No se aplicaron migraciones, flags, cambios de prompts/tools/modelos/crons/Telegram ni configuración de OpenClaw.

### Qué se activó durante O4

- SurfaceSync al abrir/volver a LIFEOS: Supabase, preguntas, Gym, sueño y Finanzas; sin polling y sin llamar a `/v1/now`.
- Sueño reciente persistido, visible en LIFEOS cuando fue escrito por Telegram/MCP.
- Finanzas V1 determinista y de sólo lectura: ventana mensual, cobertura, categorías, presupuestos explícitos y señales explicables. No está conectada a MCP, prioridad, proactividad ni entrega.

### Qué está preparado pero desconectado

O5 completo permanece inalcanzable desde el runtime: Conversation → KnowledgeCandidate → política → ledger/estado/Goals → specialists/signals/actions → prioridad → Home → FollowUps/feedback. No hay rutas montadas, migraciones aplicadas ni flags activos. El guard de import graph y checkpoints continúa verde.

### Validación

- Backend productivo exacto: 530/530 pruebas, 165 suites.
- O5 desconectado: 102/102.
- Frontend productivo exacto: 33/33 y build Vite/PWA.
- Lectura real financiera total: 881 movimientos entre 2026-01-01 y 2026-06-26; 762 gastos, 119 ingresos; 631 Sabadell, 240 Revolut, 10 fuente desconocida.
- Auditoría funcional por módulo: `docs/modules/MODULE_LOOP_AUDIT_2026-08-10.md`.

### Coste O4 sin contaminación

Ventana `2026-08-09T13:22:00Z → 2026-08-10T11:18:01Z`: 37 llamadas, $0.648633; Telegram 32/$0.525136, cron 3/$0.116153, isabel-api 2/$0.007344, heartbeat 0. Desde el deployment financiero de `2026-08-10T11:16:24.780Z`: 0 llamadas IA.

### Siguiente frontera

Hasta `2026-08-11T13:22:00Z` no tocar modelos, providers, routing, caché, heartbeat, prompts, tools, skills, crons, frecuencia, Telegram ni nada que cambie llamadas IA. Después del cierre de O4, el siguiente slice recomendado es activar una sola entrada canary reversible para KnowledgeCandidate y demostrar una frase general de Telegram → estado estructurado → LIFEOS, con deduplicación, provenance, kill switch y rollback.

---



## Estado general

LIFEOS mantiene una sola Isabel, un Priority Engine global, especialistas deterministas y memoria operacional en Supabase. La dependencia estructural de las llamadas directas a Anthropic ya está desacoplada: `isabel-api` tiene un Model Router neutral por capacidades, fallback representable y observabilidad común. No se conectó ningún proveedor nuevo ni se cambió ningún modelo.

## Producción

- `isabel-api` sirve el commit `5175136033c181e1c44bc030c0a4e4d5948c34d4` con deployment Railway `f146452d-9c02-412e-b90c-08d173bc05ff` `SUCCESS`/`RUNNING`. O4 se introdujo en `9c2e176`; el commit actual solo agrega benchmark/simulador y conserva `/health` y O4 en verde.
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

- Backend: 523/523 pruebas, 163 suites.
- Frontend: 10/10 pruebas, 2 suites.
- Benchmark: 23 casos A–W conservados + 10 JETMI + 4 de sensibilidad = 37 casos validados; fixtures J–M 4/4 PASS, coste $0, sin llamadas a modelo.
- Build Vite: completo; advertencia existente de chunk grande, sin fallo.
- Producción: `/health`, `/v1/now`, `/v1/gym/state`, `/v1/proactive/budget` responden 200.
- No se envió ninguna notificación de prueba.

La inspección visual automatizada de Home/Dominios/Gym/Isabel no pudo completarse porque el controlador de navegador de Codex falla por permisos de Windows antes de abrir la app. La compilación, las pruebas de presentación y el bundle productivo sí están verificados; no declarar QA visual manual completo.

## Coste actual medido

La ventana historica medida antes de la correccion fue **$12.535 en 70 horas ≈ $4,30/día ≈ $129/mes**. Era gasto real con heartbeat, no la nueva tasa.

O4 ya corrige los puntos ciegos: barre `main`, `lifeos` y el cron estable desde el tick de 15 minutos, conserva el timestamp del evento y declara cobertura/coste. Se demostro en produccion a las 14:30 UTC sin abrir `/v1/chat`: 27 registros recibieron superficie y el tick termino 200/ok.

Causa historica demostrada: el **heartbeat default de 30 minutos** produjo el 71,6% del gasto. Esta muerto: 99 heartbeats totales, ultimo `2026-08-09T13:17:56.992Z`, **cero posteriores** al reinicio de `13:22Z`.

Composición del contexto, medida con `count_tokens`: de los 23.235 tokens fijos por turno, **17.178 (73,9%) son definiciones de tools** y 5.530 el system prompt; la memoria persistente son 168 tokens. El catalogo actual expone **47 tools** y los metadatos retenidos muestran uso de **9**.

Detalle completo: [`research/AI_RUNTIME/MEDICION_CONTEXTO_2026-08-09.md`](research/AI_RUNTIME/MEDICION_CONTEXTO_2026-08-09.md) y [`research/AI_RUNTIME/AUDITORIA_TOOLS_SKILLS_2026-08-09.md`](research/AI_RUNTIME/AUDITORIA_TOOLS_SKILLS_2026-08-09.md). P1/O3 siguen **sin aplicar**.

## Bloqueos reales

1. QA visual automatizado: bloqueado por el controlador del navegador de Codex. Requiere recuperar esa conexión o validación manual en el dispositivo.
2. ~~El sleep cron productivo está habilitado e intacto, pero su última ejecución registrada falló durante el incidente de saldo bajo.~~ **RESUELTO sin intervención el 2026-08-09**: el cron se disparó solo a las 08:00 Europe/Madrid y `openclaw cron list --json` (solo lectura, Gateway nuevo) devuelve `lastRunStatus: "ok"`, `lastDeliveryStatus: "delivered"`, `lastDelivered: true`, `consecutiveErrors: 0`. No se forzó manualmente ni se envió ninguna notificación de prueba.
3. Rotar `ANTHROPIC_API_KEY` sigue pendiente de la usuaria.
4. `isabel-gateway` continúa sin remoto demostrado.

## Siguiente paso

Revisar este checkpoint. La siguiente decision es una sola: observar el baseline 48 h y despues elegir entre aplicar P1/O3 de forma reversible o autorizar un benchmark real sanitizado. No hay que conectar ningun proveedor hoy.

## Preparacion multi-modelo durante O4

Sin tocar produccion se audito el corpus completo (37 casos), se cerro una shortlist de 8 modelos, se construyeron adapters contractuales desconectados, politica de sensibilidad, Agent Budget Contract, JETMI LIGHT/NORMAL/150, Cost Simulator V2 y un smoke exacto de 48 requests con coste conservador `$0.744826`, kill-cap `$0.90` y cap absoluto `<$1`. P1, O3 y G8 siguen propuestas y **NO aplicadas**. No se conecto ningun proveedor, key ni runner real.

Checkpoint completo: [`research/AI_RUNTIME/PREPARACION_MULTIMODELO_48H_2026-08-09.md`](research/AI_RUNTIME/PREPARACION_MULTIMODELO_48H_2026-08-09.md).

Ultima lectura O4 solo-metadata: `2026-08-09T16:26:16.110Z`, frontera `13:22Z`, 0 registros IA, 0 turnos, `$0` y 0 registros sin coste conocido. Ventana valida parcial de 3 h 4 min 16 s; no confundir con las 48 h requeridas.
