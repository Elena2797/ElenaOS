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

# Rediseño acordado con ella (2026-09-25) — IMPLEMENTADO el mismo día
**Qué es la tarjeta, en sus palabras:** un nivel de **confianza para entregar el avión tal como está**, según lo que le falta *a ella* por hacer. NO es el estado técnico del avión: un jump seat inoperativo o un AOG "es problema del avión", no suyo, y no deben sumar ni restar (hoy "6 defects documentados" sale como fortaleza — incorrecto).

**Lo que le quita confianza (sus 4 pilares):**
1. **Inventario sin actualizar.** Distinguir *contado de verdad* de *estimado / puesto al estándar* (hoy los dos cuentan como "verificado"). "30/345" y "19 discrepancias" no son señal útil: una discrepancia es solo "gastado", no un problema; pedir verificar 315 ítems tampoco es realista.
2. **Laundry & Cleaning Form sin rellenar el día de la entrega** (y sin Received / exportar / firmar).
3. **Haberse ido sin limpiar bien** (caso del microondas, 2026-09-23): las 47 **Daily duties** del HOTO sin marcar deben bajar la confianza — hoy la tarjeta ni las mira.
4. **Documentos sin enviar:** al cerrar, hay que mandar el correo (HOTO / inventario / laundry). Isabel debe recordárselo. Tampoco se mira hoy el **feedback del vuelo** (máx. 24 h) ni el feedback del avión (1-2 días).

**Otros fallos de la tarjeta detectados ese día (simulando `assess()` con datos reales):** Shopping "13/13 ✅" solo cuenta casillas rellenas (no ve que no hay leche/hierbas/apio); Cabin Care "12/17 ✅" da por bueno lo que no tiene fecha; "Sin fecha de entrega" — no sabe que hoy deja el avión (falta un estado "dejando el avión" que active este modo); "Laundry actualizado ✅" solo mira que haya algo escrito.

**Principio:** la tarjeta pregunta "¿cuánta confianza me da entregar así?" y cada motivo de baja confianza debe ser algo que ella pueda **hacer** (contar, marcar, rellenar, enviar). Nunca juzgar el avión.

## Cómo quedó implementado (2026-09-25)
`services/readiness.js` reescrito manteniendo el contrato (`readiness`/`confidence`/`modules`…), así la tarjeta "Copiloto de entrega" no cambia de forma. Se evalúa SIEMPRE "como si entregaras ahora" (no hay fase por fecha de entrega).
- **Módulos nuevos:** Inventario · Laundry Form · Limpieza y HOTO · Documentos y feedback · Por comprar (informativo) · Administrativo. **Desaparece** "Estado del avión": los defectos del avión (jump seat, AOG) no puntúan.
- **Inventario:** sesión abierta con 0 ítems tocados → bloqueo; estimados (`notes` "estimado…", D70) → aviso; "30/345 verificados" y las discrepancias ya no se muestran como problema; "por reponer" es solo informativo (saldrá en el UPLIFT).
- **Laundry:** sin formulario abierto (habiendo HOTO e inventario reales) o vacío → bloqueo; sin actualizar >1 día → aviso; siempre recuerda exportar y firmar (no puede verlo).
- **Limpieza:** las 47 tareas diarias del HOTO (`daily_duties`): 0 marcadas → bloqueo; <70 % → aviso; su caso real (37/47, algunas no aplican al CL350) NO baja la confianza. Cabecera del HOTO incompleta (CH, fecha, días, ICAO) → aviso. Cabin Care sin fechas no puntúa.
- **Documentos:** feedback del vuelo pendiente (24 h) y del avión (1-2 días) → aviso (la tarea combinada "feedback de vuelos + feedback HOTO" cuenta como de VUELO); el correo del handover se recuerda siempre ("no puedo comprobar si salió").
- **Honestidad conservada:** sin HOTO e inventario reales del avión actual no hay bloqueos inventados: "no tengo evidencia suficiente" (tests D15/D34 intactos).
- **UI:** el texto "confianza alta/media/baja" pasa a **"evidencia"** (es la fiabilidad de la evaluación, no tu confianza de entrega, que es el chip Listo/Casi listo/No entregaría). Nuevo bloque **"Documentos de entrega"** justo bajo la tarjeta con Inventario (Excel) · HOTO (PDF) · Laundry (PDF).
- **Pendiente:** un estado explícito "dejando el avión"; que el correo del handover pueda marcarse como enviado (hoy solo se recuerda); mostrar contado vs estimado dentro de la vista de inventario; el PDF de lavandería en el visor del móvil sigue mostrando "export" como nombre.
- Tests: `services/__tests__/readinessRedesign.test.js` (23) + los de D15/D34.
