Estado: parcial — una entrada viva (canary conversacional, 2026-09-22); el resto de O5 sigue implementado y desconectado
Última verificación: 2026-09-22
Verificado en: isabel-api `789df11` (`src/core/knowledgeCanary.js`, `src/__tests__/knowledgeCanary.test.js`, guard O5), life-os-app `b6376a2`
Fuente de verdad de datos: filas `eventos.herramienta = 'lifeos:knowledge'` (DATA_MODEL.md)

# Bucle universal de conocimiento de LIFEOS

## AS-IS auditado

Telegram y el chat de LIFEOS hablan con el mismo agente OpenClaw y comparten sus herramientas, pero usan sesiones conversacionales distintas (`main` y `lifeos`). Comparten Supabase solo cuando una tool de dominio escribe allí. El transcript no es estado operativo.

Hoy sí cruzan la frontera conversación → datos: VistaJet, Gym, Salud e Inventario, cada uno mediante sus tools explícitas. Un hecho general que no corresponde a una de esas tools puede ser entendido y contestado por Isabel, pero queda en la conversación/memoria del agente. `/v1/chat` transporta mensajes y registra consumo; no clasifica ni persiste conocimiento general. `/v1/now` lee tareas, decisiones, esperas, alertas, proyectos, contexto y señales de specialists; no lee objetivos universales ni cambios de vida.

La consecuencia precisa es: **“Isabel lo oyó” no implica “LIFEOS lo sabe”**.

## TO-BE

```text
superficie autorizada
  → interpretación estructurada inicial (la única fase que puede necesitar IA)
  → política de escritura determinista
  → ledger inmutable común
  → fold de estado/objetivos/historial
  → specialists interesados
  → señales + transiciones de objetivos + candidatos de acción
  → prioridad global
  → /v1/now
  → Home / Telegram / otras superficies
  → feedback
  → ledger y reevaluación
```

Después de la interpretación inicial no hay generación, clasificación probabilística ni llamada a un modelo. Persistencia, transiciones, ranking, reconstrucción y feedback son deterministas y cuestan $0 de IA.

## Contrato de conocimiento

Tipos canónicos: `FACT`, `STATE`, `EVENT`, `PREFERENCE`, `GOAL`, `SUBGOAL`, `COMMITMENT`, `CONSTRAINT`, `OBSERVATION`, `METRIC`, `DECISION`, `ASSUMPTION`.

Procedencia obligatoria: `USER_REPORTED`, `SYSTEM_DERIVED`, `CONNECTED_SOURCE`, `DOCUMENT`, `MANUAL_UI`, `IMPORT`, `AGENT_INFERENCE`.

Confianza obligatoria: `KNOWN`, `DERIVED`, `LIKELY`, `UNKNOWN`.

Cada registro incluye identidad estable, dominio, título o valor, sujeto opcional, procedencia, confianza, superficie, vigencia, fecha de reevaluación, objetivos afectados y metadatos. Los cambios significativos aparecen en “Cambios recientes”; los técnicos o rutinarios no.

## Política de escritura

La decisión usa explicitud, confianza, reversibilidad, sensibilidad, impacto, intención, autoridad y ambigüedad:

| Resultado | Cuándo | Persistencia |
|---|---|---|
| `AUTO_WRITE` | Explícito o autoritativo, `KNOWN`/`DERIVED`, reversible y sin riesgo alto | Sí |
| `PROPOSE_AND_CONFIRM` | Sensible, irreversible, alto impacto, autoridad dudosa o ambigüedad alta | No hasta confirmación |
| `EPHEMERAL_ONLY` | Inferencia `LIKELY`/`UNKNOWN` no afirmada ni autoritativa | No |
| `IGNORE` | Sin intención de recordar o irrelevante | No |

Una `Intervention` solo se crea si `PROPOSE_AND_CONFIRM` requiere realmente interacción humana. No se usa como cola genérica de avisos.

## Ledger y reinicio

Se reutiliza `eventos`, sin nueva tabla ni migración destructiva. Solo las filas con `herramienta='lifeos:knowledge'` pertenecen a este ledger y su `texto` contiene un envelope JSON versionado. No se reinterpretan eventos históricos de otros módulos.

El estado corriente se obtiene plegando eventos en orden de append. `occurred_at` describe cuándo sucedió el hecho; no controla el orden de actualización, para que una importación histórica no deshaga el estado actual. Objetivos, señales, acciones y feedback se reconstruyen desde cero tras cualquier reinicio.

La copia desconectada pagina el ledger completo y falla explícitamente si una página no puede leerse. El runtime productivo todavía no monta este read model. Los snapshots compactados verificables quedan como optimización futura, nunca como permiso para truncar silenciosamente.

## Objetivos

Se distinguen `ASPIRATION`, `GOAL`, `SUBGOAL`, `PROJECT`, `TASK` y `HABIT`. Solo aspiraciones, objetivos y subobjetivos entran al ciclo de vida de objetivos; proyectos, tareas y hábitos pueden vincularse, pero no se disfrazan de objetivo.

Estados: `ACTIVE`, `PAUSED`, `ACHIEVED`, `ABANDONED`, `BLOCKED`, `SUPERSEDED`. Cada transición exige razón y evidencia, se añade al historial y nunca sobrescribe el pasado.

Campos soportados: porqué, alcance, horizonte, criterio de éxito, fecha objetivo, padre, proyectos vinculados y siguiente acción.

## Specialists

El registro universal acepta opcionalmente `evaluateKnowledge({snapshot, change})`. Cada specialist recibe el estado relevante, los objetivos y el cambio causante; puede emitir señales universales, transiciones de objetivos con razón y evidencia, Action Candidates y, en la arquitectura O5 preparada, `follow_up_requests`. Una necesidad de intake no es una Intervention; Intervention queda reservada para confirmar una mutación de alto impacto.

El Core agrega esos contratos y aísla fallos. No contiene `if domain === ...`. El E2E usa un dominio sintético desconocido: disponibilidad `false` bloquea un objetivo y propone una alternativa; `true` lo reactiva y sustituye la prioridad.

## Action Candidate y prioridad

Un candidato requiere título, dominio, razón y evidencia. Puede enlazar objetivo e incluir urgencia, importancia, impacto, esfuerzo, fecha límite, confianza, bloqueos, si desbloquea y procedencia.

El orden es lexicográfico y explicable, no una puntuación falsa: ejecutable antes que bloqueado; urgencia; importancia; fecha; impacto; confianza; esfuerzo como desempate. El resultado incluye `priority_basis`. Las acciones rechazadas, ignoradas, completadas o reemplazadas dejan de competir.

## Feedback

Aceptar, rechazar, ignorar o completar una recomendación añade `ACTION_FEEDBACK`, actualiza el candidato al reconstruir el ledger y aparece como cambio reciente. El resultado u observación puede alimentar la reevaluación siguiente.

## Frontera de activación O4

El motor, contratos, fold, route preparada y E2E están implementados en `isabel-api`, pero durante la observación iniciada en `2026-08-09T13:22:00Z` permanecen desconectados de `index.js`, `/v1/now`, Home y MCP. Activarlos cambiaría la API viva o las lecturas de producción durante el baseline.

Después de cerrar O4, la secuencia segura es:

1. montar las rutas deterministas;
2. integrar el snapshot y Action Candidates en `/v1/now` sin cambiar el prompt, modelo ni catálogo;
3. convertir Home en representación de esos campos y conectar feedback;
4. adaptar los writers existentes para emitir envelopes universales;
5. solo después, añadir una única entrada conversacional genérica al catálogo MCP, con medición separada del coste de interpretación.

Hasta el paso 5, un hecho general dicho por Telegram seguirá sin cruzar automáticamente a estado estructurado. Esta limitación es deliberada y visible, no una promesa implícita. La copia desconectada ya contiene y prueba `KnowledgeCandidate:v1`; aún no existe una tool viva que lo entregue.

## Canary vivo (2026-09-22)

Se activó **una sola entrada**, la conversacional, antes que los pasos 1–4 de arriba: era el hueco que más se notaba ("Isabel lo oyó" ≠ "LIFEOS lo sabe") y es la que menos toca del runtime. Qué entra y qué no:

- **Entrada:** tool MCP privada `knowledge_remember`. Isabel ya entiende la frase en Telegram y la pasa estructurada (tipo, dominio, título en tercera persona y sus palabras). La interpretación es el turno de conversación que ya existía: no hay llamada de IA añadida. `src/core/knowledgeCanary.js` la convierte en `KnowledgeCandidate:v1` (`USER_REPORTED`, `KNOWN`, explícita, reversible, superficie `telegram`) y la pasa por la misma Write Policy y el mismo ledger. Es el único módulo vivo que importa O5; el guard lo comprueba.
- **Límites del canary:** 6 tipos (`PREFERENCE`, `GOAL`, `COMMITMENT`, `CONSTRAINT`, `FACT`, `STATE`), dominios conocidos, sin sensibilidad alta, tope diario; si la política no da `AUTO_WRITE` (ambigüedad) no se escribe y no se abre Intervention: Isabel pregunta. Sin specialists, FollowUps ni entrega.
- **Identidad y deduplicación:** `entity_id` = tipo + dominio + título normalizado (sin tildes, mayúsculas ni signos); clave idempotente = entidad + sus palabras + día de Madrid; índice único en la base.
- **Uso:** `knowledge_recall` (lo vigente; lo caducado por `valid_until` deja de contar) y los tres mensajes de coach lo llaman.
- **Olvidar:** `knowledge_forget` y "Olvidar" en la app escriben `KNOWLEDGE_RETRACTED`; el fold lo quita del estado y lo guarda en `retracted`.
- **Superficie:** `GET /v1/app/knowledge` (token de app) → Dominios, "Lo que Isabel sabe de ti". Ni chat (D55) ni Inicio (D59).
- **Operación:** `LIFEOS_KNOWLEDGE_STAGE` y rollback en `operations/O5_CANARY.md`. Decisión: `DECISIONS.md` D63.

Sigue desconectado: rutas `routes/knowledge.js`, `/v1/now`, Home adaptativo, FollowUps, specialists con `evaluateKnowledge`, entrega.

## O5 Closed Loop preparado

La decisión formal de FollowUp, suppression, deferrals, friction, Waiting For,
Home adaptativo y activación posterior está en
`docs/core/ADR_O5_FOLLOW_UP_CLOSED_LOOP.md`. Su implementación vive únicamente
en la copia desconectada y tiene un guard de hashes/import graph que impide
alcanzarla desde el runtime O4.
