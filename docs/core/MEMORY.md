Estado: diseñado (casi nada verificado como implementado)
Última verificación: 2026-07-10
Verificado en: grep de "memory"/"memoria"/contexto persistente en ambos repos
Fuente de verdad de datos: tablas life_context, eventos (ver DATA_MODEL.md)

# core/MEMORY.md — Qué persiste hoy como memoria de Isabel

## Lo que sí persiste (aunque no sea "memoria" en el sentido de la constitución)

- **`life_context`**: una fila con el modo actual (ON/OFF), nivel de energía y "restricción principal". Es estado, no memoria conversacional — no guarda historial de decisiones ni aprendizajes.
- **`eventos`**: audit trail de contribuciones (manual/IA) por proyecto/área. Es un log, consultable, pero no hay evidencia de que ningún canal de Isabel lo *lea* para informar respuestas futuras (solo se escribe).
- **`sessionContext.js`** (isabel-api): contexto de sesión de inventario — último ítem mencionado, última acción, mensajes recientes. Es memoria de **corto plazo, por sesión**, y solo para el flujo de Inventario. Se pierde entre sesiones.
- **`vj_inventory_chat`**, historial de chat de una sesión de inventario concreta — persistente pero acotado a esa sesión.

## Lo que NO existe (pese a estar implícito en la visión de ISABEL_CORE.md)

- No hay una tabla o mecanismo de "memoria a largo plazo" que Isabel consulte entre conversaciones distintas, sobre cualquier canal.
- El bridge local (canal activo real, ver `ISABEL_CHANNELS.md`) construye su contexto en cada llamada a partir de un `historyText` de los últimos mensajes recientes (pasados desde el cliente) — no hay persistencia de memoria del lado del agente entre sesiones de chat distintas.
- No hay evidencia de resúmenes, aprendizajes o preferencias que se acumulen automáticamente.

## Lo más cercano a "memoria de producto" hoy
Este mismo sistema de documentación (`/docs`) — es, de hecho, la respuesta operativa a la ausencia de memoria automática: la memoria persistente del proyecto se mantiene manualmente, por escritura explícita, no por un mecanismo del propio Isabel Core.

## Idea futura (no diseñada en detalle en ningún documento)
Un mecanismo real de memoria por parte de Isabel (qué se decidió, qué preferencias tiene la usuaria, qué patrones se repiten) sigue siendo una idea futura, no un diseño con especificación.
