Estado: conocimiento vigente — se añade, nunca se reescribe
Última verificación: 2026-07-10
Verificado en: reconstrucción a partir del historial de esta sesión de desarrollo
Fuente de verdad de datos: ninguna

# DECISIONS.md — ADR ligero

Formato: decisión · fecha · contexto · alternativa descartada · razón · estado. Las decisiones superadas se marcan como tal (no se borran) y, si procede, se copian a `/archive/deprecated-decisions.md` con su reemplazo enlazado.

---

### D1 — El PDF/Excel oficial es exportación, nunca el lugar de edición
**Fecha:** anterior a esta auditoría (patrón ya establecido en Inventario, replicado en HOTO)
**Contexto:** VistaJet exige documentos oficiales con formato exacto (Excel de inventario, PDF de HOTO).
**Alternativa descartada:** editar el Excel/PDF directamente o mantenerlo como fuente de verdad.
**Razón:** un documento binario no es consultable ni versionable de forma útil; Supabase permite edición incremental durante toda la rotación y el documento se genera solo al final.
**Estado:** vigente.

### D2 — Shopping en HOTO se alimenta de Inventario por copia explícita, no por referencia viva
**Fecha:** 2026-07-07 (iteración de Aircraft Shopping en HOTO)
**Contexto:** el stock a bordo ya se captura en Inventario; HOTO necesita reflejarlo en el documento de entrega.
**Alternativa descartada:** que HOTO lea Inventario en vivo en cada render, o que ambos escriban a la misma tabla.
**Razón:** el HOTO es una fotografía del momento de entrega, no un espejo en vivo — Inventario puede seguir cambiando después de que el HOTO se congele. Copiar con gesto explícito ("Usar") preserva esa semántica sin fusionar los modelos de datos.
**Estado:** vigente. Efecto secundario documentado como deuda técnica en `KNOWN_PROBLEMS.md`.

### D3 — Magazines se modela como lista estructurada; el PDF solo recibe el resumen derivado
**Fecha:** 2026-07-07
**Contexto:** el HOTO heredaba un valor de texto libre de "Magazines" del PDF original, sin forma de saber qué revistas debían llevarse ni su estado.
**Alternativa descartada:** seguir usando un campo de texto libre.
**Razón:** sin estructura no se puede razonar sobre "¿está al día?" ni detectar cuándo una revista confirmada el mes pasado necesita reconfirmarse.
**Estado:** vigente.

### D4 — Write-all en el exportador de HOTO
**Fecha:** 2026-07-07
**Contexto:** se detectó que un valor heredado del PDF original ("All May" en Magazines) sobrevivía en exports posteriores aunque ya no estuviera en la app.
**Alternativa descartada:** seguir escribiendo solo los campos con valor.
**Razón:** el PDF debe ser función pura de Supabase — cualquier campo modelado se escribe siempre, con valor o vacío explícito, para que nunca arrastre datos de una exportación anterior.
**Estado:** vigente, aplicado también al checklist Daily Duties.

### D5 — Daily Duties se persiste en Supabase (`vj_hoto_records.daily_duties`), no en localStorage
**Fecha:** 2026-07-10
**Contexto:** el checklist vivía solo en el navegador; no sobrevivía a cambiar de dispositivo, no llegaba al PDF, y los checkboxes oficiales del documento siempre salían vacíos.
**Alternativa descartada:** mantenerlo en localStorage indefinidamente, o crear una tabla nueva en vez de una columna JSONB.
**Razón:** el checklist SÍ corresponde a checkboxes reales del PDF oficial (verificado empíricamente: 46 de 47 items tienen fila correspondiente) — es dato del dominio, no una conveniencia de la app. JSONB en la tabla existente evita una migración de esquema mayor.
**Estado:** vigente. Migración de datos existentes en localStorage → Supabase implementada como proceso one-time, en el dispositivo del usuario, sin borrar el localStorage original.

### D6 — Reconstrucción de HOTO por fases, nunca big-bang
**Fecha:** 2026-07-09 (tras auditoría solicitada por la usuaria)
**Contexto:** se identificó que el HOTO modela el documento PDF en vez de la rotación, causando duplicación de datos con otros módulos.
**Alternativa descartada:** rediseñar el modelo de datos del HOTO de una vez.
**Razón:** había datos reales de producción en juego (HOTO de una entrega real) el mismo día de la auditoría. La usuaria exigió explícitamente que cualquier cambio de esquema fuera aditivo, verificado antes/después, y nunca destructivo.
**Estado:** vigente como principio general para cualquier cambio de esquema futuro (ver `PRINCIPLES.md` #5).

### D7 — `/docs` vive en `life-os-app`, no en un repo nuevo ni en la raíz sin git
**Fecha:** 2026-07-10
**Contexto:** la raíz `LIFE OS/` no es un repositorio git; había que decidir dónde vive la memoria persistente del proyecto.
**Alternativa descartada:** crear un repo `lifeos-docs` separado, o documentar dentro de `isabel-api`.
**Razón:** `life-os-app` es el punto de entrada real del sistema para la usuaria y ya tenía la disciplina de README más cuidada de los tres repos.
**Estado:** vigente.
