Estado: implementado
Última verificación: 2026-08-05
Verificado en: lectura directa de setup.sql, migration_v1.sql, migration_v2.sql, hoto_migration.sql, hoto_migration_v2.sql, laundry_cleaning_migration_v1.sql, checkins_migration_v1.sql, interventions_migration_v1.sql + muestreo de filas reales vía REST de Supabase
Fuente de verdad de datos: este documento ES la fuente de verdad de tablas

# DATA_MODEL.md — Única fuente de verdad de las tablas de Supabase

Ningún otro documento debe repetir columnas. Si necesitas saber qué campos tiene una tabla, es aquí. Los `/modules/*.md` solo enlazan a la sección correspondiente.

Proyecto Supabase: `cllubptdwydifomlnxds`. RLS **desactivado en las 21 tablas** (ver [SECURITY.md](SECURITY.md) — es una decisión consciente para app de un solo usuario, no un descuido). `vj_laundry_cleaning_records` ya existe en Supabase (tabla creada y verificada) aunque el código que la usa todavía no está en `main` — ver nota de "no desplegado" en su sección.

---

## Sistema genérico (usado por todas las áreas)

### `life_context`
Estado global de energía/modo. Migración: `setup.sql`.
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| mode | text | `ON` \| `OFF`, default `OFF`. **Semántica canónica: ciclo laboral de la usuaria** — `ON` = días de trabajo/rotación, `OFF` = días libres. NO es "hay avión asignado" ni "HOTO activo" ni el estado operacional del avión (eso es `vj_state.status`); los dos campos son independientes y NO se sincronizan causalmente. Ver `PRINCIPLES.md` #12 |
| energy_level | text | default `medium` |
| main_constraint | text | frase libre |
| created_at | timestamptz | se inserta una fila nueva por cambio, no se actualiza in-place |

Lee/escribe: `life-os-app/src/services/db.js` (`getMode`/`setMode`, botón del topbar). Lee también `isabel-api/src/core/globalContext.js` (`collectGlobalSignals` → `life_mode`), que lo expone a `GET /v1/now` como **contexto** para desempatar prioridades — nunca como evidence ni como entrada de `classifyAttention`.

### `areas`
Las 7 áreas de vida. Migración: `setup.sql` (+ `ia_context` añadida en `migration_v1.sql`).
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| name | text | VistaJet, JETMI, Finanzas, Salud, Gym, Marca Personal, Vida Personal |
| color | text | hex, usado en UI |
| sort_order | int | |
| status | text | default `active` |
| ia_context | text | añadida v1, uso real no confirmado |

### `tasks`
Migración: `setup.sql` (+ `project_id` en `migration_v1.sql`).
| Columna | Tipo | Notas |
|---|---|---|
| id, title, area_id, project_id | | project_id referencia `projects`, `ON DELETE SET NULL` |
| status | text | default `pending` |
| priority | text | default `medium` |
| energy_required | text | default `medium` |
| suitable_modes | text[] | default `{ON,OFF}` |
| due_date | date | |
| horizon | text | default `this_week` |
| source | text | default `human` |
| created_at, updated_at, completed_at | timestamptz | |

### `waiting_for`
Delegaciones/esperas. Migración: `setup.sql`. Columnas: id, title, area_id, waiting_on, since_date, follow_up_date, urgency, status, context, created_at.

### `decisions`
Decisiones abiertas. Migración: `setup.sql`. Columnas: id, title, area_id, stakes, status, context, created_at.

### `projects`
Migración: `migration_v1.sql`. Columnas: id, title, area_id, objetivo, status (`active`\|`paused`\|…), next_action, ia_context, ia_last_session, created_at, completed_at, last_activity_at.

### `eventos`
Audit trail / contribuciones IA. Migración: `migration_v1.sql`. Columnas: id, project_id, area_id, origen (default `manual`), texto, herramienta, resumen, resultado_ubicacion, created_at.

### `alertas`
Migración: `migration_v1.sql`. Columnas: id, texto, tipo (default `manual`), urgencia (default `media`), area_id, project_id, status (default `active`), created_at.

### `metrics`
**Sin migración formal encontrada en ningún repo** — probablemente creada a mano en el dashboard de Supabase. Columnas observadas en uso (`db.js`): id, area_id (nullable), key, value (text), label, unit, updated_at. Usada para KPIs de Salud/Gym (horas_sueno, dolor_hoy, sesiones_semana) y presupuestos de Finanzas.

### `operators`
**Sin migración formal encontrada.** Columnas confirmadas por muestreo real: id, name, status, commission, notes, created_at. Usada solo por el área JETMI (ver [modules/JETMI.md](modules/JETMI.md)).

---

## Finanzas

### `transactions`
**Sin `CREATE TABLE` en ningún repo** — la tabla ya existía cuando se escribió `finance_reset_final.sql` (que solo hace `ALTER TABLE ... ADD COLUMN IF NOT EXISTS source` y un `TRUNCATE` + re-insert). Deuda técnica: no hay forma de recrear esta tabla desde cero solo con el código del repo.
Columnas confirmadas por muestreo real: id (uuid), date, description, amount (numeric), type (`expense`\|`income`), category, source (`revolut`\|`sabadell`\|…), created_at.
Contenido real: 821 filas importadas (185 Revolut + 636 Sabadell), ver `finance_reset_final.sql` en la raíz del proyecto (fuera de cualquier repo git).

---

## VistaJet — Estado y tareas propias

### `vj_state`
Migración: `setup.sql`. Columnas: id, status (`libre`\|`rotacion`\|`standby`), aircraft, rotation_day, rotation_total, rotation_start, hours_month, hours_year, passport_exp, active_bag, bag_checks (jsonb), updated_at. Fila única (singleton) — se lee con `.limit(1)` sin filtro, se escribe con `.update().eq('id', ...)`, sin historial.

`passport_exp` se lee y escribe desde dos sitios desde 2026-08-06: el modal manual `openVjState()` en el frontend (sigue funcionando igual, sin cambios), y el specialist `isabel-api/src/core/specialists/vistajet.js` vía las tools MCP `vistajet_get_status`/`vistajet_update_passport` — ver [modules/VISTAJET.md](modules/VISTAJET.md). Mismos umbrales de riesgo en ambos sitios (≤30 días "red", ≤90 "amber"), duplicados como constante hasta que exista un sitio común del que ambos puedan leerlos.

### `vj_tasks`
Migración: `setup.sql`. Columnas: id, title, status, priority (default `normal`), due_date, created_at.

---

## VistaJet — Inventario

Migración: `migration_v2.sql`. Detalle de uso en [modules/VISTAJET_INVENTORY.md](modules/VISTAJET_INVENTORY.md).

### `vj_inventory_sessions`
id, aircraft_registration, aircraft_type (default `CL350`), session_date, status (`open`\|`closed`), source_filename, created_at, closed_at.

### `vj_inventory_session_items`
id, session_id (FK, cascade), code, description, category, std_qty, received_qty, current_qty, req_qty, verified (bool), discrepancy (bool), source (default `excel`), notes, updated_at.

### `vj_inventory_chat`
id, session_id (FK, cascade), role (`user`\|`assistant`), content, intent, resolved_item_id (FK a session_items), created_at.

Storage: bucket `inventory-templates` (plantillas .xlsx originales para el patch quirúrgico del export).

---

## VistaJet — HOTO

Migración: `hoto_migration.sql` + `hoto_migration_v2.sql`. Detalle de uso en [modules/VISTAJET_HOTO.md](modules/VISTAJET_HOTO.md).

### `vj_hoto_records`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| tail_number, aircraft_status, icao, pattern | text | cabecera del HOTO |
| ch_code, received_date, days_on_aircraft, daily_duties | text/text/text/jsonb | de la COLUMNA DE TRABAJO actual (`ch_column_index`) — el editor vivo lee/escribe estos 4 campos directamente, sin cambios desde D13 |
| ch_column_index | int | default 0 — cuál de las 6 columnas del PDF es la de trabajo actual |
| columns | jsonb | default `[]` — array de hasta 6 `{ch_code, received_date, days_on_aircraft, duties:{item_id:true}}`, una por columna del PDF **ya cerrada** (importada o de una generación anterior). La columna que indica `ch_column_index` NO vive aquí — vive en los 4 campos planos de arriba (D16, `DECISIONS.md`) |
| generation | int | default 1 — número de generación lógica de este HOTO (una nueva generación = "Nuevo HOTO desde este", D16) |
| superseded_by | uuid | FK a `vj_hoto_records.id` — si no es null, esta fila quedó reemplazada por esa generación nueva (nunca se borra) |
| imported_at | timestamptz | solo si el HOTO se originó importando un PDF real (D16); null si se creó desde el formulario manual |
| source_filename | text | nombre del PDF importado, si aplica |
| has_prior_hoto | boolean | default false |
| shopping | jsonb | default `{}` — incluye `magazines_list` anidado |
| cabin_care | jsonb | default `[]` — array de 17 `{d, n}` (fecha + nota) |
| status | text | `active` \| `delivered` \| `superseded` (D16: `superseded` = reemplazada por una generación nueva, distinto de `delivered` = avión entregado) |
| source_template | text | default `HOTO_official_v1.pdf` |
| created_at, updated_at, delivered_at | timestamptz | `delivered_at` se rellena al cerrar (`closeHoto()`) |

Índice `idx_hoto_active_unique_tail`: único parcial `(tail_number) WHERE status='active'` — `hoto_migration_v4.sql`, aplicado y verificado en Supabase el 2026-08-06 (un `INSERT` de prueba con matrícula duplicada fue rechazado). Garantiza a nivel de DB lo que `getActiveHoto(tailNumber)`/`loadActiveHoto(tailNumber)` ya manejan de forma fail-closed en código: nunca puede haber (o si ya existiera, se reporta como `ambiguous`, nunca se elige uno) más de un HOTO activo para la misma matrícula. Detalle completo en `DECISIONS.md` D13 y `modules/VISTAJET.md` § 3.

`hoto_migration_v5.sql` (D16, `columns`/`generation`/`superseded_by`/`imported_at`/`source_filename`) — pendiente de ejecución manual en Supabase.

### `vj_hoto_items`
id, hoto_id (FK, cascade), section (`defect`\|`comment`\|`offload`), position, content, source (default `manual`), created_at.

Storage: bucket `hoto-templates` (contiene `HOTO_official_v1.pdf`, la plantilla oficial en blanco).

---

## VistaJet — Laundry & Cleaning Form

**No desplegado** — implementado y verificado en la rama `feature/vj-landing-cleaning` (ambos repos), sin merge a `main` todavía. Migración: `laundry_cleaning_migration_v1.sql`. Detalle de uso en [modules/VISTAJET_LAUNDRY_CLEANING.md](modules/VISTAJET_LAUNDRY_CLEANING.md).

### `vj_laundry_cleaning_records`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| tail_number, icao, service_date | text | cabecera, texto libre tal cual va al PDF |
| ch_name, ch_contact_number, ch_email_address, expected_departure_date | text | bloque CH de la cabecera |
| items | jsonb | default `{}` — `{item_id: {given, received}}` para los 72 ítems normales; `{item_id: {given, note}}` (sin `received`) para los 6 ítems `*_other`, uno por sección — catálogo completo de `item_id` en `fieldMap.js`/`main.js` (contrato cross-repo), no duplicado aquí |
| additional_comments | text | |
| status | text | default `active` |
| source_template | text | default `Laundry_Cleaning_Form_official_v1.pdf` |
| created_at, updated_at | timestamptz | |

Storage: bucket `laundry-cleaning-templates` (contiene `Laundry_Cleaning_Form_official_v1.pdf`, la plantilla oficial en blanco).

---

## Salud — Isabel Core, especialista de sueño

Migración: `isabel-api/migrations/checkins_migration_v1.sql` y `interventions_migration_v1.sql` (2026-08-05, aplicadas manualmente a Supabase real). No pasa por `db.js` ni por el frontend — son tablas propias de `isabel-api`, leídas/escritas solo por `src/core/specialists/health.js` vía las tools MCP `health_get_sleep_status`/`health_register_sleep`. Detalle de uso en [modules/HEALTH_AND_GYM.md](modules/HEALTH_AND_GYM.md).

### `checkins`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | default `gen_random_uuid()` |
| fecha | date | fecha civil Europe/Madrid del check-in, no UTC — ver `core/tz.js` |
| sleep_minutes | int | check `0..1440` |
| pain_level | int | check `0..10`, sin uso todavía (campo preparado, no escrito por ningún flujo actual) |
| energy_level | int | check `1..5`, sin uso todavía |
| symptoms | text | sin uso todavía |
| created_at | timestamptz | default `now()` |

Hoy solo se escribe `sleep_minutes` (vía `registerSleep()`). El resto de columnas existen porque la tabla se diseñó para todo el dominio Salud, no solo sueño — no confundir "columna existe" con "columna en uso".

### `interventions`
Entidad genérica de "pregunta/aviso pendiente de Isabel", reutilizable por cualquier dominio — desde 2026-08-06 usada por dos: Salud y VistaJet (ver [modules/VISTAJET.md](modules/VISTAJET.md) § specialist de pasaporte). No confundir con la tabla `decisions` (decisiones abiertas de la usuaria) — esta es de Isabel hacia la usuaria.
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | default `gen_random_uuid()` |
| domain | text | valores reales hoy: `Salud`, `VistaJet` |
| kind | text | añadida en `interventions_migration_v2.sql`; separa el tipo dentro de un domain (ej. `sleep_checkin`, `passport_expiry`) — `domain+kind+status` es la clave por la que se resuelve una respuesta entrante, sin id |
| target_date | date | fecha a la que se refiere la pregunta (civil Europe/Madrid para Salud; para VistaJet, la fecha de vencimiento en cuestión) |
| reason_signature | text | clave de deduplicación — ver índice abajo |
| status | text | `pending` \| `answered` \| `superseded`, default `pending` |
| created_at | timestamptz | default `now()` |
| answered_at | timestamptz | nullable |

`CREATE UNIQUE INDEX ... ON interventions(reason_signature) WHERE status='pending'` — garantiza a nivel de base de datos que nunca puede haber dos preguntas pendientes con la misma firma (ej. dos preguntas de sueño abiertas para el mismo día), incluso si el código de aplicación tuviera un bug de dedup. Índice adicional `(domain, kind, status)` para la resolución sin id.

Primer registro real conservado (no es dato de prueba descartable, es un check-in real de la usuaria): `fecha=2026-08-05`, `sleep_minutes=375` (6h15).

## Deuda técnica del modelo de datos

Ver [KNOWN_PROBLEMS.md](KNOWN_PROBLEMS.md) para el detalle de impacto. Resumen aquí porque afecta directamente a este documento:
- `transactions`, `metrics` y `operators` no tienen `CREATE TABLE` en ningún repo — no se pueden recrear desde cero solo con el código versionado.
- El dato de "shopping" (stock a bordo) existe potencialmente tanto en `vj_inventory_session_items` como en `vj_hoto_records.shopping` — son conceptualmente el mismo tipo de información capturada dos veces, sin sincronización automática.
