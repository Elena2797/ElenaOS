Estado: conocimiento vigente — se añade cronológicamente, nunca se reescribe
Última verificación: 2026-07-10
Verificado en: git log de isabel-api y life-os-app
Fuente de verdad de datos: ninguna

# CHANGELOG.md — Historial relevante

No es un espejo del `git log` completo (para eso, `git log` en cada repo). Aquí solo lo que un chat nuevo necesita saber para entender por qué el sistema está como está.

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
