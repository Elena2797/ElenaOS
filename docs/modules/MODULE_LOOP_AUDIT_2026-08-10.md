# Auditoría del bucle funcional por módulo — 2026-08-10

Estado de corte: producción posterior a SurfaceSync y lectura determinista de sueño; Finanzas V1 se prepara como cambio de coste IA incremental cero. O5/Knowledge/Goals/FollowUps sigue desconectado durante O4.

| Módulo | Fuente de verdad actual | Qué es real hoy | Isabel lee/escribe | Hueco funcional concreto |
|---|---|---|---|---|
| VistaJet | Supabase: `vj_state`, `vj_tasks`, HOTO, Inventario, Laundry/Cleaning | Estado operativo, avión, HOTO e inventario correlacionados; especialistas y señales deterministas; LIFEOS revalida al volver a la app | Sí: lee estado; escribe pasaporte/estado operacional y registra eventos mediante tools MCP | Proceeding no tiene dato canónico; las plantillas de maleta siguen en `localStorage`; no participa aún en Goals/FollowUps universales |
| JETMI | `operators` + tablas genéricas por `area_id` (`tasks`, `projects`, `decisions`, `waiting_for`, `eventos`, `metrics`) | Dashboard estructurado y datos operativos genéricos; investigación/PRD son documentación, no estado de ejecución | No tiene specialist ni tool propia; el Core sólo puede resumir señales genéricas/conteos | Falta un modelo canónico mínimo de pipeline/relaciones/operación antes de automatizar |
| Finanzas | `transactions`; presupuestos positivos en `metrics.key=budget_<categoría>` | CRUD y vistas legacy; lectura backend mensual fail-closed, gasto por categoría, cobertura y alertas de presupuesto explicables; 881 movimientos verificados en total | No por MCP. LIFEOS lee el resumen Core; Isabel/Telegram no puede consultarlo ni escribirlo como specialist | Versionar esquema/RLS de `transactions` y `metrics`; conectar señales a prioridad sólo después de O4; no existen saldos, patrimonio ni importación bancaria automática |
| Salud | `checkins` para sueño; `metrics` y tareas genéricas para el resto | Sueño persistente y lectura reciente compartida entre Telegram/LIFEOS; dolor/energía/síntomas no tienen flujo universal activo | Sí para sueño: `health_get_sleep_status` y `health_register_sleep` | Separar claramente dato médico declarado de constantes/UI legacy; no inferir diagnósticos ni rellenar campos no usados |
| Gym | `eventos` para sesiones + objetivo semanal en `metrics` | Registro y estado semanal determinista compartido por Home/Dominios/vista Gym | Sí: `gym_log_session` y `gym_get_status` | Pesos y restricciones siguen hardcoded en frontend; todavía no usa Goals/FollowUps universales |
| Marca Personal | Tablas genéricas por `area_id` | Tareas, proyectos, decisiones, esperas y alertas; pantalla de presentación | No tiene specialist/tool propia | No hay calendario editorial, activos, canales ni métricas canónicas; primero hay que escoger el mínimo dato útil |
| Viajes y visados | No existe como dominio separado; hoy cae en `Vida Personal` y tareas/decisiones genéricas. Pasaporte laboral de VistaJet vive en `vj_state` | Se pueden gestionar acciones genéricas; el vencimiento de pasaporte VistaJet sí tiene specialist | Sólo el pasaporte VistaJet. Ninguna lectura/escritura universal de viajes o visados personales | Definir si será módulo propio o alcance de Vida Personal, y qué entidad representa viaje/documento/plazo |
| Admin General | No existe como módulo canónico separado; usa tareas/esperas/decisiones genéricas. eLearnings/facturas de VistaJet viven en `vj_tasks` | Gestión genérica; VistaJet expone buckets administrativos informativos | Sólo puede leer el resumen administrativo dentro de `vistajet_get_status`; no hay tool general | Definir alcance y propiedad para evitar duplicar Admin, Vida Personal y VistaJet |

## Frontera compartida real

- Telegram y LIFEOS convergen cuando escriben/leen una fuente canónica ya conectada (hoy, por ejemplo, sueño, Gym y VistaJet).
- SurfaceSync revalida Supabase, preguntas pendientes, Gym, sueño y Finanzas al volver a LIFEOS; no hace polling ni llama a `/v1/now`.
- Una conversación general todavía no se transforma en conocimiento estructurado. El pipeline O5 que lo permite está implementado y probado, pero no montado, sin migraciones ni flags activos.
- Home productivo sigue representando el `/v1/now` vigente. El Home adaptativo basado en Knowledge/Goals/FollowUps está preparado como fixture/read model desconectado.

