Estado: Salud y Gym implementados como especialistas reales
Última verificación: 2026-08-08
Fuente de verdad: Supabase + `GET /v1/gym/state`

# Salud y Gym

## Salud / sueño

El especialista de sueño vive en `isabel-api/src/core/specialists/health.js` y expone `health_get_sleep_status` y `health_register_sleep` por MCP autenticado. Usa Interventions persistentes, fechas Europe/Madrid, parser determinista y escritura auditable en Supabase. El cron diario productivo de las 08:00 lo ejecuta mediante OpenClaw.

## Gym

Gym es un especialista real y horizontal:

- las sesiones se registran en `eventos`;
- `metrics.target` es el objetivo semanal, si existe;
- `GET /v1/gym/state` calcula semana, fuerza, cardio, días entrenados, objetivo e historial;
- el parser determinista cubre los mensajes habituales;
- solo un mensaje ambiguo pide `structured_extraction` al Model Router;
- la señal usa como sujeto la semana y entra por `specialistRegistry.js`, sin lógica Gym en el Priority Engine.

Una sesión con fuerza y cardio cuenta en ambas categorías pero sigue siendo un solo día entrenado. Sin objetivo declarado no se inventa uno.

## Frontend

Home, Dominios y la vista Gym leen el mismo estado de Core. La tarjeta de Dominios ya no usa `metrics.sesiones_semana`, no hardcodea `/2` y no calcula sesiones en paralelo. El escritor legacy `regSesion()` y su export global se eliminaron al demostrar que no tenían consumidores; `gymLogSession()` es el único flujo de registro de la UI.

Los pesos de referencia y restricciones continúan como constantes del frontend. Son datos reales —incluidas restricciones con motivo médico— y moverlos exige diseñar su modelo; no se borran como limpieza cosmética.

## Proactividad

La señal `weekly_strength_target_missing` existe, pero su escalada temporal permanece desactivada a propósito. Añadir Gym no cambió el cron, presupuesto, delivery ni deduplicación. Un tick silencioso sigue sin poder llamar IA.

## Archivos principales

- `isabel-api/src/core/specialists/health.js`
- `isabel-api/src/core/specialists/gym.js`
- `isabel-api/src/core/gymService.js`
- `isabel-api/src/core/models/`
- `life-os-app/src/main.js`
