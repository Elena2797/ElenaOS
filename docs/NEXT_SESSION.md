Última actualización: 2026-07-10 — handoff corto, no histórico acumulativo (para eso está CHANGELOG.md)

# NEXT_SESSION.md

## Qué se terminó en esta sesión
Sistema `/docs` creado y ajustado (estructura, contenido y protocolo de cierre). Detalle completo en `CHANGELOG.md`, estado general en `CURRENT_STATE.md` — no se repite aquí.

## Qué quedó pendiente
Confirmar que la migración del checklist Daily Duties de HOTO llegó a Supabase en el móvil de la usuaria, y que el PDF exportado muestra los checkboxes correctos en la columna de CH activa (detalle técnico en `modules/VISTAJET_HOTO.md`).

## Qué debe hacerse inmediatamente después
Nada asignado por la usuaria. Si retoma el desarrollo, verificar primero el pendiente de arriba antes de asumir que HOTO está cerrado del todo.

## Qué no debe romperse
- Ningún cambio de esquema en Supabase sin protocolo antes/después (`PRINCIPLES.md` #5 y #7).
- Los documentos de la raíz del proyecto (`VISION.md`, `ISABEL_CORE.md`, etc.) no se editan desde `/docs`.
- HOTO e Inventario de producción contienen datos reales de rotaciones reales — cualquier escritura sigue el patrón dry-run + verificación de `modules/VISTAJET_INVENTORY.md` y `VISTAJET_HOTO.md`.

## Qué documentos debe leer el siguiente chat
`README.md` → `CURRENT_STATE.md` → este documento → `modules/VISTAJET_HOTO.md` si retoma el pendiente de arriba, o el módulo específico de la tarea que traiga.
