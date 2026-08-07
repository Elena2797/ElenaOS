Última actualización: 2026-08-07 — handoff corto, no histórico acumulativo (para eso está CHANGELOG.md)

# NEXT_SESSION.md

## Qué se terminó en esta sesión
Sesión larga de consolidación arquitectónica, **D18–D33**. Lo estructural: (1) **una sola Isabel** — `openChat()` dejó de usar el bridge local y la pestaña Isabel de LIFEOS habla con el mismo agente `main` que Telegram, vía `POST /v1/chat` → red privada IPv6 → `gateway-adapter`; para eso se migró `isabel-gateway` al proyecto Railway de `isabel-api` (blue/green con backup y restore de volumen, **el cron sobrevivió con su id original**) y se hizo el cutover de Telegram con ventana verificable de cero pollers. (2) **El Core decide, el frontend representa** — Home pasó de cuatro cálculos de prioridad contradictorios a uno; sin `/v1/now`, el frontend reutiliza el último resultado o declara que no hay decisión, nunca inventa. (3) **Contrato universal de señales** (`core/signals.js`) con relevancia temporal: *existe* ≠ *merece atención ahora*; una señal declara cuándo escala y cuándo caduca, y el Core lo aplica **sin conocer ningún dominio** (test de invariante). (4) **VistaJet como segundo cerebro**: señales deterministas reales — `offload_pending` con *"blue bag in aft lav closet"*, `magazine_renewal_needed` con *Vogue Summer, Economist, time*, `stock_low`, `inventory_missing`, `cabin_defect_open` — con severidad `informational|actionable|time_sensitive|blocking`, donde informational **nunca** genera aviso. (5) **Observabilidad de coste** mínima sobre `eventos`. (6) Limpieza: Gym visible (era un bug), FAB duplicado fuera, `dashboardView` huérfana eliminada, CTAs indistinguibles diferenciados, `faithful-light` (Isabel Core huérfano con dominio público y secretos) **detenido de forma reversible**.

**Cinco bugs reales corregidos, todos encontrados verificando en producción, no leyendo código:** el scope de inventario por avión (un conteo por Telegram habría escrito en el avión anterior), una condición de carrera en la correlación de respuestas del chat, la degradación silenciosa de señales migradas, la fuga de jerga interna al texto visible de Isabel, y `time_sensitive` traducido a urgencia permanente.

## Qué quedó pendiente
1. **BLOQUEANTE — sin crédito en Anthropic.** Isabel no puede responder por ningún canal. Recargar en `console.anthropic.com` → Plans & Billing. La capa determinista sigue funcionando, así que LIFEOS muestra prioridad real igualmente.
2. **Rotar `ANTHROPIC_API_KEY`** — runbook completo en `operations/ROTAR_ANTHROPIC_KEY.md`. Hacerlo a la vez que la recarga para no reiniciar servicios dos veces. La clave nueva **no debe pasar por el chat**: se pega directamente en Railway.
3. **Sesión de inventario para D-AFBS** — sin ella no se puede cerrar la prueba de escritura de Inventario por la ruta unificada. **No fabricar conteos.** Hasta entonces, el chat legacy de Inventario se conserva.
4. **Gateway antiguo y `faithful-light`**: ambos detenidos/sin Telegram, conservados como rollback. Eliminarlos requiere autorización explícita.

## Qué debe hacerse inmediatamente después
1. **Auditoría sistemática de correlación de entidad en VistaJet.** Ya han aparecido tres fugas entre aviones (D14, D15, D28) y las tres se encontraron por accidente. Toca recorrer **todos** los caminos de lectura y escritura del dominio —no solo los que ya fallaron— y verificar que cada uno filtra por el avión actual. `dropStaleSignals()`/`subject` ya dan la primitiva general; falta aplicarla. Revisar también qué debe caducar al cambiar aircraft, rotación, generación de HOTO o sesión de inventario.
2. **Bucle de evaluación proactiva general.** Hoy hay un cron por caso (sueño). El objetivo es un evaluador periódico que lea señales/prioridades y **solo despierte a Isabel cuando haya algo que merezca interrumpir**, reutilizando `/v1/now`, specialists e `interventions`. **No tocar el cron de sueño** hasta demostrar que la alternativa es mejor y segura.
3. **Punto ciego de instrumentación.** `aiUsage.js` mide `isabel-api`, pero **no** los turnos del agente en OpenClaw — que son casi con seguridad el grueso del gasto (Sonnet, contexto largo). Sin eso, la respuesta a "cuánto cuesta Isabel" está incompleta. El adaptador ya ve `chat.history`, que incluye `usage` real por mensaje: es el punto natural donde instrumentarlo.
4. Terminar la coherence pass: presentación de VistaJet y JETMI dentro de su vista de área, botón `+`, textos técnicos residuales.

## Qué no debe romperse
- **Una Isabel, una sesión (`lifeos`), una prioridad, una verdad.** Capacidad nueva = specialist en `isabel-api/src/core/specialists/`, nunca un chat nuevo. `isabel-bridge.js` y `services/isabel.js` están LEGACY/FROZEN.
- **El Core no conoce dominios.** `core/signals.js` no puede contener literales de dominio — hay un test que falla si alguien lo intenta, y un guardarraíl que mide la deuda preexistente de `globalContext.js` para que no crezca. Un dominio nuevo se conecta emitiendo señales, no tocando el motor.
- **`resolveHomePriority()` no calcula prioridad**: representa la del Core o declara que no hay.
- **Existe ≠ urgente.** Una señal escala por su ventana temporal, no por su tipo. Ventana `unknown` **nunca** escala: sin dato no se afirma urgencia.
- **Nunca operar con datos de otra entidad.** Ni inventario, ni HOTO, ni señales de otro avión (`PRINCIPLES.md` #11, D14/D15/D28).
- **ON/OFF es contexto, no evidencia** (`PRINCIPLES.md` #12): no sincronizarlo con `vj_state`, no citarlo en texto visible (`checkJargon()` lo audita).
- **No inventar reglas cuando falta el dato.** Sin cadencia definida no hay señal: `laundry` (tabla vacía), `cabin_care` (fechas sin cadencia), reposición desde el texto libre de `shopping`, `req_qty` (a 0 en todos los items).
- **Determinista primero**: si una regla puede concluir "no hay nada relevante", no se despierta al LLM. `/v1/now` con `clear` no llama a Anthropic.
- Un solo poller de Telegram, siempre. Secretos solo como variables de entorno en Railway. No reactivar `lifeos-agent`.

## Qué documentos debe leer el siguiente chat
`README.md` → este documento → `CURRENT_STATE.md` → `DECISIONS.md` **D18–D33** → `core/signals.js` (el contrato) → `operations/GATEWAY_MIGRATION.md` (topología real, modelo de sesión, threat model del adaptador) → `KNOWN_PROBLEMS.md` (empezando por el bloqueante de crédito) → `PRINCIPLES.md` #11 y #12.

## Trampas de infraestructura aprendidas (ahorran horas)
- Un deployment de Railway puede quedar **`FAILED` sin ningún log de build**, mientras `status` dice "Building" y la app responde — porque sirve el deployment **anterior**. Comprobar `commitHash` del deployment antes de buscar el bug en el código.
- `railway variables --set … --skip-deploys` **no** llega al contenedor, y `railway restart` **tampoco**: hace falta `railway redeploy`.
- Cambiar `gateway.bind` en dos `config set` seguidos deja el Gateway en crash-loop **sin acceso SSH ni a los ficheros del volumen**. Van juntos.
- El esquema de config de OpenClaw **rechaza claves desconocidas en la raíz**: una clave `_comment` impide el arranque.
