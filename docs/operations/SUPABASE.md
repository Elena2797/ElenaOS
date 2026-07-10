Estado: implementado
Última verificación: 2026-07-10
Verificado en: migraciones SQL de ambos repos, muestreo real vía REST
Fuente de verdad de datos: DATA_MODEL.md

# operations/SUPABASE.md — Operar Supabase sin este chat

## Proyecto
`cllubptdwydifomlnxds` — un único proyecto Supabase para todo LIFEOS (sistema genérico + VistaJet + Finanzas).

## Cómo recrear el esquema desde cero
Ejecutar, en este orden, en el SQL editor de Supabase:
1. `life-os-app/setup.sql` — sistema genérico + `vj_state`/`vj_tasks`.
2. `life-os-app/migration_v1.sql` — proyectos, eventos, alertas.
3. `life-os-app/migration_v2.sql` — Inventario VistaJet.
4. `life-os-app/hoto_migration.sql` — HOTO.
5. `life-os-app/hoto_migration_v2.sql` — columna `daily_duties`.

**Esto NO recreará `transactions`, `metrics` ni `operators`** — no tienen `CREATE TABLE` versionado (ver KNOWN_PROBLEMS.md). Habría que reconstruirlas a mano con las columnas documentadas en DATA_MODEL.md.

## RLS
Desactivado en las 18 tablas, por diseño (app de un solo usuario). No reactivar sin registrar la decisión en DECISIONS.md y verificar que ningún flujo dependa de acceso sin políticas.

## Storage
Buckets confirmados por uso en código: `inventory-templates`, `hoto-templates`. No se pudo confirmar la lista completa de buckets vía API con la anon key (devolvió lista vacía — probablemente restringido a esa clave).

## Claves
- **anon key**: usada por el frontend (`life-os-app`), en `.env.local` como `VITE_SUPABASE_ANON_KEY`.
- **service_role key**: usada solo por el backend (`isabel-api`), en `.env` como `SUPABASE_SERVICE_KEY`. Nunca debe llegar al cliente.

## Cómo verificar el estado de una tabla sin acceso al dashboard
```bash
curl -s "https://cllubptdwydifomlnxds.supabase.co/rest/v1/NOMBRE_TABLA?select=*&limit=1" \
  -H "apikey: ANON_KEY" -H "authorization: Bearer ANON_KEY"
```
