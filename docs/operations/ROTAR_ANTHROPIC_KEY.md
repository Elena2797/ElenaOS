Estado: COMPLETADA — `97e63348…` ya revocada (Anthropic responde 401 el 2026-09-21); la nueva `d7ff29a1…` (consola: `YDt…LQAA`) solo en isabel-api, **caduca el 2026-10-20**
Última verificación: 2026-09-21
Verificado en: escaneo de credenciales por huella SHA-256 sobre disco local, `.codex`, backups y los 4 servicios Railway, sin exponer valores
Fuente de verdad de datos: ninguna

# operations/ROTAR_ANTHROPIC_KEY.md — Runbook de rotación

> **2026-09-21:** pasos 1–4 cumplidos. El Gateway también guardaba la clave vieja en su almacén de
> perfiles de OpenClaw, que manda sobre la variable: ya sustituida por el token del proxy (ver
> `INCIDENTE_SALDO_2026-08-11.md` §12, incluido cómo rotar ese token en el futuro). El paso 5 también: la clave expuesta ya devuelve `401 invalid`. Quedan en la consola dos claves de
> junio (`CTg…jAAA` y `LIFE OS 98_…xwAA`) que **ningún componente de LIFEOS usa**.

## Por qué, actualizado el 2026-09-20

`SECURITY.md` #9 documenta que esta clave apareció **en texto plano en la salida de un chat el 2026-08-06**, y el 2026-08-07 se sumó una exposición parcial del prefijo. El runbook de agosto anotó su huella: `97e63348`.

El escaneo del **2026-09-20 encuentra exactamente esa misma huella**. La rotación nunca se ejecutó: **la clave expuesta hace seis semanas sigue siendo la clave de producción.** Esto no es un riesgo teórico — es una credencial pública en circulación, y es una explicación candidata para cualquier gasto que la reconciliación no consiga atribuir.

## Dónde está la clave hoy — inventario completo

Una sola credencial (huella `97e63348…`, 108 caracteres) copiada en **seis** sitios. No hay una segunda clave en ningún sitio.

| # | Ubicación | Tipo | ¿La necesita? | Acción en la rotación |
|---|---|---|---|---|
| 1 | Railway `laudable-consideration` → `isabel-api` | variable | **Sí** — es el punto de salida autorizado | **Clave nueva** |
| 2 | Railway `laudable-consideration` → `isabel-gateway` (NUEVO) | variable | No, si se activa el proxy (`/ai/v1/messages`) | **Token de proxy**, no la clave |
| 3 | Railway `laudable-consideration` → `faithful-light` | variable | **No** — servicio huérfano, Offline | **Borrar la variable** |
| 4 | Railway `isabel-gateway` → `isabel-gateway` (ANTIGUO) | variable | **No** — detenido el 2026-09-20 por ser la causa del incidente | **Borrar la variable** |
| 5 | `isabel-api/.env` | fichero local | Solo para desarrollo | Sustituir por la nueva **solo si se desarrolla en local** |
| 6 | `isabel-api-vj-landing-cleaning/.env` | fichero local | **No** — worktree de una rama vieja | **Borrar la línea** |

**No verificado:** Vercel. `life-os-app/api/chat.js` lee `process.env.ANTHROPIC_API_KEY` y **está desplegada y viva** (`https://elena-os-wheat.vercel.app/api/chat` responde 405, no 404). Si esa variable existe en Vercel, hay una **séptima copia** en un endpoint público sin autenticación. Hay que mirarlo en el dashboard de Vercel antes de dar el inventario por cerrado. Ver `INCIDENTE_SALDO_2026-08-11.md` §4.

## Principio de la rotación

> La clave nueva va a **un solo sitio**: el punto de salida autorizado.

Todo lo demás —Gateway, crons, Telegram, procesos locales— habla con Anthropic **a través** de `isabel-api`, con un token de proxy que no vale nada en Anthropic. Repartir la clave nueva por los mismos seis sitios sería reconstruir el problema con otro número.

Si algún consumidor resulta que técnicamente necesita acceso directo, **no se le da**: se documenta la incompatibilidad y se deja apagado hasta resolverla.

## Secuencia — NO EJECUTADA, requiere tu autorización paso a paso

Anthropic no expone gestión de claves por API: solo por consola. Y la clave nueva **no debe pasar por ningún chat**, incluido este. Sería repetir exactamente el incidente que estamos arreglando.

### Paso 0 — Antes de tocar nada

Comprobar en Vercel si existe `ANTHROPIC_API_KEY` en el proyecto de `life-os-app`. Si existe: borrarla, o borrar `api/chat.js` y redesplegar. Mientras esa función viva con clave, cualquiera puede gastar.

### Paso 1 — Quitar las copias que no hacen falta (no rompe nada)

```bash
railway variables delete ANTHROPIC_API_KEY --service faithful-light --project 1fcded21-0207-405b-bb63-9ec60f640936
```

```bash
railway variables delete ANTHROPIC_API_KEY --service cd32538e-6987-422c-9240-62e30685d1cc --project 5e147723-afa6-4669-b79b-3b970d83455a
```

El segundo es el Gateway antiguo, ya detenido. Quitarle la clave hace que, si alguien lo redesplegara por accidente, **no pueda gastar**.

### Paso 2 — Crear la clave nueva

`console.anthropic.com` → Settings → API Keys → crear `lifeos-prod-<fecha>`. **No pegarla en ningún chat.**

Pegarla en Railway, en el dashboard, **solo** en:
`laudable-consideration` → `isabel-api` → `ANTHROPIC_API_KEY`.

Cambiar la variable exige `railway redeploy`, no `restart`: `restart` reutiliza el entorno ya construido y no inyecta variables nuevas.

### Paso 3 — Dar al Gateway un token que no sea la clave

En `laudable-consideration` → `isabel-gateway`, **sustituir** el valor de `ANTHROPIC_API_KEY` por el token del proxy (`AI_PROXY_TOKEN`, un secreto cualquiera generado al azar, distinto de la clave). Y en su `openclaw.json`:

```json
"models": {
  "providers": {
    "anthropic": {
      "baseUrl": "https://isabel-api-production.up.railway.app/ai",
      "apiKey": "${ANTHROPIC_API_KEY}",
      "headers": { "x-lifeos-route": "gateway.agent_turn.telegram" }
    }
  }
}
```

A partir de ahí, cada turno del agente pasa por el presupuesto. Verificado en la versión de OpenClaw instalada (2026.6.10): `models.providers.<id>.baseUrl` se pasa tal cual como `baseURL` al SDK de Anthropic.

### Paso 4 — Verificar antes de revocar

- `npm run budget:status` en isabel-api → dice qué autorizaría y por qué.
- Huellas de la variable en los cuatro servicios: la nueva **solo** en `isabel-api`; en el resto, distinta o ausente.
- Una sola llamada real controlada (ver `INCIDENTE_SALDO_2026-08-11.md` §7, paso 5).

### Paso 5 — Revocar la antigua

Solo cuando el paso 4 esté verde: `console.anthropic.com` → revocar `97e63348…`.

Revocar antes deja el sistema sin Isabel y sin rollback a la vez. Revocar después de verificar es lo que convierte las cinco copias restantes en papel mojado — que es el objetivo real de todo esto.

## Verificación posterior (la ejecuto yo cuando me avises)

- Huellas SHA-256 de `ANTHROPIC_API_KEY` en los 4 servicios: distintas de `97e63348`, y presente en uno solo.
- `POST /ai/v1/messages` con el token de proxy y ruta declarada → autoriza; sin ruta → 403.
- `POST` al proxy con el presupuesto agotado → 400 terminal, **sin** petición saliente.
- `npm test` y `npm run audit:paid-routes` en verde.
