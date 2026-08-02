Estado: este documento ES el estado — se reescribe en cada "Cerrar sesión de desarrollo" si algo cambió globalmente
Última verificación: 2026-08-02
Verificado en: commit 45738d1 (fix de estado de conexión) + verificación en vivo contra producción y contra el proyecto real de Supabase, ver CHANGELOG.md
Fuente de verdad de datos: ninguna (agrega, no duplica DATA_MODEL)

# CURRENT_STATE.md — Fotografía del proyecto, ahora

Una página. Solo 5 campos. Detalle de un módulo → `modules/*.md`. Handoff de la última sesión (qué se hizo justo antes, qué archivos tocar) → `NEXT_SESSION.md`, que complementa a este documento, no lo duplica.

## Estado general del proyecto
LIFEOS en producción y en uso real diario. VistaJet (Inventario + HOTO + Aircraft Readiness) es el dominio maduro, con datos reales de rotaciones reales pasando por el sistema — ver `modules/VISTAJET*.md`. El resto de áreas (JETMI, Finanzas, Salud/Gym, Marca Personal, Vida Personal) son genéricas, sin lógica de dominio propia — ver sus documentos en `modules/`. `/docs` es la memoria persistente oficial desde 2026-07-10. Desde el 2026-08-02, la carga inicial de datos (`reload()`/`loadAll()`) distingue explícitamente `loading`/`loaded`/`error` y nunca se debe volver a confundir "no se pudo cargar" con "no hay datos" — ver `DECISIONS.md` D8.

## Último deploy relevante
- `isabel-api` → Railway, commit `89151ab` (checklist Daily Duties exportado a los checkboxes del PDF de HOTO) — sin cambios desde la última sesión.
- `life-os-app` → Vercel, commit `45738d1` (estado explícito loading/loaded/error en la carga inicial; banner de conexión con "Reintentar"). Deploy verificado directamente: bundle con hash nuevo, contenido del fix confirmado, comportamiento correcto probado en producción real antes y después de resolver el incidente de Supabase.

## Último commit importante
`45738d1` en `life-os-app` — ver arriba. Va acompañado, en el mismo push, de 6 commits de documentación JETMI que ya estaban pendientes de sesiones anteriores (`258d2f5` … `84b7148`, puramente documentales, sin cambios de código).

## Bloqueos actuales
Ninguno técnico ni de infraestructura a día de hoy. El incidente real de esta sesión — el proyecto de Supabase (`cllubptdwydifomlnxds`) pausado, causando NXDOMAIN y por tanto fallo total de `loadAll()` — quedó resuelto: la usuaria lo reactivó desde su dashboard y se verificó (DNS, REST API, y la app en producción) que vuelve a cargar datos reales. Sigue pendiente, de sesiones anteriores y sin relación con esto: confirmar que la migración del checklist Daily Duties de HOTO a Supabase llegó al móvil de la usuaria (detalle en `modules/VISTAJET_HOTO.md`).

## Siguiente objetivo
Ninguno iniciado automáticamente. Dos hilos abiertos, ninguno urgente: (1) decidir si "Gym" debe aparecer como dominio propio en Dominios — existe en la tabla `areas` pero `visibleDomains()` no lo incluye (ver `KNOWN_PROBLEMS.md`); (2) la investigación de JETMI sigue en pausa deliberada — el próximo bloque decidido es Fase 1, dominio 1.2 (Supply), pendiente de que la usuaria traiga el artefacto (ver `research/JETMI/LOG.md` § 6).
