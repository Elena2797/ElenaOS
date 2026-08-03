Última actualización: 2026-08-03 — handoff corto, no histórico acumulativo (para eso está CHANGELOG.md)

# NEXT_SESSION.md

## Qué se terminó en esta sesión
Isabel Core Fase 1 (backend, solo lectura, `isabel-api` `2a7b525`) y Fase 2 (frontend aditivo, `life-os-app` `da840cc`) implementadas, validadas exhaustivamente contra datos reales y desplegadas en producción. `GET /v1/now` agrega señales de todos los dominios y clasifica de forma determinista y auditable qué merece atención (`urgent`/`reentry`/`maintain`/`clear`, nunca decidido por el LLM a partir de datos crudos); la tarjeta "ISABEL · AHORA" en Home la consume, aditiva, sin reemplazar la tarjeta estática existente. Tres bugs de código encontrados y corregidos durante la validación (fences de markdown de Claude, atajo de "sin evidencia" que nunca se activaba, fallo de tabla reportándose como `clear`). Tres incidentes reales de infraestructura encontrados y resueltos en el camino: región inválida de Railway (`sfo`→`us-west2`) bloqueando todos los deploys sin error visible; webhook GitHub→Railway obsoleto, resuelto con Disconnect+Connect Repo completo del Source; variable `VITE_ISABEL_API_URL` de Vercel con el protocolo mal escrito (`http://` en vez de `https://`). Decisión `DECISIONS.md` D9 registrada: Isabel Core se integra dentro de `isabel-api` ya desplegado, nunca como servicio independiente. Detalle técnico completo en `core/ISABEL_NOW.md` (nuevo), historial completo en `CHANGELOG.md` 2026-08-03, estado general en `CURRENT_STATE.md`.

## Qué quedó pendiente
1. **Confirmación de la usuaria tras probar en su iPhone.** Se le entregó un checklist explícito: aparece "ISABEL · AHORA", JETMI se muestra como "Retomar" (nunca "Urgente"), headline/recomendación coinciden con lo verificado, `can_ignore` aparece resumido, el CTA abre JETMI, el resto de Home sigue funcionando. Si no aparece a la primera, probablemente sea el service worker sirviendo caché vieja (ver `KNOWN_PROBLEMS.md`) — cerrar la app por completo y reabrir antes de asumir que algo está roto.
2. Sigue pendiente, sin relación con esto, de sesiones anteriores: "Gym" no aparece en Dominios (`KNOWN_PROBLEMS.md`); investigación de JETMI en pausa, próximo bloque decidido es Fase 1 dominio 1.2 Supply, pendiente de que la usuaria traiga el artefacto (`research/JETMI/LOG.md` § 6).

## Qué debe hacerse inmediatamente después
Si la usuaria confirma que la prueba en iPhone salió bien: no hay ninguna acción de oficio pendiente — preguntarle si quiere decidir el siguiente paso (ampliar dominios con lógica propia, activar `/v1/chat` reutilizando `globalContext.js`, o algo distinto) en vez de proponerlo por iniciativa propia. Si algo falla en su prueba: pedir el detalle exacto (qué vio, en qué estado) antes de tocar nada — no repetir workarounds ya probados sin evidencia nueva.

## Qué no debe romperse
- `attention_mode` y `can_ignore` deben seguir siendo 100% deterministas — nunca dejar que el LLM decida prioridad directamente a partir de `evidence` cruda sin pasar por la clasificación de `globalContext.js`.
- `attention_mode_reliable` debe seguir siendo `false` cuando `tasks`/`alertas`/`waiting_for` fallan — nunca reportar `clear` como si fuera fiable ante un fallo parcial de fuente.
- La tarjeta "ISABEL · AHORA" es aditiva y beta — no reemplazar la tarjeta estática "Isabel habla primero" sin que la usuaria lo decida explícitamente.
- Cero writes desde Isabel (Fase 1/2 son solo lectura) — cualquier escritura futura desde el chat o desde `/v1/now` es una decisión nueva, no una extensión implícita.
- `core/router.js` (`POST /chat`) sigue sin montar — el bridge local sigue siendo el único canal conversacional. No montarlo ni tocarlo sin decisión explícita.
- Región de Railway debe seguir en `us-west2` (`sfo` es inválida y bloquea deploys). `VITE_ISABEL_API_URL` en Vercel debe seguir siendo `https://isabel-api-production.up.railway.app` — si un deploy futuro "no se nota", limpiar el service worker antes de sospechar del código.
- Ningún cambio de esquema en Supabase sin protocolo antes/después (`PRINCIPLES.md` #5 y #7). HOTO e Inventario de producción contienen datos reales — cualquier escritura sigue el patrón dry-run + verificación.
- Los documentos de la raíz del proyecto no se editan desde `/docs` salvo notas de cabecera "superseded" explícitas y mínimas.

## Qué documentos debe leer el siguiente chat
`README.md` → `CURRENT_STATE.md` → este documento → `core/ISABEL_NOW.md` (la pieza nueva completa) → `DECISIONS.md` D9 → si toca el chat conversacional o cualquier canal de Isabel: `core/ISABEL_CHANNELS.md` primero, sigue sin cambios → si toca deploy de `isabel-api` o `life-os-app`: `operations/RAILWAY.md` / `operations/VERCEL.md` (ambos con los incidentes de esta sesión documentados) antes de asumir que un deploy fallido es un bug de código.
