Última actualización: 2026-08-06 — handoff corto, no histórico acumulativo (para eso está CHANGELOG.md)

# NEXT_SESSION.md

## Qué se terminó en esta sesión
**Bug real de producción diagnosticado y corregido de punta a punta (D14).** La usuaria reportó que, tras cambiar de avión por Telegram (Isabel confirmó "avión actualizado a D-AFBS"), LIFEOS seguía mostrando el contexto completo del avión anterior (9H-VCQ) como si fuera el actual. Se investigó la causa real en vez de parchear la pantalla: `vj_state` — documentada siempre como singleton — había acumulado 3 filas en producción (`setup.sql` tenía un `INSERT` sin guarda de idempotencia, reejecutado en más de una sesión), y ninguna de las dos lecturas (frontend `db.js`, backend `vistajet.js`) llevaba `ORDER BY`, así que Postgres no garantizaba qué fila devolvía cada vez — Isabel y el frontend leían filas distintas de "la misma" tabla. Auditoría adicional encontró el mismo patrón (reutilizar el dato más reciente sin comprobar el avión) en tres sitios que D13 no había tocado: la pantalla viva de HOTO (`vjHotoView`/`hotoReload`), Laundry & Cleaning, e Inventario (`loadLastSession`/`loadActiveSession`). Todo corregido: datos reconciliados en Supabase (2 filas sobrantes de `vj_state` borradas sin pérdida de dato; HOTO histórico de 9H-VCQ cerrado con su `delivered_at` real, 2026-07-10, provisto por la usuaria); código corregido en ambos repos; `vj_state_singleton_migration_v1.sql` creada (índice único, pendiente de ejecución manual); frontend ahora refresca `vj_state` al entrar/volver a VistaJet y converge sin recargar la app (verificado en vivo simulando una escritura de Telegram con la app abierta). 10 tests nuevos (187/187), verificado contra Supabase real y en navegador. Ambos repos commiteados y pusheados a `main` (Railway/Vercel despliegan automáticamente). Detalle completo en `DECISIONS.md` D14, `CHANGELOG.md`, `KNOWN_PROBLEMS.md`.

## Qué quedó pendiente
1. **Ejecutar `vj_state_singleton_migration_v1.sql` en el SQL editor de Supabase** — añade `CREATE UNIQUE INDEX ON vj_state ((true))`, la garantía real a nivel de DB de que no puede volver a haber más de una fila. Sin esto, la reconciliación de hoy es puntual, no estructural. No se pudo ejecutar por Claude — no hay mecanismo programático de DDL en este proyecto (mismo motivo que `hoto_migration_v4.sql`, D13, sigue sin ejecutar).
2. **Verificar que el deploy de Vercel/Railway recogió los commits de hoy** (`isabel-api` `ace560b`, `life-os-app` `d4e3f86`) — se pusheó a `main` y ambos servicios tienen auto-deploy activado, pero no se confirmó con una visita directa al dominio de producción de Vercel (solo se verificó contra un servidor de desarrollo local apuntando a la Supabase real, y contra `isabel-api` corriendo localmente contra la Supabase real — funcionalmente equivalente, pero no es lo mismo que abrir la URL pública).
3. Resto de pendientes sin cambios desde la sesión anterior: cron de sueño de las 08:00 (verificar su primera ejecución real del 2026-08-07), rotación de `ANTHROPIC_API_KEY` (`SECURITY.md` riesgo #9), `SECURITY.md` riesgo #10 (secretos en texto plano en el volumen de `isabel-gateway`).

## Qué debe hacerse inmediatamente después
Ejecutar `vj_state_singleton_migration_v1.sql` (y de paso comprobar si `hoto_migration_v4.sql` también sigue pendiente) la próxima vez que se entre al SQL editor de Supabase. Después, confirmar visualmente contra la URL pública de Vercel que D-AFBS aparece como avión actual sin rastro de 9H-VCQ.

## Qué no debe romperse
- El HOTO de 9H-VCQ (`status:'delivered'`, `delivered_at:'2026-07-10'`) no se toca — su histórico (items, checklist, shopping) es real y quedó intacto durante la reconciliación.
- `vj_state` debe seguir teniendo exactamente 1 fila. Si un futuro script necesita "resetear" el estado operativo, debe hacer `UPDATE`, nunca `INSERT` — el `setup.sql` ya arreglado es solo para recrear el esquema desde cero, no para usarse como reset.
- No reasignar el `tail_number` de un HOTO histórico al avión nuevo — cada HOTO conserva su propia matrícula para siempre, aunque ya no sea el avión actual.
- No inventar `delivered_at` ni ninguna otra fecha real cuando falte — preguntar, como se hizo esta sesión.
- Los secretos (`ANTHROPIC_API_KEY`, `ISABEL_API_KEY`, `OPENCLAW_GATEWAY_TOKEN`, `TELEGRAM_BOT_TOKEN`) solo entran como variables de entorno en Railway — nunca en literales de config versionada.
- Ninguna migración DDL contra Supabase sin mostrar antes el SQL exacto y esperar aprobación explícita — seguido esta sesión (la usuaria aprobó explícitamente el borrado de las 2 filas de `vj_state` y el `delivered_at` del HOTO antes de tocar producción).
- No crear una segunda implementación paralela de Isabel.

## Qué documentos debe leer el siguiente chat
`README.md` → este documento → `CURRENT_STATE.md` → `DECISIONS.md` D14 (contexto completo del bug de hoy) → `modules/VISTAJET.md` (estado actualizado tras D14) → `KNOWN_PROBLEMS.md` (acción pendiente: la migración del índice único). `core/AUTOMATIONS.md` y `isabel-gateway/README.md` solo si hace falta tocar Telegram/cron, sin cambios esta sesión.
