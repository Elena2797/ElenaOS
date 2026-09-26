Estado: implementado (2026-09-26); pendiente de verlo con datos reales en su móvil
Última verificación: 2026-09-26 (noche)
Verificado en: isabel-api/src/hoto/freshSync.js, core/freshAsk.js, core/freshOverview.js, routes/app.js (`/v1/app/fresh`); life-os-app/src/main.js (`loadFresh`, `vjFreshView`)
Fuente de verdad de datos: inventario abierto del avión (`vj_inventory_session_items`, categoría "Shopping list ( as required)") + Shopping del HOTO activo (`vj_hoto_records.shopping`)

# modules/VISTAJET_FRESH.md — Fresh Items

Nombre suyo: **Fresh Items** (nunca "frescos", y no son catering ni sándwiches). Es una sección OFICIAL del HOTO y del
inventario de VistaJet, la misma en todos los aviones (13 ítems del Shopping del HOTO: Lemons, Limes, Oranges, Celery,
Cucumber, Green Olives, Milk Full Fat, Milk Skimmed, Oat Milk, Almond Milk, Evian, Volvic, Selection of Herbs).

Sustituye al antiguo "Fresh Items Plan / próximamente" (un stub que no calculaba nada).

# Qué hace

1. **Un solo número de verdad por ítem — el inventario.** Contar un Fresh Item (por el chat de inventario: "tengo 2 limas",
   "usé 1 apio", "tiré 2 limones", "pedí 3 limas") escribe su valor en el Shopping del HOTO activo del avión
   (`hoto/freshSync.js`, enganchado a `updateItem`): mismo valor de dropdown que ofrece el PDF (más de 3 → "+4").
   Se mapean SOLO descripciones exactas de esa categoría (Lemon, Lime, Celery, Green Olives, Orange, Cucumber,
   "Longlife & fresh milk" → Milk Full Fat, "Types of herbs"): un "Lime" de otra categoría (té) no cuenta.
   Sin equivalente en el HOTO: Soya milk. Evian/Volvic (bebidas, otra categoría) no se sincronizan.
2. **A 0 → "Por comprar".** Al escribir un `'0'` se lanza `runHotoAnalysis` (D69) → tarea "Comprar X" (con dedup).
3. **Contado vs estimado.** `verified` del ítem del inventario: `true` = contado de verdad; `false` = estimado/sin contar.
4. **Pregunta diaria en rotación** (`core/freshAsk.js`, tick de 15 min): un ítem al día, rotando por `FRESH_ORDER`; a la
   hora que deja su agenda (45 min tras el último aterrizaje, mínimo 10:00; sin vuelos desde las 18:00; nunca después de
   21:30). Intervention `fresh_count_ask`, plantilla fija sin modelo. Solo con inventario abierto y en rotación.
5. **Pantalla en la app** (VistaJet → Fresh Items; `GET /v1/app/fresh?tail=`): cantidad, contado/estimado, lo que dice el
   HOTO, "Por comprar" y "HOY" (el que toca contar), con enlaces a Inventario y HOTO. La tarjeta de VistaJet enseña
   "N por comprar" u "Hoy toca contar: X".
6. **Isabel** lo consulta con la tool `fresh_items_status` (misma información).
7. **Pre-HOTO:** un conteo antes de tener el HOTO se guarda como nota `other` "Lemons: 2" y se contrasta al importar
   (igual → `confirmed`; distinto o sin dato → `review`). Tablecloths/napkins/DR kits: texto libre, siempre `review`.

# Qué no hace

- No calcula recomendaciones "por sectores y pasajeros" (el texto del stub antiguo era aspiración, no función).
- No hay lista de compra propia: "Por comprar" = tarea "Comprar X" del análisis del HOTO + el 0 en pantalla.
- Skimmed / Oat / Almond no salen en su inventario actual (dos de esas tres casillas eran "[object Object]" por un bug del
  importador, ya endurecido con `cellText`); sin sincronía hasta que existan en el inventario.

# Trampas

- La sesión de inventario guarda la matrícula en **`aircraft_registration`** (no `tail_number`): un fallo de `freshSync`
  del 26/09 leyó la columna equivocada y no sincronizaba nunca; ya corregido y con test.
- `updateItem` es el único punto de escritura de conteos; la sincronía es un efecto secundario que nunca tumba el conteo.

# Archivos

`isabel-api/src/hoto/freshSync.js`, `src/core/freshAsk.js`, `src/core/freshOverview.js`, `src/batch.js` (verbos), `src/mcp.js`
(`fresh_items_status`), `life-os-app/src/main.js` (`vjFreshView`), tests `freshSync.test.js`, `freshAsk.test.js`, `freshOverview.test.js`.
