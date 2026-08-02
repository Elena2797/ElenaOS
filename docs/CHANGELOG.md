Estado: conocimiento vigente — se añade cronológicamente, nunca se reescribe
Última verificación: 2026-07-10
Verificado en: git log de isabel-api y life-os-app
Fuente de verdad de datos: ninguna

# CHANGELOG.md — Historial relevante

No es un espejo del `git log` completo (para eso, `git log` en cada repo). Aquí solo lo que un chat nuevo necesita saber para entender por qué el sistema está como está.

## 2026-08-02

- **Bug reportado por la usuaria**: en Dominios no aparecía ninguna tarjeta ("Mapa visual de LIFEOS" se veía, pero la lista debajo estaba vacía), con la píldora de modo mostrando "OFF". Diagnóstico por auditoría de código (sin asumir causa): se demostró que `S.mode` (ON/OFF) no tiene ninguna relación de código con `visibleDomains()` — coincidían porque ambos son el mismo valor por defecto de `S` cuando la carga inicial nunca llega a completarse con éxito.
- `life-os-app` `45738d1` — **Fix: estado explícito loading/loaded/error en la carga inicial de datos.** Causa raíz de código: `reload()` (`src/main.js`) ignoraba el campo `.error` de las respuestas de Supabase y coercía `data:null` a `[]` en silencio — un fallo de red en `ctx`/`areas` era indistinguible de "no hay dominios". `loadAll()` (`src/services/db.js`) pasa de `Promise.all` a `Promise.allSettled` para que un rechazo real en una query no tumbe las otras 12. `reload()` ahora distingue `loading`/`loaded`/`error`, no sobrescribe `S.areas`/`S.mode` si `ctx` o `areas` fallan, y expone un banner de conexión con botón "Reintentar" (`retryLoad()`), visible en cualquier vista. Ver `DECISIONS.md` D8.
- **Incidente real detrás del fallo, investigado y confirmado en la misma sesión**: el proyecto de Supabase (`cllubptdwydifomlnxds`) estaba **pausado** — confirmado por NXDOMAIN en resolución DNS pública (Google DoH), reproducido desde una red independiente del entorno de desarrollo y de este chat, descartando problema de red del dispositivo de la usuaria, de CORS, o de configuración de build (la URL/key horneadas en el bundle de producción coinciden exactamente con `.env.local` y con lo documentado). La usuaria reactivó el proyecto desde su dashboard de Supabase; verificado después: DNS resuelve, la REST API devuelve las 7 filas reales de `areas`, y la app en producción carga Dominios con las tarjetas completas. Ver `operations/SUPABASE.md`.
- Deploy verificado en Vercel para el commit exacto: hash de bundle cambiado (`index-yYQ1Qqcx.js`), contenido confirmado (`retryLoad`, `conn-banner`, `allSettled` presentes), comportamiento confirmado en producción real antes y después de la reactivación de Supabase.
- El push se bloqueó primero por un token de acceso personal de GitHub caducado en el remoto de `life-os-app` (401 Unauthorized, no un problema de red) — la usuaria generó uno nuevo. Reafirma el riesgo #5 de `SECURITY.md`; ese token nuevo pasó en texto plano por este chat, ver nota añadida ahí.
- Detectado de paso, sin corregir (fuera de alcance de esta sesión): la tabla `areas` tiene 7 filas (incluye "Gym") pero `visibleDomains()` solo reconoce 6 nombres — "Gym" no aparece nunca en Dominios. Ver `KNOWN_PROBLEMS.md`.

## 2026-07-14

- `life-os-app` `258d2f5` — Creación de `docs/research/` como categoría de primer nivel de `/docs`: investigación externa por dominio, separada de estado de implementación (`modules/`) y de visión/requisitos (raíz). Estructura: `research/README.md` (convenciones + escala de cobertura NO INVESTIGADO→...→SUFICIENTE PARA DECIDIR + pipeline de ingestión fuente→conocimiento) y `research/JETMI/` (`LOG.md`, `KNOWLEDGE.md`, `HYPOTHESES.md`, `sources/`) como primer dominio.
- **JETMI-D1** (`DECISIONS.md`): JETMI se posiciona como broker de aviación privada, no como plataforma de descubrimiento ni como herramienta para vender leads a otros brokers. Resuelve la contradicción entre `jetmi.md` (raíz, ahora marcado superseded en su propia cabecera) y `JETMI_PRD_Semilla.md`. JETMI sigue en fase de definición/investigación/diseño — no existe sociedad JETMI LDA constituida.
- **Ingestión de los tres primeros artefactos de investigación** en `research/JETMI/sources/`: Manual Operativo del Broker de Aviación Privada (Cap. 1 + índice preliminar de 15 capítulos), Mapa Maestro de Investigación (diagnóstico del índice original, 24 dominios en 7 fases, 7 preguntas estratégicas abiertas), e Investigación 1.1 (41 funciones del día a día de un broker en 11 clusters, mapas de decisión/información, 9 preguntas abiertas). `LOG.md` y `HYPOTHESES.md` actualizados con la cobertura y las preguntas resultantes; `KNOWLEDGE.md` recibió una sección separada de "candidatos a consolidación futura" (6 candidatos), sin promover ninguno a conocimiento oficial.
- `life-os-app` `4a80e9d` — **Auditoría de persistencia y cierre de cuatro huecos de contexto durable**, tras verificación explícita de que los tres artefactos y sus derivados sobreviven sin depender de la conversación: `modules/JETMI.md` documenta la relación JETMI↔Isabel↔LIFEOS (sin especialista implementado) y la restricción de diseño "una sola persona + sistemas/IA progresivos" (sin asignar funciones a agentes); `research/README.md` documenta la cadena completa fuente→investigación→decisión→PRD→implementación→estado verificado y la separación de responsabilidades entre investigación externa, espacio de producto/estrategia y Claude Code; `research/JETMI/LOG.md` fija el próximo bloque de investigación (Fase 1, dominio 1.2 Supply) como decidido, ya no abierto.
- Trabajo puramente documental en los tres commits de la sesión — no se diseñó ni implementó ninguna funcionalidad operativa de JETMI (workflows, agentes, automatizaciones, CRM, modelo de datos), ni se inició la investigación del dominio 1.2.

## 2026-07-10

- **isabel-api** `89151ab` / **life-os-app** `f7d4f86` — Checklist Daily Duties del HOTO conectado de punta a punta: Supabase → 46 checkboxes del PDF oficial mapeados por columna de CH, guardado no-optimista en toda la edición del HOTO, migración one-time de localStorage.
- **isabel-api** `28fd58c` — Fix: el Excel de inventario se nombraba con la fecha de apertura de la sesión, no la de exportación.
- **isabel-api** `5770b7e` — Fix: el parser de lote no reconocía listas en formato "Nombre: cantidad" (número al final) — causaba que listas completas de conteo cayeran en búsqueda difusa y bloquearan al usuario.
- **isabel-api** `c32a253` — Refactor: eliminado código muerto (`CABIN_CARE_LABELS` duplicada y desincronizada del servidor).
- Auditoría completa del módulo HOTO (a petición de la usuaria): se estableció que el modelo actual representa el documento PDF, no la rotación — origen de D6 en `DECISIONS.md`.
- Creación de `/docs` como memoria persistente del proyecto (este mismo cambio).

## 2026-07-07/08

- **isabel-api** `a60bc36` — Módulo HOTO vivo: modelo de datos + exportación al PDF oficial de VistaJet, mismo patrón que Inventario.
- **isabel-api** `36cdb76` — "Isabel Core MVP": código de `/v1/chat` con routing a especialista de inventario. **Nota de esta auditoría: este código nunca quedó montado en `index.js`** — no está activo en producción pese al mensaje de commit.
- **life-os-app** `6be3df4` — Aircraft Readiness: la tarjeta de VistaJet pasa de texto estático a evaluación real basada en datos de todos los módulos (HOTO, Inventario, Laundry, eLearnings, Facturas).
- `ARQUITECTURA_FUSION.md` documenta "dos cerebros, no uno" y propone plan de fusión por fases — plan que a fecha de esta auditoría sigue sin avanzar más allá de la Fase 0.

## Anterior (Sprint 1-2, sin fecha exacta verificada)

- Módulo de Inventario VistaJet: sesiones, parser batch, resolución de ambigüedades, exportación Excel oficial (patch quirúrgico de ZIP) y UPLIFT.
- Estructura modular del frontend con Vite; extracción de acceso a Supabase a `services/db.js`; extracción de comunicación con Isabel a `services/isabel.js`.
