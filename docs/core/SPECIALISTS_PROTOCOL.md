Estado: diseñado (el contrato está documentado y parcialmente implementado en isabel-api; no hay un Core que lo invoque)
Última verificación: 2026-07-10
Verificado en: ISABEL_INVENTORY_SPECIALIST_CONTRACT.md (raíz), isabel-api/src/routes/, isabel-api/src/mcp.js
Fuente de verdad de datos: ninguna

# core/SPECIALISTS_PROTOCOL.md — Contrato Core ↔ especialista

## El contrato documentado (Inventario, el único con especificación formal)

`ISABEL_INVENTORY_SPECIALIST_CONTRACT.md` (raíz, 766 líneas) especifica el formato de respuesta del especialista de Inventario: `status` (`resolved`\|`exception`\|`error`), `exception_type` (`ambiguous`\|`not_found`\|`no_session`), `message`, `requires_confirmation`, `proposal_id`, etc. Es el contrato que implementa `isabel-api/src/routes/message.js` — verificado real, no aspiracional, porque es lo que consume el bridge local hoy indirectamente vía MCP.

## Cómo se invoca hoy, realmente

No hay un "Core" que llame a este contrato con una interfaz de herramientas genérica. Dos vías reales:
1. **HTTP directo**: `POST /v1/message` en isabel-api, con auth por `x-api-key`. Es lo que usaría cualquier cliente HTTP, incluido en teoría un futuro Core.
2. **MCP** (`isabel-api/src/mcp.js`): expone la tool `isabel_message` vía Model Context Protocol — pensada para que un cliente MCP (como Claude Desktop) la invoque directamente, llamando internamente al mismo endpoint HTTP (`http://localhost:{port}/v1/message`).

## Lo que la visión describe pero no existe

`ARQUITECTURA_FUSION.md` (raíz) especifica una interfaz `POST /v1/tools/invoke` con 7 herramientas (`update_inventory_count`, `consume_inventory_item`, `register_missing_item`, `resolve_ambiguous_item`, `get_inventory_summary`, `export_full_inventory`, `export_uplift`) como la interfaz limpia entre un futuro Core y el especialista de Inventario. **No existe este endpoint** — no hay `routes/tools.js` en el repo.

## HOTO no tiene contrato de especialista formal
A diferencia de Inventario, HOTO no tiene un documento de contrato equivalente ni una interfaz de "herramientas". Se consume directamente como módulo del frontend (`life-os-app/src/services/hoto.js` habla con Supabase, y con `isabel-api/src/routes/hoto.js` solo para la exportación a PDF). Si en el futuro se quiere que HOTO sea invocable por un Core del mismo modo que Inventario, este contrato tendría que diseñarse desde cero.

## Ver también
- [ISABEL_CHANNELS.md](ISABEL_CHANNELS.md) — por qué ningún Core invoca esto hoy.
- [modules/VISTAJET_INVENTORY.md](../modules/VISTAJET_INVENTORY.md) — detalle de implementación del especialista.
