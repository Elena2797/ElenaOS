Estado: implementado
Última verificación: 2026-08-02
Verificado en: migraciones SQL de ambos repos, muestreo real vía REST, e incidente real de proyecto pausado diagnosticado y resuelto el 2026-08-02
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

## Si el proyecto parece caído: comprobar pausa antes que nada

Incidente real del 2026-08-02: el proyecto se había pausado (probable pausa automática por inactividad del plan gratuito). El síntoma en la app **no fue un error HTTP normal** (503, timeout) — el hostname `cllubptdwydifomlnxds.supabase.co` dejó de resolver en DNS por completo. En la UI esto se vio primero (antes del fix de esa misma sesión) como Dominios vacío sin ningún aviso; después del fix, como el banner "Sin conexión con los datos" con `TypeError: Failed to fetch` / `TypeError: Load failed` (Safari/iOS).

**Diagnóstico correcto, sin necesitar el dashboard:**
1. Resolver DNS del proyecto contra un resolver público (evita falsos negativos por red local/VPN/DNS del dispositivo):
   ```
   https://dns.google/resolve?name=cllubptdwydifomlnxds.supabase.co&type=A
   ```
   `"Status":3` = NXDOMAIN = el proyecto no resuelve (pausado o eliminado). `"Status":0` con `Answer` = resuelve con normalidad.
2. Si resuelve, probar la REST API directamente con la anon key (ver comando `curl` arriba) para confirmar que además de resolver, responde con datos reales.
3. Solo si ambos fallan tras confirmar que el resto de internet funciona con normalidad, se puede sospechar de un problema de red local en vez de Supabase.

**Solución si está pausado:** entrar a `supabase.com/dashboard`, localizar el proyecto (puede tardar unos segundos en aparecer si el dashboard también estaba cacheando el estado), y usar la opción de reactivar/restaurar si aparece marcado como pausado. Verificar después con los pasos 1-2 antes de dar el incidente por cerrado.
