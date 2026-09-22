Última actualización: 2026-09-22, noche — O5 canary encendido; "ya lo hice" (D64); turno de noche (D65); fallos sinceros (D66); buscador (D67)

# Próxima sesión

## 1. Qué se terminó en esta sesión

- **O5 canary (D63) encendido en `CANARY`:** lo que ella cuenta de sí misma por Telegram se guarda como conocimiento (con sus palabras, día y canal), Isabel lo usa después y ella lo ve y lo olvida en Dominios → "Lo que Isabel sabe de ti". Deduplicación en tres capas, interruptor `LIFEOS_KNOWLEDGE_STAGE`, rollback. `isabel-api` `76f70bd`, `life-os-app` `b6376a2`.
- Probado en producción con turnos reales de Isabel en sesiones aisladas. La primera prueba falló (no consultaba lo aprendido); arreglado haciendo que lo vigente viaje dentro de las tools de estado (solo llave privada). Frases de prueba olvidadas: el estado quedó vacío.
- El Gateway ve tools nuevas con `openclaw mcp reload`, sin reiniciar.
- Guard O5 verde; ahora vigila que O5 solo se alcance por `knowledgeCanary.js`.
- D62 escrita; SECURITY #3 y #6 resueltos.
- **D64:** "ya lo hice" cierra la tarea y sus recordatorios (o solo el recordatorio); `tasks_list` trae los recordatorios pendientes. Probado con Isabel en producción.
- **D66:** Isabel no promete "no volverá a pasar": dice si falló ella o el sistema y lo apunta para Claude (`npm run fallos`). Probado en producción.
- **D65, turno de noche** (otra sesión, en paralelo): a las 04:00 Isabel trabaja sola en JETMI, Marca Personal, Marca Propia y Vida Personal (VistaJet fuera, en código). Servidor y app desplegados y verificados; el cron del Gateway, sin aplicar.

## 2. Qué quedó pendiente

- **Aplicar el turno de noche y el buscador en el Gateway** (`operations/TURNO_NOCHE.md` §2): se le dejó a ella `activar-turno-noche.ps1` (cron `turno-noche-0400`, parte de las 08:30, `openclaw mcp reload` y un `dry_run`). El clasificador deja a Claude leer el contenedor (`railway ssh … openclaw cron list --json`) pero no escribir. Comprobar si ya lo lanzó: `turno-noche-0400` en la lista de crons.
- **Primera búsqueda real del buscador (D67):** que ella le pida algo a Isabel por Telegram, o el `dry_run`; mirar fuentes y coste (`eventos` `ai:*` con `web_research`).
- **Ver el primer turno real con ella:** si lo que deja es útil o relleno, si reescribe de más, y si quiere también un turno de día.

- **Ver el canary con uso real suyo:** que Isabel guarde lo que ella diga de verdad por Telegram (qué tipos y áreas elige, si guarda de más o de menos) y que ella lo vea en la app con su móvil. Nadie ha visto aún la pantalla con su token en producción (se probó en local con datos de ejemplo).
- Coach 17:00: comprobar su primer disparo bueno (ahora `tasks_list` le lleva lo aprendido).
- `/v1` sigue aceptando la API key pública (SECURITY #2): que acepte la sesión de D62 y rotar la llave.
- Clave de Anthropic caduca el 2026-10-20. Gasto de OpenRouter fuera del control de presupuesto. memory-core de OpenClaw pide clave de OpenAI.

## 3. Qué hacer inmediatamente después

1. **Antes que nada:** `npm run fallos` en `isabel-api` (con su `.env`): lo que Isabel apuntó como fallo para arreglar con Claude (D66). Arreglar, cerrar con `--resolver` y decírselo a ella.

2. Turno de noche: con el cron aplicado, un `dry_run` (`operations/TURNO_NOCHE.md` §3) y revisar `would_save`/`would_change`/`rejected` antes de la primera noche. Tras la primera noche: la fila `isabel:turno_noche` de hoy y las `isabel:taller`, y el parte de las 08:30.

3. Leer el ledger (`select resumen, created_at from eventos where herramienta = 'lifeos:knowledge' order by created_at desc`) y revisar con ella lo que Isabel haya guardado de verdad. Si guarda cosas que no debe, ajustar la descripción de `knowledge_remember`; si hay que parar, `LIFEOS_KNOWLEDGE_STAGE=READ_ONLY` u `OFF` (`operations/O5_CANARY.md`).
4. Mirar el `state` del coach 17:00.
5. Cuando ella vuelva a decir "ya hice X" por Telegram, comprobar en `tasks`/`reminders` que se cerró en ese turno (D64). Si Isabel sigue sin llamar a `tasks_complete`, el siguiente paso es un aviso en el Gateway, no más texto en las descripciones.
6. Si el canary va bien unos días: decidir el siguiente paso de O5 (`core/KNOWLEDGE_LOOP.md`, pasos 1–4). Nada de eso está activado.

## 4. Qué no debe romperse

- O5 solo por `src/core/knowledgeCanary.js` (guard). `LIVE` no se usa: abre rutas universales que no están montadas.
- Lo aprendido solo sale con la llave privada del MCP o el token de app; nunca con la API key pública.
- Quien lea `eventos` debe excluir `herramienta = 'lifeos:knowledge'` (su `texto` es JSON interno).
- Tabla nueva en `public` → volver a ejecutar `rls_owner_only.sql` o la app no la ve (D62).
- Nunca `railway up` en `isabel-api`: push a `main` desde un worktree limpio de `origin/main`.
- No reiniciar el Gateway en :00/:15/:30/:45 ni a la hora de un cron (08:00, 08:30, 17:00, 21:30 Madrid). Para tools nuevas basta `openclaw mcp reload`.
- `openclaw` en el contenedor como `runuser -u node --`; desde Git Bash, `MSYS_NO_PATHCONV=1`.
- Sin chat dentro de LIFEOS (D55). Inicio solo con lo suyo (D59).
- El turno de noche nunca trabaja en VistaJet: `NIGHT_AREAS` en `isabel-api/src/core/night/plan.js` y en `life-os-app/src/services/nightWork.js`. `POST /v1/night/run` solo con la llave privada.

## 5. Qué documentos leer

`CURRENT_STATE.md` → `DECISIONS.md` D62–D67 → `operations/TURNO_NOCHE.md` → `operations/O5_CANARY.md` → `core/KNOWLEDGE_LOOP.md` ("Canary vivo") → `SECURITY.md` #2.
