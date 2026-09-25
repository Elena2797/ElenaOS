Estado: implementado
Última verificación: 2026-09-25
Verificado en: isabel-api/src/batch.js, resolver.js, routes/export.js, __tests__/parser.test.js (30/30 tests en verde); verificación empírica de aplicación real de 133 conteos en producción (2026-07-09/10)
Fuente de verdad de datos: DATA_MODEL.md § vj_inventory_sessions, vj_inventory_session_items, vj_inventory_chat

# modules/VISTAJET_INVENTORY.md

# Objetivo
Reemplazar el proceso manual de contar inventario del avión y rellenar el Excel oficial de VistaJet. Supabase es la fuente de verdad durante toda la rotación; el Excel es exportación bajo demanda.

# Estado real
Implementado y en uso real — se aplicaron 133 conteos reales a producción durante esta sesión de desarrollo, con verificación de que ningún dato se corrompió.

# Qué funciona
- Sesiones de inventario (`vj_inventory_sessions`), una activa a la vez por convención (aunque el modelo permite varias `open` simultáneas — ver Bugs conocidos).
- Carga inicial desde Excel (`parseXlsx` en `services/inventory.js`), detectando columnas automáticamente.
- **Chat en lenguaje natural** para mensajes individuales ("He contado 3 Coca-Cola"): reglas deterministas primero (`quickIntent.js`), Haiku (`intent.js`) solo de respaldo — D70.
- **Modo lote** (`batch.js`): detecta listas completas en un mensaje (≥2 líneas reconocibles) y las procesa sin bloquear en la primera ambigüedad. Soporta 3 formatos de línea: `verbo + número + nombre`, `número + nombre`, y `nombre + número` (añadido 2026-07-10 tras el bug de listas por categoría).
- **Resolución exacta primero, difusa después** (`resolver.js`): coincidencia exacta de texto normalizado puntúa 1.0 y gana siempre; el fuzzy (similitud Dice sobre bigramas) solo entra si no hay coincidencia exacta.
- **Excepciones interactivas**: ambiguos y no-encontrados se resuelven uno a uno tras confirmar el lote (`exceptionService.js`).
- **Export Excel oficial**: patch quirúrgico del XML interno del .xlsx original (no regenera el archivo desde cero) — preserva fórmulas, formato, y merged cells. Dos modos: completo y `UPLIFT` (solo productos con `ReqQ > 0`, filas ocultas no borradas).
- Nombre del archivo exportado usa la fecha de exportación (hora Europa/Madrid), no la de apertura de la sesión.

# Qué está parcialmente implementado
- Chat individual: desde 2026-09-25 (D70) lo predecible se entiende por reglas (`quickIntent.js`); Haiku solo de respaldo para frases raras. El modo lote sigue siendo 100% regex.

# Qué no existe todavía
- Ningún "especialista" invocable por un Core (ver `core/SPECIALISTS_PROTOCOL.md`) — se usa vía HTTP directo o MCP.
- Cierre automático de sesiones antiguas — pueden quedar varias `open` simultáneas sin que nada avise (bug conocido, ver abajo).

# Lenguaje de Estefanía (confirmado con ella, 2026-09-25)
Cómo escribe de verdad sus notas de inventario, y qué NO se puede asumir:
- **"Atrás" y "adelante" son dos compartimentos; el total es la suma.** "Detrás hay 4 Coca Cola" es solo un parcial. *(Aún no implementado: hoy hay que sumar a mano.)*
- **El linen (tablecloth, napkins, microfibre…) es ropa para lavar, no consumo** → va al Laundry & Cleaning Form (`modules/VISTAJET_LAUNDRY_CLEANING.md`), nunca a restar del inventario.
- "he utilizado / anota que…" = consumo; "hay N / tengo N / queda N" = conteo; "he pedido / hacen falta" = pedido o falta; "me subieron N" = entrada de catering (suma).
- Equivalencias: **"servilletas pequeñas" = VJ cocktail napkins**; **una "caja" de cápsulas Illy = 10** (el ítem cuenta cápsulas).
- Las listas de platos/cubiertos de un día **caducan cuando los lava**; el linen no.
- Las notas llegan mezcladas de varios días: pedirlas por día y, si un ítem sale dos veces, manda el último. Quiere confirmar ítem por ítem, una pregunta cada vez.
- Puede poner bebidas "al estándar" sin contarlas cuando ya no está en el avión: es decisión suya, queda como verificado sin contar.
- **Las listas de ítems cambian entre aviones** (9H-VCQ: 349 ítems con pistachos y crew cutlery; 9H-VCF: 345). Un ítem que no está no es un bug.

# Modelo de datos
Ver [DATA_MODEL.md § VistaJet — Inventario](../DATA_MODEL.md). Storage: bucket `inventory-templates`.

# Flujos de usuario
1. Subir Excel → se parsean items y se crea sesión `open`.
2. Contar por chat, individual o en lote.
3. Confirmar propuesta ("sí"/"confirmo").
4. Resolver excepciones si las hay.
5. Exportar Excel completo o UPLIFT cuando se quiera.

# Backend/endpoints
`isabel-api/src/routes/`: `session.js`, `message.js`, `confirm.js`, `export.js`. Todos bajo `/v1`, auth por `x-api-key`.

# Frontend/vistas
`life-os-app/src/main.js`: `vjInventarioView()`. Servicio: `services/inventory.js`.

# Archivos relevantes
`isabel-api/src/{batch,quickIntent,resolver,business,intent,data}.js`, `isabel-api/src/aliases/inventoryAliases.js`, `isabel-api/src/routes/{session,message,confirm,export}.js`, `isabel-api/src/__tests__/{parser,inventoryNaturalLanguage}.test.js`.

# Verificaciones empíricas realizadas
- 30/30 tests unitarios en verde (`node --test`), incluidos los del formato "Nombre: cantidad" añadido 2026-07-10.
- Aplicación real de 133 conteos a la sesión de producción de 9H-VCQ, con dry-run previo (comparando contra nombres exactos del inventario) y verificación post-escritura de que ítems peligrosamente cercanos por fuzzy (ej. "Toallas de baño" → casi cae en "Ruinart Blanc de Blanc") no se corrompieron.

# Bugs conocidos
- Pueden coexistir varias sesiones `open` para el mismo avión sin aviso — se detectó en producción (dos sesiones abiertas del 9H-VCQ, una casi vacía y abandonada). `getActiveSession()` toma la más reciente por `created_at`, lo cual funciona pero no avisa de la ambigüedad.
- El proposal calculado en modo lote (`proposed_qty` en `batch.js`) usa una fórmula que diverge de la del modo individual para acciones `missing`/`request` — no afecta al dato final escrito (que sale de `buildPatch`, idéntico en ambos modos, verificado), pero es código muerto confuso.

# Decisiones cerradas
Ver [DECISIONS.md](../DECISIONS.md) D1 (documento = exportación, nunca edición directa).

# Fuera de alcance actual
Especialista invocable por un Core genérico (ver `core/SPECIALISTS_PROTOCOL.md`).

# Próximo hito
Fase 2 del lenguaje (D70): atrás+adelante como suma, "no queda ninguno"=0, "estándar", "me subieron"=entrada, equivalencias de unidad por ítem, y linen → Laundry Form. Lo no entendido debe apuntarse como fallo, no perderse.
