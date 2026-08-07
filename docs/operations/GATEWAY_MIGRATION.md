Estado: en ejecución — blue/green en curso, cutover NO realizado todavía
Última verificación: 2026-08-07
Verificado en: `railway ssh` contra el contenedor real de `isabel-gateway`, `railway api` (GraphQL), backup lógico extraído y verificado localmente
Fuente de verdad de datos: ninguna

# operations/GATEWAY_MIGRATION.md — Mover isabel-gateway al proyecto de isabel-api

## Por qué
Para que la pestaña Isabel de LIFEOS hable con el **mismo** agente `main` que Telegram, `isabel-api` tiene que poder alcanzar al Gateway sin exponerlo a internet. La única vía es el private networking de Railway, que **solo funciona entre servicios del mismo proyecto y environment** — y hoy están separados. Ver `DECISIONS.md` D23/D25.

## Auditoría del estado real (2026-08-07, antes de tocar nada)

### Topología encontrada
| Proyecto Railway | ID | Servicios |
|---|---|---|
| `isabel-gateway` | `5e147723-…` | `isabel-gateway` (con volumen) |
| `laudable-consideration` | `1fcded21-…` | `isabel-api`, **`faithful-light`** |

**Hallazgo no documentado:** `faithful-light` está **Online** en el mismo proyecto que `isabel-api`, con dominio público, y responde `401` (no `404`) a `POST /v1/chat` y `/v1/now`. Sus variables (`ISABEL_CORE_API_KEY`, `INVENTORY_API_KEY`, `INVENTORY_API_URL`, `ANTHROPIC_API_KEY`, `SUPABASE_SERVICE_KEY`) lo identifican como **Isabel Core desplegado como servicio independiente** — exactamente la arquitectura que `DECISIONS.md` D9 descartó explícitamente ("habría añadido una quinta pieza desplegable con su propia URL, sus propios secretos y su propio ciclo de vida"). Se desplegó en algún momento y nunca se retiró. Es una superficie de ataque viva con secretos de producción y consumo de recursos. **No se ha tocado** — retirarlo es destructivo y requiere autorización explícita. Registrado en `SECURITY.md` y `KNOWN_PROBLEMS.md`.

### Estado persistente del Gateway (volumen `isabel-gateway-volume`, `/data`, 161 MB usados de 5 GB, región sfo)
| Ruta | Qué es | ¿Debe sobrevivir? |
|---|---|---|
| `.openclaw/state/openclaw.sqlite` (1.1 MB) | **cron_jobs, cron_run_logs**, device pairing, auth token store, delivery queue, task runs | **Sí — crítico** |
| `.openclaw/agents/main/agent/openclaw-agent.sqlite` | auth profiles del agente (resolución de credenciales de modelo) | **Sí — crítico** |
| `.openclaw/agents/main/sessions/*.jsonl` | 6 sesiones con transcript + trajectory | Sí (histórico conversacional) |
| `.openclaw/credentials/telegram-*.json` | pairing y allowFrom de Telegram | Sí |
| `.openclaw/identity/`, `.openclaw/devices/` | identidad del device y pairings aprobados | Sí |
| `.openclaw/openclaw.json` (+ 8 `.bak*`) | config viva (incluye `hooks.token` y el `ISABEL_API_KEY` resuelto — ver `SECURITY.md` #10) | Sí |
| `.openclaw/agents/main/agent/codex-home/skills/**` | skills del sistema, redescargables | No (excluidas del backup) |
| `workspace/` | vacío | No |

### Cron — capturado íntegro antes de migrar
```
id:        99fd7a3b-b571-4a4f-91e4-142688ba4a5f
name:      sleep-check-0800-madrid
schedule:  cron "0 8 * * *" @ Europe/Madrid
enabled:   true
agentId:   main
target:    isolated · wakeMode now · timeout 90s
delivery:  announce → telegram:5827330016 (bestEffort false)
estado:    lastRunStatus ok, lastDelivered true, consecutiveErrors 0
```
**Corrección a `core/AUTOMATIONS.md`:** ese documento decía "todavía sin cron diario". Es falso desde hace días — el cron existe, está habilitado y **su última ejecución fue correcta y entregada**. Isabel ya actúa de forma autónoma.

### Backup lógico (hecho antes de crear nada)
`_gateway_backup_20260807/gateway-state-20260807.tgz` (3.7 MB, 72 entradas) en la raíz del proyecto — fuera de todo repo git. Verificado tras descomprimir: contiene `state/openclaw.sqlite` con la fila real de `cron_jobs` (`sleep-check-0800-madrid`, `enabled=1`), más credentials, identity, devices, sesiones y auth store. **Contiene secretos** (config con token resuelto) — no commitear nunca, no compartir.

El backup nativo de Railway (`volumeInstanceBackupCreate`) devolvió `Not Authorized` con este plan/token — no disponible, el backup lógico es la red de seguridad real.

## Vía de migración: por qué blue/green y no un "mover"
Investigado contra la API GraphQL real de Railway (`railway api search/describe`):
- **No existe** ninguna mutación `serviceMove` / `serviceTransfer` a otro proyecto.
- `volumeCreate` es explícitamente "Create a persistent volume **in a project**" → los volúmenes son project-scoped.
- `serviceDuplicate` existe pero está **deprecado** ("Please use the UI") y solo acepta `environmentId` + `serviceId`, sin proyecto destino.
- El CLI no tiene `service move`; sí tiene `volume files upload/download`, que es la vía limpia para trasladar el estado.

Conclusión: **blue/green con volumen nuevo y restore del estado.** Es además la única forma práctica de conservar el cron, porque `openclaw cron add` por CLI está bloqueado por el scope `operator.admin` (ver `KNOWN_PROBLEMS.md`) — restaurar el SQLite trae el cron consigo sin necesidad de recrearlo.

## Guard anti-409 (doble polling de Telegram)
Dos Gateways haciendo long-polling del mismo bot provocan `409 Conflict` y pérdida de mensajes. La garantía aplicada **no depende de recordar apagar nada**: el nuevo servicio se crea **sin la variable `TELEGRAM_BOT_TOKEN`**. `openclaw.default.json` tiene `channels.telegram.enabled: true`, pero sin token en el entorno el canal no puede autenticarse ni hacer polling — es imposible que compita con el viejo. El token solo se añade en el momento del cutover, después de quitarlo del Gateway antiguo.

## Estado de ejecución
- [x] Auditoría del estado persistente
- [x] Backup lógico verificado (con el cron dentro)
- [x] Confirmado que Railway no permite mover service+volume entre proyectos
- [x] Servicio `isabel-gateway` creado en `laudable-consideration` (`1a66077d-…`)
- [x] Variables copiadas **excepto** `TELEGRAM_BOT_TOKEN`
- [x] Volumen nuevo creado y montado en `/data` (`eda9bc22-…`)
- [x] Deploy verde y arrancado (`[gateway] ready`)
- [x] Restore del estado y verificación — **el cron sobrevivió con su id original** (`99fd7a3b-…`), `enabled`, mismo schedule y delivery
- [x] MCP `lifeos: ok` desde el Gateway nuevo
- [x] Turno de agente real: responde "el avión actual es D-AFBS" usando la tool real
- [x] Proxy de chat implementado y testeado en `isabel-api` (`POST /v1/chat`, 25 tests)
- [x] Adapter validado **contra el Gateway real** (loopback), no solo con un fake
- [ ] **`gateway.bind` a `custom`/`::`** ← BLOQUEADO, ver abajo
- [ ] Prueba end-to-end isabel-api → private networking → Gateway
- [ ] Migrar `openChat()` del frontend
- [ ] **Cutover de Telegram** (quitar token del viejo → añadir al nuevo)
- [ ] Verificación post-cutover y apagado del Gateway antiguo ← requiere autorización explícita

## Lo que bloquea ahora mismo: el bind del Gateway

**Evidencia dura** (leída de `/proc/net/tcp`/`tcp6` dentro del contenedor nuevo): el Gateway escucha **solo en loopback** — `127.0.0.1:8080` y `::1:8080`. El private networking de Railway es IPv6 y exige escuchar en `::`, así que `isabel-api` **no puede alcanzarlo todavía**. Esto no es una suposición: el proxy funciona perfectamente desde dentro del contenedor (loopback) y no tiene ninguna ruta desde fuera.

El cambio necesario es una línea de configuración:

```
openclaw config set gateway.bind custom
openclaw config set gateway.customBindHost ::
```

Modos válidos según el esquema real: `auto`, `lan`, `loopback`, `custom`, `tailnet` (+ `customBindHost`).

**Por qué es seguro:** el servicio **no tiene dominio público** y no se le va a añadir; la red privada de Railway está aislada por proyecto; y `gateway.auth.mode` ya es `token`, que es justo lo que la propia documentación de OpenClaw exige para cualquier bind no-loopback ("Non-loopback binds require a valid gateway auth path: shared-secret token/password auth"). No se abre ninguna superficie a internet.

**Por qué no está hecho:** el comando fue **denegado por el clasificador de permisos del entorno** de esta sesión, no por Railway ni por OpenClaw. Al ser un cambio de exposición de red, requiere autorización explícita de la usuaria.

## Nota sobre `client.id: "gateway-client"`
El adapter conecta con el path reservado de backend (`client.id: "gateway-client"`, `client.mode: "backend"`), que preserva scopes con token compartido sin device pairing. La documentación lo describe como path **direct-loopback**. Queda por confirmar empíricamente si conserva los scopes cuando la conexión llega desde otro contenedor por la red privada. Si no los conservara, la alternativa soportada es el device pairing de `isabel-api` (`device.pair.*`, aprobación única) — no un hack. **No dar por hecho que funcionará: es la primera prueba a hacer en cuanto el bind esté cambiado.**

## Rollback
Mientras el Gateway antiguo siga con su token y su volumen intactos, el rollback es inmediato: basta con no completar el cutover (o devolver el token al viejo). El volumen antiguo **no se toca ni se borra** hasta que la usuaria lo autorice explícitamente.
