Estado: arquitectura de runtime aprobada (D10), nada desplegado en producción todavía — sigue sin haber ninguna automatización real corriendo sola
Última verificación: 2026-08-05
Verificado en: auditoría read-only de la instalación real de OpenClaw v2026.6.10 + dos experimentos locales en perfil dev aislado (cron vía CLI, cron vía Control UI) + búsqueda de cron/schedulers/triggers en los tres repos de LIFEOS — sin resultados propios
Fuente de verdad de datos: ninguna

# core/AUTOMATIONS.md — Qué corre solo, y qué no

## Verificado: sigue sin haber ninguna automatización real corriendo hoy en producción
Ningún cron job, scheduler, webhook programado ni trigger de Supabase (más allá de los `DEFAULT now()` de columnas de timestamp) corre en producción hoy en ninguno de los tres repos de LIFEOS. Todo lo que ocurre en el sistema sigue ocurriendo porque la usuaria (o un chat de Claude) lo dispara manualmente. Esto no ha cambiado desde la última verificación — lo que cambió el 2026-08-05 es que ahora existe una decisión arquitectónica aprobada sobre **cómo** se construirá la automatización, más una pieza de dominio (Salud/sueño) ya lista para ser disparada por ella. Ver `DECISIONS.md` D10.

## Decisión de arquitectura (D10): OpenClaw como runtime autónomo
**Aprobado, no desplegado.** OpenClaw pasa a ser el runtime que en el futuro ejecutará el ciclo Gateway → cron → sesión de agente → tools MCP → canal de entrega (Telegram u otro), mientras LIFEOS/`isabel-api` sigue siendo la única fuente de verdad de estado, reglas, deduplicación, especialistas y auditoría. El bridge local (`isabel-bridge.js`, ver `core/ISABEL_CHANNELS.md`) queda congelado — sin funcionalidad nueva — pendiente de retirarse cuando OpenClaw esté realmente en producción, pero no se ha borrado.

## Lo que se probó en el spike (perfil `dev` aislado de OpenClaw, nunca el perfil real ni Telegram real)
- **Control plane de cron vía CLI (`agent`/`cron` con token compartido): FALLA.** Bloqueado por el scope `operator.admin`, que la autenticación por token compartido no concede sobre el protocolo WS que usa la CLI (esa vía de bypass documentada solo aplica a superficies HTTP concretas, no al WS de cron). Confirmado no investigar workarounds de pairing — instrucción explícita de la usuaria de parar ante ese error.
- **Control plane de cron vía Control UI (navegador, auto-aprobación de loopback): FUNCIONA.** Esta es la vía confirmada para administrar cron en una futura configuración real. El job se creó y se disparó correctamente en el horario programado.
- **Ejecución del agente aislado disparado por ese cron: FALLA de forma no explicada.** Al dispararse el cron, el turno de agente no llegó a arrancar (`"cron: isolated agent setup timed out before runner start"`). No investigado — fuera del objetivo acotado de esa fase — ver `KNOWN_PROBLEMS.md`.
- **Tools MCP de Salud/sueño invocadas por un agente real de OpenClaw: FUNCIONA**, en una sesión manual (no vía cron), con resultado correcto contra Supabase real. Ver `modules/HEALTH_AND_GYM.md`.

## Lo más cercano a "automático" que existe hoy en producción (sin cambios respecto a antes)
- **Aircraft Readiness**: se recalcula automáticamente al entrar en la vista de VistaJet o al volver del HOTO — evaluación bajo demanda al navegar, no un proceso en background.
- **Migración de checklist localStorage → Supabase**: corre automáticamente la primera vez que se abre el HOTO tras el deploy, disparada por la carga de la vista, no por un scheduler.
- **El bot de Telegram** (`lifeos-agent`) responde a mensajes entrantes — no actúa por iniciativa propia ni en background.

## Antes de desplegar OpenClaw como runtime real, quedan bloqueantes sin resolver
1. `isabel-api/src/mcp.js` no tiene autenticación — no se puede conectar un Gateway remoto hasta resolverlo (ver `SECURITY.md`).
2. El fallo de "isolated agent setup timed out" no está explicado — no se puede confiar en cron para producción sin entender esta causa.
3. Telegram necesita un bot nuevo y dedicado — el token actual está comprometido (ver `SECURITY.md`) y, además, un mismo token no puede compartirse entre `lifeos-agent` y OpenClaw sin conflicto de long-polling (409).

## Próximo experimento decidido
Ninguno iniciado automáticamente. El siguiente paso (Fase 3 en adelante del plan de convergencia, ver `DECISIONS.md` D10) requiere autorización explícita nueva de la usuaria antes de ejecutarse.
