Estado: conocimiento vigente — vivo, se añade y se resuelve (nunca se borra una hipótesis resuelta, se marca como tal)
Última verificación: 2026-07-15
Verificado en: ingestión de Investigación 1.2 (Supply), 1.2B (Challenge regional) y 1.2C (Empty legs wedge)
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

### C3 — Tensión epistemológica sobre la hipótesis "empty legs como wedge inicial de JETMI"
**Detectada:** 2026-07-15, en la revisión de producto/estrategia posterior a la ingestión de la Investigación 1.2C.
**Descripción:** la propia Investigación 1.2C (`sources/investigacion-1-2c-empty-legs-wedge.md`, sección N) clasifica su conclusión final como **PARCIALMENTE REFORZADA**. Sin embargo, esa clasificación conviene leerse con cautela: las dos razones que sustentaban originalmente el atractivo del wedge —(1) ticket menor = menor barrera de confianza del operador; (2) operación menor = mayor simplicidad para empezar— **no quedaron demostradas**. En particular:
  - no existe evidencia suficiente de que un operador aplique un onboarding o nivel de confianza sustancialmente diferente por tratarse de un empty leg de menor ticket (sección D del propio documento);
  - la urgencia, caducidad, rigidez de calendario y riesgo de cancelación (10-15%, documentado de forma consistente) pueden hacer que los empty legs sean **operacionalmente más exigentes**, no menos, para una sola persona (sección K);
  - no existe evidencia suficiente de que una primera operación de empty leg construya más relación con un operador que cualquier otra primera operación pequeña bien ejecutada (sección E);
  - la evidencia reunida refuerza la hipótesis de que, para los empty legs, conseguir demanda coincidente antes de que la oportunidad expire puede ser un cuello de botella más difícil que acceder al supply (sección F) — esto matiza, no invierte con certeza, la intuición original de la hipótesis; sigue siendo una lectura reforzada por la evidencia, no un hecho establecido.
**Estado:** abierta, con dos lecturas coexistentes que deben preservarse explícitamente:
  - **Conclusión del artefacto 1.2C**: `PARCIALMENTE REFORZADA`.
  - **Interpretación estratégica posterior**: `NO RESUELTA, con la formulación original DEBILITADA`.
  Ninguna de las dos sustituye a la otra; no se resuelve unilateralmente esta diferencia en esta ingestión.
**Posición durable actual** (mínimo a preservar en cualquier lectura futura):
  - JETMI **no ha decidido** utilizar empty legs como estrategia inicial.
  - Empty legs siguen siendo una **hipótesis estratégica abierta** que deberá reevaluarse después de investigar la demanda (dominio 1.3) y de resolver la dependencia legal/laboral pendiente de la fundadora (ver H10-B más abajo) — siempre dentro de la restricción de diseño de independencia de VistaJet ya establecida (ver H10-A), que no depende de esa investigación futura.
  - No se ha registrado ninguna decisión sobre empty legs en `DECISIONS.md` — deliberadamente. Ver también H8 y H9.
**Qué la resolvería:** investigación de demanda (1.3, ver `LOG.md` § 6) que determine si existe volumen de clientes con ruta/fecha coincidente suficiente para que el mecanismo del empty leg sea explotable por un actor nuevo; y, por separado, resolución de la dependencia legal/laboral pendiente (H10-B) — no de la restricción de diseño (H10-A), que ya rige.
**Fuente:** `sources/investigacion-1-2c-empty-legs-wedge.md`, secciones A, D, E, F, K, N.

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

## Preguntas abiertas de Supply (Investigación 1.2, sección N)

1. **[crítica]** ¿Cuánto tiempo o volumen concreto se necesita para pasar de "broker desconocido" a "broker con prioridad de respuesta" ante un operador dado? — la más importante de toda la investigación de Supply, sin resolver en ninguna de las tres rondas (1.2, 1.2B, 1.2C).
2. ¿Existen contratos marco (framework agreements) estándar entre brokers nuevos y operadores, o cada relación se construye completamente ad hoc?
3. ¿Qué proporción real del supply que un broker termina utilizando proviene de redes informales (WhatsApp, contactos personales) frente a plataformas formales?
4. ¿Cuántas relaciones de operador puede sostener activamente y con calidad una sola persona, de forma realista?
5. ¿Qué señales concretas usa un operador para decidir, en la práctica, si un broker nuevo "envía RFQs con intención real de comprar" frente a "solo está mirando precios"?
6. ¿Cómo se recupera, en la práctica, una relación broker-operador deteriorada tras un error o una mala experiencia?
7. ¿Qué parte de la disponibilidad "stale" (calendarios desactualizados) es un problema real medible, frente a una hipótesis razonable sin datos que la respalden?

**Fuente:** `sources/investigacion-1-2-supply.md` § N.

## Preguntas abiertas del challenge regional (Investigación 1.2B, sección L)

1. **[crítica]** ¿Existen floating fleets genuinos operando dentro de España, Portugal, o cualquier mercado LATAM, o es un modelo estructuralmente limitado a la geografía y regulación de EE.UU.?
2. ¿Qué proceso de admisión/verificación aplica realmente Avinode a un broker nuevo, más allá del pago de la suscripción?
3. ¿Qué dice un operador, en sus propias palabras, sobre qué espera de un broker nuevo y qué le hace dejar de responder a uno? — misma laguna crítica que H1 de esta sección de 1.1, ahora confirmada también para Supply.
4. ¿Existe algún registro o dato equivalente al de ANAC (Brasil) para España, Portugal, México, o el resto de LATAM que permita medir fragmentación real de operadores?
5. ¿Cómo afecta el reciente escándalo de sanciones de Avinode (2026) a las prácticas de verificación de cliente que un broker europeo debería adoptar por su cuenta, más allá de lo que la plataforma exige?
6. ¿Dónde vive realmente el supply de largo alcance para misiones Europa↔LATAM — en operadores europeos, latinoamericanos, o mayoritariamente estadounidenses?
7. ¿Qué papel real —cuantificable, no solo plausible— juega WhatsApp y la informalidad comercial en el sourcing dentro de LATAM, frente a Europa?
8. **¿Qué relaciones previas tiene ya la fundadora de JETMI dentro del sector, y en qué medida acortan la fase de "broker desconocido"?** — pregunta que depende de información que solo la propia fundadora puede aportar, no de fuentes públicas. No preguntada explícitamente todavía en esta ingestión.
9. ¿Existen contratos marco (framework agreements) estándar entre brokers y operadores en España o en algún país de LATAM?
10. ¿Cuál es la penetración real de ARGUS/Wyvern/IS-BAO entre operadores brasileños y mexicanos?

**Fuente:** `sources/investigacion-1-2b-challenge-regional-supply.md` § L.

## Preguntas que requieren fuente primaria sobre empty legs (Investigación 1.2C, sección M)

1. **[crítica]** ¿Un operador aplica realmente un proceso de verificación distinto (más ligero) para la venta de un empty leg de bajo ticket frente a un charter completo, o el proceso es esencialmente el mismo? — es la pregunta que, de resolverse afirmativamente, reforzaría más la hipótesis de empty legs (ver C3); de resolverse negativamente, la debilitaría más.
2. ¿Existe algún caso documentado, aunque sea uno solo, de un broker que confirme que una primera venta de empty leg mejoró su relación posterior con ese operador?
3. ¿Qué proporción real de empty legs se vende a través de brokers frente a venta directa del operador a su propia base de clientes/miembros (como en el caso de VistaJet)?
4. ¿Existen plataformas o canales de empty legs específicos y relevantes en España, Portugal, o algún mercado LATAM, más allá de Avinode y GlobeAir (Europa) ya documentados?
5. ¿Cuál es, en la práctica, el margen real que un broker puede aplicar sobre un empty leg ya descontado un 30-75%, y es ese margen suficiente para cubrir el tiempo dedicado a encontrarle comprador?

**Fuente:** `sources/investigacion-1-2c-empty-legs-wedge.md` § M.

## Degradaciones epistemológicas introducidas por la Investigación 1.2B sobre la Investigación 1.2

La Investigación 1.2B audita explícitamente cada afirmación de 1.2 y propone un nuevo estado epistemológico para varias de ellas (tabla completa en `sources/investigacion-1-2b-challenge-regional-supply.md` § O). No se ha editado 1.2 para reflejarlo — el estado más reciente vive aquí:

| Hallazgo de 1.2 | Estado en 1.2 | Estado tras 1.2B |
|---|---|---|
| Distinción "aircraft exists / available / bookable" | Hecho verificado | **Se mantiene** — el único hallazgo de Supply confirmado como robusto y probablemente global |
| Floating fleet como modelo relevante de supply | Mecanismo general del mercado | **Degradado** a "evidencia principalmente estadounidense" — no generalizar a España/Portugal/LATAM sin verificación (pregunta L.1) |
| Acceso tecnológico igual para brokers nuevos y establecidos | Hallazgo central | **Degradado** a hipótesis razonable sin grado de certeza — no se ha verificado el proceso de admisión real de Avinode |
| Prioridad de respuesta por reputación/volumen | Tratado casi como hecho | **Degradado** explícitamente a evidencia comercial (voz de broker, no de operador) |
| Onboarding formal de brokers en plataformas (Ankor/Calendars) | Tratado como práctica general | **Degradado** a "un solo caso documentado", no una práctica confirmada como extendida |
| WhatsApp/redes informales como canal significativo | Tratado como canal reconocido | **Degradado** a pregunta abierta explícita, con sospecha (no confirmada) de mayor relevancia en LATAM que en Europa |
| Vetting y fraude (ARGUS/Wyvern/IS-BAO, wet-lease) | Hecho verificado | Se mantiene el mecanismo; **se añade** el caso de sanciones de Avinode (2026) como ampliación relevante, no como contradicción |

**Regla aplicada en esta ingestión, por instrucción explícita:** cuando 1.2B degrada el nivel de confianza de una afirmación de 1.2, la versión más reciente (degradada) es la que debe citarse en cualquier trabajo futuro — no la versión original de 1.2, aunque el documento fuente de 1.2 no se ha editado retrospectivamente.

## Aspectos no verificados del Manual a vigilar (no contradicciones, solo evidencia débil)

- El rango de comisión "5%-10%" y el markup no declarado en modelo principal son citados de forma consistente en varias fuentes secundarias, pero **ninguna cifra tiene fuente primaria propia del sector** (contrato real, encuesta sectorial) — tratar como orientativo, no como base de pricing de JETMI sin validación adicional (Mapa Maestro 2.1).
- La tasa de cancelación de empty legs (10%-15%) y el sobrecoste de reposicionamiento (30%-60%) están marcados en el propio Manual como estimaciones, no cifras oficiales del sector — reforzada en la Investigación 1.2C, sección B, donde la misma cifra aparece de forma independiente en al menos tres fuentes adicionales, lo que la hace más creíble sin llegar a ser una cifra oficial de industria.
- El caso de fraude de $220.000 (Paramount Business Jets) es una única fuente comercial, citada con cautela explícita por ambos documentos — útil como ejemplo de vector de fraude, no como base estadística de frecuencia.

## Hipótesis y dependencias específicas de la hipótesis "empty legs como wedge" (Investigación 1.2C)

### H8 — Empty legs como complemento de aprendizaje, no como negocio principal ni canal de adquisición
La Investigación 1.2C compara 5 modelos estratégicos (sección H) sin elegir ninguno. El patrón histórico de marketplaces de empty legs (JetSmarter → XO, BlackJet, sección G) sugiere que ningún actor relevante que sigue operando de forma independiente construyó su negocio principal exclusivamente sobre empty legs. **Estado:** abierta — no descarta el empty leg como línea complementaria dentro de una oferta más amplia, pero debilita su plausibilidad como estrategia de entrada autónoma. **Fuente:** `sources/investigacion-1-2c-empty-legs-wedge.md` § G, H.

### H9 — Hipótesis reforzada: para empty legs, la demanda coincidente puede ser un cuello de botella más difícil que el acceso al supply
La evidencia reunida en la propia investigación (fuente única, 1.2C, no verificada de forma independiente por una segunda ronda) **refuerza la hipótesis** de que el supply de empty legs existe de forma abundante y accesible, mientras que tener, en el momento exacto en que aparece la oportunidad, un comprador cuya ruta/fecha coincidan antes de que caduque o se cancele (10-15% de las veces) es más difícil. Esto **no debe tratarse como hecho establecido** — es una lectura razonada apoyada en evidencia, formulada por un único artefacto de investigación, pendiente de contraste con la investigación de demanda. **Implicación directa:** ninguna estrategia de empty legs puede evaluarse con seriedad sin antes investigar demanda (dominio 1.3, ver `LOG.md` § 6), y esa investigación podría matizar o reforzar aún más esta hipótesis. **Estado:** abierta, dependiente de 1.3. **Fuente:** `sources/investigacion-1-2c-empty-legs-wedge.md` § F.

### H10 — VistaJet y JETMI: restricción de diseño establecida (A) y dependencia legal/laboral pendiente (B)

La Investigación 1.2C introduce formalmente un conjunto de cuestiones sobre la situación de la fundadora como Cabin Hostess de VistaJet. Conviene mantener separados dos conceptos de naturaleza distinta, que no deben mezclarse ni clasificarse bajo la misma etiqueta:

**H10-A — Restricción de diseño ya establecida (no es hipótesis pendiente):** JETMI debe construirse y operar de forma completamente independiente de VistaJet. JETMI no debe depender de: clientes de VistaJet; leads conocidos por razón del empleo; información comercial interna; pricing interno; disponibilidad interna; empty legs conocidos exclusivamente mediante sistemas internos; bases de datos internas; procesos confidenciales; recursos del empleador; tiempo de trabajo del empleador; oportunidades conocidas por razón del puesto; relaciones comerciales pertenecientes al empleador; o cualquier otra información no pública obtenida mediante el empleo. **Estado: restricción de diseño vigente, no `[DEPENDENCIA LEGAL/LABORAL PENDIENTE]`.** Se aplica ya, sin esperar a ninguna investigación jurídica futura, a cualquier hipótesis estratégica de JETMI — incluida la de empty legs (relevante aquí porque VistaJet comercializa activamente empty legs a sus miembros, cita directa de BLADE recogida en la fuente, lo que hace más visible el riesgo de apoyarse, aunque sea inadvertidamente, en esa actividad). **Fuente:** `sources/investigacion-1-2c-empty-legs-wedge.md` § L.

**H10-B — Dependencia legal/laboral pendiente (sigue sin resolver):** todavía debe investigarse cómo puede participar legítimamente la fundadora en la creación, propiedad, administración, dirección, actividad operativa, actividad comercial y visibilidad pública de JETMI mientras continúa empleada por VistaJet — incluyendo cláusulas de exclusividad/non-compete, conflicto de interés, deber de lealtad y confidencialidad de su contrato laboral actual, y el régimen de KYC/AML/sanciones aplicable. Entre las hipótesis futuras que se han considerado, sin que nada esté decidido, están: una posible estructura societaria en Portugal, y una posible participación societaria o administrativa de la madre de la fundadora, entre otras estructuras legales que puedan estudiarse posteriormente. **Ninguna de estas hipótesis se valida, recomienda ni diseña aquí** — en particular, no debe asumirse que poner una empresa a nombre de otra persona resuelve, por sí solo, ninguna restricción contractual o jurídica, y no se contempla ninguna estructura destinada a ocultar quién gestiona o controla realmente la actividad. La estructura jurídica deberá investigarse en la futura Fase 0, usando el contrato laboral real, la jurisdicción laboral aplicable, derecho societario, fiscalidad, beneficial ownership, conflicto de interés, y los deberes de confidencialidad/no competencia que resulten aplicables — no se abre esa investigación jurídica en esta ingestión. **Estado:** `[DEPENDENCIA LEGAL/LABORAL PENDIENTE]` en todas sus variantes. **Qué la resolvería:** revisión legal específica del contrato laboral y del marco de conflicto de interés — fuente primaria (abogado laboral), no investigación web. **Fuente:** `sources/investigacion-1-2c-empty-legs-wedge.md` § L.

## Preguntas pendientes sin artefacto que las responda todavía

- ¿Qué matices introduciría un futuro Capítulo 2 del Manual ("Qué es realmente un broker") sobre lo ya cubierto por la Investigación 1.1? Son, en teoría, el mismo dominio (1.1 del Mapa Maestro) — si se escribe el Capítulo 2 narrativo, debe verificarse que no duplique sino que complemente lo ya ingerido aquí.
- Todas las preguntas de demanda que motivan la apertura del dominio 1.3 (ver `LOG.md` § 6) — no se listan aquí de forma exhaustiva porque pertenecen a una investigación todavía no iniciada, no a la ya ingerida.
