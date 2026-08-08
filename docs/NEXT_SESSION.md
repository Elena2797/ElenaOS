Última actualización: 2026-08-08 (segunda tanda) — handoff corto, no histórico acumulativo

# NEXT_SESSION.md

## Qué se terminó en esta sesión
**D34–D40**, en dos tandas. La primera: auditoría sistemática de correlación de entidad (14 hallazgos, varios vivos), evaluador proactivo determinista, instrumentación real del consumo, y coherence pass.

La segunda cerró **el eslabón que faltaba, la ENTREGA**: `domain signals → global priority → proactive gate → INTERVENTION persistente → DELIVERY → canal → respuesta → apply → reevaluación`. Vía oficial de OpenClaw (tool `message` por `POST /tools/invoke`, `operator.write` — no admin), una ruta nueva y estrecha en el adaptador, entrega **exactamente una vez sin migración** (el candado es el índice único que ya existía), y **verificado de punta a punta en producción** con una Intervention de prueba limpiable: crear → entregar a Telegram (1 envío) → 2º y 3er ciclo sin reenvío → responder → resolver → reevaluar en silencio → limpiar.

Además: **stale operational context formalizado** (current / stale-open / histórico / superseded) con una sola pregunta deduplicada que ya se ve en Home, y **el análisis de por qué cuesta lo que cuesta**: el coste es el contexto (25.833 tokens de mediana por turno), no el mensaje (3 tokens).

## Qué quedó pendiente
1. **Disparador periódico del ciclo.** `POST /v1/interventions/cycle` funciona y es idempotente, pero **hoy solo corre a mano**. La vía limpia y ya investigada es un cron de OpenClaw con **payload de comando** (`--command`), que ejecuta un script en el host del Gateway **sin turno de agente** y entrega su stdout por `announce` (un comando que imprime solo `NO_REPLY` no publica nada). Crear cron exige `operator.admin`: bloqueado por CLI, alcanzable por `POST /tools/invoke` desde dentro del contenedor o por Control UI con túnel SSH. **No se ha creado: es una automatización nueva que empieza a escribir a Telegram sola.**
2. **`cacheRetention` y modelo del agente.** Medido: ~0,29 $ de 1,49 $ se van en escribir caché que nunca se lee. Es config de OpenClaw con trade-off real (afecta a las ráfagas conversacionales; el TTL largo de Anthropic cuesta ×2 escribir). Decisión de la usuaria, con datos en `GET /v1/usage/analysis`.
3. **2 sesiones abiertas de 9H-VCQ.** El sistema ya lo pregunta en Home. Cerrarlas es irreversible y sigue siendo acción suya desde Inventario.
4. **Sesión de inventario para D-AFBS** — sin ella no se cierra la prueba de escritura de Inventario. **No fabricar conteos.**
5. **Rotar `ANTHROPIC_API_KEY`** (runbook en `operations/ROTAR_ANTHROPIC_KEY.md`).
6. **Barrido de consumo periódico**: `POST /v1/usage/sweep` solo corre a mano y tras cada turno de `/v1/chat`; los turnos de Telegram solo se registran cuando alguien barre.
7. Gateway antiguo y `faithful-light`: detenidos, conservados como rollback.

## Qué debe hacerse inmediatamente después
1. **Decidir el disparador** (punto 1 de arriba). Antes de automatizarlo, `GET /v1/proactive/evaluate` es dry-run y cada "no" trae su motivo: mirarlo unos días dice si el umbral es correcto.
2. **Migrar los bloques de VistaJet/JETMI que aún viven en `globalContext.js`** al contrato universal. Hay un test que mide esa deuda y falla si crece.
3. Siguiente dominio (Gym, Finanzas…) **solo cuando la usuaria lo elija**.

## Qué no debe romperse
- **Nunca operar con datos de otra entidad**, y **omitir la matrícula falla en alto**. El wildcard hay que nombrarlo (`getAnyOpenSessionUnscoped`/`getAnyActiveHotoUnscoped`).
- **Toda señal declara `subject`** (hay test).
- **`existe` ≠ `merece atención` ≠ `merece interrumpirme`.** Solo `urgent` interrumpe. La puerta es determinista y **nunca se despierta al modelo para decidir si hay que despertar al modelo**.
- **La sesión conversacional NO es la base de datos.** El estado de una pregunta vive en `interventions`. Nada puede depender de que el LLM "recuerde que preguntó": se resuelve por `domain`+`kind` contra Supabase.
- **La decisión es del Core; el transporte, del runtime.** Ninguna lógica de dominio dentro de Telegram, ninguna lógica de transporte dentro de un specialist. Un dominio nuevo registra un renderer.
- **`chat.send` conversa, `message` entrega.** No unificarlas: entregar por chat convierte cada aviso en un turno de agente, que es el 94-98% del gasto.
- **Entrega exactamente una vez.** El reclamo es un INSERT directo, nunca `createIntervention()` (esa converge a propósito y haría que dos procesos creyeran haber ganado).
- **Responder no ejecuta.** `applied:false` significa que no se hizo; no decirle que sí.
- **Un coste duplicado es un dato FALSO**; uno que falta es incompleto.
- **ON/OFF es contexto, no evidencia** (`PRINCIPLES.md` #12). **No inventar reglas cuando falta el dato.**
- Un solo poller de Telegram. Secretos solo como variables de entorno en Railway. No reactivar `lifeos-agent`.

## Qué documentos debe leer el siguiente chat
`README.md` → este documento → `CURRENT_STATE.md` → `DECISIONS.md` **D34–D40** (D14/D15/D28 para la historia de las fugas) → `core/signals.js`, `core/proactive.js`, `core/delivery.js` (los tres contratos) → `KNOWN_PROBLEMS.md` → `PRINCIPLES.md` #11 y #12.

## Trampas aprendidas (ahorran horas)
- **Un instrumento que devuelve cero no dice "no hay nada".** El barrido de consumo reportó `seen: 0` sobre 63 turnos reales, sin error, porque buscaba un campo `id` que no existe (es `responseId`). Verificar la FORMA real del dato antes de creerse un cero.
- **Convergencia ≠ exclusión mutua.** `createIntervention()` devuelve la fila ganadora ante un duplicado — correcto para una pregunta, catastrófico para un candado.
- **`\b` no funciona con acentos.** `/^s[ií]\b/` no casa con "sí".
- **Ignorar la caché al calcular coste de LLM** es la diferencia entre 0,00004 $ y 0,087 $ en el mismo turno.
- **`esc` en `main.js` no es un helper compartido**: son tres consts locales distintas, y escapan solo comillas.
- Vite **no lee `PORT`**. Railway: un deployment puede quedar `FAILED` sin logs mientras sirve el anterior; `--skip-deploys` + `restart` no inyecta variables nuevas, hace falta `redeploy`.
