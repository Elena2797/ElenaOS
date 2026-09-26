Estado: conocimiento vigente
Última actualización: 2026-09-26 (tarde: pre-HOTO, entrega limpia tareas) — cierre de la sesión de prioridad de Inicio (trabajo del 23/09, D71). Conserva los pendientes vigentes de la sesión larga del 25/09 (chat de inventario D70, entrega del 9H-VCF, feedbacks, Outlook), cuyo detalle está en `CHANGELOG.md`.

# Próxima sesión

## 1. Qué se terminó en esta sesión

- **Pre-HOTO** (`vj_pre_hoto_notes`, tools `hoto_pre_*`, contraste al importar), **entregar avión descarta las tareas del HOTO**, y reglas de Outlook/Calendar en las tools. `isabel-api` `7b0ede7`, 1049/1049; migración v6 aplicada. Detalle en `CHANGELOG.md` 2026-09-26.
- **Inicio respeta la prioridad real (D71):** listas ordenadas con `sortByPriority()`, desempate de `workQueue()` por prioridad real, "Ahora" con hasta 3 tareas (una por dominio, "+N más de <familia>") y tarjeta "Urgente" con etiquetas concretas. `life-os-app` `80c0189`, `144c8d8`, `6f39085`, desplegado y verificado en el bundle de Vercel.
- **D69 enmendado:** Cabin Care sin fecha → `high`. `isabel-api` `4a17738`, 876/876.
- Detalle y causas en `CHANGELOG.md` (2026-09-23, mediodía) y `DECISIONS.md` D71.

## 2. Qué quedó pendiente

**De esta sesión (D71 / `KNOWN_PROBLEMS.md`):**
- **Guard O5 del frontend en rojo** (hash de `main.js` vs checkpoint): decidir con ella re-aprobar o retirar; no actualizar a ciegas.
- **"Y N pendientes más hoy"** cuenta también las tareas sin fecha (18 en su captura): decidir si lo sin fecha entra en "hoy".
- **La tarjeta "Urgente" muestra un solo dominio** (el de `/v1/now`) aunque VistaJet y Vida Personal estén ambos `urgent`. Ella lo planteó; se resolvió solo para "Ahora".
- **Tareas `🔴 HOTO:` hechas a mano por Isabel** (`critical`, título distinto del de D69): D69 no las deduplica y puede duplicarlas cuando corra contra un HOTO real. Limpiarlas antes (ya había duplicados de Cabin Care/defects).
- Comprobar en su móvil que "Ahora" y "Urgente" se ven como se probó con datos reales (no se abrió la app real: pide su token).

**Heredado del 25/09 (sigue vigente):**
- Probar en producción el chat de inventario con "He usado 2 Evian 0,33 l" y "Usé 1 wine sleeve y 1 rubber band" (`/health` no confirma la versión); probar por Telegram tras `openclaw mcp reload` y que la app / `readiness.js` muestren contado vs estimado.
- **Sistema de lavado que acumule** ("ensuciar +N") y lo mismo para **Fresh Items**.
- **Fresh Items (nombre suyo; antes "frescos"):** construido el 26/09 noche (CHANGELOG). Falta verlo funcionando de verdad con un inventario abierto y confirmar que Isabel ve `agenda_*` tras `openclaw mcp reload`.
- Valores por confirmar del 9H-VCF: Lime (dijo "habían seis", sigue 1), Orange (2), Coca Cola/Ginger/Tonic/Coke Light/Coke Zero puestos al estándar sin contar.
- `npm run fallos`: HOTO abiertos (Focus of the Month sin cerrar la tarea, recordatorio de feedback al subir un HOTO, horario diario) y los 2 de PDF del 22/09 (config del Gateway; posiblemente resueltos, falta probar enviando un PDF).
- **HOTO del 9H-VCF:** listo para exportar; faltan 5 fechas de Cabin Care que ella no sabe y marcar las Daily duties. "HOTO: Offload plates to Sores" ya no aplica.
- **Revistas:** el import ya las interpreta (`d698f28`); falta que Isabel diga qué comprar y las revise al recibir el avión.
- **Rediseño de la pantalla de VistaJet (petición explícita suya):** Exportar Excel/UPLIFT están al final del todo (`main.js`, `invExport`); reunir exportar HOTO/Laundry/Excel en un sitio visible, tarjeta de confianza rediseñada (`modules/AIRCRAFT_READINESS.md § Rediseño acordado 2026-09-25`), estado "dejando el avión", recordatorios de documentos y feedbacks. Hay que diseñarlo, no parchearlo.
- **Entregar un avión** ya cierra todo y deja STAND-BY con `vistajet_deliver_aircraft` (y descarta sus tareas de HOTO); `updateVistajetStatus({status:'libre'})` sigue solo cerrando el HOTO. El feedback del avión se envía al RECIBIR el siguiente. Revisar con ella la plantilla de handover (no incluye el Laundry Form y su asunto difiere del del feedback).
- **Nombre del PDF en el visor del móvil** ("export"): exige ampliar `TICKET_PATH` en `core/access.js` con cuidado.
- **Feedbacks (`eee62a6`):** confirmar el "último aviso" del vuelo y, al recibir avión nuevo, el del avión; falta integrar el horario (CrewScheduler) y la pregunta "¿recibiste el avión hoy?".
- **Correos:** vigilar los Telegram de Outlook (`09253d4`) y ajustar `outlookTriage.js`. Los resúmenes de Gmail del coach viven en `isabel-gateway/ensure-coach-crons.mjs` (a Claude le bloquea escribir en el Gateway; lo lanza ella).
- Sin cambios: confirmar D69 contra un HOTO real; documentar `df1da17` (bug RLS); primera noche del turno nocturno; confirmar que Isabel ve `vistajet_deliver_aircraft` tras `openclaw mcp reload`.
- **Pre-HOTO (26/09 tarde, desplegado):** probado ida y vuelta con datos reales; contraste por mejor coincidencia; entregar avión descarta las notas (`pre_hoto_notes_discarded`); tarjeta "Antes del HOTO" en Entrega del HOTO (`/v1/app/pre-hoto`, sin tocar RLS). **Falta:** verla en su móvil con notas reales (hay 4 de 9H-VCC, todas `other`: fridge bag/fresh items/tablecloths → iran a `review`; su sitio real es Fresh Items), y confirmar que Isabel ve `hoto_pre_*` tras `openclaw mcp reload` y cumple las reglas Outlook/Calendar. El guard O5 del frontend sigue rojo desde antes (no lo toqué).

## 3. Qué hacer inmediatamente después

1. `npm run fallos` en `isabel-api`.
2. Construir los FRESCOS (diseño aprobado) o, si ella prefiere, decidir lo de "hoy" y el guard O5 primero (son cortos).
3. Probar en producción el chat de inventario con las dos frases.

## 4. Qué no debe romperse

- El análisis del HOTO (D69) es **determinista, sin modelo**. Un defect/offload de D69 se resuelve **borrando la línea de origen** (`DELETE /hoto/items/:id`), no solo completando la tarea.
- **La prioridad real de la tarea manda** en Inicio (D71): ni una tarea `medium` por delante de una `critical`, ni una sola área ocupando las 3 plazas de "Ahora", ni señales débiles en "Urgente".
- `/v1` nunca vuelve a aceptar una llave que esté en el bundle (D68); `/v1/app` va montado antes de `requireAccess`.
- Nunca `railway up` en `isabel-api`: push a `main` desde un worktree limpio de `origin/main`. `isabel-gateway` es al revés (sin remoto, `railway up`).
- A Claude el clasificador le bloquea escribir en el Gateway y los secretos de Railway: eso lo lanza ella (y a veces frena un `git push`: si ella lo confirma en el chat, se reintenta).
- Sin chat dentro de LIFEOS (D55). El turno de noche nunca toca VistaJet. El chat de inventario no adivina (D70).

## 5. Qué documentos leer

`CURRENT_STATE.md` → `DECISIONS.md` D71 (y D70, D69) → `modules/VISTAJET_INVENTORY.md` (§ Lenguaje) → `modules/VISTAJET_HOTO.md` → `KNOWN_PROBLEMS.md` (§ Inicio y prioridad).

## 6. Añadido el 26/09 noche (Fresh Items + Agenda)

- **Probar de verdad:** ella manda las 2 fotos del horario a Isabel → `agenda_save`; abrir VistaJet → Agenda de vuelos y contrastar horas locales con la lista (LT). Contar un Fresh Item por chat y ver que el Shopping del HOTO cambia. Ver llegar la pregunta diaria (rotación + inventario abierto).
- **No hay agenda del día en Inicio** (a propósito, `feedback_inicio_lifeos`): pendiente decidir con ella si "hoy" debe mostrar sus vuelos.
- Pendiente de Fresh Items: "Por comprar" se apoya en la tarea "Comprar X" del análisis del HOTO (no hay lista propia); Soya/Skimmed/Oat/Almond sin sincronía (no existen en su inventario); Evian/Volvic aparte.
- Conteos de tablecloths/napkins/DR kits: solo texto libre en pre-HOTO (siempre `review`).
- Guard O5 del frontend (`main.js`) sigue rojo desde antes; `main.js` cambió de hash otra vez con la Agenda.

## 7. Repaso del 26/09 noche (qué queda tras cerrar huecos)

- **Cerrado:** pantalla Fresh Items, Inicio (más hoy / Urgente multi-dominio), guard O5, "Documentos de entrega" (ya existía), avisos de feedback con agenda, "¿recibiste el avión?", revistas a comprar. Ver CHANGELOG 2026-09-26 (repaso).
- **Sigue abierto:** ver en el móvil de ella las pantallas Agenda y Fresh Items con datos reales (yo no pude: pide su PIN); modo "dejando el avión" (pregunta dónde lo deja + ICAO); Isabel debe cumplir las reglas nuevas tras `openclaw mcp reload` (agenda_*, hoto_pre_*, magazines); tareas `🔴 HOTO:` hechas a mano y D69; primera noche del turno nocturno.
- **Ojo Agenda:** si una foto trae horas UPDATED, Isabel debe pasar `replace_days` solo con el día entero a la vista; con la lista (cortada) nunca.
