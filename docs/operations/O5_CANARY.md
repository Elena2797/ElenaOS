Estado: implementado
Última verificación: 2026-09-22
Verificado en: isabel-api `789df11` + `47c35a2` + `76f70bd`, life-os-app `b6376a2`; prueba en producción del 2026-09-22 (D63). Encendido en `CANARY` desde el 2026-09-22 12:57 Madrid
Fuente de verdad de datos: `eventos` con `herramienta = 'lifeos:knowledge'` (ver DATA_MODEL.md)

# O5 canary — encender, apagar y volver atrás

Qué es: lo que Estefanía le cuenta a Isabel por Telegram **sobre sí misma** (una preferencia, un objetivo, un compromiso con fecha, un límite, un hecho, un estado) pasa a ser conocimiento estructurado de LIFEOS, Isabel lo usa después y ella lo ve en la app, en Dominios → "Lo que Isabel sabe de ti". Por qué y con qué límites: `DECISIONS.md` D63. Diseño completo de O5: `core/KNOWLEDGE_LOOP.md`.

## El interruptor: `LIFEOS_KNOWLEDGE_STAGE` (servicio isabel-api en Railway)

| Valor | Qué pasa |
|---|---|
| `OFF` o sin variable | Apagado total. Las tools `knowledge_*` responden `kill_switch_off`; nada se lee ni se escribe. La app dice "Aprendizaje apagado". |
| `READ_ONLY` | Isabel usa lo que ya sabe, pero no aprende nada nuevo ni olvida. La app lo enseña "en pausa". |
| `CANARY` | Aprende: `knowledge_remember` escribe, `knowledge_forget` retira. |
| `LIVE` | **No usar todavía.** Abre además las rutas universales de O5, que no están montadas. |

Cualquier otro valor cuenta como `OFF` (falla cerrado).

`LIFEOS_KNOWLEDGE_DAILY_CAP` (opcional, por defecto 25): máximo de cosas nuevas aprendidas al día (fecha de Madrid). Al llegar, `knowledge_remember` responde `daily_cap_reached`.

Cambiar la variable redespliega isabel-api (1–2 min). No hace falta tocar el Gateway.

```powershell
railway variables --service isabel-api --set LIFEOS_KNOWLEDGE_STAGE=OFF
```

## Volver atrás, de menos a más

1. **Una cosa concreta:** decirle a Isabel "olvida que…" (tool `knowledge_forget`) o pulsar "Olvidar" en la app. Añade un evento `KNOWLEDGE_RETRACTED`; la historia se conserva.
2. **Dejar de aprender, seguir usando:** `LIFEOS_KNOWLEDGE_STAGE=READ_ONLY`.
3. **Apagar del todo:** `LIFEOS_KNOWLEDGE_STAGE=OFF`.
4. **Borrar todo lo aprendido:** `isabel-api/migrations/knowledge_canary_rollback.sql` en el SQL Editor de Supabase. Copia antes las filas a `eventos_knowledge_backup` (con RLS, sin políticas) y luego borra solo las filas `lifeos:knowledge`.
5. **Quitar el código:** revertir `76f70bd`, `47c35a2` y `789df11` en isabel-api y `b6376a2` en life-os-app, y push a `main`; después `openclaw mcp reload` para que el Gateway deje de ver las tools.

## Requisito de base de datos

`isabel-api/migrations/knowledge_canary.sql` (idempotente): columna `eventos.ledger_event_id` y dos índices únicos parciales (por `ledger_event_id` y por clave idempotente). Sin la columna, cualquier escritura falla (la inserción la manda). Con el stage en `OFF` no hace falta.

## Cómo usa Isabel lo aprendido

Con `knowledge_recall` y, sin depender de que se acuerde, dentro de las respuestas de `vistajet_get_status`, `gym_get_status`, `habits_status`, `tasks_list` y `calendar_list_events` (campo `lo_que_sabes_de_ella`), solo cuando el MCP se abre con la llave privada. En `OFF` o si falla la lectura, esas tools responden igual que antes.

## Cómo comprobar que funciona

- Tools (llave privada del MCP): `knowledge_recall` → `{"ok":true,"stage":"CANARY",...}`. Con la llave pública, las `knowledge_*` no existen.
- Base: `select resumen, created_at from eventos where herramienta = 'lifeos:knowledge' order by created_at desc;`
- App: Dominios → "Lo que Isabel sabe de ti".
- Turno real sin tocar su Telegram: `MSYS_NO_PATHCONV=1 railway ssh -- runuser -u node -- openclaw agent --agent main --session-key agent:main:<clave-nueva> --json --message \'frase\ con\ espacios\'` (desde Git Bash, en `isabel-gateway`; sin `--deliver` no se envía nada). Las sesiones `agent:main:o5-proof-*` y `o5-canary-test0` son de la prueba del 2026-09-22.

## Trampas

- Tools nuevas del MCP: el Gateway no las ve hasta `railway ssh -- runuser -u node -- openclaw mcp reload` (sin reiniciar). Cambiar solo lo que devuelve una tool no necesita nada.
- El ledger vive en `eventos`: la app filtra `herramienta = 'lifeos:knowledge'` de su feed (`services/db.js`). Quien lea `eventos` en otro sitio debe hacer lo mismo; su `texto` es un JSON interno.
- Un mismo mensaje procesado dos veces no escribe dos (clave idempotente + índice único). La misma frase dicha otro día actualiza el mismo elemento (identidad = tipo + dominio + frase normalizada). Una frase distinta para lo mismo crea otro elemento: Isabel debe olvidar la vieja antes (lo dice la descripción de la tool).
