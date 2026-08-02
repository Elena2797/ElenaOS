Estado: conocimiento vigente — lista viva, se actualiza con "Actualiza la documentación"
Última verificación: 2026-08-02
Verificado en: auditorías realizadas en esta sesión (HOTO, Inventario, arquitectura de Isabel) + diagnóstico del incidente de Supabase pausado del 2026-08-02

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

### `isabel-api/src/core/` (Isabel Core con routing a especialistas) existe pero no está montado
`index.js` no importa `core/router.js`. Es código completo, probablemente funcional si se conectara, pero no forma parte del servidor que corre en producción. Impacto: cualquier chat que lea el código de `core/` sin verificar `index.js` asumirá que está activo.

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

## Seguridad
Ver [SECURITY.md](SECURITY.md) — no se duplica aquí, pero cuenta como deuda técnica activa (PIN hardcodeado, API key con fallback expuesto en el bundle, RLS desactivado, token de GitHub en texto plano).
