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
- **Daily Duties (checklist)** — conectado 2026-07-10: 46 de 47 tareas de la app mapean a checkboxes reales del PDF oficial, verificado renderizando cada sección de Daily Duties en una columna distinta y confirmando visualmente que cada tick cae en su fila y columna exacta. Se marca solo la columna `ch_column_index` actual — las otras 5 columnas del histórico de CH no se tocan.
- Guardado no-optimista en toda la edición del HOTO (cabecera, Cabin Care, Shopping, Magazines, checklist): la UI solo refleja un valor tras confirmar Supabase.
- Reset por sección (Shopping, Magazines, Cabin Care, Defects, Comments, Offload, Daily Duties), con confirmación, acotado por `hoto_id` — nunca borra otro HOTO ni otra tabla.

# Qué está parcialmente implementado
- **Comments**: la app permite comentarios ilimitados, el PDF tiene un solo recuadro de tamaño finito — sin desbordamiento verificado, pero es un riesgo latente con muchos comentarios.
- **Tabla del CH histórico**: solo se modela la columna actual (`ch_column_index`); las otras 5 se limpian explícitamente en cada export (correcto para "sin HOTO previo", pero sin forma de capturar histórico real si existiera).

# Qué no existe todavía
- **Focus of the Month**: campo real del PDF (texto + checkbox), sin UI en la app.
- **Item `s9`** ("Winter/Summer Ops performed") del checklist no tiene checkbox correspondiente en el PDF — se marca en la UI como "(no está en el PDF)".
- **Importar HOTO recibido**: pedido explícitamente por la usuaria como funcionalidad futura, no implementado a propósito.

# Modelo de datos
Ver [DATA_MODEL.md § VistaJet — HOTO](../DATA_MODEL.md). Storage: bucket `hoto-templates`.

# Flujos de usuario
Crear HOTO (o continuar el activo) → editar secciones durante la rotación (cabecera, Cabin Care, Shopping, Magazines, Defects, Comments, Offload, Daily Duties) → exportar PDF oficial cuando se necesite, tantas veces como haga falta.

# Backend/endpoints
`isabel-api/src/routes/hoto.js`: crear, obtener activo, PATCH cabecera/JSON, añadir/borrar items, exportar (`GET /v1/hoto/:id/export`, soporta `?inline=1` para visor móvil y `?api_key=` para navegación directa).

# Frontend/vistas
`life-os-app/src/main.js`: `vjHotoView()` (pestañas Entrega/Checklist). Servicio: `services/hoto.js`. Definiciones del dominio centralizadas en `life-os-app/src/hoto/model.js` (única fuente, con contrato documentado hacia `isabel-api/src/hoto/fieldMap.js`).

# Archivos relevantes
`isabel-api/src/hoto/{data,fieldMap,pdfExport}.js`, `life-os-app/src/hoto/model.js`, `life-os-app/src/services/hoto.js`.

# Verificaciones empíricas realizadas
- Cabin Care: 17 marcadores únicos, render y comparación visual — 17/17 correctos.
- Daily Duties: verificación por columna distinta por sección — 46/46 checkboxes caen en fila y columna correctas, `s9` correctamente sin checkbox.
- Write-all: template deliberadamente sucio rellenado, confirmado que ningún campo modelado arrastra valores viejos.
- Protocolo antes/después aplicado en cada cambio de esquema o exportador: conteo de registros + comparación campo a campo del PDF exportado.

# Bugs conocidos
Ver [KNOWN_PROBLEMS.md](../KNOWN_PROBLEMS.md): duplicación de Shopping con Inventario, ausencia de módulo Defects propio, columnas históricas de CH no exportadas.

# Decisiones cerradas
Ver [DECISIONS.md](../DECISIONS.md) D2, D3, D4, D5, D6.

# Por qué está así (el hallazgo central de la auditoría)
El modelo actual de HOTO refleja las celdas del documento PDF, no la rotación como proceso. Varios datos que hoy vive "dentro" del HOTO (shopping/stock, defects) son conceptualmente propiedad de otros dominios (Inventario, un futuro módulo de Defects). La reconstrucción hacia un modelo de "datos propios vs. datos prestados" (donde HOTO lee en vivo de otros módulos al exportar, en vez de copiar) está diseñada pero explícitamente pospuesta por fases — ver D6.

# Fuera de alcance actual
Importar HOTO recibido, Focus of the Month, conversación con Isabel durante la rotación, columnas históricas de otras CH — todo pedido explícitamente por la usuaria como "después, no ahora".

# Próximo hito
Ninguno decidido. La reconstrucción por fases (D6) queda pendiente de que la usuaria decida retomarla.
