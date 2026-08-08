Última actualización: 2026-08-08 — handoff posterior al saneamiento y Model Router

# Próxima sesión

## Primero: cerrar esta tanda

1. Con aprobación explícita de la usuaria, aprobar el scope `operator.admin` del device CLI del Gateway rollback y ejecutar únicamente `openclaw cron disable 99fd7a3b-b571-4a4f-91e4-142688ba4a5f`. Verificar después: cron antiguo disabled; Gateway nuevo conserva sus dos jobs; exactamente un `sleep-check-0800-madrid` activo en toda la infraestructura. No eliminar el Gateway antiguo.
2. Repetir QA visual de Home, Dominios, Gym e Isabel cuando el controlador de navegador funcione, o validarlo manualmente en el dispositivo. Limpiar service worker si se sirve un bundle anterior.
3. Tras el próximo horario real de las 08:00, confirmar que el sleep cron nuevo deja atrás el error histórico de saldo sin forzarlo manualmente ni enviar una notificación de prueba.

## Después: fase de investigación de proveedores

No conectar nada todavía. Evaluar, con documentación y precios vigentes:

- Anthropic;
- OpenAI;
- Google Gemini;
- Moonshot/Kimi;
- DeepSeek;
- Alibaba Qwen;
- Mistral;
- xAI;
- OpenRouter como agregador, no como centro obligatorio;
- cualquier alternativa seria adicional.

Para cada candidato: modelos concretos, precio input/output/cache, tool calling, structured output, contexto, rate limits, privacidad, residencia/disponibilidad europea, estabilidad, términos y compatibilidad con OpenClaw.

## Cómo ejecutar el benchmark

Usar `isabel-api/benchmarks/model-router/`. Primero fijar modelos y presupuesto máximo; después crear runners explícitos y ejecutar el mismo corpus A–O. Guardar respuestas reales y comparar:

- calidad y español;
- schema/tool use;
- no alucinación;
- contexto largo;
- latencia p50/p95;
- errores/rate limits/timeouts;
- coste real o estimación marcada;
- comportamiento de fallback.

No publicar rankings sin ejecutar. No usar datos personales ni secretos en fixtures.

## Prioridad económica

El 93,9% del coste medido de 30 días es conversación OpenClaw y el contexto mediano es 25.833 tokens. La investigación debe empezar por un reemplazo/fallback conversacional barato y por entender/reducir contexto; las llamadas directas Haiku son solo el 6,1%.

No cambiar aún Sonnet, Haiku, `cacheRetention` ni límites del proactive loop. Primero benchmark y decisión de la usuaria.

## Invariantes

- Una sola Isabel; proveedores no son agentes ni dominios.
- Specialists piden capabilities, nunca nombres de modelos.
- Frontend no decide modelo.
- `runWithoutAI()` bloquea todo provider dentro del tick.
- Sin provider o con fallo total: error explícito, nunca contenido inventado.
- Coste reportado > estimación explícita > null; nunca inventar.
- OpenClaw y el router directo son dos planos coordinados, no routers anidados.
- `faithful-light` no se reconecta ni despliega sin una decisión explícita.
- Gateway antiguo se conserva como rollback; no borrarlo.
- No reactivar `lifeos-agent`.
