# ADR O5 — Closed Loop con una única entidad FollowUp

Estado: **aprobado e implementado en copia desconectada; no activado**  
Fecha: 2026-08-09  
Backend: `94c660bbdccb3b97efbb62046dff29f5d86dcb43`  
Frontend: `db23828a4b390b2ff01ebb3732b110b98c47685a`  
Activación bloqueada por O4 hasta `2026-08-11T13:22:00Z`.

## Decisión

LIFEOS incorpora una única entidad operacional nueva: `FollowUp`.

- FollowUp representa una incertidumbre que LIFEOS necesita resolver.
- Action Candidate, committed Action/Task, Decision, Waiting For, FollowUp e
  Intervention conservan semánticas distintas.
- Information Gap es razón/evidencia, no tabla.
- Presentations, attempts, deferrals y resolution son eventos del ledger.
- Intervention solo confirma una mutación de alto impacto.

Una sola fila operacional aporta consultas, deduplicación y compare-and-swap.
Los eventos preservan cada transición y permiten reconstrucción. Crear tablas
para gap, attempt, deferral y resolution añadiría identidades sin invariantes.

## Contrato

Identidad:

- `id`, `signature` y `semantic_key`.
- `signature_scope` distingue cambios materiales de incertidumbre.
- `scope_key` y `fact_fingerprint` soportan suppression.

Contenido:

- `kind`, `domain`, `need`, `reason`, `evidence` y `origin`.
- relaciones opcionales a goal, action, decision, Waiting For o sujeto;
- `answer_schema` y `reevaluate_targets`.

Operación:

- `status`, `next_eligible_at`, condición estructurada y `valid_until`;
- `ALLOW_PUSH | HOME_ONLY`;
- contadores, fechas, resolución y suppression;
- `version`, `last_operation_id` y `last_operation_result`.

Kinds: `INFORMATION_REQUEST`, `DECISION_REQUEST`, `STATE_REVALIDATION` y
`OUTCOME_OBSERVATION`. Friction es evidencia para `INFORMATION_REQUEST`, no kind.

## State machine

| Desde | Transiciones permitidas |
|---|---|
| `OPEN` | `SCHEDULED`, `AWAITING_CONFIRMATION`, `RESOLVED`, `DISMISSED`, `SUPERSEDED`, `CANCELLED` |
| `SCHEDULED` | `OPEN`, `AWAITING_CONFIRMATION`, `RESOLVED`, `DISMISSED`, `SUPERSEDED`, `CANCELLED` |
| `AWAITING_CONFIRMATION` | `OPEN`, `RESOLVED`, `SUPERSEDED`, `CANCELLED` |
| `RESOLVED` | ninguna |
| `DISMISSED` | ninguna |
| `SUPERSEDED` | ninguna |
| `CANCELLED` | ninguna |

Presentar, responder ambiguamente o mover Home-only cambia metadata/version,
pero no inventa estados.

Eventos:

- `FOLLOW_UP_OPENED`
- `FOLLOW_UP_PRESENTED`
- `FOLLOW_UP_DEFERRED`
- `FOLLOW_UP_REACTIVATED`
- `FOLLOW_UP_ANSWER_ATTEMPTED`
- `FOLLOW_UP_CONFIRMATION_REQUESTED`
- `FOLLOW_UP_RESOLVED`
- `FOLLOW_UP_DISMISSED`
- `FOLLOW_UP_SUPERSEDED`
- `FOLLOW_UP_CANCELLED`

`FOLLOW_UP_CONFIRMATION_REQUESTED` es necesario para reconstruir
`AWAITING_CONFIRMATION`. `FOLLOW_UP_REACTIVATED` audita wake-up o reevaluación
tras rechazo. Sin ellos el fold no podría reconstruir todas las transiciones.

## Signature, idempotencia y concurrencia

La signature incluye kind, dominio, semantic key, relaciones, sujeto y scope
semántico. Excluye wording, fecha, contadores, superficie, origin y evidence
volátil. Dos specialists/superficies convergen. Un cambio material modifica
`signature_scope`; un contador o wording no.

Contrato futuro:

```text
answerFollowUp(follow_up_id, expected_version, idempotency_key, answer, source_surface)
```

- misma operación devuelve el mismo resultado;
- versión antigua produce conflicto;
- primera respuesta válida gana;
- posterior idéntica informa ya resuelto;
- posterior distinta no sobrescribe;
- ambigua registra attempt y no resuelve.

La proyección conserva un mapa durable `operation_results` por
`idempotency_key`: una operación antigua sigue devolviendo su propio resultado
aunque después hayan ocurrido otras operaciones válidas. El ledger permite
reconstruir ese mapa.

Fila y evento deben escribirse en una transacción Postgres. El SQL preparado
aporta versión e índice único; el RPC transaccional espera a activación.

## Suppression

`DISMISSED` conserva política evaluable. Antes de crear/presentar se ejecuta
lógicamente `isSuppressed(signature, context)`.

- `THIS_FOLLOW_UP`: esa firma.
- `UNTIL_DATE`: scope hasta fecha.
- `UNTIL_CONDITION`: scope hasta condición estructurada true.
- `WHILE_FACT_UNCHANGED`: scope mientras coincida fingerprint.
- `SCOPE_PERMANENT`: scope exacto o prefijo permanente.

Dependencia desconocida falla cerrado. Una supresión concreta permite una nueva
incertidumbre material; una permanente de scope la bloquea.

## Deferrals y wake-up

- fecha: `SCHEDULED` + `next_eligible_at`;
- condición: AST restringido `EQ/NEQ/IN/EXISTS/AND/OR/NOT` y paths;
- Home-only: abierto sin push.

Las condiciones publican dependencias. Un cambio relacionado reevaluá: true
reactiva, false conserva schedule, unknown falla cerrado. Si algo no puede
expresarse estructuralmente se usa fecha, Home-only o aclaración.

Pause, reject, abandon, blocked y superseded pertenecen a Goal/Action/Waiting
For; no son nuevos estados FollowUp.

## Action Candidate y friction

Presentar una recomendación no constituye compromiso. Friction exige `ACCEPTED`,
obligación externa, compromiso explícito o responsabilidad estructurada.
Presentarla diez veces no cuenta. Una acción superseded nunca genera friction.

El detector puro requiere además goal activo, acción ejecutable, ausencia de
bloqueo/Waiting For, dos deferrals explícitos en interacciones distintas o dos
ventanas vencidas, y ausencia de suppression. No usa otras tareas, menciones
conversacionales ni psicología. Produce evidencia y schema neutral; no abre
preguntas en O4.

## Waiting For

Waiting For representa dependencia externa, no pregunta. Completar acción no lo
crea automáticamente. Solo lo declara resultado estructurado, specialist o
evidencia estructurada. No se analiza texto. Sin fecha sigue activo, pero no
escala ni genera nagging.

## Intervention

Si una respuesta cae en `PROPOSE_AND_CONFIRM`:

1. se registra attempt;
2. FollowUp pasa a `AWAITING_CONFIRMATION`;
3. Intervention se enlaza a `follow_up_id + version`;
4. aceptación aplica y resuelve;
5. rechazo resuelve sin cambio o reactiva, de forma explícita.

El pipeline Knowledge preparado devuelve `follow_up_requests`. El registry
activo no cambia durante O4.

## Value of Information

Primero filtra terminales, suppressed, scheduled no vencidos, condiciones
false/unknown, irrelevantes, fuentes no fiables y respuestas conocidas.

Orden lexicográfico:

1. desbloqueo de acción/decisión;
2. deadline, wait vencido o riesgo temporal;
3. importancia;
4. stale risk;
5. confidence gap;
6. downstream dependents;
7. menor esfuerzo;
8. nunca/menos recientemente presentado;
9. firma estable.

No suma puntos. Devuelve `priority_basis`.

## Check-in y Home adaptativo

`buildDynamicCheckIn` proyecta 0–3 FollowUps sin sesión/estado, elimina
redundancia y no mezcla automáticamente sensibilidad alta.

El read model backend contiene `now`, `needs_input`, `attention`, `later`,
`empty_state` y `sections`. `sections` solo incluye contenido. Una única pregunta
puede liderar; nada genera empty state; el frontend no calcula prioridad ni
rellena cajas.

## Avanzar, cross-surface y límites

Tras O4, Avanzar se absorberá en Home/NOW porque replica `workQueue()`. No se
modifica en O5.

Telegram y LIFEOS usan el mismo `follow_up_id`. El transcript no es estado.

`follow_ups` es proyección/lock; `eventos` conserva lifecycle. El fold reconstruye
FollowUps. La copia desconectada ya sustituyó `.limit(5000)` por paginación
ordenada y completa; un fallo de cualquier página aborta el read model, nunca
devuelve un snapshot parcial. Los snapshots compactados siguen siendo una
optimización futura, no un requisito de corrección.

## Atomicidad de proyección y ledger

La migración preparada `atomic_follow_up_ledger.sql` añade identidad única del
evento Knowledge y un único RPC transaccional. Apertura, compare-and-swap,
idempotencia, actualización de `follow_ups` e inserción en `eventos` ocurren en
la misma transacción Postgres. No existe fallback de dos escrituras: si falla
el evento, Postgres revierte también la proyección.

## Ingestion conversacional universal preparada

`KnowledgeCandidate:v1` es el contrato mínimo entre una superficie que ya
interpretó la entrada y la Write Policy. Conserva kind, sujeto, payload,
provenance, referencia idempotente, surface, confidence, evidence estructurada,
sensitivity, tiempo e intención de escritura. Rechaza transcript, historial y
mensajes como estado. La surface queda como provenance; nunca participa en la
identidad semántica.

El rollout futuro sigue fail-closed: solo afirmación explícita/autoritativa,
conocida, reversible, no sensible y no ambigua puede ser `AUTO_WRITE`.
Inferencias, sensibilidad, impacto alto o ambigüedad requieren confirmación o
quedan `EPHEMERAL_ONLY`. No hay fallback de memoria LLM.

## Recent Changes

El read model preparado distingue `USER_LIFE_CHANGE`, `OPERATIONAL_CHANGE`,
`GOAL_CHANGE` y `SYSTEM_TECHNICAL_EVENT`. Home solo recibe las tres primeras,
con qué cambió, cuándo, fuente, área afectada y consecuencia. Nunca representa
el ledger técnico ni rellena una sección vacía.

## Activación posterior a O4

1. Cerrar/documentar O4.
2. Revisar y aplicar SQL.
3. Revisar/aplicar la transacción row + ledger ya preparada y ejecutar pruebas DB reales.
4. Montar routes con activación explícita.
5. Migrar solo preguntas genéricas pendientes desde Intervention.
6. Cambiar MCP a ID/version.
7. Migrar specialists activos a `follow_up_requests`.
8. Conectar read model a `/v1/now` y Home.
9. Retirar prioridad browser y absorber Avanzar.
10. Migrar delivery.

Hasta entonces: sin rutas, imports desde runtime, Home, MCP, delivery,
specialists activos, SQL aplicado, commit, push ni deploy.
