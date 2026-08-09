Estado: auditoria cerrada; P1 y O3 PROPUESTAS, NO aplicadas
Fecha: 2026-08-09
Fuente: `context.compiled` y `trace.artifacts` de las 14 trayectorias retenidas del Gateway nuevo; documentacion oficial de OpenClaw; ninguna llamada pagada

# Auditoria completa de tools y skills de Isabel

## Metodo y limites

El ultimo contexto real anterior a apagar el heartbeat (`2026-08-09T13:17:57.021Z`) contenia **47 tools**, 54.970 bytes de definiciones. La aproximacion por tool es `bytes JSON / 4`; sirve para ordenar magnitudes, no sustituye al tokenizador. La medicion exacta previa del prefijo completo dio **~17.178 tokens de tools** dentro de un suelo fijo de 23.235 tokens.

El uso historico de la tabla se cuenta una vez desde `trace.artifacts.data.toolMetas`: **70 invocaciones en 163 traces, 9 tools distintas**. No se vuelve a sumar el historial acumulado de cada `messagesSnapshot`; ese metodo anterior inflaba los contadores.

## Inventario de 47 tools

Superficies: `NORMAL` = Telegram/LIFEOS cotidiano; `RESEARCH`; `DOCUMENT`; `ADMIN_DEV`.

| Tool | Origen | Tok aprox. | Uso | Capacidad / superficie | Riesgo | Efecto de retirarla / bajo demanda |
|---|---|---:|---:|---|---|---|
| `cron` | OpenClaw | 1.382 | 0 | automatizaciones / ADMIN_DEV | alto: crea o cambia jobs | sin impacto historico; solo administracion explicita |
| `browser` | OpenClaw | 1.097 | 0 | navegador interactivo / RESEARCH | alto: acciones web y sesiones autenticadas | research pierde navegacion; habilitable en perfil aislado |
| `message` | OpenClaw | 1.094 | 3 | entrega por canales / NORMAL | alto: efecto externo | **mantener**; es la via de delivery existente |
| `skill_workshop` | OpenClaw | 570 | 0 | crear/modificar skills / ADMIN_DEV | alto: muta instrucciones durables | sin impacto; solo desarrollo controlado |
| `lifeos__vistajet_update_status` | MCP LIFEOS | 539 | 2 | actualizar estado operativo / NORMAL | medio-alto: escritura productiva | mantener; requiere confirmacion contractual del tool |
| `sessions_spawn` | OpenClaw | 489 | 0 | delegar ejecuciones / ADMIN_DEV | alto: coste y fan-out | sin impacto; solo tarea aislada con presupuesto |
| `exec` | OpenClaw | 486 | 0 | shell / ADMIN_DEV | critico: codigo y filesystem | sin impacto en Isabel; fuera de Telegram normal |
| `nodes` | OpenClaw | 478 | 0 | dispositivos emparejados / ADMIN_DEV | alto: control remoto | sin impacto; bajo demanda y con autorizacion |
| `process` | OpenClaw | 420 | 0 | procesos de shell / ADMIN_DEV | critico | sin impacto; acompana a `exec`, no NORMAL |
| `file_write` | OpenClaw | 395 | 0 | escribir fichero gestionado / DOCUMENT | alto: mutacion | sin impacto; solo documento explicito |
| `lifeos__vistajet_get_status` | MCP LIFEOS | 353 | 13 | leer estado VistaJet / NORMAL | bajo, datos operativos | **mantener** |
| `dir_fetch` | OpenClaw | 346 | 0 | recuperar directorio / DOCUMENT | medio: privacidad | sin impacto; perfil documental |
| `lifeos__lifeos_proactive_check` | MCP LIFEOS | 335 | 34 | consultar decision proactiva / NORMAL | bajo, lectura/decision | mantener por compatibilidad; el tick determinista no necesita modelo |
| `file_fetch` | OpenClaw | 318 | 0 | recuperar fichero / DOCUMENT | medio: privacidad | sin impacto; perfil documental |
| `gateway` | OpenClaw | 315 | 0 | configurar Gateway / ADMIN_DEV | critico: cambia runtime | sin impacto; nunca en Telegram normal |
| `dir_list` | OpenClaw | 298 | 0 | listar directorios / DOCUMENT | medio: exposicion de rutas | sin impacto; perfil documental |
| `web_search` | OpenClaw | 290 | 0 | busqueda web / RESEARCH | medio: coste/egress/datos | sin impacto; habilitar solo para research PUBLIC |
| `lifeos__lifeos_answer_question` | MCP LIFEOS | 275 | 0 | persistir respuesta / NORMAL | medio: escritura | mantener para flujo de preguntas |
| `lifeos__health_register_sleep` | MCP LIFEOS | 250 | 4 | registrar sueno / NORMAL | alto por dato personal + escritura | **mantener**, solo con cifra real de usuaria |
| `memory_search` | OpenClaw | 236 | 0 | buscar memoria / NORMAL/RESEARCH | medio-alto: privacidad | no usado; memoria operativa vive en LIFEOS; evaluar bajo demanda |
| `lifeos__vistajet_update_passport` | MCP LIFEOS | 232 | 0 | actualizar pasaporte / NORMAL | alto: dato personal/operativo | mantener solo por capacidad funcional existente |
| `lifeos__gym_log_session` | MCP LIFEOS | 230 | 1 | registrar sesion Gym / NORMAL | medio: salud/fitness + escritura | **mantener** |
| `edit` | OpenClaw | 225 | 0 | editar ficheros / ADMIN_DEV | critico | sin impacto; fuera de Isabel normal |
| `canvas` | OpenClaw | 222 | 0 | UI en nodo / DOCUMENT | medio-alto | sin impacto; bajo demanda |
| `lifeos__gym_get_status` | MCP LIFEOS | 199 | 0 | leer semana Gym / NORMAL | bajo, dato personal | mantener |
| `lifeos__lifeos_pending_questions` | MCP LIFEOS | 179 | 1 | preguntas pendientes / NORMAL | bajo, lectura personal | mantener |
| `sessions_list` | OpenClaw | 169 | 0 | listar sesiones / ADMIN_DEV | alto: privacidad | sin impacto; fuera de NORMAL |
| `lifeos__health_get_sleep_status` | MCP LIFEOS | 168 | 9 | leer estado de sueno / NORMAL/cron | medio-alto: salud | **mantener**; requerido por sleep cron |
| `read` | OpenClaw | 162 | 0 | leer workspace / DOCUMENT | medio: privacidad | sin impacto; perfil documental |
| `pdf` | OpenClaw | 157 | 0 | analizar/generar PDF / DOCUMENT | medio: datos y coste | sin impacto historico; bajo demanda |
| `image` | OpenClaw | 154 | 0 | comprender imagen / DOCUMENT | medio: proveedor/coste | sin impacto; bajo demanda |
| `lifeos__isabel_message` | MCP LIFEOS | 154 | 3 | construir mensaje LIFEOS / NORMAL | medio: contenido persistido | mantener |
| `sessions_send` | OpenClaw | 153 | 0 | enviar a otra sesion / ADMIN_DEV | alto: cruce de contexto | sin impacto; solo coordinacion controlada |
| `memory_get` | OpenClaw | 144 | 0 | leer memoria concreta / NORMAL | medio-alto: privacidad | no usado; bajo demanda si se conserva memory search |
| `lifeos__isabel_confirm` | MCP LIFEOS | 141 | 0 | confirmar intervencion / NORMAL | medio: cambio de estado | mantener |
| `tts` | OpenClaw | 132 | 0 | voz / DOCUMENT | medio: coste y salida externa | sin impacto; bajo demanda |
| `update_goal` | OpenClaw | 130 | 0 | mutar objetivo de agente / ADMIN_DEV | medio-alto | sin impacto; fuera de NORMAL |
| `web_fetch` | OpenClaw | 128 | 0 | descargar pagina / RESEARCH | medio: egress/contenido no confiable | sin impacto; perfil research PUBLIC |
| `create_goal` | OpenClaw | 119 | 0 | crear objetivo / ADMIN_DEV | medio-alto: trabajo autonomo | sin impacto; solo tarea explicita |
| `session_status` | OpenClaw | 107 | 0 | estado del turno / NORMAL | bajo | mantener como primitiva de diagnostico barata |
| `write` | OpenClaw | 100 | 0 | escribir workspace / ADMIN_DEV | critico | sin impacto; fuera de NORMAL |
| `subagents` | OpenClaw | 91 | 0 | gestionar subagentes / ADMIN_DEV | alto: coste/fan-out | sin impacto; bajo demanda y con presupuesto |
| `apply_patch` | OpenClaw | 85 | 0 | parchear ficheros / ADMIN_DEV | critico | sin impacto; fuera de NORMAL |
| `sessions_history` | OpenClaw | 85 | 0 | leer otra sesion / ADMIN_DEV | alto: privacidad | sin impacto; no exponer en Telegram normal |
| `sessions_yield` | OpenClaw | 49 | 0 | esperar subagente / ADMIN_DEV | medio: bloqueo/coste | sin impacto; solo coordinacion |
| `get_goal` | OpenClaw | 39 | 0 | leer objetivo / ADMIN_DEV | bajo-medio | sin impacto; fuera de NORMAL |
| `agents_list` | OpenClaw | 38 | 0 | listar agentes / ADMIN_DEV | medio: topologia | sin impacto; fuera de NORMAL |

## Soporte nativo de OpenClaw verificado

OpenClaw aplica la politica **antes** de llamar al modelo, por lo que una tool retirada no envia su schema. Soporta `tools.profile`, `tools.allow`/`deny` (deny gana), grupos, restricciones globales, por agente, proveedor/modelo, sender, sandbox y subagente. Los MCP son tools del plugin `bundle-mcp` y admiten nombres exactos o globs. Documentacion: <https://docs.openclaw.ai/gateway/config-tools> y <https://docs.openclaw.ai/tools/multi-agent-sandbox-tools>.

La configuracion estable expuesta es global/per-agent/per-provider/per-sender/sandbox/subagent. No hay un selector estable documentado que cambie un perfil arbitrario en mitad de un chat normal. `Tool Search` puede diferir schemas durante el run, pero sigue marcado experimental; no es la primera palanca para produccion: <https://docs.openclaw.ai/tools/tool-search>.

## P1 propuesta — NO aplicada

1. Perfil `ISABEL_NORMAL`: allowlist exacta de las 12 `lifeos__*` + `message` + `session_status` (14 tools). Son ~17.002 bytes frente a 54.970, **-69% de bytes de definiciones**; la medicion con tokenizador ya estimaba el suelo fijo en ~9.425 frente a 23.235 tokens.
2. `RESEARCH`: NORMAL + `web_search`, `web_fetch`, `browser`, solo para fixtures/publico al principio.
3. `DOCUMENT`: NORMAL + `read`, `file_fetch`, `pdf`, `image`; cualquier escritura se agrega solo para una tarea explicita.
4. `ADMIN_DEV`: `exec`, filesystem mutante, `gateway`, `cron`, sessions, subagents, nodes, goals y workshop fuera de Telegram; usar CLI/Codex o un entorno administrativo aislado.
5. Aplicacion futura por tandas reversibles, con snapshot de config, tests y observacion O4. P1 **no se aplico** para no mezclar su efecto con el baseline posterior al heartbeat.

## Inventario de 14 skills

El bloque `## Skills` pesa ~1.536 tokens medidos con `count_tokens` (la aproximacion bytes/4 da 1.247). `## Skill Workshop` agrega ~488: **~2.024 tokens por turno**. Los valores por fila son aproximados y no incluyen overhead XML.

| Skill | Tok aprox. | Funcion | Relevancia para Isabel | Carga |
|---|---:|---|---|---|
| `browser-automation` | 94 | flujos de navegador | research ocasional | task-specific |
| `canvas` | 69 | UI en nodos | no usada | task-specific |
| `diagram-maker` | 70 | diagramas | desarrollo/documentacion | task-specific |
| `healthcheck` | 73 | hardening de host | administracion | task-specific |
| `meme-maker` | 66 | memes | ninguna actual | task-specific |
| `node-connect` | 74 | emparejar nodos | administracion | task-specific |
| `node-inspect-debugger` | 73 | depurar Node.js | desarrollo | task-specific |
| `notion` | 71 | Notion API/CLI | integracion no conectada | task-specific |
| `python-debugpy` | 70 | depurar Python | desarrollo | task-specific |
| `skill-creator` | 68 | crear skills | desarrollo | task-specific |
| `spike` | 66 | prototipos desechables | desarrollo | task-specific |
| `taskflow` | 74 | tareas durables | autonomia futura | task-specific |
| `taskflow-inbox-triage` | 76 | ejemplo de triage | ninguna actual | task-specific |
| `weather` | 76 | tiempo/forecast | posible futuro, no usado | task-specific |

**Always-on justificadas hoy: ninguna.** Ninguna de las 14 es necesaria para VistaJet, sueno, Gym, Priority Engine, Intervention o delivery actuales.

## O3 propuesta — NO aplicada

Configurar para el agente `main` una allowlist de skills vacia (`agents.entries.main.skills: []`), que segun OpenClaw reemplaza el default. Habilitar skills solo en perfiles/tareas controladas. La allowlist de skills es filtro de visibilidad, no frontera de seguridad; por eso O3 debe ir acompanada de P1 y del bloqueo de `exec`. Documentacion: <https://docs.openclaw.ai/tools/skills-config>.

O3 no se aplico: primero se conserva el baseline aislado del heartbeat y se observa O4.
