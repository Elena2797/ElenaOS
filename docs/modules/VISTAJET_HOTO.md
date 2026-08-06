Estado: implementado, con gaps documentados explícitamente
Última verificación: 2026-07-10
Verificado en: isabel-api/src/hoto/*, pipeline real ejecutado contra el registro de producción (9H-VCQ), verificación visual de render del PDF con marcadores
Fuente de verdad de datos: DATA_MODEL.md § vj_hoto_records, vj_hoto_items

# modules/VISTAJET_HOTO.md

# Objetivo
Reemplazar el proceso manual de rellenar el Handover/Takeover de VistaJet. Mismo patrón que Inventario: Supabase acompaña toda la rotación, el PDF oficial es exportación bajo demanda, nunca el lugar de edición.

# Estado real
Implementado, con auditoría exhaustiva realizada (2026-07-09/10) que reveló que el modelo actual representa el **documento**, no la **rotación** — ver "Por qué está así" abajo.

# Qué funciona
- Cabecera (matrícula, ICAO, estado, pattern, código CH, fecha recepción, días a bordo) → los 5 campos verificados idénticos entre app, Supabase y PDF.
- **Cabin Care** (17 fechas): mapeo verificado empíricamente con marcadores únicos por fila (R01…R17), cada uno cae en su fila exacta del PDF.
- **Shopping** (14 celdas: 8 dropdown + 6 texto): verificado con marcadores por fila.
- **Magazines**: estructura rica en la app (nombre, edición, estado, checked, nota); el PDF recibe solo el resumen derivado. Lista vacía = celda vacía (nunca arrastra el valor heredado del PDF original).
- **Defects** (hasta 6) y **Offload** (hasta 3): listas simples, `vj_hoto_items`.
- **Additional Comments**: lista sin límite en la app, se unen con saltos de línea en el único recuadro del PDF.
- **Export write-all**: todos los campos modelados se escriben siempre (valor o vacío explícito) — el PDF es función pura de Supabase, verificado rellenando un template deliberadamente "sucio".
- **Daily Duties (checklist)** — conectado 2026-07-10: 46 de 47 tareas de la app mapean a checkboxes reales del PDF oficial, verificado renderizando cada sección de Daily Duties en una columna distinta y confirmando visualmente que cada tick cae en su fila y columna exacta. Desde D16 (2026-08-06) las 6 columnas se escriben siempre, cada una con sus propios datos — antes solo se escribía `ch_column_index` y se limpiaban las otras 5.
- **Import de un HOTO real recibido (PDF → LIFEOS)** — D16, 2026-08-06: sube el PDF oficial ya rellenado, LIFEOS lo analiza (AcroForm real, sin OCR) y pregunta "Continuar este HOTO" (conserva todas las columnas usadas, abre la siguiente libre) o "Nuevo HOTO desde este" (conserva avión/stock/cabin care/focus/defects/comments/offload, resetea las 6 columnas de handover, generación nueva). Verificado con el HOTO real de 9H-VCQ: 100% de los campos (tail_number, icao, status, 4 defects, 1 offload, 2 comments, 40 daily duties, stock, focus) se recuperaron exactos en un round-trip export→import. El PDF importado nunca se edita a mano — se convierte al modelo de LIFEOS y de ahí en adelante se edita en la app, igual que un HOTO creado desde cero.
- Guardado no-optimista en toda la edición del HOTO (cabecera, Cabin Care, Shopping, Magazines, checklist): la UI solo refleja un valor tras confirmar Supabase.
- Reset por sección (Shopping, Magazines, Cabin Care, Defects, Comments, Offload, Daily Duties), con confirmación, acotado por `hoto_id` — nunca borra otro HOTO ni otra tabla.

# Qué está parcialmente implementado
- **Comments**: la app permite comentarios ilimitados, el PDF tiene un solo recuadro de tamaño finito — sin desbordamiento verificado, pero es un riesgo latente con muchos comentarios.
- **Magazines**: la celda del PDF se deriva de `magazines_list` de la app; al importar un PDF, esa celda se detecta pero deliberadamente NO se reimporta como texto (crearía una segunda fuente de verdad para el mismo dato) — se reporta explícitamente como no importable, nunca se pierde en silencio ni se inventa una lista estructurada a partir del texto plano.

# Qué no existe todavía
- **Item `s9`** ("Winter/Summer Ops performed") del checklist no tiene checkbox correspondiente en el PDF — se marca en la UI como "(no está en el PDF)".

# Modelo de datos
Ver [DATA_MODEL.md § VistaJet — HOTO](../DATA_MODEL.md). Storage: bucket `hoto-templates`.

# Flujos de usuario
Crear HOTO (o continuar el activo) → editar secciones durante la rotación (cabecera, Cabin Care, Shopping, Magazines, Defects, Comments, Offload, Daily Duties) → exportar PDF oficial cuando se necesite, tantas veces como haga falta.

# Backend/endpoints
`isabel-api/src/routes/hoto.js`: crear, obtener activo, PATCH cabecera/JSON, añadir/borrar items, exportar (`GET /v1/hoto/:id/export`, soporta `?inline=1` para visor móvil y `?api_key=` para navegación directa). Import (D16): `POST /v1/hoto/import/analyze` (parsea, no escribe) y `POST /v1/hoto/import/apply?tail_number=&mode=&source_filename=` (aplica la decisión Continue/New) — ambos reciben el PDF como body binario (`Content-Type: application/pdf`), sin sesión de subida entre los dos pasos.

# Frontend/vistas
`life-os-app/src/main.js`: `vjHotoView()` (pestañas Entrega/Checklist), `hotoEntregaTab()` incluye el flujo de import ("Subir HOTO" → detección → Continuar/Nuevo). Servicio: `services/hoto.js`. Definiciones del dominio centralizadas en `life-os-app/src/hoto/model.js` (única fuente, con contrato documentado hacia `isabel-api/src/hoto/fieldMap.js`).

# Archivos relevantes
`isabel-api/src/hoto/{data,fieldMap,pdfExport,pdfImport}.js`, `life-os-app/src/hoto/model.js`, `life-os-app/src/services/hoto.js`.

# Verificaciones empíricas realizadas
- Cabin Care: 17 marcadores únicos, render y comparación visual — 17/17 correctos.
- Daily Duties: verificación por columna distinta por sección — 46/46 checkboxes caen en fila y columna correctas, `s9` correctamente sin checkbox.
- Write-all: template deliberadamente sucio rellenado, confirmado que ningún campo modelado arrastra valores viejos.
- Protocolo antes/después aplicado en cada cambio de esquema o exportador: conteo de registros + comparación campo a campo del PDF exportado.

# Bugs conocidos
Ver [KNOWN_PROBLEMS.md](../KNOWN_PROBLEMS.md): duplicación de Shopping con Inventario, ausencia de módulo Defects propio. El hueco de correlación `tail_number`/`status` (D13) y el de columnas históricas de CH no exportadas (D16) quedaron resueltos, ambos el 2026-08-06 — ver `DECISIONS.md` D13/D16.

# Decisiones cerradas
Ver [DECISIONS.md](../DECISIONS.md) D2, D3, D4, D5, D6, D13 (correlación por matrícula + transición `active → delivered`), D16 (import de HOTO real + modelo de columnas, 2026-08-06).

# Por qué está así (el hallazgo central de la auditoría)
El modelo actual de HOTO refleja las celdas del documento PDF, no la rotación como proceso. Varios datos que hoy vive "dentro" del HOTO (shopping/stock, defects) son conceptualmente propiedad de otros dominios (Inventario, un futuro módulo de Defects). La reconstrucción hacia un modelo de "datos propios vs. datos prestados" (donde HOTO lee en vivo de otros módulos al exportar, en vez de copiar) está diseñada pero explícitamente pospuesta por fases — ver D6.

# Fuera de alcance actual
Conversación con Isabel durante la rotación sobre el propio HOTO (Isabel ya lee `hoto: {...}` en `vistajet_get_status`, pero no expone edición conversacional de sus campos).

# Próximo hito
La reconstrucción por fases hacia "datos propios vs. prestados" (D6) sigue pendiente de que la usuaria decida retomarla — sin cambios. El import de HOTO real (D16) queda como base para cargar el HOTO real de D-AFBS cuando llegue — sin cambios adicionales de modelo previstos salvo que el PDF real revele algo que `fieldMap.js` no cubra.
