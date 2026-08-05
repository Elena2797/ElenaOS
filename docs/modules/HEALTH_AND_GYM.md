Estado: Salud (sueño) implementado como especialista real; Gym sigue siendo placeholder genérico
Última verificación: 2026-08-05
Verificado en: lectura de isabel-api/src/core/specialists/health.js, core/interventions.js, core/normalize/sleep.js, core/tz.js, mcp.js + validación manual end-to-end contra Supabase real + invocación real desde un agente OpenClaw vía MCP
Fuente de verdad de datos: DATA_MODEL.md § Salud (sueño) y § metrics (Gym)

# modules/HEALTH_AND_GYM.md

Salud y Gym ya no comparten el mismo mecanismo. Salud tiene, desde 2026-08-05, un primer especialista real (sueño) con tablas, lógica y tools MCP propias. Gym sigue siendo el área genérica original (solo `metrics`, sin lógica de dominio). Se documentan en el mismo archivo por continuidad histórica del proyecto, no porque compartan implementación.

# Objetivo
Salud: que Isabel pregunte por señales de salud relevantes (hoy: sueño) cuando falten, registre la respuesta de forma fiable y deje un rastro auditable — sin depender de que el LLM decida qué hacer con datos crudos. Gym: seguimiento de métricas de ejercicio (sesiones, tendencia), sin especialista propio todavía.

# Estado real
**Salud — sueño:** especialista real, `isabel-api/src/core/specialists/health.js`, expuesto como dos tools MCP (`health_get_sleep_status`, `health_register_sleep`). Construido, testeado (tests unitarios locales, 100% pasando) y validado manualmente de punta a punta contra Supabase real: detección de ausencia de registro, dedup de preguntas repetidas para el mismo día, parseo de la respuesta en lenguaje natural, escritura de `checkins` + `eventos` + cierre de `interventions`, reevaluación tras registrar. Validado también desde un agente real de OpenClaw invocando las tools por MCP, con resultado correcto. Ver `DECISIONS.md` D10 y `CHANGELOG.md` 2026-08-05.

**Gym:** sin cambios — sigue siendo área genérica, solo lectura/escritura de `metrics` con distintas `key`.

# Qué funciona
**Salud — sueño:**
- `health_get_sleep_status` — comprueba si el sueño del día civil (Europe/Madrid, ver `core/tz.js`) ya está registrado en `checkins`. Si falta y no hay ya una `intervention` `pending` con la misma `reason_signature` para ese día (dedup por índice único en base de datos, no solo en código), crea una y devuelve `should_ask:true` + `intervention_id`. Si ya hay una pendiente, la reutiliza — nunca duplica la pregunta.
- `health_register_sleep` — recibe `intervention_id` + el texto tal cual lo escribió la usuaria (ej. "dormí seis horas y cuarto", "6h15", "6"). Lo pasa por el parser determinista de duración (`core/normalize/sleep.js`); si se interpreta sin ambigüedad, escribe el `checkin`, registra el evento en `eventos` (origen `isabel`, herramienta `health_specialist`) y marca la `intervention` como `answered`. Si el texto es ambiguo o no reconocible, devuelve `ok:false` con `could_not_interpret` sin tocar la base de datos, para que se le pueda repreguntar con el mismo `intervention_id`.
- Parser determinista de sueño: busca una expresión de duración inequívoca en cualquier parte del texto (no exige que el mensaje entero sea solo el número) — cubre horas+minutos, fracciones ("y cuarto/media"), formatos "6h15", y un número suelto como mensaje completo. Rechaza explícitamente si encuentra cero o más de una expresión candidata, en vez de adivinar.
- Tablas `checkins` e `interventions` — ver `DATA_MODEL.md`.

**Gym:** igual que antes — tabla `metrics`, sin lógica propia, cálculo de "salud" del área genérico en Home.

# Qué está parcialmente implementado
`checkins.pain_level` y `checkins.energy_level` existen en el esquema (preparado para ampliar el dominio Salud más allá de sueño) pero ningún flujo actual los escribe todavía.

# Qué no existe todavía
- Cualquier especialista de Gym.
- Cualquier trigger *proactivo* real (Isabel preguntando sin que algo la invoque primero) — hoy el especialista de sueño responde cuando se le llama, pero qué dispara esa llamada en producción (cron de OpenClaw vía Telegram) todavía no está desplegado, ver `core/AUTOMATIONS.md`.
- Autenticación en el endpoint MCP que expone estas tools (`isabel-api/src/mcp.js` no tiene ninguna) — ver `SECURITY.md`.
- Integración con dispositivos/apps de salud externas.

# Modelo de datos
`checkins`, `interventions` — ver `DATA_MODEL.md` § Salud. `metrics` (Gym) — ver `DATA_MODEL.md` § Sistema genérico. Sin migración formal para `metrics`.

# Flujos de usuario
**Salud — sueño (validado manualmente, no todavía corriendo sola en producción):** un agente (hoy: OpenClaw en spike local; en producción, pendiente de desplegar) llama a `health_get_sleep_status`; si falta el dato, le pregunta a la usuaria en lenguaje natural; ella responde en lenguaje natural; el agente llama a `health_register_sleep` con su respuesta tal cual.
**Gym:** registrar un valor de métrica, verlo en el área correspondiente — sin cambios.

# Backend/endpoints
Ninguna ruta HTTP nueva. Las dos tools de sueño se exponen exclusivamente vía el servidor MCP de `isabel-api` (`GET/POST /mcp`, `isabel-api/src/mcp.js`) — no hay endpoint REST directo para ellas.

# Frontend/vistas
Ninguna. El especialista de sueño no tiene UI propia — se opera exclusivamente por conversación (MCP). `areaView()` genérico sigue sirviendo tanto a Salud como a Gym en el frontend de LIFEOS.

# Archivos relevantes
- `isabel-api/src/core/specialists/health.js` — orquestación (`getSleepStatus`, `registerSleep`).
- `isabel-api/src/core/interventions.js` — decisión pura + I/O de `interventions`.
- `isabel-api/src/core/normalize/sleep.js` — parser determinista de duración.
- `isabel-api/src/core/tz.js` — helpers de fecha civil Europe/Madrid.
- `isabel-api/src/core/eventLogger.js` — `logHealthCheckinEvent`.
- `isabel-api/src/mcp.js` — definición de las dos tools MCP.
- `isabel-api/src/__tests__/{tz,normalize,health,interventions}.test.js`.
- `life-os-app/src/services/db.js` (funciones de `metrics`, Gym, sin cambios).

# Verificaciones empíricas
2026-08-05: secuencia manual completa contra Supabase real — sin registro previo → pregunta generada → llamada repetida no duplica pregunta (dedup por índice único) → respuesta en lenguaje natural interpretada correctamente → `checkin` + `evento` creados, `intervention` marcada `answered` → nueva llamada a `get_sleep_status` refleja el dato ya registrado. Repetido con éxito invocando las tools desde un agente real de OpenClaw (perfil dev, no producción) vía MCP.

# Bugs conocidos
Ninguno abierto en el especialista de sueño en sí. `metrics` (Gym) sigue sin migración formal, sin cambios respecto a antes.

# Decisiones cerradas
`DECISIONS.md` D10 — OpenClaw como runtime que en el futuro disparará estas tools de forma autónoma; el especialista en sí (esta pieza) es independiente de esa decisión y ya está terminado.

# Fuera de alcance actual
Cualquier lógica de dominio de Gym. Ampliar Salud más allá de sueño (dolor, energía, síntomas) sin decisión explícita nueva. Autenticar el endpoint MCP (bloqueante antes de exponerlo a un Gateway remoto, pero es una tarea de seguridad transversal, no de este módulo — ver `SECURITY.md`).

# Próximo hito
Desplegar el runtime que dispare estas tools de forma autónoma y programada (OpenClaw en Railway, ver `core/AUTOMATIONS.md`) — no decidido cuándo, no iniciar sin autorización explícita nueva.
