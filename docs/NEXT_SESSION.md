Última actualización: 2026-07-14 — handoff corto, no histórico acumulativo (para eso está CHANGELOG.md)

# NEXT_SESSION.md

## Qué se terminó en esta sesión
Infraestructura documental de investigación para JETMI creada y poblada con los tres primeros artefactos reales: `docs/research/README.md` (convenciones, escala de cobertura, pipeline de ingestión) y `docs/research/JETMI/` completo (`LOG.md`, `KNOWLEDGE.md`, `HYPOTHESES.md`, `sources/` con Manual Operativo Cap. 1, Mapa Maestro de Investigación e Investigación 1.1, los tres convertidos fielmente a Markdown). Decisión `JETMI-D1` registrada en `DECISIONS.md` (JETMI = broker, no plataforma de descubrimiento). `jetmi.md` (raíz) marcado superseded en su cabecera sin reescribir contenido. Todo en el commit `258d2f5`. Detalle completo en `CHANGELOG.md`, estado general en `CURRENT_STATE.md` — no se repite aquí. **No se diseñó ni implementó ninguna funcionalidad operativa de JETMI** (workflows, agentes, automatizaciones, CRM, modelo de datos) — trabajo exclusivamente documental, según lo pedido explícitamente en toda la sesión.

## Qué quedó pendiente
1. **Decisión de la usuaria, no técnica:** por dónde continuar la investigación de JETMI — el Mapa Maestro recomienda completar la Fase 1 (dominios 1.2 supply, 1.3 demanda, 1.4 ciclo operativo end-to-end) antes de abrir la Fase 0 (fundamentos legales, bloqueante). Ninguna de las dos rutas está decidida. **No iniciar ninguna por iniciativa propia** — ver `research/JETMI/LOG.md` § 6.
2. Confirmar que la migración del checklist Daily Duties de HOTO llegó a Supabase en el móvil de la usuaria (pendiente de sesiones anteriores, detalle en `modules/VISTAJET_HOTO.md`).

## Qué debe hacerse inmediatamente después
Nada asignado automáticamente. Si la usuaria retoma JETMI, preguntar primero qué bloque de investigación quiere abrir (Fase 0 vs. resto de Fase 1) antes de generar contenido nuevo. Si aporta un artefacto nuevo, seguir el mismo protocolo ya usado: ingerir en `sources/` sin editorializar → actualizar `LOG.md` (cobertura por área, nunca VERIFICADO/SUFICIENTE PARA DECIDIR solo por longitud) → actualizar `HYPOTHESES.md` con lo que tenga valor operativo → identificar candidatos a `KNOWLEDGE.md` sin promoverlos automáticamente.

## Qué no debe romperse
- Ningún cambio de esquema en Supabase sin protocolo antes/después (`PRINCIPLES.md` #5 y #7).
- Los documentos de la raíz del proyecto (`VISION.md`, `ISABEL_CORE.md`, `JETMI_PRD_Semilla.md`, etc.) no se editan desde `/docs` salvo notas de cabecera "superseded" explícitas y mínimas (como se hizo con `jetmi.md`) — nunca reescritura silenciosa.
- La regla del pipeline de investigación: nada pasa de `sources/` a `KNOWLEDGE.md` sin extracción, clasificación y verificación deliberadas. No inferir conocimiento consolidado solo por leer un artefacto.
- La sección "Candidatos a consolidación futura" de `KNOWLEDGE.md` no es conocimiento oficial — no citarla como fuente de verdad, solo como punto de partida para una verificación futura.
- HOTO e Inventario de producción contienen datos reales de rotaciones reales — cualquier escritura sigue el patrón dry-run + verificación de `modules/VISTAJET_INVENTORY.md` y `VISTAJET_HOTO.md`.

## Qué documentos debe leer el siguiente chat
`README.md` → `CURRENT_STATE.md` → este documento → si retoma JETMI: `modules/JETMI.md` → `research/JETMI/LOG.md` (mapa de cobertura y próximo bloque recomendado) → `research/README.md` (pipeline de ingestión) antes de tocar `sources/`, `HYPOTHESES.md` o `KNOWLEDGE.md`.
