Estado: fuente — investigación externa, no verdad de JETMI (ver research/README.md)
Última verificación: 2026-07-15
Verificado en: conversión fiel del PDF original a Markdown, sin editorializar
Fuente de verdad de datos: ninguna

# INVESTIGACIÓN 1.2 — Supply: cómo consigue realmente un broker acceso a aeronaves

**Fase 1 del Mapa Maestro de Investigación — JETMI dentro de LIFEOS**

**Tipo de artefacto:** investigación primaria de industria, corresponde al dominio 1.2 (Supply) del Mapa Maestro (`mapa-maestro-investigacion.md`). Es el primer eslabón de una secuencia epistemológica: 1.2 (esta investigación) → 1.2B (challenge y profundización regional, `investigacion-1-2b-challenge-regional-supply.md`) → 1.2C (challenge de la hipótesis estratégica "empty legs como wedge", `investigacion-1-2c-empty-legs-wedge.md`). 1.2B puede corregir, matizar o degradar afirmaciones de este documento — ver esos artefactos para el estado epistemológico más reciente. Este documento no ha sido editado retrospectivamente para reflejar esas correcciones; se preserva tal como se recibió.

### Convención de etiquetado (idéntica a la usada en documentos anteriores)

`[HECHO VERIFICADO]` · `[PRÁCTICA HABITUAL]` · `[VARIACIÓN POR JURISDICCIÓN]` · `[PRÁCTICA DE ALGUNAS EMPRESAS]` · `[HIPÓTESIS]` · `[OPINIÓN/INTERPRETACIÓN]` · `[INFORMACIÓN NO VERIFICADA]` · `[PREGUNTA ABIERTA]`

**Advertencia metodológica** (del propio documento): igual que en la Investigación 1.1, la mayoría de las fuentes públicas sobre "cómo consigue supply un broker" son documentación comercial de plataformas o contenido de brokers explicando su propio valor. Se priorizó prensa sectorial con paneles de profesionales reales (nombres y cargos citados), documentación técnica directa de plataformas (Leon, Schedaero, CharterPad, Avinode), un ejemplo real de proceso de onboarding de broker (Ankor/Calendars), y una fuente que detalla verificación de credenciales de broker (New Flight Charters). No se pudo entrevistar a ningún broker ni operador directamente — donde la evidencia es débil, el documento lo dice explícitamente.

---

## A. RESUMEN EJECUTIVO

"Conseguir un avión" no es un problema de búsqueda — es un problema de **tres capas superpuestas**: (1) saber qué capacidad existe en el mundo, (2) saber cuál de esa capacidad está realmente disponible para tu misión concreta, y (3) conseguir que quien la controla te la confirme a ti, y no a otro broker que también la está pidiendo en ese mismo momento. Las plataformas (Avinode y su ecosistema) resuelven razonablemente bien la capa 1. La capa 2 es donde vive la mayor parte de la dificultad real, porque "disponible" en una pantalla y "confirmable" en la práctica son cosas distintas — depende de aprobación del propietario, tripulación, mantenimiento, posicionamiento y prioridades comerciales del operador en ese instante. La capa 3 es, casi enteramente, relacional: quién responde primero, con seriedad y sin sorpresas, depende de una relación construida en el tiempo, no solo de tener acceso a la misma plataforma que todos los demás.

Un hallazgo que atraviesa toda la investigación: **el acceso a la tecnología (Avinode, CharterPad) es, hoy, prácticamente igual para un broker nuevo que para uno establecido** — cualquiera puede suscribirse. La ventaja real de un broker establecido no está en el acceso a la plataforma, está en **la calidad de la respuesta que obtiene de la misma plataforma** — un operador que reconoce el nombre del broker, que sabe que sus solicitudes son reales y que ha tenido buenas experiencias previas, contesta antes, con más detalle, y con más disposición a ceder en precio o condiciones. Esto tiene una implicación directa para el escenario "una persona sola, empezando de cero" (sección L): **el cuello de botella inicial no es tecnológico, es reputacional**, y la reputación se construye con volumen y tiempo — dos cosas que, por definición, un broker nuevo no tiene todavía.

---

## B. TAXONOMÍA COMPLETA DEL SUPPLY

| Tipo de capacidad | Quién la controla comercialmente | Quién puede confirmar el vuelo | Rol del operador |
|---|---|---|---|
| Aircraft operado directamente por el titular del AOC (el operador es también dueño) | El propio operador | El propio operador | Es el operador y el controlador comercial a la vez |
| Aircraft under management (gestionado para un tercero propietario) | La empresa de gestión, con aprobación del propietario en la mayoría de los casos `[PRÁCTICA HABITUAL, con matices — ver sección G]` | La empresa de gestión, tras obtener el "sí" del propietario | Frecuentemente la misma entidad que gestiona |
| Owner aircraft disponible para charter | El propietario, vía su gestora | La gestora, con aprobación del propietario — en Clay Lacy, por ejemplo, cada solicitud de cotización exige "dos ventas": convencer al propietario de aceptar el vuelo, y luego vender la cotización frente a otros operadores `[HECHO VERIFICADO — cita directa de Carter/Clay Lacy, privatejetcardcomparisons.com]` | La gestora |
| Dedicated/home-based charter fleet | El operador, con base fija | El operador | Controla todo |
| Floating fleet | El operador (normalmente también propietario de varias unidades homogéneas) | El operador, sin necesidad de aprobación de un tercero propietario `[HECHO VERIFICADO]` — lo que le permite "decir que sí inmediatamente", aunque eso traslada el riesgo de posicionamiento al propio operador `[HECHO VERIFICADO, privatejetcardcomparisons.com]` | Controla todo |
| Transient aircraft (aeronave de paso, no basada en la zona) | El operador de origen | El operador de origen | Controla, pero con menos margen de maniobra local |
| Repositioning opportunities / empty legs | El operador que ya tiene el vuelo de ida confirmado | El operador | Controla |
| Wholesale capacity (bloques de horas) | El mayorista que ha comprado el bloque | El mayorista, dentro del acuerdo con el operador | El operador presta la aeronave/tripulación |
| Broker-to-broker supply / sub-charter | El broker que tiene la relación original con el operador | En última instancia el operador, pero el broker intermedio gestiona la confirmación | El operador ejecuta el vuelo |
| Aircraft substitution / backup capacity | Cualquiera de los anteriores, activado de forma reactiva | El que finalmente confirma la sustitución | Variable |

**La distinción más importante de esta sección**, y que ninguna de las fuentes revisadas verbaliza con esa claridad pero que se deduce de forma consistente de varias de ellas: existen **tres estados distintos que el lenguaje comercial funde en uno solo ("available")**:

1. **"Aircraft exists"** — la aeronave existe, está en la flota de algún operador en algún lugar del mundo.
2. **"Aircraft is available"** — según la información que el broker puede ver (plataforma, comunicación directa), parece que esa aeronave podría hacer esa misión.
3. **"Aircraft is actually bookable"** — el operador (y, si aplica, el propietario) han confirmado activamente que sí, para esas fechas, ese origen/destino y ese precio. Esta es la única de las tres que importa para el cliente.

`[OPINIÓN/INTERPRETACIÓN, aunque construida directamente sobre hechos verificados de la sección G]`

---

## C. MAPA DE FUENTES Y CANALES

### C.1 Contacto directo con operadores

Canales: email, teléfono, WhatsApp (con la misma variación cultural ya documentada en la Investigación 1.1), sales/charter desks de operadores grandes, listas de distribución. `[PRÁCTICA HABITUAL]` Sigue siendo, según el tono consistente de todas las fuentes de prensa sectorial revisadas (tanto en esta investigación como en la 1.1), el canal preferido para negociación fina y para gestionar incidencias — las plataformas aceleran el descubrimiento inicial, pero no sustituyen la llamada de teléfono en los momentos que más importan.

### C.2 Marketplaces y plataformas — tabla comparativa

| Herramienta | Quién la usa | Qué resuelve | ¿Disponibilidad real o estimada? | Qué sigue dependiendo de comunicación externa |
|---|---|---|---|---|
| Avinode | Brokers y operadores, ambos lados del mercado (ver Manual Cap. 1) | Descubrimiento de aeronaves/operadores, RFQ, mensajería, Trip Board, Paynode para pagos | Estimada — el operador debe confirmar activamente | Negociación fina, condiciones no estándar, resolución de ambigüedades |
| Schedaero | Operadores (herramienta de gestión operativa, no un marketplace de brokers) — filial de Avinode Group, con integración "lo más estrecha posible" con Avinode `[HECHO VERIFICADO — Aviatize.com]` | Gestión de tripulación, mantenimiento, cumplimiento, y transferencia de reservas confirmadas hacia el sistema del operador | No aplica directamente al broker — es la herramienta que usa el operador para procesar lo que llega de Avinode | Nada relevante para el broker directamente |
| Leon | Operadores, sobre todo europeos con múltiples AOC — con motor de tiempos de servicio de tripulación (FTL) muy desarrollado `[HECHO VERIFICADO — Aviatize.com]` | Igual que Schedaero pero para el lado operativo europeo; incluye CRM propio con integración a Avinode para sub-charter | No aplica directamente al broker | — |
| FL3XX | Operadores, con catálogo de integraciones más amplio que Schedaero/Leon (menos "encerrado" en un único ecosistema) `[HECHO VERIFICADO — Aviatize.com]` | Igual función que las anteriores | No aplica directamente al broker | — |
| CharterPad | Brokers y operadores, ambos lados — es explícitamente un marketplace de emparejamiento (no una herramienta de gestión operativa interna) | Búsqueda y alertas para hacer coincidir necesidades de brokers con disponibilidad de operadores; más de 20.000 aeronaves en su base de datos según la propia empresa `[INFORMACIÓN COMERCIAL, no verificada de forma independiente]` | Estimada, con alertas push | Confirmación final, condiciones específicas |
| Victor / FlyVictor | Consumidores finales — es en sí mismo un broker retail (certificado ARGUS), no una herramienta que otros brokers usen para conseguir supply `[HECHO VERIFICADO tras verificación directa — esto corrige una posible confusión del prompt original, que lo agrupaba junto a plataformas de sourcing]` | Resuelve la experiencia de reserva para el cliente final, no el sourcing de otro broker | N/A para terceros brokers | N/A |
| PrivateFly | Igual que Victor — broker retail con tecnología propia, no una plataforma de supply para terceros | Igual | N/A | N/A |
| SkyAccess | Operadores (para publicar disponibilidad/empty legs) y consumidores | Marketplace específico de empty legs, con integración directa desde Leon Software `[HECHO VERIFICADO — leonsoftware.com]` | Estimada | Confirmación final |

**Nota importante sobre el listado original del prompt:** "Returnjet" no ha podido ser verificado como una herramienta activa y relevante del sector con las búsquedas realizadas — no se descarta que exista o haya existido, pero no hay evidencia suficiente para documentarla con rigor `[INFORMACIÓN NO VERIFICADA]`. De forma más importante, **Victor y PrivateFly no son plataformas de sourcing de supply que un broker como JETMI pueda usar** — son brokers retail competidores que usan tecnología propia de cara al cliente. Esto es una corrección directa a un supuesto implícito en la lista original del prompt: la lista de "herramientas relevantes" del prompt mezclaba, sin quererlo, dos categorías distintas: **herramientas de operación interna de operadores** (Leon, Schedaero, FL3XX) y **brokers retail con tecnología propia** (Victor, PrivateFly), ninguna de las cuales es, en sí misma, una fuente de supply para un tercer broker — a diferencia de Avinode y CharterPad, que sí lo son.

### C.3 Otros brokers (wholesale, co-brokering, whitelabel)

`[PRÁCTICA DE ALGUNAS EMPRESAS]` Ocurre cuando un broker no tiene acceso directo a un operador concreto pero conoce a otro broker que sí — ya documentado en el Manual (Cap. 1, sección 1.3, modelo mayorista/minorista). Cada capa de intermediación añade margen y reduce la transparencia sobre quién opera realmente el vuelo, que es precisamente lo que la normativa de disclosure (Part 295 en EE.UU.) busca mitigar — de hecho, la NBAA confirmó explícitamente en 2021 que **un broker puede contratar con el cliente antes de conocer la identidad del transportista directo final**, siempre que luego lo divulgue `[HECHO VERIFICADO — NBAA, "DOT Confirms Charter Broker Disclosure Timing Requirements", marzo 2021]`, lo cual es la base legal que hace posible, en EE.UU., que exista esta cadena de intermediarios sin incumplir la norma.

### C.4 Redes informales

`[HIPÓTESIS, consistente con el tono de toda la prensa sectorial revisada, no medida directamente]` Grupos de WhatsApp entre brokers, listas de distribución por email, LinkedIn, eventos del sector (EBACE, NBAA-BACE), asociaciones (NBAA, EBAA, ACA/ACANA) y contactos históricos personales. No se ha encontrado ninguna fuente que cuantifique qué proporción del supply real proviene de estos canales frente a las plataformas formales — es, con alta probabilidad, sustancial para operaciones complejas o de última hora, pero es una `[PREGUNTA ABIERTA]` que solo se puede responder con entrevistas directas.

---

## D. WORKFLOW REAL DE SOURCING (paso a paso, desde una flight request concreta)

Este flujo amplía, del lado del supply, lo ya documentado en la Investigación 1.1 (funciones 7-11):

1. **Dónde buscar primero**: el broker decide, según el tipo de aeronave y la zona, si empieza por su red de contactos conocidos o por una búsqueda amplia en Avinode/CharterPad — `[HIPÓTESIS razonable]` los brokers con más historial probablemente empiezan por contactos conocidos y usan el marketplace como red de seguridad, no al revés.
2. **Identificación de operadores potenciales**: cruce de tipo de aeronave, base/posición, y rating de seguridad mínimo aceptable.
3. **Cuántos contactar**: según el Manual (Cap. 1) y la Investigación 1.1 (función 7-8), la práctica citada es contactar pocos y bien elegidos, no una red amplia indiscriminada — enviar a demasiados daña la reputación del broker frente a los operadores.
4. **Preparación de la RFQ**: ver sección F.
5. **Qué información se incluye**: ver sección F.
6. **Distribución**: vía Avinode/CharterPad, o directamente por email/teléfono a contactos conocidos.
7. **Cuánto se espera antes de insistir**: no hay una cifra estándar documentada `[PREGUNTA ABIERTA]` — la urgencia de la misión determina la tolerancia.
8. **Cuándo se hace seguimiento**: ya documentado en la Investigación 1.1 (función 10) como "trabajo invisible" — perseguir respuestas.
9. **Cómo se reciben las respuestas**: mensajería de la plataforma, email, PDF adjunto, o verbalmente por teléfono (que después hay que documentar manualmente).
10. **Manejo de respuestas incompletas**: se vuelve a preguntar directamente al operador — no hay automatismo documentado que lo resuelva.
11. **Descubrir costes ocultos o exclusiones**: lectura atenta de la cotización y, con frecuencia, pregunta directa — "¿esto incluye tasas de aeropuerto? ¿catering?".
12. **Comprobación de disponibilidad real**: ver sección G — es, con diferencia, el paso más problemático de todo el flujo.
13. **Comparación**: ya documentado en la Investigación 1.1 (función 16).
14. **Cuándo se vuelve a negociar**: cuando el precio o las condiciones no encajan pero el operador y la aeronave sí son adecuados.
15. **Cuándo se deja de buscar**: cuando se ha encontrado una opción confirmable que cumple los criterios de seguridad y precio del broker, o cuando se agota el tiempo disponible antes de la fecha del vuelo.

**Diferencias según el contexto** `[HIPÓTESIS estructurada, no medida con datos]`:
- **Urgencia**: a mayor urgencia, más se prioriza el teléfono directo a contactos conocidos sobre la búsqueda amplia en plataforma.
- **Tamaño de aeronave**: aeronaves más grandes/especializadas tienen menos operadores candidatos, lo que reduce las opciones de comparación y aumenta el poder de negociación del operador.
- **Complejidad de la misión** (multi-tramo, internacional, permisos): requiere más ida y vuelta de información antes de poder cotizar con precisión.
- **Cliente sensible al precio vs. a la calidad**: cambia cuántas opciones se buscan y qué peso se da al rating de seguridad frente al precio en la comparación final.
- **Vuelo inmediato vs. meses en el futuro**: la disponibilidad "aparente" (sección G) es mucho menos fiable cuanto más lejos está la fecha, porque los calendarios de los operadores todavía no reflejan compromisos que se cerrarán más adelante.

---

## E. CÓMO SE CONSTRUYE UNA RED DE OPERADORES DESDE CERO

Esta es, como advertía el prompt, una sección crítica — y también donde la evidencia pública es más escasa.

**Lo que sí está documentado con evidencia razonable:**

- **No existe barrera legal de entrada para ser broker.** Ni la FAA ni el DOT definen requisitos de cualificación para ejercer de broker — "puede ser un experto en aviación o un completo novato" `[HECHO VERIFICADO — Air Charter Journal]`. Esto significa que, a diferencia del operador (que necesita un AOC/certificado Part 135), **cualquiera puede empezar a enviar RFQs desde el primer día** — la barrera no es de entrada legal, es de respuesta por parte de los operadores.
- **Los operadores sí filtran, de facto, a los brokers nuevos** — aunque no exista obligación legal de hacerlo. Una fuente que aconseja a clientes cómo elegir broker recomienda explícitamente pedir el número D-U-N-S, el rating de Dun & Bradstreet, o verificación de historial crediticio de la empresa de brokerage, y señala sin rodeos que "no es infrecuente que algunas personas en puestos clave de brokerage tengan antecedentes penales o embargos fiscales", y que varias brokerages han quebrado llevándose el dinero de clientes `[HECHO VERIFICADO, cita directa — New Flight Charters]`. Esto es una señal clara de que la industria tiene un problema de confianza estructural que los operadores (razonablemente) trasladan a cómo tratan a un broker desconocido.
- **Existen procesos formales de onboarding para brokers en algunas plataformas**, no solo para operadores. Un ejemplo documentado: la plataforma "Calendars" (Ankor) exige a los brokers nuevos enviar documentación mínima y pasar por un proceso de revisión antes de obtener acceso, explícitamente para "salvaguardar la integridad de la plataforma y fomentar una red de confianza" `[HECHO VERIFICADO — Ankor Help Center]`. Esto sugiere que, incluso a nivel de plataforma tecnológica (no solo en la relación directa con un operador concreto), **un broker nuevo no tiene acceso instantáneo e incondicional** — hay una capa de verificación previa.
- **Qué espera un operador de un broker**, según una fuente de un broker establecido que documenta explícitamente lo que "no" tolera de sus propios operadores (y que, por espejo, sugiere qué es lo que un operador probablemente espera de un broker): profesionalidad en la comunicación, transparencia ante problemas mecánicos, disposición a firmar/aceptar informes de seguridad sin quejarse del coste, y condiciones de crédito claras y no abusivas ante cancelaciones `[HECHO VERIFICADO, aunque la fuente es comercial y describe la relación desde el lado del broker hacia el operador, no al revés — Paramount Business Jets, "What Private Jet Brokers Really Want (and Don't Want) from Operators"]`. Por simetría razonable (no verificada directamente), es plausible que un operador valore exactamente los mismos rasgos en un broker: comunicación profesional, pagos puntuales, y no generar fricciones — pero esto es una inferencia, no un hecho confirmado desde el lado del operador `[HIPÓTESIS]`.

**Lo que NO está documentado con evidencia suficiente, y por tanto queda como pregunta abierta genuina:**
- Qué RFQs concretas hace que un operador decida ignorar sistemáticamente a un broker nuevo (más allá de la intuición general de "parece poco serio").
- Si existen, en la práctica, contratos marco (framework agreements) estándar entre brokers nuevos y operadores, o si cada relación se construye ad hoc.
- Cuánto tiempo o volumen se necesita, en términos concretos, para pasar de "broker desconocido" a "broker con prioridad de respuesta".

`[PREGUNTA ABIERTA — de las más importantes de toda esta investigación, y que solo una entrevista directa con un operador o con un broker que haya vivido el arranque desde cero podría resolver con precisión]`.

---

## F. ANATOMÍA DE UNA RFQ Y UNA RESPUESTA

**Qué envía el broker** (consistente con Avinode y con la práctica general documentada en el Manual Cap. 1 y la Investigación 1.1): ruta, fecha/hora, número de pasajeros, equipaje, mascotas, solicitudes especiales, flexibilidad de fechas/horarios, si es solo ida o ida y vuelta, y consideraciones de posicionamiento si se conocen.

**Qué devuelve el operador**: aeronave (tipo y, en el mejor de los casos, matrícula concreta), precio, impuestos, coste de posicionamiento si aplica, qué incluye y qué excluye el precio, validez de la oferta, condiciones de cancelación, información de tripulación, disponibilidad de Wi-Fi, catering, de-icing si aplica, si requiere aprobación del propietario, y restricciones operativas.

**Formatos**: PDF, email, mensajería de plataforma, o verbalmente por teléfono (con el riesgo de pérdida de información ya señalado en la Investigación 1.1, sección F). `[HECHO VERIFICADO, por acumulación de las fuentes de ambas investigaciones]` No existe un formato estándar único en toda la industria — Avinode estandariza parcialmente el proceso de solicitud, pero el contenido exacto de la respuesta de cada operador varía.

**Información frecuentemente ausente o ambigua** `[HIPÓTESIS estructurada a partir del patrón repetido en varias fuentes, no medida cuantitativamente]`: si el precio incluye tasas de aeropuerto y de-icing, si la aeronave todavía requiere aprobación del propietario, si el precio es firme o sujeto a cambio según se acerca la fecha (relevante sobre todo en empty legs, ver Manual Cap. 1), y las condiciones exactas de cancelación.

**Necesidad de normalización manual**: confirmada tanto en el Manual (Cap. 1) como en la Investigación 1.1 (función 11) — Avinode ayuda pero no elimina el problema, porque el contenido cualitativo de cada respuesta (qué incluye realmente el precio) sigue dependiendo de cómo cada operador redacta su cotización.

---

## G. DISPONIBILIDAD REAL VS. DISPONIBILIDAD APARENTE

Esta es, de acuerdo con la evidencia reunida, la sección de mayor densidad de hallazgos concretos.

**Por qué "available" no equivale a "confirmable":**

- **Aprobación del propietario**: en aeronaves gestionadas (no floating fleet), el operador con frecuencia necesita el visto bueno del propietario antes de aceptar el vuelo — lo que, según un ejecutivo de Clay Lacy (aeronaves gestionadas), convierte cada solicitud de cotización en "dos ventas": convencer al propietario primero, y ganar la cotización frente a la competencia después `[HECHO VERIFICADO, cita directa — privatejetcardcomparisons.com]`.
- **El modelo floating fleet resuelve la aprobación del propietario, pero traslada el riesgo al operador**: sin necesidad de aprobación de un tercero, el operador puede decir que sí de inmediato — pero eso significa que asume el riesgo de que sus aeronaves terminen dispersas geográficamente (p. ej., en California, Nueva York, Texas y Florida simultáneamente, sin garantía de que la siguiente solicitud coincida con dónde están) `[HECHO VERIFICADO, cita directa de un ejecutivo del sector, mismo artículo]`.
- **Tripulación y tiempos de descanso**: un piloto que ha volado varios días seguidos puede no estar disponible para un vuelo adicional por mucho que la aeronave esté libre, y las tripulaciones a menudo necesitan reposicionarse en vuelos comerciales — un vuelo comercial retrasado o cancelado puede desbaratar toda la operación `[HECHO VERIFICADO, mismo artículo, citando a un ejecutivo del sector]`.
- **Mantenimiento**: los aviones de floating fleet, al estar fuera de base durante periodos largos, tienden a generar más mantenimiento de terceros y de mayor coste `[HECHO VERIFICADO, mismo artículo]`.
- **Escala del operador como mitigante**: cuanto mayor es la flota, más margen tiene el operador para intercambiar aeronaves y absorber imprevistos — flotas pequeñas o medianas tienen mucho menos margen de error `[HECHO VERIFICADO, mismo artículo]`.
- **Modelos "risk-adjusted pricing" en floating fleets**: según documentación de un proveedor de software especializado en optimización de floating fleets, cuando se genera una cotización para un vuelo semanas o meses en el futuro, no hay garantía real de qué aeronave/tripulación estará disponible en el punto de origen ese día concreto — el precio que se cotiza es, en la práctica, una estimación ajustada por riesgo basada en disponibilidad histórica agregada por zona, no una confirmación de una aeronave concreta `[HECHO VERIFICADO — Charter and Go, documentación técnica del propio proveedor]`. Esto es, posiblemente, el hallazgo técnico más importante de toda esta sección: **una parte relevante de las cotizaciones de floating fleet que un broker recibe con semanas de antelación son, literalmente, apuestas estadísticas, no confirmaciones de una aeronave real.**
- **Calendarios desactualizados ("stale availability")**: `[HIPÓTESIS, consistente con el problema general de coordinación entre sistemas ya documentado en el Manual Cap. 1 y la Investigación 1.1, pero no verificada con una fuente específica que lo cuantifique]`.
- **"Soft holds" y opciones pendientes**: ya documentado en la Investigación 1.1 (función 24) — un operador puede tener la misma aeronave "en opción" para varios brokers simultáneamente hasta que uno de ellos confirma, lo que significa que la disponibilidad que ve un segundo broker puede desaparecer en cualquier momento sin aviso previo.

**Conclusión de esta sección** `[OPINIÓN/INTERPRETACIÓN construida directamente sobre los hechos anteriores]`: la brecha entre "aircraft is available" y "aircraft is actually bookable" no es un fallo de las plataformas — es una consecuencia estructural de que la disponibilidad depende de al menos cinco variables independientes (aprobación de propietario, tripulación, mantenimiento, posicionamiento, y prioridades comerciales del operador en ese momento) que ninguna plataforma puede observar completamente en tiempo real.

---

## H. ECONOMÍA Y PRICING DEL SUPPLY

Componentes del coste que recibe el broker, consistentes con las fuentes revisadas en ambas investigaciones: tiempo de vuelo, posicionamiento, mínimo de horas diarias, tripulación de pernocta, handling, tasas de aterrizaje, parking, catering, de-icing, permisos, impuestos, combustible, recargos de días pico, primas por aviso corto ("short-notice premiums"), economía específica del propietario (en aeronaves gestionadas), y economía de floating fleet.

**Por qué dos operadores pueden cotizar precios radicalmente distintos para la misma misión:**
- Modelo de negocio distinto (floating fleet vs. gestionado vs. propietario-operador): el floating fleet, al no requerir vuelo de posicionamiento de vuelta, puede cotizar un one-way al 40% extra del tiempo de vuelo en vez del 100% (ida y vuelta completa) — una diferencia de hasta el 60% frente al modelo tradicional `[HECHO VERIFICADO — Paramount Business Jets, con la cautela de que es una cifra de marketing de una fuente comercial, no un estudio independiente, y por tanto se marca también como [INFORMACIÓN NO VERIFICADA — cifra exacta]]`.
- Posición real de la aeronave en el momento de la solicitud (si ya está cerca del origen, no hay coste de posicionamiento que trasladar).
- Presión de utilización del operador en ese momento (un operador con aeronaves ociosas puede cotizar más agresivo que uno con la flota ya comprometida).
- Antigüedad y configuración de la aeronave concreta, que afecta a coste de mantenimiento y, por tanto, al margen que el operador necesita.
- `[HIPÓTESIS]` diferencias de estrategia comercial entre operadores (algunos compiten en precio, otros en servicio) que no se pueden generalizar como regla de industria.

---

## I. FRAMEWORK DESCRIPTIVO DE EVALUACIÓN Y VETTING DEL SUPPLY (descriptivo, no el framework de JETMI)

Esta sección amplía, del lado del supply, lo ya cubierto en la Investigación 1.1 (funciones 12 y 14) y en el Manual (Cap. 1):

- **Obligaciones legales mínimas**: certificado de operador vigente (AOC/Part 135 u homólogo), seguro de responsabilidad civil y casco vigente — `[VARIACIÓN POR JURISDICCIÓN]`.
- **Best practice de industria, no obligatoria**: verificación de rating ARGUS/Wyvern/IS-BAO — voluntarios y de pago, ya documentado extensamente en ambos documentos previos.
- **Requisitos que puede imponer el propio broker, por encima del mínimo legal**: antigüedad máxima de la aeronave, exigencia de un rating de seguridad concreto, verificación de historial de incidentes.
- **Fraude y contrapartes falsas**: reutiliza directamente los hallazgos de la Investigación 1.1 (sección G) — operadores fraudulentos que copian imágenes y textos de webs reales, presión de urgencia, redirección de pagos a cuentas personales. Añade un matiz nuevo relevante para supply: **una aeronave puede estar auditada bajo una entidad y ser subarrendada ("wet-leased") a un operador no auditado sin que el broker lo sepa si no pregunta explícitamente quién opera realmente ese tramo concreto** — ya señalado en la Investigación 1.1 (función 12) y que aquí se confirma como un problema específico del lado del supply, no solo de vetting general.
- **Riesgo de cadena de intermediarios (broker-to-broker)**: cuantos más brokers intermedien, menos transparencia hay sobre quién opera realmente el vuelo — mitigado parcialmente en EE.UU. por la obligación de disclosure de la Part 295, no mitigado en absoluto por defecto en jurisdicciones sin marco equivalente (ver Manual Cap. 1, sección 1.2).

---

## J. DINÁMICA BROKER–OPERADOR

**Quién tiene poder de negociación**: según una fuente de referencia neutral del sector (Business Jet Traveler), los brokers, como compradores de volumen, típicamente consiguen tarifas más bajas que un cliente individual negociando directamente con un operador — el margen del broker es, en un negocio de márgenes ya de por sí ajustados, relativamente bajo `[HECHO VERIFICADO — BJT online, "Operator or Broker"]`. Esto sugiere que **el poder de negociación del broker frente al operador aumenta con el volumen agregado que ese broker representa**, no con una operación puntual.

**Qué cambia con la confianza y el volumen** (reconstrucción a partir de fuentes comerciales de brokers describiendo su propia relación con operadores, tratadas con la cautela debida por ser fuentes con interés comercial):
- Prioridad de respuesta en momentos de alta demanda `[PRÁCTICA DE ALGUNAS EMPRESAS, consistente con el tono general pero no cuantificada]`.
- Mayor disposición del operador a ceder en precio o condiciones.
- Mayor tolerancia del operador ante negociaciones puntuales, siempre que no sea sistemático — una fuente advierte explícitamente que un broker que negocia precio de forma constante corre el riesgo de que el operador sienta que la relación "no vale la pena" `[HECHO VERIFICADO, cita parafraseada — Instacharter, tratada como opinión de un broker sobre el sector, no como estudio]`.

**Señales que generan confianza, frente a comportamientos que la destruyen** — esta es la sección con evidencia más concreta y citable de todo el documento, procedente de una fuente que documenta explícitamente lo que un broker establecido "tolera" o "no tolera" de sus operadores (y que, por simetría razonable, sugiere el tipo de comportamiento que un operador también valora o penaliza en un broker):
- **Comportamientos que destruyen la confianza, documentados con ejemplos concretos**: mala experiencia de cliente (usar un FBO de carga para clientes VIP), tripulación poco profesional, comunicación agresiva o con insultos al informar de un problema mecánico, negarse a firmar informes de seguridad o quejarse del coste de las auditorías ARGUS/Wyvern, alta frecuencia de averías mecánicas en aeronaves nuevas, y dificultar el uso de un crédito de un vuelo cancelado (p. ej., subir el precio de forma desproporcionada al ofrecer una aeronave de sustitución) `[HECHO VERIFICADO, cita directa — Paramount Business Jets]`.
- **Cómo se gestionan los errores y qué ocurre después de una incidencia**: `[HIPÓTESIS, consistente con el tono general pero sin un caso documentado específico]` — un enfoque orientado a soluciones en vez de a buscar culpables parece valorarse más que la corrección técnica del error en sí, según una fuente que lo describe como principio general.
- **Qué hace que un operador priorice a un broker**: confianza construida en el tiempo, comunicación clara sobre lo que se necesita, condiciones de pago justas y puntuales, y reconocimiento cuando el operador hace un esfuerzo adicional `[HECHO VERIFICADO parcialmente por la fuente de Instacharter, tratada como opinión comercial de un broker, no como estudio independiente]`.

---

## K. MAPA DEL CONOCIMIENTO TÁCITO SOBRE SUPPLY

Reutilizando el marco de la Investigación 1.1 y aplicándolo específicamente al supply:

| Qué se aprende | Clasificación | Evidencia |
|---|---|---|
| Quién responde rápido y quién no | Observable, histórico | `[HIPÓTESIS, consistente con toda la evidencia de ambas investigaciones, no medida directamente]` |
| Quién cotiza barato pero añade extras después | Observable, histórico | Conecta directamente con el problema de "información frecuentemente ausente" de la sección F |
| Quién es bueno en determinadas rutas | Relacional, histórico | `[HIPÓTESIS]` |
| Quién tiene aviones realmente flotantes (floating fleet genuino) frente a quién lo anuncia sin serlo del todo | Inferido, histórico | Conecta con la sección G sobre disponibilidad aparente |
| Quién suele necesitar aprobación del propietario, y por tanto tarda más en confirmar | Observable, histórico | `[HECHO VERIFICADO como fenómeno general — sección G]`, pero "quién en concreto" es conocimiento relacional no sistematizado |
| Quién resuelve problemas de forma proactiva (avisa antes de que sea tarde) frente a quién los oculta | Observable, histórico | ya documentado explícitamente en la Investigación 1.1 (función 32, cita de Adam Twidell/PrivateFly) `[HECHO VERIFICADO]` |
| Quién es flexible y quién cambia condiciones a última hora | Observable, histórico | `[HIPÓTESIS]` |
| Quién funciona bien para determinados perfiles de cliente VIP | Relacional, subjetivo | `[HIPÓTESIS]` |

**Conclusión de esta sección** `[OPINIÓN/INTERPRETACIÓN]`: este conocimiento tiene una propiedad estructural relevante para el diseño futuro de JETMI (aunque no se diseñe aquí): **es acumulativo y no transferible por defecto** — vive en la memoria de quien lo ha vivido, no en ningún sistema. Para un broker de una sola persona, esto significa que todo ese conocimiento se pierde si no se registra activamente, algo que en un brokerage con varias personas se compensa (parcialmente) porque distintas personas recuerdan distintas cosas.

---

## L. ESCENARIO ESPECÍFICO: BROKER NUEVO Y SOLO (fundadora, Europa, sin volumen todavía)

- **Qué puede hacer desde el primer día**: suscribirse a Avinode y/o CharterPad (no hay barrera de entrada tecnológica — cualquiera puede pagar la suscripción), enviar RFQs, y empezar a construir una lista de operadores de contacto directo.
- **Qué requiere reputación, no solo acceso**: obtener respuesta rápida y prioritaria, obtener mejores condiciones netas, acceder a oportunidades no publicadas (como comunicación directa de un empty leg antes de que se publique ampliamente), y superar procesos de onboarding formales de algunas plataformas (ver sección E, ejemplo Ankor/Calendars) que exigen documentación y revisión previa.
- **Qué plataformas puede usar desde ya**: Avinode, CharterPad — con la limitación real (no barrera de acceso, sino de resultado) de que las respuestas que reciba probablemente serán más lentas y menos favorables que las de un broker establecido, según se deduce de la evidencia de las secciones E y J.
- **Qué relaciones debe construir primero**: `[OPINIÓN/INTERPRETACIÓN razonada, no verificada con un caso documentado específico]` probablemente conviene priorizar un número reducido de operadores fiables en los tipos de aeronave/rutas donde se concentrará la demanda inicial, antes que intentar cubrir todo el mercado — esto es coherente con el patrón "contactar pocos y bien elegidos" ya documentado en la sección D, pero aplicado a la construcción inicial de la red, no solo a una RFQ puntual.
- **Volumen de relaciones manejable**: `[PREGUNTA ABIERTA]` no hay ninguna fuente que dé una cifra razonable de cuántas relaciones de operador puede sostener activamente una sola persona.
- **Tareas que más tiempo consumen al principio**: `[HIPÓTESIS]` probablemente la persecución de respuestas (ya documentada como "trabajo invisible" en la Investigación 1.1) se agrava especialmente cuando se es un broker desconocido, porque los operadores no tienen ningún incentivo de relación previa para priorizar la respuesta.
- **Dependencias personales peligrosas**: si toda la relación con cada operador vive únicamente en la memoria y los contactos personales de la fundadora (coherente con el hallazgo de la sección K), **la salida de esa persona —aunque sea temporal, por enfermedad o imposibilidad puntual— deja a JETMI sin acceso a su propio supply, no solo sin quien lo gestione**. Esto es una conexión directa con el dominio 6.2 del Mapa Maestro (business continuity, "bus factor 1").
- **Qué ocurre fuera de horario**: mismo problema estructural ya documentado en la Investigación 1.1 (Escenario D y E) — sin nadie más en la organización, cualquier necesidad de supply urgente fuera de horario depende enteramente de la disponibilidad personal de la fundadora.
- **Cómo cambia el problema al crecer**: `[HIPÓTESIS]` más volumen probablemente mejora la velocidad y calidad de respuesta de los operadores (coherente con la sección J), pero también multiplica el número de relaciones a mantener — sin que esta investigación pueda determinar en qué punto ese crecimiento deja de ser gestionable por una sola persona, incluso con apoyo de sistemas.

---

## M. CUELLOS DE BOTELLA Y RIESGOS

| Cuello de botella / riesgo | Frecuencia | Impacto | Evidencia |
|---|---|---|---|
| Brecha entre disponibilidad aparente y confirmable | Alta, estructural | Alto | `[HECHO VERIFICADO — sección G]` |
| Broker nuevo con respuesta lenta/desfavorable de operadores | Alta al principio, decreciente con el tiempo | Alto en la fase inicial | `[HECHO VERIFICADO indirectamente — secciones E y J]` |
| Riesgo de cadena de intermediarios (broker-to-broker) sin transparencia | Media | Medio-alto | `[HECHO VERIFICADO — sección C.3 e I]` |
| Fraude de contraparte (operador falso, wet-lease no declarado) | Baja pero documentada con casos reales | Muy alto | `[HECHO VERIFICADO — Investigación 1.1, sección G, y sección I de este documento]` |
| Dependencia total de la memoria/relaciones personales de una sola persona | Alta, estructural para el escenario JETMI | Alto | `[OPINIÓN/INTERPRETACIÓN construida sobre la sección K y L]` |
| Cotizaciones de floating fleet a largas fechas como "apuestas estadísticas" no confirmadas | Media-alta para reservas con semanas/meses de antelación | Medio-alto | `[HECHO VERIFICADO — sección G, Charter and Go]` |
| Aprobación de propietario como cuello de botella en aeronaves gestionadas | Alta para ese segmento de flota | Medio | `[HECHO VERIFICADO — sección G, Clay Lacy]` |

---

## N. PREGUNTAS ABIERTAS

1. `[PREGUNTA ABIERTA — crítica]` ¿Cuánto tiempo o volumen concreto se necesita para pasar de "broker desconocido" a "broker con prioridad de respuesta" ante un operador dado?
2. `[PREGUNTA ABIERTA]` ¿Existen contratos marco estándar entre brokers nuevos y operadores, o cada relación se construye completamente ad hoc?
3. `[PREGUNTA ABIERTA]` ¿Qué proporción real del supply que un broker termina utilizando proviene de redes informales (WhatsApp, contactos personales) frente a plataformas formales?
4. `[PREGUNTA ABIERTA]` ¿Cuántas relaciones de operador puede sostener activamente y con calidad una sola persona, de forma realista?
5. `[PREGUNTA ABIERTA]` ¿Qué señales concretas usa un operador para decidir, en la práctica, si un broker nuevo "envía RFQs con intención real de comprar" frente a "solo está mirando precios"?
6. `[PREGUNTA ABIERTA]` ¿Cómo se recupera, en la práctica, una relación broker-operador deteriorada tras un error o una mala experiencia?
7. `[PREGUNTA ABIERTA]` ¿Qué parte de la disponibilidad "stale" (calendarios desactualizados) es un problema real medible, frente a una hipótesis razonable sin datos que la respalden?

---

## O. IMPLICACIONES PRELIMINARES PARA "UNA PERSONA + SISTEMAS/IA" (solo observaciones, no diseño)

| Naturaleza del trabajo | Elementos de esta investigación que encajan aquí |
|---|---|
| Repetitivo/determinista | Envío de RFQs estructuradas, normalización básica de formato de respuestas cuando la información está completa |
| Preparación/análisis | Comparación de cotizaciones, verificación de certificados/ratings de seguridad, cálculo de qué incluye/excluye un precio |
| Juicio | A quién contactar primero, cuándo confiar en una disponibilidad "aparente", cuándo insistir con un operador que no responde, cuándo aceptar el riesgo de una cotización de floating fleet a largo plazo |
| Relacional | Construcción de confianza inicial con un operador nuevo, gestión de la relación tras un error, negociación de condiciones |
| Alta responsabilidad | Verificación de que un operador es quien dice ser (fraude), confirmación final de que una aeronave es realmente "bookable" y no solo "aparentemente disponible" |
| Urgente/tiempo real | Búsqueda de backup cuando una opción cae, seguimiento de RFQs bajo presión de fecha |

**Observación transversal, no de diseño** `[OPINIÓN/INTERPRETACIÓN]`: a diferencia de la Investigación 1.1, donde varias funciones de "alta responsabilidad" eran también las más urgentes, aquí el patrón más repetido es que el trabajo de mayor valor (sección E, construcción de red desde cero; sección K, conocimiento tácito) es simultáneamente **relacional y acumulativo en el tiempo** — no es delegable de la misma forma que una tarea determinista, porque su output no es un dato sino una relación de confianza que solo existe entre dos personas concretas.

---

## P. CONTRADICCIONES O MATICES respecto a los documentos anteriores

1. **Corrección, no contradicción**: el prompt de esta investigación agrupaba a Victor y FlyVictor junto a plataformas de sourcing como Avinode o CharterPad. La verificación directa (sección C.2) muestra que **son brokers retail competidores, no herramientas de acceso a supply para terceros** — esto no contradice ningún documento anterior (no se habían mencionado antes), pero conviene dejarlo corregido para no arrastrar la confusión a futuras investigaciones.
2. **Matiz que amplía, sin contradecir, al Manual (Cap. 1) y a la Investigación 1.1**: ambos documentos ya establecían que la disponibilidad de ARGUS/Wyvern es voluntaria y de pago. Esta investigación añade un matiz operativo concreto: una aeronave puede estar formalmente auditada y, aun así, ser subarrendada a un operador no auditado en un vuelo concreto (wet-lease no declarado) — esto refuerza, no contradice, la recomendación ya hecha en la Investigación 1.1 de verificar "quién opera realmente ese tramo", no solo la reputación general de la empresa que aparece en el contrato.
3. **Sin contradicciones factuales** entre esta investigación y los tres documentos anteriores en los datos ya compartidos (Avinode, Part 295, ARGUS/Wyvern/IS-BAO, modelo de negocio general del broker).

---

## Fuentes consultadas

**Prensa sectorial con paneles de profesionales reales (nombres y cargos citados):** Private Jet Card Comparisons — "There's no easy button for private jet charter operators, brokers" (con citas de Churakos, Odetra, y Carter de Clay Lacy Aviation).

**Asociaciones y organismos:** NBAA ("DOT Confirms Charter Broker Disclosure Timing Requirements"; página de Aircraft Charter).

**Documentación técnica directa de plataformas:** Leon Software (integraciones, incluyendo SchedAero y SkyAccess), Schedaero.com, Aviatize.com (comparativa 2026 de software de programación de vuelos de negocios), Charter and Go (documentación técnica sobre optimización de floating fleets), Ankor Help Center (proceso de onboarding de brokers en "Calendars").

**Verificación directa de plataformas mencionadas en el prompt original:** flyvictor.com, Crunchbase (perfil de Victor), Trustpilot (reseñas de Victor) — usadas para corregir la clasificación de Victor/FlyVictor como broker retail, no como herramienta de sourcing.

**Fuentes comerciales usadas con cautela explícita:** Paramount Business Jets ("What Private Jet Brokers Really Want (and Don't Want) from Operators"; guía de verificación de brokers), Instacharter.app (consejos sobre relación broker-operador), Stratos Jets, Icarus Jet, Business Jet Traveler ("Operator or Broker"), Air Charter Journal, Schubach Aviation, Amalfi Jets, New Flight Charters, Off The Ground Marketing.

**Reutilizadas de investigaciones anteriores (Manual Cap. 1 e Investigación 1.1):** eCFR 14 CFR Part 295, documentación de Avinode/FL3XX, Jetvice.net, Business Air News (testimonios de brokers en activo), EBAA/ACA (fraude).
