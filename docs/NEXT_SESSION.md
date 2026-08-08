Última actualización: 2026-08-08 — handoff corto, no histórico acumulativo (para eso está CHANGELOG.md)

# NEXT_SESSION.md

## Qué se terminó en esta sesión
**D34–D37.** (1) **Auditoría sistemática de correlación de entidad en VistaJet** — todos los caminos de lectura y escritura, no solo los que ya habían fallado. 14 hallazgos, varios vivos: `/v1/confirm` resolvía la sesión sin matrícula (D28 arregló la propuesta y dejó la confirmación), `/v1/session/active` y `/v1/hoto/active` igual, las propuestas no declaraban sujeto pese a tener 5 min de TTL, 7 de 9 señales sin `subject`, `dropStaleSignals()` sin llamarse en ningún sitio, los cuatro loaders del frontend cayendo a "cualquier avión" justo cuando la usuaria entrega el avión, las escrituras del HOTO sin revalidar el sujeto, y la migración del checklist copiando ticks sin matrícula al HOTO actual **y de ahí al PDF oficial**. La corrección es estructural: **omitir la matrícula lanza**; el wildcard hay que nombrarlo. (2) **Evaluador proactivo general** (`core/proactive.js`), determinista, con dedup sobre `interventions`, horario de silencio y cooldown — sin cron nuevo y **sin tocar el de sueño**. (3) **Instrumentación real del consumo del agente**: 49 turnos registrados, y la respuesta con datos — **97,8 % del gasto son los turnos del agente**. (4) **Coherence pass**, que destapó tres bugs más.

**El bloqueante de crédito de Anthropic está RESUELTO** (verificado: `/v1/chat` responde). No volver a diagnosticarlo sin comprobarlo primero.

## Qué quedó pendiente
1. **Entrega de una interrupción proactiva.** La decisión ya se toma y se registra, pero el adaptador expone `chat.send`/`chat.history`, no un canal de anuncio. Empujarla a Telegram exigiría escribir en la sesión con binding de canal, que `operations/GATEWAY_MIGRATION.md` ya marcó como hack frágil. **Es una decisión de arquitectura, no un pendiente de implementación.**
2. **Sesión de inventario para D-AFBS** — sin ella no se cierra la prueba de escritura de Inventario por la ruta unificada. **No fabricar conteos.**
3. **Rotar `ANTHROPIC_API_KEY`** (runbook en `operations/ROTAR_ANTHROPIC_KEY.md`). La clave nueva no debe pasar por el chat.
4. **2 sesiones abiertas de 9H-VCQ.** El sistema ya las declara (`stale_open_context`); cerrarlas es decisión de la usuaria — cerrar es irreversible.
5. **Gateway antiguo y `faithful-light`**: detenidos/sin Telegram, conservados como rollback. Eliminarlos requiere autorización explícita.

## Qué debe hacerse inmediatamente después
1. **Migrar los bloques de VistaJet y JETMI que aún viven dentro de `globalContext.js`** al contrato universal. No bloquean añadir dominios (las señales entran por la vía general) pero son el resto de acoplamiento; hay un test que mide la deuda y falla si crece.
2. **Observar el evaluador proactivo antes de automatizarlo.** `GET /v1/proactive/evaluate` es dry-run y cada "no" trae su motivo: mirarlo unos días dice si el umbral es el correcto **antes** de darle un cron o de tocar el de sueño.
3. **Barrer el consumo periódicamente.** `POST /v1/usage/sweep` es idempotente; hoy solo corre a mano y tras cada turno de `/v1/chat`, así que los turnos de Telegram solo se registran cuando alguien barre.
4. Siguiente dominio (Gym, Finanzas…) **solo cuando la usuaria lo elija** — no se asume.

## Qué no debe romperse
- **Nunca operar con datos de otra entidad.** Y ahora, además: **omitir la matrícula falla en alto**. Si algo necesita "cualquier avión", tiene que pedirlo por su nombre (`getAnyOpenSessionUnscoped`/`getAnyActiveHotoUnscoped`) — que un descuido produzca una lectura cross-entidad es justo lo que dejó de ser posible.
- **Toda señal declara `subject`.** Hay un test que falla si alguna sale sin él: sin sujeto, `dropStaleSignals()` la deja pasar intacta.
- **Existe ≠ merece atención ≠ merece interrumpirme.** Solo `urgent` interrumpe; `reentry`/`maintain` esperan a que abra la app. La puerta es determinista y **nunca se despierta al modelo para decidir si hay que despertar al modelo**.
- **Un coste duplicado es un dato FALSO**; uno que falta es incompleto. El barrido es idempotente por `message_id` y omite lo que no puede identificar.
- **Una Isabel, una sesión (`lifeos`), una prioridad, una verdad.** Capacidad nueva = specialist, nunca un chat nuevo.
- **El Core no conoce dominios.** `core/signals.js` no puede contener literales de dominio (test de invariante).
- **`resolveHomePriority()` no calcula prioridad**: representa la del Core o declara que no hay.
- **ON/OFF es contexto, no evidencia** (`PRINCIPLES.md` #12).
- **No inventar reglas cuando falta el dato.** Sin cadencia definida no hay señal.
- Un solo poller de Telegram, siempre. Secretos solo como variables de entorno en Railway. No reactivar `lifeos-agent`.

## Qué documentos debe leer el siguiente chat
`README.md` → este documento → `CURRENT_STATE.md` → `DECISIONS.md` **D34–D37** (y D14/D15/D28 para la historia de las fugas) → `core/signals.js` y `core/proactive.js` (los dos contratos) → `KNOWN_PROBLEMS.md` → `PRINCIPLES.md` #11 y #12.

## Trampas aprendidas (ahorran horas)
- **Un instrumento que devuelve cero no está diciendo "no hay nada".** El barrido de consumo reportó `seen: 0` sobre 63 turnos reales, sin error, porque buscaba un campo `id` que no existe (es `responseId`). Verificar siempre la FORMA real del dato antes de creerse un cero.
- **Ignorar la caché al calcular coste de LLM no es un redondeo**: es la diferencia entre 0,00004 $ y 0,087 $ en el mismo turno.
- Vite **no lee `PORT`**: elige otro puerto en silencio si el suyo está ocupado, y quien lanzó el servidor abre una página en blanco.
- Un deployment de Railway puede quedar `FAILED` sin ningún log de build mientras la app responde — sirve el deployment **anterior**. Comprobar `commitHash` antes de buscar el bug en el código.
- `railway variables --set … --skip-deploys` no llega al contenedor, y `railway restart` tampoco: hace falta `railway redeploy`.
