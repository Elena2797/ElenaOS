Estado: diseñado (PRD completo) / implementado como placeholder (área genérica sin módulo de dominio)
Última verificación: 2026-07-14
Verificado en: grep de JETMI en main.js, tabla operators muestreada, JETMI_PRD_Semilla.md (raíz), creación de research/JETMI/
Fuente de verdad de datos: DATA_MODEL.md § operators, § tasks/metrics filtrados por area JETMI

# modules/JETMI.md

# Objetivo
JETMI es el negocio de brokeraje de jets privados de Estefanía. El objetivo de este módulo dentro de LIFEOS es darle visibilidad operativa: operadores, pipeline, comisiones, decisiones de negocio pendientes.

# Posicionamiento (decisión de negocio)
JETMI se define como un broker de aviación privada que se construye y opera directamente — no como una plataforma de descubrimiento de oportunidades ni como una herramienta cuyo negocio principal sea vender leads a otros brokers. Ver `DECISIONS.md` JETMI-D1 (2026-07-14). Esto reemplaza el framing del antiguo `jetmi.md` (raíz del proyecto), ahora marcado superseded en su propia cabecera.

**Estado societario real:** JETMI está en fase de definición, investigación y diseño. No existe todavía ninguna sociedad JETMI LDA constituida en Portugal ni en ninguna otra jurisdicción — la estructura societaria descrita en `JETMI_PRD_Semilla.md` §14 es una hipótesis de diseño, no un hecho consumado.

# Relación con Isabel y LIFEOS
JETMI es un dominio de negocio dentro de LIFEOS, con el mismo estatus jerárquico que VistaJet, Finanzas o Salud/Gym (ver `ARCHITECTURE.md` para la jerarquía Sistema/Dominio/Operación). Isabel Core es la capa de interacción/orquestación prevista para todos los dominios de LIFEOS, incluido JETMI, conforme cada uno evolucione — **no existe hoy ningún especialista de Isabel implementado para JETMI**. El área JETMI usa exactamente el mismo mecanismo genérico que cualquier otra área sin especialista propio (ver § Qué funciona más abajo). Qué partes de "Isabel" están realmente activas hoy en LIFEOS (y cuáles no) se documenta en `core/ISABEL_CHANNELS.md`; cómo se incorporaría un especialista nuevo, en `core/SPECIALISTS_PROTOCOL.md`. El rol que se prevé para Isabel dentro de JETMI específicamente está descrito con detalle en `JETMI_PRD_Semilla.md` §11 ("El Especialista: Isabel en JETMI", raíz del proyecto) — es un documento de visión, no una descripción de lo implementado; este documento no duplica su contenido, solo enlaza.

# Restricción de diseño: una sola persona + sistemas/IA
JETMI se está diseñando, desde el origen, para poder ser operado y desarrollado inicialmente por una sola persona (Estefanía), en paralelo a su trabajo en VistaJet, apoyándose **progresivamente** en sistemas, automatizaciones y agentes de IA a medida que el dominio y LIFEOS lo permitan. Esto es una **restricción/objetivo de diseño de negocio**, no una descripción de automatizaciones que ya existan — a fecha de esta actualización no hay ningún agente ni automatización de JETMI implementado (ver § Qué no existe todavía), y no se ha asignado ninguna función concreta a ningún agente. Esta restricción se explora en detalle, todavía sin propuesta de arquitectura, en `research/JETMI/sources/mapa-maestro-investigacion.md` (Fase 5, dominio 24) y en `research/JETMI/sources/investigacion-1-1-trabajo-real-broker.md` § I.

# Investigación externa
La investigación de mercado/industria (no el código) vive en `../research/JETMI/` — `LOG.md` (mapa de cobertura), `KNOWLEDGE.md` (conocimiento consolidado y verificado), `HYPOTHESES.md` (interpretaciones y preguntas abiertas), `sources/` (artefactos originales convertidos a Markdown). Este documento no duplica ese contenido, solo lo referencia.

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
JETMI-D1 (2026-07-14) — posicionamiento como broker de aviación privada. Ver `DECISIONS.md`.

# Fuera de alcance actual
Todo lo descrito en el PRD que no sea "área genérica con una tabla de operadores". Ninguna funcionalidad operativa de brokerage, agente, automatización o CRM se ha diseñado ni implementado — la infraestructura creada el 2026-07-14 es exclusivamente documental (`research/JETMI/`).

# Próximo hito
El PRD (`JETMI_PRD_Semilla.md`, raíz) es el punto de partida si se decide construir el módulo de dominio real — no está reflejado aquí porque este documento solo declara lo verificado, no la visión. Inmediato: ingerir el texto del Manual Operativo del Broker de Aviación Privada en `research/JETMI/sources/` (pendiente de recibir el contenido, ver `research/JETMI/LOG.md`).
