Estado: implementado (el patrón); parcial (dos dominios lo usan hoy: Salud/sueño, y VistaJet con tres specialists — pasaporte, estado operacional/rotación, HOTO ligado al avión)
Última verificación: 2026-08-06
Verificado en: isabel-api/src/core/specialists/health.js (primer especialista, referencia), isabel-api/src/core/specialists/vistajet.js (segundo especialista, 3 tools), isabel-api/src/hoto/data.js (correlación HOTO↔avión, D13), isabel-api/src/core/interventions.js, isabel-api/src/core/now.js + globalContext.js
Fuente de verdad de datos: DATA_MODEL.md § interventions, checkins, vj_state; ver también TASKS_AND_EVENTS.md (sustrato genérico de frontend) y SPECIALISTS_PROTOCOL.md (contrato histórico de Inventario, anterior a este patrón)

# core/DOMAIN_SPECIALISTS.md — Cómo un dominio nuevo se conecta a Isabel

Este documento existe porque, tras auditar todo LIFEOS el 2026-08-06, la conclusión fue que **la infraestructura común que hacía falta para que Isabel opere sobre cualquier dominio ya existía** — construida una sola vez para el vertical slice de sueño, pero nunca documentada como patrón general reutilizable. Este documento formaliza ese patrón. No se creó ninguna tabla nueva para escribirlo.

## Las 6 primitivas — qué existe, dónde vive, y para qué sirve cada una

| Primitiva | Pregunta que responde | Dónde vive | Estado |
|---|---|---|---|
| **Identidad/contexto** | ¿Quién es la usuaria, en qué modo está, qué áreas existen? | `life_context`, `areas` (Supabase) | Implementado |
| **Prioridades** | De todo lo que pasa, ¿qué merece atención ahora mismo? | `GET /v1/now` → `core/globalContext.js` (evidencia determinista) + Haiku (solo redacta, nunca decide) | Implementado, en producción |
| **Próximas acciones** | ¿Qué hay pendiente de hacer, y por quién? | `tasks`, `waiting_for`, `decisions`, `projects`, `alertas` (Supabase, vía `services/db.js` en frontend) | Implementado, genérico, usado por todas las áreas |
| **Eventos** | ¿Qué pasó, y cuándo? | `eventos` (Supabase) | Implementado pero **write-only** — se escribe, nadie lo lee de vuelta todavía (ver MEMORY.md) |
| **Interventions** | ¿Hay una pregunta de Isabel pendiente de responder, y evita que se duplique? | `interventions` (Supabase, solo `isabel-api`) | Implementado, genérico, diseñado explícitamente para reutilizarse — ver abajo |
| **Specialists** | ¿Cómo un dominio expone su lógica a Isabel de forma segura y determinista? | `isabel-api/src/core/specialists/<dominio>.js` + tools en `src/mcp.js` | Implementado como patrón — 2 dominios lo usan (Salud, VistaJet) |

**Nada de esto es nuevo.** Las tablas y el endpoint `/v1/now` ya existían antes de esta sesión. Lo que faltaba era reconocer que `interventions` y el patrón de `health.js` no eran "cosas de sueño" sino la forma general de construir cualquier especialista.

## `interventions` — el primitive de "¿merece la pena preguntar/avisar ahora?"

Una fila = una pregunta o aviso pendiente de Isabel, de cualquier dominio. Columnas: `domain`, `kind`, `target_date`, `reason_signature` (clave de deduplicación), `status` (`pending`\|`answered`\|`superseded`), `created_at`, `answered_at`.

Reglas que **cualquier** especialista debe respetar (no son solo convención — algunas están garantizadas a nivel de base de datos):

1. **Nunca dos pending con la misma `reason_signature`** — índice único parcial `WHERE status='pending'`. Si dos llamadas concurrentes intentan crear la misma, la segunda recibe `23505` y debe releer la fila ganadora (`findInterventionBySignature`), nunca tratar la colisión como error.
2. **Resolución sin memoria conversacional** — cuando llega una respuesta, se busca la Intervention pendiente por `domain+kind+status='pending'` (`resolvePendingIntervention`), nunca por un `id` que el agente tuviera que recordar entre turnos. Si hay cero coincidencias o más de una, **fail-closed**: no se escribe nada, se devuelve un error estructurado (`no_pending_intervention` / `ambiguous_pending_interventions`).
3. **Supersede, no acumula** — antes de crear una Intervention nueva de un `kind`, cualquier otra pending del mismo `kind` que haya quedado obsoleta se marca `superseded`. Así, en operación normal, nunca puede haber más de una pending por `domain+kind` a la vez — la invariante se previene, no solo se detecta.
4. **`target_date` se fija al crear la Intervention, nunca se recalcula "hoy"** al responder — evita bugs de medianoche/zona horaria.

Todo esto ya está implementado de forma genérica en `isabel-api/src/core/interventions.js` — un especialista nuevo importa esas funciones, no las reimplementa.

## El patrón de un "specialist" — checklist, extraído de `health.js`

Un specialist vive en `isabel-api/src/core/specialists/<dominio>.js`, con 3 capas dentro del mismo fichero (separadas por comentario, no por fichero — así se ve todo el flujo junto):

1. **Lógica pura** (testable sin Supabase): funciones que deciden qué hacer, dado un estado ya cargado. Ej. "¿hay un vencimiento con riesgo real?", "¿la respuesta se puede procesar o hay que rechazarla?". Cero llamadas a red.
2. **I/O** (requiere Supabase real): fetch/insert/update de la tabla propia del dominio. Comentario explícito separando esta sección de la lógica pura.
3. **Orquestación** — las funciones que las tools MCP llaman directamente. Combinan (1) y (2), y son las que hablan con `interventions.js`.

Reglas no negociables (violarlas rompe el patrón, no es una preferencia de estilo):

- **Nunca adivinar.** Ante ambigüedad (texto no interpretable, intervention ambigua, dato ausente), no se escribe nada — se devuelve un error estructurado y se puede reintentar.
- **Determinista primero.** El parseo de lenguaje natural (fechas, duraciones, cantidades) usa una función determinista propia antes que un LLM. Un fallback LLM es un punto de extensión inyectable, no la vía por defecto, y su salida pasa por la MISMA validación que la vía determinista — nunca se trata como pre-validada.
- **Registrar en `eventos`** cualquier escritura real, vía una función tipo `logXEvent()` en `core/eventLogger.js` — nunca bloquea la respuesta al usuario si falla (try/catch, solo loggea el error).
- **Exponer 1–2 tools MCP como máximo** por gesto de interacción (una para leer/detectar, otra para responder/actualizar) — se registran en `src/mcp.js` importando las funciones de orquestación directamente (sin salto HTTP intermedio, a diferencia de `isabel_message`/`isabel_confirm` que sí proxyan a rutas HTTP existentes por ser anteriores a este patrón).
- **Probar con un fake-db en memoria**, no contra Supabase real — monkeypatchear `db.from` (mismo singleton que importan los módulos bajo test) con un almacén en memoria por tabla, replicando el índice único parcial de `interventions` para probar la condición de carrera. Ver `src/__tests__/interventions.orchestration.test.js` como plantilla.

## Qué NO va en Supabase — la distinción operacional vs. conocimiento

Instrucción explícita de la usuaria, ya reflejada en cómo está construido el slice de sueño y el de VistaJet/pasaporte:

- **Estado operacional** (Supabase, tablas pequeñas y estructuradas): el hecho actual — `checkins.sleep_minutes`, `vj_state.passport_exp`. Isabel lo lee/escribe directamente.
- **Interventions/eventos** (Supabase): la capa de "¿hace falta actuar?" y "¿qué pasó?" — nunca el conocimiento en sí, solo su rastro.
- **Conocimiento profundo/documentación** (ficheros, `/docs`, PRDs, investigación): permanece en archivos versionados. `JETMI_PRD_Semilla.md`, `research/JETMI/KNOWLEDGE.md`, este mismo documento — Isabel no necesita tenerlos "cargados" en Supabase; si algún día necesita consultarlos, sería vía una tool de lectura de archivos, no una tabla.
- **Acciones pendientes genéricas**: siguen en `tasks`/`waiting_for`/`decisions`/`projects` (ver TASKS_AND_EVENTS.md) — no se duplican dentro de un specialist a menos que tengan una forma de dato muy específica del dominio (como `interventions`, que sí lo justifica: es un tipo de "pendiente" con reglas de deduplicación que `tasks` no tiene).

**Regla práctica**: si un dato cambia con la operación diaria y una decisión determinista depende de su valor exacto → Supabase. Si es contexto para razonar pero ninguna regla determinista lo consume directamente → fichero.

## Dominios existentes — encaje con este patrón (auditado 2026-08-06)

| Dominio | Tiene datos reales | Tiene specialist hoy | Encaja limpiamente sin cambios de esquema |
|---|---|---|---|
| Salud (sueño) | Sí (`checkins`) | **Sí — el original** | — |
| VistaJet (pasaporte) | Sí (`vj_state.passport_exp`) | **Sí — construido en esta sesión** | Sí |
| VistaJet (rotación/avión/contexto operativo) | Sí (`vj_state.status/aircraft/rotation_*`) | **Sí — construido en esta sesión** | Sí |
| VistaJet (HOTO ligado al avión) | Sí (`vj_hoto_records`, modelo corregido en D13) | **Sí — construido en esta sesión** | Sí, tras corregir el modelo (D13) |
| VistaJet (administrativo: eLearnings/Facturas) | Sí (`vj_tasks`, misma tabla que ya usa el dashboard) | **Sí — construido en esta sesión** | Sí, sin cambios de esquema |
| VistaJet (maleta) | Parcial (`vj_state.bag_checks`, sin plantillas server-side) | No | **No limpiamente** — bloqueado por dato, ver abajo |
| VistaJet (proceeding) | No (cero dato) | No | **No limpiamente** — no hay ningún dato del que partir |
| Gym | No (solo `metrics` genérico) | No | No hay tabla propia que interrogar |
| Finanzas | Sí (`transactions`, 821 filas) | No | Sí, en teoría — pero sin `CREATE TABLE` versionado (deuda, ver KNOWN_PROBLEMS.md), habría que resolver eso primero |
| JETMI | Parcial (`operators`) | No | El PRD describe fase/bloqueos/próximo movimiento como conceptos, pero no hay tabla que los modele todavía — ver sección JETMI abajo |
| Marca Personal, Vida Personal | No | No | Placeholders puros, nada que interrogar |

## Lo que se auditó y no se construyó (a propósito, no por falta de tiempo)

- **`vistajet.maleta` (bag_checks) como trigger de Intervention**: auditado y descartado por ahora. `bag_checks` es un mapa `{plantilla_item: bool}`, pero las plantillas (cuántos items tiene cada maleta) viven en `localStorage` del frontend, no en Supabase — el backend no puede saber si "maleta completa" sin adivinar o sin migrar las plantillas a Supabase primero. Construirlo hoy habría significado inventar un umbral falso. Queda documentado como el primer paso pendiente si se retoma este dominio.
- **HOTO recibido/pendiente**: auditado el 2026-08-06, encontrado NO cleanly-buildable tal como estaba (`status` solo tomaba `'active'` en la práctica, sin acción real de cierre, sin correlación con `vj_state.aircraft`) — pero, a diferencia de maleta/e-learnings, la usuaria decidió corregir el modelo en vez de posponerlo. **Resuelto el mismo día (D13)**: ver `modules/VISTAJET.md` § 3 y `DECISIONS.md` D13. ya no está en la lista de "no construido".
- **HOTO readiness proactivo** (avisar si falta HOTO antes de fin de rotación): `services/readiness.js` ya calcula esto muy bien, pero solo client-side, a partir de HOTO + Inventory + Laundry + Shopping. Ahora que la correlación HOTO↔avión está resuelta (D13), este es el candidato más natural para convertir en specialist MCP-invocable — evaluado como próximo paso, no descartado, solo no priorizado todavía.
- **E-learning/facturas**: auditado el 2026-08-06 y resultó ser el caso contrario a maleta/HOTO — SÍ tenía una fuente de verdad limpia (`vj_tasks`, la misma tabla que ya categoriza `readiness.js` por título). Construido el mismo día: `summarizeTaskBucket()` porta esa misma lógica al backend, expuesto en `vistajet_get_status.admin`. Ver `modules/VISTAJET.md` § 4.
- **Proceeding/movimiento operativo**: auditado el 2026-08-06 — cero referencias en código de aplicación en ningún repo, ningún campo, ninguna convención de tarea reutilizable. A diferencia de e-learnings/facturas, aquí no hay nada que conectar — habría que inventar el concepto entero. Bloqueado por dato, sin próximo paso claro hasta que exista una decisión de qué significa "proceeding" a nivel operativo.

## JETMI — diseño preparado para cuando tenga datos reales

La usuaria pidió explícitamente dejar el diseño listo para que JETMI use el mismo sistema sin volver Supabase un almacén de research. El patrón encaja así, cuando llegue el momento:

- **Estado operacional** (Supabase, mínimo): fase actual del negocio, último avance, bloqueo activo — 3-4 campos, no un documento. Candidato: extender `operators` o una tabla `jetmi_state` singleton (mismo patrón que `vj_state`) con `phase`, `last_progress` (texto corto), `blocker` (texto corto o null), `updated_at`. **No crear esto todavía** — no hay decisión de negocio ni dato real que lo llene hoy (ver `modules/JETMI.md`: la propia empresa no está constituida legalmente aún).
- **Conocimiento/investigación** (ficheros, ya existe): `research/JETMI/KNOWLEDGE.md`, `HYPOTHESES.md`, `sources/` — se queda ahí. Un futuro specialist de JETMI no debe intentar "cargar" ese research en Supabase; como mucho, citarlo por referencia si algún día Isabel necesita leer ficheros.
- **Specialist futuro**: seguiría el mismo checklist de arriba — `jetmi_get_status` (lee `phase`/`last_progress`/`blocker`) + una tool de actualización cuando la usuaria reporte avance en lenguaje natural. No se construye ahora porque no hay decisión de qué constituye "avance" todavía a nivel operativo — construirlo antes de tener ese criterio sería inventar automatización sin necesidad real, justo lo que la usuaria pidió evitar.

## Ver también
- [SPECIALISTS_PROTOCOL.md](SPECIALISTS_PROTOCOL.md) — el contrato histórico de Inventario (anterior a este patrón, todavía vigente para ese dominio específico).
- [ISABEL_NOW.md](ISABEL_NOW.md) — cómo funciona la primitiva de Prioridades.
- [TASKS_AND_EVENTS.md](TASKS_AND_EVENTS.md) — el sustrato genérico de Próximas Acciones/Eventos, consumido por el frontend.
- [../modules/HEALTH_AND_GYM.md](../modules/HEALTH_AND_GYM.md) — detalle del primer specialist (Salud/sueño).
- [../modules/VISTAJET.md](../modules/VISTAJET.md) — detalle del segundo specialist (VistaJet/pasaporte), añadido en esta sesión.
- [DECISIONS.md](../DECISIONS.md) D12 — la decisión de construir esto sobre infraestructura existente en vez de una nueva.
