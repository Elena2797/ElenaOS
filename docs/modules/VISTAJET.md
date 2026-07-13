Estado: implementado (mapa general — detalle en cada sub-módulo)
Última verificación: 2026-07-13
Verificado en: life-os-app/src/main.js (router de vistas, vjView) — nota: fila de Laundry & Cleaning Form refleja el estado de la rama feature/vj-landing-cleaning, no de main
Fuente de verdad de datos: DATA_MODEL.md § vj_state, vj_tasks

# modules/VISTAJET.md — Mapa del dominio VistaJet

VistaJet es, con diferencia, el dominio más maduro de LIFEOS: es el único con módulos de dominio propio en vez de usar solo el sistema genérico de tareas/áreas.

## Sub-módulos

| Documento | Qué cubre | Estado |
|---|---|---|
| [VISTAJET_INVENTORY.md](VISTAJET_INVENTORY.md) | Sesiones de inventario del avión, parser de chat, export Excel/UPLIFT | implementado |
| [VISTAJET_HOTO.md](VISTAJET_HOTO.md) | Handover/Takeover vivo, export PDF oficial | implementado, con gaps documentados |
| [VISTAJET_LAUNDRY_CLEANING.md](VISTAJET_LAUNDRY_CLEANING.md) | Laundry & Cleaning Form (lavandería, dishwashing, bed linen, dry cleaning, cristalería), export PDF oficial | implementado y verificado en worktrees aislados — sin merge a main, no desplegado |
| [VISTAJET_FRESH.md](VISTAJET_FRESH.md) | Plan de provisiones frescas | implementado mínimo |
| [AIRCRAFT_READINESS.md](AIRCRAFT_READINESS.md) | Evaluación de "¿puedo entregar el avión ya?" | implementado |

## Estado general y tareas (fuera de los sub-módulos)
`vj_state` (status libre/rotación/standby, horas, pasaporte, maleta) y `vj_tasks` (tareas simples propias de VJ) — ver [DATA_MODEL.md](../DATA_MODEL.md). Renderizado por `vjStatusView()` en `main.js`.

## Por qué VistaJet tiene módulos propios y el resto de áreas no
Es el dominio con reglas de negocio reales, documentos oficiales que replicar exactamente, y consecuencias operativas concretas (entregar un avión mal preparado). El resto de áreas (JETMI, Salud, etc.) hoy no tienen ese nivel de especificidad — usan el sistema genérico de `tasks`/`metrics` porque es suficiente para lo que necesitan hoy.
