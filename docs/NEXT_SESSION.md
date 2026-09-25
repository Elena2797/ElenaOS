Estado: conocimiento vigente
Última actualización: 2026-09-25 — inventario del 9H-VCF cerrado, chat de inventario sin dependencia del LLM (D70), primer Laundry Form real

# Próxima sesión

## 1. Qué se terminó en esta sesión

- **Chat de inventario que entiende de verdad (D70):** `quickIntent.js` + resolver que no adivina + alias + lote con antes→después. `isabel-api` `4e1e4e2`, 898/898, desplegado. Ver `CHANGELOG.md` 2026-09-25.
- **Inventario del 9H-VCF cerrado con ella, ítem por ítem** (lista completa en el CHANGELOG). Bebidas puestas al estándar sin contar por decisión suya.
- **Primer Laundry & Cleaning Form real** (9H-VCF, 10 filas Given, cabecera completa).
- Reglas de su lenguaje documentadas en `modules/VISTAJET_INVENTORY.md § Lenguaje`.

## 2. Qué quedó pendiente

- **Probar en producción que el arreglo funciona de verdad** con "He usado 2 Evian 0,33 l" y "Usé 1 wine sleeve y 1 rubber band" (`/health` solo devuelve `{"ok":true}`, no confirma la versión desplegada).
- **Fase 2 del lenguaje (D70): HECHO** (atrás+adelante, no queda=0, estándar, entrada, caja=10; `aa0c720`). **También hecho:** linen → Laundry Form acumulando (`3065f0a`), lo no entendido → fallo (`58ba464`), contado vs estimado (`d2147fa`). **Falta:** probar todo en producción con Telegram (tras `openclaw mcp reload`) y que la app / `readiness.js` muestren contado vs estimado.
- **Sistema de lavado que acumule** ("ensuciar +N") en vez de fijar valor; hoy solo lo llevó de cabeza en la conversación. Lo mismo para **Fresh Items** (no se lleva bien la cuenta de hierbas/fruta/leche).
- **Valores por confirmar del 9H-VCF:** Lime (dijo "habían seis", sigue 1), Orange (2, "no me acuerdo"), Coca Cola/Ginger/Tonic/Coke Light/Coke Zero puestos al estándar sin contar.
- `npm run fallos`: revisar los HOTO abiertos (Focus of the Month sin cerrar la tarea, recordatorio de feedback al subir un HOTO, horario diario) y los de PDF del 22 (posiblemente ya resueltos).
- **HOTO del 9H-VCF:** listo para exportar; faltan 5 fechas de Cabin Care que ella no sabe (quedan vacías) y marcar las Daily duties en la app. Tarea vieja "HOTO: Offload plates to Sores" ya no aplica. Hay tareas duplicadas de Cabin Care/defects de Isabel por limpiar.
- **Importador de HOTO descarta las revistas** (ver CHANGELOG 2026-09-25 punto 8) — arreglar y que Isabel diga qué revistas comprar.
- **Contado vs estimado en la APP y en la tarjeta de confianza** (el backend ya lo distingue desde `d2147fa`; los datos del 9H-VCF del 25/09 quedaron sin marcar).
- Reglas nuevas: siempre Pattern 2; inventario y Shopping del HOTO deben coincidir (pero "creerle al HOTO" fue solo para el apio, NO una regla).
- **Rediseño de la tarjeta de Aircraft Readiness (confianza para entregar):** especificación en `modules/AIRCRAFT_READINESS.md § Rediseño acordado 2026-09-25`. Sin construir. Depende de: contado-vs-estimado en el inventario, Daily duties del HOTO, estado "dejando el avión", feedbacks y envío de documentos.
- **Rediseñar la pantalla de VistaJet (petición explícita suya, 2026-09-25):** los botones **Exportar Excel / Exportar UPLIFT** están al final del todo, después del bloque "Estado del avión" (`main.js` ~3720, `invExport`), y no los encuentra el día de la entrega. Sumar: exportar HOTO, Laundry y Excel en un solo sitio visible; tarjeta de confianza rediseñada (ver `modules/AIRCRAFT_READINESS.md`); estado "dejando el avión" que activa el modo entrega; recordatorios de envío de documentos y feedbacks. Ella dijo que hay que diseñar estas pantallas, no parchearlas.
- **Entregar un avión debe cerrar todo y pasar a STAND-BY (regla suya, 2026-09-25):** hoy `updateVistajetStatus({status:'libre'})` solo cierra el HOTO y deja `libre`. Debe cerrar también la sesión de inventario (`closed`) y el Laundry Form (`delivered`) y dejar `standby` (sigue en sus días de rotación). El 9H-VCF se entregó a mano el 2026-09-25 (HOTO `delivered`, inventario `closed`, laundry `delivered`, `vj_state` standby). Además, el feedback del avión se envía al RECIBIR el siguiente, no al entregar. Y la plantilla de handover que guardó Isabel (`Handover//TAIL/CHCODE`, adjuntos "Excel + PDF HOTO") no incluye el Laundry Form y su asunto difiere del del feedback (`HANDOVER//TAIL//CH-OLE`): revisar con ella.
- **Nombre del PDF en el visor del móvil:** la app abre `/v1/laundry-cleaning/:id/export?inline=1` y el visor enseña "export"; el ticket está firmado para esa ruta exacta, así que redirigir a `.../export/<nombre>.pdf` exige ampliar `TICKET_PATH` en `core/access.js` con cuidado.
- Sin cambios respecto a antes: confirmar D69 contra un HOTO real; documentar `df1da17` (bug RLS); primera noche del turno nocturno.

## 3. Qué hacer inmediatamente después

1. `npm run fallos` en `isabel-api`.
2. Probar el chat de inventario con las dos frases de arriba en producción.
3. Diseñar la fase 2 del lenguaje con ella, empezando por atrás+adelante y linen → lavado.

## 4. Qué no debe romperse

- El análisis del HOTO (D69) es **determinista, sin modelo** — mismo principio que Aircraft Readiness. No meter a Isabel/un LLM a decidir qué tarea crear.
- Un defect/offload de D69 se resuelve **borrando la línea de origen** (`DELETE /hoto/items/:id`), no solo completando la tarea — si no, se recrea en el próximo análisis (documentado, no es bug).
- `/v1` nunca vuelve a aceptar una llave que esté en el bundle (D68); `/v1/app` va montado antes de `requireAccess`.
- Nunca `railway up` en `isabel-api`: push a `main` desde un worktree limpio de `origin/main`. En `isabel-gateway` es al revés (sin remoto, se despliega con `railway up`) — no confundir los dos repos.
- A Claude el clasificador le bloquea escribir en el Gateway y los secretos de Railway: eso lo lanza ella.
- Sin chat dentro de LIFEOS (D55). El turno de noche nunca toca VistaJet.

## 5. Qué documentos leer

`CURRENT_STATE.md` → `DECISIONS.md` D70 (y D62–D69) → `modules/VISTAJET_INVENTORY.md` (§ Lenguaje) → `modules/VISTAJET_HOTO.md` → `operations/TURNO_NOCHE.md` si toca el turno de noche.
