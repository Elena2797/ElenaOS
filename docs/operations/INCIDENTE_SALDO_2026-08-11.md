Estado: fuga detenida; control construido y probado; **sin desplegar**
Última verificación: 2026-09-20
Verificado en: Railway (4 servicios, por ID), volúmenes OpenClaw, procesos Windows, escaneo de credenciales por huella, `npm test` 601/601
Fuente de verdad de datos: `ai_budget_state` (una vez aplicada la migración) y la consola de Anthropic para el gasto real

# Incidente de saldo del 2026-08-11 — causa, saneamiento y reactivación

> **Estado a 2026-09-20: NOT READY TO RECHARGE.** La fuga está cortada, pero el
> Gateway productivo sigue teniendo la clave y sigue intentando una llamada de
> pago cada día. Ver §8.

## 1. Qué pasó, en una frase

El heartbeat de OpenClaw **nunca se apagó**: se apagó en el Gateway nuevo y siguió vivo en el
Gateway antiguo del proyecto Railway `isabel-gateway`, con la misma `ANTHROPIC_API_KEY`,
despertando al agente **48 veces al día** contra `claude-sonnet-4-6`. Ese proceso no aparecía en
ningún mapa, y O4 no podía verlo porque solo barre el Gateway nuevo.

## 2. Evidencia

Capturada antes de detener el servicio; copia en `scratchpad/evidencia/heartbeat-antiguo.txt`.

| Hecho | Cómo se comprobó |
|---|---|
| El Gateway antiguo seguía `Online` el 2026-09-20 | `railway status`, proyecto `isabel-gateway` |
| Heartbeat cada 30 min, hasta el final | **2.128** mensajes `[OpenClaw heartbeat poll]`; último `2026-09-20T16:17:57Z` |
| Clave compartida | huella SHA-256 idéntica (`97e63348…`) en los 4 servicios Railway |
| Último turno que sí cobró | `2026-08-11T02:17:58.675Z`, `cacheWrite: 28.956` tokens |
| Desde entonces todo falla igual | `"Your credit balance is too low…"`, `stopReason: error`, usage 0 |
| Hubo un agotamiento anterior | primer error `2026-08-07T22:17:57Z`; los turnos vuelven a cobrar entre `2026-08-08T13:47Z` y `14:17Z` → **la recarga fue ahí** |

### Coste reconstruido del heartbeat huérfano

Estimado con la tabla de precios del propio proyecto (Sonnet 4.6: 3 $/Mtok entrada, escritura de
caché ×1,25). **No es una factura.**

| Día | Turnos | Caché escrita | Coste estimado |
|---|---:|---:|---:|
| 2026-08-07 | 57 | 713.168 | $2,67 |
| 2026-08-08 | 59 | 545.082 | $2,04 |
| 2026-08-09 | 51 | 1.362.039 | **$5,11** |
| 2026-08-10 | 49 | 1.372.402 | **$5,15** |
| 2026-08-11 | 49 (5 con tokens) | 144.740 | $0,54 |
| desde 08-12 | 48/día | 0 | $0 |

El 9 y el 10 —**justo después** de declarar el heartbeat muerto— este proceso gastó **$10,26**. Cada
poll escribía ~29.000 tokens de caché para responder 8 (`HEARTBEAT_OK`). Contando solo entrada y
salida parecía gratis.

### Reconciliación de la ventana recarga → agotamiento

Recarga ≈ `2026-08-08T14:00Z` → agotamiento `2026-08-11T02:18Z` (60 h 18 min).

| Origen | Coste estimado | Visible en O4 |
|---|---:|:--:|
| Heartbeat del Gateway antiguo | ≈ $13,1 | **no** |
| Gateway nuevo + isabel-api | $2,27 – $4,97 | sí |
| **Total interno** | **≈ $15,4 – $18,1** | — |

Consistente con "recargué unos 20 €". **La diferencia exacta sigue abierta**: hace falta la consola
de Anthropic (§9).

## 3. Por qué el control que había no lo impidió

1. **O4 mide después de pagar.** Descubre turnos leyendo el historial; para entonces el cargo existe.
2. **O4 solo barre lo que conoce.** El Gateway antiguo no estaba en `GATEWAY_SESSION_KEYS`.
3. **Un fallo se registra como éxito.** Los turnos sin saldo quedan como `status: success, $0`.
   Desde el 11/08, O4 dice "$0/día" y es verdad en el sentido equivocado: no es que no se gaste, es
   que no se puede.
4. **OpenClaw nunca reporta coste.** Todos los turnos traen `cost.total: 0`; cada cifra de O4 es una
   estimación de la tabla local.
5. **`aiGuard` protege solo el tick proactivo** y depende de que cada sitio llame a `countLlmCall()`.

## 4. Mapa de rutas de pago — estado a 2026-09-20

| # | Ruta | Credencial | Disparo | Estado |
|---|---|---|---|---|
| 1 | Telegram → agente (Gateway nuevo) | clave real | usuaria | **VIVA**, falla por saldo |
| 2 | cron `sleep-check-0800-madrid` | clave real | 06:00 UTC diario | **VIVA** — disparó hoy 2026-09-20T06:00 |
| 3 | `POST /v1/chat` → agente | clave real | usuaria | viva |
| 4 | Model Router (specialists) | clave real | specialist | viva — **con gate** (sin desplegar) |
| 5 | `generalHandler` | clave real | huérfano | **con gate** (sin desplegar) |
| 6 | `intentRouter` | clave real | huérfano | **con gate** (sin desplegar) |
| 7 | heartbeat Gateway antiguo | clave real | cada 30 min | **DETENIDA 2026-09-20** |
| 8 | Gateway local (portátil) | Claude CLI (suscripción) | Telegram bot `8531664156` | **DETENIDA 2026-09-20** |
| 9 | `isabel-bridge.js` :3001 | Claude CLI | HTTP local | **DETENIDA 2026-09-20** |
| 10 | **Vercel `/api/chat`** | `ANTHROPIC_API_KEY` de Vercel | **POST público, sin auth** | **VIVA — NO VERIFICADA** |
| 11 | `lifeos-agent` | — | — | detenido desde junio |

### La ruta 10 merece párrafo propio

`life-os-app/api/chat.js` es una función serverless que llama a Anthropic con
`process.env.ANTHROPIC_API_KEY` y **no comprueba ninguna autenticación**: lee `req.body` y llama al
modelo. La documentación la daba por inactiva ("si `api/chat.js` se activara…"). No lo está:

```
https://elena-os-wheat.vercel.app/api/chat   → 405   (la función existe)
https://elena-os-wheat.vercel.app/api/xxxxx  → 404   (una que no existe)
```

Si Vercel tiene `ANTHROPIC_API_KEY` configurada, **cualquiera que conozca esa URL puede gastar el
saldo sin límite**. No se ha comprobado porque no hay acceso a Vercel desde aquí, y **no se ha
probado con un POST** porque eso sería una llamada de pago. Queda como **NO VERIFICADO** y es la
primera cosa que hay que mirar.

## 5. Credenciales — inventario completo

Una sola clave (huella `97e63348…`, 108 caracteres) en **seis** ubicaciones confirmadas, más una sin
verificar. No existe una segunda credencial de ningún proveedor.

Es **la misma clave que `SECURITY.md` #9 da por expuesta en texto plano desde el 2026-08-06**. La
rotación se documentó en agosto y nunca se ejecutó. Detalle y procedimiento: `ROTAR_ANTHROPIC_KEY.md`.

## 6. Qué se detuvo el 2026-09-20

| Acción | Cómo | Verificación |
|---|---|---|
| Gateway antiguo | `railway down` con **project ID y service ID** (hay dos servicios con el mismo nombre en proyectos distintos) | `○ Offline`, ningún deployment `SUCCESS`, sin reinicio 25 min después |
| Tarea programada Windows | `Disable-ScheduledTask "OpenClaw Gateway"` | `State: Disabled` |
| Gateway local PID 11892 | `Stop-Process` tras verificar la línea de comandos exacta | puerto 18789 libre |
| `isabel-bridge.js` PID 9476 | `Stop-Process` tras comprobar su función | puerto 3001 libre |

Nada se borró: servicio, volumen (293 MB), tarea programada y ficheros siguen ahí. Revertir es
redesplegar / `Enable-ScheduledTask` / `Arrancar Isabel.bat`.

El Gateway antiguo no tiene origen git (`repo: None`), así que un push no puede redesplegarlo.
Tenía además un dominio público (`isabel-gateway-production.up.railway.app`) que respondía 502
porque OpenClaw escucha en loopback — no era alcanzable desde fuera, pero conviene quitarlo.

## 7. El control de gasto

`isabel-api/src/core/budget/` — punto único de autorización. **Nada de esto está desplegado.**

| Pieza | Qué garantiza |
|---|---|
| `prices.js` | Precio desconocido → no se autoriza. Con fecha de verificación. |
| `fx.js` | 20 € no son 20 $. Unidad contable interna: dólar. Sin tipo de cambio **declarado y fechado**, no se autoriza nada. |
| `policy.js` | Presupuesto, reserva protegida, topes por llamada/tarea, concurrencia, TTL, reintentos. Falta una variable → bloqueo total. |
| `ledger.js` | Reserva **antes** de llamar; liquida con el coste real; reserva caducada se **cobra entera**. |
| `remoteLedger.js` + migración | Libro mayor **compartido**: la atomicidad la garantiza Postgres con `FOR UPDATE`. |
| `store.js` | Variante local: escritura atómica y mutex. Solo válida con un proceso. |
| `killSwitch.js` | Freno independiente, por variable **o** por fichero. No necesita desplegar. |
| `gate.js` | Orden: kill switch → ruta declarada → reintentos → tope de salida → precio → **reserva** → llamada → liquidación. |
| `registry.js` | Inventario de rutas. Una ruta no declarada no puede cobrar. |
| `gatedProvider.js` / `gatedAnthropic.js` | Envuelven el Model Router y los dos clientes sueltos. |
| `routes/aiProxy.js` | **La pieza que cierra el agujero**: salida única para los turnos de OpenClaw. |
| `scripts/audit-paid-routes.mjs` | Falla el build si aparece una ruta de pago sin gate. Se ejecuta dentro de `npm test`. |

### El proxy, que es lo que de verdad cierra el bypass

```
OpenClaw ──HTTP──> isabel-api /ai/v1/messages ──HTTP──> api.anthropic.com
         token de proxy        reserva + gate           clave REAL
```

OpenClaw admite `models.providers.anthropic.baseUrl` (verificado en la versión 2026.6.10: el valor
se pasa tal cual como `baseURL` al SDK). Apuntándolo a isabel-api, el Gateway deja de necesitar la
clave: su `ANTHROPIC_API_KEY` pasa a ser un token que no vale nada en Anthropic, y **la clave real
existe en un solo sitio**. El rechazo por presupuesto se devuelve como `invalid_request_error`, que
en el SDK es terminal: OpenClaw no reintenta en bucle.

Se monta solo con `AI_PROXY_ENABLED=true`. Sin esa variable, un despliegue no cambia nada.

### Persistencia: el FAIL que había y cómo se arregló

`isabel-api` **no tiene volumen** (`railway volume list`, 2026-09-20). Un `AI_BUDGET_STATE_FILE` allí
vive en disco efímero: **el gasto del mes se reiniciaría en cada despliegue**, y dos réplicas podrían
reservar el mismo dinero. Un presupuesto así es decorativo.

Por eso `policy.js` **rechaza** un almacén efímero salvo declaración expresa
(`AI_BUDGET_ALLOW_EPHEMERAL_STORE=true`), y existe `remoteLedger.js` con la migración
`migrations/ai_budget_ledger.sql` (**sin aplicar**).

**Lo que está demostrado y lo que no:** las pruebas demuestran que dos ledgers independientes
—dos réplicas simuladas— contra el mismo almacén no pueden reservar el mismo dinero, y que cada
operación viaja como una sola llamada indivisible. **No demuestran** que el `FOR UPDATE` real de
Postgres se comporte así: eso solo queda demostrado aplicando la migración y probándola contra la
base de datos. Hasta entonces, criterio G = **implementado, no verificado**.

### Pruebas

**601/601** en `npm test` (56 de presupuesto + 16 del proxy + 529 previas). Coste: **$0** — ninguna
toca la red. Cubren: saldo cero, presupuesto agotado, presupuesto desconocido, precios desconocidos,
divisa sin tipo de cambio, tipo de cambio caducado, falta de telemetría, 2 y 10 llamadas simultáneas,
dos instancias, reinicio, crash antes y después de autorizar, reintentos, cron inesperado, ruta
desconocida, coste real mayor que el estimado, reserva caducada, timeout, proveedor inaccesible,
ledger caído y kill switch.

## 8. Lo que sigue vivo y por qué NOT READY TO RECHARGE

1. **El Gateway productivo conserva la clave** y dispara el cron de sueño cada día. Si recargas hoy,
   mañana a las 08:00 vuelve a gastar. El proxy existe pero **no está desplegado ni configurado**.
2. **La ruta de Vercel no está verificada.** Podría ser un endpoint de gasto público y anónimo.
3. **La clave lleva expuesta desde el 2026-08-06** y no se ha rotado.
4. **La migración del ledger compartido no está aplicada**, así que no hay presupuesto persistente.
5. **Nada del control está desplegado.** Hoy vive solo en el repositorio local, sin commitear.
6. **`faithful-light`** está Offline pero conserva la clave.
7. **O4 sigue registrando fallos como éxitos** con coste $0.

## 9. Lo que necesito de ti para cerrar la reconciliación

De la consola de Anthropic (**no me mandes claves ni datos bancarios**):

- fecha e importe exactos de la recarga de agosto;
- consumo diario del 1 al 11 de agosto;
- movimientos de crédito y saldo final;
- si existe un **límite duro** configurable o solo alertas.

Con eso ejecuto `ledger.reconcile({ providerSpentUsd })` y la diferencia frente a los ≈$15,4–18,1
internos queda medida en vez de estimada.

## 10. Secuencia de reactivación — reversible, NO ejecutada

**Paso 1 — Cerrar Vercel.** Borrar `ANTHROPIC_API_KEY` del proyecto en Vercel, o borrar
`api/chat.js` y redesplegar.

**Paso 2 — Quitar la clave de donde no hace falta.**

```bash
railway variables delete ANTHROPIC_API_KEY --service faithful-light --project 1fcded21-0207-405b-bb63-9ec60f640936
```

**Paso 3 — Aplicar la migración del ledger compartido.**

```bash
psql "$SUPABASE_DB_URL" -f isabel-api/migrations/ai_budget_ledger.sql
```

**Paso 4 — Configurar el presupuesto con el gasto APAGADO.**

```bash
railway variables --service isabel-api --set "AI_BUDGET_CURRENCY=EUR" --set "AI_BUDGET_MONTHLY=20" --set "AI_BUDGET_RESERVE=5" --set "AI_BUDGET_FX_USD_PER_EUR=<el de tu factura>" --set "AI_BUDGET_FX_DATE=<AAAA-MM-DD>" --set "AI_BUDGET_FX_MAX_AGE_DAYS=45" --set "AI_BUDGET_MAX_CALL=0.15" --set "AI_BUDGET_MAX_TASK=1" --set "AI_BUDGET_MAX_OUTPUT_TOKENS=2048" --set "AI_BUDGET_MAX_CONCURRENT=2" --set "AI_BUDGET_RESERVATION_TTL_MS=120000" --set "AI_BUDGET_MAX_ATTEMPTS=2" --set "AI_BUDGET_STORE=supabase" --set "AI_SPENDING_ENABLED=false" --set "AI_KILL_SWITCH=true"
```

15 € de uso ordinario + 5 € de reserva protegida = los 20 € del objetivo.

**Paso 5 — Desplegar con el freno echado y verificar.**

```bash
cd isabel-api && npm test && npm run audit:paid-routes && npm run budget:status
```

`budget:status` debe decir **NO**. Si dice sí antes de tiempo, parar.

**Paso 6 — Rotar la clave** siguiendo `ROTAR_ANTHROPIC_KEY.md`, y apuntar el `baseUrl` de OpenClaw
al proxy.

**Paso 7 — Recarga y una sola llamada controlada.** Quitar el kill switch, poner
`AI_SPENDING_ENABLED=true`, mandar **una** frase por Telegram, y comparar `budget:status` con la
consola de Anthropic antes de nada más.

**Paso 8 — Habilitación limitada.** Reactivar el cron de sueño solo después de que el paso 7 cuadre.
Es la única ruta que gasta sin nadie delante: ~$0,115 por ejecución, ~$3,5/mes.

## 11. Riesgos residuales

1. Mientras el Gateway tenga la clave, el control de isabel-api no lo alcanza. El proxy lo resuelve,
   pero hasta desplegarlo y configurarlo **el límite es de papel**.
2. La garantía de atomicidad depende de la migración aplicada. Sin ella, presupuesto efímero.
3. Los precios son los verificados el 2026-08-09. Si Anthropic los cambia, la estimación envejece en
   silencio; `prices.js` guarda la fecha para poder detectarlo.
4. **No consta que Anthropic ofrezca un límite duro que bloquee gasto**; los avisos de presupuesto
   son alertas. No verificado — mirar en la consola antes de fiarse.
5. El proxy no admite streaming: lo rechaza en vez de dejar pasar un gasto que no sabría liquidar.
6. El Gateway nuevo no tiene remoto git demostrado: su configuración vive en un volumen.
