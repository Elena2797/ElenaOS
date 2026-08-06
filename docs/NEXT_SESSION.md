Última actualización: 2026-08-06 — handoff corto, no histórico acumulativo (para eso está CHANGELOG.md)

# NEXT_SESSION.md

## Qué se terminó en esta sesión
Cuatro piezas. **(1) Cerrado el misterio del timeout de cron en Windows**: repro completo (cron → runner → claude-cli → MCP → tool → respuesta) en WSL2/Linux nativo, sin fallo — el bug es específico del runtime Windows, no bloquea Railway. **(2) Fix de seguridad real**: `isabel-api/src/mcp.js` ya exige `requireApiKey` (antes era la única ruta sin protección), desplegado y verificado en producción, commit `c02d4cd`. **(3) Rediseño de la correlación de Interventions**: `health_register_sleep({text})` ya no depende de que el LLM recuerde un `intervention_id` — LIFEOS resuelve la Intervention pendiente por `domain+kind+status=pending`, fail-closed ante cero o más de una coincidencia, con fix de una condición de carrera real (23505 unique_violation). 113/113 tests. Migración `kind` aplicada contra Supabase real. Commit `7ab806f`. **(4) Primer Gateway de OpenClaw real desplegado en Railway** (`isabel-gateway`, repo y servicio nuevos, separados de `isabel-api`): arranca limpio, volumen persistente confirmado (sobrevive restart), MCP `lifeos` autenticado contra `isabel-api` producción. Detalle completo en `CHANGELOG.md` 2026-08-06 y `core/AUTOMATIONS.md`.

## Qué quedó pendiente — EL BLOQUEO ACTUAL (lee esto primero si vas a continuar)

**Ningún turno de agente real funciona todavía en `isabel-gateway`.** Todo intento falla con:
```
FailoverError: Not logged in · Please run /login
```

**Causa raíz confirmada** (vía `openclaw doctor` dentro del contenedor, no es una hipótesis): el backend `claude-cli` necesita su propio auth profile interno de OpenClaw, guardado en `/data/.openclaw/agents/main/agent/openclaw-agent.sqlite`, con la clave exacta `anthropic:claude-cli`. Lo único registrado hasta ahora es `anthropic:default` (perfil de API key, registrado sin querer por un comando distinto) — el `agentRuntime: claude-cli` no lo reconoce. El perfil correcto solo se crea con:
```bash
claude auth login                                                    # OAuth interactivo real
openclaw models auth login --provider anthropic --method cli --set-default
```
Ambos comandos exigen una terminal interactiva genuina (un TTY real, no un pipe).

**Ya descartado como causa, con evidencia — no perder tiempo re-comprobando esto:**
- No es el `ANTHROPIC_API_KEY` — `claude auth status` y una invocación manual (`claude -p ...`) funcionan perfectamente con él, dentro del mismo contenedor, como el mismo usuario `node`.
- No son los flags que usa el Gateway (`--output-format stream-json --session-id ...`) — probados manualmente idénticos, funcionan.
- No es el volumen ni la persistencia — la config sí sobrevive restarts.
- No es `models.providers.anthropic.apiKey` (`${ANTHROPIC_API_KEY}`, ya configurado) — es un mecanismo de auth *distinto*, para llamadas directas a la API, no para el backend `claude-cli`.

**Ya intentado y fallado, con el motivo exacto de cada fallo — no repetir tal cual:**
1. `railway ssh -- su node -c "openclaw models auth login --provider anthropic --method cli --set-default"` → el comando pide el código OAuth pero el proceso vuelve al shell antes de poder pegarlo (timeout de stdin de `claude`, ~3s sin dato → "Warning: no stdin data received").
2. Variantes con `su - node`, con comillas anidadas distintas → mismo problema, o errores de parseo de `su` por capas de escaping (Bash tool → railway.exe → sh remoto → su).
3. `railway ssh --session <nombre>` (tmux) → falla directamente porque el proceso que ejecuta las herramientas no tiene un TTY real ("open terminal failed: not a terminal").
4. Named pipe (FIFO) para mantener el stdin abierto entre llamadas separadas de herramienta → el proceso `claude` ya había salido por timeout de stdin antes de que se pudiera escribir en el FIFO en una segunda llamada.
5. La usuaria completó el flujo interactivamente una vez y vio "Login successful." → verificado después vía SSH que **no se escribió ningún `~/.claude/.credentials.json`** en ninguna ubicación del contenedor (`find / -name ".credentials.json"` no encontró nada). No se investigó por qué "success" no persiste — es la pregunta abierta concreta.

**Próximo intento razonable, no probado todavía:**
- Una sesión SSH verdaderamente directa desde la terminal local de la usuaria (`railway ssh` tecleado a mano en su PowerShell, sin que ningún comando pase por capas de esta herramienta) puede tener un TTY real donde `su node -c "..."` sí preserve stdin interactivo de principio a fin — vale la pena probarlo una vez más, pero con la usuaria ejecutando y pegando el código ella misma en su propia terminal, no relayado por mí.
- Alternativa a investigar si eso vuelve a fallar: por qué `su node -c` (que no asigna un pty nuevo) podría estar rompiendo el manejo de terminal de `claude auth login` — probar `su node` interactivo (sin `-c`, dejando una shell real como `node`) y ejecutar el login manualmente desde ahí, en vez de encadenar `su ... -c "comando completo"`.
- Otra vía no explorada: generar la credencial en un entorno local completamente distinto (WSL, donde el login OAuth ya funcionó una vez en esta misma sesión para otro propósito) y copiar el `~/.claude/.credentials.json` resultante al volumen de Railway vía `railway ssh` — evita el problema de TTY anidado por completo, pero mueve una credencial OAuth entre máquinas (hay que decidir si eso es aceptable).

Sin relación con esto, de sesiones anteriores: confirmación de la usuaria tras probar "ISABEL · AHORA" en iPhone (sigue sin respuesta); "Gym" no aparece en Dominios; investigación de JETMI en pausa (`research/JETMI/LOG.md` § 6); **rotación de `ANTHROPIC_API_KEY`** — su valor real apareció en texto plano dos veces en la salida de esta sesión de chat (ver `SECURITY.md` riesgo #9), no se ha rotado.

## Qué debe hacerse inmediatamente después
Resolver el bloqueo de arriba — es el único paso entre el estado actual y Fase 5D (Telegram, bot nuevo dedicado) y Fase 5E (verificación del ciclo completo) del plan ya aprobado por la usuaria. No avanzar a Telegram ni al cron diario hasta confirmar que un turno de agente real completa correctamente contra `isabel-gateway` (probar con un mensaje simple vía `railway ssh` primero, antes de nada con Telegram). El plan completo (Fases 1-9) sigue aprobado — esto no requiere volver a pedir autorización de arquitectura, solo desatascar la ejecución.

## Qué no debe romperse
- No reutilizar el token de Telegram comprometido, ni ningún otro secreto ya expuesto — bot nuevo y dedicado cuando se llegue a Fase 5D.
- No copiar `~/.openclaw`, `~/.openclaw-dev`, perfiles de auth reales, ni ninguna sesión local a ningún archivo versionado.
- No activar el cron diario de las 08:00 todavía — solo después de confirmar un turno de agente real funcionando.
- No retirar `isabel-bridge.js` ni modificar `openChat()` todavía.
- No exponer la Control UI de `isabel-gateway` públicamente — administración solo vía `railway ssh` (`gateway.bind: loopback` es deliberado, evita el bloqueo circular de pairing que se encontró en un experimento efímero anterior).
- No tocar el perfil real de OpenClaw del portátil ni Telegram real.
- Los secretos (`ANTHROPIC_API_KEY`, `ISABEL_API_KEY`, `OPENCLAW_GATEWAY_TOKEN`) solo entran como variables de entorno en Railway — nunca en literales de config versionada, nunca impresos en chat. Ya hubo una filtración accidental de `ANTHROPIC_API_KEY` en la salida de esta sesión (riesgo #9 de `SECURITY.md`) — extremar cuidado con comandos tipo `env`, `printenv`, o cualquier eco de comando que pueda incluir el valor.
- Ninguna migración DDL contra Supabase sin mostrar antes el SQL exacto y esperar aprobación explícita.
- El CheckIn real de 2026-08-05 (`sleep_minutes: 375`) y el resto de datos históricos de `checkins`/`interventions` no se tocan.
- No crear una segunda implementación paralela de Isabel.

## Qué documentos debe leer el siguiente chat
`README.md` → este documento → `CURRENT_STATE.md` → `core/AUTOMATIONS.md` (estado técnico completo del Gateway y el bloqueo, con todo lo descartado) → `KNOWN_PROBLEMS.md` (mismo bloqueo, formato de deuda técnica) → `isabel-gateway/README.md` (comandos de administración por SSH) → si hay que tocar Supabase: `SECURITY.md` riesgo #9 primero. `DECISIONS.md` D10 tiene la arquitectura ya aprobada, no hace falta releerla salvo duda de diseño.
