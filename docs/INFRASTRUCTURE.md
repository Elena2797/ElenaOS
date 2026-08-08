Estado: implementado; un bloqueo operativo explícito en el cron rollback
Última verificación: 2026-08-08
Fuente de verdad: Git local/remoto y Railway production

# Infraestructura real

## Repositorios

| Repo | Remoto limpio | Rol |
|---|---|---|
| `life-os-app` | `https://github.com/Elena2797/ElenaOS.git` | frontend Vercel + documentación canónica |
| `isabel-api` | `https://github.com/Elena2797/isabel-api.git` | backend Railway, Core, MCP y Model Router |
| `isabel-gateway` | ninguno demostrado | OpenClaw + adaptador privado; riesgo de backup/versionado |
| `lifeos-agent` | remoto limpio configurado | bot histórico detenido; no reactivar |

Las URLs de `isabel-api`, `life-os-app` y `lifeos-agent` ya no contienen credenciales. Antes del cambio se guardó `.git/config.pre-clean-20260808`; Git Credential Manager autentica y `ls-remote` funciona. No se inventó remoto para `isabel-gateway`: el candidato esperado no existe.

## Producción

### Proyecto Railway `laudable-consideration`

- `isabel-api`: servicio productivo, fuente `Elena2797/isabel-api`, rama `main`.
- `isabel-gateway`: Gateway productivo nuevo, volumen persistente, sin dominio público. Telegram, MCP, adaptador, cron proactivo y cron de sueño viven aquí.
- `faithful-light`: confirmado huérfano; sin dominio público, sin deployment activo y con la fuente Git desconectada. El servicio y sus variables se conservan para rollback. Un push futuro a `isabel-api` ya no puede redesplegarlo automáticamente.

### Proyecto Railway antiguo `isabel-gateway`

Conserva el Gateway anterior y su volumen como rollback. Telegram está deshabilitado y no hace polling. El servicio no se elimina. Su copia de `sleep-check-0800-madrid` sigue pendiente de desactivar porque la operación oficial requiere aprobar una elevación `operator.admin`; no se modificó SQLite ni se usó un atajo no soportado.

## Crons del Gateway productivo nuevo

- `proactive-tick-15m`: comando determinista, `delivery:none`, nunca crea turno de agente.
- `sleep-check-0800-madrid`: 08:00 Europe/Madrid, turno aislado y entrega Telegram.

El Gateway rollback contiene además una copia duplicada del cron de sueño hasta resolver el permiso anterior. Por tanto, no afirmar “exactamente un sleep cron” mientras siga pendiente.

## Despliegue y redes

- `life-os-app`: Vercel, `vite build`, salida `dist`.
- `isabel-api`: Railway, dominio público autenticado `https://isabel-api-production.up.railway.app`.
- `isabel-gateway`: Railway private networking IPv6; OpenClaw permanece en loopback y `gateway-adapter.mjs` expone solo chat/history/message/health con token separado.
- Supabase: base de datos y Storage compartidos; RLS desactivado por la arquitectura personal actual.

## Secretos

Nunca guardar valores en Git ni documentación. `ANTHROPIC_API_KEY` no se cambió; su rotación sigue pendiente de la usuaria. El snapshot de rollback del saneamiento registra identificadores y nombres de variables, nunca valores.
