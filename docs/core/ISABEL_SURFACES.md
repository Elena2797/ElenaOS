Estado: parcial — el principio ya se cumple (una sola Isabel en LIFEOS); el contrato de contexto estructurado está diseñado, no implementado
Última verificación: 2026-08-07
Verificado en: auditoría de todas las llamadas a `openChat()` y del chat de Inventario en `life-os-app/src/main.js`; `DECISIONS.md` D18/D23/D24
Fuente de verdad de datos: ninguna

# core/ISABEL_SURFACES.md — Cómo se abre Isabel desde LIFEOS, con contexto

Documento hermano de [ISABEL_CHANNELS.md](ISABEL_CHANNELS.md). Aquel responde *"¿cuántos cerebros de Isabel existen y cuál está vivo?"*; este responde *"¿desde qué puntos de LIFEOS se la invoca, y qué sabe ella de dónde viene la usuaria?"*.

## El principio

Un chat contextual **no es otra Isabel**. Es la misma Isabel abierta con información sobre desde dónde se la llama.

Abrir Isabel desde Inventario no debe crear un agente de inventario: debe darle a la Isabel de siempre el contexto de que la usuaria está mirando el inventario del avión actual, para que no tenga que preguntarlo. El mismo lenguaje natural tiene que funcionar por Telegram, donde ese contexto no existe y por tanto Isabel sí puede necesitar preguntar.

## Estado real (auditado 2026-08-07)

**Lo que ya está bien:** los 6 puntos de entrada al chat dentro de LIFEOS llaman todos a la **misma** función `openChat()` — la pestaña Isabel del nav, el botón de Home, y los botones "Hablar con Isabel"/"Planificar con Isabel" dentro de VistaJet, JETMI y Fresh Items. No son chats distintos, son la misma superficie invocada desde sitios distintos, que es exactamente el diseño correcto. `openChat()` ya pasa un contexto — pero solo el **nombre del área como texto** (`"VistaJet"`, `"Inicio"`), no el estado real de la pantalla.

**Lo que no está bien:** el chat de **Inventario** (`invSendMessage`/`invConfirm`, UI propia dentro del módulo) es una implementación conversacional completamente independiente: su propio historial (`vj_inventory_chat` en Supabase), su propio backend (`/v1/message`, `/v1/confirm` en `isabel-api`) y su propio modelo (Haiku vía `intentProvider.js`). Funciona bien y hace escrituras reales sobre la sesión de inventario — **no se retira** hasta que la ruta unificada demuestre que puede hacer las mismas actualizaciones correctamente (instrucción explícita de la usuaria).

**Lo que bloquea el resto:** `openChat()` habla con el bridge local, no con la Isabel real de Telegram (ver `ISABEL_CHANNELS.md` § 2 y `DECISIONS.md` D18/D23). Enriquecer el contexto de una superficie que apunta a un cerebro congelado sería añadir features al camino legacy — justo lo que D18 prohíbe.

## El contrato de contexto (diseñado, pendiente de D23)

Cuando la ruta unificada exista (`isabel-api` como proxy hacia el agente `main` del Gateway), cada superficie de LIFEOS debe abrir Isabel adjuntando un objeto de contexto estructurado, no una cadena de texto:

```
{ domain: "vistajet", surface: "inventory",
  aircraft: "<vj_state.aircraft actual>", inventory_session: "<id de la sesión abierta>" }

{ domain: "vistajet", surface: "hoto",
  aircraft: "<vj_state.aircraft actual>", hoto_id: "<id del HOTO activo>" }
```

Reglas que ese contexto debe respetar:

1. **El contexto es una pista, nunca una autoridad.** Isabel sigue leyendo el estado real con sus tools MCP. Si el contexto dice `aircraft: "D-AFBS"` pero `vistajet_get_status` devuelve otro, gana la tool — el contexto puede haberse quedado obsoleto en el navegador mientras la pantalla estaba abierta.
2. **Se aplica `PRINCIPLES.md` #11 al construirlo.** `aircraft` y `hoto_id` son datos aircraft-scoped: se toman del estado actual verificado, nunca de una caché o de un valor calculado antes de que el contexto cambiara.
3. **Nada de lo que el contexto aporta puede ser imprescindible.** El mismo mensaje ("¿cuánta agua queda?") debe funcionar por Telegram, donde no hay contexto de pantalla — allí Isabel pregunta si hay ambigüedad. La superficie ahorra preguntas; no habilita capacidades exclusivas.
4. **Una sola identidad.** Ninguna superficie define su propio system prompt, su propio historial paralelo, ni su propio modelo. Si una superficie necesita algo que Isabel no sabe hacer, eso es un specialist nuevo en `isabel-api/src/core/specialists/` (ver `DOMAIN_SPECIALISTS.md`), no un chat nuevo.

## Ver también
- [ISABEL_CHANNELS.md](ISABEL_CHANNELS.md) — qué cerebros existen y cuál está vivo.
- [DOMAIN_SPECIALISTS.md](DOMAIN_SPECIALISTS.md) — cómo se añade capacidad de dominio (la vía correcta, en vez de un chat nuevo).
- `DECISIONS.md` D18 (una sola Isabel), D23 (vía técnica de unificación), D24 (contrato de las 4 pantallas).
