Estado: conocimiento vigente — se añade, nunca se reescribe
Última verificación: 2026-08-02
Verificado en: reconstrucción a partir del historial de esta sesión de desarrollo
Fuente de verdad de datos: ninguna

# DECISIONS.md — ADR ligero

Formato: decisión · fecha · contexto · alternativa descartada · razón · estado. Las decisiones superadas se marcan como tal (no se borran) y, si procede, se copian a `/archive/deprecated-decisions.md` con su reemplazo enlazado.

---

### D1 — El PDF/Excel oficial es exportación, nunca el lugar de edición
**Fecha:** anterior a esta auditoría (patrón ya establecido en Inventario, replicado en HOTO)
**Contexto:** VistaJet exige documentos oficiales con formato exacto (Excel de inventario, PDF de HOTO).
**Alternativa descartada:** editar el Excel/PDF directamente o mantenerlo como fuente de verdad.
**Razón:** un documento binario no es consultable ni versionable de forma útil; Supabase permite edición incremental durante toda la rotación y el documento se genera solo al final.
**Estado:** vigente.

### D2 — Shopping en HOTO se alimenta de Inventario por copia explícita, no por referencia viva
**Fecha:** 2026-07-07 (iteración de Aircraft Shopping en HOTO)
**Contexto:** el stock a bordo ya se captura en Inventario; HOTO necesita reflejarlo en el documento de entrega.
**Alternativa descartada:** que HOTO lea Inventario en vivo en cada render, o que ambos escriban a la misma tabla.
**Razón:** el HOTO es una fotografía del momento de entrega, no un espejo en vivo — Inventario puede seguir cambiando después de que el HOTO se congele. Copiar con gesto explícito ("Usar") preserva esa semántica sin fusionar los modelos de datos.
**Estado:** vigente. Efecto secundario documentado como deuda técnica en `KNOWN_PROBLEMS.md`.

### D3 — Magazines se modela como lista estructurada; el PDF solo recibe el resumen derivado
**Fecha:** 2026-07-07
**Contexto:** el HOTO heredaba un valor de texto libre de "Magazines" del PDF original, sin forma de saber qué revistas debían llevarse ni su estado.
**Alternativa descartada:** seguir usando un campo de texto libre.
**Razón:** sin estructura no se puede razonar sobre "¿está al día?" ni detectar cuándo una revista confirmada el mes pasado necesita reconfirmarse.
**Estado:** vigente.

### D4 — Write-all en el exportador de HOTO
**Fecha:** 2026-07-07
**Contexto:** se detectó que un valor heredado del PDF original ("All May" en Magazines) sobrevivía en exports posteriores aunque ya no estuviera en la app.
**Alternativa descartada:** seguir escribiendo solo los campos con valor.
**Razón:** el PDF debe ser función pura de Supabase — cualquier campo modelado se escribe siempre, con valor o vacío explícito, para que nunca arrastre datos de una exportación anterior.
**Estado:** vigente, aplicado también al checklist Daily Duties.

### D5 — Daily Duties se persiste en Supabase (`vj_hoto_records.daily_duties`), no en localStorage
**Fecha:** 2026-07-10
**Contexto:** el checklist vivía solo en el navegador; no sobrevivía a cambiar de dispositivo, no llegaba al PDF, y los checkboxes oficiales del documento siempre salían vacíos.
**Alternativa descartada:** mantenerlo en localStorage indefinidamente, o crear una tabla nueva en vez de una columna JSONB.
**Razón:** el checklist SÍ corresponde a checkboxes reales del PDF oficial (verificado empíricamente: 46 de 47 items tienen fila correspondiente) — es dato del dominio, no una conveniencia de la app. JSONB en la tabla existente evita una migración de esquema mayor.
**Estado:** vigente. Migración de datos existentes en localStorage → Supabase implementada como proceso one-time, en el dispositivo del usuario, sin borrar el localStorage original.

### D6 — Reconstrucción de HOTO por fases, nunca big-bang
**Fecha:** 2026-07-09 (tras auditoría solicitada por la usuaria)
**Contexto:** se identificó que el HOTO modela el documento PDF en vez de la rotación, causando duplicación de datos con otros módulos.
**Alternativa descartada:** rediseñar el modelo de datos del HOTO de una vez.
**Razón:** había datos reales de producción en juego (HOTO de una entrega real) el mismo día de la auditoría. La usuaria exigió explícitamente que cualquier cambio de esquema fuera aditivo, verificado antes/después, y nunca destructivo.
**Estado:** vigente como principio general para cualquier cambio de esquema futuro (ver `PRINCIPLES.md` #5).

### D7 — `/docs` vive en `life-os-app`, no en un repo nuevo ni en la raíz sin git
**Fecha:** 2026-07-10
**Contexto:** la raíz `LIFE OS/` no es un repositorio git; había que decidir dónde vive la memoria persistente del proyecto.
**Alternativa descartada:** crear un repo `lifeos-docs` separado, o documentar dentro de `isabel-api`.
**Razón:** `life-os-app` es el punto de entrada real del sistema para la usuaria y ya tenía la disciplina de README más cuidada de los tres repos.
**Estado:** vigente.

### JETMI-D1 — JETMI se posiciona como broker de aviación privada, no como plataforma de descubrimiento ni como herramienta para vender leads a otros brokers
**Fecha:** 2026-07-14
**Contexto:** al crear `research/JETMI/` se detectó una contradicción de posicionamiento entre dos documentos de la raíz: `jetmi.md` (junio 2026) describe JETMI como "plataforma de descubrimiento de oportunidades... No es broker ni operador"; `JETMI_PRD_Semilla.md` (v0.4, 2026-06-29) ya modela un negocio de brokeraje (vocabulario de Solicitud/Cotización/Reserva, Motor Financiero). Ver `research/JETMI/HYPOTHESES.md` C1 para el detalle de la contradicción.
**Alternativa descartada:** (a) mantener el marco de "plataforma de descubrimiento" de `jetmi.md`; (b) un modelo donde el negocio principal fuera generar y vender oportunidades/leads a otros brokers en vez de operar el brokerage directamente.
**Razón:** decisión de negocio explícita de Estefanía — JETMI existe para construir y operar un broker de aviación privada propio, no para intermediar entre operadores y otros brokers ni para quedarse en la capa de descubrimiento/marketing.
**Estado:** vigente. `jetmi.md` (raíz) queda marcado como superseded en su propia cabecera, sin borrar ni reescribir su contenido — ver `archive/deprecated-decisions.md`. `JETMI_PRD_Semilla.md` no se modifica en esta decisión; su lenguaje en la línea 22 ("empresa de descubrimiento, comercialización y gestión de oportunidades") antecede a esta decisión y queda anotado como nota pendiente en `research/JETMI/HYPOTHESES.md`, no como acción tomada.
**Nota de estado real:** a fecha de esta decisión, JETMI está en fase de definición, investigación y diseño. No existe todavía ninguna sociedad JETMI LDA constituida en Portugal ni en ninguna otra jurisdicción — ver `modules/JETMI.md`.

### D8 — Un fallo de carga inicial se muestra explícitamente (banner + Reintentar), nunca se interpreta en silencio como "no hay datos"
**Fecha:** 2026-08-02
**Contexto:** la usuaria reportó Dominios vacío con la píldora de modo en "OFF". Auditoría de código demostró que `reload()` coercía cualquier fallo de red de `ctx`/`areas` a `[]`/valor por defecto sin ningún aviso — indistinguible de "no hay dominios" o de que ella hubiera puesto el modo en OFF. La causa real, investigada en la misma sesión, fue el proyecto de Supabase pausado (plan gratuito).
**Alternativa descartada:** reintentar automáticamente en bucle sin avisar a la usuaria; o mostrar un mensaje de error genérico sin acción disponible, obligando a recargar toda la app.
**Razón:** la usuaria necesita poder distinguir "esto está realmente vacío" de "esto no cargó" sin depender de este chat para diagnosticarlo, y necesita una acción inmediata (Reintentar) en vez de recargar toda la aplicación. Coherente con `PRINCIPLES.md` #2 ("nunca inventar información ausente" — aquí, nunca *interpretar* un vacío por fallo como un vacío real).
**Estado:** vigente. Alcance mínimo deliberado: solo `ctx` (modo) y `areas` (Dominios) disparan el banner, por ser las dos fuentes que producían el síntoma reportado. Las otras 11 tablas de `loadAll()` siguen degradándose a listas vacías en silencio si fallan individualmente — ver `KNOWN_PROBLEMS.md`.

### D9 — Isabel Core canónico se integra incrementalmente dentro de `isabel-api`, nunca como servicio independiente
**Fecha:** 2026-08-02
**Contexto:** al retomar el problema de silos entre dominios, se auditó `isabel-api/src/core/` (existente desde el commit `36cdb76`, nunca conectado — ver `core/ISABEL_CORE.md`). Se descubrió que `core/index.js` no está pensado para montarse dentro del `index.js` principal de isabel-api: tiene su propio `app.listen()`, su propio puerto (`CORE_PORT`) y su propia API key (`ISABEL_CORE_API_KEY`) — es decir, fue construido para desplegarse como un **segundo proceso Railway**, un quinto canal de facto (ver `core/ISABEL_CHANNELS.md` para los 4 canales ya existentes).
**Alternativa descartada:** desplegar `core/index.js` como servicio independiente (tal como estaba originalmente scaffoldeado), lo que habría añadido una quinta pieza desplegable con su propia URL, sus propios secretos y su propio ciclo de vida.
**Razón:** `core/config.js` lee `SUPABASE_URL`/`SUPABASE_SERVICE_KEY`/`ANTHROPIC_API_KEY` — nombres idénticos a los que ya usa el `isabel-api` principal en el mismo entorno Railway — y su validación de API key puede satisfacerse con la misma `API_KEY` que el frontend ya conoce (`ISABEL_KEY` en `main.js`). No hay necesidad real de un proceso separado: todo lo que Isabel Core necesita ya vive en el backend desplegado. Mantener un solo proceso reduce superficie operativa y es coherente con la petición explícita de la usuaria de "no otro backend de Isabel, no un quinto canal".
**Estado:** vigente. Fase 1 (backend, solo lectura) validada contra datos reales y aprobada por la usuaria el 2026-08-02 — `GET /v1/now` (sin escritura, sin delegación a especialistas), montado en `isabel-api/src/index.js` junto a las rutas ya existentes (`src/core/globalContext.js` + `src/core/now.js`, nuevos). Clasificación de atención (`urgent`/`reentry`/`maintain`/`clear`) es determinista, calculada en `globalContext.js` a partir de evidence auditable — nunca decidida por el LLM; `attention_mode_reliable` declara explícitamente cuándo un fallo parcial de Supabase impide confiar en un `clear`. `core/router.js` (con `POST /chat`, `intentRouter`, `inventoryDelegate`) permanece sin montar — el bridge local (`services/isabel.js`) sigue siendo el único canal conversacional activo, sin ningún cambio. Fase 2 (tarjeta "ISABEL · AHORA" en Home, aditiva/beta, `life-os-app` `da840cc`) desplegada en producción y validada end-to-end desde este chat el 2026-08-03 (JETMI como `reentry`, CTA funcional, degradación correcta) — pendiente de validación manual de la usuaria en su iPhone antes de considerarse completamente cerrada. Detalle técnico completo en `core/ISABEL_NOW.md`.

### D10 — OpenClaw se adopta como runtime autónomo de Isabel; LIFEOS sigue siendo el sistema de verdad
**Fecha:** 2026-08-05
**Contexto:** siguiente hito de producto: Isabel debe poder actuar sin que Estefanía abra LIFEOS ni inicie conversación (caso mínimo: comprobar el sueño a hora fija, preguntar si falta, registrar la respuesta). Se auditó la instalación real de OpenClaw (v2026.6.10, ya usada localmente como bridge conversacional vía `isabel-bridge.js`) para determinar si puede asumir ese runtime autónomo sin que LIFEOS tenga que construir su propio scheduler, canal o runtime de agente.
**Alternativa descartada:** construir scheduler, transporte de canal (Telegram/Web Push) y runtime de sesión/agente propios dentro de `isabel-api`.
**Razón:** OpenClaw ya resuelve, de forma documentada y parcialmente verificada en local con datos reales, cron persistente (SQLite, timezone IANA real), sesiones por canal, MCP como puente limpio hacia tools de LIFEOS, y canal Telegram — reconstruirlo en LIFEOS habría duplicado trabajo ya maduro y probado, además de arriesgar "dos Isabeles" (una en LIFEOS, otra en OpenClaw). El spike de esta sesión demostró en local que el pipeline Gateway→MCP→tool de LIFEOS funciona con datos reales de Supabase.
**Estado:** vigente, arquitectura aprobada. **Despliegue todavía NO ejecutado** — nada de esto corre en producción ni 24/7 a día de esta decisión. Destino previsto: Railway (misma plataforma que ya aloja `isabel-api`), no como servicio local permanente en el portátil de Estefanía. División de responsabilidades congelada: **OpenClaw** = runtime (cron, sesiones, canales, ejecución del agente, entrega). **LIFEOS/isabel-api** = estado, reglas, deduplicación, especialistas, validación, auditoría — nunca al revés; OpenClaw nunca escribe directo a Supabase para estas operaciones si existe una tool de LIFEOS que la encapsula. El bridge local (`isabel-bridge.js`) se congela sin nuevas features; se retira solo cuando el Gateway remoto esté validado, no antes.
**Hallazgos operativos de esta sesión, relevantes para la implementación futura:**
- Gestionar cron (crear/editar) vía **CLI** está bloqueado por el sistema de scopes de OpenClaw — `operator.admin` no se obtiene automáticamente ni pasando un token compartido explícito. Confirmado con evidencia real (`GatewayClientRequestError: scope upgrade pending approval`), no supuesto.
- El **Control UI**, vía su auto-aprobación documentada para conexiones loopback directas, sí puede crear/gestionar cron sin ese bloqueo — confirmado creando y disparando un cron job real desde ahí. Es la vía recomendada para administrar cron en producción, no el CLI.
- Ese mismo cron job llegó a dispararse (`cron fired`, confirmado en `cron_run_logs`) pero el turno de agente aislado no llegó a arrancar (`"cron: isolated agent setup timed out before runner start"`) — causa no investigada todavía, pendiente antes de confiar en cron real para el caso de sueño.
- `isabel-api/src/mcp.js` no tiene ninguna autenticación — bloqueante real antes de conectar cualquier Gateway remoto a él (ver `SECURITY.md`, riesgo nuevo).
- El token de Telegram configurado en el perfil real de OpenClaw (`~/.openclaw/openclaw.json`) es el mismo ya identificado como comprometido en `lifeos-agent` — misma incidencia de seguridad, ya conocida, ahora confirmada en una segunda superficie.
**Ver también:** `core/AUTOMATIONS.md` (estado técnico detallado del runtime), `modules/HEALTH_AND_GYM.md` (primer dominio construido sobre esta arquitectura), `SECURITY.md`.

### D11 — `isabel-gateway` usa auth de API key para Anthropic, no el backend `claude-cli`
**Fecha:** 2026-08-06
**Contexto:** el despliegue de `isabel-gateway` (D10) llevaba `agentRuntime: { id: "claude-cli" }` forzado en `agents.defaults.models["anthropic/claude-sonnet-4-6"]`, para reutilizar la suscripción Claude Pro en vez de facturar por API. Ningún turno de agente real completaba — todo fallaba con `FailoverError: Not logged in`. Varias sesiones de intentos (`railway ssh` anidado con `su`, tmux, FIFO, login interactivo real) no lograron persistir `~/.claude/.credentials.json` dentro del contenedor.
**Alternativa descartada:** seguir intentando completar el login OAuth interactivo de `claude auth login` dentro del contenedor Railway (incluyendo mover una credencial OAuth real desde otra máquina al volumen).
**Razón:** la causa raíz no era de configuración sino arquitectónica. Leyendo el código fuente empaquetado de OpenClaw (`cli-auth-seam-CzFhiHUR.js` → `store-DcJR3uqo.js`) se confirmó que el backend `claude-cli` lee sus credenciales **directamente del fichero** `~/.claude/.credentials.json` del host en tiempo de ejecución (no de `openclaw-agent.sqlite`, no de ninguna variable de entorno) — y la documentación oficial de OpenClaw (`docs/providers/anthropic.md`) confirma que este backend está pensado para reutilizar un login de Claude Code ya existente **en el mismo host físico**, no para contenedores efímeros: *"Container installs... do not mount host `~/.claude` into setup or runtime; use an Anthropic API key there..."*. `ANTHROPIC_API_KEY` ya estaba configurada y verificada funcionando manualmente en el contenedor. Se quitó el override `agentRuntime` (`openclaw config unset agents.defaults.models["anthropic/claude-sonnet-4-6"].agentRuntime` sobre el volumen en vivo + `railway restart`) y un turno de agente real completó correctamente de inmediato (log: `run … ended with stopReason=stop`, sin `FailoverError`).
**Estado:** vigente. Aplicado y verificado en producción el 2026-08-06 (`isabel-gateway` commit local pendiente de commitear en `openclaw.default.json`/`README.md`). Trade-off aceptado explícitamente por la usuaria: los turnos de agente ahora facturan como uso de API de pago (`ANTHROPIC_API_KEY`) en vez de consumir la asignación del plan Claude Pro. Nota de compatibilidad para hallazgo colateral: el cliente `railway.exe` no re-escapa argumentos con espacios al reenviarlos por el canal exec de SSH — `su node -c "comando con espacios"` llega partido y `su` interpreta el resto como sus propias flags. Workaround que sí funciona: pasar comillas literales escapadas como parte de un único token, p. ej. `su node -c \'comando\ con\ espacios\'`.

### D12 — La arquitectura multidominio se construye reutilizando lo que ya existe, no una capa nueva
**Fecha:** 2026-08-06
**Contexto:** con Telegram + cron de sueño validados en producción (D10/D11), la usuaria pidió diseñar cómo el resto de dominios (VistaJet, JETMI, Finanzas, Salud, Gym, Marca Personal, Vida Personal) se conectan al mismo patrón, identificando qué infraestructura común hacía falta construir una sola vez (eventos, estado operacional, interventions, tareas, specialists, identidad/contexto, prioridades).
**Alternativa descartada:** diseñar una capa de infraestructura nueva (un "Core" genérico de eventos/estado/prioridades) antes de construir el siguiente dominio.
**Razón:** una auditoría completa del código (no solo de la documentación) encontró que las 6 primitivas pedidas **ya existen**, construidas para el vertical slice de sueño pero nunca formalizadas como patrón general: `interventions` (pending-question genérica, con dedup a nivel de índice único y resolución fail-closed por `domain+kind`, ya diseñada explícitamente para reutilizarse), el sustrato `tasks/waiting_for/decisions/projects/alertas` (próximas acciones, ya usado por todas las áreas), `eventos` (rastro de auditoría, aunque hoy write-only), `GET /v1/now` + `globalContext.js` (prioridades, clasificación determinista `urgent/reentry/maintain/clear`, ya en producción), y el propio patrón de `core/specialists/health.js` (lógica pura + I/O + orquestación + tools MCP + tests con fake-db). Construir una capa nueva habría duplicado todo esto y violado el Principio #8 (una sola fuente de verdad por dato). Documentado en `core/DOMAIN_SPECIALISTS.md`.
**Estado:** vigente. El patrón se formalizó documentalmente y se validó construyendo un segundo specialist real (VistaJet — vencimiento de pasaporte, sobre `vj_state`, sin tabla nueva) que sigue exactamente la misma estructura que el de sueño. Explícitamente auditados y **no construidos todavía**, por falta de dato limpio o de necesidad real (no por falta de tiempo): maleta/`bag_checks` (las plantillas de la maleta viven en `localStorage` del frontend, no en Supabase — construir el trigger habría significado inventar un umbral falso), HOTO readiness proactivo (lógica ya existe en `services/readiness.js` pero solo client-side; candidato para más adelante, no descartado), e-learning/facturas (no existe ninguna tabla ni módulo — no hay nada que conectar), y un specialist de JETMI (diseño dejado listo en `DOMAIN_SPECIALISTS.md`, pero sin construir porque no hay decisión operativa de qué constituye "avance" ni datos reales que lo alimenten — construirlo ahora sería automatización sin necesidad real).
**Ver también:** `core/DOMAIN_SPECIALISTS.md` (el documento de arquitectura completo), `modules/HEALTH_AND_GYM.md` (primer specialist), `modules/VISTAJET.md` (segundo specialist).
