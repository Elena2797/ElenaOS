Estado: implementado como placeholder (área genérica, sin módulo de dominio propio)
Última verificación: 2026-07-10
Verificado en: grep de Salud/Gym y metrics en main.js
Fuente de verdad de datos: DATA_MODEL.md § metrics

# modules/HEALTH_AND_GYM.md

Salud y Gym se documentan juntos porque hoy comparten exactamente el mismo mecanismo (métricas genéricas) — separarlos obligaría a repetir la misma explicación dos veces. Si en el futuro Gym gana lógica propia, se separan.

# Objetivo
Seguimiento de métricas de salud (sueño, dolor, uso de cannabis medicinal observado en claves) y de ejercicio (sesiones, tendencia).

# Estado real
Área genérica — ninguna lógica de dominio, solo lectura/escritura de `metrics` con distintas `key` por área.

# Qué funciona
- Tabla `metrics`: filas con `area_id` apuntando a Salud o Gym, `key` (ej. `horas_sueno`, `dolor_hoy`, `sesiones_semana`), `value`, `label`, `unit`.
- Cálculo de "salud" del área (rojo/naranja/verde/gris) en el home, igual que cualquier otra área.

# Qué está parcialmente implementado
Nada específico — es el mecanismo genérico completo, sin capa adicional.

# Qué no existe todavía
Cualquier especialista, tendencia calculada automáticamente más allá de lo que ya haga el `areaView()` genérico, o integración con dispositivos/apps de salud externas.

# Modelo de datos
`metrics` — ver DATA_MODEL.md. **Sin migración formal** en ningún repo.

# Flujos de usuario
Registrar un valor de métrica, verlo en el área correspondiente.

# Backend/endpoints
Ninguno.

# Frontend/vistas
`areaView()` genérico, sin vista propia.

# Archivos relevantes
`life-os-app/src/services/db.js` (funciones de `metrics`).

# Verificaciones empíricas
Ninguna — no fue objeto de desarrollo en esta sesión.

# Bugs conocidos
`metrics` sin migración formal.

# Decisiones cerradas
Ninguna registrada.

# Fuera de alcance actual
Cualquier lógica de dominio específica de salud o ejercicio.

# Próximo hito
Ninguno decidido.
