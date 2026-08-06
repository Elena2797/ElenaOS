Estado: en construcción — Gateway real desplegado en Railway, todavía sin ningún turno de agente funcionando de extremo a extremo
Última verificación: 2026-08-06
Verificado en: despliegue real de `isabel-gateway` en Railway (proyecto dedicado, separado de `isabel-api`), repro completo cron→runner→claude-cli→MCP→tool→respuesta en WSL/Linux (ver `KNOWN_PROBLEMS.md`), MCP `lifeos` autenticado y verificado con `openclaw mcp doctor --probe`, bloqueo actual de auth de `claude-cli` documentado con evidencia de `openclaw doctor`
Fuente de verdad de datos: ninguna

# core/AUTOMATIONS.md — Qué corre solo, y qué no

## Verificado: todavía no hay ninguna automatización real corriendo en producción
El Gateway de OpenClaw (`isabel-gateway`, Railway) está desplegado, persistente, y arranca correctamente — pero ningún turno de agente real completa un turno todavía (ver bloqueo actual más abajo). Sin eso, no hay cron diario, no hay Telegram, no hay nada disparándose solo. Ver `DECISIONS.md` D10 para la decisión de arquitectura ya aprobada.

## Lo que quedó resuelto desde la última verificación (2026-08-05 → 2026-08-06)

1. **"isolated agent setup timed out before runner start" — causa raíz: específico del runtime Windows, no de OpenClaw.** Demostrado con un repro completo (cron isolated → runner_entered → claude-cli → MCP autenticado → tool → respuesta → run OK) en WSL2/Linux nativo, misma versión OpenClaw 2026.6.10, mismo modelo. El bug de Windows se explica por un reinicio de Gateway en cascada que en Windows cae en un modo degradado ("in-process restart") por falta de integración con Scheduled Tasks — no bloquea el despliegue en Railway (Linux). Detalle completo en `KNOWN_PROBLEMS.md`.
2. **`isabel-api/src/mcp.js` ya tiene autenticación.** `requireApiKey` aplicado también a `/mcp` (antes solo a `/v1/*`). Verificado en producción: `GET /mcp` sin token → 401. Commit `c02d4cd`.
3. **`health_register_sleep` ya no depende de que el LLM recuerde un `intervention_id`.** LIFEOS resuelve la Intervention pendiente por `domain+kind+status=pending`, fail-closed ante cero o más de una coincidencia. Ver `modules/HEALTH_AND_GYM.md` y commit `7ab806f` (isabel-api). Migración `kind` aplicada a Supabase real.

## Gateway real: `isabel-gateway` (Railway)

Repo propio en `LIFE OS/isabel-gateway/` (git local, no en GitHub todavía). Servicio Railway dedicado, **separado del proyecto de `isabel-api`**. Arquitectura: `gateway.bind: "loopback"`, sin dominio público, sin Control UI expuesta — administración exclusivamente vía `railway ssh` (loopback genuino desde dentro del contenedor, evita el bloqueo circular de pairing que apareció en el repro efímero previo). Detalle de archivos/variables en `isabel-gateway/README.md`.

Confirmado funcionando:
- Arranca limpio, sin crash-loop.
- Volumen persistente en `/data` — confirmado que la config sobrevive un restart completo del contenedor.
- MCP `lifeos` conecta y autentica contra `isabel-api` producción (`openclaw mcp doctor --probe` → `ok`).
- `claude-cli` funciona correctamente cuando se invoca manualmente dentro del contenedor (mismo `ANTHROPIC_API_KEY` que usa `isabel-api`).

## Bloqueo actual — el único que impide un turno de agente real

**Todo turno de agente real falla con `FailoverError: Not logged in · Please run /login`, aunque `claude-cli` invocado manualmente (mismos flags que usa el Gateway) funciona perfectamente.**

Causa raíz confirmada vía `openclaw doctor`: el backend `claude-cli` (vía `agentRuntime`) requiere su **propio** auth profile interno de OpenClaw, guardado en `/data/.openclaw/agents/main/agent/openclaw-agent.sqlite`, con la clave exacta `anthropic:claude-cli` — distinto del perfil `anthropic:default` (API key) que ya registramos con éxito. Ese perfil específico solo se crea con:

```bash
claude auth login                                                    # OAuth interactivo
openclaw models auth login --provider anthropic --method cli --set-default
```

Ambos comandos **requieren una terminal interactiva real**. Se intentó completar el login OAuth varias veces vía `railway ssh` (directo, con `su node -c`, con `su - node`, con tmux, con un named pipe para mantener el stdin abierto entre llamadas) — todos los intentos fallaron: o bien el proceso vuelve al shell antes de que se pueda pegar el código, o el login "tiene éxito" (imprime `Login successful.`) pero **no llega a escribir `~/.claude/.credentials.json`** — no se encontró ese archivo en ninguna ubicación del contenedor tras el intento.

No se ha investigado por qué el proceso muere antes de persistir la credencial — es la tarea pendiente concreta de la siguiente sesión.

### Lo que NO es el problema (descartado con evidencia)
- No es el `ANTHROPIC_API_KEY` — `claude auth status` y una invocación manual real (`claude -p ...`) funcionan perfectamente con él, dentro del mismo contenedor, como el mismo usuario `node`.
- No son los flags/argumentos que usa el Gateway (`--output-format stream-json --session-id ...`) — se probaron manualmente idénticos y funcionan.
- No es el volumen/persistencia — la config sí persiste correctamente entre restarts.
- No es `models.providers.anthropic.apiKey` (SecretRef `${ANTHROPIC_API_KEY}`, ya configurado) — ese es un mecanismo de auth *distinto*, para llamadas directas a la API de Anthropic, no para el backend `claude-cli`.

## Antes de tener un turno de agente real, queda un único bloqueante
Completar el registro del auth profile `anthropic:claude-cli` — necesita una sesión verdaderamente interactiva (terminal local del usuario conectada directamente, sin capas de `su`/pipe de por medio) para que el login OAuth persista, o encontrar por qué `railway ssh` + `su` está matando el proceso antes de que escriba el archivo de credenciales.

## Todavía sin tocar esta sesión (según instrucción explícita)
- Telegram (ni bot nuevo ni configuración).
- Cron diario de las 08:00.
- `isabel-bridge.js` (sigue congelado, sin retirarse).
- Perfil real de OpenClaw del portátil.
