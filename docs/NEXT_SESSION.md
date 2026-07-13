Última actualización: 2026-07-14 — handoff corto, no histórico acumulativo (para eso está CHANGELOG.md)

# NEXT_SESSION.md

## Qué se terminó en esta sesión
Infraestructura documental de investigación para JETMI: `docs/research/README.md` (convenciones, escala de cobertura, pipeline de ingestión) y `docs/research/JETMI/` (`LOG.md`, `KNOWLEDGE.md`, `HYPOTHESES.md`, `sources/`). Decisión `JETMI-D1` registrada en `DECISIONS.md` (JETMI = broker, no plataforma de descubrimiento). `jetmi.md` (raíz) marcado superseded en su cabecera sin reescribir contenido. Detalle completo en `CHANGELOG.md`, estado general en `CURRENT_STATE.md` — no se repite aquí. **No se diseñó ni implementó ninguna funcionalidad operativa de JETMI** (workflows, agentes, automatizaciones, CRM, modelo de datos) — trabajo exclusivamente documental, según lo pedido.

## Qué quedó pendiente
1. Recibir el texto real del "Manual Operativo del Broker de Aviación Privada" (Capítulo 1 desarrollado + índice preliminar de capítulos futuros) — no está en el repositorio, hay que pedírselo a la usuaria. En cuanto llegue, convertirlo fielmente a Markdown en `docs/research/JETMI/sources/manual-operativo-broker.md`, preservando contenido, estructura, etiquetas de certeza, fuentes citadas y capítulos pendientes — sin completar ni mejorar la investigación.
2. Confirmar que la migración del checklist Daily Duties de HOTO llegó a Supabase en el móvil de la usuaria (pendiente de sesiones anteriores, detalle en `modules/VISTAJET_HOTO.md`).

## Qué debe hacerse inmediatamente después
Al recibir el texto del Manual Operativo: (a) convertirlo a `sources/manual-operativo-broker.md` declarando en cabecera que es investigación secundaria; (b) actualizar `LOG.md` con la cobertura real del Capítulo 1 por área temática (hoy todo marcado NO INVESTIGADO como placeholder); (c) NO promover nada a `KNOWLEDGE.md` automáticamente — extracción y clasificación son un paso deliberado posterior, ver pipeline en `research/README.md`.

## Qué no debe romperse
- Ningún cambio de esquema en Supabase sin protocolo antes/después (`PRINCIPLES.md` #5 y #7).
- Los documentos de la raíz del proyecto (`VISION.md`, `ISABEL_CORE.md`, `JETMI_PRD_Semilla.md`, etc.) no se editan desde `/docs` salvo notas de cabecera "superseded" explícitas y mínimas (como se hizo con `jetmi.md`) — nunca reescritura silenciosa.
- La regla del pipeline de investigación: nada pasa de `sources/` a `KNOWLEDGE.md` sin extracción, clasificación y verificación deliberadas. No inferir conocimiento consolidado solo por leer un artefacto.
- HOTO e Inventario de producción contienen datos reales de rotaciones reales — cualquier escritura sigue el patrón dry-run + verificación de `modules/VISTAJET_INVENTORY.md` y `VISTAJET_HOTO.md`.

## Qué documentos debe leer el siguiente chat
`README.md` → `CURRENT_STATE.md` → este documento → si retoma JETMI: `modules/JETMI.md` → `research/JETMI/LOG.md` → `research/README.md` (pipeline de ingestión) antes de tocar `sources/` o `KNOWLEDGE.md`.
