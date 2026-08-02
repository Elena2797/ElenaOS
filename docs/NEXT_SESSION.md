Última actualización: 2026-08-02 — handoff corto, no histórico acumulativo (para eso está CHANGELOG.md)

# NEXT_SESSION.md

## Qué se terminó en esta sesión
Diagnóstico y resolución completa de un bug reportado por la usuaria: en Dominios no aparecía ninguna tarjeta, con la píldora de modo en "OFF". Se auditó el código sin asumir causa y se demostró que ON/OFF no tiene relación de código con Dominios — coincidían por ser ambos el valor por defecto de `S` cuando la carga inicial de Supabase nunca completaba con éxito. Se implementó el fix (`life-os-app` `45738d1`): `loadAll()` pasa a `Promise.allSettled`, y `reload()` distingue `loading`/`loaded`/`error`, no sobrescribe `S.areas`/`S.mode` con datos vacíos si `ctx`/`areas` fallan, y muestra un banner con botón "Reintentar". Verificado en dev y en producción antes de desplegar. Push resuelto (bloqueado primero por un token de GitHub caducado — la usuaria generó uno nuevo). Deploy en Vercel verificado contra el commit exacto. Investigada la causa real del fallo de conexión: el proyecto de Supabase estaba **pausado** (NXDOMAIN confirmado por DNS público, no problema de red de la usuaria ni de build ni de CORS). La usuaria lo reactivó; verificado end-to-end que la app vuelve a cargar datos reales. Detalle completo en `CHANGELOG.md`, estado general en `CURRENT_STATE.md`, decisión de diseño en `DECISIONS.md` D8.

## Qué quedó pendiente
1. **"Gym" no aparece en Dominios.** Existe como fila real en la tabla `areas` (7 filas totales) pero `visibleDomains()` en `src/main.js` solo reconoce 6 nombres, sin incluir "Gym". No se sabe si es intencional (¿Gym vive dentro de "Salud"?) o un olvido — decisión pendiente de la usuaria, no tocado esta sesión.
2. **Las otras 11 queries de `loadAll()`** (`tasks`, `waiting`, `decisions`, `metrics`, `operators`, `transactions`, `vjState`, `vjTasks`, `projects`, `eventos`, `alertas`) siguen degradándose a listas vacías en silencio si fallan individualmente — solo `ctx`/`areas` disparan el banner de error. Fue una decisión consciente de alcance mínimo (ver `DECISIONS.md` D8), no un olvido, pero queda como posible ampliación futura si se quiere blindar el resto de vistas igual.
3. El token de GitHub nuevo (generado por la usuaria esta sesión) pasó en texto plano por el chat — considerar revocarlo y generar uno definitivo fuera de una conversación, o resolver de raíz la deuda ya documentada en `SECURITY.md` #5 (token en texto plano en el remoto).
4. Sigue pendiente de sesiones anteriores, sin relación con esto: confirmar que la migración del checklist Daily Duties de HOTO llegó a Supabase en el móvil de la usuaria (`modules/VISTAJET_HOTO.md`).
5. Sigue pendiente, en pausa deliberada: abrir la investigación del dominio 1.2 (Supply) de JETMI cuando la usuaria traiga el artefacto correspondiente — no se tocó esta sesión.

## Qué debe hacerse inmediatamente después
Nada de oficio. Si la usuaria quiere, decidir sobre "Gym" en Dominios (punto 1) o sobre ampliar el blindaje de `loadAll()` (punto 2). Si trae el artefacto de investigación JETMI 1.2, ingerirlo con el protocolo ya establecido en `research/README.md`. No iniciar ninguno de los dos por iniciativa propia.

## Qué no debe romperse
- `reload()` no debe volver a sobrescribir `S.areas`/`S.mode` con datos vacíos cuando `ctx`/`areas` fallan — es la protección central del fix de hoy (`DECISIONS.md` D8). Si se toca `reload()`/`loadAll()` en el futuro, verificar que el banner de conexión y el botón "Reintentar" siguen funcionando.
- Si Supabase vuelve a fallar: no asumir pérdida de datos ni reconstruir nada. El plan gratuito de Supabase pausa proyectos por inactividad — eso se manifiesta como NXDOMAIN en DNS, no como un 5xx. Diagnóstico correcto documentado en `operations/SUPABASE.md`: resolver DNS antes de suponer nada más grave.
- Ningún cambio de esquema en Supabase sin protocolo antes/después (`PRINCIPLES.md` #5 y #7).
- HOTO e Inventario de producción contienen datos reales de rotaciones reales — cualquier escritura sigue el patrón dry-run + verificación de `modules/VISTAJET_INVENTORY.md` y `VISTAJET_HOTO.md`.
- Los documentos de la raíz del proyecto no se editan desde `/docs` salvo notas de cabecera "superseded" explícitas y mínimas.
- No asignar funciones concretas a agentes de IA todavía — la restricción "una persona + IA" de JETMI sigue siendo objetivo de diseño, no arquitectura decidida (`modules/JETMI.md`).

## Qué documentos debe leer el siguiente chat
`README.md` → `CURRENT_STATE.md` → este documento → si toca carga de datos o Dominios: `src/main.js` (`reload()`, `loadAll()` en `services/db.js`) directamente y `operations/SUPABASE.md` (tiene ahora el método de diagnóstico de pausa) → si retoma JETMI: `modules/JETMI.md` → `research/JETMI/LOG.md` § 6 (próximo bloque: Fase 1, dominio 1.2 Supply) → `research/README.md` (pipeline de ingestión) antes de tocar `sources/`, `HYPOTHESES.md` o `KNOWLEDGE.md`.
