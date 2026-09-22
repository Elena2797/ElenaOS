Estado: implementado (servidor y app desplegados; el cron del Gateway se aplica a mano, ver §2)
Última verificación: 2026-09-22
Verificado en: isabel-api `3ea4b44` (841/842), life-os-app `7ba1c76` (63/63), isabel-gateway `aa17ecf`
Fuente de verdad de datos: `eventos` (herramienta `isabel:taller` e `isabel:turno_noche`), `tasks`, `projects.next_action`

# Turno de noche — runbook

Por qué existe y qué puede hacer Isabel sola: `DECISIONS.md` D65. Aquí solo cómo se opera.

## 1. Qué pasa cada noche

1. A las **04:00 Madrid**, el cron `turno-noche-0400` del Gateway hace un `curl` a `POST /v1/night/run` con la llave privada (`ISABEL_MCP_KEY`). Sin turno de agente y sin mensaje.
2. `isabel-api` responde 202 y trabaja en segundo plano (`src/core/night/shift.js`): para **JETMI, Marca Personal, Marca Propia y Vida Personal**, una llamada al modelo por dominio (DeepSeek por el router, con el control de gasto de siempre; `task_id = night_shift:<fecha>`).
3. Lo que el modelo devuelve se valida contra los ids de ese dominio (`src/core/night/plan.js`) y se aplica: tareas nuevas o reescritas (`tasks`, `source: 'isabel'`), próximos pasos (`projects.next_action`) y el trabajo listo para usar como filas de `eventos` con `herramienta = 'isabel:taller'` y `resultado_ubicacion = taller://<fecha>/<tipo>`.
4. Queda una fila `herramienta = 'isabel:turno_noche'`, `resultado_ubicacion = turno://<fecha>`: el resumen y **cada cambio con su antes → después**.
5. A las **08:30** el parte de la mañana llama a `night_shift_report` y se lo cuenta en 1-2 líneas. En la app, cada uno de esos dominios enseña la tarjeta "🌙 Isabel trabajó por ti" (`GET /v1/app/night`).

Una vez por noche: si ya hay fila `turno://<hoy>`, no se repite salvo `force`.

## 2. Activarlo (una vez)

El servidor y la app ya están desplegados. Falta el Gateway, desde el contenedor (`isabel-gateway`, como en D49):

```bash
# copiar ensure-coach-crons.mjs al contenedor (ver D49 para las trampas de UTF-8) y:
runuser -u node -- node /tmp/ensure-coach-crons.mjs --apply --only=turno-noche-0400
runuser -u node -- node /tmp/ensure-coach-crons.mjs --apply --replace --only=coach-manana-0830
runuser -u node -- openclaw mcp reload     # para que Isabel vea night_shift_report
runuser -u node -- openclaw cron list --json
```

`--only` evita reescribir los demás mensajes de coach de paso. No reiniciar el Gateway a :00/:15/:30/:45.

## 3. Probarlo sin escribir nada

```bash
curl -sS -X POST -H "authorization: Bearer $ISABEL_MCP_KEY" -H "content-type: application/json" \
  -d '{"dry_run":true,"wait":true}' https://isabel-api-production.up.railway.app/v1/night/run
```

Devuelve por dominio `would_save`, `would_change`, `question` y `rejected` (lo que se descartó y por qué). Cuesta las mismas llamadas al modelo que un turno real (céntimos). `"areas":["JETMI"]` limita a un dominio; VistaJet se ignora siempre.

Para lanzar uno real a mano: `{"wait":true}` (y `"force":true` si ya corrió hoy).

## 4. Pararlo

- **Apagar:** `openclaw cron` → deshabilitar o borrar `turno-noche-0400`. Nada más lo dispara.
- **Corte de gasto:** el mismo control de siempre (`AI_BUDGET_*`, kill switch). `AI_BUDGET_MAX_TASK` limita lo que cuesta UNA noche.

## 5. Deshacer lo que hizo

- La fila `isabel:turno_noche` de esa fecha lista cada cambio con su antes y su después.
- Tarea nueva que sobra → `tasks_discard` (o Quitar en la app). Tarea reescrita → `tasks_update` con el título anterior. Próximo paso → editarlo en el proyecto.
- El trabajo guardado (`isabel:taller`) no cambia nada por sí solo; si molesta, se borra la fila (decisión de ella: es borrar).

## 6. Lo que nunca hace

Enviar mensajes o correos, borrar, completar o descartar tareas, poner algo como urgente (`critical`), tocar VistaJet, Libro, Salud, Finanzas o Gym, ni gastar fuera del control de gasto.
