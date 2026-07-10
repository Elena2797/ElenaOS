Estado: diseñado (PRD completo) / implementado como placeholder (área genérica sin módulo de dominio)
Última verificación: 2026-07-10
Verificado en: grep de JETMI en main.js, tabla operators muestreada, JETMI_PRD_Semilla.md (raíz)
Fuente de verdad de datos: DATA_MODEL.md § operators, § tasks/metrics filtrados por area JETMI

# modules/JETMI.md

# Objetivo
JETMI es el negocio de brokeraje de jets privados de Estefanía. El objetivo de este módulo dentro de LIFEOS es darle visibilidad operativa: operadores, pipeline, comisiones, decisiones de negocio pendientes.

# Estado real
**Hay un PRD completo y cuidado** (`JETMI_PRD_Semilla.md`, raíz, 469 líneas, "PRD Semilla v0.4") que define JETMI como negocio y como dominio de producto. **En código, JETMI es un área genérica** — no tiene vista propia, no tiene lógica de dominio, no tiene especialista. Usa exactamente el mismo mecanismo que Salud o Marca Personal.

# Qué funciona
- Área "JETMI" en `areas` (color `#534AB7`), con sus tareas, decisiones, proyectos y alertas asociadas vía `area_id`, renderizados por el `areaView()` genérico.
- Tabla `operators` (nombre, estado, comisión, notas) — específica de JETMI, aunque sin migración formal (ver DATA_MODEL.md).
- El home de LIFEOS calcula "salud" del área JETMI (rojo/naranja/verde/gris) y puede sugerir JETMI como área prioritaria del día si hay decisiones antiguas sin resolver.

# Qué está parcialmente implementado
Nada específico de dominio — todo lo que "funciona" es el mecanismo genérico aplicado a esta área.

# Qué no existe todavía
Ninguna de las funcionalidades que describe `JETMI_PRD_Semilla.md` como dominio propio (pipeline visual, CRM de operadores más allá de una tabla plana, cualquier automatización).

# Modelo de datos
`operators` — ver DATA_MODEL.md. El resto son las tablas genéricas filtradas por `area_id`.

# Flujos de usuario
Los mismos que cualquier área genérica: ver tareas/decisiones/proyectos del área, marcar como hechas, añadir nuevas.

# Backend/endpoints
Ninguno propio.

# Frontend/vistas
Ninguna vista propia — usa `areaView()` genérico.

# Archivos relevantes
`life-os-app/src/main.js` (referencias a JETMI dentro de la lógica genérica de áreas).

# Verificaciones empíricas
Ninguna — no fue objeto de desarrollo en esta sesión.

# Bugs conocidos
`operators` sin migración formal en el repo.

# Decisiones cerradas
Ninguna registrada.

# Fuera de alcance actual
Todo lo descrito en el PRD que no sea "área genérica con una tabla de operadores".

# Próximo hito
El PRD (`JETMI_PRD_Semilla.md`, raíz) es el punto de partida si se decide construir el módulo de dominio real — no está reflejado aquí porque este documento solo declara lo verificado, no la visión.
