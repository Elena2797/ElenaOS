Estado: implementado como placeholder (área genérica, sin módulo de dominio propio)
Última verificación: 2026-07-10
Verificado en: grep de "Marca Personal" en main.js
Fuente de verdad de datos: ninguna propia — sistema genérico de tasks/metrics filtrado por area

# modules/PERSONAL_BRAND.md

# Objetivo
Presencia pública (TikTok/Instagram) — declarado en `areas` como propósito: "Presencia pública sostenible según energía y modo".

# Estado real
Área genérica sin ninguna lógica de dominio propia. No hay vista, no hay tabla específica, no hay especialista.

# Qué funciona
Lo mismo que cualquier área: tareas, decisiones, proyectos, alertas filtrados por `area_id`, renderizados por `areaView()`.

# Qué está parcialmente implementado
Nada.

# Qué no existe todavía
Cualquier funcionalidad específica de gestión de contenido, calendario editorial, métricas de redes sociales.

# Modelo de datos
Ninguno propio.

# Flujos de usuario
Los genéricos de cualquier área.

# Backend/endpoints
Ninguno.

# Frontend/vistas
Ninguna propia.

# Archivos relevantes
`life-os-app/src/main.js` (referencia en la lista de áreas y en el color/icono `📣`).

# Verificaciones empíricas
Ninguna.

# Bugs conocidos
Ninguno.

# Decisiones cerradas
Ninguna.

# Fuera de alcance actual
Todo lo que sería un módulo de dominio real.

# Próximo hito
Ninguno decidido.
