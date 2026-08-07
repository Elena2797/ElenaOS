Estado: pendiente de la acción manual de la usuaria (crear la clave en el Console de Anthropic)
Última verificación: 2026-08-07
Verificado en: auditoría de variables de los 4 servicios Railway (huella SHA-256, sin exponer valores)
Fuente de verdad de datos: ninguna

# operations/ROTAR_ANTHROPIC_KEY.md — Runbook de rotación

## Por qué
`SECURITY.md` #9 documenta que la `ANTHROPIC_API_KEY` de producción apareció en texto plano en la salida de un chat el 2026-08-06. El 2026-08-07 se sumó una **exposición parcial adicional** (el prefijo de la clave se imprimió al capturar variables de `faithful-light`). Dos incidentes sobre la misma clave: se rota.

## Auditoría — quién la consume hoy
Las cuatro instancias comparten **la misma clave** (misma huella SHA-256, comprobado sin imprimir valores):

| Servicio | Proyecto | ¿La usa de verdad? | ¿Actualizar? |
|---|---|---|---|
| `isabel-api` | `laudable-consideration` | **Sí** — Haiku para `GET /v1/now` y el parseo de intención de Inventario | **Sí** |
| `isabel-gateway` | `laudable-consideration` (NEW) | **Sí** — es la auth del modelo del agente `main` (`DECISIONS.md` D11) | **Sí** |
| `isabel-gateway` | `isabel-gateway` (OLD) | Solo si se reactiva como rollback | **Sí** — si no, el rollback quedaría inservible al revocar la vieja |
| `faithful-light` | `laudable-consideration` | **No** — detenido y huérfano | **No.** Dejarlo sin clave válida es deseable: si alguien lo reactivara por error, no podría gastar |

**Cambiar la variable exige `railway redeploy`, no basta `restart`** — lección aprendida en el cutover de Telegram: `restart` reinicia el mismo deployment con su entorno ya construido y no inyecta variables nuevas.

## Lo que tienes que hacer tú (no puede hacerlo un chat)

Anthropic **no expone gestión de claves por API** — solo por consola. Y, deliberadamente, **la clave nueva no debe pasar por este chat**: sería repetir el incidente que estamos arreglando.

1. Entra en **console.anthropic.com → Settings → API Keys** y crea una clave nueva (p. ej. `lifeos-prod-20260807`). **No la pegues aquí.**
2. En **Railway**, pégala directamente en el dashboard, en `Variables`, para estos **tres** servicios:
   - proyecto `laudable-consideration` → servicio **`isabel-api`** → `ANTHROPIC_API_KEY`
   - proyecto `laudable-consideration` → servicio **`isabel-gateway`** → `ANTHROPIC_API_KEY`
   - proyecto `isabel-gateway` → servicio **`isabel-gateway`** (OLD, para conservar el rollback) → `ANTHROPIC_API_KEY`
3. Railway redesplegará al guardar. Avísame y ejecuto la verificación completa de abajo.
4. **Solo cuando yo confirme que todo pasa**, vuelve al Console de Anthropic y **revoca la clave antigua**.

No revoques la vieja antes del paso 4: si algo fallara, quedaríamos sin Isabel y sin rollback a la vez.

## Verificación (la ejecuto yo tras el paso 3)
- `GET /v1/now` de `isabel-api` responde `status: ok` con `headline` real (usa Haiku → prueba que la clave nueva funciona).
- `POST /v1/chat` responde (agente `main` con el modelo → prueba la clave en el Gateway).
- Turno de agente real vía MCP (`vistajet_get_status`) devuelve el avión correcto.
- `openclaw mcp doctor --probe` → `lifeos: ok`.
- Telegram responde a un mensaje real.
- `openclaw cron list` → `sleep-check-0800-madrid` enabled, con su `next run`.
- Huellas SHA-256 de la variable en los tres servicios: todas iguales entre sí y **distintas** de la anterior (`97e63348`) — así se demuestra que ninguno sigue con la vieja.

## Mejora recomendada para la próxima vez
Railway soporta **variables compartidas a nivel de proyecto** (`sharedVariableConfigure`). Con la clave definida una sola vez y referenciada por los servicios, una rotación futura sería un único cambio en vez de tres. **No se aplica ahora a propósito**: cambiar el mecanismo de resolución de la variable en mitad de una rotación introduciría una segunda variable en el experimento.
