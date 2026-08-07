Estado: implementado — Telegram activo 24/7 sobre isabel-gateway (Railway); cron diario todavía sin activar
Última verificación: 2026-08-07
Verificado en: `isabel-gateway/openclaw.default.json` (`channels.telegram.enabled:true`), commits `4fcebf5`/`4e43414`/`a4364ea` (2026-08-06 16:27-16:55, posteriores a la verificación anterior de este documento), `CURRENT_STATE.md` ("Isabel sigue real y funcionando 24/7 por Telegram"), bug real de D14 (Isabel confirmó por Telegram un cambio de avión que invocó `vistajet_update_status`)
Fuente de verdad de datos: ninguna

# core/AUTOMATIONS.md — Qué corre solo, y qué no

## Verificado: Telegram está activo 24/7; el cron diario sigue sin activar
El Gateway de OpenClaw (`isabel-gateway`, Railway) está desplegado, persistente, y arranca correctamente. El bloqueo de auth que impedía completar turnos (`FailoverError: Not logged in`) quedó resuelto el 2026-08-06 — no arreglando el login de `claude-cli`, sino abandonándolo: se confirmó que ese backend no está pensado para contenedores efímeros (ver D11 abajo) y se cambió a auth de API key, ya configurada. **Corrección sobre la verificación anterior de este documento (2026-08-06, misma tarde):** decía "todavía sin Telegram activo" — eso cambió horas después, el mismo día, cuando se activó `channels.telegram` (commits 16:27-16:55). Desde entonces Telegram es el canal conversacional real de Isabel, usado a diario (ver `core/ISABEL_CHANNELS.md`). Lo que sigue faltando para automatización disparada sola (sin que la usuaria escriba primero): el cron diario (sueño 08:00) — ver `NEXT_SESSION.md`. Ver `DECISIONS.md` D10 para la decisión de arquitectura ya aprobada y D11 para el cambio de backend de auth.

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
- **Un turno de agente real completa correctamente** (verificado el 2026-08-06 vía `railway ssh -- su node -c 'openclaw agent --agent main --message "..."'` → respuesta `OK`, log `run … ended with stopReason=stop`, sin error).

## Bloqueo anterior — RESUELTO 2026-08-06 (se abandonó `claude-cli`, no se arregló su login)

Todo turno de agente real fallaba con `FailoverError: Not logged in · Please run /login`, aunque `claude-cli` invocado manualmente (mismos flags que usa el Gateway) funcionaba perfectamente. `openclaw doctor` señalaba como causa la falta del auth profile `anthropic:claude-cli`, que solo se puede crear con `claude auth login` (OAuth interactivo) — comando que exige una terminal interactiva real y que, tras múltiples intentos vía `railway ssh` (directo, `su node -c`, `su - node`, tmux, named pipe, e incluso un login interactivo real que imprimió "Login successful."), nunca llegó a persistir `~/.claude/.credentials.json` dentro del contenedor.

**La causa raíz resultó ser arquitectónica, no un problema de ejecución que arreglar.** Leyendo el código fuente empaquetado de OpenClaw (`node_modules/openclaw/dist/cli-auth-seam-CzFhiHUR.js` → `store-DcJR3uqo.js`) se confirmó que `readClaudeCliCredentialsForRuntime()` lee `~/.claude/.credentials.json` **directamente del sistema de archivos del host** en cada turno — no del perfil `anthropic:claude-cli` de `openclaw-agent.sqlite`, no de ninguna variable de entorno. Y la documentación oficial de OpenClaw (`node_modules/openclaw/docs/providers/anthropic.md`) lo confirma explícitamente: *"Claude CLI reuse expects the OpenClaw process to run on the same host as the Claude CLI login. Container installs... do not mount host `~/.claude` into setup or runtime; use an Anthropic API key there..."* — el backend `claude-cli` simplemente no está diseñado para un contenedor efímero como Railway. Ninguna variante de `railway ssh` iba a resolver esto.

**Solución aplicada (ver `DECISIONS.md` D11):** se quitó el override `agentRuntime: { id: "claude-cli" }` de `agents.defaults.models["anthropic/claude-sonnet-4-6"]` — tanto en el volumen en vivo (`openclaw config unset ... --provider anthropic` + `railway restart --yes`) como en `isabel-gateway/openclaw.default.json` (para que un volumen nuevo no reintroduzca el mismo bug). El modelo ahora resuelve auth vía `models.providers.anthropic.apiKey` (`${ANTHROPIC_API_KEY}`, ya configurada y ya verificada funcionando). **Trade-off aceptado explícitamente por la usuaria:** los turnos ahora facturan como uso de API de pago en vez de consumir la asignación del plan Claude Pro.

### Hallazgo colateral: `railway.exe ssh` no re-escapa argumentos con espacios
Detalle completo en `KNOWN_PROBLEMS.md`. Resumen: `railway ssh -- su node -c "comando con espacios"` llega al contenedor partido en tokens sueltos (bug del cliente `railway.exe`, no de OpenClaw). Workaround: `su node -c \'comando\ con\ espacios\'` (comillas literales escapadas dentro de un único token local).

## Qué sigue pendiente
- Cron diario de las 08:00 (sueño) — creado y disparado una vez en pruebas, pero el turno de agente aislado no llegó a arrancar; causa no investigada (ver `KNOWN_PROBLEMS.md`).
- `isabel-bridge.js` (sigue congelado, sin retirarse — ver `core/ISABEL_CHANNELS.md` § 2, requiere exponer el Gateway públicamente antes de poder retirarlo, decisión no tomada).
- Perfil real de OpenClaw del portátil, sin cambios.
