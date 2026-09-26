Estado: implementado, con gaps documentados explícitamente
Última verificación: 2026-09-23
Verificado en: isabel-api/src/hoto/*, pipeline real ejecutado contra el registro de producción (9H-VCQ), verificación visual de render del PDF con marcadores. Import de HOTO real (D16) y fixes de export (D17, texto duplicado + Magazines) verificados contra el HOTO real de 9H-VCQ y contra la API ya desplegada — el HOTO de D-AFBS está en uso real en producción (Generación 2 al cierre de esa sesión). Análisis automático (D69) verificado con 27 tests (puros + orquestación con Supabase falso en memoria); **sin probar todavía contra un HOTO real de producción**.
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
- **Export sin texto duplicado ni Magazines rota** — D17, 2026-08-07: encontrado probando el HOTO real de D-AFBS en iPhone. Tail Number/ICAO se escribían dos veces en widgets solapados del PDF oficial (texto visualmente duplicado) — ahora solo el campo canónico recibe el valor, el duplicado se blanquea explícitamente. Magazines fallaba por dos causas — auto-ajuste de fuente dependiente del visor, y un bug de codificación real (el texto de Magazines de 9H-VCQ contiene tabs; `WinAnsiEncoding` no los codifica y podía abortar la generación de apariencias de todo el formulario) — corregido con tamaño de fuente fijo + saneado de caracteres de control en todos los campos de texto, no solo Magazines. "Exportar" pasó a ser "Guardar PDF": nombre de archivo editable, Web Share API con archivo real como vía principal en iOS.
- Guardado no-optimista en toda la edición del HOTO (cabecera, Cabin Care, Shopping, Magazines, checklist): la UI solo refleja un valor tras confirmar Supabase.
- Reset por sección (Shopping, Magazines, Cabin Care, Defects, Comments, Offload, Daily Duties), con confirmación, acotado por `hoto_id` — nunca borra otro HOTO ni otra tabla.
- **Análisis automático (D69, 2026-09-23):** tras crear, editar, añadir un defect/offload/comment o importar un HOTO, un specialist determinista (sin modelo) revisa Cabin Care (17 filas: sin fecha → alta hoy (nació crítica; bajada a alta el 2026-09-23, D71); más de 7 días → alta, de más antigua a más reciente; recientes → se omiten), Shopping (valor `'0'` → "Comprar X"), Defects ("Reportar a Marnie: …"), Offload, Monthly Focus sin completar y la cabecera de la columna activa incompleta, y apunta cada hallazgo como tarea real en VistaJet — sin que Estefanía lo pida. Corre en segundo plano (no bloquea la respuesta). Deduplicado por título+área estable (mismo mecanismo que ya usa `tasks_create`). Detalle completo en `DECISIONS.md` D69.

- **Pre-HOTO (2026-09-26):** lo que ella cuenta de un avión antes de tener el HOTO se guarda en `vj_pre_hoto_notes` (tools `hoto_pre_add`/`hoto_pre_list`/`hoto_pre_resolve`, `hoto/preHoto.js`). Al importar el PDF oficial, `applyHotoImport` contrasta cada nota de forma determinista: `confirmed` / `not_in_hoto` / `review` (revistas: con el estado oficial). Nunca sobrescribe; migrar o descartar lo decide ella. Solo visible vía Isabel (no hay pantalla en la app). Sin probar con un HOTO real.
- **Entregar el avión descarta sus tareas de HOTO (2026-09-26):** `discardHotoTasks` por título exacto del análisis (D69) + variantes de Cabin Care; no toca tareas a mano.

# Qué está parcialmente implementado
- **Comments**: la app permite comentarios ilimitados, el PDF tiene un solo recuadro de tamaño finito — sin desbordamiento verificado, pero es un riesgo latente con muchos comentarios.
- **Magazines (import interpretado, 2026-09-25):** la celda del PDF sigue derivándose de `magazines_list` al exportar, y ahora TAMBIÉN se interpreta al importar (`hoto/magazines.js`, `parseMagazinesCell`): las revistas que vienen entran como presentes SIN verificar (`needs_renewal` + nota "comprueba la edición"), las de la lista estándar (GQ, Vogue, Cosmopolitan, National Geographic, Time, The Economist) que no vienen entran como `missing`, se respetan los estados si la celda viene de un export nuestro, y una celda vacía da lista vacía (no se inventa que faltan todas). Solo se interpreta una vez: la única fuente de verdad sigue siendo `magazines_list`. Al CONTINUAR un HOTO existente la lista puesta a mano NO se pisa (`mergeImportIntoExisting`). Antes se descartaba y cada HOTO importado llegaba sin revistas. Verificado importando el PDF exportado el 25/09 (6/6).
- **Análisis automático de Defects/Offload (D69)**: si se completa la tarea creada para un defecto/offload sin borrar la línea de origen en `vj_hoto_items`, el siguiente análisis la vuelve a crear (la deduplicación solo mira tareas abiertas). Se resuelve borrando la línea (`DELETE /hoto/items/:id`) cuando de verdad se resuelve, no solo completando la tarea. Cabin Care/Shopping/Monthly Focus/cabecera no tienen este problema: su hallazgo depende de un dato que se corrige en el mismo sitio (fecha, cantidad, checkbox, campo).

# Qué no existe todavía
- **Item `s9`** ("Winter/Summer Ops performed") del checklist no tiene checkbox correspondiente en el PDF — se marca en la UI como "(no está en el PDF)".

# Modelo de datos
Ver [DATA_MODEL.md § VistaJet — HOTO](../DATA_MODEL.md). Storage: bucket `hoto-templates`.

# Flujos de usuario
Crear HOTO (o continuar el activo) → editar secciones durante la rotación (cabecera, Cabin Care, Shopping, Magazines, Defects, Comments, Offload, Daily Duties) → exportar PDF oficial cuando se necesite, tantas veces como haga falta.

# Backend/endpoints
`isabel-api/src/routes/hoto.js`: crear, obtener activo, PATCH cabecera/JSON, añadir/borrar items, exportar (`GET /v1/hoto/:id/export`, soporta `?inline=1` para visor móvil y `?api_key=` para navegación directa). Import (D16): `POST /v1/hoto/import/analyze` (parsea, no escribe) y `POST /v1/hoto/import/apply?tail_number=&mode=&source_filename=` (aplica la decisión Continue/New) — ambos reciben el PDF como body binario (`Content-Type: application/pdf`), sin sesión de subida entre los dos pasos. Crear/PATCH/añadir item/import disparan además el análisis automático (D69) en segundo plano.

# Frontend/vistas
`life-os-app/src/main.js`: `vjHotoView()` (pestañas Entrega/Checklist), `hotoEntregaTab()` incluye el flujo de import ("Subir HOTO" → detección → Continuar/Nuevo). Servicio: `services/hoto.js`. Definiciones del dominio centralizadas en `life-os-app/src/hoto/model.js` (única fuente, con contrato documentado hacia `isabel-api/src/hoto/fieldMap.js`).

# Archivos relevantes
`isabel-api/src/hoto/{data,fieldMap,pdfExport,pdfImport,analysis,autoTasks}.js`, `life-os-app/src/hoto/model.js`, `life-os-app/src/services/hoto.js`.

# Verificaciones empíricas realizadas
- Cabin Care: 17 marcadores únicos, render y comparación visual — 17/17 correctos.
- Daily Duties: verificación por columna distinta por sección — 46/46 checkboxes caen en fila y columna correctas, `s9` correctamente sin checkbox.
- Write-all: template deliberadamente sucio rellenado, confirmado que ningún campo modelado arrastra valores viejos.
- Protocolo antes/después aplicado en cada cambio de esquema o exportador: conteo de registros + comparación campo a campo del PDF exportado.

# Bugs conocidos
Ver [KNOWN_PROBLEMS.md](../KNOWN_PROBLEMS.md): duplicación de Shopping con Inventario, ausencia de módulo Defects propio. El hueco de correlación `tail_number`/`status` (D13) y el de columnas históricas de CH no exportadas (D16) quedaron resueltos, ambos el 2026-08-06 — ver `DECISIONS.md` D13/D16.

# Decisiones cerradas
Ver [DECISIONS.md](../DECISIONS.md) D2, D3, D4, D5, D6, D13 (correlación por matrícula + transición `active → delivered`), D16 (import de HOTO real + modelo de columnas, 2026-08-06), D17 (texto duplicado, Magazines, "Guardar PDF", 2026-08-07), D69 (análisis automático crea tareas, 2026-09-23).

# Por qué está así (el hallazgo central de la auditoría)
El modelo actual de HOTO refleja las celdas del documento PDF, no la rotación como proceso. Varios datos que hoy vive "dentro" del HOTO (shopping/stock, defects) son conceptualmente propiedad de otros dominios (Inventario, un futuro módulo de Defects). La reconstrucción hacia un modelo de "datos propios vs. datos prestados" (donde HOTO lee en vivo de otros módulos al exportar, en vez de copiar) está diseñada pero explícitamente pospuesta por fases — ver D6.

# Fuera de alcance actual
Conversación con Isabel durante la rotación sobre el propio HOTO (Isabel ya lee `hoto: {...}` en `vistajet_get_status`, pero no expone edición conversacional de sus campos).

# Próximo hito
La reconstrucción por fases hacia "datos propios vs. prestados" (D6) sigue pendiente de que la usuaria decida retomarla — sin cambios. El HOTO real de D-AFBS ya se importó y está en uso (Generación 2 al cierre de esa sesión, D16/D17) — sin cambios adicionales de modelo previstos salvo que aparezca algo que `fieldMap.js` no cubra. **Pendiente inmediato (D69):** confirmar con Estefanía que el análisis automático crea tareas de verdad la próxima vez que edite o importe el HOTO activo — solo probado con Supabase falso en memoria, nunca contra producción.

# HOTO PROVISIONAL (2026-09-26)

Sin PDF oficial ella puede empezar un HOTO a mano ("Empieza uno provisional"): se reconoce por no tener `imported_at` ni
`source_filename`. Cuando llega el PDF y lo importa con **Continuar**, `mergeProvisional` (`hoto/provisional.js`) conserva lo suyo
y solo rellena lo vacío (sin pisar Shopping/Fresh Items, ICAO, cabecera, fechas de Cabin Care más recientes, tareas diarias;
líneas repetidas no se duplican); `applyHotoImport` devuelve `provisional: {integrated, kept}`. Un HOTO ya importado sigue con
`mergeImportIntoExisting` (el PDF autoritativo). Las notas pre-HOTO (`hoto_pre_*`) siguen siendo para lo que cuenta sin HOTO alguno.
