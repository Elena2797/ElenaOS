Estado: este documento ES el estado — se reescribe en cada actualización
Última verificación: 2026-07-10
Verificado en: auditoría completa de código + Supabase realizada en esta sesión
Fuente de verdad de datos: ninguna (agrega, no duplica DATA_MODEL)

# SYSTEM_STATE.md — Foto del sistema ahora

## En producción, funcionando

| Pieza | Dónde | Nota |
|---|---|---|
| Frontend LIFEOS | Vercel, vía `life-os-app` | app principal, PWA |
| isabel-api | Railway | solo Inventario y HOTO |
| Inventario VistaJet | ambos repos | sesiones, parser de lote, export Excel + UPLIFT |
| HOTO VistaJet | ambos repos | modelo vivo, export PDF oficial, Daily Duties recién conectado |
| Aircraft Readiness | `life-os-app` | evaluación real desde HOTO/Inventario/Laundry/tareas |
| Sistema genérico (tareas, áreas, decisiones, alertas, proyectos) | `life-os-app` ↔ Supabase directo | sin backend intermedio |
| Finanzas | `life-os-app` ↔ Supabase directo | 821 transacciones reales importadas, sin lógica de dominio |

## Roto o incompleto

- El **checklist Daily Duties del HOTO** acaba de conectarse (2026-07-10) — pendiente de que la usuaria confirme en su móvil que la migración de sus ticks locales llegó a Supabase.
- **Gmail OAuth**: código completo, cero conexión con el frontend.
- **`.env.example` de `life-os-app`**: incompleto (faltan variables de Isabel).

## Bloqueado / sin decisión

- El plan de fusión de `ARQUITECTURA_FUSION.md` (Isabel Core como orquestador único) — sin avanzar desde 2026-07-07, sin que se haya decidido retomarlo o descartarlo.
- Qué hacer con los 4 canales de Isabel (ver `core/ISABEL_CHANNELS.md`) — ninguna decisión tomada sobre consolidar o eliminar los que no están en uso.

## Estado por módulo

| Módulo | Estado | Documento |
|---|---|---|
| VistaJet · Inventario | implementado | [modules/VISTAJET_INVENTORY.md](modules/VISTAJET_INVENTORY.md) |
| VistaJet · HOTO | implementado, con gaps documentados | [modules/VISTAJET_HOTO.md](modules/VISTAJET_HOTO.md) |
| VistaJet · Laundry | implementado mínimo (localStorage) | [modules/VISTAJET_LAUNDRY.md](modules/VISTAJET_LAUNDRY.md) |
| VistaJet · Fresh | implementado mínimo | [modules/VISTAJET_FRESH.md](modules/VISTAJET_FRESH.md) |
| Aircraft Readiness | implementado | [modules/AIRCRAFT_READINESS.md](modules/AIRCRAFT_READINESS.md) |
| Finanzas | datos reales, sin módulo de dominio | [modules/FINANCE.md](modules/FINANCE.md) |
| JETMI | área genérica, placeholder | [modules/JETMI.md](modules/JETMI.md) |
| Salud / Gym | área genérica, placeholder | [modules/HEALTH_AND_GYM.md](modules/HEALTH_AND_GYM.md) |
| Marca Personal | área genérica, placeholder | [modules/PERSONAL_BRAND.md](modules/PERSONAL_BRAND.md) |
| Vida Personal | área genérica, placeholder | [modules/PERSONAL_LIFE.md](modules/PERSONAL_LIFE.md) |

## Versiones / servicios activos
- isabel-api: commit `89151ab` en producción (Railway).
- life-os-app: commit `f7d4f86` en producción (Vercel).
- Supabase: proyecto `cllubptdwydifomlnxds`, RLS desactivado en las 18 tablas.

## Ver también
- [KNOWN_PROBLEMS.md](KNOWN_PROBLEMS.md) para deuda técnica detallada.
- [core/ISABEL_CHANNELS.md](core/ISABEL_CHANNELS.md) para el estado exacto de cada canal de Isabel.
