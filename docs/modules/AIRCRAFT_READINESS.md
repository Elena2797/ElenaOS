Estado: implementado
Última verificación: 2026-07-10
Verificado en: life-os-app/src/services/readiness.js, pruebas unitarias de assess() con casos sintéticos y datos reales de producción
Fuente de verdad de datos: ninguna propia — agrega señales de vj_hoto_records/items, vj_inventory_*, localStorage de Laundry, vj_tasks

# modules/AIRCRAFT_READINESS.md

# Objetivo
Responder, con datos reales, "si tuviera que entregar este avión ahora mismo, ¿qué me preocuparía?" — reemplazando un mensaje estático en la tarjeta de VistaJet.

# Estado real
Implementado y desplegado (2026-07-08). Es un caso de arquitectura limpia: función pura de evaluación, separada de la recolección de señales y de la UI.

# Qué funciona
- `collectSignals()`: junta el estado real de HOTO, Inventario (lectura, vía `loadLastSession`, abierta o cerrada), Laundry (localStorage), Shopping/Magazines (del HOTO), eLearnings/Facturas (tareas VJ por regex de título). Un módulo sin datos produce señal `null` explícita, nunca se asume.
- `assess()`: función **pura** — señales → `{readiness, confidence, strengths, warnings, blockers, missingEvidence, recommendation, modules[]}`. La UI solo renderiza este objeto.
- Reglas de honestidad verificadas con tests: "listo para entregar" exige evidencia core (HOTO + inventario); sin evidencia suficiente el sistema dice explícitamente "no tengo evidencia", nunca finge estar "casi listo"; sin HOTO previo, las fechas históricas ausentes no cuentan como fallo; 0 defectos registrados pide confirmación explícita en vez de asumir que no hay ninguno.
- Recalculo automático al volver del HOTO al área VJ, y botón manual de recálculo.

# Qué está parcialmente implementado
Algunas líneas de detalle todavía cuentan en vez de razonar del todo (ej. "Shopping 6/13") — están a medio camino entre contar y evaluar.

# Qué no existe todavía
- `delivery_date` (fecha de entrega planificada, necesaria para calibrar "fase de la rotación") — se decidió explícitamente NO añadir esta columna por no pertenecer al PDF oficial de HOTO y no ser prioritaria (ver DECISIONS.md relacionado con el scope de HOTO). Sin ella, Readiness declara la fase como "sin fecha de entrega" en vez de asumir una.
- Lectura del futuro módulo de Defects (hoy lee texto libre de HOTO en su lugar).

# Modelo de datos
Ninguna tabla propia — es puramente un agregador de lectura. Ver DATA_MODEL.md para las tablas que consulta.

# Flujos de usuario
Se calcula automáticamente al entrar en el área VistaJet; el usuario ve un chip de estado (listo/casi listo/no listo), nivel de confianza, recomendación en una frase, y un desglose expandible por módulo.

# Backend/endpoints
Ninguno — cálculo 100% en cliente.

# Frontend/vistas
`life-os-app/src/services/readiness.js` (colector + evaluador), renderizado dentro de `vjView()` en `main.js`.

# Archivos relevantes
`life-os-app/src/services/readiness.js`.

# Verificaciones empíricas realizadas
Tres casos sintéticos probados contra `assess()` (avión Bad + inventario a medias → not_ready; todo correcto → ready; sin ningún dato → nunca ready, con evidencia faltante explícita) más ejecución contra datos reales de producción del 9H-VCQ.

# Bugs conocidos
Ninguno registrado.

# Decisiones cerradas
El diseño de "función pura + colector separado" fue deliberado desde el principio, sin alternativa descartada documentada explícitamente (no se registró como ADR en su momento).

# Fuera de alcance actual
Fase de rotación calibrada por fecha de entrega (bloqueada por la ausencia de `delivery_date`).

# Próximo hito
Ninguno decidido explícitamente.
