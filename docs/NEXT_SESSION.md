Última actualización: 2026-09-23, mañana Madrid — análisis automático del HOTO (D69) desplegado, sin probar contra un HOTO real

# Próxima sesión

## 1. Qué se terminó en esta sesión

- **Análisis automático del HOTO (D69):** `isabel-api/src/hoto/{analysis,autoTasks}.js`, enganchado en `routes/hoto.js`. Cada vez que se crea/edita/añade un item/importa el HOTO activo, revisa Cabin Care/Shopping/Defects/Offload/Monthly Focus/cabecera y apunta tareas reales en VistaJet, sin que Estefanía lo pida. 27 tests nuevos, suite completa 876/876. Desplegado (`isabel-api` `cca4433`, push directo a `main`, `/health` 200 verificado).

## 2. Qué quedó pendiente

- **Confirmar contra un HOTO real** que D69 crea tareas de verdad (solo probado con Supabase falso en memoria).
- **`npm run fallos` sigue listando 2 fallos abiertos** (`fc538e27…`, lectura de PDF/Laundry Form rota; `b36d574b…`, PDF con proveedor no reconocido) — ambos del 2026-09-22. El `CHANGELOG.md` de una sesión distinta de hoy mismo ("memory_search resuelto...") dice que la causa raíz del 401 de PDF ya se corrigió (clave de Anthropic + perfil de credenciales obsoleto). Falta confirmarlo probando de verdad y, si es cierto, dejar de listarlos como abiertos.
- **Gap de documentación detectado al cerrar esta sesión:** el commit `df1da17` de `isabel-api` ("tool temporal para abrir sesion de inventario (bug RLS)", 2026-09-23 04:47Z) llegó a `main` desde fuera de esta conversación, sin entrada en `CHANGELOG.md`/`DECISIONS.md`. Probablemente resuelve el punto 4 del fallo `fc538e27` (`vistajet_open_inventory_sessions` solo consultaba, nunca abría sesión). El propio mensaje del commit dice "temporal": falta entender qué bug de RLS resolvía y si hay que revertirlo o dejarlo fijo, y documentarlo donde corresponda (`modules/VISTAJET_INVENTORY.md` probablemente).
- **Primera noche real del turno nocturno** (04:00 del 23) sin confirmar cómo salió — revisar con ella si lo que dejó fue útil o relleno.

## 3. Qué hacer inmediatamente después

1. `npm run fallos` en `isabel-api` — revisar si los dos abiertos siguen vigentes.
2. Editar o importar el HOTO activo desde la app y confirmar que aparecen tareas nuevas en VistaJet (D69) — si no aparecen, revisar logs de Railway (`[hoto] analysis ...`).
3. Preguntar por `df1da17`: qué bug de RLS resolvía, si es temporal de verdad, documentarlo.
4. Revisar con ella la primera noche real del turno nocturno.

## 4. Qué no debe romperse

- El análisis del HOTO (D69) es **determinista, sin modelo** — mismo principio que Aircraft Readiness. No meter a Isabel/un LLM a decidir qué tarea crear.
- Un defect/offload de D69 se resuelve **borrando la línea de origen** (`DELETE /hoto/items/:id`), no solo completando la tarea — si no, se recrea en el próximo análisis (documentado, no es bug).
- `/v1` nunca vuelve a aceptar una llave que esté en el bundle (D68); `/v1/app` va montado antes de `requireAccess`.
- Nunca `railway up` en `isabel-api`: push a `main` desde un worktree limpio de `origin/main`. En `isabel-gateway` es al revés (sin remoto, se despliega con `railway up`) — no confundir los dos repos.
- A Claude el clasificador le bloquea escribir en el Gateway y los secretos de Railway: eso lo lanza ella.
- Sin chat dentro de LIFEOS (D55). El turno de noche nunca toca VistaJet.

## 5. Qué documentos leer

`CURRENT_STATE.md` → `DECISIONS.md` D69 (y D62–D68) → `modules/VISTAJET_HOTO.md` → `operations/TURNO_NOCHE.md` si toca el turno de noche.
