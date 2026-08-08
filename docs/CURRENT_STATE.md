Estado: este documento ES el estado — se reescribe en cada "Cerrar sesión de desarrollo" si algo cambió globalmente
Última verificación: 2026-08-08
Verificado en: (2ª tanda) delivery de Interventions verificado de punta a punta en producción; auditoría sistemática de correlación de entidad en VistaJet (D34), bucle de evaluación proactiva (D35), instrumentación real del consumo del agente (D36) y coherence pass (D37) — todo verificado contra producción real (curl, navegador móvil), no solo en local

# CURRENT_STATE.md — Fotografía del proyecto, ahora

Una página. Solo 5 campos. Detalle de un módulo → `modules/*.md`. Handoff de la última sesión → `NEXT_SESSION.md`.

## Estado general del proyecto
**La correlación de entidad ya no depende de que nadie se olvide.** Es el cambio de fondo de esta sesión. Las tres fugas entre aviones anteriores (D14, D15, D28) se encontraron por accidente; esta vez se recorrieron **todos** los caminos de lectura y escritura del dominio y aparecieron 14 hallazgos, varios vivos en producción — entre ellos que `/v1/confirm` resolvía la sesión de inventario **sin matrícula** (D28 arregló la propuesta y dejó la confirmación intacta), que 7 de las 9 señales de VistaJet no declaraban `subject` —así que `dropStaleSignals()` no protegía casi nada—, que ese `dropStaleSignals()` no se llamaba en ningún sitio fuera de los tests, y que la migración del checklist copiaba ticks **sin matrícula** al HOTO del avión actual, con destino el PDF oficial. La corrección es estructural: **omitir la matrícula ya no devuelve "el más reciente de cualquier avión", lanza**; el wildcard sigue existiendo pero hay que nombrarlo. Mismo principio que el índice único de D14.

**Y la pregunta de qué caduca al cambiar de avión tiene respuesta:** caduca la *presentación*, no el dato. Cerrar una sesión es irreversible y hacerlo solo sería inferir que la rotación anterior terminó. Lo que faltaba es que el sistema lo **diga** — la señal nueva `stale_open_context` destapó al instante las 2 sesiones abiertas de 9H-VCQ que llevaban desde julio siendo invisibles.

**Existe ≠ merece atención ≠ merece interrumpirme.** El evaluador proactivo (`core/proactive.js`) añade el segundo salto, que es más estricto que el de D33: `attention_mode` responde "¿qué miro primero al abrir LIFEOS?" y casi siempre tiene respuesta; interrumpir es otra pregunta y su respuesta por defecto es NO. La puerta es 100 % determinista y cada "no" trae su motivo. **No se ha creado ningún cron nuevo ni se ha tocado el de sueño.**

**Ya se sabe cuánto cuesta Isabel, con datos.** Los turnos del agente en OpenClaw son el **97,8 % del gasto** (1,288 $ de 1,317 $ en 30 días) — la hipótesis de partida, ahora medida. Para llegar ahí hubo que corregir dos cosas que habrían hecho inútil la instrumentación: el coste ignoraba la caché (un turno real "costaba" 0,00004 $ en vez de 0,087 $) y el barrido buscaba un campo `id` que no existe, reportando cero sobre 63 turnos reales sin fallar.

## Último deploy relevante
Todo desplegado y verificado en producción. `isabel-api`: `/v1/now`, `/v1/proactive/evaluate`, `/v1/usage/sweep`, `/v1/usage/summary` respondiendo; las 9 señales de VistaJet con `subject`; `stale_open_context` activa con datos reales. `life-os-app` (Vercel): HTTP 200 con la coherence pass. `isabel-gateway`: adaptador con una tercera ruta (`POST /message/send`), Telegram y cron intactos.

## Último commit importante
`isabel-api` — auditoría de correlación de entidad (D34), bucle proactivo + instrumentación (D35/D36), y el fix de `responseId` que hacía que el barrido no viera ni un turno. `life-os-app` — correlación en el frontend (D34), coherence pass (D37) y la tarjeta de preguntas pendientes (D38). `isabel-gateway` — la primitiva de entrega.

## Bloqueos actuales
**Ninguno.** El bloqueante de crédito de Anthropic **está resuelto**: verificado esta sesión — `/v1/now` responde `status: ok` y `/v1/chat` devuelve respuesta real del agente. No volver a diagnosticarlo sin comprobarlo.

Pendientes de acción de la usuaria, **no bloqueantes**: rotar `ANTHROPIC_API_KEY` (runbook en `operations/ROTAR_ANTHROPIC_KEY.md`) y abrir una sesión de inventario real para D-AFBS — sin ella no se puede cerrar la prueba de escritura de Inventario por la ruta unificada, y fabricar conteos corrompería datos. Hoy hay además **2 sesiones abiertas de 9H-VCQ** que el sistema ya declara (`stale_open_context`); cerrarlas es decisión suya, no automática.

## La cadena proactiva, ya cerrada
`domain signals → global priority → proactive gate → INTERVENTION persistente → DELIVERY → canal → respuesta → apply → reevaluación`. La decisión pertenece al Core y el transporte al runtime: Telegram no sabe nada de dominios, los dominios no saben nada de Telegram, y **la sesión conversacional no es la base de datos** — el estado vive en `interventions`, así que nada depende de que el modelo recuerde haber preguntado. Entrega exactamente una vez, con el índice único que ya existía como candado. Verificado de punta a punta en producción con una Intervention de prueba limpiable.

Y la distinción que lo hace usable: **existe ≠ merece atención ≠ merece interrumpirme**. Una pregunta real pero no urgente (los restos abiertos de 9H-VCQ) se registra, se deduplica y **se ve en Home**, sin empujar nada a Telegram.

## Siguiente objetivo
Ver `NEXT_SESSION.md`. En corto: decidir el **disparador periódico** del ciclo (la vía limpia ya está investigada — un cron de OpenClaw con payload de comando, que no gasta turno de agente — pero crear una automatización que escribe sola a Telegram no se hace sin autorización), decidir `cacheRetention` con los datos ya medidos, migrar los bloques de VistaJet/JETMI que aún quedan dentro de `globalContext.js` al contrato universal de señales, y — solo cuando la usuaria lo elija — el siguiente dominio.
