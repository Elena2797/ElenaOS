Estado: implementado (backend en producción; frontend en producción, pendiente validación manual de la usuaria en iPhone)
Última verificación: 2026-08-03
Verificado en: pruebas empíricas contra datos reales de producción (backend y frontend), deploy verificado en Railway y Vercel
Fuente de verdad de datos: ninguna propia — agrega señales de tasks/decisions/waiting_for/alertas/projects/vj_state/vj_tasks/operators (ver DATA_MODEL.md)

# core/ISABEL_NOW.md — GET /v1/now, la tarjeta "ISABEL · AHORA"

# Objetivo
Primer bloque mínimo para que LIFEOS deje de ser un conjunto de dominios aislados: agregar señales de todos los dominios en un "estado global", clasificarlas de forma determinista y auditable, y que Isabel recomiende qué merece atención ahora mismo al abrir Home — sin que la usuaria tenga que preguntarle. Solo lectura: Isabel no escribe nada, no ejecuta acciones, no activa el chat conversacional.

# Estado real
Implementado y desplegado (2026-08-03). Mismo patrón de arquitectura limpia que `modules/AIRCRAFT_READINESS.md`: recolección pura de señales, separada de la clasificación, separada de la interpretación generativa, separada de la UI.

# Qué funciona
- **`isabel-api/src/core/globalContext.js`** — `collectGlobalSignals()` reúne, en paralelo y con fallo aislado por fuente (nunca un fallo tumba a los demás), `areas`, `tasks`, `decisions`, `waiting_for`, `alertas`, `projects`, `vj_state`, `vj_tasks`, `operators`. `computeGlobalContext()` es una función pura (sin red, testeada con datos sintéticos) que produce `evidence` — hechos deterministas con nombre fijo (`task_overdue`, `due_today`, `due_soon`, `open_decision_age`, `waiting_overdue`, `critical_alert`, `stale_projects` agregado por dominio, `pending_tasks_without_deadline` agregado y marcado `strength:"weak"`, `rotation_active`, `no_signal`) — y clasifica cada dominio en `urgent` / `reentry` / `maintain` / `clear` con una escalera de prioridad fija. Regla dura verificada: inactividad (`stale_projects`) nunca produce `urgent` por sí sola — solo señales con consecuencia temporal objetiva lo hacen.
- **`attention_mode_reliable`** — si `tasks`, `alertas` o `waiting_for` (las únicas fuentes capaces de producir `urgent`) fallan, el sistema nunca reporta `clear` como si fuera fiable; declara `data_unavailable` en vez de sugerir falsamente "nada urgente".
- **`isabel-api/src/core/now.js`** — `GET /v1/now`: si no hay evidence más allá de `no_signal`, responde determinista sin llamar a Anthropic (`status:"no_signal"`). Si hay evidence real, pide a Claude Haiku un `headline`/`recommendation`/`priority_domain`/`confidence` citando solo esa evidence — prohibido inventar hechos, prohibido usar lenguaje de urgencia salvo que el dominio elegido sea de verdad `urgent`. `language_check` (regex simple, no bloqueante) audita esa regla en cada respuesta. Si Anthropic falla, la capa determinista (`evidence`, `attention_mode`, `can_ignore`) se devuelve igual — nunca queda vacío.
- **`can_ignore`** — calculado 100% determinista (no por el LLM): dominios `clear`, o `maintain` cuyo único motivo es señal débil (`pending_tasks_without_deadline`), con un motivo explícito por dominio.
- **`life-os-app/src/main.js`** — `isabelNowCard()` en `homeView()`: tarjeta "ISABEL · AHORA · beta", aditiva, convive con la tarjeta estática "Isabel habla primero" sin reemplazarla. Estados: `loading`, `ok`, `no_signal` (verde, "nada requiere tu atención"), `data_unavailable` (advertencia neutra, nunca verde), `llm_error` (muestra la capa determinista igual, sin headline/CTA), `unreachable` (nota discreta, el resto de Home sigue funcionando con normalidad). Colores por `attention_mode`: `urgent`→rojo (`--urgent`), `reentry`→morado calmado (`--info`), `maintain`→ámbar (`--warn`), `clear`→verde (`--ok`). CTA navega al `priority_domain`.

# Qué está parcialmente implementado
- Dominios con señal limpia hoy: VistaJet (rotación + `vj_tasks`), JETMI (`tasks`/`decisions`/`operators`), y el resto de dominios genéricos solo con `tasks`/`decisions`/`waiting_for`/`alertas` sin fecha (señal débil). HOTO e Inventario **no** se leen aquí — su interpretación ya tiene dueño (`readiness.js`/Aircraft Readiness); duplicarla habría violado `PRINCIPLES.md` #8 ("una sola fuente de verdad por dato").
- `transactions` (Finanzas) deliberadamente fuera — no existe lógica de dominio verificada sobre presupuestos, así que no hay de dónde sacar una interpretación financiera sin inventarla.
- La mayoría de tareas pendientes reales (Finanzas/Salud/Gym/Marca Personal/Vida Personal) no tienen `due_date`, así que solo generan señal débil agregada — en la práctica, JETMI es casi siempre el dominio con evidence más fuerte hoy, simplemente porque es el único con `last_activity_at` de proyectos poblado.

# Qué no existe todavía
- `eventos` queda fuera deliberadamente de este `globalContext` (decisión explícita de la usuaria) — su calidad como fuente de estado no está auditada. Antes de incorporarlo, auditarlo específicamente.
- `POST /v1/chat` no reutiliza `globalContext.js` todavía — `generalHandler.js` sigue con su propio `loadContext()` ad-hoc. Cuando se decida activar el chat, debería migrar a la misma función para no duplicar lógica (así lo tenía previsto D9 desde el diseño).
- Ningún write desde Isabel — ni siquiera un registro de auditoría en `eventos` cuando se genera una recomendación (se dejó fuera deliberadamente en Fase 1 para respetar "cero writes" al pie de la letra).

# Modelo de datos
Ninguna tabla propia — puramente un agregador de lectura. Ver `DATA_MODEL.md` para las tablas que consulta (`tasks`, `decisions`, `waiting_for`, `alertas`, `projects`, `areas`, `life_context`, `vj_state`, `vj_tasks`, `operators`).

# Flujos de usuario
Automático al abrir Home (`initApp()` dispara `loadIsabelNow()` sin bloquear el resto de la carga). Sin interacción manual salvo el CTA "Ir a [dominio] →".

# Backend/endpoints
`GET /v1/now` en `isabel-api` (mismo servicio ya desplegado, misma `x-api-key` que Inventario/HOTO). Contrato de respuesta: `status` (`ok`|`no_signal`|`data_unavailable`|`llm_error`|`error`), `attention_mode`, `attention_mode_reliable`, `priority_domain`, `priority_evidence`, `headline`, `recommendation`, `confidence`, `evidence`, `can_ignore`, `sources`, `unavailable_sources`, `domains`.

# Frontend/vistas
`life-os-app/src/main.js`: `isabelNowCard()`, `isabelAttentionStyle()`, `isabelEvidenceLabel()`, `loadIsabelNow()`, renderizado dentro de `homeView()`.

# Archivos relevantes
`isabel-api/src/core/globalContext.js`, `isabel-api/src/core/now.js`, `isabel-api/src/index.js` (2 líneas de montaje). `life-os-app/src/main.js` (95 líneas añadidas, commit `da840cc`).

# Verificaciones empíricas realizadas
Contra datos reales de producción, antes y después de aprobación: `status:"ok"` real (JETMI reentry), `no_signal` sintético, `data_unavailable` (tabla forzada a fallar), `llm_error` (API key de Anthropic inválida real), urgencia sintética real (tarea vencida), reentry sin urgencias, `attention_mode_reliable:false` cuando falla una fuente urgent-capable. Los 6 estados de la tarjeta frontend verificados uno a uno (inyectando las formas de respuesta reales ya capturadas, hook de test retirado antes de cualquier commit). CTA de navegación verificado. Bundle de producción inspeccionado directamente (no solo confiado a la UI del dashboard) para confirmar el commit realmente desplegado en dos ocasiones distintas (Railway y Vercel).

# Bugs conocidos
Ninguno abierto. Tres encontrados y corregidos durante la validación de Fase 1 (ver `CHANGELOG.md` 2026-08-03): fences de markdown de Claude rompiendo el JSON; atajo "sin evidencia" que nunca se activaba por los `no_signal`; fallo aislado de tabla reportándose como `clear` (corregido con `attention_mode_reliable`).

# Decisiones cerradas
`DECISIONS.md` D9 — Isabel Core se integra dentro de `isabel-api`, nunca como servicio independiente.

# Fuera de alcance actual
Ampliar dominios con lógica propia (HOTO, Inventario, Finanzas) reutilizando este mecanismo — necesitarían su propio `assess()` dedicado, no una lectura cruda dentro de este `globalContext`. Activar `/v1/chat` reutilizando esta misma función. Cualquier write desde Isabel (crear/modificar tareas, decisiones, proyectos).

# Próximo hito
Confirmación de la usuaria tras validar manualmente en su iPhone (checklist entregado el 2026-08-03: aparece la tarjeta, JETMI como "Retomar" no "Urgente", headline/recomendación coinciden, `can_ignore` resumido, CTA abre JETMI, resto de Home intacto). Ningún trabajo nuevo iniciado hasta esa confirmación.
