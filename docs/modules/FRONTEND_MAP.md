Estado: conocimiento vigente
Última verificación: 2026-09-26 (noche), revisión completa de `src/main.js` (5.5 k líneas) con análisis estático
Verificado en: life-os-app/src/main.js

# modules/FRONTEND_MAP.md — cómo se hablan las pantallas de LIFEOS

Sale de la revisión que pidió Estefanía ("que todas las áreas interactúen entre sí, sin herramientas nuevas muertas").
Método: funciones definidas y nunca usadas, handlers `onclick=` sin función expuesta a `window`, vistas sin puerta,
y quién lee/escribe cada campo de `S`. Se puede repetir: los scripts eran de un solo uso (ver CHANGELOG 2026-09-26).

## Vistas (`views` en `render()`)
`home`, `areas`, `aprendido`, `area`, `global`, `project`, `avanzar`, `resultado_ia`, y las de VistaJet:
`vj_hoto`, `vj_inventario`, `vj_laundry_cleaning`, `vj_fresh` (Fresh Items), `vj_status` (Estado del avión), `vj_agenda`.
Añadir una vista = registrarla en `views`, en `VJ_SUBVIEWS` (si es de VistaJet, para refrescar el contexto) y en
`FAB_HIDDEN_VIEWS` (sin el "+" genérico).

## Datos que viajan entre áreas (y por dónde)
| Dato | Origen | Quién lo enseña |
|---|---|---|
| Agenda de vuelos (`S.agenda`, `/v1/app/agenda`) | fotos → Isabel → `agenda_save` → `vj_flights` | **Tu día** (Inicio), tarjeta y pantalla Agenda, pista del ICAO en HOTO y Laundry |
| Fresh Items (`S.fresh`, `/v1/app/fresh`) | inventario + Shopping del HOTO | pantalla Fresh Items (con enlaces a inventario y HOTO), tarjeta de VistaJet; llega al Copiloto vía "Por comprar" (el Shopping del HOTO se actualiza solo al contar) |
| Notas pre-HOTO (`S.preHotoNotes`) | `hoto_pre_*` | tarjeta "Antes del HOTO" en la pestaña Entrega |
| Preguntas de Isabel (`S.pendingQuestions`) | `/v1/interventions/pending` | **en su dominio** (`domainQuestionsCard(nombre)`), no en Inicio (D59) |
| Tareas (`S.tasks`) | Supabase | Ahora, Progreso, cada área, VistaJet |
| Recordatorios / Google Calendar | `/v1/reminders`, `/v1/app/today` | Tu día |

## Del lado de Isabel (para que la app no se contradiga con ella)
- No escribe por Telegram mientras vuela (`isInFlightNow`: 45 min antes de la salida → 15 min tras aterrizar); lo pendiente sale después.
- Pregunta la captura del horario, "¿recibiste el avión?", el Fresh Item del día y el feedback con horas sacadas de la agenda.

## Lo que la revisión encontró y arregló (26/09)
- Selector de mes de **Finanzas**: `setFinanceMonth` no estaba expuesto → error al pulsar un mes.
- Preguntas de Isabel "esperando en la app" (restos de otro avión, feedback del avión) **invisibles** desde D59 → ahora en su dominio.
- Código muerto: `toggleVjRecv`, `resetVjRecv` (checklist de recibido antiguo), `pendingQuestionsCard` (reemplazada), `_freshError`.
- "Agenda libre hoy" decía algo falso si aún no había mandado la foto.

## Abierto (no roto, decisión de producto)
- Claves de localStorage leídas y nunca escritas: `life_budgets`, `vj_bag_templates` (ver KNOWN_PROBLEMS).
- `S.pendingQuestions` solo se enseña en el dominio; Inicio sigue sin ellas (D59).
- El Copiloto de entrega (`readiness.js`, reglas congeladas) no cuenta las notas pre-HOTO ni la agenda.
- La pantalla real no se ha visto con datos suyos sin PIN + código de Telegram: se comprobó con el HTML generado y datos de ejemplo.
