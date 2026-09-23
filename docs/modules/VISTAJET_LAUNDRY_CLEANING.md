Estado: implementado, en `main`, desplegado (editor + export web); tools de chat (`laundry_*`) añadidas 2026-09-22
Última verificación: 2026-09-22
Verificado en: pipeline real end-to-end (crear → editar cabecera/ítems/Other → recargar → exportar) contra Supabase de producción y backend local; PDF de export inspeccionado campo a campo; tools de chat verificadas por lectura de código + suite de tests de isabel-api (725/726, el único fallo es ajeno — ver KNOWN_PROBLEMS.md)
Fuente de verdad de datos: DATA_MODEL.md § VistaJet — Laundry & Cleaning Form

# modules/VISTAJET_LAUNDRY_CLEANING.md

# Objetivo
Reemplazar el proceso manual de rellenar el "Laundry & Cleaning Form" oficial de VistaJet (lavandería, vajilla/dishwashing, ropa de cama Global 7500, dry cleaning y cristalería a entregar/recibir del proveedor). Mismo patrón que HOTO e Inventario: Supabase acompaña la rotación, el PDF oficial es exportación bajo demanda, nunca el lugar de edición.

# Estado real
Implementado y verificado de extremo a extremo (originalmente en worktrees git aislados, `feature/vj-landing-cleaning`); **ya integrado en `main` y desplegado** — el router de `isabel-api/src/index.js` monta `laundryCleaningRouter` en `/v1`. Hasta 2026-09-22 solo existía como editor web (app) y export PDF; no había ninguna forma de leerlo o rellenarlo desde el chat de Isabel — confirmado en producción cuando Estefanía intentó reportarle consumos del Laundry Form y no existía ninguna tool para ello (la única tool de chat que existía, `isabel_message`, es del inventario general, un dato distinto). Se añadieron 4 tools MCP ese mismo día — ver "Tools de chat (Isabel)" más abajo.

**Reemplaza** el stub anterior `vjLaundryView()` (contador simple en `localStorage`, sin Supabase, sin exportación) — ver [archive/VISTAJET_LAUNDRY.md](../archive/VISTAJET_LAUNDRY.md).

# Qué funciona
- **Cabecera** (7 campos: Aircraft Registration, ICAO, Date, CH Name, CH Contact Number, CH Email Address, Expected Date of Departure) — editable, guardado no-optimista campo a campo.
- **78 filas de ítems** repartidas en 6 tablas (Laundry 20, Cleaning/Dishwashing×2 20+20, Global 7500 Bed Linen 5, Dry Cleaning 8, Glasses 5), cada una con cantidad **Given** y **Received** editables por separado.
- **Filas "Other:"** (una por tabla, 6 en total): el PDF oficial solo tiene una celda de texto libre ancha ahí, sin columna Received — confirmado empíricamente auditando el AcroForm. En la app se piden **descripción y cantidad por separado**, y se combinan en un único texto al exportar (ej. `"Extra pillow protectors — 2"`).
- **Additional Comments**: campo de texto libre.
- **Guardado no-optimista** en toda la edición (cabecera e ítems): la UI solo refleja un valor tras confirmar Supabase; si falla, revierte y avisa.
- **Export write-all**: todos los campos modelados se escriben siempre (valor o vacío explícito) en cada export.
- **Firmas** (CH Signature / Provider Signature): son campos `PDFSignature` reales del PDF — **no se rellenan por software**, quedan para firma manual. Igual que HOTO no toca ningún campo de firma.

# Qué está parcialmente implementado
Nada identificado — el alcance definido (editor + export) está completo y verificado.

# Qué no existe todavía
- Historial de formularios enviados/exportados.
- Cualquier conexión con Inventario o HOTO (son módulos independientes; el mismo tipo de dato — p.ej. cristalería — puede existir por separado en cada uno, sin sincronización, igual que ya ocurre entre Inventario y `vj_hoto_records.shopping`).
- Reset por sección (sí existe en HOTO, no se replicó aquí — no pedido).
- Lectura de PDFs de terceros (ej. el handover que manda la compañera saliente) para rellenar el formulario automáticamente — Isabel solo lee/escribe el registro vivo de Supabase vía las tools de abajo, nunca un PDF entrante. Ver KNOWN_PROBLEMS.md sobre extracción de texto de PDF.

# Tools de chat (Isabel) — añadidas 2026-09-22
`isabel-api/src/laundryCleaning/chatTools.js`, expuestas en `isabel-api/src/mcp.js`:
- **`laundry_get_status`**: registro activo (cabecera + qué ítems ya tienen Given/Received/nota y cuántos faltan). Isabel la llama antes de hablar del formulario.
- **`laundry_start`**: abre un registro nuevo (requiere `tail_number`); falla explícitamente si ya hay uno activo, nunca crea un segundo.
- **`laundry_update_header`**: ICAO, fecha, contacto CH, fecha de salida prevista, comentarios.
- **`laundry_update_items`**: registra Given/Received (o el texto de una fila "Other:") a partir del nombre del ítem tal cual lo dice Estefanía; resuelve contra el catálogo real de 78 ítems (`fieldMap.js`) reutilizando el mismo matcher por similitud que ya usa `isabel_message` para el inventario (`resolver.js`) — ambigüedad o "no encontrado" se devuelven sin adivinar, nunca aplica un ítem que no está seguro de haber resuelto bien.

Estas tools nunca tocan `vj_inventory_sessions` ni `vj_hoto_records` — solo `vj_laundry_cleaning_records`, la misma tabla que ya usaba el editor web.

# Modelo de datos
Ver [DATA_MODEL.md § VistaJet — Laundry & Cleaning Form](../DATA_MODEL.md). Storage: bucket `laundry-cleaning-templates`.

# Flujos de usuario
Crear formulario (o continuar el activo) → editar cabecera y las 6 tablas de ítems durante la rotación → exportar PDF oficial cuando se necesite, tantas veces como haga falta.

# Backend/endpoints
`isabel-api/src/routes/laundryCleaning.js`: crear, obtener activo, PATCH cabecera/items, exportar (`GET /v1/laundry-cleaning/:id/export`, soporta `?inline=1` para visor móvil y `?api_key=` para navegación directa — mismo patrón que HOTO).

# Frontend/vistas
`life-os-app/src/main.js`: `vjLandingCleaningView()`. Servicio: `services/laundryCleaning.js`. Catálogo de ítems (`VJ_LLC_SECTIONS`) definido en `main.js` — **contrato cross-repo** con `isabel-api/src/laundryCleaning/fieldMap.js` (mismo `item.id` a ambos lados; el mapeo a nombres internos del campo PDF vive solo en el servidor).

# Archivos relevantes
- `isabel-api/src/laundryCleaning/{data,fieldMap,pdfExport,chatTools}.js`, `isabel-api/src/routes/laundryCleaning.js`, `isabel-api/src/mcp.js` (tools `laundry_*`), `isabel-api/scripts/uploadLaundryCleaningTemplate.mjs`.
- `life-os-app/src/services/laundryCleaning.js`, `life-os-app/src/main.js` (`VJ_LLC_SECTIONS`, `vjLandingCleaningView()`, `llc*` funciones).
- `life-os-app/laundry_cleaning_migration_v1.sql`.

# Verificaciones empíricas realizadas
- **Auditoría del PDF oficial**: AcroForm confirmado, 162 campos (159 texto + 2 firma + 1 botón). Los nombres internos de los campos son ruido (auto-etiquetado de Acrobat, no corresponden a su posición visual) — mapeo real construido rellenando cada campo con un código de posición único, exportando y verificando visualmente en qué celda caía cada uno (mismo método que los marcadores R01–R17 de Cabin Care en HOTO).
- **Export verificado con la función real** `fillLaundryCleaningPdf()` (no un script auxiliar): los 78 ítems + 7 campos de cabecera + comentarios, cada uno con un valor único, cayeron en su celda exacta al renderizar.
- **Pipeline end-to-end verificado en el navegador** contra Supabase de producción y un backend local: crear registro → editar cabecera → editar varios ítems normales → editar una fila "Other:" (descripción + cantidad) → recarga completa de la app → confirmado que cabecera e ítems persisten exactamente → export real vía el botón (`GET /v1/laundry-cleaning/:id/export?inline=1`, HTTP 200) → PDF descargado e inspeccionado campo a campo, coincide con lo guardado → edición adicional después de la recarga confirmó que ningún ítem previo se pierde.
- El registro de prueba usado en la verificación (matrícula `9H-VCQ`) se borró de Supabase al terminar — la tabla queda vacía, lista para el primer uso real.

# Bugs conocidos
Ninguno identificado en la verificación realizada.

# Decisiones cerradas
- Ítems normales se guardan como `{given, received}`; las filas "Other:" (sin columna Received en el PDF) se guardan como `{given, note}` y se combinan en un único texto solo al exportar — decisión explícita de la usuaria, no inferida.
- El módulo reemplaza por completo el stub anterior de `localStorage` en vez de convivir con él — decisión explícita de la usuaria.

# Fuera de alcance actual
Todo lo no descrito arriba (historial, conexión con otros módulos, reset por sección).

# Próximo hito
Ya integrado y desplegado, con tools de chat. Pendiente real: probar `laundry_update_items` con una frase real de Estefanía en producción (verificado hasta ahora por lectura de código + tests, no en conversación real con Isabel).
