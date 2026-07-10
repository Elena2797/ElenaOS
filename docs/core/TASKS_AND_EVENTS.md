Estado: implementado
Última verificación: 2026-07-10
Verificado en: life-os-app/src/services/db.js, setup.sql, migration_v1.sql
Fuente de verdad de datos: DATA_MODEL.md § tasks, decisions, waiting_for, alertas, projects, eventos

# core/TASKS_AND_EVENTS.md — El sistema genérico que usan todas las áreas

Este es el mecanismo compartido detrás de JETMI, Salud, Gym, Marca Personal y Vida Personal (que no tienen módulo de dominio propio) y que también complementa a VistaJet (que sí lo tiene).

## Las 6 tablas, y su propósito de una frase

Columnas completas en [DATA_MODEL.md](../DATA_MODEL.md) — aquí solo el rol de cada una:

- **`tasks`**: lo que hay que hacer. Tiene `area_id`, `project_id`, prioridad, energía requerida, modos en los que tiene sentido hacerla (ON/OFF), horizonte temporal.
- **`waiting_for`**: lo que se está esperando de otra persona ("waiting on"), con fecha de seguimiento.
- **`decisions`**: decisiones abiertas, con nivel de importancia (`stakes`).
- **`projects`**: agrupación de tareas con objetivo, siguiente acción, y contexto para que Isabel retome sin preguntar desde cero.
- **`alertas`**: avisos activos, con urgencia y tipo.
- **`eventos`**: registro de qué pasó — contribuciones de IA y cambios manuales, con `origen`, `herramienta` usada, `resumen` y dónde quedó el resultado.

## Cómo se usa

Todo pasa por `life-os-app/src/services/db.js` — único punto de acceso a estas 6 tablas desde el frontend (más `metrics`, `operators`, `transactions`, `vj_state`, `vj_tasks`, que documentan `modules/*.md` respectivos). `loadAll()` trae todo de golpe al arrancar la app.

## Relación con VistaJet
VistaJet usa tanto este sistema genérico (sus tareas pueden vivir en `tasks` con `area_id` apuntando al área VistaJet) como sus propias tablas específicas (`vj_tasks`, más simple, sin energía/modo/horizonte). Ambas coexisten — no hay una migración de una a otra documentada.

## Qué NO cubre este documento
- Detalle de cómo cada área usa `metrics` → módulo específico correspondiente.
- El mecanismo de eventos como "memoria" de Isabel → [MEMORY.md](MEMORY.md) (spoiler: se escribe pero no se lee de vuelta).
