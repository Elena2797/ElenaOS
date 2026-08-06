Estado: este documento ES el estado — se reescribe en cada "Cerrar sesión de desarrollo" si algo cambió globalmente
Última verificación: 2026-08-06
Verificado en: bug real de divergencia Telegram↔LIFEOS diagnosticado y corregido en producción en dos pasadas (D14, D15) — vj_state reconciliado a una fila real y con índice único verificado en Supabase; vistajet_get_status verificado contra Supabase real; verificación manual en navegador reproduciendo el escenario exacto reportado (localStorage sembrado con datos de 9H-VCQ contra la Supabase real de D-AFBS); 187/187 tests isabel-api + 4/4 tests nuevos en life-os-app (primer test runner del repo); commits desplegados en Railway (isabel-api) y Vercel (life-os-app) vía push a main
Fuente de verdad de datos: ninguna (agrega, no duplica DATA_MODEL)

# CURRENT_STATE.md — Fotografía del proyecto, ahora

Una página. Solo 5 campos. Detalle de un módulo → `modules/*.md`. Handoff de la última sesión (qué se hizo justo antes, qué archivos tocar) → `NEXT_SESSION.md`, que complementa a este documento, no lo duplica.

## Estado general del proyecto
**Isabel sigue real y funcionando 24/7 por Telegram** (sin cambios desde la sesión anterior). El bug de divergencia Telegram↔LIFEOS reportado hoy necesitó DOS pasadas de corrección, no una: D14 arregló la causa raíz (`vj_state` había acumulado 3 filas en producción, sin `ORDER BY` en las lecturas) y la correlación por matrícula en las queries de HOTO/Inventario/Laundry — pero la usuaria demostró con capturas reales que el bug seguía visible después de ese fix. D15 encontró la causa real de lo que quedaba: dos rutas de UI que nunca pasaban por esas queries corregidas — un fallback a `localStorage` sin ningún tag de avión en el resumen del checklist HOTO, y la señal de Laundry en Aircraft Readiness completamente desconectada del módulo real (leía claves de `localStorage` muertas, de una implementación anterior a la migración a Supabase). Se formalizó un principio general (`PRINCIPLES.md` #11): corregir la query no basta, hay que auditar cada ruta de *presentación* del dato. Ambas migraciones SQL pendientes (`vj_state_singleton_migration_v1.sql` de D14 y `hoto_migration_v4.sql` de D13) fueron ejecutadas y verificadas por la usuaria — no queda ninguna acción manual pendiente en Supabase. El resto de áreas (JETMI, Finanzas, Gym, Marca Personal, Vida Personal) siguen sin lógica de dominio propia.

## Último deploy relevante
`isabel-api` en Railway: commit `ace560b`, sin cambios desde D14 (D15 fue puramente frontend). `life-os-app` en Vercel: commits `d4e3f86` (D14) y el de D15 (fallbacks de localStorage, señal de Laundry, semántica de "Bajo control", tests), ambos pusheados a `main` — Vercel tiene auto-deploy activado, pero no se confirmó con una visita directa a la URL pública de producción (ver "Siguiente objetivo"). `isabel-gateway` en Railway sin cambios esta sesión.

## Último commit importante
`life-os-app`: fix de D15 (`triggerHotoSummaryLoad()`, `collectSignals()` con `llcSvc`, semántica de "Bajo control"/`ctrlLabel`, `src/services/__tests__/readiness.test.js` — primer test runner del repo, `node --test`, sin dependencia nueva) + docs (`DECISIONS.md` D15, `PRINCIPLES.md` #11, `CHANGELOG.md`, `KNOWN_PROBLEMS.md`, `modules/VISTAJET.md`).

## Bloqueos actuales
Ninguno. No queda ninguna migración SQL pendiente de ejecución manual en Supabase (ambas confirmadas aplicadas por la usuaria el 2026-08-06).

## Siguiente objetivo
**No es Finanzas — instrucción explícita de la usuaria.** El siguiente objetivo es cargar el HOTO real de D-AFBS (viene de un PDF con una estructura algo distinta al HOTO anterior): primero comparar ambos formatos y diseñar cómo preservar todos los datos relevantes sin contaminar el modelo actual, antes de escribir nada. Antes de eso, confirmar visualmente contra la URL pública de Vercel (no solo un servidor de desarrollo local) que el fix de D15 está realmente desplegado y que D-AFBS aparece limpio en todas las pantallas — la sesión de D15 no tuvo acceso directo a esa URL, solo a un servidor local apuntando a la Supabase real (funcionalmente equivalente, pero no idéntico a verificar el bundle público). Resto de pendientes sin cambios: cron de sueño de las 08:00 (verificar su primera ejecución real del 2026-08-07), rotación de `ANTHROPIC_API_KEY` (`SECURITY.md` riesgo #9), `SECURITY.md` riesgo #10.
