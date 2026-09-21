Estado: resuelto — Telegram operativo y clave expuesta revocada (401 verificado el 2026-09-21)
Última verificación: 2026-09-21
Verificado en: Railway (4 servicios por ID), volúmenes OpenClaw, Vercel, procesos Windows, huellas de credenciales, `npm test` 616/616, PGlite 20/20
Fuente de verdad de datos: `ai_budget_state` en Supabase (tras aplicar la migración) y la consola de Anthropic para el gasto real

# Incidente de saldo del 2026-08-11 — causa, saneamiento y reactivación

> **Actualización 2026-09-21: resuelto.** Telegram funciona por el proxy, la clave está rotada y
> desde las 12:26 UTC Anthropic es el cerebro de repuesto (D47). Lo que había debajo, en §12.
>
> **Estado a 2026-09-20 21:30 (histórico): NOT READY TO RECHARGE.**
> Todas las rutas de pago conocidas están cortadas o bloqueadas, el libro mayor
> está aplicado y probado contra Postgres real, y el gasto está impedido por tres
> comprobaciones independientes. Lo único que falta es **rotar la clave
> expuesta**, que solo puede hacer Estefanía. §9.

## 1. Qué pasó, en una frase

El heartbeat de OpenClaw **nunca se apagó**: se apagó en el Gateway nuevo y siguió vivo en el
Gateway antiguo del proyecto Railway `isabel-gateway`, con la misma `ANTHROPIC_API_KEY`,
despertando al agente **48 veces al día** contra `claude-sonnet-4-6`. Ese proceso no aparecía en
ningún mapa, y O4 no podía verlo porque solo barre el Gateway nuevo.

## 2. Evidencia

Capturada antes de detener nada; copia en `scratchpad/evidencia/heartbeat-antiguo.txt`.

| Hecho | Cómo se comprobó |
|---|---|
| El Gateway antiguo seguía `Online` el 2026-09-20 | `railway status`, proyecto `isabel-gateway` |
| Heartbeat cada 30 min hasta el final | **2.128** mensajes `[OpenClaw heartbeat poll]`; último `2026-09-20T16:17:57Z` |
| Clave compartida | huella SHA-256 idéntica (`97e63348…`) en los 4 servicios |
| Último turno que sí cobró | `2026-08-11T02:17:58.675Z`, `cacheWrite: 28.956` tokens |
| Hubo un agotamiento anterior | primer error `2026-08-07T22:17:57Z`; los turnos vuelven a cobrar entre `2026-08-08T13:47Z` y `14:17Z` → **la recarga fue ahí** |

### Coste reconstruido del heartbeat huérfano

Estimado con la tabla de precios del propio proyecto (Sonnet 4.6: 3 $/Mtok entrada, caché ×1,25).
**No es una factura.**

| Día | Turnos | Caché escrita | Coste estimado |
|---|---:|---:|---:|
| 2026-08-07 | 57 | 713.168 | $2,67 |
| 2026-08-08 | 59 | 545.082 | $2,04 |
| 2026-08-09 | 51 | 1.362.039 | **$5,11** |
| 2026-08-10 | 49 | 1.372.402 | **$5,15** |
| 2026-08-11 | 49 (5 con tokens) | 144.740 | $0,54 |
| desde 08-12 | 48/día | 0 | $0 |

El 9 y el 10 —**justo después** de declarar el heartbeat muerto— gastó **$10,26**. Cada poll
escribía ~29.000 tokens de caché para responder 8 (`HEARTBEAT_OK`). Contando solo entrada y salida
parecía gratis.

**Ventana recarga → agotamiento** (2026-08-08T14:00Z → 2026-08-11T02:18Z, 60 h): heartbeat antiguo
≈ $13,1 (invisible para O4) + Gateway nuevo y isabel-api $2,27–4,97 = **≈ $15,4–18,1**. Consistente
con "recargué unos 20 €". La diferencia exacta sigue abierta: hace falta la consola de Anthropic.

## 3. Por qué el control que había no lo impidió

1. **O4 mide después de pagar.** Para cuando el barrido descubre un turno, el cargo existe.
2. **O4 solo barre lo que conoce.** El Gateway antiguo no estaba en `GATEWAY_SESSION_KEYS`.
3. **Un fallo se registra como éxito:** los turnos sin saldo quedan como `status: success, $0`.
4. **OpenClaw nunca reporta coste** (`cost.total: 0`): cada cifra de O4 es una estimación local.
5. **`aiGuard` protege solo el tick proactivo** y depende de que cada sitio se declare.

## 4. Mapa de rutas de pago — estado a 2026-09-20 20:30

| # | Ruta | Estado |
|---|---|---|
| 1 | Telegram → agente (Gateway nuevo) | **por el proxy**; sin clave propia |
| 2 | cron `sleep-check-0800-madrid` | habilitado, **por el proxy**; no puede gastar (§6) |
| 3 | `POST /v1/chat` → agente | **por el proxy** |
| 4 | Model Router (specialists) | **con gate** |
| 5 | `generalHandler`, `intentRouter` | **con gate** (código huérfano) |
| 6 | heartbeat Gateway antiguo | **detenido** + sin clave + bloqueado por contenido en el proxy |
| 7 | Gateway local (portátil) | **detenido**, tarea programada `Disabled` |
| 8 | `isabel-bridge.js` :3001 | **detenido** |
| 9 | Vercel `/api/chat` | **retirada** — responde 404 |
| 10 | `lifeos-agent` | detenido desde junio |

Ninguna ruta conocida puede llegar a Anthropic sin pasar por el presupuesto.

## 5. Credenciales

Una sola clave (`97e63348…`, 108 caracteres). Estaba en **6 sitios**; ahora en **2**:

| Ubicación | Antes | Ahora |
|---|---|---|
| Railway `isabel-api` | clave | **clave** (único punto de salida autorizado) |
| Railway `isabel-gateway` (nuevo) | clave | token de proxy, sin valor en Anthropic |
| Railway `faithful-light` | clave | **borrada** |
| Railway `isabel-gateway` (antiguo) | clave | **borrada** |
| `isabel-api/.env` | clave | clave (desarrollo local) |
| `isabel-api-vj-landing-cleaning/.env` | clave | **sustituida por un marcador** |

Es **la misma clave que `SECURITY.md` #9 da por expuesta en texto plano desde el 2026-08-06**.
Sigue vigente. Rotación: `ROTAR_ANTHROPIC_KEY.md`.

## 6. Qué se ejecutó el 2026-09-20

| Acción | Verificación |
|---|---|
| Gateway antiguo detenido (`railway down` por project+service ID) | `○ Offline`, ningún deployment `SUCCESS`, sin reinicio |
| Tarea programada Windows deshabilitada | `State: Disabled` |
| Gateway local y `isabel-bridge.js` detenidos | puertos 18789 y 3001 libres |
| `api/chat.js` retirada y desplegada | `GET /api/chat` → **404** (antes 405); home 200; `gmail-auth` intacta |
| Clave borrada de los dos servicios legacy | sin `ANTHROPIC_API_KEY` en ninguno |
| Control de gasto desplegado | Railway `SUCCESS`, `/health` 200 |
| Migración del libro mayor aplicada | `ai_budget_state` y `ai_budget_reservations` con RLS; 8 funciones; SHA-256 del SQL idéntico al del repositorio |
| Proxy montado en `/ai/v1/messages` | sin token → **401**; con token → **400 kill_switch**; heartbeat → **400 heartbeat_turn** |
| Gateway apuntado al proxy | `baseUrl` en su volumen; su `ANTHROPIC_API_KEY` es ahora el token del proxy |

**El cron de sueño sigue programado en OpenClaw** —su CLI exige un emparejamiento de dispositivo
que no se pudo completar desde el contenedor— pero **ya no puede gastar**: se le retiró la ruta
`cron` al consumidor en `AI_PROXY_CONSUMERS`, así que el proxy responde `403 kind_not_allowed` a
cualquier turno de cron.

Se hizo así a propósito. La alternativa era editar el almacén de permisos de OpenClaw para
concederme los scopes que faltaban, y no merece la pena tocar un fichero de autenticación para algo
que el control de gasto ya resuelve de forma declarativa y reversible. Volver a habilitarlo es
añadir `"cron": "gateway.agent_turn.cron"` a las rutas del consumidor: una línea, visible y
auditable. Si además quieres que deje de dispararse, desde un dispositivo emparejado:

```bash
openclaw cron disable 99fd7a3b-b571-4a4f-91e4-142688ba4a5f
```

Nada se borró: servicios, volúmenes, tarea programada y ficheros siguen ahí. El `openclaw.json`
anterior del Gateway está en `/data/.openclaw/openclaw.json.pre-proxy-20260920`.

## 7. El control de gasto

`isabel-api/src/core/budget/` — punto único de autorización, desplegado y **bloqueado**.

| Pieza | Qué garantiza |
|---|---|
| `prices.js` | Precio desconocido → no se autoriza. Con fecha de verificación. |
| `fx.js` | 20 € no son 20 $. Unidad contable: dólar. Sin tipo de cambio declarado **y fechado**, bloqueo. |
| `policy.js` | Presupuesto, reserva, topes, concurrencia, TTL, reintentos. Falta una variable → bloqueo total. |
| `ledger.js` / `remoteLedger.js` | Reserva **antes** de llamar. Liquida con el coste real. Reserva caducada se **cobra entera**. |
| `killSwitch.js` | Freno independiente, por variable o por fichero. |
| `gate.js` | kill switch → ruta declarada → reintentos → tope de salida → precio → **reserva** → llamada → liquidación. |
| `consumers.js` | **Quién** llama lo decide el servidor por token, nunca una cabecera del cliente. |
| `registry.js` | Una ruta no declarada no puede cobrar. |
| `routes/aiProxy.js` | Salida única del Gateway. Clasifica el turno por contenido y **bloquea los heartbeat siempre**. |
| `audit-paid-routes.mjs` | Falla el build si aparece una ruta sin gate. Corre dentro de `npm test`. |

### Pruebas

- **616/616** en `npm test`, coste **$0** — ninguna toca la red.
- **20/20** de la migración contra Postgres real (PGlite, en proceso y sin servicio):
  `npm run verify:budget-sql-local`. Comprueba las 8 funciones, la aritmética, el agujero del NULL,
  liquidación, exceso, doble liquidación, coste desconocido, liberación, caducidad, topes y rollback.
- **En producción**: el proxy deniega sin token (401), con token (400 `kill_switch`) y ante un
  heartbeat (400 `heartbeat_turn`), sin que salga ninguna petición hacia Anthropic.

### Dos defectos encontrados y corregidos al verificar

1. **El control fallaba abierto.** `insert … on conflict do nothing` + `select … for update` no
   devuelve fila si otra transacción insertó el mes y luego hizo rollback; `v_spent` quedaba NULL y
   `NULL + x > límite` es NULL, que en un `if` es falso: **la reserva se concedía saltándose la
   comprobación**. Ahora el mes se obtiene con un upsert que bloquea y devuelve siempre.
2. **Riesgo de interbloqueo:** `reserve` tomaba mes→reserva y `settle` reserva→mes. Ahora el orden
   es siempre mes→reserva.

También se quitó `create extension pgcrypto`: `gen_random_uuid()` es nativo desde Postgres 13 y
exigir una extensión ausente rompe el `psql` a mitad, con medio esquema creado.

### Concurrencia, demostrada contra el Postgres real

`npm run verify:budget-concurrency` — **11/11** contra la base de producción, con meses `2099-xx`
que se borran al terminar:

- veinte reservas **simultáneas** de 1 $ contra 5 $ gastables → exactamente **cinco** concedidas,
  quince `over_budget`, ningún id repetido;
- liquidar la misma reserva dos veces a la vez → se cobra **una**;
- reservas y liquidaciones entrelazadas → **ningún interbloqueo**, que era el riesgo del orden de
  bloqueo corregido el mismo día;
- una reserva caducada se cobra entera.

Esto era lo último que quedaba sin demostrar, porque es comportamiento del motor y no de nuestro
código. Ya no es una suposición.

### Row Level Security

Las dos tablas del presupuesto se crearon **con RLS activado y sin políticas**. Importa: la clave
anónima de Supabase va incrustada en el bundle del frontend, es pública por diseño, y sin RLS
cualquiera podría **poner a cero el contador de gasto**. Comprobado con la clave anónima real:
lectura devuelve `[]` y la escritura se rechaza con `42501`. `isabel-api` usa la service key, que
salta RLS, así que sigue funcionando.

## 8. Por qué el gasto está bloqueado ahora mismo

`railway run --service isabel-api -- node scripts/budget-status.mjs` responde **NO**, por cuatro
motivos independientes:

1. `AI_KILL_SWITCH=true`;
2. `AI_SPENDING_ENABLED=false`;
3. la clave que tiene `isabel-api` es la expuesta, y no se levanta el freno hasta rotarla;
4. y para los turnos de cron, además, la ruta no está declarada para ese consumidor.

El libro mayor ya responde: 22,92 $ mensuales, 5,73 $ de reserva, **17,19 $ gastables**, 0 $
gastado, 0 reservado.

Configuración aplicada: 20 € mensuales, 5 € de reserva protegida, 0,25 € por llamada, 1 € por
tarea, 2.048 tokens de salida, 2 llamadas en vuelo, TTL de 2 min, 2 intentos, almacén `supabase`.

**Tipo de cambio**: 1 EUR = 1,146 USD, referencia del BCE del **2026-09-18**
(`api.frankfurter.dev`), registrado en `AI_BUDGET_FX_SOURCE` y con caducidad de 45 días. Con eso,
20 € = 22,92 $ y lo gastable son 17,19 $.

> No es el tipo de tu factura: tu tarjeta aplicará el suyo y su comisión. **Cuando recargues, pon
> `AI_BUDGET_CURRENCY=USD` y el importe exacto que Anthropic acredite.** Eso elimina el tipo de
> cambio del problema en vez de aproximarlo, que siempre es mejor.

## 9. Lo que falta, y solo puedes hacerlo tú

1. **Rotar la clave** — `ROTAR_ANTHROPIC_KEY.md`. La nueva va **solo** a `isabel-api`. Crear y
   revocar claves de Anthropic es tuyo por definición: un asistente no debe manejar ese secreto.
2. **Datos de la consola** para cerrar la reconciliación: fecha e importe de la recarga de agosto,
   consumo diario del 1 al 11, movimientos de crédito, y si existe límite duro o solo alertas.

## 10. Canary, cuando lo anterior esté hecho

1. Recargar 20 €.
2. `railway variables --service isabel-api --set "AI_SPENDING_ENABLED=true"` y quitar
   `AI_KILL_SWITCH`.
3. **Un** mensaje por Telegram. Nada más.
4. Comparar `budget-status` con la consola de Anthropic y ejecutar `ledger.reconcile`.
5. Solo si cuadra: volver a habilitar el cron de sueño (~$0,115 por ejecución, ~$3,5/mes).

## 11. Riesgos residuales

1. Los precios son los verificados el 2026-08-09; envejecen en silencio. `prices.js` guarda la fecha.
2. **Anthropic no garantiza un límite duro** que bloquee gasto; sus avisos de presupuesto son
   alertas. No verificado — mirarlo en la consola. El control local limita lo que sale de LIFEOS,
   no lo que el proveedor pueda facturar por otra vía.
3. El proxy no admite streaming: lo rechaza en vez de dejar pasar un gasto que no sabría liquidar.
4. `api/gmail-auth.js` y `api/gmail-callback.js` siguen publicadas en Vercel. No gastan Anthropic,
   pero son endpoints sin autenticación: conviene revisarlos aparte.
5. **`eventos` es legible con la clave anónima.** Comprobado el 2026-09-20: una petición con la
   clave que va incrustada en el bundle público devuelve registros reales (sueño, uso de IA). Es la
   consecuencia de "RLS desactivado por la arquitectura personal actual" que ya documenta
   `INFRASTRUCTURE.md`, no algo que haya cambiado hoy. No se ha tocado porque activar RLS en tablas
   que el frontend lee con esa misma clave rompería la app sin políticas previas. **Merece su propia
   sesión**: es un problema de privacidad, no de coste.
6. El Gateway nuevo no tiene remoto git demostrado: su configuración vive en un volumen.

## 12. 2026-09-21 — Telegram reparado, y lo que había debajo

**Causa del "Consumidor no reconocido".** Se demostró con un diagnóstico en el 401 del proxy (solo huellas y longitudes): el Gateway presentaba una clave de 108 caracteres con huella `97e63348…`, **la antigua expuesta**. OpenClaw la tenía guardada en su almacén de perfiles, `/data/.openclaw/agents/main/agent/openclaw-agent.sqlite`, perfil `anthropic:default`. **Ese almacén manda sobre `openclaw.json` y sobre `ANTHROPIC_API_KEY`**. Cambiar la variable o el fichero no servía de nada. La afirmación de §5 de que la clave real vivía en un solo servicio era falsa hasta este arreglo:

```bash
echo $ANTHROPIC_API_KEY | runuser -u node -- openclaw models auth paste-api-key --provider anthropic --profile-id anthropic:default
```

(Ejecutado dentro del contenedor por `railway ssh`. La clave va por tubería y no aparece en ningún terminal.) Después, reiniciar el servicio.

**Trampas que conviene no repetir:**

1. **Nunca ejecutar `openclaw` como root en el contenedor.** Escribe `openclaw.json` con `600 root:root`, el proceso (usuario `node`) deja de poder leerlo y sigue con la copia `last-good`, sin avisar salvo por un `EACCES` en el vigilante de configuración. Usar siempre `runuser -u node --`. El entrypoint repara los permisos con `chown -R` en cada arranque.
2. **Rotar el token del proxy exige dos pasos:** la variable de Railway **y** el `paste-api-key` de arriba. Con uno solo, el Gateway sigue presentando el token viejo.
3. **Cambiar el modelo por defecto no cambia la conversación viva.** `openclaw models set` se aplicó en caliente, pero la sesión `agent:main:main` siguió con Sonnet hasta reiniciar el Gateway.
4. **`git fetch` antes de cualquier `railway up`.** Un `railway up` desde una copia local atrasada pisó en producción el soporte SSE que otra sesión había subido a `main`.
5. `railway ssh` inyecta en la sesión de diagnóstico un `GH_TOKEN` que **no** está en el proceso del Gateway (comprobado en `/proc/1/environ`). No es una fuga del bot.

**Copias con la clave vieja que siguen en el volumen:** `openclaw-agent.sqlite.pre-token-20260921` y `openclaw-agent.sqlite-wal.pre-token-20260921` (en `agents/main/agent/`), además de los `archived-*` y `*.clobbered.*` de agosto. Son la red de seguridad del arreglo. **En cuanto se revoque `97e63348…` en la consola quedan inertes**, y entonces se pueden borrar.

**Estado de la rotación:** hecha. La clave nueva (`d7ff29a1…`) está **solo** en `isabel-api` y hoy ha servido turnos reales por el proxy. Y `97e63348…` **ya está revocada**: Anthropic responde `401 invalid` (comprobado el 2026-09-21 con `GET /v1/models`, sin coste). La nueva caduca el 2026-10-20.

**Desde las 12:26 UTC Anthropic es el repuesto, no el principal** (D47): los turnos van a DeepSeek V4 Flash vía OpenRouter, fuera de este presupuesto y con su propio freno (prepago más límite de la clave). El cron de sueño, que el proxy bloqueaba (`kind_not_allowed`), ahora va por OpenRouter. **Queda por verificar la ejecución del 2026-09-22 a las 08:00.**
