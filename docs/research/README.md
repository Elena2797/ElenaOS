Estado: meta — no aplica taxonomía implementado/diseñado
Última verificación: 2026-07-14
Verificado en: —
Fuente de verdad de datos: ninguna

# docs/research/ — Investigación externa y conocimiento consolidado

Este directorio existe para que la investigación externa de un dominio de negocio (mercado, industria, competidores, marco legal) tenga un lugar único y legible por Claude Code — en vez de quedar dispersa en PDFs, chats o documentos sueltos que un chat nuevo no puede encontrar ni citar.

No sustituye a `modules/*.md` (estado real de implementación) ni a los documentos de visión de la raíz del proyecto (`JETMI_PRD_Semilla.md`, etc.). Es una categoría distinta: **qué sabemos del mundo exterior al sistema, y con qué grado de confianza**.

## Por qué existe como carpeta separada

`modules/` mide **madurez de implementación** (`implementado | parcial | diseñado | idea futura`). La investigación externa mide **madurez de conocimiento**, un eje distinto que no debe mezclarse con el anterior — un dato puede estar "SUFICIENTE PARA DECIDIR" sin que exista una sola línea de código, y un módulo puede estar "implementado" sobre un dato que nunca se verificó externamente.

## Estructura por dominio

```
research/
  README.md          ← estás aquí (convenciones válidas para cualquier dominio)
  JETMI/
    LOG.md            mapa de cobertura: qué se investiga, qué cubre cada artefacto, nivel de madurez, preguntas abiertas, próximo bloque
    KNOWLEDGE.md       conocimiento consolidado — solo lo que superó el nivel de verificación definido en LOG.md
    HYPOTHESES.md      hipótesis, interpretaciones, contradicciones, preguntas pendientes — explícitamente NO verificado
    sources/           artefactos de investigación tal cual, convertidos a Markdown, sin editorializar
```

Otros dominios (Finanzas, Marca Personal, etc.) reutilizan esta misma estructura bajo `research/<DOMINIO>/` si algún día tienen investigación externa activa. Hoy solo JETMI la tiene.

## Escala de cobertura de investigación

```
NO INVESTIGADO → INVESTIGANDO → INVESTIGADO → VERIFICADO → SUFICIENTE PARA DECIDIR
```

Se aplica **por área temática o pregunta concreta**, nunca al documento entero ni al dominio entero — un mismo artefacto puede tener un capítulo "INVESTIGADO" y otro "NO INVESTIGADO". Vive en `LOG.md` de cada dominio, no en el header estándar de `modules/` (ese header es sobre código, no sobre conocimiento).

Definición de cada nivel:

| Nivel | Significa |
|---|---|
| NO INVESTIGADO | Se sabe que existe la pregunta, no se ha buscado nada |
| INVESTIGANDO | Hay artefactos en curso de lectura/extracción, sin conclusión |
| INVESTIGADO | Se extrajo información de al menos una fuente, sin verificación cruzada |
| VERIFICADO | La información se contrastó con una segunda fuente independiente, o con evidencia empírica directa |
| SUFICIENTE PARA DECIDIR | El nivel de certeza es suficiente para tomar una decisión de negocio registrable en `DECISIONS.md` — no implica certeza absoluta, implica que esperar más investigación ya no cambia la decisión |

## Pipeline de ingestión — nunca automático

```
FUENTE → extracción → clasificación → verificación → conocimiento consolidado
```

1. **Fuente** — el artefacto entra en `sources/` tal cual, convertido a Markdown fielmente (sin resumir, sin completar, sin corregir). Es evidencia, no verdad.
2. **Extracción** — se identifican afirmaciones concretas dentro de la fuente.
3. **Clasificación** — cada afirmación se etiqueta: hecho verificable / interpretación del autor de la fuente / hipótesis nuestra.
4. **Verificación** — se contrasta contra otra fuente o evidencia empírica antes de subir de nivel en la escala.
5. **Conocimiento consolidado** — solo entonces pasa a `KNOWLEDGE.md`, con cita explícita a la fuente en `sources/`.

**Ninguna afirmación de `sources/` se copia automáticamente a `KNOWLEDGE.md`.** El paso de fuente a conocimiento consolidado es un acto deliberado, hecho por Estefanía o explícitamente confirmado por ella — nunca una inferencia silenciosa de Claude Code al leer el artefacto.

## Cadena completa: de la fuente externa al código

El pipeline de ingestión de arriba cubre solo el tramo fuente→conocimiento. La cadena completa, de principio a fin, es:

```
FUENTE EXTERNA → RESEARCH/SOURCES → HIPÓTESIS o CONOCIMIENTO CONSOLIDADO → DECISIÓN → DEFINICIÓN DE PRODUCTO/PRD → IMPLEMENTACIÓN → ESTADO VERIFICADO EN /docs
```

| Etapa | Qué es | Dónde vive |
|---|---|---|
| Fuente externa | El documento o investigación original (informe, entrevista, artículo, investigación encargada a otra herramienta) | Fuera de `/docs` — no versionado como tal, solo su conversión |
| Research/sources | Conversión fiel a Markdown, sin editorializar — es evidencia, no verdad | `research/<DOMINIO>/sources/*.md` |
| Hipótesis o conocimiento consolidado | Lo extraído se clasifica: si no ha superado verificación, es hipótesis; si sí, es conocimiento consolidado | `research/<DOMINIO>/HYPOTHESES.md` / `KNOWLEDGE.md` |
| Decisión | Cuando el conocimiento es suficiente, se toma (o se registra) una decisión de negocio concreta | `DECISIONS.md`, con prefijo `<DOMINIO>-Dn` |
| Definición de producto/PRD | La decisión se traduce en requisitos de producto — visión, vocabulario del dominio, alcance | Documentos de visión de la raíz del proyecto (p. ej. `JETMI_PRD_Semilla.md`) |
| Implementación | El código real que construye lo definido en el PRD | Repositorios (`life-os-app/src`, `isabel-api`, etc.) |
| Estado verificado en `/docs` | Lo que de verdad existe en código, verificado empíricamente — nunca lo que "debería" existir según el PRD | `modules/<DOMINIO>.md` |

Ninguna etapa se salta hacia adelante sin pasar por la anterior: una fuente no se convierte en decisión sin pasar por conocimiento consolidado; una decisión no se convierte en código sin pasar por una definición de producto suficiente.

## Separación de responsabilidades de trabajo

- **La investigación externa produce evidencia.** No decide, no diseña, no propone arquitectura de producto — su output es `sources/`, y como mucho observaciones explícitamente marcadas como tales (ver p. ej. `investigacion-1-1-trabajo-real-broker.md` § I, "solo observaciones, no diseño").
- **El espacio de producto/estrategia** (la conversación donde se revisa la investigación, se interpreta, se clasifica en `HYPOTHESES.md`/`KNOWLEDGE.md`, y se toman o registran decisiones) no escribe código ni implementa — su output son decisiones (`DECISIONS.md`) y, cuando corresponde, ajustes a los documentos de visión de la raíz.
- **Claude Code investiga el repositorio real** (código, datos, `/docs`) e implementa — pero solo cuando existe definición de producto suficiente (una decisión registrada y, si aplica, un PRD que la recoja). Claude Code no infiere requisitos de producto directamente de `sources/` ni de `HYPOTHESES.md` — eso sería saltarse las etapas de decisión y definición de producto.

Esta separación es sobre **roles de trabajo**, no sobre herramientas concretas — hoy la investigación externa se produce con una herramienta de investigación dedicada y la implementación con Claude Code, pero esos nombres son la forma de trabajo actual, no una dependencia arquitectónica de LIFEOS. Si cambia la herramienta, la cadena de etapas de arriba se mantiene igual.

## Procedencia dentro de `sources/`

Un artefacto puede ser investigación secundaria (sintetiza o interpreta fuentes primarias, no es él mismo la fuente original). Cuando esto ocurra, el archivo convertido debe:

- Declararlo explícitamente en su propia cabecera (ver ejemplo en `JETMI/sources/`).
- Conservar cualquier cita a fuente primaria que el artefacto original mencione.
- Marcar como pendiente de reconstrucción cualquier afirmación relevante cuya fuente primaria no esté identificada — nunca asumir que "está en el manual" equivale a "está verificado".

## Relación con el resto de `/docs` y la raíz

- `modules/JETMI.md` — estado real de implementación. Enlaza aquí, no duplica.
- `JETMI_PRD_Semilla.md` (raíz) — visión y requisitos futuros. La investigación de aquí puede alimentar futuras revisiones del PRD, pero no lo edita automáticamente.
- `DECISIONS.md` — cuando el conocimiento de `KNOWLEDGE.md` alcanza "SUFICIENTE PARA DECIDIR" y Estefanía toma una decisión de negocio sobre ello, esa decisión se registra ahí, con prefijo `JETMI-Dn`, citando de dónde viene el conocimiento que la sostiene.
