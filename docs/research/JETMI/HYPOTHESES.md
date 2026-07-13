Estado: conocimiento vigente — vivo, se añade y se resuelve (nunca se borra una hipótesis resuelta, se marca como tal)
Última verificación: 2026-07-14
Verificado en: ingestión de Manual Cap. 1, Mapa Maestro y Investigación 1.1
Fuente de verdad de datos: ninguna

# research/JETMI/HYPOTHESES.md — Hipótesis, interpretaciones y preguntas abiertas

Todo lo que no ha superado verificación vive aquí, no en `KNOWLEDGE.md`. Cuando una hipótesis se verifica, se mueve a `KNOWLEDGE.md` con su cita de origen y se marca aquí como **Resuelta → ver KNOWLEDGE.md**, sin borrar el rastro. Entradas breves por diseño — no se copian documentos enteros; el detalle completo vive en `sources/`.

## Contradicciones detectadas

### C1 — Posicionamiento de JETMI: "plataforma de descubrimiento" vs. "broker"
**Detectada:** 2026-07-14, durante la creación de esta infraestructura documental.
**Descripción:** `jetmi.md` (raíz del proyecto, junio 2026) describía JETMI como "plataforma de descubrimiento de oportunidades... no broker ni operador"; `JETMI_PRD_Semilla.md` (v0.4) modela un negocio de brokeraje.
**Estado:** Resuelta → ver `DECISIONS.md` JETMI-D1 (2026-07-14). `jetmi.md` marcado superseded en su cabecera.
**Nota pendiente:** `JETMI_PRD_Semilla.md` (línea 22) sigue usando la frase "empresa de descubrimiento, comercialización y gestión de oportunidades" — antecede a JETMI-D1, no se ha tocado el PRD. Sigue siendo una nota de lenguaje pendiente, no una acción.

### C2 — Tensión entre el Mapa Maestro y la Investigación 1.1 sobre el dominio de fraude (2.5)
**Detectada:** en la propia Investigación 1.1, § J punto 2 (fuente secundaria que ya señala esta tensión, no detectada por Claude Code de forma independiente).
**Descripción:** el Mapa Maestro (dominio 2.5) trata la verificación de contrapartes como, sobre todo, una cuestión de **diseño de proceso** (checklist de verificación). La Investigación 1.1 (sección G, casos de fraude documentados) sugiere que buena parte de la detección real depende de **conocimiento tácito y señales de alerta experienciales** (precios anormalmente bajos, presión de urgencia, cambios de cuenta bancaria), no reducible a un checklist cerrado.
**Estado:** abierta, marcada explícitamente como "posible tensión, no hecho" por la propia fuente. No se resuelve unilateralmente.
**Qué la resolvería:** entrevistas con brokers en activo o con asociaciones sectoriales (EBAA/ACA) sobre su proceso real de verificación — ver pregunta H1 más abajo, muy relacionada.
**Fuente:** `sources/investigacion-1-1-trabajo-real-broker.md` § J.

### Matiz ya resuelto — "flight watch" técnico vs. del broker
**No es una contradicción**, es una precisión que la Investigación 1.1 introduce sobre el Manual Cap. 1: el "flight watch" regulado (monitorización activa de posición/combustible/meteorología, con capacidad de intervención) es función del centro de operaciones del **operador** (OCC), no del broker `[HECHO VERIFICADO — SKYbrary, Bytron Aviation Systems]`. El broker realiza una versión más ligera, orientada al cliente: se mantiene informado y hace de puente de comunicación. **Debe preservarse esta distinción** en cualquier capítulo futuro del Manual (Cap. 3 u 11) y en cualquier diseño futuro de JETMI — no atribuir al broker una función técnica que corresponde al operador.
**Fuente:** `sources/investigacion-1-1-trabajo-real-broker.md`, función 32.

## Preguntas estratégicas abiertas (Mapa Maestro, Parte 2)

Ninguna de estas siete preguntas tiene respuesta registrada en `/docs` a fecha de esta ingestión. Todas condicionan directamente qué se puede investigar con precisión en la Fase 0 (bloqueante) del Mapa Maestro.

1. **¿Jurisdicción de constitución de JETMI?** (España, otra UE, EE.UU., estructura mixta). Condiciona los dominios 1, 7, 8, 9, 10, 22. Se resolvería con una decisión de Estefanía + validación de abogado.
2. **¿Mercado(s) geográfico(s) de captación inicial?** (España, Europa, LATAM, global). Condiciona dominio 20 y el enfoque de 3 y 14.
3. **¿JETMI actuará como agente (comisión declarada) o como principal/indirect air carrier (margen propio)?** Tiene implicaciones legales y fiscales distintas, no es solo preferencia. JETMI-D1 fija el posicionamiento general (broker operado, no plataforma) pero no responde esta pregunta más específica.
4. **¿JETMI tocará directamente el dinero del cliente, o usará pasarela/cuenta de terceros desde el principio?** Condiciona fuertemente dominios 9, 10, 11 y 22.
5. **¿Horizonte de tiempo real hasta el primer vuelo vendido?** Cambia qué se puede posponer sin poner en riesgo el MVP.
6. **¿El "trabajo en paralelo" impone restricciones horarias duras** que la disponibilidad 24/7 (dominio 13) deba resolver desde el minuto uno con automatización?
7. **¿Existe ya relación previa con operadores, mentores del sector, abogados de aviación o aseguradoras**, o se parte de cero en fuentes primarias?

**Fuente:** `sources/mapa-maestro-investigacion.md`, Parte 2.

## Preguntas abiertas de investigación funcional (Investigación 1.1, sección H)

Todas requieren, según la propia fuente, entrevista directa a un broker en activo — no resolubles con más búsqueda documental.

1. **[crítica]** ¿Qué criterios concretos, más allá del rating ARGUS/Wyvern/IS-BAO, usa un broker experimentado para decidir si confía en un operador nuevo? Probablemente la decisión de mayor valor de todo el oficio, sin documentar en fuente pública alguna.
2. ¿Cuántas RFQs simultáneas es razonable mantener abiertas por operación y por broker en un día normal?
3. ¿Cómo se decide, bajo presión de tiempo real, entre opciones de contingencia durante una incidencia grave?
4. ¿Qué proporción real del tiempo de un broker se dedica a cada uno de los 11 clusters funcionales identificados? Sin datos cuantitativos en ninguna fuente encontrada.
5. ¿Qué información sobre cliente/operador mantiene un broker experimentado que **no** pondría por escrito en un CRM compartido, y por qué? Relevante directamente para el futuro modelo de datos de LIFEOS.
6. ¿Cómo gestiona en la práctica un broker independiente (sin equipo) escenarios simultáneos de vuelo activo + incidencia? El escenario más directamente relevante para JETMI y el menos documentado.
7. ¿Existen SOPs o checklists internos reales (no de marketing) de brokerages medianos/grandes para vetting de operadores o gestión de incidencias? No se ha podido acceder a ninguno.
8. ¿Cuál es el tiempo de respuesta que los clientes consideran aceptable antes de irse con otro broker, y cómo varía por tipo de cliente?
9. ¿Qué parte de la "coordinación de logística especial" coordina el broker directamente frente a lo que delega en el operador/FBO?

**Fuente:** `sources/investigacion-1-1-trabajo-real-broker.md` § H.

## Aspectos no verificados del Manual a vigilar (no contradicciones, solo evidencia débil)

- El rango de comisión "5%-10%" y el markup no declarado en modelo principal son citados de forma consistente en varias fuentes secundarias, pero **ninguna cifra tiene fuente primaria propia del sector** (contrato real, encuesta sectorial) — tratar como orientativo, no como base de pricing de JETMI sin validación adicional (Mapa Maestro 2.1).
- La tasa de cancelación de empty legs (10%-15%) y el sobrecoste de reposicionamiento (30%-60%) están marcados en el propio Manual como estimaciones, no cifras oficiales del sector.
- El caso de fraude de $220.000 (Paramount Business Jets) es una única fuente comercial, citada con cautela explícita por ambos documentos — útil como ejemplo de vector de fraude, no como base estadística de frecuencia.

## Preguntas pendientes sin artefacto que las responda todavía

- ¿Qué matices introduciría un futuro Capítulo 2 del Manual ("Qué es realmente un broker") sobre lo ya cubierto por la Investigación 1.1? Son, en teoría, el mismo dominio (1.1 del Mapa Maestro) — si se escribe el Capítulo 2 narrativo, debe verificarse que no duplique sino que complemente lo ya ingerido aquí.
