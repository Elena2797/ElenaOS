Última actualización: 2026-07-14 — handoff corto, no histórico acumulativo (para eso está CHANGELOG.md)

# NEXT_SESSION.md

## Qué se terminó en esta sesión
Infraestructura documental de investigación para JETMI creada y poblada con los tres primeros artefactos reales (Manual Operativo Cap. 1, Mapa Maestro de Investigación, Investigación 1.1) — commit `258d2f5`. Decisión `JETMI-D1` registrada en `DECISIONS.md`. `jetmi.md` (raíz) marcado superseded. Tras una auditoría de persistencia explícita, se corrigieron cuatro huecos de contexto durable: (1) `modules/JETMI.md` ahora explica la relación JETMI↔Isabel↔LIFEOS (sin afirmar que existe un especialista implementado); (2) `modules/JETMI.md` registra la restricción de diseño "una sola persona + sistemas/IA progresivos" como objetivo de negocio, no como automatización ya existente; (3) `research/README.md` documenta la cadena completa fuente→investigación→decisión→PRD→implementación→estado verificado, y la separación de responsabilidades (investigación externa / espacio de producto-estrategia / Claude Code); (4) `research/JETMI/LOG.md` fija que el próximo bloque de investigación es **Fase 1, dominio 1.2 (Supply)**, ya no como decisión abierta. **No se diseñó ni implementó ninguna funcionalidad operativa de JETMI**, ni se inició la investigación 1.2 — trabajo exclusivamente documental. Detalle completo en `CHANGELOG.md`, estado general en `CURRENT_STATE.md`.

## Qué quedó pendiente
1. **Abrir la investigación del dominio 1.2 (Supply — operadores y aeronaves)** de la Fase 1 del Mapa Maestro — decidido pero no iniciado. Sigue el mismo protocolo ya usado: producir/recibir el artefacto → ingerir en `research/JETMI/sources/` sin editorializar → actualizar `LOG.md` (cobertura por área) → actualizar `HYPOTHESES.md` → identificar candidatos a `KNOWLEDGE.md` sin promoverlos automáticamente.
2. Tras completar 1.2, decidir el bloque siguiente (1.3 demanda, 1.4 ciclo operativo, o abrir la Fase 0 legal) según los hallazgos — no está pre-decidido.
3. Fase 0 (constitución legal, modelo jurídico, regulación) sigue pendiente y bloqueante para operar el primer vuelo real, pero no es el siguiente bloque inmediato.
4. Confirmar que la migración del checklist Daily Duties de HOTO llegó a Supabase en el móvil de la usuaria (pendiente de sesiones anteriores, detalle en `modules/VISTAJET_HOTO.md`).

## Qué debe hacerse inmediatamente después
Si la usuaria trae el artefacto de investigación del dominio 1.2 (Supply), ingerirlo con el protocolo ya establecido. Si no lo trae, no hay nada que hacer de oficio — no iniciar la investigación 1.2 por iniciativa propia sin el artefacto correspondiente, y no adelantar contenido de 1.3/1.4/Fase 0.

## Qué no debe romperse
- Ningún cambio de esquema en Supabase sin protocolo antes/después (`PRINCIPLES.md` #5 y #7).
- Los documentos de la raíz del proyecto (`VISION.md`, `ISABEL_CORE.md`, `JETMI_PRD_Semilla.md`, etc.) no se editan desde `/docs` salvo notas de cabecera "superseded" explícitas y mínimas — nunca reescritura silenciosa.
- La regla del pipeline de investigación: nada pasa de `sources/` a `KNOWLEDGE.md` sin extracción, clasificación y verificación deliberadas. Ver la cadena completa (fuente→...→código) en `research/README.md`.
- La sección "Candidatos a consolidación futura" de `KNOWLEDGE.md` no es conocimiento oficial — no citarla como fuente de verdad.
- No asignar funciones concretas a agentes de IA todavía — la restricción "una persona + IA" de JETMI es un objetivo de diseño, no una arquitectura decidida (ver `modules/JETMI.md`).
- HOTO e Inventario de producción contienen datos reales de rotaciones reales — cualquier escritura sigue el patrón dry-run + verificación de `modules/VISTAJET_INVENTORY.md` y `VISTAJET_HOTO.md`.

## Qué documentos debe leer el siguiente chat
`README.md` → `CURRENT_STATE.md` → este documento → si retoma JETMI: `modules/JETMI.md` (estado, posicionamiento, relación con Isabel, restricción de diseño) → `research/JETMI/LOG.md` § 6 (próximo bloque: Fase 1, dominio 1.2 Supply) → `research/README.md` (cadena completa y pipeline de ingestión) antes de tocar `sources/`, `HYPOTHESES.md` o `KNOWLEDGE.md`.
