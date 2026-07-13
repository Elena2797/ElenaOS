Estado: implementado y verificado en worktrees aislados — sin push, sin merge a main, no desplegado
Última verificación: 2026-07-13
Verificado en: pipeline real end-to-end (crear → editar cabecera/ítems/Other → recargar → exportar) contra Supabase de producción y backend local; PDF de export inspeccionado campo a campo
Fuente de verdad de datos: DATA_MODEL.md § VistaJet — Laundry & Cleaning Form

# modules/VISTAJET_LAUNDRY_CLEANING.md

# Objetivo
Reemplazar el proceso manual de rellenar el "Laundry & Cleaning Form" oficial de VistaJet (lavandería, vajilla/dishwashing, ropa de cama Global 7500, dry cleaning y cristalería a entregar/recibir del proveedor). Mismo patrón que HOTO e Inventario: Supabase acompaña la rotación, el PDF oficial es exportación bajo demanda, nunca el lugar de edición.

# Estado real
Implementado y verificado de extremo a extremo en dos worktrees git aislados (`life-os-app-vj-landing-cleaning`, `isabel-api-vj-landing-cleaning`, rama `feature/vj-landing-cleaning` en ambos repos). **No está en `main`, no tiene push, no está desplegado.** Se integrará después de que la sesión paralela de HOTO llegue a `main` primero (rebase + resolución de conflictos si los hay).

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

# Modelo de datos
Ver [DATA_MODEL.md § VistaJet — Laundry & Cleaning Form](../DATA_MODEL.md). Storage: bucket `laundry-cleaning-templates`.

# Flujos de usuario
Crear formulario (o continuar el activo) → editar cabecera y las 6 tablas de ítems durante la rotación → exportar PDF oficial cuando se necesite, tantas veces como haga falta.

# Backend/endpoints
`isabel-api/src/routes/laundryCleaning.js`: crear, obtener activo, PATCH cabecera/items, exportar (`GET /v1/laundry-cleaning/:id/export`, soporta `?inline=1` para visor móvil y `?api_key=` para navegación directa — mismo patrón que HOTO).

# Frontend/vistas
`life-os-app/src/main.js`: `vjLandingCleaningView()`. Servicio: `services/laundryCleaning.js`. Catálogo de ítems (`VJ_LLC_SECTIONS`) definido en `main.js` — **contrato cross-repo** con `isabel-api/src/laundryCleaning/fieldMap.js` (mismo `item.id` a ambos lados; el mapeo a nombres internos del campo PDF vive solo en el servidor).

# Archivos relevantes
- `isabel-api/src/laundryCleaning/{data,fieldMap,pdfExport}.js`, `isabel-api/src/routes/laundryCleaning.js`, `isabel-api/scripts/uploadLaundryCleaningTemplate.mjs`.
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
Integración a `main`: esperar a que la sesión paralela de HOTO termine y mergee primero, luego hacer rebase de `feature/vj-landing-cleaning` sobre el `main` resultante, resolver conflictos si aparecen (los puntos de contacto conocidos son la línea del router de vistas y el grid del dashboard de VJ en `main.js`), y solo entonces mergear y desplegar.
