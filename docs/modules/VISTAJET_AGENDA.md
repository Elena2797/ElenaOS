Estado: implementado (2026-09-26); las pantallas se comprobaron con HTML generado y datos de ejemplo, no con sus datos reales
Última verificación: 2026-09-26 (noche)
Verificado en: isabel-api/src/core/agenda.js, mcp.js (`agenda_save`, `agenda_get`), routes/app.js (`/v1/app/agenda`); life-os-app/src/main.js (`loadAgenda`, `vjAgendaView`, `todayBlock`)
Fuente de verdad de datos: tabla `vj_flights` (`life-os-app/agenda_migration_v1.sql`, aplicada)

# modules/VISTAJET_AGENDA.md — Agenda de vuelos

Sus vuelos y días de rotación, leídos por Isabel de las FOTOS de su horario y enseñados en LIFEOS (nunca en Google
Calendar: fallo del 26/09).

# Cómo entra

Ella manda a Isabel (Telegram) una foto de la lista "Select Flight" y/o del calendario por días. Isabel las lee (ve
capturas) y llama a `agenda_save`:
- por vuelo: `dep_icao/arr_icao`, `dep_utc/arr_utc` (ISO con Z; la lista trae LT y UTC, el calendario solo UTC),
  **`dep_tz/arr_tz` (IANA, obligatorias)**, `pax` (el número junto al icono = PASAJEROS), `tags` (OPEN, FERRY, UPDATED,
  NEW FLIGHT), `flight_ref`, y `dep_local_seen/arr_local_seen` de la lista para comprobar la zona;
- `rot_days`: días "ROT" = día de rotación sin vuelos definidos aún;
- `replace_days`: SOLO días que la foto muestra ENTEROS (el calendario). La lista va cortada: nunca.

Reglas (`core/agenda.js`, con tests):
- Se guarda en UTC; la hora **LOCAL** se calcula con la zona de cada aeropuerto y es la que se enseña siempre (decisión suya).
  Sin zona válida el vuelo se **rechaza**: no se adivina una hora local.
- Las dos fotos se unen por (avión, origen, destino, salida UTC) o, si cambió la hora, por avión+ruta+día cuando hay uno solo; la segunda no pierde lo que ya se sabía (pax, nº de vuelo).
- Foto nueva sustituye a la vieja; un día solo pierde vuelos si viene en `replace_days`. Un día con vuelos deja de ser ROT.
- `flightStatus`: cada vuelo trae `scheduled | in_flight | landed` contra AHORA (y `arrival_estimated` si no hay llegada: bloque de 3 h).

# Dónde se ve

- **Inicio → Tu día:** los vuelos de hoy (hora local, ordenados por la hora real de Madrid) y el día ROT.
- **VistaJet → Agenda de vuelos:** todos los días desde hoy; la tarjeta dice el siguiente vuelo.
- **HOTO y Laundry:** pista "Tu último vuelo acaba en XXXX" bajo el ICAO vacío.
- **Isabel:** `agenda_get` (con `now_madrid` y `status`).

# Qué mueve la agenda (del lado de Isabel)

- Avisos de feedback del vuelo: la tarde nunca antes de 45 min tras aterrizar; el último aviso antes de las 24 h (`reminderSlot`).
- `core/schedulePhotoAsk.js`: cada día de rotación con la agenda de hoy vacía, 08:00-11:00, pide la captura del horario.
- `core/aircraftReceived.js`: un avión en la agenda distinto al actual → "¿recibiste el avión?" (mañana 19:30-21:30 / hoy hasta 45 min antes de salir).
- `core/freshAsk.js`: hora de la pregunta diaria de Fresh Items.
- `core/leavingAircraft.js` (tool `vistajet_leaving_aircraft`): el último vuelo sugiere el ICAO de dónde deja el avión.
- **No molestar mientras vuela** (`isInFlightNow`, en `runInterventionCycle`): de 45 min antes de la salida a 15 min tras aterrizar la entrega se retiene.

# Trampas

- La app pide PIN + código de Telegram: no se pueden ver sus pantallas con datos reales desde una sesión de código.
- Tras subir un deploy, el móvil puede seguir con la versión vieja hasta cerrar del todo la app (KNOWN_PROBLEMS: service worker).
- Un vuelo UPDATED (misma ruta y día, otra hora) se actualiza solo y `agenda_save` devuelve `changes`. Si la hora lo pasa a OTRO día, el viejo queda hasta que un `replace_days` lo retire.

# Tareas espejo en Inicio (`core/mirrorTasks.js`)

Lo que Isabel te recuerda por Telegram sale además como tarea en Inicio (feedback del vuelo, feedback del avión, foto del
horario, Fresh Item de hoy) para marcarlo ahí. Sincronía en los dos sentidos por el tick; detalle en CHANGELOG 2026-09-26 (14).
