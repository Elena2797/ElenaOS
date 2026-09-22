Última actualización: 2026-09-22, mañana — docs unidas a main y crons verificados

# Próxima sesión

## 1. Qué se terminó en esta sesión

- La rama `docs/incidente-saldo` (D46–D61, incidente de saldo, multi-modelo, Gmail/Calendar, hábitos, Inicio, JETMI, Libro) se unió a `main`. La documentación vigente vive otra vez solo en `main`.
- Crons verificados el 2026-09-22: sueño 08:00, coach 08:30 y cierre 21:30 entregados; ticks de recordatorios y proactivo en `ok`.

## 2. Qué quedó pendiente

- **Coach 17:00:** nunca ha tenido un disparo bueno (el del 21 lo cortó un reinicio). Verificar el `state` después de las 15:00Z del 22.
- **Clave de Anthropic caduca el 2026-10-20.** `/v1/now` e Inventario (`structured_generation`/`structured_extraction` en el Model Router de `isabel-api`) solo tienen Anthropic. Añadir OpenRouter/DeepSeek al Model Router (el adapter contractual existe en `benchmarks/`), con Haiku de repuesto mientras la clave viva.
- Gasto de OpenRouter fuera del control de presupuesto (hoy el freno es el prepago de 10 $).
- memory-core de OpenClaw pide clave de OpenAI (`[memory] sync failed`), sin investigar.
- Guard O5 en rojo en `isabel-api` desde `1e19184` (Outlook, otra sesión).
- Login real en la app: requisito para enseñar agenda, correo e Instagram sin reabrir SECURITY #13.
- Datos parados desde junio/agosto (Finanzas, métricas manuales, parte de JETMI): conectarlos a Isabel u ocultarlos.
- O5 por su canary (`LIFEOS_KNOWLEDGE_STAGE`) cuando ella lo pida.
- Limpieza Google/Supabase ("Cliente web 1", secreto `****xmwJ`, tabla `gmail_tokens`): preguntarle antes.

## 3. Qué hacer inmediatamente después

1. Pasar `/v1/now` e Inventario a DeepSeek vía OpenRouter en el Model Router, con pruebas, y desplegar por push a `main` (nunca `railway up` desde `isabel-api`).
2. Mirar el `state` del coach 17:00.

## 4. Qué no debe romperse

- Nunca `railway up` desde `isabel-api` con varias sesiones: se despliega por push a `main`; trabajar desde un worktree limpio de `origin/main`.
- No reiniciar el Gateway a la hora de un cron (08:00, 08:30, 17:00, 21:30 Madrid, ni en :00/:15/:30/:45).
- `MCP_PRIVATE_KEY` (isabel-api) = `ISABEL_MCP_KEY` (Gateway).
- La app de Google sigue "En producción".
- `openclaw` en el contenedor siempre como `runuser -u node --`; desde Git Bash, `MSYS_NO_PATHCONV=1`.
- Sin chat dentro de LIFEOS (D55). Inicio solo con lo suyo (D59).

## 5. Qué documentos leer

`CURRENT_STATE.md` → `DECISIONS.md` D46–D61 → `SECURITY.md` #12–#14 → `research/AI_RUNTIME/DECISION_MULTIMODELO_2026-08-09.md` → `isabel-gateway/README.md`.
