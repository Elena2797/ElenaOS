Estado: implementado (mapa general — detalle en cada sub-módulo)
Última verificación: 2026-08-06
Verificado en: life-os-app/src/main.js (router de vistas, vjView) — nota: fila de Laundry & Cleaning Form refleja el estado de la rama feature/vj-landing-cleaning, no de main; isabel-api/src/core/specialists/vistajet.js (tres specialists); isabel-api/src/hoto/data.js + life-os-app/src/services/hoto.js (correlación HOTO↔avión, D13); 177/177 tests isabel-api, verificación manual en navegador
Fuente de verdad de datos: DATA_MODEL.md § vj_state, vj_tasks, interventions

# modules/VISTAJET.md — Mapa del dominio VistaJet

VistaJet es, con diferencia, el dominio más maduro de LIFEOS: es el único con módulos de dominio propio en vez de usar solo el sistema genérico de tareas/áreas, y desde 2026-08-06 el segundo dominio con un specialist de Isabel invocable por MCP (el primero fue Salud/sueño).

## Sub-módulos

| Documento | Qué cubre | Estado |
|---|---|---|
| [VISTAJET_INVENTORY.md](VISTAJET_INVENTORY.md) | Sesiones de inventario del avión, parser de chat, export Excel/UPLIFT | implementado |
| [VISTAJET_HOTO.md](VISTAJET_HOTO.md) | Handover/Takeover vivo, export PDF oficial | implementado, con gaps documentados |
| [VISTAJET_LAUNDRY_CLEANING.md](VISTAJET_LAUNDRY_CLEANING.md) | Laundry & Cleaning Form (lavandería, dishwashing, bed linen, dry cleaning, cristalería), export PDF oficial | implementado y verificado en worktrees aislados — sin merge a main, no desplegado |
| [VISTAJET_FRESH.md](VISTAJET_FRESH.md) | Plan de provisiones frescas | implementado mínimo |
| [AIRCRAFT_READINESS.md](AIRCRAFT_READINESS.md) | Evaluación de "¿puedo entregar el avión ya?" | implementado |

## Estado general y tareas (fuera de los sub-módulos)
`vj_state` (status libre/rotación/standby, horas, pasaporte, maleta) y `vj_tasks` (tareas simples propias de VJ) — ver [DATA_MODEL.md](../DATA_MODEL.md). Renderizado por `vjStatusView()` en `main.js`, editable vía el modal de `openVjState()`.

## Specialists de Isabel (nuevo, 2026-08-06)
Dos vertical slices construidos sobre el patrón formalizado en [core/DOMAIN_SPECIALISTS.md](../core/DOMAIN_SPECIALISTS.md) (el primero de LIFEOS fue Salud/sueño). Sin tabla nueva — ambos reutilizan `vj_state` (ya existía, solo se leía/escribía desde el frontend) y, el primero, la tabla genérica `interventions`.

### 1. Vencimiento de pasaporte
- **`vistajet_get_status`** (tool MCP): lee `vj_state` (avión, status, día de rotación) y evalúa el riesgo de vencimiento del pasaporte con los mismos umbrales que ya usaba el frontend (`main.js:869` — ≤30 días "red", ≤90 "amber"). Si hay riesgo, crea o reutiliza una `Intervention` (`domain: 'VistaJet'`, `kind: 'passport_expiry'`) de forma determinista y con dedup a nivel de DB, igual que el specialist de sueño.
- **`vistajet_update_passport`** (tool MCP): recibe la nueva fecha en lenguaje natural ("10 de mayo de 2031", "2031-05-10", "10/05/2031"), la parsea de forma determinista (`core/normalize/date.js`, nuevo — reutilizable por futuros specialists que necesiten fechas), valida que sea una fecha futura razonable (no en el pasado, no a más de 20 años), escribe `vj_state.passport_exp`, y marca la Intervention como respondida.
- **Diferencia de diseño respecto al specialist de sueño**, documentada en el código: el `reason_signature` de sueño es estable dentro de una llamada (la fecha de "hoy" no cambia), pero el de pasaporte está atado a un valor mutable (`passport_exp`) — si se renueva por otra vía (el formulario manual, por ejemplo) mientras una alerta seguía pendiente, esa alerta queda "huérfana". `getVistajetStatus` lo resuelve buscando por `domain+kind` (no por signature) y supersede incondicionalmente cualquier pending que no coincida con el valor actual, antes de decidir si hace falta preguntar.

### 2. Estado operacional (continuidad — rotación/avión/standby)
- **`vistajet_update_status`** (tool MCP): registra transiciones reales que Estefanía reporta en conversación — empezar una rotación (avión + día/total), avanzar el día de rotación, pasar a standby, o "ya entregué el avión" (limpia `aircraft`/`rotation_day`/`rotation_total`/`rotation_start` automáticamente, transición explícita a `libre`). Campos estructurados (no texto libre a parsear) — es Isabel quien extrae los datos de la conversación, `validateStatusUpdate()` aplica las reglas de negocio antes de escribir (una `rotacion` exige avión, `rotation_day` no puede superar `rotation_total`).
- Sin flujo de Intervention — a diferencia de sueño/pasaporte, no hay una señal fiable de "dato ausente" que detectar sin inventar una suposición (`rotation_day` nunca se auto-incrementa). Es un reporte que Isabel registra cuando la usuaria lo cuenta, mismo patrón que `isabel_message` para Inventario.
- Bug real encontrado y corregido durante el testing: la rama de "limpiar al quedar libre" se disparaba con la lógica de status *heredado* del estado actual, no solo con un `status:'libre'` explícito en el input — un input vacío contra un `vj_state` ya libre "validaba" como si fuera una transición real en vez de devolver `no_fields_to_update`.

### 3. HOTO ligado al avión operativo (D13)
`vj_hoto_records` tenía un modelo inconsistente: `status` solo tomaba el valor `'active'` en la práctica, no existía ninguna acción real de "entregar/cerrar", y nunca se correlacionaba `tail_number` con `vj_state.aircraft`. Se corrigió el modelo antes de conectarlo a Isabel (nunca un specialist encima de datos inconsistentes) — ver `DECISIONS.md` D13 para el detalle completo.

- **`getActiveHoto(tailNumber)`** (`isabel-api/src/hoto/data.js`) / **`loadActiveHoto(tailNumber)`** (`life-os-app/src/services/hoto.js`): sin argumento, comportamiento histórico exacto (compatibilidad total con Inventario/Readiness, que no pasan avión). Con argumento, el HOTO "actual" es el que corresponde a ese avión — y si hay más de un `active` para la misma matrícula (inconsistencia real que el modelo no impedía), devuelve `{ambiguous:true, matches}` en vez de elegir uno al azar.
- **`closeHoto(id)`**: transición explícita `active → delivered` con `delivered_at` — nunca borra la fila, solo deja de ser la activa.
- **`vistajet_get_status`** ahora incluye `hoto: {applicable, exists, ambiguous, id, status, tail_number, has_prior_hoto}` para el avión operativo actual.
- **`vistajet_update_status`** cierra automáticamente el HOTO del avión anterior cuando la transición es a `libre` ("ya entregué el avión") — best-effort (si no había HOTO activo para ese avión, no es un error), fail-closed si es ambiguo (no cierra ninguno, lo reporta en `hoto_closed`), y nunca bloquea la transición de `vj_state` en sí.
- Sin migración de esquema necesaria (`status`/`delivered_at` ya existían sin restricción) salvo un índice único parcial opcional (`hoto_migration_v4.sql`) — aditivo/reversible, verificado sin conflicto contra el único HOTO real existente antes de escribirlo, **pendiente de ejecución manual en Supabase**.
- `readiness.js` (Aircraft Readiness) actualizado para pasar el avión actual a `loadActiveHoto` — comportamiento sin cambios mientras `vj_state.aircraft` esté vacío (como está hoy en producción); se activa solo cuando haya un avión asignado.
- **Deliberadamente sin tocar**: la pantalla de edición viva de HOTO (`vjHotoView`) sigue llamando a `loadActiveHoto()` sin avión — cambio de mayor riesgo sobre la vista de uso diario, no verificable de punta a punta sin interacción real, pospuesto a propósito.

Todos los specialists: sin UI propia (conversación/MCP únicamente, igual que sueño); el modal manual de `openVjState()` sigue funcionando exactamente igual, sin cambios. Tests: `isabel-api/src/__tests__/vistajet.test.js` (lógica pura) + `vistajet.orchestration.test.js` (fake-db en memoria, 25+ escenarios). Verificado también en navegador (Readiness/HOTO/Inventario, sin errores de consola, sin regresión).

### Auditado y explícitamente no construido en este pase
- **Maleta/`bag_checks`** como trigger de Intervention: las plantillas de la maleta (cuántos items tiene cada una) viven en `localStorage` del frontend, no en Supabase — el backend no puede saber si "la maleta está completa" sin adivinar. Requeriría migrar las plantillas a Supabase primero.
- **E-learning/facturas**: no existe ninguna tabla ni módulo para esto todavía en todo el código.

## Por qué VistaJet tiene módulos propios y el resto de áreas no
Es el dominio con reglas de negocio reales, documentos oficiales que replicar exactamente, y consecuencias operativas concretas (entregar un avión mal preparado). El resto de áreas (JETMI, Salud, etc.) hoy no tienen ese nivel de especificidad — usan el sistema genérico de `tasks`/`metrics` porque es suficiente para lo que necesitan hoy.
