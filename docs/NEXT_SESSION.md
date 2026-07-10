Última actualización: 2026-07-10 — este documento se reescribe cada sesión, no se acumula histórico aquí (para eso está CHANGELOG.md)

# NEXT_SESSION.md

## Última tarea terminada
Creación completa del sistema `/docs` como memoria persistente de LIFEOS: 34 documentos (11 raíz + 6 `core/` + 11 `modules/` + 5 `operations/` + 1 `archive/` — ver estructura exacta en `README.md`), basados en auditoría directa del código, migraciones y Supabase — no en asunción. Ajuste posterior: `SYSTEM_STATE.md` renombrado a `CURRENT_STATE.md` y reescrito a formato de 1 página (5 campos fijos), y formalización del comando único de cierre "Cerrar sesión de desarrollo" en `README.md`.

## Estado verificado
Todos los documentos escritos y con referencias cruzadas coherentes. Contenido basado en: lectura directa de `isabel-api/src/index.js` y `src/core/` (confirmando que Isabel Core NO está montado), `life-os-app/src/main.js` completo, las 5 migraciones SQL, muestreo real de tablas vía REST de Supabase, y el historial de commits de ambos repos hasta `89151ab` (isabel-api) / `f7d4f86` (life-os-app).

**Sin verificar todavía en la app real** (pendiente de una sesión anterior a esta documentación, no bloqueante para leer los docs): que la migración del checklist Daily Duties de HOTO llegó correctamente de localStorage a Supabase en el móvil de la usuaria, y que el PDF exportado muestra los checkboxes correctos en la columna de CH activa. Si la usuaria lo menciona, retomar desde `modules/VISTAJET_HOTO.md`.

## Tarea exacta siguiente
Ninguna asignada por la usuaria a fecha de esta actualización. Este chat deja de usarse para desarrollo a partir de ahora, según instrucción explícita — cualquier trabajo futuro empieza en una sesión nueva.

## Archivos que deben leerse
Para cualquier sesión nueva: `docs/README.md` → `docs/CURRENT_STATE.md` → este documento. Después, según la tarea, el documento específico que indica la tabla del README.

## Riesgos
- Ninguno de código pendiente de esta sesión — no se tocó código, solo `/docs`.
- Riesgo general y permanente: los 4 canales de Isabel (`core/ISABEL_CHANNELS.md`) son fácilmente confundibles — un chat nuevo puede asumir que "Isabel Core" está activo si no lee ese documento primero.

## Qué no debe tocarse sin instrucción explícita
- Ningún cambio de esquema en Supabase sin aprobación explícita y sin protocolo antes/después (ver `PRINCIPLES.md` #5 y #7).
- Los documentos de la raíz del proyecto (`VISION.md`, `ISABEL_CORE.md`, etc.) — son la capa de visión, no se editan desde `/docs`.
- El HOTO y el Inventario de producción contienen datos reales de rotaciones reales — cualquier escritura debe seguir el patrón de dry-run + verificación ya establecido en `modules/VISTAJET_INVENTORY.md` y `VISTAJET_HOTO.md`.
