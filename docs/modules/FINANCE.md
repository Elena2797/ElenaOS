Estado: parcial (datos reales, sin lógica de dominio)
Última verificación: 2026-07-10
Verificado en: finance_reset_final.sql (raíz), muestreo real de la tabla transactions, grep de S.transactions en main.js
Fuente de verdad de datos: DATA_MODEL.md § transactions

# modules/FINANCE.md

# Objetivo
Visibilidad sobre el estado financiero real de Estefanía — no un módulo de contabilidad completo, sino "¿en qué se fue el dinero, por categoría y por mes?"

# Estado real
Caso intermedio deliberado: **hay datos reales sustanciales** (821 transacciones importadas de dos bancos) pero **no hay lógica de dominio propia** — no hay especialista, no hay proyecciones, no hay alertas de presupuesto automáticas. Es el área genérica de tareas/decisiones con una vista de transacciones añadida encima.

# Qué funciona
- Vista dentro de `areaView()` para el área "Finanzas": filtro por mes (`S.finMonth`), por categoría (`S.finCat`), vista YTD, heatmap de gasto por categoría/mes.
- CRUD de transacciones vía `services/db.js` (insertar, editar categoría/fecha/monto/descripción, borrar).
- Presupuestos por categoría guardados como filas de `metrics` (con `label: 'Presupuesto ' + categoría`).
- 821 transacciones reales: 185 de Revolut + 636 de Sabadell, con categorías (Salud, Suscripciones, Transporte, Comida, Otros, Viajes, Ahorro, Amigas, Transferencias).

# Qué está parcialmente implementado
Presupuestos: se guardan y se leen, pero no hay evidencia de alertas automáticas cuando se supera uno.

# Qué no existe todavía
- Cualquier especialista de IA para Finanzas (proyecciones, detección de patrones, sugerencias).
- Importación automática de nuevas transacciones — la importación observada fue manual, vía scripts SQL de un solo uso (`finance_reset_final.sql`, `recategorizacion_completa.sql`, etc., en la raíz del proyecto).

# Modelo de datos
Tabla `transactions` — **sin `CREATE TABLE` en ningún repo** (deuda técnica, ver KNOWN_PROBLEMS.md). Columnas confirmadas por muestreo: id, date, description, amount, type, category, source, created_at.

# Flujos de usuario
Ver transacciones del mes/año, filtrar por categoría, editar categorización, comparar contra presupuesto.

# Backend/endpoints
Ninguno — CRUD directo a Supabase desde el cliente.

# Frontend/vistas
`life-os-app/src/main.js`: lógica de Finanzas dentro de `areaView()` (no tiene función de vista propia separada, a diferencia de los módulos VJ).

# Archivos relevantes
`life-os-app/src/services/db.js` (funciones de `transactions`), `finance_reset_final.sql` y demás SQL de importación en la raíz.

# Verificaciones empíricas
Ninguna realizada en esta sesión — el módulo no fue objeto de desarrollo activo, solo de auditoría de lo existente.

# Bugs conocidos
La tabla `transactions` no se puede recrear desde cero solo con el código versionado (sin migración formal).

# Decisiones cerradas
Ninguna registrada explícitamente.

# Fuera de alcance actual
Cualquier automatización o especialista de dominio.

# Próximo hito

Especialista financiero V1 de solo lectura y reglas deterministas, después de cerrar O4 y de versionar el esquema real. No requiere un modelo para agregar ni comparar presupuestos.

# Auditoría para el próximo specialist (2026-08-09)

## Fuente de verdad y fronteras

La única fuente verificada para movimientos es `transactions`. Los presupuestos por categoría son filas `metrics.key='budget_<categoría>'`. No existen fuentes verificadas para saldos de cuenta, deuda, inversiones, suscripciones contractuales, facturas futuras ni patrimonio; un specialist no puede inventarlas ni derivarlas de un movimiento aislado.

El frontend solo carga transacciones del año corriente. Por tanto, cualquier señal YTD es válida para ese intervalo, pero una comparación histórica completa requerirá una lectura backend con ventana declarada. Un fallo de `transactions` hoy puede convertirse silenciosamente en `[]`; antes de emitir “no hubo gasto” el specialist debe fallar cerrado y declarar la fuente no disponible.

## Primera versión determinista propuesta

Lectura pura de `transactions` + presupuestos, sin IA:

- ingresos y gastos del mes, con ventana y moneda declaradas;
- gasto por categoría;
- presupuesto consumido por categoría (`spent / budget`) solo cuando existe presupuesto positivo;
- señal `budget_exceeded` cuando el gasto verificable supera el presupuesto;
- señal `budget_closing` cuando cruza un umbral explícito y aún queda parte relevante del mes;
- transacciones sin categoría como problema de calidad de datos, nunca como gasto “Otros” inventado;
- Action Candidate que cite categoría, gasto, presupuesto, intervalo y filas fuente.

Debe quedar fuera de V1: predicciones de saldo, consejos de inversión, detección de fraude, atribución automática de comercios, “gasto anormal” sin baseline acordado y cualquier automatismo que mueva dinero.

## Contrato con objetivos

Finanzas podrá leer objetivos universales enlazados, por ejemplo un objetivo de ahorro con criterio y fecha. Solo emitirá impacto si el objetivo declara una métrica compatible y existe evidencia suficiente. Superar un presupuesto no debe marcar automáticamente un objetivo como `BLOCKED`; primero debe existir una regla de dominio explícita que conecte ambos.

## Requisitos antes de activar

1. Versionar el `CREATE TABLE transactions` real, índices, restricciones y RLS.
2. Confirmar semántica de `amount` y `type`, moneda y tratamiento de transferencias.
3. Añadir lectura backend fail-closed y tests con ventanas temporales.
4. Validar categorías y presupuestos contra datos reales sin escribir ni recategorizar.
5. Conectar sus señales al bus universal y verificar que Home muestra razón y evidencia.
