Última actualización: 2026-09-22, mediodía — O5 canary desplegado en OFF; login real documentado

# Próxima sesión

## 1. Qué se terminó en esta sesión

- **O5 canary (D63):** Isabel puede guardar lo que ella cuenta de sí misma por Telegram (`knowledge_remember`), usarlo (`knowledge_recall`) y olvidarlo (`knowledge_forget`); la app lo enseña en Dominios → "Lo que Isabel sabe de ti". Deduplicación, procedencia, interruptor `LIFEOS_KNOWLEDGE_STAGE` y rollback. `isabel-api` `47c35a2`, `life-os-app` `b6376a2`. Desplegado en `OFF`.
- El Gateway ve las tools nuevas sin reiniciarse (`openclaw mcp reload`).
- Guard O5: verde en `origin/main`; ahora vigila que O5 solo se alcance por `knowledgeCanary.js`.
- D62 escrita; SECURITY #3 y #6 resueltos.

## 2. Qué quedó pendiente

- **Encender el canary (lo hace ella):** (1) `isabel-api/migrations/knowledge_canary.sql` en el SQL Editor; (2) `LIFEOS_KNOWLEDGE_STAGE=CANARY` en el servicio isabel-api. Después, la prueba de extremo a extremo.
- Mensajes de coach con `knowledge_recall` (`isabel-gateway` `ffacbcf`, sin aplicar): `ensure-coach-crons.mjs` no va en la imagen; hay que ejecutarlo en el contenedor con `--apply --replace`.
- Coach 17:00: comprobar su primer disparo bueno.
- `/v1` sigue aceptando la API key pública (SECURITY #2): que acepte la sesión de D62 y rotar la llave.
- Clave de Anthropic caduca el 2026-10-20. Gasto de OpenRouter fuera del control de presupuesto. memory-core de OpenClaw pide clave de OpenAI.

## 3. Qué hacer inmediatamente después

1. Si ella ya aplicó el SQL y puso `CANARY`: prueba con dos turnos aislados (`openclaw agent --agent main --session-key agent:main:<clave>` sin `--deliver`): una frase suya → `knowledge_remember`; en una sesión nueva, una pregunta que lo necesite → `knowledge_recall`. Comprobar la fila en `eventos` y la pantalla de la app. Olvidar lo que fuera solo de prueba.
2. Mirar el `state` del coach 17:00.

## 4. Qué no debe romperse

- O5 solo por `src/core/knowledgeCanary.js` (guard). `LIVE` no se usa: abre rutas universales que no están montadas.
- Quien lea `eventos` debe excluir `herramienta = 'lifeos:knowledge'` (su `texto` es JSON interno).
- Tabla nueva en `public` → volver a ejecutar `rls_owner_only.sql` o la app no la ve (D62).
- Nunca `railway up` en `isabel-api`: push a `main` desde un worktree limpio de `origin/main`.
- No reiniciar el Gateway en :00/:15/:30/:45 ni a la hora de un cron (08:00, 08:30, 17:00, 21:30 Madrid). Para tools nuevas basta `openclaw mcp reload`.
- `openclaw` en el contenedor como `runuser -u node --`; desde Git Bash, `MSYS_NO_PATHCONV=1`.
- Sin chat dentro de LIFEOS (D55). Inicio solo con lo suyo (D59).

## 5. Qué documentos leer

`CURRENT_STATE.md` → `DECISIONS.md` D62–D63 → `operations/O5_CANARY.md` → `core/KNOWLEDGE_LOOP.md` ("Canary vivo") → `SECURITY.md` #2.
