Última actualización: 2026-09-21, última hora — hábitos con racha (D52)

# Próxima sesión

El relevo anterior (2026-08-10, ventana O4) está en `archive/NEXT_SESSION_2026-08-10.md`: ya no aplica.

## 1. Qué se terminó en esta sesión

- **Isabel lee su Gmail y su Google Calendar** (D51). App de Google "En producción", cuenta conectada y verificada, 34 tools en el Gateway.
- **Solo correo de personas:** fuera la publicidad, aunque Gmail la tenga en Principal (`Feedback-ID`, `List-Unsubscribe`).
- **Hueco de seguridad cerrado** (SECURITY.md #12): con la API key pública de la app se podía leer su Gmail y enviar correos en su nombre. Ahora el correo y la agenda solo existen con la llave privada del Gateway.
- **Mensajes de coach ampliados:** 08:30 con agenda, correos importantes y rachas; 17:00 con la racha en juego; 21:30 con lo no contestado y los hábitos.
- **Hábitos con racha** (D52): leer, escribir y gym, también en la tarjeta 🌱 Hábitos de la app. 36 tools.
- **Informe de presupuesto con el gasto real de OpenRouter** (`isabel-api` `993c98e`; cómo ejecutarlo, en la cabecera de `scripts/budget-status.mjs`).
- **OAuth viejo de Gmail retirado de Vercel.**

## 2. Qué quedó pendiente

- **Verificar los disparos:** 21:30 del 2026-09-21 (primer cierre con correo), y el 2026-09-22 el sueño de las 08:00 (primero con DeepSeek, antes fallaba por el proxy), el parte de las 08:30 (primero con agenda y correo) y el empujón de las 17:00 (el del día 21 lo cortó un reinicio del Gateway y no llegó). Cómo: `openclaw cron list --json` como `node` en el Gateway, campo `state`.
- **Prueba con ella por Telegram** (correos importantes, sin contestar, un borrador, un evento): lanzada el día 21, sin confirmar el resultado aquí.
- ¿Usa otro calendario además del principal? Hoy solo se lee `primary`, y no tiene nada en los próximos 7 días.
- Borrar el cliente de Google "Cliente web 1" (junio), el primer secreto del cliente nuevo (`****xmwJ`, que nadie guardó) y la tabla vacía `gmail_tokens`. Preguntarle antes: son cambios en su Google Cloud y en su Supabase.
- En los logs del Gateway sale `[memory] sync failed … No API key found for provider openai` (memory-core): la búsqueda de memoria de OpenClaw pide embeddings de OpenAI y no hay clave. Nadie lo ha investigado aún.
- El guard O5 (`o5DisconnectedGuard.test.js`) falla en `main` desde `1e19184` (Outlook, de otra sesión): cambió `src/index.js` sin mover su checkpoint. Lo tiene que revisar quien hizo ese cambio.
- Lo que ella dejó en cola: activar el aprendizaje y seguimiento (O5) y unir `docs/incidente-saldo` a `main` (preguntarle antes). O5 está construido y desconectado a propósito; su plan escrito es un canary reversible (`LIFEOS_KNOWLEDGE_STAGE`), no activarlo entero. Ver `core/KNOWLEDGE_LOOP.md` y `core/ADR_O5_FOLLOW_UP_CLOSED_LOOP.md`.

## 3. Qué hacer inmediatamente después

1. Mirar el `state` de los cron de coach y de sueño (ver arriba) y decírselo a ella en corto.
2. Si ella lo pide, O5 por su canary.

## 4. Qué no debe romperse

- **Nunca `railway up` desde `isabel-api`** si hay más de una sesión: publica también el trabajo a medias de las otras. El despliegue sale de los push a `main` en GitHub. Para subir solo lo tuyo, usa un worktree limpio de `origin/main`.
- **No reiniciar el Gateway a la hora de un cron** (08:00, 08:30, 17:00, 21:30 Madrid): el mensaje en curso se corta y no se reintenta.
- `MCP_PRIVATE_KEY` (isabel-api) e `ISABEL_MCP_KEY` (Gateway) son la misma llave. Si no coinciden, Isabel pierde el correo y la agenda. `openclaw.json` la referencia como `${ISABEL_MCP_KEY}`, no como valor.
- La app de Google tiene que seguir "En producción": en "Prueba" el permiso caduca a los 7 días (error `google_reauth_required`).
- Ejecutar `openclaw` en el contenedor siempre como `runuser -u node --`. Desde Git Bash, `MSYS_NO_PATHCONV=1`, o las rutas `/tmp/...` llegan cambiadas.

## 5. Qué documentos leer

`CURRENT_STATE.md` → `DECISIONS.md` D49 a D52 → `SECURITY.md` #2 y #12 → `isabel-gateway/README.md` (variables y SSH).
